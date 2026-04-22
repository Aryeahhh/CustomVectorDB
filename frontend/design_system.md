---
name: The Design System
colors:
  surface: '#1a120b'
  surface-dim: '#1a120b'
  surface-bright: '#42372f'
  surface-container-lowest: '#150c06'
  surface-container-low: '#231a13'
  surface-container: '#271e16'
  surface-container-high: '#322820'
  surface-container-highest: '#3e332b'
  on-surface: '#f2dfd3'
  on-surface-variant: '#dbc2b0'
  inverse-surface: '#f2dfd3'
  inverse-on-surface: '#392e26'
  outline: '#a38c7c'
  outline-variant: '#554336'
  surface-tint: '#ffb77d'
  primary: '#ffb77d'
  on-primary: '#4d2600'
  primary-container: '#d97707'
  on-primary-container: '#432100'
  inverse-primary: '#904d00'
  secondary: '#bcc7dd'
  on-secondary: '#263142'
  secondary-container: '#3c475a'
  on-secondary-container: '#aab6cc'
  tertiary: '#96ccff'
  on-tertiary: '#003353'
  tertiary-container: '#0297e8'
  on-tertiary-container: '#002c48'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#d8e3fa'
  secondary-fixed-dim: '#bcc7dd'
  on-secondary-fixed: '#111c2c'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#cee5ff'
  tertiary-fixed-dim: '#96ccff'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#004a75'
  background: '#1a120b'
  on-background: '#f2dfd3'
  surface-variant: '#3e332b'
typography:
  h1:
    fontFamily: IBM Plex Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: IBM Plex Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: '0'
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: -0.02em
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1'
    letterSpacing: '0'
  label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
spacing:
  unit: 4px
  gutter: 1px
  margin-sm: 8px
  margin-md: 16px
  margin-lg: 24px
  container-padding: 32px
---

## Brand & Style

This design system is built upon the principles of Swiss Modernism and the precise, utilitarian nature of architectural blueprints. The brand personality is clinical, objective, and rigorously organized, prioritizing the clarity of complex engineering data above all else.

The aesthetic leans heavily into **Minimalism** and **Modernism**, stripping away all non-functional decoration. It evokes an emotional response of absolute reliability and technical mastery. The interface should feel like a high-precision tool—cold, efficient, and mathematically sound. Every element is justified by its function within the grid, creating a layout that feels discovered rather than decorated.

## Colors

The palette is strictly functional, utilizing a high-contrast dark environment to reduce eye strain during deep work.

- **Background:** The base layer is a deep charcoal, providing a void-like canvas that allows technical data to recede or advance based on line weight.
- **Secondary UI:** Slate gray is used for structural elements, non-active icons, and secondary information, mimicking the "blueprint" guide-line feel.
- **Accent:** Burnt Orange is reserved exclusively for 'active' or 'warning' states. It is a high-visibility signal within the monochromatic environment and must be used sparingly to maintain its communicative power.
- **Borders:** A tertiary slate-dark shade is used for the 1px structural grid, ensuring the layout is visible but not distracting.

## Typography

Typography is used as a structural element. The system employs a hierarchy that distinguishes between narrative labels and technical data.

- **Headlines:** Set in **IBM Plex Sans** with heavy weights. These should feel architectural and grounded.
- **Body:** **Inter** provides a neutral, systematic bridge for general interface text, ensuring high legibility in dense configurations.
- **Technical Data:** All complexity scores, coordinates, and engineering values use **JetBrains Mono**. The fixed-width character set ensures that vertical columns of numbers align perfectly, reinforcing the grid-based logic of the design system.

## Layout & Spacing

This design system utilizes a **rigid, fixed-grid layout**. The interface is treated like a blueprint where every component is "locked" into a 1px border framework.

- **The Grid:** A 12-column system where modules are separated by 1px solid borders rather than empty gutters. 
- **Rhythm:** All margins and internal paddings must be multiples of the 4px base unit.
- **Alignment:** Elements should snap to the grid lines. There is no fluid "whitespace" in the traditional sense; instead, empty space is represented as empty grid cells, maintaining the structural integrity of the dashboard.

## Elevation & Depth

In keeping with the Swiss Modernist influence, this design system is **strictly flat**. 

- **No Shadows:** Physical metaphors like drop shadows or blurs are prohibited.
- **Tonal Layering:** Depth is communicated through subtle shifts in background color. The base is Deep Charcoal (#0F1115). Elevated panels or "hover" states use a slightly lighter shade of charcoal to indicate a step-up in the hierarchy.
- **Lines as Structure:** Visual separation is achieved through the 1px border. A double-line or a slightly brighter border color can be used to indicate a primary container, mimicking technical drawing conventions.

## Shapes

The shape language is absolute. All components—including buttons, inputs, cards, and modal windows—feature a **0px border-radius**. 

The use of sharp corners reinforces the engineering precision of the system and ensures that all 1px borders meet at perfect right angles. This creates a cohesive, interlocking appearance across the dashboard, where components feel like integrated modules of a single machine.

## Components

Components follow the "blueprint" philosophy: high contrast, zero radius, and thin strokes.

- **Buttons:** Rectangular with 1px borders (#4A5568). Text is uppercase labels. The 'active' state fills the background with Burnt Orange (#D97706) and switches text to the background charcoal for maximum contrast.
- **Inputs:** Simple boxes with a 1px border. On focus, the border changes to Burnt Orange. No glows or internal shadows.
- **Chips/Status Tags:** Sharp boxes. Use JetBrains Mono for the text within. Active states use the accent color; inactive states use a hollow 1px border.
- **Cards/Modules:** Defined by their 1px border. Headers within cards should be separated by a horizontal 1px line.
- **Data Tables:** No zebra striping. Use 1px horizontal and vertical dividers to create a spreadsheet-like engineering ledger. All numerical data must be right-aligned in JetBrains Mono.
- **Checkboxes:** Square, 0px radius, with a simple 'X' or solid fill for the checked state. Avoid checkmark symbols in favor of more "technical" marks.
