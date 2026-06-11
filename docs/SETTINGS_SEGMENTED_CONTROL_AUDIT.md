# Settings Segmented Control Audit

Date: 2026-06-11

---

## 1. Source Component

**File:** `apps/owner/src/features/dashboard/components/overview/BookingTableHeader.tsx`

This is the source of truth for the segmented control visual. It is the tab strip
used on the Dashboard "List Kunjungan" panel (Semua / Booking / Datang Langsung /
Selesai).

Note: `HistoryFilterBar.tsx` (Riwayat Transaksi) does NOT use a segmented control —
it uses `<select>` dropdowns. The correct visual reference is `BookingTableHeader`.

---

## 2. Visual Differences Found

| Property          | Source of Truth (BookingTableHeader)                  | SettingsSubNav (before fix)        |
| ----------------- | ----------------------------------------------------- | ---------------------------------- |
| Container gap     | 2px (`gap: 2` inline)                                 | 4px (`gap-s4`)                     |
| Container padding | 4px (`padding: 4` inline)                             | 4px (`p-s4`) — correct             |
| Container radius  | 12px (`borderRadius: 12` inline)                      | 12px (`rounded-r12`) — correct     |
| Button padding-x  | 14px (`padding: '6px 14px'` inline)                   | 12px (`px-s12`)                    |
| Button padding-y  | 6px (`padding: '6px 14px'` inline)                    | 0px (`py-s6` token did not exist!) |
| Button radius     | 10px (`borderRadius: 10` inline)                      | 10px (`rounded-r10`) — correct     |
| Button typography | `text-ts-fn`                                          | `text-ts-fn` — correct             |
| Active state      | `bg-bg-card font-semibold text-tx-primary shadow-tab` | same — correct                     |

**Root cause of "too short / too cramped" appearance:**

1. `py-s6` was used but `s6` did not exist in the spacing token map → Tailwind emitted
   no padding rule → buttons had 0px vertical padding, causing them to look short.
2. `gap-s4` (4px) instead of 2px made items appear too spread out and the active
   card less isolated.
3. `px-s12` (12px) instead of 14px made buttons slightly narrower than the reference.

---

## 3. Primitive Created

**File:** `apps/owner/src/shared/components/ui/segmented-control/SegmentedControl.tsx`

Single source-of-truth component for all segmented tab strips in the app.

```tsx
<SegmentedControl
  items={[
    { id: "a", label: "Tab A" },
    { id: "b", label: "Tab B" },
  ]}
  activeId="a"
  onChange={(id) => setTab(id)}
/>
```

Container: `inline-flex max-w-full gap-s2 overflow-x-auto rounded-r12 bg-bg-control p-s4`
Button: `shrink-0 whitespace-nowrap rounded-r10 px-s14 py-s6 text-ts-fn transition-colors`
Active: `bg-bg-card font-semibold text-tx-primary shadow-tab`
Inactive: `font-normal text-tx-secondary hover:text-tx-primary`

---

## 4. Files Changed

| File                                                                              | Change                                     |
| --------------------------------------------------------------------------------- | ------------------------------------------ |
| `apps/owner/tailwind.config.ts`                                                   | Added `s2`, `s6`, `s14` spacing tokens     |
| `apps/owner/src/shared/components/ui/segmented-control/SegmentedControl.tsx`      | NEW — primitive component                  |
| `apps/owner/src/shared/components/ui/segmented-control/index.ts`                  | NEW — barrel export                        |
| `apps/owner/src/features/dashboard/components/settings/layout/SettingsSubNav.tsx` | Refactored to delegate to SegmentedControl |

`SettingsTabbedCard`, `ServicesAccordion`, `AddOnsSection`, `BundlesSection`, and all
other settings consumers continue to import `SettingsSubNav` unchanged — no call-site
edits required.

---

## 5. Tokens Added

| Token | Value             | Usage                                                  |
| ----- | ----------------- | ------------------------------------------------------ |
| `s2`  | `0.125rem` (2px)  | Segmented control inner gap (`gap-s2`)                 |
| `s6`  | `0.375rem` (6px)  | Segmented control button vertical padding (`py-s6`)    |
| `s14` | `0.875rem` (14px) | Segmented control button horizontal padding (`px-s14`) |

All three values are half-steps on the 4pt grid and are already used implicitly in the
source of truth (BookingTableHeader) as inline styles. This change tokenises them.

---

## 6. Pending Migration

`BookingTableHeader.tsx` still uses inline styles for its segmented control (the original
source of truth). It should be migrated to `<SegmentedControl>` in a follow-up task to
complete the consolidation. No visual change is expected — the tokens match the inline
values exactly.
