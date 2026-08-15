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
    <div className="gcp-sidebar">
      <div className="gcp-sidebar-top">
        <div className="gcp-search-wrap">
          <Search size={13} className="gcp-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="gcp-search-input"
            placeholder="Filter entries (/ or Cmd+K)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Filter keystore entries"
          />
        </div>

        <div className="gcp-filter-tabs">
          <button
            type="button"
            className={`gcp-filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({entries.length})
          </button>
          <button
            type="button"
            className={`gcp-filter-tab ${activeFilter === 'private_key' ? 'active' : ''}`}
            onClick={() => setActiveFilter('private_key')}
          >
            Keys ({entries.filter((e) => e.type === 'PrivateKey').length})
          </button>
          <button
            type="button"
            className={`gcp-filter-tab ${activeFilter === 'trusted_cert' ? 'active' : ''}`}
            onClick={() => setActiveFilter('trusted_cert')}
          >
            Certs ({entries.filter((e) => e.type === 'TrustedCertificate').length})
          </button>
          <button
            type="button"
            className={`gcp-filter-tab ${activeFilter === 'issues' ? 'active' : ''}`}
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

      <div className="gcp-entry-scroll" role="listbox" aria-label="Keystore entries">
        {filteredEntries.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--gcp-text-muted)', fontSize: '0.8rem' }}>
            No entries match your search
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
                className={`gcp-entry-row ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectEntry(entry)}
                onKeyDown={(e) => handleKeyDown(e, entry)}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
              >
                <div className="gcp-entry-title-row">
                  <span className="gcp-entry-alias" title={entry.alias}>
                    {entry.alias}
                  </span>
                  {entry.chain.length > 1 && (
                    <span className="gcp-tag" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
                      {entry.chain.length} certs
                    </span>
                  )}
                </div>

                <div className="gcp-entry-cn" title={primaryCert?.commonName || entry.alias}>
                  {primaryCert?.commonName || 'No Certificate Payload'}
                </div>

                <div className="gcp-entry-meta">
                  <span style={{ fontSize: '0.7rem', color: 'var(--gcp-text-muted)', fontFamily: 'var(--gcp-font-mono)' }}>
                    {keyLabel}
                  </span>

                  {primaryCert && (
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 600,
                        color:
                          worstValidity === 'valid'
                            ? 'var(--gcp-green)'
                            : worstValidity === 'expiring_soon'
                            ? 'var(--gcp-yellow)'
                            : 'var(--gcp-red)',
                      }}
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
