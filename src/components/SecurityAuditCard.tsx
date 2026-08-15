import React from 'react';
import { ParsedCertificate } from '../types/keystore';
import { ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface SecurityAuditProps {
  cert: ParsedCertificate;
}

export const SecurityAuditCard: React.FC<SecurityAuditProps> = ({ cert }) => {
  // 1. Calculate Timeline %
  const totalDurationMs = cert.notAfter.getTime() - cert.notBefore.getTime();
  const elapsedMs = Date.now() - cert.notBefore.getTime();
  const rawPercent = totalDurationMs > 0 ? (elapsedMs / totalDurationMs) * 100 : 100;
  const elapsedPercent = Math.min(100, Math.max(0, Math.round(rawPercent)));

  // 2. Algorithm Assessment (NIST Guidelines)
  let keyStrengthLabel = 'Modern & Secure';
  let keyStrengthClass = 'badge-strong';
  let keyStrengthDesc = 'Meets modern NIST SP 800-57 security requirements.';

  if (cert.publicKey.algorithm === 'RSA' || cert.publicKey.algorithm.includes('RSA')) {
    const bits = cert.publicKey.bitLength || 2048;
    if (bits < 2048) {
      keyStrengthLabel = 'Weak / Deprecated (<2048 bits)';
      keyStrengthClass = 'badge-weak';
      keyStrengthDesc = 'RSA keys under 2048 bits are vulnerable to factorization attacks.';
    } else if (bits === 2048) {
      keyStrengthLabel = 'Standard 2048-bit RSA';
      keyStrengthClass = 'badge-standard';
      keyStrengthDesc = 'Approved for standard commercial security through 2030.';
    } else {
      keyStrengthLabel = `High Security RSA (${bits}-bit)`;
      keyStrengthClass = 'badge-strong';
      keyStrengthDesc = 'High security margin suitable for long-term root/CA trust.';
    }
  } else if (cert.publicKey.algorithm.includes('EC') || cert.publicKey.curve) {
    keyStrengthLabel = `Elliptic Curve (${cert.publicKey.curve || 'ECC'})`;
    keyStrengthClass = 'badge-strong';
    keyStrengthDesc = 'High security per bit with modern forward secrecy performance.';
  }

  // 3. Signature Algorithm Assessment
  let sigStrengthClass = 'badge-strong';
  if (cert.signatureAlgorithm.toLowerCase().includes('md5') || cert.signatureAlgorithm.toLowerCase().includes('sha1')) {
    sigStrengthClass = 'badge-weak';
  }

  return (
    <div className="gcp-audit-card">
      <div className="gcp-audit-header">
        <div className="gcp-audit-title">
          <ShieldCheck size={16} color="var(--gcp-blue)" />
          <span>Cryptographic Posture & Security Assessment</span>
        </div>
        <span className={`gcp-chip ${keyStrengthClass}`}>{keyStrengthLabel}</span>
      </div>

      {/* Validity Timeline Bar */}
      <div className="gcp-timeline-box">
        <div className="gcp-timeline-labels">
          <span className="gcp-label-dim">
            <Clock size={12} /> Issued: {cert.notBefore.toISOString().split('T')[0]}
          </span>
          <span className="gcp-timeline-metric">
            {cert.validityStatus === 'valid'
              ? `${cert.daysRemaining} days remaining (${100 - elapsedPercent}% left)`
              : cert.validityStatus === 'expired'
              ? `Expired ${Math.abs(cert.daysRemaining)} days ago`
              : 'Not yet active'}
          </span>
          <span className="gcp-label-dim">
            Expires: {cert.notAfter.toISOString().split('T')[0]}
          </span>
        </div>

        <div className="gcp-progress-track">
          <div
            className={`gcp-progress-fill ${
              cert.validityStatus === 'expired'
                ? 'progress-expired'
                : cert.validityStatus === 'expiring_soon'
                ? 'progress-warning'
                : 'progress-valid'
            }`}
            style={{ width: `${cert.validityStatus === 'expired' ? 100 : elapsedPercent}%` }}
          />
        </div>
      </div>

      {/* Security Assessment Grid */}
      <div className="gcp-audit-grid">
        <div className="gcp-audit-item">
          <div className="gcp-audit-item-label">Key Spec Assessment</div>
          <div className="gcp-audit-item-value">
            <span className={`status-dot ${keyStrengthClass === 'badge-weak' ? 'dot-red' : 'dot-green'}`} />
            <strong>{keyStrengthLabel}</strong>
          </div>
          <p className="gcp-audit-item-hint">{keyStrengthDesc}</p>
        </div>

        <div className="gcp-audit-item">
          <div className="gcp-audit-item-label">Signature Digest</div>
          <div className="gcp-audit-item-value">
            <span className={`status-dot ${sigStrengthClass === 'badge-weak' ? 'dot-red' : 'dot-green'}`} />
            <code>{cert.signatureAlgorithm}</code>
          </div>
          <p className="gcp-audit-item-hint">
            {sigStrengthClass === 'badge-weak'
              ? 'WARNING: Digest algorithm is vulnerable to collision attacks.'
              : 'Digest meets current PKI standards.'}
          </p>
        </div>

        <div className="gcp-audit-item">
          <div className="gcp-audit-item-label">CA Role & Constraints</div>
          <div className="gcp-audit-item-value">
            <CheckCircle2 size={13} color="var(--gcp-green)" />
            <span>{cert.isCA ? 'Certificate Authority (CA)' : 'End-Entity / Server Leaf'}</span>
          </div>
          <p className="gcp-audit-item-hint">
            {cert.isCA ? 'Authorized to sign subordinate certificates.' : 'Intended for TLS endpoint / client identity.'}
          </p>
        </div>

        <div className="gcp-audit-item">
          <div className="gcp-audit-item-label">SAN Coverage</div>
          <div className="gcp-audit-item-value">
            {cert.sans.length > 0 ? (
              <span>{cert.sans.length} Subject Alternative Name(s)</span>
            ) : (
              <span style={{ color: 'var(--gcp-yellow)' }}>No SANs defined (Legacy CN only)</span>
            )}
          </div>
          <p className="gcp-audit-item-hint">
            {cert.sans.length > 0
              ? 'Modern browsers validate SAN entries for TLS hostname verification.'
              : 'RFC 6125 deprecates checking Common Name without SANs.'}
          </p>
        </div>
      </div>
    </div>
  );
};
