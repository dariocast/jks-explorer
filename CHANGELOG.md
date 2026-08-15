# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-15

### Added
- Pure client-side binary parser for Java KeyStore (`.jks` and `.jceks`) files.
- SHA-1 message digest verification for JKS file integrity against keystore passwords.
- PKCS#12 (`.p12`, `.pfx`) keystore decryption and certificate extraction.
- Comprehensive X.509 certificate inspector supporting:
  - Subject and Issuer Distinguished Name attribute breakdown.
  - Subject Alternative Names (DNS, IP, Email, URI).
  - Public key specs (RSA key sizes, ECC curves, DSA).
  - Standard and custom X.509 v3 extensions (Key Usage, EKU, Basic Constraints, AKID, SKID, CRL, AIA/OCSP).
  - Fingerprint calculations for SHA-256, SHA-1, and MD5.
  - Validity period calculation with live active/expiring/expired status tagging.
- Interactive certificate chain and trust hierarchy viewer.
- Export options:
  - Download individual certificates in PEM (`.crt`/`.pem`) and DER (`.cer`) formats.
  - Download full certificate chains as combined PEM bundles.
  - One-click copy for PEM strings, serial numbers, and fingerprints.
- Fast search and filtering across aliases, Common Names, SANs, and serial numbers.
- Responsive, modern UI with dark theme and high legibility.
- Bundled demo keystores (`sample-keystore.jks`, `sample-pkcs12.p12`, `expired-sample.jks`) for instant testing.
