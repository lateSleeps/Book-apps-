# SalonHeader

## Purpose

Persistent identity anchor for the booking flow. Visible at the top of every step (except the ticket confirmation). Establishes where the user is before they make any decisions.

## UX Goal

Orient the user immediately. The salon name is the dominant visual element — it replaces the greeting-first pattern with place-first hierarchy. The subtitle sets expectations without creating friction.

## States

| State          | Behavior                                                         |
| -------------- | ---------------------------------------------------------------- |
| Loading        | Name is empty; subtitle appears from description or default copy |
| Loaded         | Name and optional description from API                           |
| No description | Falls back to generic orientation copy                           |

## Design Rules

**Typography hierarchy (top to bottom):**

1. `eyebrow` — `text-ts-cap2`, uppercase, `tracking-[0.12em]`, `text-label3` — barely visible, purely contextual
2. `name` — `text-ts-t1`, bold, tight tracking — dominant, the user's anchor
3. `subtitle` — `text-ts-fn`, `text-label3` — supportive, not competing

**Surface:** `bg-surface` with a single `border-b border-sep`. No shadow — weight comes from typography, not chrome.

**Actions:** Secondary at all times. Small buttons, muted tone. Never compete with the salon name.

**Token usage:**

- Colors: `text-label3`, `text-label`, `bg-surface`, `bg-bg`, `border-sep`
- Typography: `text-ts-cap2`, `text-ts-t1`, `text-ts-fn`
- Spacing: `px-s20`, `pt-s20`, `pb-s16`, `gap-s12`, `mb-s4`, `mt-s8`
- Radii: `rounded-rF` (buttons)

## Phase 2 / Phase 3 notes

- If salon has a cover image in Phase 2, place it as a subtle full-bleed background with overlay — do not introduce a hero banner block
- Rating or review count could be added between name and subtitle at `text-ts-cap1`
- Share URL could become a QR code action in Phase 3
