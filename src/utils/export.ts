import { ParsedCertificate } from '../types/keystore';

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
