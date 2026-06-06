# Design System Rules — Firalink Owner Dashboard

> This document governs all visual styling decisions in `apps/owner`.
> Last updated: June 2026 (post Step 11 V3 enforcement)

---

## Guiding Principle

**Tokens first. Inline styles as a last resort.**

Every visual value that appears more than once should be a token.
Every static style should use a Tailwind class.
Inline `style={{}}` is only permitted for dynamic (runtime-computed) values.

---

## Colors

### Background Tokens

| Token        | Value     | Use Case                                |
| ------------ | --------- | --------------------------------------- |
| `bg-page`    | `#F2F2F7` | Page background (iOS system gray 6)     |
| `bg-card`    | `#FFFFFF` | Cards, panels, drawers                  |
| `bg-surface` | `#fafaf8` | Expanded rows, subtle hover backgrounds |
| `bg-header`  | `#F7F7F8` | Table header row background             |
| `bg-control` | `#F2F2F7` | Segmented tab container, icon buttons   |
| `bg-input`   | `#F9F9FB` | Secondary buttons, input fields         |
| `bg-hover`   | `#F5F5F7` | List item / dropdown item hover         |

**Tailwind usage:** `bg-bg-page`, `bg-bg-card`, `bg-bg-surface`, `hover:bg-bg-hover`

### Text Tokens

| Token          | Value     | Use Case                                       |
| -------------- | --------- | ---------------------------------------------- |
| `tx-primary`   | `#1C1C1E` | Titles, numbers, customer names (iOS label)    |
| `tx-body`      | `#1a1a1a` | Body content, service names, time slots        |
| `tx-secondary` | `#8E8E93` | Labels, counts, placeholders (iOS system gray) |
| `tx-subtle`    | `#555555` | Supporting descriptions, secondary values      |
| `tx-muted`     | `#C7C7CC` | Disabled states, extreme placeholders          |

**Tailwind usage:** `text-tx-primary`, `text-tx-body`, `text-tx-secondary`, `text-tx-subtle`, `text-tx-muted`

### Border Tokens

| Token       | Value     | Use Case                                   |
| ----------- | --------- | ------------------------------------------ |
| `bd-card`   | `#E5E5EA` | Card borders, input borders, modal borders |
| `bd-row`    | `#F2F2F7` | Row separators within lists                |
| `bd-detail` | `#f0f0f0` | Detail panel inner dividers                |

**Tailwind usage:** `border-bd-card`, `border-bd-row`, `divide-bd-row`

### Booking Status Tokens

| Token               | Value     | Use Case                                     |
| ------------------- | --------- | -------------------------------------------- |
| `st-upcoming`       | `#d97706` | Upcoming booking text                        |
| `st-upcoming-bg`    | `#fffbeb` | Upcoming booking badge background            |
| `st-upcoming-dot`   | `#f59e0b` | Notification dot on avatar                   |
| `st-confirmed`      | `#2563eb` | Confirmed booking text                       |
| `st-confirmed-bg`   | `#eff6ff` | Confirmed booking badge background           |
| `st-in-progress`    | `#16a34a` | In-progress text                             |
| `st-in-progress-bg` | `#f0fdf4` | In-progress badge background                 |
| `st-completed`      | `#9ca3af` | Completed (muted) text                       |
| `st-completed-bg`   | `#f9fafb` | Completed badge background                   |
| `st-cancelled`      | `#ef4444` | Cancelled text / danger hover                |
| `st-cancelled-bg`   | `#fef2f2` | Cancelled badge background / danger hover bg |
| `st-no-show`        | `#9ca3af` | No-show text                                 |
| `st-no-show-bg`     | `#f9fafb` | No-show badge background                     |

### Payment Status Tokens

| Token        | Value     | Use Case               |
| ------------ | --------- | ---------------------- |
| `py-paid`    | `#34C759` | Lunas (paid) indicator |
| `py-deposit` | `#FF9500` | DP (deposit) indicator |
| `py-unpaid`  | `#8E8E93` | Belum bayar indicator  |

### Visitor Type Tokens

| Token             | Value     | Use Case                 |
| ----------------- | --------- | ------------------------ |
| `vt-walkin-text`  | `#856404` | Walk-in badge text       |
| `vt-walkin-bg`    | `#FEF3C7` | Walk-in badge background |
| `vt-booking-text` | `#1565C0` | Booking badge text       |
| `vt-booking-bg`   | `#DBEAFE` | Booking badge background |

### Action / Accent Tokens

| Token          | Value     | Use Case                         |
| -------------- | --------- | -------------------------------- |
| `ac-primary`   | `#2563eb` | Konfirmasi, Save buttons         |
| `ac-danger`    | `#ef4444` | Tolak, Hapus buttons             |
| `ac-wa`        | `#25d366` | WhatsApp brand color             |
| `ac-ios-blue`  | `#007AFF` | iOS-style link / stat card icons |
| `ac-ios-red`   | `#FF3B30` | Cancellation stat icon           |
| `ac-ios-green` | `#34C759` | Completion stat icon             |

### Approved Hardcoded Colors (Not Yet Tokenized)

These colors are currently hardcoded by design decision — they don't have exact token equivalents and are awaiting a future token sweep:

| Color                 | Usage                                         | Reason Not Tokenized                        |
| --------------------- | --------------------------------------------- | ------------------------------------------- |
| `#F0F4FF`             | Active service hover bg in detail panel       | Component-specific, unique                  |
| `#f0f0ee`             | Icon container bg in AddVisitFAB, edit button | No semantic meaning yet                     |
| `#e0e0e0`             | Picker panel border, dashed upload border     | Close to `bd-card` but intentionally softer |
| `#e8e8e8` / `#e8e8e6` | Input/image borders                           | Softer than bd-card                         |
| `#444`                | Darker text in some price spans               | Between tx-subtle and tx-primary            |
| `#f8f8f6`             | AddVisitFAB item hover                        | Close to bg-hover but warmer tint           |

**Rule:** Do NOT replace these with approximate tokens. Wait for a dedicated token planning session.

---

## Typography

### Type Scale Tokens (Apple HIG)

| Token     | Size             | Line Height | Letter Spacing | Use Case                                              |
| --------- | ---------------- | ----------- | -------------- | ----------------------------------------------------- |
| `ts-cap2` | 0.6875rem (11px) | 1.4         | 0.02em         | Minimum; legend dots, badges                          |
| `ts-cap1` | 0.75rem (12px)   | 1.4         | 0.015em        | Labels, tags, eyebrow text                            |
| `ts-fn`   | 0.8125rem (13px) | 1.5         | 0              | Secondary meta, time slots                            |
| `ts-sub`  | 0.9375rem (15px) | 1.5         | 0              | Supporting body, chip text                            |
| `ts-body` | 1rem (16px)      | 1.5         | 0              | Descriptions, secondary content                       |
| `ts-head` | 1.0625rem (17px) | 1.4         | -0.01em        | Primary body, button labels, card titles              |
| `ts-t14`  | 0.875rem (14px)  | 1.5         | 0              | Semantic alias for 14px (button text, dropdown items) |
| `ts-t3`   | 1.25rem (20px)   | 1.2         | -0.015em       | Section titles                                        |
| `ts-t2`   | 1.375rem (22px)  | 1.2         | -0.02em        | Page sub-headings                                     |
| `ts-t1`   | 1.75rem (28px)   | 1.1         | -0.025em       | Page headings                                         |
| `ts-hero` | 2.125rem (34px)  | 1.0         | -0.03em        | Hero headings                                         |

**Tailwind usage:** `text-ts-cap1`, `text-ts-fn`, `text-ts-head`, `text-ts-t14`

### Legacy Aliases (Backwards Compat — Do Not Use in New Code)

`t12`, `t14`, `t16`, `t18`, `t20`, `t24`, `t28`, `t32` — these map to the same values but use pixel-size naming. Prefer `ts-*` tokens for new code.

### Font Weights

Use Tailwind's standard weight utilities: `font-medium` (500), `font-semibold` (600), `font-bold` (700). Do not use inline `fontWeight` for static values.

---

## Spacing

The design uses a **4pt grid** (base unit = 0.25rem / 4px).

| Token | Value   | Pixels |
| ----- | ------- | ------ |
| `s4`  | 0.25rem | 4px    |
| `s8`  | 0.5rem  | 8px    |
| `s12` | 0.75rem | 12px   |
| `s16` | 1rem    | 16px   |
| `s20` | 1.25rem | 20px   |
| `s24` | 1.5rem  | 24px   |
| `s32` | 2rem    | 32px   |
| `s40` | 2.5rem  | 40px   |
| `s48` | 3rem    | 48px   |

**Tailwind usage:** `gap-s8`, `px-s16`, `py-s12`, `mt-s24`

Arbitrary spacing values (e.g. `p-3.5`, `gap-1.5`) are tolerated when they don't correspond to a token slot. Do not add tokens just to avoid arbitrary values — only add tokens for values that carry semantic meaning and appear in 3+ locations.

---

## Border Radius

| Token | Value           | Use Case                                    |
| ----- | --------------- | ------------------------------------------- |
| `r6`  | 0.375rem (6px)  | Status booking badges                       |
| `r8`  | 0.5rem (8px)    | Buttons, small icon containers              |
| `r10` | 0.625rem (10px) | Inputs, action buttons, avatars             |
| `r12` | 0.75rem (12px)  | Picker panels, proof thumbnail, code inputs |
| `r14` | 0.875rem (14px) | Dropdown menus                              |
| `r16` | 1rem (16px)     | Table container                             |
| `r20` | 1.25rem (20px)  | Stat cards, drawers, dialogs                |
| `r24` | 1.5rem (24px)   | Large panels                                |
| `r32` | 2rem (32px)     | Extra-large cards                           |
| `rF`  | 9999px          | Pill badges, circular buttons               |

**Tailwind usage:** `rounded-r6`, `rounded-r12`, `rounded-r20`, `rounded-rF`

**Rule:** Never use `rounded-xl`, `rounded-full`, `rounded-lg` etc. — always use `r*` tokens.

---

## Shadows

| Token             | Value                          | Use Case                               |
| ----------------- | ------------------------------ | -------------------------------------- |
| `shadow-card`     | `0 2px 8px rgba(0,0,0,0.06)`   | Stat cards, table panel                |
| `shadow-drawer`   | `-8px 0 48px rgba(0,0,0,0.18)` | Walk-in drawer side shadow             |
| `shadow-dialog`   | `0 24px 64px rgba(0,0,0,0.18)` | Modals                                 |
| `shadow-dropdown` | `0 8px 32px rgba(0,0,0,0.14)`  | AddVisitDropdown panel, service picker |
| `shadow-tab`      | `0 1px 4px rgba(0,0,0,0.1)`    | Active tab button                      |

**Tailwind usage:** `shadow-card`, `shadow-drawer`, `shadow-dropdown`, etc.

**Rule:** Never write inline `boxShadow` with a hardcoded rgba value. If a shadow isn't in the token table, either add a token or use the nearest existing one.

**Note:** `shadow-[0_8px_24px_rgba(0,0,0,0.12)]` is used for picker dropdown panels in `BookingDetailPanel`. This is a known gap — it differs slightly from `shadow-dropdown` (0.12 vs 0.14 opacity). A `shadow-picker` token should be added in the next token sweep.

---

## Icons

### Standard

All icons in the dashboard must use **Phosphor Icons** with `weight="duotone"`:

```tsx
import { Check, Trash, X, MagnifyingGlass } from '@phosphor-icons/react';

<Check size={16} weight="duotone" />
<Trash size={18} weight="duotone" />
```

**Size guidance:**

- 10–12px — close buttons inside small circles
- 14–16px — action buttons, dialog icons inside `DialogIcon` (40px circle)
- 18–20px — dropdown item icons
- 22–26px — stat card icons
- 32px — empty state placeholder icons

### Approved Exception: WhatsApp Brand Icon

The WhatsApp logo is used in `DeclineBookingDialog`, `WANotificationDialog`, and `BookingDetailPanel` as an inline SVG. Phosphor does not have a WhatsApp icon. This is the **only** approved inline SVG for brand/trademark reasons:

```tsx
function WAIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382..." />
    </svg>
  );
}
```

Do NOT replace this with a third-party icon library.

### Forbidden

- `@heroicons/react` — fully removed from overview module
- Inline `<svg>` for any icon Phosphor covers
- Custom SVG for generic icons (check, x, plus, arrow, magnifier, trash, etc.)

### Remaining Non-Standard (Pending Migration)

These inline SVGs remain in the codebase and should be addressed in a future sweep:

| File                     | SVG Purpose                                         | Phosphor Replacement                                                    |
| ------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------- |
| `AddVisitFAB.tsx`        | Plus button (FAB trigger), Walk-in person, Calendar | `Plus`, `PersonSimpleWalk`, `CalendarCheck`                             |
| `BookingCodeSection.tsx` | Barcode scanner                                     | `Barcode`                                                               |
| `PaymentInputCard.tsx`   | Image upload (proof), View proof button             | `Image`, `ImageSquare`                                                  |
| `BookingDetailPanel.tsx` | WA chat link SVG                                    | **Keep** — WA brand exception                                           |
| `BookingTableHeader.tsx` | Sort icon (up/down arrows)                          | `SortAscending`, `SortDescending` (or keep — it's a bespoke dual-arrow) |
| `AddVisitDropdown.tsx`   | Caret down chevron                                  | `CaretDown`                                                             |
| `StatCardsRow.tsx`       | Revenue card background doodle circles/lines        | **Keep** — decorative, not an icon                                      |
| `BookingRow.tsx`         | Chevron expand/collapse                             | `CaretRight`                                                            |

---

## Component Rules

### When to Create a New Primitive

Create a shared component in `shared/components/ui/` when:

1. The pattern appears in **3+ locations** across different features
2. It has **no business logic** dependency
3. It represents a **reusable visual contract** (e.g. dialog structure, button variant)

### When NOT to Create a New Primitive

Do not extract into shared when:

1. The pattern appears in only 1–2 locations
2. It has feature-specific props or behavior
3. It's an interim pattern during active development

### Internal vs. Exported Components

Components that only serve a single parent can be defined as unexported functions in the same file:

```tsx
// Good — only used by BookingDetailPanel.tsx
function AddItemButton({ label, onClick }) { ... }
function PickerSearchRow({ ... }) { ... }

export function BookingDetailPanel(...) {
  return <AddItemButton ... />
}
```

Only export when the component is used by 2+ files.

---

## Inline Style Rules

| Situation                                    | Style Rule                                   |
| -------------------------------------------- | -------------------------------------------- |
| Static color                                 | ❌ Never — use Tailwind token class          |
| Static spacing                               | ❌ Never — use Tailwind token or utility     |
| Static radius                                | ❌ Never — use Tailwind token                |
| Dynamic color (ternary or computed)          | ✅ Allowed — inline `style={{ color: ... }}` |
| Dynamic transform / animation                | ✅ Allowed — `style={{ transform: ... }}`    |
| Complex layout (grid-template-columns, etc.) | ✅ Allowed when Tailwind cannot express it   |
| Avatar bg/text color (computed from name)    | ✅ Allowed — runtime computed                |

---

## File Naming Conventions

- Components: `PascalCase.tsx` (e.g. `BookingRow.tsx`)
- Hooks: `use-kebab-case.ts` (e.g. `use-booking-list.ts`)
- Utils: `kebab-case.utils.ts` (e.g. `booking-list.utils.ts`)
- Types: `kebab-case.types.ts` (e.g. `overview.types.ts`)
- Constants: `kebab-case.ts` (e.g. `booking-status.ts`)
