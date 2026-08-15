import React, { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, X, AlertCircle } from 'lucide-react';

interface PasswordPromptModalProps {
  isOpen: boolean;
  fileName: string;
  errorMessage: string | null;
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
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="password-prompt-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" id="password-prompt-title">
            <Lock size={18} />
            <span>Password Required</span>
          </div>
          <button type="button" className="btn-icon" onClick={onCancel} aria-label="Cancel">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-desc">
              <strong>{fileName}</strong> is protected. Please enter the keystore password to decrypt its contents.
            </p>

            {errorMessage && (
              <div className="error-banner" style={{ marginBottom: '1rem', padding: '0.6rem 0.8rem' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.8rem' }}>{errorMessage}</span>
              </div>
            )}

            <div className="password-input-wrapper">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                className="password-input"
                placeholder="Enter password (e.g. changeit)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span className="password-hint">Tip: Standard Java keystore password is often <code>changeit</code>.</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Unlock Keystore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
