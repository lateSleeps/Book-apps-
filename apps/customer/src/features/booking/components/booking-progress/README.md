# BookingProgress

## Purpose

Answers three questions at a glance: _Where am I? What comes next? How much remains?_ Present on every step except the ticket confirmation.

## UX Goal

Reduce anxiety during multi-step flows. The progress bar gives a physical sense of movement. Typography hierarchy (not color) distinguishes states — reducing visual noise while maintaining clarity.

## States

| Label state                | Meaning                  |
| -------------------------- | ------------------------ |
| `text-label3` (muted)      | Future — not yet reached |
| `text-accent`              | Done — already completed |
| `text-label font-semibold` | Active — current step    |

| Track                | Behavior                                            |
| -------------------- | --------------------------------------------------- |
| Gray `bg-sep`        | Total length, always full-width                     |
| Dark `bg-label` fill | Grows with each step. `transition-all duration-500` |

## Step mapping

| Step key                 | Display index                           |
| ------------------------ | --------------------------------------- |
| services, service-detail | 0 — Layanan                             |
| stylist                  | 1 — Stylist                             |
| confirm                  | 2 — Jadwal                              |
| contact                  | 3 — Kontak                              |
| payment                  | 4 — Bayar                               |
| ticket                   | hidden (showChrome = false in page.tsx) |

## Design Rules

- No numbered circles, no icons — labels only
- Progress communicated by the fill bar, not by label decoration
- Surface: `bg-surface border-b border-sep` — same as SalonHeader, creates a visual band
- Typography: `text-ts-cap2` for all labels — small enough to be quiet, readable enough to scan
- The track is `h-px` — invisible at rest, only the fill makes it perceptible

**Token usage:**

- Colors: `text-label3`, `text-accent`, `text-label`, `bg-surface`, `bg-sep`, `bg-label`, `border-sep`
- Typography: `text-ts-cap2`
- Spacing: `px-s20`, `pt-s12`, `pb-s8`

## Phase 2 / Phase 3 notes

- If service-detail becomes a common path, consider promoting it to a visible step label
- Do not add back numbered circles — the journey metaphor collapses if it becomes a wizard
- Consider animated checkmark on label transition Done state in Phase 3
