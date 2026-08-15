# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-15

### Added
- **Material 3 Expressive Design System**: Complete visual overhaul adopting Google's Material 3 Expressive guidelines.
- **Dynamic Tonal Surfaces**: 6-level tonal elevation hierarchy (`surface-container-lowest` to `surface-container-highest`) with dark mode optimization.
- **Expressive Filter Chips**: Pill-shaped filter chips with active container highlights.
- **Keyboard Shortcuts & Power Navigation**:
  - `/` and `Cmd+K` / `Ctrl+K` for instant live search focus.
  - `↓ / ↑` and `j / k` for keyboard listbox navigation.
  - `1`, `2`, `3`, `4`, `5` for direct detail tab switching.
  - `?` for the interactive keyboard shortcuts cheat sheet.
  - `Esc` for modal dismissal and search reset.
- **Bulk Certificate Export**: Download all certificates and chains across the entire keystore as a formatted `.zip` archive.
- **Contextual Password Prompt Modal**: Seamless animated dialog with auto-focus upon dropping encrypted keystores.
- **Fluid Viewport Layout**: Adaptive full-height responsive layout with independent panel scrolling.
- **Enhanced Typography**: Integration of `Google Sans Flex` paired with `JetBrains Mono`.

## [1.0.0] - 2026-08-15

### Added
- Pure client-side binary parser for Java KeyStore (`.jks` and `.jceks`) files.
- SHA-1 message digest verification for JKS file integrity against keystore passwords.
- PKCS#12 (`.p12`, `.pfx`) keystore decryption and certificate extraction.
- Comprehensive X.509 certificate inspector supporting DN attributes, SANs, key specs, extensions, and fingerprints.
- Interactive certificate chain hierarchy viewer.
- Export to PEM (`.crt`/`.pem`) and DER (`.cer`).
- Bundled demo keystores (`pure-sun-jks.jks`, `sample-keystore.jks`, `sample-pkcs12.p12`, `expired-sample.jks`).
