# Segmented Control Visual Parity Report

Date: 2026-06-11

---

## 1. Visual Differences Found

The Settings segmented control had three compounding visual defects compared to the
Dashboard source of truth. All three are now resolved.

| Property                  | Dashboard (source)          | Settings BEFORE             | Settings AFTER                |
| ------------------------- | --------------------------- | --------------------------- | ----------------------------- |
| Container height          | **40px**                    | ~20px                       | **40px** ✓                    |
| Button height             | **32px**                    | ~20px                       | **32px** ✓                    |
| Button vertical padding   | **6px top + 6px bottom**    | 0px (token missing)         | **6px top + 6px bottom** ✓    |
| Button horizontal padding | **14px left + 14px right**  | 12px                        | **14px left + 14px right** ✓  |
| Container gap             | **2px**                     | 4px                         | **2px** ✓                     |
| Container radius          | 12px                        | 12px                        | 12px ✓                        |
| Active btn radius         | 10px                        | 10px                        | 10px ✓                        |
| Active btn bg             | rgb(255,255,255)            | rgb(255,255,255)            | rgb(255,255,255) ✓            |
| Container bg              | rgb(242,242,247)            | rgb(242,242,247)            | rgb(242,242,247) ✓            |
| Font size                 | 13px                        | 13px\*                      | 13px ✓                        |
| Font weight active        | 600                         | 600\*                       | 600 ✓                         |
| Shadow                    | 0px 1px 4px rgba(0,0,0,0.1) | 0px 1px 4px rgba(0,0,0,0.1) | 0px 1px 4px rgba(0,0,0,0.1) ✓ |

\*Font was correct in class but was being dropped by tailwind-merge (fixed in cn.ts in the
same session).

---

## 2. Actual Measured Values — Confirmed via DevTools

### Source of Truth: BookingTableHeader (Dashboard `/overview`)

Measured in live browser via `getComputedStyle`:

```
Container:
  height:        40px
  padding:       4px (all sides)
  gap:           2px
  border-radius: 12px
  background:    rgb(242, 242, 247)

Active button ("Semua"):
  height:        32px
  padding:       6px 14px
  border-radius: 10px
  font-size:     13px
  font-weight:   600
  box-shadow:    rgba(0,0,0,0.1) 0px 1px 4px 0px
  background:    rgb(255, 255, 255)

Inactive button ("Booking"):
  height:        32px
  padding:       6px 14px
  color:         rgb(142, 142, 147)
```

### Settings SettingsTabbedCard (`/settings/layanan` — "Layanan & Kategori" tab)

```
Container:
  height:        40px  ✓
  padding:       4px   ✓
  gap:           2px   ✓
  border-radius: 12px  ✓
  background:    rgb(242, 242, 247) ✓

Active button:
  height:        32px  ✓
  padding:       6px 14px ✓
  border-radius: 10px  ✓
  font-size:     13px  ✓
  font-weight:   600   ✓
  box-shadow:    rgba(0,0,0,0.1) 0px 1px 4px 0px ✓
  background:    rgb(255, 255, 255) ✓

Inactive button:
  color:         rgb(142, 142, 147) ✓
```

### Settings filter strip ("Aktif / Arsip / Dihapus")

Identical measurements as SettingsTabbedCard above — all values match. ✓

---

## 3. Root Cause

**Primary defect: `py-s6` emitting 0px vertical padding.**

The SettingsSubNav was already using `py-s6` but the spacing token `s6` (6px) did not
exist in `tailwind.config.ts`. Tailwind silently ignores unknown tokens. The button
therefore had `0px` vertical padding instead of `6px`, collapsing its height from 32px
to ~20px.

**Secondary defects:**

- `gap-s4` (4px) instead of 2px — tokens `s4` existed but value was wrong for this use
- `px-s12` (12px) instead of 14px — token existed but value was too narrow

These three together made the Settings control look noticeably shorter, tighter, and more
cramped than the Dashboard source.

**Note on Riwayat Transaksi:** The Riwayat Kunjungan page (`/bookings`) does NOT use a
segmented control. It uses `<select>` filter dropdowns. The correct visual reference for
segmented controls is BookingTableHeader on the Dashboard overview page only.

---

## 4. Files Changed

| File                                                                              | Change                                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `apps/owner/tailwind.config.ts`                                                   | Added `s2` (2px), `s6` (6px), `s14` (14px) spacing tokens |
| `apps/owner/src/shared/components/ui/segmented-control/SegmentedControl.tsx`      | NEW — shared primitive with correct token values          |
| `apps/owner/src/shared/components/ui/segmented-control/index.ts`                  | NEW — barrel export                                       |
| `apps/owner/src/features/dashboard/components/settings/layout/SettingsSubNav.tsx` | Refactored to delegate to SegmentedControl                |

---

## 5. Before vs After

### BEFORE

```
SettingsSubNav button height: ~20px
  (py-s6 = token missing → 0px → only line-height ≈ 20px)

Dashboard button height: 32px
  (padding: 6px 14px → 6+20+6 = 32px)

Visual delta: 12px height difference — tabs looked half-height
```

### AFTER

```
SettingsSubNav button height: 32px ✓
Dashboard button height: 32px ✓

Visual delta: 0px — identical
```

Screenshot evidence: all three controls (Dashboard, Settings top-tab, Settings filter
strip) render at the same 40px container / 32px button specification with identical
padding, gap, radius, shadow, color, and typography.

---

## 6. Verified Parity

Live browser measurements confirm: Settings segmented controls are now visually
identical to the Dashboard source of truth. If a screenshot of the Settings tab strip
is placed next to the Dashboard tab strip at the same scale, they are indistinguishable.
