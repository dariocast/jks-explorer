# Design System

<!-- impeccable:design-schema 1 -->

## Visual World
**Material 3 Expressive (Dark Tonal System)** — A precision cryptographic workbench designed for security engineers, DevOps professionals, and Java developers. It pairs developer utility with Google Material 3 Expressive design tokens (dynamic tonal surface elevation, pill-shaped expressive chips, rounded floating elevation cards, and Google Sans / JetBrains Mono typography).

## Color System
- **Tonal Surface Hierarchy**:
  - `surface-container-lowest`: `#080b12`
  - `surface-container-low`: `#141924`
  - `surface`: `#10141d`
  - `surface-container`: `#1a202d`
  - `surface-container-high`: `#212838`
  - `surface-container-highest`: `#283144`
- **Outlines**:
  - `outline`: `#8c93a0`
  - `outline-variant`: `#343d4f`
- **Role Colors**:
  - **Primary (Electric Azure)**: `#80d5ff` (on-primary: `#00354e`, container: `#004c6e`, on-container: `#c3e7ff`)
  - **Secondary (Mint Emerald - Validity & Trust)**: `#6ce0a8` (on-secondary: `#003822`, container: `#005234`, on-container: `#89fec3`)
  - **Tertiary (Warm Amber - Expiring Soon)**: `#ffb950` (on-tertiary: `#452b00`, container: `#5f3e00`, on-container: `#ffddb3`)
  - **Error (Coral Rose - Expired / Alert)**: `#ffb4ab` (on-error: `#690005`, container: `#93000a`, on-container: `#ffdad6`)
  - **Key (Purple - Private Keys)**: `#d0bcff` (on-key: `#381e72`, container: `#4f378b`, on-container: `#eaddff`)

## Typography
- **Headings & Title Scale**: `Google Sans Flex`, `Inter`, sans-serif (700 / 600 weight, -0.02em letter spacing)
- **Body Text**: `Google Sans Flex`, `Inter`, sans-serif (400 / 500 weight, 1.5 line height)
- **Code & Hashes**: `JetBrains Mono`, monospace (400 / 500 / 600 weight)

## Shapes & Radii
- **Full Pill (`9999px`)**: Filter chips, status tags, action buttons, tab indicators.
- **Extra Large (`24px`)**: Modal dialogs, primary dropzone box.
- **Large (`16px`)**: Surface panels, summary banner, detail section cards.
- **Medium (`12px`)**: Entry list item cards, sample cards, brand icon.
- **Small (`8px`)**: Monospace serial and fingerprint containers.

## Component Language
1. **Top App Bar**: Elevated tonal bar containing brand lockup, privacy badge pill, and action buttons.
2. **Expressive Chips**: Pill-shaped filter and metadata chips with dynamic active container fills.
3. **Master-Detail Workspace**: Fluid viewport-height split panel with independent scroll containers.
4. **Certificate Trust Tree**: Interactive numbered nodes visualizing CA hierarchy from Root to Leaf.
5. **Contextual Dialogs**: Smooth animated dialogs with backdrop blur for password unlock and keyboard shortcuts.
