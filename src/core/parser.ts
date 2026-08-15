import { ParsedKeystore } from '../types/keystore';
import { isJksFile, parseJks } from './jks-parser';
import { isPkcs12File, parsePkcs12 } from './pkcs12-parser';

export interface ParseOptions {
  fileName: string;
  password?: string;
}

/**
 * Automatically inspects file format and parses keystore
 */
export async function parseKeystoreFile(
  buffer: ArrayBuffer | Uint8Array,
  options: ParseOptions
): Promise<ParsedKeystore> {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  if (isJksFile(bytes)) {
    return await parseJks(bytes, options.fileName, options.password);
  }

  if (isPkcs12File(bytes)) {
    return await parsePkcs12(bytes, options.fileName, options.password);
  }

  // Attempt JKS first
  try {
    return await parseJks(bytes, options.fileName, options.password);
  } catch (jksErr) {
    // Attempt PKCS12
    try {
      return await parsePkcs12(bytes, options.fileName, options.password);
    } catch {
      throw new Error(
        'Unsupported or corrupt keystore format. Please ensure the file is a valid Java KeyStore (.jks, .jceks, .keystore) or PKCS#12 (.p12, .pfx).'
      );
    }
  }
}
