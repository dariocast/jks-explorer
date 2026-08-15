# Design System

<!-- impeccable:design-schema 1 -->

## Visual World
**Google Cloud Security Console (Material 3 Precision)** — An enterprise cryptographic workbench inspired by Google Cloud KMS and security consoles. It replaces generic template clichés with high-density data tables, NIST cryptographic security posture ratings, an interactive certificate lifecycle timeline bar, and genuine Google Cloud dark surface tokens.

## Color System
- **Surfaces**:
  - Background: `#12151c`
  - Card & Panels: `#181c26`
  - Hover Surface: `#1e2330`
  - Active Surface: `#252c3c`
  - Borders: `#283042` / Subtle: `#202737`
- **Google Cloud Accents**:
  - Blue (Primary): `#8ab4f8` / Container: `rgba(138, 180, 248, 0.12)`
  - Green (Security / Strong / Valid): `#81c995` / Container: `rgba(129, 201, 149, 0.12)`
  - Yellow (Warning / Expiring): `#fdd663` / Container: `rgba(253, 214, 99, 0.12)`
  - Red (Deprecated / Expired / Error): `#f28b82` / Container: `rgba(242, 139, 130, 0.14)`
  - Purple (Private Keys): `#c58af9` / Container: `rgba(197, 138, 249, 0.12)`

## Typography
- **Primary Interface**: `Plus Jakarta Sans` / `Google Sans` (700 / 600 weight, tight tracking)
- **Data & Hashes**: `JetBrains Mono` (400 / 500 / 600 weight)

## Layout & Components
1. **Console Top App Bar**: Compact header with brand logo, client-side environment badge, and quick action buttons.
2. **Cryptographic Posture & Audit Card**: NIST algorithm strength assessment, deprecation warnings, and interactive validity timeline bar.
3. **Enterprise Key-Value Tables**: Clean, high-contrast 2-column tables with monospace values and single-click copy buttons.
4. **Interactive Certificate Chain**: Visual tree hierarchy from Root CA down to Leaf node.
