import React from 'react';
import { KeyRound, ShieldCheck, FolderOpen, RefreshCw, Archive, HelpCircle } from 'lucide-react';
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
    <header className="shadcn-header">
      <div className="header-content">
        <div className="brand-section">
          <div className="brand-icon">
            <KeyRound size={18} />
          </div>
          <div>
            <div className="brand-title">
              <span>{APP_NAME}</span>
              <span className="badge badge-secondary">v{APP_VERSION}</span>
            </div>
            <div className="brand-subtitle">{APP_TAGLINE}</div>
          </div>
        </div>

        <div className="header-actions">
          <span className="badge badge-success" style={{ gap: '0.35rem', padding: '0.25rem 0.65rem' }}>
            <ShieldCheck size={13} />
            <span>100% Client-Side</span>
          </span>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onOpenShortcuts}
            title="Keyboard shortcuts (?)"
            aria-label="Open keyboard shortcuts"
          >
            <HelpCircle size={14} />
            <span>Shortcuts</span>
          </button>

          {hasLoadedKeystore ? (
            <>
              {onExportAllZip && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={onExportAllZip}
                  title="Export all certificates as a ZIP archive"
                >
                  <Archive size={14} />
                  <span>Export All (ZIP)</span>
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onReset}
                title="Close current keystore and open another"
              >
                <FolderOpen size={14} />
                <span>Open Keystore</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onOpenSample('pure-sun-jks.jks')}
              title="Load demo Sun JKS keystore"
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
