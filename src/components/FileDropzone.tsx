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
    <div className="gcp-welcome-wrap">
      <div className="gcp-welcome-title">
        <h2>Keystore & Certificate Explorer</h2>
        <p>Enterprise client-side inspection for Java KeyStores, JCEKS, PKCS#12 bundles and X.509 chains</p>
      </div>

      {errorMessage && (
        <div className="error-banner">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Password pre-fill */}
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gcp-text-muted)' }}>
          Keystore Password (Optional for JKS public certificates)
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            className="gcp-search-input"
            placeholder="Enter password if encrypted (e.g. changeit)"
            value={keystorePassword}
            onChange={(e) => setKeystorePassword(e.target.value)}
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            className="gcp-btn-subtle"
            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', padding: '0.2rem' }}
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Dropzone */}
      <div
        className={`gcp-dropzone ${isDragActive ? 'active' : ''}`}
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

        <div className="gcp-dropzone-icon">
          {isLoading ? <Upload size={24} className="animate-spin" /> : <FileKey2 size={24} />}
        </div>

        <h3>{isLoading ? 'Parsing and validating keystore...' : 'Drop keystore file or click to browse'}</h3>
        <p>Zero network transfer — all decryption and X.509 parsing execute locally</p>

        <div className="gcp-format-tags">
          <span className="gcp-tag">.JKS</span>
          <span className="gcp-tag">.P12 / .PFX</span>
          <span className="gcp-tag">.JCEKS</span>
          <span className="gcp-tag">.KEYSTORE</span>
          <span className="gcp-tag">.CRT / .PEM</span>
        </div>
      </div>

      {/* Demo Samples */}
      <div className="gcp-samples-panel">
        <div className="gcp-samples-label">
          <Sparkles size={13} />
          <span>Quick Load Test Fixtures</span>
        </div>

        <div className="gcp-samples-grid">
          <button
            type="button"
            className="gcp-sample-card"
            onClick={() => onLoadSample('pure-sun-jks.jks', keystorePassword || 'changeit')}
          >
            <div className="gcp-sample-card-title">Pure Sun JKS (JKS v2)</div>
            <div className="gcp-sample-card-desc">Standard Java KeyStore with SHA-1 integrity digest (Pass: changeit)</div>
          </button>

          <button
            type="button"
            className="gcp-sample-card"
            onClick={() => onLoadSample('sample-keystore.jks', keystorePassword || 'changeit')}
          >
            <div className="gcp-sample-card-title">PKCS#12 JKS (Modern Java)</div>
            <div className="gcp-sample-card-desc">Java 9+ default PKCS#12 bundle with 3 keys and certificates</div>
          </button>

          <button
            type="button"
            className="gcp-sample-card"
            onClick={() => onLoadSample('sample-pkcs12.p12', keystorePassword || 'changeit')}
          >
            <div className="gcp-sample-card-title">Direct PKCS#12 (.p12)</div>
            <div className="gcp-sample-card-desc">Standard PKCS#12 archive with server certificates and SANs</div>
          </button>

          <button
            type="button"
            className="gcp-sample-card"
            onClick={() => onLoadSample('expired-sample.jks', keystorePassword || 'changeit')}
          >
            <div className="gcp-sample-card-title">Expired Certificate Sample</div>
            <div className="gcp-sample-card-desc">Demonstrates certificate expiration warning indicators</div>
          </button>
        </div>
      </div>
    </div>
  );
};
