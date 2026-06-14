# ServiceCard

## Purpose

The primary decision surface in the booking flow. Where the user selects which service they want. The most critical refinement target — this component directly affects booking conversion.

## UX Goal

Let the user choose with confidence. The hierarchy — Name → Duration → Price — matches how a customer mentally evaluates a service. Description supports the decision without dominating.

Selection should feel **certain and quiet**, not celebratory.

## States

| State    | Visual treatment                                                |
| -------- | --------------------------------------------------------------- |
| Default  | White surface, `shadow-sm`, no border                           |
| Selected | `shadow-button` (lifted), small dark checkmark dot in top-right |
| Hover    | Scale `active:scale-[0.98]` on press — subtle physicality       |

## Design Rules

**Hierarchy (top to bottom):**

1. `name` — `text-ts-head font-semibold text-label` — largest, dominant
2. `description` — `text-ts-fn text-label2` — supportive, quiet
3. `meta` (duration · price) — `text-ts-cap1` — compact, at the bottom

**Selection indicator:**

- `h-[20px] w-[20px]` circle, top-right of card
- Default: `border border-sep` (barely visible)
- Selected: `bg-label border-label` with a white checkmark SVG
- No ring, no thick border, no accent color fill — follows Apple Settings behavior

**Surface:**

- Always `bg-surface` (white)
- `shadow-sm` default → `shadow-button` selected — lift communicates selection

**Token usage:**

- Colors: `bg-surface`, `text-label`, `text-label2`, `text-label3`, `border-sep`, `bg-label`, `border-label`
- Typography: `text-ts-head`, `text-ts-fn`, `text-ts-cap1`, `text-ts-cap2`
- Spacing: `p-s20`, `mt-s8`, `mt-s12`, `gap-s12`, `gap-s8`
- Radii: `rounded-r20`
- Shadows: `shadow-sm`, `shadow-button`

## Phase 2 / Phase 3 notes

- Service image thumbnail: place as 48×48 rounded image to the right of the name, before the indicator
- Review count / rating: add as `text-ts-cap2 text-label3` below meta line
- If multiple services become selectable, add a quantity stepper in Phase 3
- Duration should dynamically reflect the booked duration if add-ons are selected
