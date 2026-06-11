# Settings Foundation Cleanup Report

**Date:** 2026-06-11
**Build:** ✅ `Compiled successfully` — 24/24 pages generated, zero type errors

---

## 1. Files Changed

| File                          | Change                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| `SettingsNavigationPanel.tsx` | Moved "Pengguna & Akses" from APLIKASI group into TIM & OPERASIONAL group            |
| `useTeamController.ts`        | Fixed addStaff ID bug — one `nextId()` call, shared across staff/assignment/schedule |
| `SettingsPageHeader.tsx`      | Replaced all `style={{}}` and hardcoded hex with Tailwind design tokens              |
| `StaffDirectorySection.tsx`   | Added `ConfirmDialog` before `deactivateStaff` — consistent with Services/Produk     |

---

## 2. Files Deleted

### V1 Ghost Types + Data Layer (3 files)

| File                          | Reason                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| `types/settings.types.ts`     | V1 type file — shapes incompatible with V2 (e.g. `name` vs `fullName` on StaffMember). Zero V2 consumers. |
| `mocks/settings-mock.ts`      | Only consumed by `use-salon-settings.ts` (also deleted). Zero V2 consumers.                               |
| `hooks/use-salon-settings.ts` | Only consumed by V1 root components (all deleted below). Zero V2 consumers.                               |

### V1 Shared Directory (3 files + directory)

| File                               | Reason                                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `settings/shared/FormField.tsx`    | V1 component — full hex/arbitrary violations. Zero imports. Superseded by `SettingsFieldGroup`.      |
| `settings/shared/SaveButton.tsx`   | V1 component — full hex violations. Zero imports. Superseded by `SettingsPageHeader` action buttons. |
| `settings/shared/SettingsCard.tsx` | V1 component — `bg-white`, `shadow-[...]`, hex. Zero imports. Superseded by `SettingsContentCard`.   |

### V1 Root Settings Components (10 files)

| File                                | Reason                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `settings/AddOnsSection.tsx`        | V1 orphan — full hex/arbitrary violations. Zero imports. Superseded by `services/sections/AddOnsSection.tsx`. |
| `settings/GeneralInfoSection.tsx`   | V1 orphan — zero imports.                                                                                     |
| `settings/OtherSettingsSection.tsx` | V1 orphan — zero imports.                                                                                     |
| `settings/ProfileSection.tsx`       | V1 orphan — zero imports.                                                                                     |
| `settings/RolePermissionMatrix.tsx` | V1 orphan — zero imports.                                                                                     |
| `settings/ServicesSection.tsx`      | V1 orphan — zero imports.                                                                                     |
| `settings/SettingsTopTabs.tsx`      | V1 orphan — zero imports.                                                                                     |
| `settings/TeamSection.tsx`          | V1 orphan — hex palette + `style={{ backgroundColor }}`. Zero imports.                                        |
| `settings/UserManagementModal.tsx`  | V1 orphan — full hex/arbitrary violations. Zero imports.                                                      |
| `settings/UsersAndRolesSection.tsx` | V1 orphan — zero imports.                                                                                     |

**Total deleted: 16 files**

---

## 3. Navigation Structure After Cleanup

```
SALON
  ├── Brand & Profil    /dashboard/settings/brand
  ├── Layanan           /dashboard/settings/layanan
  └── Produk & Paket    /dashboard/settings/produk-paket

TIM & OPERASIONAL
  ├── Tim               /dashboard/settings/tim
  ├── Pengguna & Akses  /dashboard/settings/pengguna   ← moved from APLIKASI
  └── Operasional       /dashboard/settings/operasional

APLIKASI
  └── Booking App       /dashboard/settings/booking
```

Routes unchanged. Icons unchanged. Selected state behavior unchanged.

---

## 4. Proof: addStaff Bug Fixed

**Before (broken):**

```ts
const addStaff = useCallback((draft: Omit<StaffMember, 'id'>) => {
  setDirtyDomain((d) => ({
    ...d,
    staff:       [...d.staff,       { ...draft, id: nextId('sty') }],       // ID A
    assignments: [...d.assignments, { staffId: nextId('sty'), ... }],        // ID B (different)
    schedules:   [...d.schedules,   defaultSchedule(nextId('sty'))],         // ID C (different)
  }));
}, []);
```

`staff.id !== assignment.staffId !== schedule.staffId`
→ New staff had no linked assignment or schedule.

**After (fixed):**

```ts
const addStaff = useCallback((draft: Omit<StaffMember, "id">) => {
  const id = nextId("sty");
  setDirtyDomain((d) => ({
    ...d,
    staff: [...d.staff, { ...draft, id }],
    assignments: [...d.assignments, { staffId: id, serviceIds: [] }],
    schedules: [...d.schedules, defaultSchedule(id)],
  }));
}, []);
```

One ID generated. All three entities reference the same `id`.

---

## 5. Proof: SettingsPageHeader No Inline Styles

**Before:**

```tsx
style={{
  height: 40, width: 120, borderRadius: 12,
  background: '#FFFFFF',
  border: '1px solid #E5E5EA',
  color: '#FF3B30',
  opacity: disabled ? 0.4 : 1,
  ...
}}
onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = '#333333'; }}
onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = '#1a1a1a'; }}
```

**After:**

```tsx
// Cancel button
className =
  "h-10 w-30 rounded-r12 border border-bd-card bg-bg-card px-s16 text-ts-fn font-medium text-ac-danger transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40";

// Save button
className =
  "flex h-10 items-center justify-center rounded-r12 bg-tx-primary px-s16 text-ts-fn font-medium text-bg-card transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
```

Zero `style={{}}`. Zero hex values. All tokens from design system.

---

## 6. Dead V1 Components Removed

Confirmed by `grep` before deletion — all 16 files had zero consumers outside their own V1 dependency chain.

V1 chain fully eliminated:

```
settings.types.ts
  └── settings-mock.ts
        └── use-salon-settings.ts
              └── [AddOnsSection, ProfileSection, GeneralInfoSection, ServicesSection]
                    (all root settings/*.tsx orphans)
```

Auto-import will no longer suggest `SettingsCard`, `SaveButton`, or `FormField` to developers building Team/Operational/Booking domains.

---

## 7. Final Verdict

```
✅ SETTINGS FOUNDATION STABLE

All 7 tasks complete:
  1. Navigation reorganized — Pengguna & Akses in Tim & Operasional
  2. addStaff ID bug fixed — one ID shared across staff/assignment/schedule
  3. SettingsPageHeader — zero inline styles, zero hex
  4. settings.types.ts deleted — V1 ghost types gone
  5. 16 V1 dead files deleted — settings/shared/ + root V1 components
  6. deactivateStaff — ConfirmDialog added, consistent with other domains
  7. Build: ✅ Compiled successfully, 24/24 pages, zero type errors

Team Domain may continue.
```
