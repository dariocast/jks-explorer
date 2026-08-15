import { ParsedKeystore, KeystoreEntry, KeystoreType, ParsedCertificate } from '../types/keystore';
import { parseCertificate } from './cert-analyzer';

const JKS_MAGIC = 0xfeedfeed;
const JCEKS_MAGIC = 0xcececece;
const JKS_WHITEN_STRING = 'Mighty Aphrodite';

class BufferReader {
  private view: DataView;
  private offset: number = 0;
  private bytes: Uint8Array;

  constructor(buffer: ArrayBuffer | Uint8Array) {
    if (buffer instanceof Uint8Array) {
      this.bytes = buffer;
      this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    } else {
      this.bytes = new Uint8Array(buffer);
      this.view = new DataView(buffer);
    }
  }

  get currentOffset(): number {
    return this.offset;
  }

  get remaining(): number {
    return this.bytes.byteLength - this.offset;
  }

  readUint8(): number {
    if (this.offset + 1 > this.bytes.byteLength) {
      throw new Error('Unexpected end of file while reading uint8');
    }
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }

  readUint16(): number {
    if (this.offset + 2 > this.bytes.byteLength) {
      throw new Error('Unexpected end of file while reading uint16');
    }
    const val = this.view.getUint16(this.offset, false); // big-endian
    this.offset += 2;
    return val;
  }

  readUint32(): number {
    if (this.offset + 4 > this.bytes.byteLength) {
      throw new Error('Unexpected end of file while reading uint32');
    }
    const val = this.view.getUint32(this.offset, false); // big-endian
    this.offset += 4;
    return val;
  }

  readUint64(): number {
    if (this.offset + 8 > this.bytes.byteLength) {
      throw new Error('Unexpected end of file while reading uint64');
    }
    const high = this.view.getUint32(this.offset, false);
    const low = this.view.getUint32(this.offset + 4, false);
    this.offset += 8;
    return high * 4294967296 + low;
  }

  readBytes(length: number): Uint8Array {
    if (this.offset + length > this.bytes.byteLength) {
      throw new Error(`Unexpected end of file while reading ${length} bytes`);
    }
    const slice = this.bytes.slice(this.offset, this.offset + length);
    this.offset += length;
    return slice;
  }

  readUTF(): string {
    const len = this.readUint16();
    const bytes = this.readBytes(len);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  }
}

/**
 * Verifies SHA-1 integrity check of JKS file with the provided password
 */
async function verifyJksIntegrity(
  fileBytes: Uint8Array,
  password?: string
): Promise<boolean | null> {
  if (!password) {
    return null;
  }
  if (fileBytes.byteLength < 20) {
    return false;
  }

  const keystoreData = fileBytes.subarray(0, fileBytes.byteLength - 20);
  const actualDigest = fileBytes.subarray(fileBytes.byteLength - 20);

  // Password as UTF-16BE (2 bytes per character)
  const pwdBytes = new Uint8Array(password.length * 2);
  for (let i = 0; i < password.length; i++) {
    const code = password.charCodeAt(i);
    pwdBytes[i * 2] = (code >> 8) & 0xff;
    pwdBytes[i * 2 + 1] = code & 0xff;
  }

  // Whiten string UTF-8 bytes: "Mighty Aphrodite"
  const encoder = new TextEncoder();
  const whitenBytes = encoder.encode(JKS_WHITEN_STRING);

  // Concatenate pwdBytes + whitenBytes + keystoreData
  const combined = new Uint8Array(pwdBytes.length + whitenBytes.length + keystoreData.length);
  combined.set(pwdBytes, 0);
  combined.set(whitenBytes, pwdBytes.length);
  combined.set(keystoreData, pwdBytes.length + whitenBytes.length);

  // Compute SHA-1
  const hashBuffer = await crypto.subtle.digest('SHA-1', combined);
  const expectedDigest = new Uint8Array(hashBuffer);

  if (expectedDigest.length !== actualDigest.length) {
    return false;
  }

  for (let i = 0; i < expectedDigest.length; i++) {
    if (expectedDigest[i] !== actualDigest[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if the file header matches JKS or JCEKS magic bytes
 */
export function isJksFile(buffer: ArrayBuffer | Uint8Array): boolean {
  try {
    const view = new DataView(buffer instanceof Uint8Array ? buffer.buffer : buffer, buffer instanceof Uint8Array ? buffer.byteOffset : 0);
    if (view.byteLength < 4) return false;
    const magic = view.getUint32(0, false);
    return magic === JKS_MAGIC || magic === JCEKS_MAGIC;
  } catch {
    return false;
  }
}

/**
 * Parses a JKS or JCEKS binary keystore file
 */
export async function parseJks(
  buffer: ArrayBuffer | Uint8Array,
  fileName: string,
  password?: string
): Promise<ParsedKeystore> {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const reader = new BufferReader(bytes);

  const magic = reader.readUint32();
  let type: KeystoreType = 'JKS';
  if (magic === JKS_MAGIC) {
    type = 'JKS';
  } else if (magic === JCEKS_MAGIC) {
    type = 'JCEKS';
  } else {
    throw new Error(`Invalid KeyStore magic: 0x${magic.toString(16).padStart(8, '0')}. Expected 0xfeedfeed or 0xcececece.`);
  }

  const version = reader.readUint32();
  const entryCount = reader.readUint32();

  const entries: KeystoreEntry[] = [];

  for (let i = 0; i < entryCount; i++) {
    const tag = reader.readUint32();
    const alias = reader.readUTF();
    const timestampMs = reader.readUint64();
    const creationDate = new Date(timestampMs);

    if (tag === 1) {
      // PrivateKeyEntry
      const keyLen = reader.readUint32();
      reader.readBytes(keyLen); // encrypted private key payload

      const chainLen = reader.readUint32();
      const chain: ParsedCertificate[] = [];

      for (let c = 0; c < chainLen; c++) {
        reader.readUTF(); // e.g. "X.509"
        const certLen = reader.readUint32();
        const certDer = reader.readBytes(certLen);

        const parsedCert = await parseCertificate(certDer);
        chain.push(parsedCert);
      }

      entries.push({
        alias,
        type: 'PrivateKey',
        creationDate,
        chain,
        hasPrivateKey: true,
        privateKeyEncrypted: true,
      });
    } else if (tag === 2) {
      // TrustedCertEntry
      reader.readUTF(); // e.g. "X.509"
      const certLen = reader.readUint32();
      const certDer = reader.readBytes(certLen);

      const parsedCert = await parseCertificate(certDer);

      entries.push({
        alias,
        type: 'TrustedCertificate',
        creationDate,
        chain: [parsedCert],
        hasPrivateKey: false,
      });
    } else if (tag === 3) {
      // SecretKeyEntry (JCEKS)
      const keyLen = reader.readUint32();
      reader.readBytes(keyLen);

      entries.push({
        alias,
        type: 'SecretKey',
        creationDate,
        chain: [],
        hasPrivateKey: false,
      });
    } else {
      throw new Error(`Unknown entry tag: ${tag} at entry ${i} (alias: "${alias}")`);
    }
  }

  // Integrity Check
  const integrityVerified = await verifyJksIntegrity(bytes, password);

  return {
    type,
    version,
    entryCount: entries.length,
    entries,
    integrityVerified,
    fileSize: bytes.byteLength,
    fileName,
  };
}
