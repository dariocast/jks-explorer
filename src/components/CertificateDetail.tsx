import React, { useState } from 'react';
import { KeystoreEntry, ParsedCertificate } from '../types/keystore';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
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
  Cpu,
  Hash,
} from 'lucide-react';
import {
  copyToClipboard,
  downloadCertificatePem,
  downloadCertificateDer,
  downloadCertificateChain,
} from '../utils/export';

interface CertificateDetailProps {
  entry: KeystoreEntry;
}

type TabKey = 'overview' | 'subject_issuer' | 'extensions' | 'chain' | 'pem';

export const CertificateDetail: React.FC<CertificateDetailProps> = ({ entry }) => {
  const [selectedCertIndex, setSelectedCertIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Keep index within bounds if entry changed
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
        <div className="empty-state">
          <p>No certificate data available for this entry.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-panel">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-top">
          <div className="detail-title-area">
            <h2>
              <Key size={20} color={entry.type === 'PrivateKey' ? '#c4b5fd' : '#7dd3fc'} />
              <span>{entry.alias}</span>
              <span className={`type-badge ${entry.type === 'PrivateKey' ? 'private-key' : 'trusted-cert'}`}>
                {entry.type === 'PrivateKey' ? 'Private Key Entry' : 'Trusted Certificate'}
              </span>
            </h2>
            <p>
              Created: {entry.creationDate.toLocaleDateString()} {entry.creationDate.toLocaleTimeString()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => downloadCertificatePem(cert, `${entry.alias}-cert`)}
              title="Download certificate in PEM format"
            >
              <Download size={14} />
              <span>Download PEM</span>
            </button>
            {entry.chain.length > 1 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => downloadCertificateChain(entry.chain, entry.alias)}
                title="Download entire certificate chain as PEM bundle"
              >
                <Layers size={14} />
                <span>Download Full Chain</span>
              </button>
            )}
          </div>
        </div>

        {/* Chain selector tabs if chain length > 1 */}
        {entry.chain.length > 1 && (
          <div className="chain-selector-bar">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '0.25rem' }}>
              Chain:
            </span>
            {entry.chain.map((c, idx) => {
              const roleLabel = idx === 0 ? 'Leaf' : idx === entry.chain.length - 1 ? 'Root CA' : `Intermediate ${idx}`;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`chain-item-btn ${idx === certIndex ? 'active' : ''}`}
                  onClick={() => setSelectedCertIndex(idx)}
                >
                  <span>{roleLabel}:</span>
                  <strong>{c.commonName || c.subject}</strong>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Navigation Tabs */}
      <div className="tabs-header">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FileText size={15} />
          <span>Overview</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'subject_issuer' ? 'active' : ''}`}
          onClick={() => setActiveTab('subject_issuer')}
        >
          <Globe size={15} />
          <span>Subject & Issuer</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'extensions' ? 'active' : ''}`}
          onClick={() => setActiveTab('extensions')}
        >
          <Lock size={15} />
          <span>Extensions ({cert.extensions.length})</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'chain' ? 'active' : ''}`}
          onClick={() => setActiveTab('chain')}
        >
          <ListTree size={15} />
          <span>Trust Chain ({entry.chain.length})</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'pem' ? 'active' : ''}`}
          onClick={() => setActiveTab('pem')}
        >
          <FileCode2 size={15} />
          <span>PEM & Raw</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content-scroll">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Validity Status Banner */}
            <div
              className={`section-card`}
              style={{
                borderColor:
                  cert.validityStatus === 'valid'
                    ? 'var(--success-border)'
                    : cert.validityStatus === 'expiring_soon'
                    ? 'var(--warning-border)'
                    : 'var(--danger-border)',
                backgroundColor:
                  cert.validityStatus === 'valid'
                    ? 'var(--success-bg)'
                    : cert.validityStatus === 'expiring_soon'
                    ? 'var(--warning-bg)'
                    : 'var(--danger-bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {cert.validityStatus === 'valid' && <ShieldCheck size={26} color="#34d399" />}
                  {cert.validityStatus === 'expiring_soon' && <AlertTriangle size={26} color="#fbbf24" />}
                  {cert.validityStatus === 'expired' && <ShieldAlert size={26} color="#f87171" />}
                  {cert.validityStatus === 'not_yet_valid' && <AlertTriangle size={26} color="#fbbf24" />}
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                      {cert.validityStatus === 'valid' && `Certificate is Valid (${cert.daysRemaining} days remaining)`}
                      {cert.validityStatus === 'expiring_soon' && `Expiring Soon (${cert.daysRemaining} days remaining)`}
                      {cert.validityStatus === 'expired' && `Certificate has Expired (${Math.abs(cert.daysRemaining)} days ago)`}
                      {cert.validityStatus === 'not_yet_valid' && 'Certificate is Not Yet Valid'}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Valid from: {cert.notBefore.toUTCString()} — to: {cert.notAfter.toUTCString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject & SANs */}
            <div className="section-card">
              <div className="section-card-title">
                <Globe size={16} />
                <span>Identity & Domains</span>
              </div>
              <div className="kv-grid">
                <div className="kv-item">
                  <span className="kv-label">Common Name (CN)</span>
                  <span className="kv-value" style={{ fontWeight: 600 }}>{cert.commonName}</span>
                </div>
                <div className="kv-item">
                  <span className="kv-label">Issuer</span>
                  <span className="kv-value">{cert.issuerCommonName}</span>
                </div>
              </div>

              {cert.sans.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <span className="kv-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                    Subject Alternative Names (SANs)
                  </span>
                  <div className="tag-list">
                    {cert.sans.map((san, sIdx) => (
                      <span key={sIdx} className="tag-item">
                        <span className="tag-prefix">{san.type}:</span>
                        <span>{san.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cryptography & Key Information */}
            <div className="section-card">
              <div className="section-card-title">
                <Cpu size={16} />
                <span>Key & Signature Algorithm</span>
              </div>
              <div className="kv-grid">
                <div className="kv-item">
                  <span className="kv-label">Public Key Algorithm</span>
                  <span className="kv-value">
                    {cert.publicKey.algorithm}
                    {cert.publicKey.bitLength && ` (${cert.publicKey.bitLength} bits)`}
                    {cert.publicKey.curve && ` [Curve: ${cert.publicKey.curve}]`}
                  </span>
                </div>
                <div className="kv-item">
                  <span className="kv-label">Signature Algorithm</span>
                  <span className="kv-value">{cert.signatureAlgorithm}</span>
                </div>
                {cert.publicKey.exponent && (
                  <div className="kv-item">
                    <span className="kv-label">Public Exponent</span>
                    <span className="kv-value">{cert.publicKey.exponent} (0x10001)</span>
                  </div>
                )}
                <div className="kv-item">
                  <span className="kv-label">Certificate Type</span>
                  <span className="kv-value">{cert.isCA ? 'Certificate Authority (CA)' : 'End Entity / Leaf Certificate'}</span>
                </div>
              </div>
            </div>

            {/* Thumbprints / Fingerprints */}
            <div className="section-card">
              <div className="section-card-title">
                <Hash size={16} />
                <span>Fingerprints & Serial Number</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="kv-item">
                  <span className="kv-label">Serial Number (Hex)</span>
                  <div className="kv-value mono">
                    <span>{cert.serialNumberHex}</span>
                    <button
                      type="button"
                      className="btn btn-subtle btn-sm"
                      onClick={() => handleCopy(cert.serialNumberHex, 'serial')}
                      title="Copy serial number"
                    >
                      {copiedField === 'serial' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="kv-item">
                  <span className="kv-label">SHA-256 Fingerprint</span>
                  <div className="kv-value mono">
                    <span>{cert.fingerprints.sha256}</span>
                    <button
                      type="button"
                      className="btn btn-subtle btn-sm"
                      onClick={() => handleCopy(cert.fingerprints.sha256, 'sha256')}
                      title="Copy SHA-256 fingerprint"
                    >
                      {copiedField === 'sha256' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="kv-item">
                  <span className="kv-label">SHA-1 Fingerprint</span>
                  <div className="kv-value mono">
                    <span>{cert.fingerprints.sha1}</span>
                    <button
                      type="button"
                      className="btn btn-subtle btn-sm"
                      onClick={() => handleCopy(cert.fingerprints.sha1, 'sha1')}
                      title="Copy SHA-1 fingerprint"
                    >
                      {copiedField === 'sha1' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SUBJECT & ISSUER TAB */}
        {activeTab === 'subject_issuer' && (
          <>
            <div className="section-card">
              <div className="section-card-title">
                <Globe size={16} />
                <span>Subject Distinguished Name (DN)</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
                <code>{cert.subject}</code>
              </p>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>Attribute</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cert.subjectAttributes).length > 0 ? (
                    Object.entries(cert.subjectAttributes).map(([key, val]) => (
                      <tr key={key}>
                        <td style={{ fontWeight: 600, color: 'var(--accent-text)' }}>{key}</td>
                        <td>{val}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} style={{ color: 'var(--text-muted)' }}>No explicit RDN attributes</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="section-card">
              <div className="section-card-title">
                <Globe size={16} />
                <span>Issuer Distinguished Name (DN)</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
                <code>{cert.issuer}</code>
              </p>
              <table className="detail-table">
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>Attribute</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cert.issuerAttributes).length > 0 ? (
                    Object.entries(cert.issuerAttributes).map(([key, val]) => (
                      <tr key={key}>
                        <td style={{ fontWeight: 600, color: 'var(--accent-text)' }}>{key}</td>
                        <td>{val}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} style={{ color: 'var(--text-muted)' }}>No explicit RDN attributes</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* EXTENSIONS TAB */}
        {activeTab === 'extensions' && (
          <div className="section-card">
            <div className="section-card-title">
              <Lock size={16} />
              <span>Standard & Custom X.509 v3 Extensions</span>
            </div>
            {cert.extensions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No extensions found in this certificate.</p>
            ) : (
              <table className="detail-table">
                <thead>
                  <tr>
                    <th style={{ width: '220px' }}>Extension Name</th>
                    <th style={{ width: '90px' }}>Critical</th>
                    <th>Details & Values</th>
                  </tr>
                </thead>
                <tbody>
                  {cert.extensions.map((ext, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{ext.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {ext.oid}
                        </div>
                      </td>
                      <td>
                        {ext.critical ? (
                          <span className="format-pill" style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.4)' }}>
                            Critical
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No</span>
                        )}
                      </td>
                      <td style={{ wordBreak: 'break-word', fontSize: '0.825rem' }}>
                        {ext.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* CHAIN TAB */}
        {activeTab === 'chain' && (
          <div className="section-card">
            <div className="section-card-title">
              <ListTree size={16} />
              <span>Certificate Trust Hierarchy</span>
            </div>
            <div className="chain-flow-container">
              {entry.chain.map((c, idx) => {
                const isSelectedNode = idx === certIndex;
                const isRoot = idx === entry.chain.length - 1;
                const isLeaf = idx === 0;
                return (
                  <React.Fragment key={idx}>
                    <div
                      className={`chain-node ${isSelectedNode ? 'active-node' : ''}`}
                      onClick={() => setSelectedCertIndex(idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isRoot ? '#064e3b' : isLeaf ? '#1e3a8a' : '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#ffffff',
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                            {c.commonName || c.subject}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {isLeaf ? 'End Entity (Leaf)' : isRoot ? 'Root CA' : `Intermediate CA (${idx})`} • Serial: {c.serialNumberHex.slice(0, 14)}...
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`validity-tag ${c.validityStatus}`}>
                          {c.validityStatus === 'valid' ? 'Valid' : c.validityStatus === 'expiring_soon' ? 'Expiring' : 'Expired'}
                        </span>
                        {isSelectedNode && (
                          <span className="format-pill" style={{ color: '#60a5fa' }}>
                            Viewing
                          </span>
                        )}
                      </div>
                    </div>
                    {idx < entry.chain.length - 1 && (
                      <div className="chain-node-arrow">
                        <span>↑ Signed by</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* PEM & RAW TAB */}
        {activeTab === 'pem' && (
          <div className="section-card">
            <div className="section-card-title" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCode2 size={16} />
                <span>Base64 ASCII PEM Certificate</span>
              </div>
              <div className="pem-actions-bar">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(cert.pem, 'pem')}
                >
                  {copiedField === 'pem' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  <span>{copiedField === 'pem' ? 'Copied!' : 'Copy PEM'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => downloadCertificatePem(cert, `${entry.alias}`)}
                >
                  <Download size={14} />
                  <span>Download .crt</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => downloadCertificateDer(cert, `${entry.alias}`)}
                >
                  <Download size={14} />
                  <span>Download .der (Binary)</span>
                </button>
              </div>
            </div>

            <div className="pem-container">
              <pre className="pem-text">{cert.pem}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
