# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Developers, DevOps engineers, SysAdmins, and Security Engineers who manage, debug, and configure Java KeyStores (`.jks`, `.keystore`, `.jceks`) and PKCS#12 (`.p12`, `.pfx`) files, needing to inspect certificate validity, SANs, trust chains, and thumbprints securely without uploading secrets to third-party servers.

## Product Purpose
Provide an instantaneous, zero-install, 100% client-side web application to explore, decode, and analyze Java KeyStores and X.509 certificates with strict local privacy.

## Positioning
Unlike desktop-only software (such as legacy Java GUI KeyStore Explorer) or CLI `keytool`, JKS Explorer runs in any modern browser on any OS with zero installation, instant startup, and zero network transmission of cryptographic material.

## Operating Context
Used during SSL/TLS certificate provisioning, microservice authentication debugging, certificate expiry audits, SAN validation, trust chain verification, and certificate extraction.

## Capabilities and Constraints
- **Supported Formats**: Sun JKS (`0xfeedfeed`), JCEKS (`0xcececece`), PKCS#12 (`.p12`, `.pfx`), standalone DER/PEM certificates.
- **Certificate Inspection**: Subject/Issuer DNs, Subject Alternative Names (DNS/IP/Email/URI), Key specs (RSA 1024-4096, ECC P-256/P-384/P-521, DSA), Validity timelines & expiration countdowns, X.509 v3 Extensions, Fingerprints (SHA-256, SHA-1, MD5), and visual Certificate Chain hierarchies.
- **Integrity**: SHA-1 message digest verification for password-protected JKS files.
- **Exporting**: Download PEM (`.crt`/`.pem`), binary DER (`.cer`), combined full-chain bundles, and 1-click clipboard copy.
- **Constraints**: 100% client-side execution using browser Web Crypto API and pure JavaScript/TypeScript parsers. No backend server or cloud storage.

## Brand Commitments
- **Name**: JKS Explorer
- **Tagline**: Client-Side Java KeyStore & PKCS12 Certificate Explorer
- **Voice**: Technical, precise, trustworthy, focused on privacy and developer productivity.
- **Privacy Commitment**: "100% Client-Side / Zero Uploads".

## Evidence on Hand
- Production-ready web application built with React, TypeScript, and Vite in `src/`.
- Automated test suite in `test/verify.ts` verifying Sun JKS, PKCS12, SANs, and expired certificate handling.
- Bundled sample keystores in `public/samples/`.

## Product Principles
1. **Absolute Local Privacy**: No keystore byte, password, or private key ever leaves the user's browser.
2. **Fast & Frictionless**: Drag, drop, and inspect in milliseconds with intuitive search and zero bloat.
3. **Deep Information Hierarchy**: Present complex ASN.1/X.509 cryptographic attributes with high legibility, accessible contrast, and instant scannability.
4. **Export & Workflow Versatility**: Make extracting certificates, chains, serial numbers, and thumbprints single-click operations.
