import React, { useState, useRef } from 'react';
import { UploadCloud, Lock, Eye, EyeOff, FileKey2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelected: (file: File, password?: string) => void;
  onLoadSample: (sampleFileName: string, password?: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelected,
  onLoadSample,
  isLoading,
  errorMessage,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelected(file, password);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelected(file, password);
    }
  };

  const handleSubmitWithPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onFileSelected(selectedFile, password);
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h2>Explore Java KeyStores Securely</h2>
        <p>
          Inspect, decode and analyze certificates, key chains, SANs, validity, and thumbprints
          directly in your browser with zero data leaving your machine.
        </p>
      </div>

      {errorMessage && (
        <div className="error-banner">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Failed to parse KeyStore:</strong> {errorMessage}
            {errorMessage.toLowerCase().includes('password') && (
              <div style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
                Tip: Enter the keystore password below and try again. Default Java keystore password is often <code>changeit</code>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password configuration */}
      <div className="password-box">
        <form onSubmit={handleSubmitWithPassword}>
          <div className="password-box-header">
            <label htmlFor="keystore-password">
              <Lock size={16} />
              <span>Keystore Password (Optional for JKS verification, Required for protected PKCS#12)</span>
            </label>
          </div>
          <div className="password-input-group">
            <div className="password-input-wrapper">
              <input
                id="keystore-password"
                type={showPassword ? 'text' : 'password'}
                className="password-input"
                placeholder="Enter password (e.g. changeit)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {selectedFile && (
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Decrypting...' : 'Re-try Parse'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Dropzone Box */}
      <div
        className={`dropzone-box ${isDragActive ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jks,.keystore,.ks,.jceks,.p12,.pfx,.cer,.crt,.pem"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className="dropzone-icon-wrap">
          <UploadCloud size={32} />
        </div>
        <h3>{selectedFile ? selectedFile.name : 'Drop your KeyStore file here'}</h3>
        <p>
          or <span style={{ color: 'var(--accent-text)', textDecoration: 'underline' }}>click to browse</span> from your computer
        </p>
        <div className="supported-formats-pills">
          <span className="format-pill">.jks</span>
          <span className="format-pill">.keystore</span>
          <span className="format-pill">.p12</span>
          <span className="format-pill">.pfx</span>
          <span className="format-pill">.jceks</span>
          <span className="format-pill">.cer / .crt</span>
        </div>
      </div>

      {/* Instant Demo Samples */}
      <div className="quick-samples">
        <div className="quick-samples-title">
          <FileKey2 size={16} />
          <span>Or Test With Pre-Loaded Sample Keystores (Password: <code>changeit</code>)</span>
        </div>
        <div className="samples-grid">
          <button
            type="button"
            className="sample-card-btn"
            onClick={() => onLoadSample('pure-sun-jks.jks', 'changeit')}
          >
            <div className="sample-card-name">
              <span>Pure Sun JKS</span>
              <CheckCircle2 size={15} color="#34d399" />
            </div>
            <div className="sample-card-desc">
              Native binary Sun JKS (0xfeedfeed) keystore format
            </div>
          </button>

          <button
            type="button"
            className="sample-card-btn"
            onClick={() => onLoadSample('sample-keystore.jks', 'changeit')}
          >
            <div className="sample-card-name">
              <span>Multi-Entry Keystore</span>
              <CheckCircle2 size={15} color="#34d399" />
            </div>
            <div className="sample-card-desc">
              RSA 2048/4096 + ECC P-256 keys, Root CA, SANs, Web Server EKU
            </div>
          </button>

          <button
            type="button"
            className="sample-card-btn"
            onClick={() => onLoadSample('sample-pkcs12.p12', 'changeit')}
          >
            <div className="sample-card-name">
              <span>PKCS#12 (.p12)</span>
              <CheckCircle2 size={15} color="#60a5fa" />
            </div>
            <div className="sample-card-desc">
              P12/PFX modern bundle with multiple aliases and cert chains
            </div>
          </button>

          <button
            type="button"
            className="sample-card-btn"
            onClick={() => onLoadSample('expired-sample.jks', 'changeit')}
          >
            <div className="sample-card-name">
              <span>Expired Cert Demo</span>
              <ShieldAlert size={15} color="#f87171" />
            </div>
            <div className="sample-card-desc">
              Keystore with expired certificate for testing validity warnings
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
