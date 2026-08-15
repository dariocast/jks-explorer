import React from 'react';
import { ParsedKeystore } from '../types/keystore';
import { HardDrive, ShieldCheck, Key, Award, AlertTriangle, ShieldAlert } from 'lucide-react';

interface KeystoreSummaryProps {
  keystore: ParsedKeystore;
}

export const KeystoreSummary: React.FC<KeystoreSummaryProps> = ({ keystore }) => {
  const privateKeyCount = keystore.entries.filter((e) => e.type === 'PrivateKey').length;
  const trustedCertCount = keystore.entries.filter((e) => e.type === 'TrustedCertificate').length;
  
  const expiredCount = keystore.entries.filter((e) =>
    e.chain.some((c) => c.validityStatus === 'expired')
  ).length;

  const expiringSoonCount = keystore.entries.filter((e) =>
    e.chain.some((c) => c.validityStatus === 'expiring_soon')
  ).length;

  return (
    <div className="keystore-banner">
      <div className="keystore-file-info">
        <div className="keystore-file-icon">
          <HardDrive size={18} />
        </div>
        <div>
          <div className="keystore-file-details">
            <h3>
              <span>{keystore.fileName}</span>
              <span className="badge badge-outline">{keystore.type}</span>
            </h3>
          </div>
          <div className="keystore-meta-row">
            {keystore.entries.length} entries • Integrity: {keystore.integrityVerified ? 'Verified (SHA-1 Digest)' : 'Direct ASN.1'}
          </div>
        </div>
      </div>

      <div className="keystore-stats-row">
        <span className="badge badge-secondary">
          <Key size={12} />
          <span>{privateKeyCount} Keys</span>
        </span>

        <span className="badge badge-secondary">
          <Award size={12} />
          <span>{trustedCertCount} Certs</span>
        </span>

        {expiredCount > 0 ? (
          <span className="badge badge-destructive">
            <ShieldAlert size={12} />
            <span>{expiredCount} Expired</span>
          </span>
        ) : expiringSoonCount > 0 ? (
          <span className="badge badge-warning">
            <AlertTriangle size={12} />
            <span>{expiringSoonCount} Expiring Soon</span>
          </span>
        ) : (
          <span className="badge badge-success">
            <ShieldCheck size={12} />
            <span>All Valid</span>
          </span>
        )}
      </div>
    </div>
  );
};
