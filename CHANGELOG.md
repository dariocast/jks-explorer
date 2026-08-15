# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-08-15

### Added
- **shadcn/ui Design System Overhaul**: Complete redesign adopting the authentic `shadcn/ui` (Zinc / Dark Modern) component architecture.
- **shadcn/ui Component Suite**:
  - `Card`, `CardHeader`, `CardTitle`, and `CardContent` components.
  - `Button` variants (`default`, `secondary`, `outline`, `ghost`, `destructive`, `sm`, `icon`).
  - `Badge` variants (`default`, `secondary`, `outline`, `success`, `warning`, `destructive`).
  - `Tabs` and `TabsTrigger` segmented navigation.
  - `Table` and minimalist key-value rows.
  - `Dialog` overlays with backdrop blur and accessible auto-focus.
- **Geist Typography**: Modern pairing of `Geist Sans` and `Geist Mono` with tight tracking.

## [1.2.0] - 2026-08-15

### Added
- Google Cloud Security Console layout foundations.
- Cryptographic posture & NIST algorithm strength assessment.
- Interactive certificate lifecycle timeline bar.
- Cache-busting HTTP headers.

## [1.1.0] - 2026-08-15

### Added
- Keyboard shortcuts and power navigation (`/`, `↓/↑`, `1-5`, `?`).
- Bulk export of all certificates to `.zip` archive.
- Contextual password unlock modal.

## [1.0.0] - 2026-08-15

### Added
- Pure client-side binary parser for Java KeyStore (`.jks` and `.jceks`) files.
- SHA-1 message digest verification for JKS file integrity against keystore passwords.
- PKCS#12 (`.p12`, `.pfx`) keystore decryption and certificate extraction.
- Comprehensive X.509 certificate inspector.
- Export to PEM (`.crt`/`.pem`) and DER (`.cer`).
- Bundled demo keystores.
