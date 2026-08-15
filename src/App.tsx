import React, { useState } from 'react';
import { ParsedKeystore, KeystoreEntry } from './types/keystore';
import { parseKeystoreFile } from './core/parser';
import { Header } from './components/Header';
import { FileDropzone } from './components/FileDropzone';
import { KeystoreSummary } from './components/KeystoreSummary';
import { EntryList } from './components/EntryList';
import { CertificateDetail } from './components/CertificateDetail';

export const App: React.FC = () => {
  const [keystore, setKeystore] = useState<ParsedKeystore | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<KeystoreEntry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processBuffer = async (buffer: ArrayBuffer, fileName: string, password?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const parsed = await parseKeystoreFile(buffer, {
        fileName,
        password: password || undefined,
      });

      setKeystore(parsed);
      if (parsed.entries.length > 0) {
        setSelectedEntry(parsed.entries[0]);
      } else {
        setSelectedEntry(null);
      }
    } catch (err: any) {
      console.error('Keystore parse error: ', err);
      setErrorMessage(err.message || 'Failed to parse keystore.');
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
  };

  return (
    <div className="app-container">
      <Header
        hasLoadedKeystore={keystore !== null}
        onReset={handleReset}
        onOpenSample={handleLoadSample}
      />

      <main className="main-content">
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

            <div className="explorer-grid">
              <EntryList
                entries={keystore.entries}
                selectedAlias={selectedEntry?.alias || null}
                onSelectEntry={(entry) => setSelectedEntry(entry)}
              />

              {selectedEntry ? (
                <CertificateDetail entry={selectedEntry} />
              ) : (
                <div className="detail-panel">
                  <div className="empty-state">
                    <p>Select an entry from the list to inspect certificate details.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <div>
          <strong>JKS Explorer v1.0.0</strong> — Pure Client-Side Java KeyStore & PKCS12 Analyzer
        </div>
        <div>
          Runs 100% locally in your browser. No private keys or certificates are ever transmitted to any server.
        </div>
      </footer>
    </div>
  );
};
export default App;
