import React from 'react';
import { Shield, FolderOpen, RefreshCw, Archive, HelpCircle, HardDrive } from 'lucide-react';
import { APP_VERSION, APP_NAME, APP_TAGLINE } from '../version';

interface HeaderProps {
  hasLoadedKeystore: boolean;
  onReset: () => void;
  onOpenSample: (sampleName: string) => void;
  onExportAllZip?: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasLoadedKeystore,
  onReset,
  onOpenSample,
  onExportAllZip,
  onOpenShortcuts,
}) => {
  return (
    <header className="gcp-header">
      <div className="gcp-brand-group">
        <div className="gcp-brand-logo">
          <HardDrive size={18} />
        </div>
        <div className="gcp-brand-text">
          <div className="gcp-brand-title">
            <span>{APP_NAME}</span>
            <span className="gcp-version-tag">v{APP_VERSION}</span>
          </div>
          <div className="gcp-brand-sub">{APP_TAGLINE}</div>
        </div>
      </div>

      <div className="gcp-header-controls">
        <div className="gcp-env-chip">
          <Shield size={13} />
          <span>Client-Side Isolated Environment</span>
        </div>

        <button
          type="button"
          className="gcp-btn gcp-btn-secondary gcp-btn-sm"
          onClick={onOpenShortcuts}
          title="Keyboard shortcuts (?)"
        >
          <HelpCircle size={13} />
          <span>Shortcuts</span>
        </button>

        {hasLoadedKeystore ? (
          <>
            {onExportAllZip && (
              <button
                type="button"
                className="gcp-btn gcp-btn-secondary gcp-btn-sm"
                onClick={onExportAllZip}
                title="Export all certificates as a ZIP archive"
              >
                <Archive size={13} />
                <span>Export Keystore (ZIP)</span>
              </button>
            )}
            <button
              type="button"
              className="gcp-btn gcp-btn-secondary gcp-btn-sm"
              onClick={onReset}
              title="Close current keystore and open another"
            >
              <FolderOpen size={13} />
              <span>Open File</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            className="gcp-btn gcp-btn-secondary gcp-btn-sm"
            onClick={() => onOpenSample('pure-sun-jks.jks')}
            title="Load demo Sun JKS keystore"
          >
            <RefreshCw size={13} />
            <span>Load Demo Keystore</span>
          </button>
        )}
      </div>
    </header>
  );
};
