import React from 'react';
import { HelpCircle, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Focus live filter search bar' },
    { key: 'Cmd+K / Ctrl+K', desc: 'Focus live filter search bar' },
    { key: '↓ / j', desc: 'Select next entry in list' },
    { key: '↑ / k', desc: 'Select previous entry in list' },
    { key: '1', desc: 'Switch to Overview & Security tab' },
    { key: '2', desc: 'Switch to Subject & Issuer tab' },
    { key: '3', desc: 'Switch to X.509 Extensions tab' },
    { key: '4', desc: 'Switch to Trust Hierarchy tab' },
    { key: '5', desc: 'Switch to Raw PEM tab' },
    { key: '?', desc: 'Toggle keyboard shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Close open dialogs or unfocus search' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <HelpCircle size={16} />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            style={{ width: '28px', height: '28px' }}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={14} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '0.75rem 1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {shortcuts.map((s, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.375rem 0',
                  borderBottom: idx < shortcuts.length - 1 ? '1px solid hsl(var(--border) / 0.5)' : 'none',
                }}
              >
                <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>{s.desc}</span>
                <kbd
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    backgroundColor: 'hsl(var(--muted))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    padding: '0.125rem 0.375rem',
                    color: 'hsl(var(--foreground))',
                  }}
                >
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
