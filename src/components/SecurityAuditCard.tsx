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
  let keyStrengthBadge = 'badge-success';
  let keyStrengthDesc = 'Meets modern NIST SP 800-57 security guidelines.';

  if (cert.publicKey.algorithm === 'RSA' || cert.publicKey.algorithm.includes('RSA')) {
    const bits = cert.publicKey.bitLength || 2048;
    if (bits < 2048) {
      keyStrengthLabel = 'Weak (<2048 bits)';
      keyStrengthBadge = 'badge-destructive';
      keyStrengthDesc = 'RSA keys under 2048 bits are vulnerable to factorization attacks.';
    } else if (bits === 2048) {
      keyStrengthLabel = 'Standard RSA 2048';
      keyStrengthBadge = 'badge-secondary';
      keyStrengthDesc = 'Approved for standard commercial security through 2030.';
    } else {
      keyStrengthLabel = `High Security RSA ${bits}`;
      keyStrengthBadge = 'badge-success';
      keyStrengthDesc = 'High security margin suitable for long-term root/CA trust.';
    }
  } else if (cert.publicKey.algorithm.includes('EC') || cert.publicKey.curve) {
    keyStrengthLabel = `ECC (${cert.publicKey.curve || 'Elliptic Curve'})`;
    keyStrengthBadge = 'badge-success';
    keyStrengthDesc = 'High security per bit with modern forward secrecy performance.';
  }

  // 3. Signature Algorithm Assessment
  let sigStrengthBadge = 'badge-success';
  if (cert.signatureAlgorithm.toLowerCase().includes('md5') || cert.signatureAlgorithm.toLowerCase().includes('sha1')) {
    sigStrengthBadge = 'badge-destructive';
  }

  return (
    <div className="audit-card">
      <div className="audit-header">
        <div className="audit-title">
          <ShieldCheck size={16} />
          <span>Cryptographic Security & Posture Assessment</span>
        </div>
        <span className={`badge ${keyStrengthBadge}`}>{keyStrengthLabel}</span>
      </div>

      {/* Validity Timeline Bar */}
      <div className="timeline-box">
        <div className="timeline-labels">
          <span style={{ color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> Issued: {cert.notBefore.toISOString().split('T')[0]}
          </span>
          <span style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>
            {cert.validityStatus === 'valid'
              ? `${cert.daysRemaining} days left (${100 - elapsedPercent}% remaining)`
              : cert.validityStatus === 'expired'
              ? `Expired ${Math.abs(cert.daysRemaining)} days ago`
              : 'Not yet active'}
          </span>
          <span style={{ color: 'hsl(var(--muted-foreground))' }}>
            Expires: {cert.notAfter.toISOString().split('T')[0]}
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${cert.validityStatus === 'expired' ? 100 : elapsedPercent}%`,
              backgroundColor:
                cert.validityStatus === 'expired'
                  ? 'hsl(var(--destructive))'
                  : cert.validityStatus === 'expiring_soon'
                  ? '#eab308'
                  : '#22c55e',
            }}
          />
        </div>
      </div>

      {/* Audit Grid */}
      <div className="audit-grid">
        <div className="audit-item">
          <div className="audit-item-label">Key Specification</div>
          <div className="audit-item-value">
            <strong>{keyStrengthLabel}</strong>
          </div>
          <p className="audit-item-hint">{keyStrengthDesc}</p>
        </div>

        <div className="audit-item">
          <div className="audit-item-label">Signature Digest</div>
          <div className="audit-item-value">
            <span className={`badge ${sigStrengthBadge}`} style={{ fontSize: '0.6875rem' }}>
              {cert.signatureAlgorithm}
            </span>
          </div>
          <p className="audit-item-hint">
            {sigStrengthBadge === 'badge-destructive'
              ? 'Warning: Deprecated hash vulnerable to collision attacks.'
              : 'Meets current PKI digital signature standards.'}
          </p>
        </div>

        <div className="audit-item">
          <div className="audit-item-label">CA Role & Constraints</div>
          <div className="audit-item-value" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <CheckCircle2 size={13} color="#22c55e" />
            <span>{cert.isCA ? 'Certificate Authority (CA)' : 'End-Entity / Server Leaf'}</span>
          </div>
          <p className="audit-item-hint">
            {cert.isCA ? 'Authorized to sign subordinate certificates.' : 'Intended for TLS endpoint / client identity.'}
          </p>
        </div>

        <div className="audit-item">
          <div className="audit-item-label">SAN Coverage</div>
          <div className="audit-item-value">
            {cert.sans.length > 0 ? (
              <span>{cert.sans.length} SAN domain(s)</span>
            ) : (
              <span style={{ color: '#eab308' }}>No SANs (Legacy CN only)</span>
            )}
          </div>
          <p className="audit-item-hint">
            {cert.sans.length > 0
              ? 'Modern browsers require SAN for TLS hostname verification.'
              : 'RFC 6125 deprecates checking Common Name without SANs.'}
          </p>
        </div>
      </div>
    </div>
  );
};
