export type KeystoreType = 'JKS' | 'JCEKS' | 'PKCS12';
export type EntryType = 'PrivateKey' | 'TrustedCertificate' | 'SecretKey';
export type ValidityStatus = 'valid' | 'expiring_soon' | 'expired' | 'not_yet_valid';

export interface ParsedCertificate {
  rawDer: Uint8Array;
  pem: string;
  subject: string;
  subjectAttributes: Record<string, string>;
  commonName: string;
  issuer: string;
  issuerAttributes: Record<string, string>;
  issuerCommonName: string;
  serialNumberHex: string;
  serialNumberDec: string;
  notBefore: Date;
  notAfter: Date;
  validityStatus: ValidityStatus;
  daysRemaining: number;
  publicKey: {
    algorithm: string;
    bitLength?: number;
    curve?: string;
    exponent?: number;
  };
  signatureAlgorithm: string;
  fingerprints: {
    sha256: string;
    sha1: string;
    md5: string;
  };
  isCA: boolean;
  maxPathLength?: number;
  keyUsage: string[];
  extendedKeyUsage: string[];
  sans: { type: string; value: string }[];
  authorityKeyId?: string;
  subjectKeyId?: string;
  crlDistributionPoints?: string[];
  ocspUrls?: string[];
  extensions: {
    name: string;
    oid: string;
    critical: boolean;
    value: string;
  }[];
}

export interface KeystoreEntry {
  alias: string;
  type: EntryType;
  creationDate: Date;
  chain: ParsedCertificate[];
  hasPrivateKey: boolean;
  privateKeyEncrypted?: boolean;
}

export interface ParsedKeystore {
  type: KeystoreType;
  version: number;
  entryCount: number;
  entries: KeystoreEntry[];
  integrityVerified: boolean | null;
  fileSize: number;
  fileName: string;
  needsPassword?: boolean;
}
