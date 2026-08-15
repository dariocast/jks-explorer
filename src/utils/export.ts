import JSZip from 'jszip';
import { ParsedCertificate, KeystoreEntry } from '../types/keystore';

/**
 * Trigger browser file download
 */
export function downloadFile(data: BlobPart, filename: string, mimeType: string = 'application/octet-stream') {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a single certificate in PEM format
 */
export function downloadCertificatePem(cert: ParsedCertificate, alias: string) {
  const safeName = alias.replace(/[^a-zA-Z0-9._-]/g, '_');
  downloadFile(cert.pem, `${safeName}.pem`, 'application/x-pem-file');
}

/**
 * Downloads a single certificate in binary DER format
 */
export function downloadCertificateDer(cert: ParsedCertificate, alias: string) {
  const safeName = alias.replace(/[^a-zA-Z0-9._-]/g, '_');
  const buffer = new Uint8Array(cert.rawDer).slice().buffer;
  downloadFile(buffer, `${safeName}.cer`, 'application/pkix-cert');
}

/**
 * Downloads full certificate chain as combined PEM bundle
 */
export function downloadCertificateChain(chain: ParsedCertificate[], alias: string) {
  const safeName = alias.replace(/[^a-zA-Z0-9._-]/g, '_');
  const bundlePem = chain.map((c) => c.pem.trim()).join('\n\n') + '\n';
  downloadFile(bundlePem, `${safeName}-chain.pem`, 'application/x-pem-file');
}

/**
 * Bulk exports all certificates in the keystore as a clean ZIP archive
 */
export async function downloadAllCertificatesZip(entries: KeystoreEntry[], keystoreName: string) {
  const zip = new JSZip();
  const baseName = keystoreName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_');
  const certsFolder = zip.folder('certificates') || zip;

  let combinedAllPem = '';

  entries.forEach((entry) => {
    const entrySlug = entry.alias.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    entry.chain.forEach((cert, idx) => {
      const suffix = entry.chain.length > 1 ? (idx === 0 ? '-leaf' : `-ca-${idx}`) : '';
      const filename = `${entrySlug}${suffix}.pem`;
      certsFolder.file(filename, cert.pem);
      combinedAllPem += `# Alias: ${entry.alias} (Cert ${idx + 1}/${entry.chain.length})\n# Subject: ${cert.subject}\n# Issuer: ${cert.issuer}\n${cert.pem.trim()}\n\n`;
    });
  });

  zip.file(`${baseName}-all-bundle.pem`, combinedAllPem);

  const content = await zip.generateAsync({ type: 'blob' });
  downloadFile(content, `${baseName}-exported-certs.zip`, 'application/zip');
}

/**
 * Copies text to user clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}
