# Design System

<!-- impeccable:design-schema 1 -->

## Visual World
**shadcn/ui (Zinc / Dark Modern)** — An ultra-clean, modern, minimalist developer interface built on the authentic `shadcn/ui` component architecture. Features subtle border micro-interactions (`hsl(var(--border))`), zinc-dark tonal surfaces (`hsl(240 10% 3.9%)`), Geist typography, pill tabs, rounded-md cards, and crisp semantic badges.

## Color System (HSL)
- `background`: `hsl(240 10% 3.9%)` (#09090b)
- `foreground`: `hsl(0 0% 98%)` (#fafafa)
- `card`: `hsl(240 10% 3.9%)`
- `card-foreground`: `hsl(0 0% 98%)`
- `popover`: `hsl(240 10% 3.9%)`
- `popover-foreground`: `hsl(0 0% 98%)`
- `primary`: `hsl(0 0% 98%)`
- `primary-foreground`: `hsl(240 5.9% 10%)`
- `secondary`: `hsl(240 3.7% 15.9%)`
- `secondary-foreground`: `hsl(0 0% 98%)`
- `muted`: `hsl(240 3.7% 15.9%)`
- `muted-foreground`: `hsl(240 5% 64.9%)`
- `accent`: `hsl(240 3.7% 15.9%)`
- `accent-foreground`: `hsl(0 0% 98%)`
- `destructive`: `hsl(0 62.8% 30.6%)`
- `destructive-foreground`: `hsl(0 0% 98%)`
- `border`: `hsl(240 3.7% 15.9%)`
- `input`: `hsl(240 3.7% 15.9%)`
- `ring`: `hsl(240 4.9% 83.9%)`
- `radius`: `0.5rem` (8px)

## Typography
- **Primary Interface**: `Geist`, `Inter`, sans-serif (weights: 400, 500, 600, 700 with `-0.02em` tracking)
- **Monospace & Hashes**: `Geist Mono`, `JetBrains Mono`, monospace (weights: 400, 500, 600)

## Component Library
1. **Navbar & Header**: Blurred translucent top bar (`bg-background/95 backdrop-blur`) with version Badge, status pill, and outline action buttons.
2. **Cards (`.card`)**: 1px subtle zinc border with crisp rounded corners, structured `.card-header`, `.card-title`, and `.card-content`.
3. **Buttons (`.btn`)**: Variants for `default`, `secondary`, `outline`, `ghost`, and `destructive`.
4. **Badges (`.badge`)**: Compact pill badges (`default`, `secondary`, `outline`, `success`, `warning`, `destructive`).
5. **Tabs**: Pill tab triggers with active white bottom borders and subtle hover states.
6. **Data Tables (`.shadcn-table`)**: Minimalist table headers with subtle row hover effects.
7. **Modals & Dialogs**: Clean modal overlay with blurred backdrop, rounded-lg dialog content, and footer actions.
