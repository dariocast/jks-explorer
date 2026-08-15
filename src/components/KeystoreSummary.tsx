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
    <div className="gcp-summary-bar">
      <div className="gcp-summary-left">
        <div className="gcp-summary-icon">
          <HardDrive size={18} />
        </div>
        <div>
          <div className="gcp-summary-filename">
            <span>{keystore.fileName}</span>
            <span className="gcp-tag">{keystore.type}</span>
          </div>
          <div className="gcp-summary-meta">
            {keystore.entries.length} total entries • Integrity: {keystore.integrityVerified ? 'Verified (SHA-1 Digest)' : 'Direct ASN.1'}
          </div>
        </div>
      </div>

      <div className="gcp-summary-stats">
        <span className="gcp-chip badge-standard">
          <Key size={12} />
          <span>{privateKeyCount} Private Keys</span>
        </span>

        <span className="gcp-chip badge-standard">
          <Award size={12} />
          <span>{trustedCertCount} Trusted Certs</span>
        </span>

        {expiredCount > 0 ? (
          <span className="gcp-chip badge-weak">
            <ShieldAlert size={12} />
            <span>{expiredCount} Expired</span>
          </span>
        ) : expiringSoonCount > 0 ? (
          <span className="gcp-chip badge-weak" style={{ color: 'var(--gcp-yellow)', borderColor: 'var(--gcp-yellow-border)' }}>
            <AlertTriangle size={12} />
            <span>{expiringSoonCount} Expiring Soon</span>
          </span>
        ) : (
          <span className="gcp-chip badge-strong">
            <ShieldCheck size={12} />
            <span>All Certificates Valid</span>
          </span>
        )}
      </div>
    </div>
  );
};
