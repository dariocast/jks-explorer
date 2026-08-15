import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, X, AlertCircle } from 'lucide-react';

interface PasswordPromptModalProps {
  isOpen: boolean;
  fileName: string;
  errorMessage?: string | null;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  isOpen,
  fileName,
  errorMessage,
  onSubmit,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Lock size={16} />
            <span>Encrypted Keystore</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            style={{ width: '28px', height: '28px' }}
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
              The keystore <strong>{fileName}</strong> is protected with a password. Enter the password to decrypt private keys or verify integrity:
            </p>

            {errorMessage && (
              <div className="badge badge-destructive" style={{ padding: '0.5rem 0.75rem', width: '100%', marginBottom: '1rem', borderRadius: 'var(--radius)', fontSize: '0.75rem' }}>
                <AlertCircle size={13} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="password-input-wrapper">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                className="password-input"
                placeholder="Keystore password (e.g. changeit)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.375rem' }}>
              Standard Java default password is usually <code style={{ color: 'hsl(var(--foreground))' }}>changeit</code>.
            </span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Unlock Keystore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
