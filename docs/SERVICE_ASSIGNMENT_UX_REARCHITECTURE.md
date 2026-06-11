# Service Assignment UX Rearchitecture

**Date:** 2026-06-11
**Status:** Approved — ready to implement
**Revision:** v2 — staff-first layout

---

## 1. Audit Findings (unchanged from v1)

### 1.1 Current UX Problems

| #   | Problem                                | Evidence                                                  |
| --- | -------------------------------------- | --------------------------------------------------------- |
| 1   | **Staff selector does not scale**      | Horizontal `flex-wrap` pill buttons — 20+ staff unusable  |
| 2   | **Category label is raw `categoryId`** | Renders `cat-1` not `"Hair"` — active bug                 |
| 3   | **`categories` not in data flow**      | `TeamPageClient` passes `services` only, not `categories` |
| 4   | **No summary**                         | No signal of current assignment state                     |
| 5   | **No search**                          | Full-page scroll required                                 |
| 6   | **All services flat-listed**           | No accordion, no progressive disclosure                   |
| 7   | **No select-all / clear-all**          | Onboarding requires N individual clicks                   |
| 8   | **Empty states have no CTA**           | Dead ends                                                 |
| 9   | **`requiresSpecialist` not shown**     | Hidden attribute                                          |
| 10  | **Duration not formatted**             | 120 shown as "120 mnt" not "2 jam"                        |

### 1.2 Data Available

```typescript
ServiceItem  { id, categoryId, name, duration, price, priceType,
               serviceFlow, requiresSpecialist, isActive }

ServiceCategory  { id, name, iconName, isActive }

ServiceAssignment  { staffId, serviceIds: string[] }

StaffMember  { id, fullName, role, specialty, avatarUrl,
               avatarColor, isActive }
```

`TeamPageClient` must pass `categories` in addition to `services` (1-line fix).

---

## 2. Design Principle: Staff-First

Owner's mental model:

> "Staff ini bisa mengerjakan layanan apa saja?"

NOT:

> "Kategori ini berisi layanan apa saja?"

The primary object is the **staff member**. Categories are a secondary grouping
mechanism that reduces scroll — they are not the entry point.

Consequence: the staff identity and assignment summary must appear **before** any
category or checkbox is visible.

---

## 3. Final Layout (Staff-First)

```
┌──────────────────────────────────────────────────────────┐
│  Penugasan Layanan                                        │
│  Pilih layanan yang dapat dilakukan oleh setiap staff.   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Pilih Staff                                              │
│  [ Dewi Rahayu — Colorist                          ▼ ]   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  [DR]  Dewi Rahayu                  12 layanan  3 kat.   │
│        Colorist  ·  Aktif                                 │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  🔍  Cari layanan...                                      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Hair  (4/6)           [Pilih Semua] [Hapus Semua]  ▶   │
└──────────────────────────────────────────────────────────┘
   ☑  Ladies Haircut + Wash          45 mnt
   ☑  Men Haircut + Wash + Dry       40 mnt
   ☐  Kids Haircut                   30 mnt
   ☐  Hair Spa                       60 mnt  [Specialist]

┌──────────────────────────────────────────────────────────┐
│  Colour & Treatment  (5/8)  [Pilih Semua] [Hapus Semua] ▶│
└──────────────────────────────────────────────────────────┘
   ☑  Root Colour               60 mnt  [Specialist]
   …
```

**Collapsed by default.** Owner expands only relevant categories.

---

## 4. Components Used (no new primitives)

| Block                         | Component / Pattern                        | Notes                                        |
| ----------------------------- | ------------------------------------------ | -------------------------------------------- |
| Section title                 | `SettingsSectionHeader`                    | existing                                     |
| Staff dropdown                | `SettingsSelect`                           | "Name — Role" options                        |
| Summary card                  | Inline block with token classes            | avatar via `avatarColor()` + `getInitials()` |
| Metrics (12 layanan / 3 kat.) | Inline `Metric` sub-component              | token classes only                           |
| Search field                  | Inline `MagnifyingGlass` + `<input>`       | same pattern as HistoryFilterBar             |
| Accordion header              | `<button>` + `CaretDown` + `useState`      | same pattern as ServicesAccordion            |
| "Pilih Semua / Hapus Semua"   | Plain `<button>` with token classes        | stopPropagation                              |
| Service row                   | `<label>` + `<input type="checkbox">`      | checkbox semantics require label             |
| Specialist badge              | Inline token span                          | `bg-st-upcoming-bg text-st-upcoming`         |
| Duration                      | `formatDuration()` util                    | "45 mnt", "2 jam"                            |
| Empty state (no staff)        | `SettingsEmptyState`                       | link to Direktori tab                        |
| Empty state (no services)     | `SettingsEmptyState` + `SettingsAddButton` | link to Layanan                              |
| Dirty state                   | `ctrl.isDirty` + `ctrl.handleSave`         | BaseSettingsController                       |

`SettingsListCard` — NOT used. Service rows need `<label>` semantics for checkboxes.
`StatCard` — NOT used. Uses V1 hardcoded tokens.

---

## 5. Category Header: "4/6" Format

```tsx
// assigned = services in this category that are in assignedIds
// total    = all active services in this category

const assigned = catServices.filter((s) => assignedIds.has(s.id)).length;
const total = catServices.length;

// Header label:
{
  cat.name;
}
({ assigned }) / { total };
```

Category with 0 services is hidden (filtered out before rendering).

---

## 6. Search Behaviour

- Filters `service.name` (case-insensitive, includes partial match)
- Categories with zero matching services: hidden
- Empty search result → inline "Tidak ada layanan yang cocok" text, no SettingsEmptyState
- Clearing search → all categories visible again (collapsed state preserved)

---

## 7. Dirty State

`ctrl.isDirty` is already managed by `useTeamController` (every `setAssignment` call
sets `isDirty = true`).

`SettingsActionBar` at page level handles "Simpan Perubahan" / "Batalkan" display.
`ServiceAssignmentSection` does not need its own save button — the global bar already
responds to `ctrl.isDirty`.

No change needed to controller or action bar.

---

## 8. Files to Change

| File                                         | Change                                              |
| -------------------------------------------- | --------------------------------------------------- |
| `team/sections/ServiceAssignmentSection.tsx` | Full rewrite                                        |
| `team/TeamForm.tsx`                          | Add `categories: ServiceCategory[]` prop, pass down |
| `team/TeamPageClient.tsx`                    | Pass `servicesCtrl.domain.categories`               |

**Unchanged:**

- All shared components
- `useTeamController.ts`
- `useServicesController.ts`
- All other team sections
- Customer app

---

## 9. Scalability

| Staff / Services   | Experience                                                      |
| ------------------ | --------------------------------------------------------------- |
| 4 staff, 8 svc     | Select dropdown comfortable; accordion optional convenience     |
| 20 staff, 50 svc   | Search + accordion makes any service reachable in <3 taps       |
| 100 staff, 200 svc | Select searchable natively; search + category means O(1) lookup |
