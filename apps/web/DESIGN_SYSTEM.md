# CA Career OS — Design System & UI Engineering Foundation

## 1. Overview & Architectural Philosophy

CA Career OS is built with a light-first, institutional executive aesthetic designed specifically for the Chartered Accountancy and financial advisory profession in India.

The design embodies:
- **Institutional Trust**: Grounded in ICAI standards, Companies Act, Ind AS, and formal financial workflow precision.
- **Calm, Human-Centred Readability**: Soft slate/neutral surfaces (`#F7F8FA`, `#FFFFFF`, `#F1F3F5`) with crisp deep slate text (`#0F172A`, `#475569`) preventing eye strain during long analytical sessions.
- **Purpose-Driven Layout Diversity**: Avoids generic "card grids everywhere". Forms use structured field groups, dense data uses data tables with hairline borders, timelines use structured milestone tracks, and job discovery uses scannable rows.
- **Accessibility & Contrast**: Built to exceed WCAG 2.2 AA standards (minimum 4.5:1 contrast for normal text, 3:1 for large text and interactive components).

---

## 2. Palette & Design Tokens

### Core Colors
| Token | CSS Variable | Hex / Value | Semantic Role |
|---|---|---|---|
| Main Background | `--page-background` | `#F7F8FA` | Base app canvas |
| Primary Surface | `--surface-primary` | `#FFFFFF` | Core workspace containers & sheets |
| Secondary Surface | `--surface-secondary` | `#F1F3F5` | Muted wells, table headers, inactive tabs |
| Surface Hover | `--surface-hover` | `#EBF0F6` | Interactive row/cell hover |
| Primary Text | `--text-primary` | `#0F172A` | Deep executive slate headings and body |
| Secondary Text | `--text-secondary` | `#475569` | Balanced descriptive body & labels |
| Muted Text | `--text-muted` | `#64748B` | Subtle metadata and captions |
| Brand Navy | `--brand-primary` | `#173F8A` | Primary actions, branding, active states |
| Brand Navy Hover | `--brand-primary-hover` | `#123370` | Button & active link hover |
| Interactive Blue | `--brand-interactive` | `#2457A7` | Focus rings & primary links |
| Brand Soft Surface | `--brand-soft` | `#F0F4FA` | Active nav items, highlighted badges |
| Subtle Border | `--border-subtle` | `#E1E5EA` | Hairline dividers, card outlines |
| Strong Border | `--border-strong` | `#CBD5E1` | Inputs, interactive control borders |
| Success Text | `--success-text` | `#237A4B` | Verified status, passed audit checks |
| Success Surface | `--success-surface` | `#E7F4EB` | Verified badge & alert background |
| Warning Text | `--warning-text` | `#966314` | Pending verification, deadline warnings |
| Warning Surface | `--warning-surface` | `#FEF9C3` | Advisory notice background |
| Danger Text | `--danger-text` | `#B42332` | Critical alerts, validation errors |
| Danger Surface | `--danger-surface` | `#FEE2E2` | Error banners |

### Typography Scale
- **Headings**:
  - H1 / Page Titles: `28px – 32px` (`font-bold`, `-0.02em` letter spacing)
  - H2 / Section Titles: `20px – 24px` (`font-semibold`, `-0.015em`)
  - H3 / Panel Titles: `16px – 18px` (`font-semibold`, `-0.01em`)
- **Body & Inputs**:
  - Standard Body: `14px – 15px` (`line-height: 1.55 – 1.62`)
  - Form Inputs & Selects: `14px` (`padding: 0.625rem 0.875rem`, `min-height: 40px`)
  - Metadata / Badges: `12px – 13px` (`font-medium` or `font-semibold`)

### Elevation & Radii
- **Radii**:
  - Compact inputs & buttons: `6px – 8px` (`--radius-sm`, `--radius-md`)
  - Surface cards & data tables: `12px` (`--radius-lg`)
  - Hero banners & modal dialogs: `16px` (`--radius-xl`)
  - Pills & status chips: `9999px` (`--radius-pill`)
- **Shadows**:
  - Resting cards: `0 1px 3px rgba(15, 23, 42, 0.06)`
  - Elevated dropdowns / popovers: `0 10px 25px -3px rgba(15, 23, 42, 0.1)`

---

## 3. Reusable `shadcn/ui` Component Standards

The official `shadcn/ui` foundation is located in `apps/web/src/components/ui/` and is integrated with Tailwind CSS:

1. **Button (`button.tsx`)**:
   - Variants: `default`, `secondary`, `outline`, `ghost`, `link`, `destructive`
   - Sizes: `default` (40px), `sm` (36px), `lg` (44px), `pill`, `icon`
2. **Card (`card.tsx`)**:
   - Composed of `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
3. **Badge (`badge.tsx`)**:
   - Semantic variants: `default`, `secondary`, `success`, `warning`, `info`, `ca`, `outline`, `destructive`.
4. **Input (`input.tsx`) & Label (`label.tsx`) & Textarea (`textarea.tsx`)**:
   - Radix-backed, accessible labels with consistent focus rings (`focus-visible:ring-brand-primary`).
5. **Dialog (`dialog.tsx`)**:
   - Modal primitive with backdrop blur, keyboard ESC dismissal, trapped focus, and screen-reader accessibility.
6. **DropdownMenu (`dropdown-menu.tsx`)**:
   - Full keyboard navigation, menu items, separators, and shortcuts.
7. **Tabs (`tabs.tsx`)**:
   - Accessible tabs for segmenting workflows (e.g. Explore / Saved / Applications).
8. **Tooltip (`tooltip.tsx`)**:
   - Contextual guidance for dense data items and icons.
9. **Table (`table.tsx`)**:
   - Standard tabular representation for dense data (audits, client masters, invoices).
10. **Avatar (`avatar.tsx`)**:
    - User/firm avatars with initials fallback.
11. **Skeleton (`skeleton.tsx`)**:
    - Pulse loading placeholders that preserve layout geometry.

---

## 4. Conventions for Developers

1. **Inspect Before Adding**: Always reuse components from `@/components/ui` rather than writing inline duplicates.
2. **Use `cn()` Utility**: Use `cn(...)` from `@/lib/utils` for merging class names.
3. **Preserve Real Business Logic**: Never replace real APIs or auth states with fake front-end data.
4. **Enforce Accessibility**:
   - All interactive controls must have accessible names.
   - Text inputs must have visible, persistent `<Label>` associations.
   - Focus rings must be visible (`focus-visible:ring-2`).
5. **Respect Reduced Motion**: Always ensure CSS transitions respect `@media (prefers-reduced-motion: reduce)`.
