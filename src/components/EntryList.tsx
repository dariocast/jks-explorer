import React, { useMemo } from 'react';
import { KeystoreEntry } from '../types/keystore';
import { Search } from 'lucide-react';

interface EntryListProps {
  entries: KeystoreEntry[];
  selectedAlias: string | null;
  onSelectEntry: (entry: KeystoreEntry) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

type FilterType = 'all' | 'private_key' | 'trusted_cert' | 'issues';

export const EntryList: React.FC<EntryListProps> = ({
  entries,
  selectedAlias,
  onSelectEntry,
  searchQuery,
  onSearchChange,
  searchInputRef,
}) => {
  const [activeFilter, setActiveFilter] = React.useState<FilterType>('all');

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Filter Type
      if (activeFilter === 'private_key' && entry.type !== 'PrivateKey') return false;
      if (activeFilter === 'trusted_cert' && entry.type !== 'TrustedCertificate') return false;
      if (activeFilter === 'issues') {
        const hasIssue = entry.chain.some(
          (c) => c.validityStatus === 'expired' || c.validityStatus === 'expiring_soon'
        );
        if (!hasIssue) return false;
      }

      // Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      if (entry.alias.toLowerCase().includes(q)) return true;

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

  const handleKeyDown = (e: React.KeyboardEvent, entry: KeystoreEntry) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectEntry(entry);
    }
  };

  return (
    <div className="sidebar-panel">
      <div className="sidebar-header">
        <div className="search-input-wrap">
          <Search size={14} className="search-input-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search entries... (/ or Cmd+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search keystore entries"
          />
          <span className="search-kbd-hint">/</span>
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
            className={`filter-btn ${activeFilter === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveFilter('issues')}
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

      <div className="entry-list-scroll" role="listbox" aria-label="Keystore entries">
        {filteredEntries.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: '0.8125rem' }}>
            No matching entries found
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isSelected = entry.alias === selectedAlias;
            const primaryCert = entry.chain[0];
            const keyAlgo = primaryCert?.publicKey?.algorithm || 'Key';
            const bitLength = primaryCert?.publicKey?.bitLength;
            const curve = primaryCert?.publicKey?.curve;
            const keyLabel = bitLength ? `${keyAlgo}-${bitLength}` : curve ? `${keyAlgo} (${curve})` : keyAlgo;

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
                onKeyDown={(e) => handleKeyDown(e, entry)}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
              >
                <div className="entry-card-top">
                  <span className="entry-alias" title={entry.alias}>
                    {entry.alias}
                  </span>
                  {entry.chain.length > 1 && (
                    <span className="badge badge-outline" style={{ fontSize: '0.625rem', padding: '0.0625rem 0.375rem' }}>
                      {entry.chain.length} certs
                    </span>
                  )}
                </div>

                <div className="entry-card-cn" title={primaryCert?.commonName || entry.alias}>
                  {primaryCert?.commonName || 'No Certificate Data'}
                </div>

                <div className="entry-card-meta">
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))' }}>
                    {keyLabel}
                  </span>

                  {primaryCert && (
                    <span
                      className={`badge ${
                        worstValidity === 'valid'
                          ? 'badge-success'
                          : worstValidity === 'expiring_soon'
                          ? 'badge-warning'
                          : 'badge-destructive'
                      }`}
                      style={{ fontSize: '0.625rem', padding: '0.0625rem 0.375rem' }}
                    >
                      {worstValidity === 'valid'
                        ? `${primaryCert.daysRemaining}d`
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
