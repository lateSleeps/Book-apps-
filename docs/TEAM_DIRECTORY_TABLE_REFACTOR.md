# Team Directory — Table Refactor Report

**Date:** 2026-06-11
**Scope:** `StaffDirectorySection.tsx` only — Service Assignment, Weekly Schedule, Leave untouched.

---

## 1. Reused Components

| Component                          | Source                       | Usage                                                   |
| ---------------------------------- | ---------------------------- | ------------------------------------------------------- |
| `SettingsSectionHeader`            | `settings/layout`            | Section title + description + Add Staff action slot     |
| `SettingsAddButton`                | `settings/components/shared` | Header CTA + empty state CTA                            |
| `SettingsEmptyState`               | `settings/components/shared` | Zero-staff empty state with action                      |
| `EntityActionMenu`                 | `settings/components/shared` | ⋮ menu per row (Edit / Nonaktifkan / Hapus)             |
| `ConfirmDialog` + `ConfirmPending` | `settings/components/shared` | Deactivate + Delete confirmation                        |
| `SettingsSideSheet`                | `settings/layout`            | Add/Edit form panel (same as Layanan, Produk)           |
| `SettingsFormGrid`                 | `settings/components/shared` | 2-col form layout inside SideSheet                      |
| `SettingsFieldGroup`               | `settings/components/shared` | Label + input wrapper                                   |
| `SettingsInput`                    | `settings/components/shared` | Nama, Telepon fields                                    |
| `SettingsUploadField`              | `settings/components/shared` | Avatar photo upload                                     |
| `avatarColor()` + `getInitials()`  | `shared/lib/avatar`          | Avatar background color + initials                      |
| `VisitTable` grid pattern          | `history/VisitTable.tsx`     | `display:grid` with `fr` columns, `bg-bg-header` header |

---

## 2. Removed Components / Patterns

| Removed                                    | Replaced by                                                |
| ------------------------------------------ | ---------------------------------------------------------- |
| `SettingsListCard` — custom card per staff | Data table row (grid layout)                               |
| Inline `Edit` / `Nonaktifkan` text links   | `EntityActionMenu` (⋮)                                     |
| `SettingsContentCard` inline expand form   | `SettingsSideSheet`                                        |
| `SettingsAddButton` at section bottom      | `SettingsAddButton` in `SettingsSectionHeader.action`      |
| `StaffForm` expand-in-list component       | `StaffFormContent` inside `SettingsSideSheet`              |
| Bare `SettingsEmptyState` (no action)      | `SettingsEmptyState` with `action` CTA                     |
| Deactivate-only ConfirmDialog              | Shared `ConfirmPending` state for both deactivate + delete |

---

## 3. Structural Changes

### Before

```
StaffDirectorySection
├── SettingsSectionHeader (title + description only)
├── staff.map → SettingsListCard
│   ├── avatar (fallback: initials)
│   ├── title (fullName)
│   ├── description (role · specialty · phone)
│   ├── badges: [role, Aktif/Nonaktif]
│   └── actions: "Edit" text link, "Nonaktifkan" text link
│       └── StaffForm (expands inline below card)
└── SettingsAddButton (BOTTOM of list — wrong position)
```

### After

```
StaffDirectorySection
├── SettingsSectionHeader
│   title="Direktori Staff"
│   description="Kelola anggota tim, role, dan status aktif."
│   action=<SettingsAddButton>Tambah Staff</SettingsAddButton>
│
├── [empty state] OR [table]
│   Empty: SettingsEmptyState + action=<SettingsAddButton>
│
│   Table:
│   ├── StaffTableHeader (grid row, bg-bg-header)
│   │   └── Staff | Role | Telepon | Status | Jadwal | Aksi
│   └── staff.map → StaffTableRow (grid row)
│       ├── Staff: avatar image OR initials bubble + fullName
│       ├── Role: badge (token classes, no hardcoded colors)
│       ├── Telepon: phone string
│       ├── Status: Aktif / Nonaktif badge (token classes)
│       ├── Jadwal: scheduleLabel() — "Sen - Sab" or "N hari/minggu"
│       └── Aksi: EntityActionMenu ⋮
│           ├── Edit Staff → openEdit() → SettingsSideSheet
│           ├── Nonaktifkan Staff (if active) → ConfirmDialog
│           └── Hapus Permanen → ConfirmDialog (with data warning)
│
├── SettingsSideSheet (Add / Edit Staff)
│   └── StaffFormContent: foto, nama, HP, role, spesialisasi
│
└── ConfirmDialog (shared for deactivate + delete)
```

---

## 4. Controller Change

Added `deleteStaff` to `TeamController` interface and `useTeamController` hook:

```typescript
// Interface
deleteStaff: (id: string) => void;

// Implementation — removes from all sub-domains atomically
const deleteStaff = useCallback((id: string) => {
  setDirtyDomain((d) => ({
    ...d,
    staff:       d.staff.filter((s) => s.id !== id),
    assignments: d.assignments.filter((a) => a.staffId !== id),
    schedules:   d.schedules.filter((sch) => sch.staffId !== id),
    leaves:      d.leaves.filter((l) => l.staffId !== id),
  }));
}, []);
```

---

## 5. Delete Flow (Permanent)

No soft-delete. No archive. Immediate removal.

Dialog title: `Hapus Staff?`

Message logic:

```typescript
const hasAssignments = (assignment?.serviceIds.length ?? 0) > 0;
const hasSchedule = schedule?.days.some((d) => d.enabled) ?? false;

// Simple case (no data)
("Staff akan dihapus permanen.");

// Has service assignments or active schedule days
("Staff akan dihapus permanen. Semua penugasan layanan dan jadwal kerja staff ini juga akan dihapus.");
```

---

## 6. Edit Flow

`Edit Staff` in the ⋮ menu opens `SettingsSideSheet` pre-populated with the staff's current data.

Form fields: Foto (avatar upload), Nama Lengkap, No. HP, Role, Spesialisasi.

`Simpan` calls `ctrl.updateStaff(id, draft)`. Sheet closes on save.

No modal dialogs. Matches the Layanan / Produk / Paket SideSheet pattern exactly.

---

## 7. Jadwal Column Logic

`scheduleLabel(schedule)` computes a short summary from `WeeklySchedule.days`:

| Enabled days     | Output                     |
| ---------------- | -------------------------- |
| 0                | Libur                      |
| 7                | Setiap hari                |
| Contiguous range | `Sen - Sab` (first - last) |
| Non-contiguous   | `N hari/minggu`            |

Example with mock data (Mon–Sat active, Sun off): `Sen - Sab`

---

## 8. Design System Compliance

### No hardcoded colors

| Element                                         | Token used                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| Role badge — Owner                              | `bg-st-confirmed-bg text-st-confirmed`                             |
| Role badge — Stylist, Nail Artist, Receptionist | `bg-bg-control text-tx-subtle`                                     |
| Role badge — Colorist                           | `bg-st-upcoming-bg text-st-upcoming`                               |
| Role badge — Therapist                          | `bg-st-in-progress-bg text-st-in-progress`                         |
| Status — Aktif                                  | `bg-st-in-progress-bg text-st-in-progress`                         |
| Status — Nonaktif                               | `bg-bg-control text-tx-subtle`                                     |
| Table header bg                                 | `bg-bg-header`                                                     |
| Row separator                                   | `border-bd-row`                                                    |
| Row hover                                       | `hover:bg-bg-hover`                                                |
| Card container                                  | `border-bd-card bg-bg-card shadow-card`                            |
| Avatar bg                                       | `avatarColor(fullName).bg` — Design System utility, not inline hex |

Only inline style used: `style={{ background: bg }}` on avatar div — computed from `avatarColor()` utility (same pattern as `VisitTableRow`). Cannot be expressed as a Tailwind class because it's a runtime-computed value from a name hash.

### No hardcoded spacing

All spacing uses design tokens: `gap-s16`, `px-s20`, `py-s12`, `px-s8`, `py-0.5`, `gap-s12`, `rounded-rF`, `rounded-r16`, `rounded-r10`.

Grid column gap is `columnGap: 16` in the GRID_STYLE const — matches `VisitTable` established pattern, not a magic number.

---

## 9. Future Scalability

Architecture is filter/sort/search-ready without structural changes:

- **Search**: add `searchQuery` state → filter `staff` array before `.map()` in the table
- **Filter by role**: add `activeRole: StaffRole | null` → filter `staff` array
- **Filter by status**: add `activeStatus: boolean | null` → filter `staff` array
- **Sort**: add `sortKey: keyof StaffMember | null` state → `.sort()` before `.map()`
- **Filter bar**: add a `SettingsFilterBar` above the table (same pattern as `HistoryFilterBar`)

None of these require changing the table row structure. The `StaffTableRow` is a pure presentation component that receives its props; sorting/filtering lives in `StaffDirectorySection`.

---

## 10. Build Verification

```
pnpm --filter owner build
✓ Compiled successfully
✓ Generating static pages (24/24)
```

Zero TypeScript errors. Zero ESLint errors.

---

## 11. Files Modified

| File                                      | Change                                               |
| ----------------------------------------- | ---------------------------------------------------- |
| `hooks/settings/useTeamController.ts`     | Added `deleteStaff` to interface + implementation    |
| `team/sections/StaffDirectorySection.tsx` | Full refactor — table layout, SideSheet, delete flow |

## 12. Files NOT Modified

- `team/TeamForm.tsx`
- `team/TeamPageClient.tsx`
- `team/sections/ServiceAssignmentSection.tsx`
- `team/sections/WeeklyScheduleSection.tsx`
- `team/sections/LeaveSection.tsx`
- All shared components (EntityActionMenu, SettingsSideSheet, ConfirmDialog, etc.)
- `useTeamController.ts` domain logic (only added `deleteStaff`)
