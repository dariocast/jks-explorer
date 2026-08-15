import React, { useRef, useState } from 'react';
import { Upload, Eye, EyeOff, Sparkles, FileKey2 } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelected: (file: File, password?: string) => void;
  onLoadSample: (sampleName: string, password?: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelected,
  onLoadSample,
  isLoading,
  errorMessage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [keystorePassword, setKeystorePassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0], keystorePassword);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0], keystorePassword);
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h2>Keystore & Certificate Explorer</h2>
        <p>100% client-side tool to inspect Java KeyStores, JCEKS, PKCS#12 archives and X.509 certificate chains</p>
      </div>

      {errorMessage && (
        <div className="badge badge-destructive" style={{ padding: '0.625rem 1rem', width: '100%', borderRadius: 'var(--radius)', fontSize: '0.8125rem' }}>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Password input */}
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}>
          Keystore Password (Optional for JKS public certs)
        </label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            className="search-input"
            placeholder="Enter password if required (e.g. changeit)"
            value={keystorePassword}
            onChange={(e) => setKeystorePassword(e.target.value)}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Dropzone Card */}
      <div
        className={`dropzone-card ${isDragActive ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jks,.keystore,.ks,.p12,.pfx,.jceks,.cer,.crt,.pem"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        <div className="dropzone-icon-wrap">
          {isLoading ? <Upload size={22} className="animate-spin" /> : <FileKey2 size={22} />}
        </div>

        <h3>{isLoading ? 'Parsing keystore payload...' : 'Drop your keystore here or click to browse'}</h3>
        <p>Zero network requests — all decryption and ASN.1 parsing occur locally in your browser</p>

        <div className="supported-formats-pills">
          <span className="badge badge-secondary">.JKS</span>
          <span className="badge badge-secondary">.P12 / .PFX</span>
          <span className="badge badge-secondary">.JCEKS</span>
          <span className="badge badge-secondary">.KEYSTORE</span>
          <span className="badge badge-secondary">.CRT / .PEM</span>
        </div>
      </div>

      {/* Quick Samples Card */}
      <div className="quick-samples">
        <div className="quick-samples-title">
          <Sparkles size={13} />
          <span>Pre-loaded Test Fixtures</span>
        </div>

        <div className="samples-grid">
          <button
            type="button"
            className="sample-card-btn"
            onClick={() => onLoadSample('pure-sun-jks.jks', keystorePassword || 'changeit')}
          >
            <div className="sample-card-name">Pure Sun JKS</div>
            <div className="sample-card-desc">Sun JKS v2 format with SHA-1 digest (Pass: changeit)</div>
          </button>

          <button
            type="button"
            className="sample-card-btn"
            onClick={() => onLoadSample('sample-keystore.jks', keystorePassword || 'changeit')}
          >
            <div className="sample-card-name">PKCS#12 JKS</div>
            <div className="sample-card-desc">Java 9+ default PKCS#12 keystore with 3 certificate entries</div>
          </button>

          <button
            type="button"
            className="sample-card-btn"
            onClick={() => onLoadSample('sample-pkcs12.p12', keystorePassword || 'changeit')}
          >
            <div className="sample-card-name">Direct .p12 Archive</div>
            <div className="sample-card-desc">Standard PKCS#12 bundle with SANs and key chain</div>
          </button>

          <button
            type="button"
            className="sample-card-btn"
            onClick={() => onLoadSample('expired-sample.jks', keystorePassword || 'changeit')}
          >
            <div className="sample-card-name">Expired Cert Sample</div>
            <div className="sample-card-desc">Sample with expired certificate for testing alert states</div>
          </button>
        </div>
      </div>
    </div>
  );
};
