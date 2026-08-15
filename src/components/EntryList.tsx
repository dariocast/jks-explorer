import React, { useState, useMemo } from 'react';
import { KeystoreEntry } from '../types/keystore';
import { Search, Key, Award, AlertCircle, CheckCircle2, ShieldAlert, Layers } from 'lucide-react';

interface EntryListProps {
  entries: KeystoreEntry[];
  selectedAlias: string | null;
  onSelectEntry: (entry: KeystoreEntry) => void;
}

type FilterType = 'all' | 'private_key' | 'trusted_cert' | 'expiring';

export const EntryList: React.FC<EntryListProps> = ({
  entries,
  selectedAlias,
  onSelectEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Type Filter
      if (activeFilter === 'private_key' && entry.type !== 'PrivateKey') return false;
      if (activeFilter === 'trusted_cert' && entry.type !== 'TrustedCertificate') return false;
      if (activeFilter === 'expiring') {
        const hasExpiringOrExpired = entry.chain.some(
          (c) => c.validityStatus === 'expired' || c.validityStatus === 'expiring_soon'
        );
        if (!hasExpiringOrExpired) return false;
      }

      // 2. Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      // match alias
      if (entry.alias.toLowerCase().includes(q)) return true;

      // match certificates in chain
      for (const cert of entry.chain) {
        if (cert.commonName.toLowerCase().includes(q)) return true;
        if (cert.subject.toLowerCase().includes(q)) return true;
        if (cert.issuer.toLowerCase().includes(q)) return true;
        if (cert.serialNumberHex.toLowerCase().includes(q)) return true;
        if (cert.sans.some((s) => s.value.toLowerCase().includes(q))) return true;
        if (cert.fingerprints.sha256.toLowerCase().includes(q)) return true;
      }

      return false;
    });
  }, [entries, searchQuery, activeFilter]);

  return (
    <div className="sidebar-panel">
      <div className="sidebar-header">
        <div className="search-input-wrap">
          <Search size={15} className="search-input-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search alias, CN, SANs, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills-row">
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({entries.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'private_key' ? 'active' : ''}`}
            onClick={() => setActiveFilter('private_key')}
          >
            Keys ({entries.filter((e) => e.type === 'PrivateKey').length})
          </button>
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'trusted_cert' ? 'active' : ''}`}
            onClick={() => setActiveFilter('trusted_cert')}
          >
            Certs ({entries.filter((e) => e.type === 'TrustedCertificate').length})
          </button>
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'expiring' ? 'active' : ''}`}
            onClick={() => setActiveFilter('expiring')}
          >
            Issues (
            {
              entries.filter((e) =>
                e.chain.some((c) => c.validityStatus === 'expired' || c.validityStatus === 'expiring_soon')
              ).length
            }
            )
          </button>
        </div>
      </div>

      <div className="entry-list-scroll">
        {filteredEntries.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <p>No entries match your search</p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isSelected = entry.alias === selectedAlias;
            const primaryCert = entry.chain[0];
            const keyAlgo = primaryCert?.publicKey?.algorithm || 'Key';
            const bitLength = primaryCert?.publicKey?.bitLength;
            const curve = primaryCert?.publicKey?.curve;
            const keyLabel = bitLength ? `${keyAlgo} ${bitLength}` : curve ? `${keyAlgo} (${curve})` : keyAlgo;
            
            const worstValidity = entry.chain.reduce((prev, curr) => {
              if (curr.validityStatus === 'expired') return 'expired';
              if (curr.validityStatus === 'expiring_soon' && prev !== 'expired') return 'expiring_soon';
              return prev;
            }, primaryCert?.validityStatus || 'valid');

            return (
              <div
                key={entry.alias}
                className={`entry-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectEntry(entry)}
              >
                <div className="entry-card-top">
                  <div className="entry-alias" title={entry.alias}>
                    {entry.alias}
                  </div>
                  {entry.chain.length > 1 && (
                    <span className="format-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Layers size={10} />
                      {entry.chain.length} certs
                    </span>
                  )}
                </div>

                <div className="entry-card-cn" title={primaryCert?.commonName || entry.alias}>
                  {primaryCert?.commonName || 'No certificate payload'}
                </div>

                <div className="entry-card-meta">
                  <span className={`type-badge ${entry.type === 'PrivateKey' ? 'private-key' : 'trusted-cert'}`}>
                    {entry.type === 'PrivateKey' ? <Key size={11} /> : <Award size={11} />}
                    <span>{keyLabel}</span>
                  </span>

                  {primaryCert && (
                    <span className={`validity-tag ${worstValidity}`}>
                      {worstValidity === 'valid' && <CheckCircle2 size={11} />}
                      {worstValidity === 'expiring_soon' && <AlertCircle size={11} />}
                      {worstValidity === 'expired' && <ShieldAlert size={11} />}
                      {worstValidity === 'valid'
                        ? `${primaryCert.daysRemaining}d left`
                        : worstValidity === 'expiring_soon'
                        ? `Expiring (${primaryCert.daysRemaining}d)`
                        : 'Expired'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
