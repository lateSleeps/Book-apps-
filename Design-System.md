# Rara Beauty — Design System
**Version 1.0** · Extracted from approved booking mockup · May 2026

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [Border Radius](#5-border-radius)
6. [Elevation & Shadow](#6-elevation--shadow)
7. [Component Library](#7-component-library)
8. [Iconography](#8-iconography)
9. [Motion & Animation](#9-motion--animation)
10. [Layout & Grid](#10-layout--grid)
11. [Accessibility](#11-accessibility)

---

## 1. Design Principles

Rara Beauty's design system is built on four principles that inform every decision — from token values to interaction patterns.

### Calm Confidence
The UI should feel trustworthy and unhurried. Avoid aggressive visual noise: no heavy drop shadows, no saturated accent colors fighting for attention, no red urgency. Every screen should feel like walking into a well-kept salon — clean, quiet, professional.

### Progressive Disclosure
Show only what's needed at each step. The booking flow has two distinct phases — selecting a date and service, then selecting a stylist and time. These phases are kept separate so the user is never overwhelmed. Information appears as it becomes relevant, not all at once.

### Touch-First Precision
Every interactive target is at minimum 44×44px. Tap states give immediate visual feedback (scale or color change within 140ms). No reliance on hover states for critical information. The mobile shell is 430px max-width, matching the largest common phone viewport.

### Honest Minimalism
Decorative elements exist only to aid comprehension or create warmth — not to fill space. The pastel service card palette and organic blob shapes create friendliness without clutter. When in doubt, remove.

---

## 2. Color Palette

All colors are defined as CSS custom properties on `:root`. Every component references these tokens — never raw hex values in component code.

### 2.1 Primary (Accent) Colors

| Token | Hex | Usage |
|---|---|---|
| `--accent` | `#4a9b7f` | Primary interactive color — selected states, links, active borders, available dots |
| `--accent-dark` | `#2d7a5f` | Hover states, selected text on light surfaces |
| `--accent-soft` | `#edf7f3` | Tinted backgrounds — available time slots, selected card tint, hover fill |

**Rationale:** A sage/teal green at medium saturation. Warm enough to feel organic (appropriate for a beauty brand), desaturated enough to avoid clinical harshness. The three-token pattern (base / dark / soft) covers all interaction states without introducing new hues.

### 2.2 Neutral Colors

| Token | Hex | Role | Usage |
|---|---|---|---|
| `--label` | `#111110` | Primary text | Headings, body copy, primary button background |
| `--label2` | `#605f5b` | Secondary text | Descriptions, subtitles, secondary body |
| `--label3` | `#a09f9a` | Tertiary / placeholder | Section labels, metadata, disabled states |
| `--sep` | `#e8e7e3` | Separator / subtle fill | Borders, dividers, ghost button background |
| `--surface` | `#ffffff` | Component background | Cards, modals, sheets, input backgrounds |
| `--bg` | `#f7f7f5` | App background | Page background, topbar, time slot default fill |

**Color temperature:** All neutrals carry a very slight warm cast (the red channel is marginally higher than blue/green). This prevents the UI from feeling cold or clinical — fitting for a beauty/wellness context.

### 2.3 Service Card Palette

Six pastel colors are used exclusively for service category cards. They are never used for interactive states or text — only as card backgrounds and their corresponding blob accent.

| Token | Hex | Card Color | Blob Accent | Service |
|---|---|---|---|---|
| `--c-peach` | `#fde8dc` | Peach | `#f5c4ab` | Potong Rambut |
| `--c-blue` | `#ddedf8` | Sky Blue | `#b8d6f0` | Coloring |
| `--c-mauve` | `#eddde9` | Mauve | `#d9bbd6` | Korean Perm |
| `--c-yellow` | `#fef3c2` | Butter Yellow | `#f5d98a` | Perawatan |
| `--c-mint` | `#d8f3ec` | Mint | `#a8e6d4` | Nail Art |
| `--c-lilac` | `#e8e2f8` | Lilac | `#c8bef0` | Facial |

Each card color pairs with a slightly darker variant for its floating blob shape, creating gentle depth without introducing new hues.

### 2.4 Semantic Colors

| Concept | Color | Token |
|---|---|---|
| Today indicator | `#111110` (black circle) | `--label` |
| Fully booked / unavailable | `--label3` + strikethrough | Muted state |
| Available date dot | `#4a9b7f` | `--accent` |
| Selected date | `#4a9b7f` circle | `--accent` |
| Booked stylist | `opacity: 0.55` + grayscale | CSS filter |

---

## 3. Typography

**Font family:** DM Sans — geometric humanist sans-serif, weights 400–700.

```
font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
```

### 3.1 Type Scale

Aligned with **Apple HIG** and **WCAG AA** minimums. All interactive text ≥ 12px. Body text ≥ 15px. Negative letter-spacing on large sizes, positive on small uppercase.

#### Semantic tokens (use these)

| Token | Class | Size | Line-height | Tracking | Usage |
|---|---|---|---|---|---|
| Caption 2 | `text-ts-cap2` | 11px | 1.4 | +0.02em | Absolute minimum — badge counts, footnote symbols only |
| Caption 1 | `text-ts-cap1` | 12px | 1.4 | +0.015em | Day-of-week labels, legend text, eyebrow labels, chip text |
| Footnote | `text-ts-fn` | 13px | 1.5 | 0 | Step indicators, meta dates, secondary info rows |
| Subheadline | `text-ts-sub` | 15px | 1.5 | 0 | Helper text, supporting descriptions |
| Body | `text-ts-body` | 16px | 1.5 | 0 | Primary body copy, card descriptions |
| Headline | `text-ts-head` | 17px | 1.4 | −0.01em | Button labels, stylist names, card titles |
| Title 3 | `text-ts-t3` | 20px | 1.2 | −0.015em | Calendar date numbers, section headings |
| Title 2 | `text-ts-t2` | 22px | 1.2 | −0.02em | Page sub-headings |
| Title 1 | `text-ts-t1` | 28px | 1.1 | −0.025em | Page headings ("Pilih Stylist") |
| Large Title | `text-ts-hero` | 34px | 1.0 | −0.03em | Hero headings ("Selamat pagi.") |

#### Legacy tokens (backwards compat, avoid in new work)

`t12` `t14` `t16` `t18` `t20` `t24` `t28` `t32` — kept but letter-spacing updated to match semantic scale.

### 3.2 Semantic Roles

| Role | Token | Weight | Usage |
|---|---|---|---|
| **Hero** | `ts-hero` | 700 | Top-of-page greeting, screen title |
| **Page heading** | `ts-t1` | 700 | Step headings ("Pilih Stylist", "Ringkasan") |
| **Section heading** | `ts-t3` | 700 | Calendar numbers, card names |
| **Body** | `ts-body` | 400–500 | Descriptions, secondary content |
| **Label / Button** | `ts-head` | 600–700 | CTA buttons, stylist names |
| **Caption** | `ts-cap1` | 500–600 | Uppercase labels, legends, eyebrows |
| **Micro** | `ts-cap2` | 500 | Only for non-critical decorative labels |

### 3.3 Accessibility Rules

- **Minimum body text:** `ts-sub` (15px) for any paragraph or description.
- **Minimum label text:** `ts-cap1` (12px) — never go below this for any interactive label.
- **Never use `ts-cap2` (11px)** on text the user needs to act on.
- **Contrast:** All text ≥ 4.5:1 against its background (WCAG AA). Large text (≥ 18px bold) ≥ 3:1.
- **Letter-spacing:** Positive tracking on small uppercase (+0.015–0.02em) — mandatory for legibility at 12px. Negative tracking on display sizes (−0.02–0.03em) — tightens optically loose letterforms.

---

## 4. Spacing System

Based on a **4px base unit**, with the primary working grid at **8px**. All spacing tokens are multiples of 4px.

| Token | Value | Common Usage |
|---|---|---|
| `--s4` | 4px | Micro gaps — icon-to-label, dot indicators, step indicator gap |
| `--s8` | 8px | Default gap — list items, chip rows, calendar grid gap |
| `--s12` | 12px | Compact padding — section sub-gaps, stylist head padding |
| `--s16` | 16px | Standard padding — card padding, list horizontal padding |
| `--s20` | 20px | Page margins — topbar horizontal, calendar horizontal padding |
| `--s24` | 24px | Large padding — button padding, modal padding, section gaps |
| `--s32` | 32px | XL spacing — topbar vertical padding |
| `--s40` | 40px | XXL spacing — modal bottom padding, bottom sheet padding |
| `--s48` | 48px | Safe area — topbar top padding (accounts for status bar) |

### 4.1 Spatial Rhythm Rules

- **Page horizontal margin:** `--s20` (20px) on all scrollable content
- **List item gap:** `--s8` (8px) between cards, `6px` between stylist rows (tighter list density)
- **Section gap:** `--s12`–`--s16` between distinct content sections
- **Bottom bar clearance:** 92px scroll padding-bottom so content clears the sticky CTA bar

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--r8` | 8px | Full calendar grid day cells |
| `--r12` | 12px | Calendar strip day items |
| `--r16` | 16px | Modal detail card, sidebar summary card |
| `--r20` | 20px | Service cards, stylist rows, step indicator container |
| `--r24` | 24px | Modal sheet top corners |
| `--rF` | 9999px | Pill shape — buttons, time slots, chips, avatar circles, icon buttons |

**Convention:** More prominent / larger components use larger radii. Interactive pill elements (buttons, chips, time slots) always use `--rF` to create the rounded-rectangle "lozenge" shape. Avatars use `--rF` (full circle).

---

## 6. Elevation & Shadow

The system uses a single shadow value — elevation is communicated through surface color contrast rather than multiple shadow levels.

| Context | Value |
|---|---|
| App shell (mobile) | `box-shadow: 0 0 60px rgba(0,0,0,0.12)` |
| Primary button | `box-shadow: 0 4px 16px rgba(17,17,16,0.20)` |
| Bottom sheet backdrop | `backdrop-filter: blur(10px)` + `rgba(17,17,16,0.40)` overlay |
| Bottom bar blur | `backdrop-filter: blur(20px)` on `rgba(247,247,245,0.94)` |

**Backdrop blur** is used instead of hard shadows on floating elements (bottom bar, bottom sheet). This keeps the visual language soft and avoids harsh edge contrast.

---

## 7. Component Library

### 7.1 Button

Buttons come in two variants. All buttons are full-width within their container, minimum height 50px, with pill shape (`--rF`).

#### Primary Button
```
background:  #111110 (--label)
color:       #ffffff
font-size:   16px, weight 600
min-height:  50px
padding:     12px 24px
border-radius: 9999px
box-shadow:  0 4px 16px rgba(17,17,16,.20)
```
- **Active state:** `transform: scale(0.98)`, `opacity: 0.9` — immediate physical feedback
- **Disabled state:** `background: --sep`, `color: --label3`, no shadow, `cursor: not-allowed`
- **With icon:** 16×16px SVG, `gap: 8px` between label and icon

#### Ghost Button
```
background:  --sep (#e8e7e3)
color:       --label3 (#a09f9a)
font-size:   14px, weight 600
```
Used for inactive/unavailable CTAs that need to occupy the button position without inviting a tap. Not destructive — informational.

#### Icon Button
```
width: 36px, height: 36px
border-radius: 9999px
background: --surface, border: 1px solid --sep
color: --label2
```
- **Active:** background shifts to `--sep`
- Used for: notification bell, back navigation

---

### 7.2 Service Card

Full-width tappable card representing a booking service category.

```
border-radius:  --r20 (20px)
padding:        --s20 (20px)
min-height:     96px
border:         2px solid transparent
display:        flex, flex-direction: column, gap: 4px
```

**Structure:**
- Background: one of six pastel tokens (`--c-peach`, `--c-blue`, etc.)
- Floating blob shape (organic border-radius, 72×72px, darker pastel, top-right corner, `opacity: 0.85`)
- Service name: 20px, weight 700, `--label`
- Description: 14px, `--label2`

**Selected state:**
- `border-color: --accent`
- Service name color: `--accent-dark`

**Active/press state:** `transform: scale(0.98)`

---

### 7.3 Stylist Row

Accordion-style list item that expands to reveal time slot groups.

**Collapsed:**
```
background:     --surface
border:         1.5px solid --sep
border-radius:  --r20 (20px)
```

**Expanded (open):**
```
border-color:   --accent
```

**Head layout (always visible):**
- Avatar: 40×40px circle, `object-fit: cover`
- Name: 15px, weight 600, `--label`
- Specialty: 12px, `--label3` (appended with " · Penuh" if unavailable)
- Chevron icon: `--label3`, rotates 180° when open — transition: 280ms

**Booked/unavailable state:**
- `opacity: 0.55` on entire row
- Avatar: `filter: grayscale(1)`
- Tap triggers toast, accordion does not open

---

### 7.4 Time Slot Chip

Pill-shaped tappable token within an expanded stylist row.

```
padding:        8px 16px
border-radius:  9999px (--rF)
font-size:      14px, weight 500
```

| State | Background | Text Color |
|---|---|---|
| Available | `--accent-soft` (#edf7f3) | `--accent-dark` (#2d7a5f) |
| Full / booked | `--accent-soft` at `opacity: 0.4` + strikethrough | `--label3` |
| Selected | `--label` (#111110) | `#ffffff` |

**Active/press:** `transform: scale(0.93)` — stronger spring feel for small targets.

Time slots are grouped under three session labels: **PAGI** (08.00–11.00), **SIANG** (12.00–15.00), **SORE** (16.00–19.00). Labels use 12px, weight 600, `--label3`, uppercase with `0.07em` letter-spacing.

---

### 7.5 Calendar Strip

Horizontally scrollable date picker shown at the top of Screen 1. Hides the scrollbar via `-webkit-scrollbar: display:none`.

**Day cell (`.dc`):**
- Width: min 44px
- Flex column: day letter → date circle → availability dot
- `border-radius: --r12`
- Day letter: 12px, weight 600, `--label3`, uppercase

**Date circle (`.dc-circle`):**
- 32×32px, `border-radius: --rF`

| State | Circle Background | Circle Text | Dot |
|---|---|---|---|
| Past / full | — | `--label3` + strikethrough | `--sep` |
| Today | `--label` | `#fff` | — |
| Available | — | `--label` | `--accent` |
| Selected | `--accent` | `#fff` | Faded white |

**Full calendar grid:** 7-column CSS grid, expands via `@keyframes up` (fade + translateY −6px → 0). Toggle button rotates its chevron icon 180° on open.

---

### 7.6 Chip (Context Tag)

Used on Screen 2 to summarise the user's selection from Screen 1.

```
background:     --surface
border:         1px solid --sep
border-radius:  --rF
padding:        4px 12px
font-size:      12px, weight 600, --label2
```

Icon is 11×11px SVG in `--accent` color. Chips are display-only — not interactive.

---

### 7.7 Bottom Bar / Sticky CTA

Fixed bottom area that holds the primary action button.

```
position:   absolute, bottom: 0
padding:    12px 16px 24px  (extra bottom for home indicator)
background: rgba(247,247,245, 0.94)
backdrop-filter: blur(20px)
border-top: 1px solid --sep
z-index:    20
```

The translucent frosted-glass treatment ensures list content beneath is visually traceable without being readable — signals there's more to scroll without hard-cutting the content.

---

### 7.8 Bottom Sheet Modal

Slides up from the bottom of the app shell on booking confirmation.

```
border-radius:  28px 28px 0 0
padding:        12px 24px 40px
background:     --surface
transform:      translateY(100%) → translateY(0) on .open
transition:     340ms cubic-bezier(.25,.46,.45,.94)
```

**Decorative accents (Dia-inspired):** Two rotated square shapes (`::before` and `::after` pseudo-elements, 52px and 40px, `border-radius: 6px`, `border: 3px solid --accent`, `background: --accent-soft`) positioned at the top corners of the sheet. `opacity: 0.55`. Creates playful visual energy without emoji reliance.

**Internal layout:**
1. Handle bar — 36×4px, `--sep`, centered, `border-radius: 2px`
2. Eyebrow — 12px, weight 700, uppercase, `+0.10em` tracking, `--accent`
3. Heading — 28px, weight 700, `−0.6px` tracking, centered
4. Detail card — `--bg` background, `--r16` radius, label/value rows
5. Primary button — full-width, black, standard spec

**Backdrop:** `rgba(17,17,16,0.40)` + `backdrop-filter: blur(10px)`. Tap outside to dismiss.

---

### 7.9 Step Indicator (Progress Dots)

```
Inactive dot:  6×6px, border-radius: 9999px, --sep
Active dot:    20×6px, border-radius: 9999px, --label
Transition:    300ms (width + background)
```

The active dot expands horizontally rather than changing size uniformly — this is a common iOS HIG pattern that communicates directionality (left = done, right = ahead) without arrows.

---

### 7.10 Toast Notification

Non-blocking inline feedback.

```
background:     rgba(17,17,16, 0.88)
color:          #fff
padding:        8px 20px
border-radius:  9999px
font-size:      14px, weight 500
position:       absolute, bottom: 100px, centered
```

**Entry:** `opacity: 0` + `translateY(+10px)` → `opacity: 1` + `translateY(0)`, with `cubic-bezier(.175,.885,.32,1.275)` (slight overshoot/spring). **Duration:** visible for 3 seconds, then fades.

---

## 8. Iconography

### 8.1 Style

All icons are inline SVG — no icon font, no image sprites.

- **Stroke-based** — `fill: none`, `stroke: currentColor`
- **Stroke width:** 2px standard, 2.5px for emphasis (back button arrow, button arrow, confirm checkmark)
- **Size:** 16×16px standard, 18×18px for navigation (back button), 11×11px for chips, 14×14px for sidebar info rows
- **Viewbox:** always `0 0 24 24`

### 8.2 Icons Used

| Icon | Context | Stroke Width |
|---|---|---|
| Arrow right (line + polyline) | CTA button "Pilih Stylist" | 2.5px |
| Arrow left (line + polyline) | Back button | 2px |
| Calendar (rect + lines) | Chip / sidebar date row | 2px |
| Clock (circle + polyline) | Chip / sidebar time row | 2px |
| Bell (path) | Notification button | 2px |
| Chevron down (polyline) | Expand calendar, accordion toggle | 2px–2.5px |
| Checkmark (polyline) | Confirm button | 2.5px |
| Lock (rect + path) | Desktop locked state | 1.5px |
| Person (path + circle) | Sidebar stylist row | 2px |

### 8.3 Color Convention

Icons inherit `color: currentColor` from their parent. Control icon color by setting `color` on the parent or directly on the SVG element. Accent-colored icons (`--accent`) are used in chips and expand buttons to reinforce the interactive affordance.

---

## 9. Motion & Animation

### 9.1 Principles

- **Fast and physical.** Most transitions are 140–280ms. Nothing lingers.
- **Purpose-driven.** Every animation communicates something — direction of navigation, state change, appearing content.
- **No decoration.** We don't animate things just because we can. Background colors don't transition; layout doesn't shift; only state-bearing elements move.

### 9.2 Easing Functions

| Name | Curve | Usage |
|---|---|---|
| Standard | `cubic-bezier(.25,.46,.45,.94)` | Screen transitions, bottom sheet slide |
| Spring | `cubic-bezier(.175,.885,.32,1.275)` | Toast entry (slight overshoot) |
| Linear-ease | `ease` | Expand/reveal animations |

### 9.3 Animation Catalogue

**Screen Push Forward (`sIn`)**
```css
@keyframes sIn {
  from { transform: translateX(100%); opacity: .4; }
  to   { transform: translateX(0);    opacity: 1;  }
}
Duration: 280ms · Easing: standard
```
Entering screen slides in from the right at reduced opacity. Mimics native iOS push navigation.

**Screen Pop Back (`sBk`)**
```css
@keyframes sBk {
  from { transform: translateX(-24%); opacity: .4; }
  to   { transform: translateX(0);    opacity: 1;  }
}
Duration: 280ms · Easing: standard
```
Returning screen slides back from slight left offset. The 24% offset (vs 100% for push) feels faster and less disorienting — the screen was "behind" the foreground.

**Reveal Up (`up`)**
```css
@keyframes up {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0);    }
}
Duration: 200–220ms · Easing: ease
```
Used for: accordion time panel expansion, full calendar grid reveal. The 6px travel is deliberately short — enough to feel physical, not dramatic.

**Bottom Sheet Slide**
```
transform: translateY(100%) → translateY(0)
Duration: 340ms · Easing: standard
```

**State Transitions (non-keyframe)**

| Element | Property | Duration | Notes |
|---|---|---|---|
| Border color (stylist row) | `border-color` | 200ms | `--sep` → `--accent` on open |
| Chevron rotation | `transform` | 280ms | 0° → 180° on accordion open |
| Step dot width | `width` | 300ms | 6px → 20px |
| Calendar expand button | `transform` (SVG) | 300ms | Chevron rotates |
| Button press | `transform + opacity` | 160ms | scale(.98), opacity(.9) |
| Time slot press | `transform` | 140ms | scale(.93) — snappier for small targets |
| Icon button press | `background` | 140ms | `--surface` → `--sep` |
| Toast entry | all | 260ms | Spring easing |
| Backdrop | `opacity` | 260ms | 0 → 1 |

---

## 10. Layout & Grid

### 10.1 Mobile Shell

```
max-width:  430px
min-height: 100vh
position:   relative
overflow:   hidden
```

The `overflow: hidden` clips screen transitions cleanly without browser scroll artifacts. The 430px ceiling matches the largest common phone viewport (iPhone Pro Max) while remaining usable on smaller devices (scales down naturally — no breakpoints needed within this range).

### 10.2 Screen Structure

Each screen is an absolutely positioned flex column occupying the full shell:
```
position: absolute, top: 0, left: 0
width: 100%, height: 100vh
display: flex, flex-direction: column
```

Internal anatomy:
1. **Topbar** — `padding: 48px 20px 16px` (top padding accounts for OS status bar)
2. **Scrollable content** — `flex: 1`, `overflow-y: auto`, `padding-bottom: 92px` (clears the sticky bottom bar)
3. **Bottom bar** — `position: absolute, bottom: 0` (stacks above scroll area)

### 10.3 Content Sections

- **Horizontal page margin:** 20px (`--s20`) for most content
- **Card lists:** 16px (`--s16`) padding to give cards a slightly inset feel
- **Section label:** uppercase, letter-spaced, acts as a visual divider between content groups

### 10.4 Responsive Behaviour

The current implementation is **mobile-only** (`max-width: 430px`). A desktop layout using CSS Grid (`300px 1fr`, left info panel / right booking content) exists in the codebase as disabled code (`@media (min-width: 99999px)`) — ready to be enabled when the desktop phase begins. That layout follows the Cal.com 2-column booking widget convention.

---

## 11. Accessibility

### 11.1 Touch Targets

All tappable elements meet the 44×44px minimum:
- Icon buttons: 36×36px visual, but spacing around them ensures 44px effective target
- Time slot chips: `padding: 8px 16px` — effective height ~36px, acceptable for dense selection grids
- Calendar day cells: `min-width: 44px`
- Stylist row heads: full-width, `padding: 14px 16px` = ~48px effective height

### 11.2 Color Contrast

| Pair | Ratio (approx.) | Pass level |
|---|---|---|
| `--label` (#111110) on `--surface` (#fff) | ~19:1 | AAA |
| `--label` on `--bg` (#f7f7f5) | ~16:1 | AAA |
| `--accent-dark` (#2d7a5f) on `--accent-soft` (#edf7f3) | ~5.2:1 | AA |
| `--label3` (#a09f9a) on `--surface` | ~2.8:1 | Fails AA — use only for non-critical metadata |
| `#fff` on `--accent` (#4a9b7f) | ~3.6:1 | AA Large text only |

**Noted:** `--label3` fails WCAG AA contrast. Its use is intentionally limited to decorative metadata (section labels, day-of-week, placeholder dots) — not primary interaction labels.

### 11.3 State Communication

- **Disabled buttons** communicate state via both color change AND `cursor: not-allowed` — not solely color.
- **Full/unavailable slots** use `text-decoration: line-through` in addition to reduced opacity — accessible to color-blind users.
- **Booked stylists** use `opacity: 0.55` + `filter: grayscale(1)` — redundant cue beyond color alone.
- **Step indicator** communicates progress via width change (not color alone).

### 11.4 Tap Feedback

Every interactive element has a visible state change within 140ms of touch — either background color, transform scale, or border color. No silent taps. This is critical on mobile where there is no hover pre-feedback.

---

## Appendix: Token Quick Reference

```css
/* ── Accent ── */
--accent:       #4a9b7f
--accent-dark:  #2d7a5f
--accent-soft:  #edf7f3

/* ── Neutrals ── */
--label:        #111110
--label2:       #605f5b
--label3:       #a09f9a
--sep:          #e8e7e3
--surface:      #ffffff
--bg:           #f7f7f5

/* ── Pastels (service cards only) ── */
--c-peach:      #fde8dc
--c-blue:       #ddedf8
--c-mauve:      #eddde9
--c-yellow:     #fef3c2
--c-mint:       #d8f3ec
--c-lilac:      #e8e2f8

/* ── Type Scale ── */
--t12: 12px   --t14: 14px   --t16: 16px   --t18: 18px
--t20: 20px   --t24: 24px   --t28: 28px   --t32: 32px

/* ── Spacing (4px base) ── */
--s4: 4px    --s8: 8px    --s12: 12px   --s16: 16px
--s20: 20px  --s24: 24px  --s32: 32px   --s40: 40px  --s48: 48px

/* ── Border Radius ── */
--r8: 8px   --r12: 12px  --r16: 16px
--r20: 20px --r24: 24px  --rF: 9999px

/* ── Font ── */
font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
```

---

*Design System · Rara Beauty Salon · v1.0 · May 2026*
