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
      <div className="detail-panel">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
          No certificate payload available for this entry.
        </div>
      </div>
    );
  }

  return (
    <div className="detail-panel">
      {/* Top Header */}
      <div className="detail-header">
        <div className="detail-header-top">
          <div className="detail-title-area">
            <h2>
              <Key size={16} />
              <span>{entry.alias}</span>
              <span className="badge badge-secondary">{entry.type === 'PrivateKey' ? 'Private Key' : 'Trusted Cert'}</span>
            </h2>
            <p>
              Created: {entry.creationDate.toISOString().replace('T', ' ').slice(0, 19)} UTC
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => downloadCertificatePem(cert, `${entry.alias}-cert`)}
              title="Download PEM certificate"
            >
              <Download size={13} />
              <span>Download PEM</span>
            </button>
            {entry.chain.length > 1 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => downloadCertificateChain(entry.chain, entry.alias)}
                title="Download full certificate chain"
              >
                <Layers size={13} />
                <span>Full Chain</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* shadcn Tabs Header */}
      <div className="tabs-header" role="tablist">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onTabChange('overview')}
          role="tab"
        >
          <FileText size={13} />
          <span>Security & Overview</span>
          <span className="tab-shortcut-kbd">1</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'subject_issuer' ? 'active' : ''}`}
          onClick={() => onTabChange('subject_issuer')}
          role="tab"
        >
          <Globe size={13} />
          <span>Subject & Issuer</span>
          <span className="tab-shortcut-kbd">2</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'extensions' ? 'active' : ''}`}
          onClick={() => onTabChange('extensions')}
          role="tab"
        >
          <Lock size={13} />
          <span>Extensions ({cert.extensions.length})</span>
          <span className="tab-shortcut-kbd">3</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'chain' ? 'active' : ''}`}
          onClick={() => onTabChange('chain')}
          role="tab"
        >
          <ListTree size={13} />
          <span>Trust Hierarchy ({entry.chain.length})</span>
          <span className="tab-shortcut-kbd">4</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'pem' ? 'active' : ''}`}
          onClick={() => onTabChange('pem')}
          role="tab"
        >
          <FileCode2 size={13} />
          <span>Raw PEM</span>
          <span className="tab-shortcut-kbd">5</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content-scroll">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            {/* Cryptographic Security Assessment */}
            <SecurityAuditCard cert={cert} />

            {/* General Properties Table */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Shield size={14} />
                  <span>Certificate Properties & Fingerprints</span>
                </div>
              </div>
              <div className="table-container">
                <table className="shadcn-table">
                  <tbody>
                    <tr>
                      <td style={{ width: '180px', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Common Name (CN)</td>
                      <td style={{ fontWeight: 600 }}>{cert.commonName}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Issuer</td>
                      <td>{cert.issuerCommonName}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Subject Alternative Names</td>
                      <td>
                        {cert.sans.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {cert.sans.map((s, idx) => (
                              <span key={idx} className="badge badge-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                                {s.type}: {s.value}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'hsl(var(--muted-foreground))' }}>None defined</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Key Specification</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {cert.publicKey.algorithm} {cert.publicKey.bitLength ? `${cert.publicKey.bitLength}-bit` : ''} {cert.publicKey.curve ? `(Curve: ${cert.publicKey.curve})` : ''}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Signature Algorithm</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{cert.signatureAlgorithm}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Serial Number (Hex)</td>
                      <td>
                        <div className="copy-row">
                          <span>{cert.serialNumberHex}</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            style={{ width: '20px', height: '20px' }}
                            onClick={() => handleCopy(cert.serialNumberHex, 'serial')}
                            title="Copy Serial Number"
                          >
                            {copiedField === 'serial' ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>SHA-256 Fingerprint</td>
                      <td>
                        <div className="copy-row">
                          <span>{cert.fingerprints.sha256}</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            style={{ width: '20px', height: '20px' }}
                            onClick={() => handleCopy(cert.fingerprints.sha256, 'sha256')}
                            title="Copy SHA-256 Fingerprint"
                          >
                            {copiedField === 'sha256' ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>SHA-1 Fingerprint</td>
                      <td>
                        <div className="copy-row">
                          <span>{cert.fingerprints.sha1}</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            style={{ width: '20px', height: '20px' }}
                            onClick={() => handleCopy(cert.fingerprints.sha1, 'sha1')}
                            title="Copy SHA-1 Fingerprint"
                          >
                            {copiedField === 'sha1' ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* SUBJECT & ISSUER */}
        {activeTab === 'subject_issuer' && (
          <>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Globe size={14} />
                  <span>Subject Distinguished Name (DN)</span>
                </div>
                <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))', wordBreak: 'break-all' }}>
                  {cert.subject}
                </p>
              </div>
              <div className="table-container">
                <table className="shadcn-table">
                  <thead>
                    <tr>
                      <th style={{ width: '140px' }}>Attribute</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(cert.subjectAttributes).map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{k}</td>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Globe size={14} />
                  <span>Issuer Distinguished Name (DN)</span>
                </div>
                <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))', wordBreak: 'break-all' }}>
                  {cert.issuer}
                </p>
              </div>
              <div className="table-container">
                <table className="shadcn-table">
                  <thead>
                    <tr>
                      <th style={{ width: '140px' }}>Attribute</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(cert.issuerAttributes).map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{k}</td>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* EXTENSIONS */}
        {activeTab === 'extensions' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Lock size={14} />
                <span>X.509 v3 Extensions</span>
              </div>
            </div>
            <div className="table-container">
              <table className="shadcn-table">
                <thead>
                  <tr>
                    <th style={{ width: '200px' }}>Extension</th>
                    <th style={{ width: '80px' }}>Critical</th>
                    <th>Value / Description</th>
                  </tr>
                </thead>
                <tbody>
                  {cert.extensions.map((ext, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ext.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)' }}>
                          {ext.oid}
                        </div>
                      </td>
                      <td>
                        {ext.critical ? (
                          <span className="badge badge-destructive">Critical</span>
                        ) : (
                          <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>No</span>
                        )}
                      </td>
                      <td style={{ wordBreak: 'break-word', fontSize: '0.75rem' }}>{ext.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CHAIN */}
        {activeTab === 'chain' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <ListTree size={14} />
                <span>Certificate Trust Chain Hierarchy</span>
              </div>
            </div>
            <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {entry.chain.map((c, idx) => {
                const isRoot = idx === entry.chain.length - 1;
                const isLeaf = idx === 0;
                const isSelected = idx === certIndex;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedCertIndex(idx)}
                    style={{
                      backgroundColor: isSelected ? 'hsl(var(--muted))' : 'transparent',
                      border: `1px solid ${isSelected ? 'hsl(var(--foreground))' : 'hsl(var(--border))'}`,
                      borderRadius: 'var(--radius)',
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
                          borderRadius: 'var(--radius)',
                          backgroundColor: isRoot ? 'rgba(34, 197, 94, 0.2)' : isLeaf ? 'hsl(var(--muted))' : 'hsl(var(--muted))',
                          color: isRoot ? '#4ade80' : 'hsl(var(--foreground))',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                          {c.commonName || c.subject}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                          {isLeaf ? 'End-Entity Leaf' : isRoot ? 'Root CA' : `Intermediate CA (${idx})`} • Serial: {c.serialNumberHex.slice(0, 16)}...
                        </div>
                      </div>
                    </div>

                    <span
                      className={`badge ${c.validityStatus === 'valid' ? 'badge-success' : 'badge-destructive'}`}
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
          <div className="card">
            <div className="card-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">
                <FileCode2 size={14} />
                <span>Base64 ASCII PEM Format</span>
              </div>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleCopy(cert.pem, 'pem')}
                >
                  {copiedField === 'pem' ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                  <span>{copiedField === 'pem' ? 'Copied!' : 'Copy PEM'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => downloadCertificatePem(cert, `${entry.alias}`)}
                >
                  <Download size={12} />
                  <span>Download .crt</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => downloadCertificateDer(cert, `${entry.alias}`)}
                >
                  <Download size={12} />
                  <span>Download .der</span>
                </button>
              </div>
            </div>

            <div className="card-content">
              <pre
                style={{
                  backgroundColor: 'hsl(var(--muted) / 0.3)',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  padding: '0.875rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  lineHeight: 1.45,
                  color: 'hsl(var(--foreground))',
                  overflowX: 'auto',
                }}
              >
                {cert.pem}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
