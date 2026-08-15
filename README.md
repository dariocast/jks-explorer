# JKS Explorer

A fast, lightweight, modern, and **100% client-side** Java KeyStore (`.jks`, `.keystore`, `.jceks`) and PKCS#12 (`.p12`, `.pfx`) explorer and certificate analyzer.

![JKS Explorer](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Security](https://img.shields.io/badge/security-100%25%20client--side-emerald.svg)

---

## Key Features

- 🔒 **100% Client-Side Privacy**: All parsing, hashing, and ASN.1 / X.509 decoding happen entirely inside your browser's Web Cryptography engine. Zero files or secrets are ever transmitted over the network.
- 🗂️ **Multi-Format Keystore Support**:
  - **Java KeyStore (`.jks`, `.keystore`)**
  - **Java Cryptography Extension KeyStore (`.jceks`)**
  - **PKCS#12 (`.p12`, `.pfx`)**
  - Direct Certificate & PEM Inspection
- 🔑 **Deep Certificate Inspection**:
  - **Subject & Issuer**: Parsed DN attributes (CN, O, OU, L, ST, C, email).
  - **Subject Alternative Names (SANs)**: Formatted DNS, IP, and URI lists.
  - **Validity & Status**: Active, Expiring Soon, Expired, and timeline countdowns.
  - **Key Specifications**: RSA (1024/2048/4096-bit), ECC (P-256/P-384/P-521), DSA, Public Exponents.
  - **Extensions**: Key Usage, Extended Key Usage (EKU), Basic Constraints (CA flag, Path Length), Subject/Authority Key IDs (SKID/AKID), CRL Distribution Points, OCSP URLs.
  - **Thumbprints / Hashes**: Instant calculation of SHA-256, SHA-1, and MD5 fingerprints.
- 🌳 **Certificate Hierarchy & Chain Viewer**: Visual representation of trust paths from Root CAs down to Leaf / End-Entity certificates.
- 🛡️ **Integrity Verification**: Automatic SHA-1 JKS digest verification with provided keystore passwords.
- 📤 **Export & Download**:
  - Download individual certificates in **PEM (`.crt` / `.pem`)** or binary **DER (`.cer`)**.
  - Download complete certificate chains as a combined `.pem` bundle.
  - One-click copy for PEM, Serial Numbers, and SHA-256/SHA-1 fingerprints.
- 🧪 **Pre-loaded Demo Samples**: Quick-test buttons with sample JKS and PKCS12 keystores.

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+)

### Installation

```bash
# Clone or navigate to the repository
cd jks-explorer

# Install dependencies
npm install
```

### Running Locally

```bash
# Start local development server
npm run dev
```

Then open your browser at `http://localhost:3000`.

### Building Production Bundle

```bash
# Compile and build production-ready static assets
npm run build

# Preview production build locally
npm run preview
```

The output bundle will be generated in the `dist/` directory, which can be served with any static HTTP server or opened directly in a browser.

---

## Project Structure

```
jks-explorer/
├── public/
│   └── samples/              # Pre-generated sample JKS & PKCS12 files for testing
│       ├── sample-keystore.jks
│       ├── sample-pkcs12.p12
│       └── expired-sample.jks
├── src/
│   ├── components/           # UI components
│   │   ├── CertificateDetail.tsx
│   │   ├── EntryList.tsx
│   │   ├── FileDropzone.tsx
│   │   ├── Header.tsx
│   │   └── KeystoreSummary.tsx
│   ├── core/                 # Core binary & crypto parsers
│   │   ├── cert-analyzer.ts  # X.509 parser, extensions & thumbprints
│   │   ├── jks-parser.ts     # Binary JKS parser & integrity check
│   │   ├── pkcs12-parser.ts  # PKCS#12 / PFX parser
│   │   └── parser.ts         # Unified auto-detect entrypoint
│   ├── styles/               # Design system & CSS styles
│   │   └── index.css
│   ├── types/                # TypeScript type definitions
│   │   └── keystore.ts
│   ├── utils/                # Exporters & clipboard utils
│   │   └── export.ts
│   ├── App.tsx               # Main application component
│   └── main.tsx              # Application entrypoint
├── package.json              # Version 1.0.0 configuration
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite bundler configuration
```

---

## License

MIT © 2026 Dario Castellano
