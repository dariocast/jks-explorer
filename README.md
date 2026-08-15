# JKS Explorer

A fast, lightweight, modern, and **100% client-side** Java KeyStore (`.jks`, `.keystore`, `.jceks`) and PKCS#12 (`.p12`, `.pfx`) explorer and certificate analyzer built with the **shadcn/ui** design system supporting **Light and Dark mode** (Default: Light).

![JKS Explorer](https://img.shields.io/badge/version-1.3.1-black.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Style](https://img.shields.io/badge/style-shadcn%2Fui-zinc.svg)
![Theme](https://img.shields.io/badge/theme-Light%20%26%20Dark-blue.svg)
![Security](https://img.shields.io/badge/security-100%25%20client--side-emerald.svg)

---

## Key Features

- 🌓 **Light & Dark Mode**: Seamless toggling between clean Light theme (default) and Zinc Dark theme with persistent preference storage.
- ⚡ **shadcn/ui Design System**: Built with authentic shadcn/ui components (Cards, Tabs, Badges, Tables, Inputs, and Dialogs) and Geist typography.
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
- ⌨️ **Keyboard Navigation & Power Tools**: `/` or `Cmd+K` for instant search, `↓/↑` or `j/k` for list navigation, `1-5` for tab switching, and `?` for shortcuts reference.
- 📦 **Export & Download**:
  - Download all certificates across the entire keystore as a formatted **`.zip`** bundle.
  - Download individual certificates in **PEM (`.crt` / `.pem`)** or binary **DER (`.cer`)**.
  - One-click copy for PEM, Serial Numbers, and SHA-256/SHA-1 fingerprints.
- 🧪 **Pre-loaded Demo Samples**: Quick-test buttons with sample JKS and PKCS12 keystores.

---

## Live Demo

Experience the live application hosted on GitHub Pages:  
👉 **[https://dariocast.github.io/jks-explorer/](https://dariocast.github.io/jks-explorer/)**

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+)

### Installation

```bash
# Clone the repository
git clone https://github.com/dariocast/jks-explorer.git
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

---

## License

MIT © 2026 Dario Castellano
