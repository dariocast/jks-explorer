import React, { useEffect } from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Focus live search bar' },
    { key: '↓ / ↑ or j / k', desc: 'Navigate through certificate list' },
    { key: '1 - 5', desc: 'Switch detail tabs (Overview, DN, Ext, Chain, PEM)' },
    { key: 'Esc', desc: 'Dismiss modals or clear search' },
    { key: '?', desc: 'Open this keyboard shortcuts reference' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" id="shortcuts-title">
            <Command size={18} />
            <span>Keyboard Shortcuts</span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close shortcuts modal">
            <X size={18} />
          </button>
        </div>

        <div className="shortcuts-list">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="shortcut-row">
              <span className="shortcut-desc">{s.desc}</span>
              <kbd className="shortcut-kbd">{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
