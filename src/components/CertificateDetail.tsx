import React, { useState, useEffect } from 'react';
import { KeystoreEntry, ParsedCertificate } from '../types/keystore';
import {
  Copy,
  Check,
  Download,
  Key,
  Layers,
  FileCode2,
  ListTree,
  FileText,
  Globe,
  Lock,
  Shield,
} from 'lucide-react';
import {
  copyToClipboard,
  downloadCertificatePem,
  downloadCertificateDer,
  downloadCertificateChain,
} from '../utils/export';
import { SecurityAuditCard } from './SecurityAuditCard';

interface CertificateDetailProps {
  entry: KeystoreEntry;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export type TabKey = 'overview' | 'subject_issuer' | 'extensions' | 'chain' | 'pem';

export const CertificateDetail: React.FC<CertificateDetailProps> = ({
  entry,
  activeTab,
  onTabChange,
}) => {
  const [selectedCertIndex, setSelectedCertIndex] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCertIndex(0);
  }, [entry.alias]);

  const certIndex = Math.min(selectedCertIndex, Math.max(0, entry.chain.length - 1));
  const cert: ParsedCertificate | undefined = entry.chain[certIndex];

  const handleCopy = async (text: string, fieldName: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  if (!cert) {
    return (
      <div className="gcp-detail-workspace">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gcp-text-muted)' }}>
          No certificate payload available for this entry.
        </div>
      </div>
    );
  }

  return (
    <div className="gcp-detail-workspace">
      {/* Top Header */}
      <div className="gcp-detail-top">
        <div className="gcp-detail-title-group">
          <h2>
            <Key size={16} color={entry.type === 'PrivateKey' ? 'var(--gcp-purple)' : 'var(--gcp-blue)'} />
            <span>{entry.alias}</span>
            <span className="gcp-tag">{entry.type === 'PrivateKey' ? 'Private Key' : 'Trusted Cert'}</span>
          </h2>
          <p>
            Entry Created: {entry.creationDate.toISOString().replace('T', ' ').slice(0, 19)} UTC
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="gcp-btn gcp-btn-secondary gcp-btn-sm"
            onClick={() => downloadCertificatePem(cert, `${entry.alias}-cert`)}
            title="Download PEM certificate"
          >
            <Download size={12} />
            <span>Download PEM</span>
          </button>
          {entry.chain.length > 1 && (
            <button
              type="button"
              className="gcp-btn gcp-btn-secondary gcp-btn-sm"
              onClick={() => downloadCertificateChain(entry.chain, entry.alias)}
              title="Download full certificate chain"
            >
              <Layers size={12} />
              <span>Full Chain (PEM)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="gcp-tab-bar" role="tablist">
        <button
          type="button"
          className={`gcp-tab-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onTabChange('overview')}
          role="tab"
        >
          <FileText size={13} />
          <span>Security & Overview</span>
          <span className="gcp-tab-badge">1</span>
        </button>
        <button
          type="button"
          className={`gcp-tab-item ${activeTab === 'subject_issuer' ? 'active' : ''}`}
          onClick={() => onTabChange('subject_issuer')}
          role="tab"
        >
          <Globe size={13} />
          <span>Subject & Issuer</span>
          <span className="gcp-tab-badge">2</span>
        </button>
        <button
          type="button"
          className={`gcp-tab-item ${activeTab === 'extensions' ? 'active' : ''}`}
          onClick={() => onTabChange('extensions')}
          role="tab"
        >
          <Lock size={13} />
          <span>X.509 Extensions ({cert.extensions.length})</span>
          <span className="gcp-tab-badge">3</span>
        </button>
        <button
          type="button"
          className={`gcp-tab-item ${activeTab === 'chain' ? 'active' : ''}`}
          onClick={() => onTabChange('chain')}
          role="tab"
        >
          <ListTree size={13} />
          <span>Trust Hierarchy ({entry.chain.length})</span>
          <span className="gcp-tab-badge">4</span>
        </button>
        <button
          type="button"
          className={`gcp-tab-item ${activeTab === 'pem' ? 'active' : ''}`}
          onClick={() => onTabChange('pem')}
          role="tab"
        >
          <FileCode2 size={13} />
          <span>Raw PEM</span>
          <span className="gcp-tab-badge">5</span>
        </button>
      </div>

      {/* Content */}
      <div className="gcp-detail-scroll">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            {/* Cryptographic Security Assessment */}
            <SecurityAuditCard cert={cert} />

            {/* General Properties Table */}
            <div className="gcp-section-card">
              <div className="gcp-section-card-title">
                <Shield size={14} />
                <span>Certificate Identity & Subject Information</span>
              </div>
              <table className="gcp-table">
                <tbody>
                  <tr>
                    <td style={{ width: '180px', color: 'var(--gcp-text-muted)', fontWeight: 600 }}>Common Name (CN)</td>
                    <td style={{ fontWeight: 700, color: '#ffffff' }}>{cert.commonName}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--gcp-text-muted)', fontWeight: 600 }}>Issuer Common Name</td>
                    <td>{cert.issuerCommonName}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--gcp-text-muted)', fontWeight: 600 }}>Subject Alternative Names</td>
                    <td>
                      {cert.sans.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {cert.sans.map((s, idx) => (
                            <span key={idx} className="gcp-tag" style={{ fontSize: '0.7rem' }}>
                              {s.type}: {s.value}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--gcp-text-muted)' }}>None defined</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--gcp-text-muted)', fontWeight: 600 }}>Key Specification</td>
                    <td className="gcp-mono-cell">
                      {cert.publicKey.algorithm} {cert.publicKey.bitLength ? `${cert.publicKey.bitLength}-bit` : ''} {cert.publicKey.curve ? `(Curve: ${cert.publicKey.curve})` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--gcp-text-muted)', fontWeight: 600 }}>Signature Algorithm</td>
                    <td className="gcp-mono-cell">{cert.signatureAlgorithm}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--gcp-text-muted)', fontWeight: 600 }}>Serial Number (Hex)</td>
                    <td>
                      <div className="gcp-copy-wrap">
                        <span>{cert.serialNumberHex}</span>
                        <button
                          type="button"
                          className="gcp-btn-subtle"
                          onClick={() => handleCopy(cert.serialNumberHex, 'serial')}
                          title="Copy Serial Number"
                        >
                          {copiedField === 'serial' ? <Check size={12} color="var(--gcp-green)" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--gcp-text-muted)', fontWeight: 600 }}>SHA-256 Fingerprint</td>
                    <td>
                      <div className="gcp-copy-wrap">
                        <span>{cert.fingerprints.sha256}</span>
                        <button
                          type="button"
                          className="gcp-btn-subtle"
                          onClick={() => handleCopy(cert.fingerprints.sha256, 'sha256')}
                          title="Copy SHA-256 Fingerprint"
                        >
                          {copiedField === 'sha256' ? <Check size={12} color="var(--gcp-green)" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--gcp-text-muted)', fontWeight: 600 }}>SHA-1 Fingerprint</td>
                    <td>
                      <div className="gcp-copy-wrap">
                        <span>{cert.fingerprints.sha1}</span>
                        <button
                          type="button"
                          className="gcp-btn-subtle"
                          onClick={() => handleCopy(cert.fingerprints.sha1, 'sha1')}
                          title="Copy SHA-1 Fingerprint"
                        >
                          {copiedField === 'sha1' ? <Check size={12} color="var(--gcp-green)" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* SUBJECT & ISSUER */}
        {activeTab === 'subject_issuer' && (
          <>
            <div className="gcp-section-card">
              <div className="gcp-section-card-title">
                <Globe size={14} />
                <span>Subject Distinguished Name (DN)</span>
              </div>
              <p style={{ fontSize: '0.75rem', fontFamily: 'var(--gcp-font-mono)', color: 'var(--gcp-blue)', marginBottom: '0.65rem', wordBreak: 'break-all' }}>
                {cert.subject}
              </p>
              <table className="gcp-table">
                <thead>
                  <tr>
                    <th style={{ width: '140px' }}>Attribute</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cert.subjectAttributes).map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ fontWeight: 600, color: 'var(--gcp-text-muted)' }}>{k}</td>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="gcp-section-card">
              <div className="gcp-section-card-title">
                <Globe size={14} />
                <span>Issuer Distinguished Name (DN)</span>
              </div>
              <p style={{ fontSize: '0.75rem', fontFamily: 'var(--gcp-font-mono)', color: 'var(--gcp-blue)', marginBottom: '0.65rem', wordBreak: 'break-all' }}>
                {cert.issuer}
              </p>
              <table className="gcp-table">
                <thead>
                  <tr>
                    <th style={{ width: '140px' }}>Attribute</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cert.issuerAttributes).map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ fontWeight: 600, color: 'var(--gcp-text-muted)' }}>{k}</td>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* EXTENSIONS */}
        {activeTab === 'extensions' && (
          <div className="gcp-section-card">
            <div className="gcp-section-card-title">
              <Lock size={14} />
              <span>Standard & Custom X.509 Extensions</span>
            </div>
            <table className="gcp-table">
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>Extension</th>
                  <th style={{ width: '80px' }}>Critical</th>
                  <th>Value / Description</th>
                </tr>
              </thead>
              <tbody>
                {cert.extensions.map((ext, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{ext.name}</div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--gcp-text-muted)', fontFamily: 'var(--gcp-font-mono)' }}>
                        {ext.oid}
                      </div>
                    </td>
                    <td>
                      {ext.critical ? (
                        <span className="gcp-tag" style={{ color: 'var(--gcp-red)', borderColor: 'var(--gcp-red-border)' }}>
                          Critical
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.725rem', color: 'var(--gcp-text-muted)' }}>No</span>
                      )}
                    </td>
                    <td style={{ wordBreak: 'break-word', fontSize: '0.775rem' }}>{ext.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CHAIN */}
        {activeTab === 'chain' && (
          <div className="gcp-section-card">
            <div className="gcp-section-card-title">
              <ListTree size={14} />
              <span>Certificate Trust Chain Hierarchy</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {entry.chain.map((c, idx) => {
                const isRoot = idx === entry.chain.length - 1;
                const isLeaf = idx === 0;
                const isSelected = idx === certIndex;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedCertIndex(idx)}
                    style={{
                      backgroundColor: isSelected ? '#1e283b' : 'var(--gcp-surface-card)',
                      border: `1px solid ${isSelected ? 'var(--gcp-blue)' : 'var(--gcp-surface-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: isRoot ? '#0f3823' : isLeaf ? '#122e4d' : '#222938',
                          color: isRoot ? 'var(--gcp-green)' : isLeaf ? 'var(--gcp-blue)' : 'var(--gcp-text-secondary)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>
                          {c.commonName || c.subject}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--gcp-text-secondary)' }}>
                          {isLeaf ? 'End-Entity Leaf' : isRoot ? 'Root CA' : `Intermediate CA (${idx})`} • Serial: {c.serialNumberHex.slice(0, 16)}...
                        </div>
                      </div>
                    </div>

                    <span
                      className="gcp-chip"
                      style={{
                        color: c.validityStatus === 'valid' ? 'var(--gcp-green)' : 'var(--gcp-red)',
                      }}
                    >
                      {c.validityStatus === 'valid' ? `${c.daysRemaining}d valid` : 'Expired'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PEM */}
        {activeTab === 'pem' && (
          <div className="gcp-section-card">
            <div className="gcp-section-card-title" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FileCode2 size={14} />
                <span>Base64 Encoded PEM Format</span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  className="gcp-btn gcp-btn-secondary gcp-btn-sm"
                  onClick={() => handleCopy(cert.pem, 'pem')}
                >
                  {copiedField === 'pem' ? <Check size={12} color="var(--gcp-green)" /> : <Copy size={12} />}
                  <span>{copiedField === 'pem' ? 'Copied!' : 'Copy PEM'}</span>
                </button>
                <button
                  type="button"
                  className="gcp-btn gcp-btn-secondary gcp-btn-sm"
                  onClick={() => downloadCertificatePem(cert, `${entry.alias}`)}
                >
                  <Download size={12} />
                  <span>Download .crt</span>
                </button>
                <button
                  type="button"
                  className="gcp-btn gcp-btn-secondary gcp-btn-sm"
                  onClick={() => downloadCertificateDer(cert, `${entry.alias}`)}
                >
                  <Download size={12} />
                  <span>Download .der</span>
                </button>
              </div>
            </div>

            <pre
              style={{
                backgroundColor: 'var(--gcp-surface-card)',
                border: '1px solid var(--gcp-surface-border)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.85rem',
                fontFamily: 'var(--gcp-font-mono)',
                fontSize: '0.725rem',
                lineHeight: 1.45,
                color: '#c3e7ff',
                overflowX: 'auto',
              }}
            >
              {cert.pem}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
