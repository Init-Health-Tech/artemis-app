---
name: INIT Core
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#383939'
  surface-container-lowest: '#0d0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2a'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c0c9bc'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#8a9387'
  outline-variant: '#41493f'
  surface-tint: '#93d695'
  primary: '#93d695'
  on-primary: '#003911'
  primary-container: '#6aab6e'
  on-primary-container: '#003d13'
  inverse-primary: '#2b6b35'
  secondary: '#8bd88e'
  on-secondary: '#003910'
  secondary-container: '#02581d'
  on-secondary-container: '#81cd84'
  tertiary: '#ffb954'
  on-tertiary: '#452b00'
  tertiary-container: '#d18f27'
  on-tertiary-container: '#4a2e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#aef3af'
  primary-fixed-dim: '#93d695'
  on-primary-fixed: '#002107'
  on-primary-fixed-variant: '#0e5220'
  secondary-fixed: '#a6f5a8'
  secondary-fixed-dim: '#8bd88e'
  on-secondary-fixed: '#002106'
  on-secondary-fixed-variant: '#00531b'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#ffb954'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
  mono-data:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter-md: 16px
  margin-lg: 24px
  sidebar-width: 260px
  header-height: 64px
---

## Brand & Style

This design system is engineered for high-stakes agrifood and livestock management. The brand personality is authoritative, precise, and utilitarian, designed to handle high-density data without visual fatigue. 

The aesthetic follows a **Modern Corporate** approach with a focus on **High-Density Analytics**. It prioritizes information hierarchy and functional clarity over decorative elements. By utilizing a dark, sophisticated palette, the interface reduces glare for operators in both field and office environments. The visual language is intentionally "technical-premium"—avoiding soft or playful motifs in favor of sharp, data-driven components that signify reliability and enterprise scale.

## Colors

The palette is rooted in an "Earth-Industrial" dark mode. The primary background (`#0f1111`) provides a deep, near-black canvas that allows data points to pop.

- **Primary & Init-Green:** Used for high-priority actions, active states, and brand presence. These greens signify growth and health in a livestock context.
- **Surface Tiers:** `surface-container` is used for cards and modular sections to create subtle depth against the background.
- **Functional Colors:** `error` and `warning` are reserved for critical alerts (e.g., animal health risks, supply chain bottlenecks) and must be used sparingly to maintain their urgency.
- **Typography:** Primary text (`on-surface`) uses a high-contrast off-white to ensure legibility, while `on-surface-variant` reduces visual noise for metadata and captions.

## Typography

The typography system uses **Inter** for its exceptional legibility in data-heavy environments. 

- **Scale:** A tight scale ensures that large amounts of information can fit on a single screen without sacrificing hierarchy.
- **Weight:** Semi-bold and Bold weights are used for headers to anchor sections, while Regular weight is reserved for body text to maintain a clean appearance.
- **Labels:** Small, all-caps labels with slight letter spacing are used for table headers and section overviews to differentiate them from interactive data.
- **Numeric Data:** For tabular data and KPI values, consider using tabular figures (tnum) to ensure vertical alignment of digits.

## Layout & Spacing

The layout is **Desktop-First**, utilizing a 12-column fluid grid system optimized for 1440px+ displays.

- **Grid Model:** 24px outer margins with 16px gutters between columns.
- **Sidebar:** A fixed 260px left navigation provides persistent access to global modules (Herd Management, Analytics, Supply Chain).
- **Top Bar:** A 64px tall global header contains the breadcrumbs and a centralized search bar for rapid entity lookups.
- **Density:** This system uses a 4px baseline grid. Compact spacing is encouraged in data tables to allow more rows to be visible above the fold.

## Elevation & Depth

In this dark-themed system, depth is communicated through **Tonal Layering** rather than heavy shadows.

- **Level 0 (Background):** `#0f1111` for the main canvas.
- **Level 1 (Surfaces):** `#1a1d1d` for cards, sidebar, and container elements.
- **Level 2 (Interactive):** Elements that hover or require focus use a subtle `outline` (`#5a635c`) or a slight lightening of the surface color.
- **Outlines:** Low-contrast borders are the primary method for defining boundaries between components, maintaining a "flat-yet-structured" look.
- **Overlays:** Modals and dropdowns use a 40% black backdrop blur to maintain context while focusing the user.

## Shapes

The shape language is **Soft (0.25rem)**. This provides a professional, "tooled" look that feels modern but remains grounded and efficient. 

- **Standard Elements:** Buttons, inputs, and small cards use a 4px radius.
- **Large Components:** Dashboard containers and modals can scale to a 8px (`rounded-lg`) radius to slightly soften the technical edge.
- **Interactive States:** Focus states should mirror the element's border radius exactly with a 2px offset.

## Components

### Data Tables
Tables are the core of this system. They must support high-density viewing.
- **Styling:** No vertical borders; horizontal borders use `outline` color. 
- **Row Height:** 40px (Compact) or 48px (Standard).
- **Header:** Sticky headers with `label-lg` typography.

### KPI Cards
- **Structure:** Metric name (Label), Primary Value (Title-LG), and a Sparkline visualization.
- **Sparklines:** Use `primary` green for positive trends and `error` red for negative trends.

### Buttons & Chips
- **Primary Button:** Filled with `primary-container`, text in `on-primary-container`.
- **Status Badges:** Use a "dot + label" pattern. The dot color reflects the status (e.g., Green for Healthy, Amber for Quarantine).

### Navigation & Search
- **Sidebar:** Icons should be simple 24px strokes. Active states use a left-accent border in `primary`.
- **Search:** The global search in the top bar should support "Jump to" functionality for specific livestock IDs or batch numbers.

### Inputs
- **Style:** Filled `surface-container` with a bottom-border `outline`. Focus state changes the bottom border to `primary`.