# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-08-15

### Added
- **Google Cloud Security Console Workbench Redesign**:
  - Precision enterprise layout styled after Google Cloud KMS / Certificate Authority Service.
  - **Cryptographic Posture & NIST Security Assessment**: Real-time evaluation of algorithm strength (NIST SP 800-57 guidelines) and deprecated digest detection.
  - **Interactive Certificate Lifecycle Timeline**: Visual timeline tracking elapsed vs. remaining certificate validity.
  - **High-Density Enterprise Property Tables**: Two-column structured tables for Subject/Issuer DN, X.509 Extensions, and cryptographic fingerprints.
  - **Zero-Cache Meta Headers**: Added cache-busting headers to prevent stale asset delivery on GitHub Pages.
- **Dynamic Versioning**: Single-source version system synchronized across UI and manifest.

## [1.1.0] - 2026-08-15

### Added
- Material 3 Expressive tokens and design foundations.
- Keyboard shortcuts modal and power navigation (`/`, `↓/↑`, `1-5`, `?`).
- Bulk export of all certificates to `.zip` archive.
- Contextual password unlock modal.

## [1.0.0] - 2026-08-15

### Added
- Pure client-side binary parser for Java KeyStore (`.jks` and `.jceks`) files.
- SHA-1 message digest verification for JKS file integrity against keystore passwords.
- PKCS#12 (`.p12`, `.pfx`) keystore decryption and certificate extraction.
- Comprehensive X.509 certificate inspector supporting DN attributes, SANs, key specs, extensions, and fingerprints.
- Interactive certificate chain hierarchy viewer.
- Export to PEM (`.crt`/`.pem`) and DER (`.cer`).
- Bundled demo keystores (`pure-sun-jks.jks`, `sample-keystore.jks`, `sample-pkcs12.p12`, `expired-sample.jks`).
