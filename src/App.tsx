import React, { useState, useEffect, useRef } from 'react';
import { ParsedKeystore, KeystoreEntry } from './types/keystore';
import { parseKeystoreFile } from './core/parser';
import { Header } from './components/Header';
import { FileDropzone } from './components/FileDropzone';
import { KeystoreSummary } from './components/KeystoreSummary';
import { EntryList } from './components/EntryList';
import { CertificateDetail, TabKey } from './components/CertificateDetail';
import { ShortcutsModal } from './components/ShortcutsModal';
import { PasswordPromptModal } from './components/PasswordPromptModal';
import { downloadAllCertificatesZip } from './utils/export';
import { APP_NAME, APP_VERSION } from './version';

export const App: React.FC = () => {
  const [keystore, setKeystore] = useState<ParsedKeystore | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<KeystoreEntry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Modals state
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [pendingFile, setPendingFile] = useState<{ buffer: ArrayBuffer; name: string } | null>(null);
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const processBuffer = async (buffer: ArrayBuffer, fileName: string, password?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setPasswordModalError(null);
    try {
      const parsed = await parseKeystoreFile(buffer, {
        fileName,
        password: password || undefined,
      });

      setKeystore(parsed);
      setPendingFile(null);
      if (parsed.entries.length > 0) {
        setSelectedEntry(parsed.entries[0]);
      } else {
        setSelectedEntry(null);
      }
    } catch (err: any) {
      console.error('Keystore parse error: ', err);
      const msg = err.message || 'Failed to parse keystore.';
      
      // If password error or PKCS12 decryption required, open contextual password modal
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('mac') || msg.toLowerCase().includes('decrypt')) {
        setPendingFile({ buffer, name: fileName });
        setPasswordModalError(msg);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelected = async (file: File, password?: string) => {
    try {
      const buffer = await file.arrayBuffer();
      await processBuffer(buffer, file.name, password);
    } catch (err: any) {
      setErrorMessage(`Error reading file: ${err.message || err}`);
    }
  };

  const handleLoadSample = async (sampleName: string, password?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`./samples/${sampleName}`);
      if (!res.ok) {
        throw new Error(`Failed to load sample ${sampleName} (HTTP ${res.status})`);
      }
      const buffer = await res.arrayBuffer();
      await processBuffer(buffer, sampleName, password);
    } catch (err: any) {
      setErrorMessage(`Failed to load sample: ${err.message || err}`);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setKeystore(null);
    setSelectedEntry(null);
    setErrorMessage(null);
    setSearchQuery('');
    setPendingFile(null);
  };

  const handleExportAllZip = () => {
    if (keystore && keystore.entries.length > 0) {
      downloadAllCertificatesZip(keystore.entries, keystore.fileName);
    }
  };

  const handlePasswordSubmit = (password: string) => {
    if (pendingFile) {
      processBuffer(pendingFile.buffer, pendingFile.name, password);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
        } else if (pendingFile) {
          setPendingFile(null);
        } else if (isInput) {
          searchInputRef.current?.blur();
        }
        return;
      }

      // Tab switching 1 - 5 when keystore loaded and not typing in input
      if (keystore && !isInput) {
        if (e.key === '1') { e.preventDefault(); setActiveTab('overview'); }
        else if (e.key === '2') { e.preventDefault(); setActiveTab('subject_issuer'); }
        else if (e.key === '3') { e.preventDefault(); setActiveTab('extensions'); }
        else if (e.key === '4') { e.preventDefault(); setActiveTab('chain'); }
        else if (e.key === '5') { e.preventDefault(); setActiveTab('pem'); }

        // Arrow navigation in list
        if ((e.key === 'ArrowDown' || e.key === 'j') && keystore.entries.length > 0) {
          e.preventDefault();
          const currIdx = selectedEntry ? keystore.entries.findIndex((x) => x.alias === selectedEntry.alias) : -1;
          const nextIdx = Math.min(keystore.entries.length - 1, currIdx + 1);
          setSelectedEntry(keystore.entries[nextIdx]);
        } else if ((e.key === 'ArrowUp' || e.key === 'k') && keystore.entries.length > 0) {
          e.preventDefault();
          const currIdx = selectedEntry ? keystore.entries.findIndex((x) => x.alias === selectedEntry.alias) : 0;
          const prevIdx = Math.max(0, currIdx - 1);
          setSelectedEntry(keystore.entries[prevIdx]);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [keystore, selectedEntry, isShortcutsOpen, pendingFile]);

  return (
    <div className="app-container">
      <Header
        hasLoadedKeystore={keystore !== null}
        onReset={handleReset}
        onOpenSample={handleLoadSample}
        onExportAllZip={keystore ? handleExportAllZip : undefined}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <main className="gcp-main-layout">
        {!keystore ? (
          <FileDropzone
            onFileSelected={handleFileSelected}
            onLoadSample={handleLoadSample}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        ) : (
          <>
            <KeystoreSummary keystore={keystore} />

            <div className="gcp-workbench-grid">
              <EntryList
                entries={keystore.entries}
                selectedAlias={selectedEntry?.alias || null}
                onSelectEntry={(entry) => setSelectedEntry(entry)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchInputRef={searchInputRef}
              />

              {selectedEntry ? (
                <CertificateDetail
                  entry={selectedEntry}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              ) : (
                <div className="gcp-detail-workspace">
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gcp-text-muted)' }}>
                    Select an entry from the left pane to inspect certificate properties.
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="gcp-footer">
        <div>
          <strong>{APP_NAME}</strong> v{APP_VERSION} — Client-Side Security Console
        </div>
        <div>
          Keyboard shortcuts: <span className="gcp-tag">?</span> • 100% Client-Side Engine
        </div>
      </footer>

      {/* Shortcuts modal */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* Password prompt modal */}
      <PasswordPromptModal
        isOpen={pendingFile !== null}
        fileName={pendingFile?.name || ''}
        errorMessage={passwordModalError}
        onSubmit={handlePasswordSubmit}
        onCancel={() => setPendingFile(null)}
      />
    </div>
  );
};
export default App;
