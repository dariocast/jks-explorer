import React from 'react';
import { KeyRound, ShieldCheck, FolderOpen, RefreshCw } from 'lucide-react';

interface HeaderProps {
  hasLoadedKeystore: boolean;
  onReset: () => void;
  onOpenSample: (sampleName: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasLoadedKeystore,
  onReset,
  onOpenSample,
}) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-section">
          <div className="brand-icon">
            <KeyRound size={22} />
          </div>
          <div>
            <div className="brand-title">
              JKS Explorer
              <span className="version-pill">v1.0.0</span>
            </div>
            <div className="brand-subtitle">
              Client-Side Java KeyStore & PKCS12 Certificate Explorer
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="privacy-badge">
            <ShieldCheck size={15} />
            <span>100% Client-Side / Zero Uploads</span>
          </div>

          {hasLoadedKeystore ? (
            <button className="btn btn-secondary btn-sm" onClick={onReset}>
              <FolderOpen size={15} />
              <span>Open Another File</span>
            </button>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenSample('sample-keystore.jks')}
            >
              <RefreshCw size={14} />
              <span>Load Demo JKS</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
