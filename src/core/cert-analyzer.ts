import * as x509 from '@peculiar/x509';
import forge from 'node-forge';
import { ParsedCertificate, ValidityStatus } from '../types/keystore';

/**
 * Converts a byte array or ArrayBuffer into a hex string with colon separators
 */
export function formatHex(buffer: ArrayBuffer | Uint8Array, separator: string = ':'): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(separator);
}

/**
 * Formats a BigInt or hex serial number into human readable hex with colons and decimal
 */
export function formatSerialNumber(serialHex: string): { hex: string; dec: string } {
  const cleanHex = serialHex.replace(/[^0-9a-fA-F]/g, '');
  if (!cleanHex) {
    return { hex: '00', dec: '0' };
  }
  const chunks = cleanHex.match(/.{1,2}/g) || [cleanHex];
  const formattedHex = chunks.join(':').toUpperCase();
  
  let dec = '';
  try {
    dec = BigInt('0x' + cleanHex).toString(10);
  } catch {
    dec = 'N/A';
  }
  
  return { hex: formattedHex, dec };
}

/**
 * Calculates validity status and remaining days
 */
export function computeValidity(notBefore: Date, notAfter: Date): { status: ValidityStatus; daysRemaining: number } {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffTime = notAfter.getTime() - now.getTime();
  const daysRemaining = Math.floor(diffTime / msPerDay);

  if (now < notBefore) {
    return { status: 'not_yet_valid', daysRemaining };
  }
  if (now > notAfter) {
    return { status: 'expired', daysRemaining };
  }
  if (daysRemaining <= 30) {
    return { status: 'expiring_soon', daysRemaining };
  }
  return { status: 'valid', daysRemaining };
}

/**
 * Parses RDN attributes from a DN string or x509 Name
 */
export function parseDNAttributes(dn: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (!dn) return attrs;

  // Split on commas not enclosed in quotes
  const regex = /(?:^|,\s*)([a-zA-Z0-9.]+)=("(?:[^"\\]|\\.)*"|[^,]*)/g;
  let match;
  while ((match = regex.exec(dn)) !== null) {
    const key = match[1].toUpperCase();
    let val = match[2];
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    attrs[key] = val;
  }
  return attrs;
}

/**
 * Parses DER-encoded X.509 Certificate into rich structured data
 */
export async function parseCertificate(derBytes: Uint8Array): Promise<ParsedCertificate> {
  const arrayBuffer = derBytes.buffer.slice(
    derBytes.byteOffset,
    derBytes.byteOffset + derBytes.byteLength
  ) as ArrayBuffer;

  // 1. Peculiar X509 parser
  const cert = new x509.X509Certificate(arrayBuffer);
  
  const notBefore = cert.notBefore;
  const notAfter = cert.notAfter;
  const { status: validityStatus, daysRemaining } = computeValidity(notBefore, notAfter);

  const subjectStr = cert.subject;
  const issuerStr = cert.issuer;
  const subjectAttrs = parseDNAttributes(subjectStr);
  const issuerAttrs = parseDNAttributes(issuerStr);

  const commonName = subjectAttrs['CN'] || subjectStr || 'Unknown Subject';
  const issuerCommonName = issuerAttrs['CN'] || issuerStr || 'Unknown Issuer';

  // Serial Number
  const serialNumberInfo = formatSerialNumber(cert.serialNumber);

  // Fingerprints
  let sha256Thumb = '';
  let sha1Thumb = '';
  try {
    const sha256Buf = await cert.getThumbprint('SHA-256');
    sha256Thumb = formatHex(sha256Buf);
    const sha1Buf = await cert.getThumbprint('SHA-1');
    sha1Thumb = formatHex(sha1Buf);
  } catch {
    // fallback with forge
    const forgeCert = forge.pki.certificateFromAsn1(
      forge.asn1.fromDer(forge.util.createBuffer(derBytes as unknown as string).getBytes())
    );
    const sha256Md = forge.md.sha256.create();
    sha256Md.update(forge.asn1.toDer(forge.pki.certificateToAsn1(forgeCert)).getBytes());
    sha256Thumb = formatHex(new Uint8Array(forge.util.binary.raw.decode(sha256Md.digest().getBytes())));
    
    const sha1Md = forge.md.sha1.create();
    sha1Md.update(forge.asn1.toDer(forge.pki.certificateToAsn1(forgeCert)).getBytes());
    sha1Thumb = formatHex(new Uint8Array(forge.util.binary.raw.decode(sha1Md.digest().getBytes())));
  }

  // MD5 Fingerprint
  const md5Md = forge.md.md5.create();
  md5Md.update(forge.util.binary.raw.encode(derBytes));
  const md5Thumb = formatHex(new Uint8Array(forge.util.binary.raw.decode(md5Md.digest().getBytes())));

  // Public Key Information
  let algorithm = cert.publicKey.algorithm?.name || 'Unknown';
  let bitLength: number | undefined = undefined;
  let curve: string | undefined = undefined;
  let exponent: number | undefined = undefined;

  try {
    const keyInfo = cert.publicKey;
    const algoObj = keyInfo.algorithm as any;
    if (algoObj) {
      if (algoObj.name) algorithm = algoObj.name;
      if (algoObj.namedCurve) curve = algoObj.namedCurve;
      if (algoObj.modulusLength) bitLength = algoObj.modulusLength;
      if (algoObj.publicExponent) {
        const expBytes = algoObj.publicExponent as Uint8Array;
        let exp = 0;
        for (const b of expBytes) exp = (exp << 8) | b;
        exponent = exp;
      }
    }
  } catch {
    // ignore
  }

  // Extensions
  let isCA = false;
  let maxPathLength: number | undefined = undefined;
  const keyUsage: string[] = [];
  const extendedKeyUsage: string[] = [];
  const sans: { type: string; value: string }[] = [];
  let authorityKeyId: string | undefined = undefined;
  let subjectKeyId: string | undefined = undefined;
  const crlDistributionPoints: string[] = [];
  const ocspUrls: string[] = [];
  const extensionsList: { name: string; oid: string; critical: boolean; value: string }[] = [];

  for (const ext of cert.extensions) {
    const extOid = ext.type;
    const isCritical = ext.critical;
    let extName = ext.type;
    let extValue = '';

    // Basic Constraints (2.5.29.19)
    if (ext instanceof x509.BasicConstraintsExtension || extOid === '2.5.29.19' || extOid === 'id-ce-basicConstraints') {
      extName = 'Basic Constraints';
      const bc = ext as any;
      isCA = Boolean(bc.ca);
      maxPathLength = bc.pathLength !== undefined ? bc.pathLength : bc.pathLengthConstraint;
      extValue = `Is CA: ${isCA ? 'Yes' : 'No'}${maxPathLength !== undefined ? `, Path Length: ${maxPathLength}` : ''}`;
    }
    // Key Usage (2.5.29.15)
    else if (ext instanceof x509.KeyUsagesExtension || extOid === '2.5.29.15') {
      extName = 'Key Usage';
      const ku = ext as x509.KeyUsagesExtension;
      const flags: string[] = [];
      const kuFlags: [number, string][] = [
        [x509.KeyUsageFlags.digitalSignature, 'Digital Signature'],
        [x509.KeyUsageFlags.nonRepudiation, 'Non Repudiation / Content Commitment'],
        [x509.KeyUsageFlags.keyEncipherment, 'Key Encipherment'],
        [x509.KeyUsageFlags.dataEncipherment, 'Data Encipherment'],
        [x509.KeyUsageFlags.keyAgreement, 'Key Agreement'],
        [x509.KeyUsageFlags.keyCertSign, 'Certificate Signing'],
        [x509.KeyUsageFlags.cRLSign, 'CRL Signing'],
        [x509.KeyUsageFlags.encipherOnly, 'Encipher Only'],
        [x509.KeyUsageFlags.decipherOnly, 'Decipher Only'],
      ];
      for (const [flag, label] of kuFlags) {
        if ((ku.usages & flag) !== 0) {
          flags.push(label);
          keyUsage.push(label);
        }
      }
      extValue = flags.join(', ');
    }
    // Extended Key Usage (2.5.29.37)
    else if (ext instanceof x509.ExtendedKeyUsageExtension || extOid === '2.5.29.37') {
      extName = 'Extended Key Usage';
      const eku = ext as any;
      const ekuMap: Record<string, string> = {
        '1.3.6.1.5.5.7.3.1': 'Server Authentication (TLS Web Server)',
        '1.3.6.1.5.5.7.3.2': 'Client Authentication (TLS Web Client)',
        '1.3.6.1.5.5.7.3.3': 'Code Signing',
        '1.3.6.1.5.5.7.3.4': 'Email Protection (S/MIME)',
        '1.3.6.1.5.5.7.3.8': 'Time Stamping',
        '1.3.6.1.5.5.7.3.9': 'OCSP Signing',
        '1.3.6.1.4.1.311.10.3.3': 'Microsoft Server Gated Crypto',
        '2.16.840.1.113730.4.1': 'Netscape Server Gated Crypto',
      };
      const usages: string[] = Array.isArray(eku.usages) ? eku.usages : (eku.usages?.items || []);
      for (const usage of usages) {
        const usageStr = String(usage);
        const desc = ekuMap[usageStr] || usageStr;
        extendedKeyUsage.push(desc);
      }
      extValue = extendedKeyUsage.join(', ');
    }
    // Subject Alternative Name (2.5.29.17)
    else if (ext instanceof x509.SubjectAlternativeNameExtension || extOid === '2.5.29.17') {
      extName = 'Subject Alternative Name (SAN)';
      const sanExt = ext as any;
      const sanItems: string[] = [];
      const namesList = Array.isArray(sanExt.names)
        ? sanExt.names
        : Array.isArray(sanExt.names?.items)
        ? sanExt.names.items
        : sanExt.names?.items || [];
      
      for (const name of namesList) {
        const typeStr = name.type === 'dns' ? 'DNS' : name.type === 'ip' ? 'IP' : name.type === 'email' ? 'Email' : name.type === 'uri' ? 'URI' : String(name.type || 'DNS');
        const valStr = String(name.value || name.name || '');
        if (valStr) {
          sans.push({ type: typeStr, value: valStr });
          sanItems.push(`${typeStr}:${valStr}`);
        }
      }
      extValue = sanItems.join(', ');
    }
    // Authority Key Identifier (2.5.29.35)
    else if (ext instanceof x509.AuthorityKeyIdentifierExtension || extOid === '2.5.29.35') {
      extName = 'Authority Key Identifier (AKID)';
      const akidExt = ext as x509.AuthorityKeyIdentifierExtension;
      if (akidExt.keyId) {
        authorityKeyId = akidExt.keyId;
        extValue = `KeyID: ${akidExt.keyId}`;
      }
    }
    // Subject Key Identifier (2.5.29.14)
    else if (ext instanceof x509.SubjectKeyIdentifierExtension || extOid === '2.5.29.14') {
      extName = 'Subject Key Identifier (SKID)';
      const skidExt = ext as x509.SubjectKeyIdentifierExtension;
      if (skidExt.keyId) {
        subjectKeyId = skidExt.keyId;
        extValue = `KeyID: ${skidExt.keyId}`;
      }
    }
    // Authority Information Access (1.3.6.1.5.5.7.1.1)
    else if (ext instanceof x509.AuthorityInfoAccessExtension || extOid === '1.3.6.1.5.5.7.1.1') {
      extName = 'Authority Information Access (AIA)';
      const aiaExt = ext as any;
      const ocsps = Array.isArray(aiaExt.ocsp) ? aiaExt.ocsp : (aiaExt.ocsp?.items || []);
      const caIssuers = Array.isArray(aiaExt.caIssuers) ? aiaExt.caIssuers : (aiaExt.caIssuers?.items || []);
      if (ocsps.length > 0) ocspUrls.push(...ocsps);
      extValue = [
        ...ocsps.map((u: any) => `OCSP: ${u}`),
        ...caIssuers.map((u: any) => `CA Issuer: ${u}`),
      ].join(', ');
    }
    // CRL Distribution Points (2.5.29.31)
    else if (ext instanceof x509.CRLDistributionPointsExtension || extOid === '2.5.29.31') {
      extName = 'CRL Distribution Points';
      const crlExt = ext as any;
      const points = Array.isArray(crlExt.distributionPoints)
        ? crlExt.distributionPoints
        : (crlExt.distributionPoints?.items || []);
      for (const p of points) {
        const fullNames = Array.isArray(p.fullName) ? p.fullName : (p.fullName?.items || []);
        for (const fullName of fullNames) {
          if (fullName.value) {
            crlDistributionPoints.push(fullName.value);
          }
        }
      }
      extValue = crlDistributionPoints.join(', ');
    } else {
      extName = getOidFriendlyName(extOid);
      extValue = `Extension length: ${ext.rawData.byteLength} bytes`;
    }

    extensionsList.push({
      name: extName,
      oid: extOid,
      critical: isCritical,
      value: extValue || 'Present',
    });
  }

  const pem = cert.toString('pem');

  return {
    rawDer: derBytes,
    pem,
    subject: subjectStr,
    subjectAttributes: subjectAttrs,
    commonName,
    issuer: issuerStr,
    issuerAttributes: issuerAttrs,
    issuerCommonName,
    serialNumberHex: serialNumberInfo.hex,
    serialNumberDec: serialNumberInfo.dec,
    notBefore,
    notAfter,
    validityStatus,
    daysRemaining,
    publicKey: {
      algorithm,
      bitLength,
      curve,
      exponent,
    },
    signatureAlgorithm: cert.signatureAlgorithm.name || 'Unknown',
    fingerprints: {
      sha256: sha256Thumb,
      sha1: sha1Thumb,
      md5: md5Thumb,
    },
    isCA,
    maxPathLength,
    keyUsage,
    extendedKeyUsage,
    sans,
    authorityKeyId,
    subjectKeyId,
    crlDistributionPoints,
    ocspUrls,
    extensions: extensionsList,
  };
}

function getOidFriendlyName(oid: string): string {
  const oids: Record<string, string> = {
    '2.5.29.19': 'Basic Constraints',
    '2.5.29.15': 'Key Usage',
    '2.5.29.37': 'Extended Key Usage',
    '2.5.29.17': 'Subject Alternative Name',
    '2.5.29.35': 'Authority Key Identifier',
    '2.5.29.14': 'Subject Key Identifier',
    '2.5.29.31': 'CRL Distribution Points',
    '1.3.6.1.5.5.7.1.1': 'Authority Info Access',
    '2.5.29.32': 'Certificate Policies',
    '2.5.29.9': 'Subject Directory Attributes',
    '2.5.29.30': 'Name Constraints',
    '2.5.29.36': 'Policy Constraints',
    '2.5.29.54': 'Inhibit Any-Policy',
    '1.3.6.1.4.1.11129.2.4.2': 'Signed Certificate Timestamp (SCT)',
  };
  return oids[oid] || `OID ${oid}`;
}
