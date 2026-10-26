# CA Career OS — Design System Specification

**Document Reference:** `docs/design/DESIGN-SYSTEM.md`  
**Version:** 2.0 (Executive Human-Centric Redesign)  
**Target:** Next.js Frontend (`apps/web`)  

---

## 1. Visual Philosophy & Foundations

CA Career OS is an executive career platform built specifically for Chartered Accountants, corporate finance leaders, and hiring partners. 

### Core Tenets
1. **Light-First Eye Comfort:** Built on calm alabaster paper tones (`#F8F9FA`) and pure white cards (`#FFFFFF`) with deep slate charcoal typography (`#0F172A`).
2. **Zero Neon Glare:** Banned electric cyans, neon purples, and high-saturation radial glowing blobs.
3. **Information Architecture Density:** Generous 16px to 24px container padding, tabular numerals for currency figures, and distinct surface elevation without card-inside-card clutter.
4. **WCAG 2.2 AA Contrast Compliance:** Every text color exceeds 4.5:1 contrast against its background surface (Normal text at 14.5:1, secondary text at 5.8:1).

---

## 2. Color Palette & Semantic Tokens

### Primary Theme Tokens (CSS Custom Properties)

```css
:root {
  /* Page & Surface Layers */
  --page-background: #F8F9FA;
  --surface-primary: #FFFFFF;
  --surface-secondary: #F1F5F9;
  --surface-hover: #E2E8F0;
  --surface-card: #FFFFFF;

  /* Typography Colors */
  --text-primary: #0F172A;     /* Slate 900 - Contrast 14.5:1 */
  --text-secondary: #475569;   /* Slate 600 - Contrast 5.8:1 */
  --text-muted: #64748B;       /* Slate 500 - Contrast 4.6:1 */

  /* Executive Brand Accents */
  --brand-primary: #1E3A8A;       /* Executive Navy (Blue 900) */
  --brand-primary-hover: #172554; /* Navy Dark (Blue 950) */
  --brand-soft: #EFF6FF;          /* Blue 50 */
  --brand-teal: #0F766E;          /* Deep Teal (Teal 700) */
  --brand-teal-soft: #F0FDFA;     /* Teal 50 */

  /* Borders & Dividers */
  --border-subtle: #E2E8F0;    /* Slate 200 */
  --border-strong: #CBD5E1;    /* Slate 300 */
  --border-focus: #1E3A8A;

  /* Status Colors */
  --success-text: #166534;     /* Green 800 */
  --success-surface: #DCFCE7;  /* Green 100 */
  --warning-text: #854D0E;     /* Yellow 800 */
  --warning-surface: #FEF9C3;  /* Yellow 100 */
  --danger-text: #991B1B;      /* Red 800 */
  --danger-surface: #FEE2E2;   /* Red 100 */

  /* Elevation Shadows */
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04);
}
```

---

## 3. Typography Scale & Hierarchy

Using the modern sans-serif system stack (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `sans-serif`):

| Level | Size | Weight | Line Height | Tracking | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `2.5rem - 3.25rem` (40–52px) | 800 | 1.15 | `-0.03em` | Public Homepage Hero Headline |
| **Section H2** | `1.75rem - 2.25rem` (28–36px) | 700 | 1.25 | `-0.02em` | Main section headings |
| **Module H1** | `1.5rem - 1.75rem` (24–28px) | 700 | 1.3 | `-0.015em` | Authenticated App Page Titles |
| **Card H3** | `1.125rem` (18px) | 600 | 1.4 | `-0.01em` | Job titles, metric card labels |
| **Body Large** | `1.0625rem` (17px) | 400 / 500 | 1.6 | `normal` | Hero subtext, lead paragraphs |
| **Body Standard** | `0.9375rem` (15px) | 400 / 500 | 1.55 | `normal` | Application forms, tables, card copy |
| **Caption / Meta** | `0.8125rem` (13px) | 500 | 1.45 | `normal` | Secondary timestamps, helper labels |
| **Micro Badge** | `0.6875rem` (11px) | 700 | 1.2 | `+0.05em` | Pathway badges, status tags (uppercase) |

---

## 4. Spacing, Radii & Layout Grid

### Spacing Scale
- `0.25rem` (4px): Micro padding
- `0.5rem` (8px): Icon-text gap, compact button padding
- `0.75rem` (12px): Standard form gap
- `1rem` (16px): Standard card padding (mobile)
- `1.5rem` (24px): Standard card padding (desktop)
- `2rem` (32px): Section separation
- `3rem` (48px): Page section rhythm

### Corner Radii
- `--radius-sm: 6px`: Badges, tags, filter chips
- `--radius-md: 8px`: Form inputs, standard buttons
- `--radius-lg: 12px`: Cards, dialogs, drawers
- `--radius-xl: 16px`: Hero callout banners

### Viewport Breakpoints
- **Mobile Small:** `360px`
- **Mobile Standard:** `390px`
- **Tablet Portrait:** `768px` (Sidebar collapses into Drawer)
- **Laptop / Small Desktop:** `1024px`
- **Standard Desktop:** `1280px`
- **Wide Monitor:** `1440px` (Max content container `1240px`)

---

## 5. Standard Component Patterns

1. **Buttons (`.btn`):**
   - Primary: Deep Navy background (`#1E3A8A`), white text, 8px radius, subtle hover elevation.
   - Secondary: White background, subtle border (`#E2E8F0`), slate text (`#0F172A`), hover background `#F8F9FA`.
   - Subtle / Ghost: Transparent background, hover tint `#F1F5F9`.
   - Destructive: `#DC2626` text with `#FEE2E2` surface.
2. **Form Controls (`.input`, `.select`):**
   - Background `#FFFFFF`, border `1px solid #CBD5E1`, padding `0.625rem 0.875rem`, text `#0F172A`, placeholder `#94A3B8`.
   - Focus state: `box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.15); border-color: #1E3A8A;`.
3. **Status Badges (`.badge`):**
   - Success: `bg: #DCFCE7, text: #166534`.
   - Warning: `bg: #FEF9C3, text: #854D0E`.
   - Neutral / Info: `bg: #F1F5F9, text: #475569`.
   - Brand: `bg: #EFF6FF, text: #1E3A8A`.
