import React from 'react';
import { ParsedKeystore } from '../types/keystore';
import { FileKey, CheckCircle, AlertTriangle, Key, Award, Clock } from 'lucide-react';

interface KeystoreSummaryProps {
  keystore: ParsedKeystore;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const KeystoreSummary: React.FC<KeystoreSummaryProps> = ({ keystore }) => {
  const privateKeysCount = keystore.entries.filter((e) => e.type === 'PrivateKey').length;
  const trustedCertsCount = keystore.entries.filter((e) => e.type === 'TrustedCertificate').length;
  
  const expiredCount = keystore.entries.reduce((acc, entry) => {
    return acc + entry.chain.filter((c) => c.validityStatus === 'expired').length;
  }, 0);

  const expiringSoonCount = keystore.entries.reduce((acc, entry) => {
    return acc + entry.chain.filter((c) => c.validityStatus === 'expiring_soon').length;
  }, 0);

  return (
    <div className="keystore-banner">
      <div className="keystore-file-info">
        <div className="keystore-file-icon">
          <FileKey size={24} />
        </div>
        <div className="keystore-file-details">
          <h3>
            <span>{keystore.fileName}</span>
            <span className="format-pill">{keystore.type} v{keystore.version}</span>
          </h3>
          <div className="keystore-meta-row">
            <span>Size: {formatBytes(keystore.fileSize)}</span>
            <span>•</span>
            <span>Total Entries: {keystore.entryCount}</span>
          </div>
        </div>
      </div>

      <div className="keystore-stats-row">
        {/* Integrity status */}
        {keystore.integrityVerified === true && (
          <div className="stat-pill success" title="Password integrity check passed">
            <CheckCircle size={14} />
            <span>Integrity Verified</span>
          </div>
        )}
        {keystore.integrityVerified === false && (
          <div className="stat-pill warning" title="Password did not match keystore SHA-1 digest">
            <AlertTriangle size={14} />
            <span>Integrity Mismatch (Check Password)</span>
          </div>
        )}
        {keystore.integrityVerified === null && (
          <div className="stat-pill" title="No password was entered for integrity verification">
            <span>No Password Integrity Check</span>
          </div>
        )}

        <div className="stat-pill">
          <Key size={14} color="#c4b5fd" />
          <span>{privateKeysCount} Private {privateKeysCount === 1 ? 'Key' : 'Keys'}</span>
        </div>

        <div className="stat-pill">
          <Award size={14} color="#7dd3fc" />
          <span>{trustedCertsCount} Trusted {trustedCertsCount === 1 ? 'Cert' : 'Certs'}</span>
        </div>

        {expiredCount > 0 && (
          <div className="stat-pill warning">
            <Clock size={14} color="#f87171" />
            <span style={{ color: '#f87171' }}>{expiredCount} Expired</span>
          </div>
        )}

        {expiringSoonCount > 0 && (
          <div className="stat-pill warning">
            <Clock size={14} color="#fbbf24" />
            <span style={{ color: '#fbbf24' }}>{expiringSoonCount} Expiring Soon</span>
          </div>
        )}
      </div>
    </div>
  );
};
