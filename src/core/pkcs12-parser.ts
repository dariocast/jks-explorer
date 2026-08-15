import forge from 'node-forge';
import { ParsedKeystore, KeystoreEntry, ParsedCertificate } from '../types/keystore';
import { parseCertificate } from './cert-analyzer';

/**
 * Checks if the buffer starts with PKCS#12 (ASN.1 SEQUENCE with PKCS#7 / P12 OID)
 */
export function isPkcs12File(buffer: ArrayBuffer | Uint8Array): boolean {
  try {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    // PKCS#12 is an ASN.1 Sequence (0x30)
    if (bytes.length < 4 || bytes[0] !== 0x30) return false;
    
    // Quick ASN.1 test
    const raw = forge.util.binary.raw.encode(bytes);
    const asn1 = forge.asn1.fromDer(raw);
    return asn1.tagClass === forge.asn1.Class.UNIVERSAL && asn1.type === forge.asn1.Type.SEQUENCE;
  } catch {
    return false;
  }
}

/**
 * Parses a PKCS#12 (.p12 / .pfx) keystore file
 */
export async function parsePkcs12(
  buffer: ArrayBuffer | Uint8Array,
  fileName: string,
  password: string = ''
): Promise<ParsedKeystore> {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const rawStr = forge.util.binary.raw.encode(bytes);
  
  let p12Asn1: forge.asn1.Asn1;
  try {
    p12Asn1 = forge.asn1.fromDer(rawStr);
  } catch (err: any) {
    throw new Error(`Failed to parse ASN.1 structure: ${err.message || err}`);
  }

  let p12: forge.pkcs12.Pkcs12Pfx;
  let integrityVerified: boolean | null = null;

  try {
    p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
    integrityVerified = true;
  } catch (err: any) {
    if (password === '') {
      // Try with strict false
      try {
        p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, '');
        integrityVerified = true;
      } catch {
        throw new Error('Password required to decrypt this PKCS#12 keystore.');
      }
    } else {
      throw new Error(`Invalid password for PKCS#12 keystore: ${err.message || err}`);
    }
  }

  const entriesMap = new Map<string, {
    alias: string;
    hasKey: boolean;
    certs: ParsedCertificate[];
  }>();

  // Extract bags
  for (const safeContent of p12.safeContents) {
    for (const bag of safeContent.safeBags) {
      let alias = 'entry';
      if (bag.attributes?.friendlyName && bag.attributes.friendlyName.length > 0) {
        alias = bag.attributes.friendlyName[0];
      } else if (bag.attributes?.localKeyId && bag.attributes.localKeyId.length > 0) {
        alias = `key-${bag.attributes.localKeyId[0]}`;
      }

      if (!entriesMap.has(alias)) {
        entriesMap.set(alias, {
          alias,
          hasKey: false,
          certs: [],
        });
      }

      const item = entriesMap.get(alias)!;

      if (bag.key) {
        item.hasKey = true;
      }

      if (bag.cert) {
        const certAsn1 = forge.pki.certificateToAsn1(bag.cert);
        const certDerStr = forge.asn1.toDer(certAsn1).getBytes();
        const certDer = new Uint8Array(forge.util.binary.raw.decode(certDerStr));
        const parsedCert = await parseCertificate(certDer);
        
        // Avoid duplicate certs under same alias
        if (!item.certs.some((c) => c.serialNumberHex === parsedCert.serialNumberHex)) {
          item.certs.push(parsedCert);
        }
      }
    }
  }

  // Also collect any certificates from cert bags not associated with keys
  for (const bag of p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || []) {
    if (bag.cert) {
      let alias = 'cert';
      if (bag.attributes?.friendlyName && bag.attributes.friendlyName.length > 0) {
        alias = bag.attributes.friendlyName[0];
      }
      
      const certAsn1 = forge.pki.certificateToAsn1(bag.cert);
      const certDerStr = forge.asn1.toDer(certAsn1).getBytes();
      const certDer = new Uint8Array(forge.util.binary.raw.decode(certDerStr));
      const parsedCert = await parseCertificate(certDer);

      if (!entriesMap.has(alias)) {
        entriesMap.set(alias, {
          alias,
          hasKey: false,
          certs: [parsedCert],
        });
      } else {
        const existing = entriesMap.get(alias)!;
        if (!existing.certs.some((c) => c.serialNumberHex === parsedCert.serialNumberHex)) {
          existing.certs.push(parsedCert);
        }
      }
    }
  }

  const entries: KeystoreEntry[] = Array.from(entriesMap.values()).map((e) => ({
    alias: e.alias,
    type: e.hasKey ? 'PrivateKey' : 'TrustedCertificate',
    creationDate: new Date(),
    chain: e.certs,
    hasPrivateKey: e.hasKey,
    privateKeyEncrypted: true,
  }));

  return {
    type: 'PKCS12',
    version: 3,
    entryCount: entries.length,
    entries,
    integrityVerified,
    fileSize: bytes.byteLength,
    fileName,
  };
}
