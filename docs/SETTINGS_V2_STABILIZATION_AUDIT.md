# Settings V2 Stabilization Audit

**Date:** 2026-06-11
**Auditor:** Claude Code
**Scope:** Settings V2 architecture — Brand, Layanan, Produk & Paket, Team

---

## Scores

| Dimension     | Score  | Reason                                                                                                           |
| ------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| Architecture  | 62/100 | Structure is mostly correct but dead V1 code, type duplication, and a logic bug in addStaff drag it down         |
| Design System | 45/100 | SettingsPageHeader (the most visible component) is entirely inline-styled hex. V1 orphans are also non-compliant |
| Scalability   | 58/100 | Controller pattern is solid but isDirty inconsistency + cross-domain coupling will hurt when 3 more domains land |

---

## Step 1 — Domain Consistency Audit

### Structure Comparison

| Domain         | types/                                                                   | hooks/                         | PageClient                  | sections/                                    | page.tsx                         | Verdict                                               |
| -------------- | ------------------------------------------------------------------------ | ------------------------------ | --------------------------- | -------------------------------------------- | -------------------------------- | ----------------------------------------------------- |
| Brand & Profil | `settings/types/brand.types.ts`                                          | `useBrandProfileController.ts` | `BrandPageClient.tsx`       | 5 sections in `brand/sections/`              | `settings/brand/page.tsx`        | ✅ Complete                                           |
| Layanan        | `settings/types/services.types.ts`                                       | `useServicesController.ts`     | `ServicesPageClient.tsx`    | `services/sections/` (4 sections) + `forms/` | `settings/layanan/page.tsx`      | ✅ Complete                                           |
| Produk & Paket | types in `services.types.ts` (shared) + `ProdukPaketDomain` in hook file | `useProdukPaketController.ts`  | `ProdukPaketPageClient.tsx` | `produk-paket/forms/`                        | `settings/produk-paket/page.tsx` | ⚠️ Domain type `ProdukPaketDomain` lives in hook file |
| Tim            | `settings/types/team.types.ts`                                           | `useTeamController.ts`         | `TeamPageClient.tsx`        | `team/sections/` (4 sections)                | `settings/tim/page.tsx`          | ✅ Complete                                           |

### Divergences

**D-1 (P1): `ProdukPaketDomain` interface is defined inside `useProdukPaketController.ts`**
Every other domain defines its aggregate type in `settings/types/*.ts`. `ProdukPaketDomain` is buried inside the hook file. When the backend contract is formalized, this type has no canonical file to move to.

**D-2 (P1): Cross-domain controller dependency not managed**
`ProdukPaketPageClient` and `TeamPageClient` both call `useServicesController()` to pass `services` downstream. This creates a second live controller (with its own mock state) inside pages that don't own services. When Services migrates to tRPC, these pages will need updating. The dependency is implicit and undocumented.

**D-3 (P2): No per-domain barrel `index.ts`**
Each domain (`brand/`, `services/`, `produk-paket/`, `team/`) exposes components via direct import paths, not a barrel. This is fine now, but as domains grow (Operational, Booking App, Access), the import paths become long and inconsistent. A `brand/index.ts` pattern would scale better.

---

## Step 2 — Controller Contract Audit

### BaseSettingsController (source of truth)

```ts
export interface BaseSettingsController {
  isDirty: boolean;
  isSaving: boolean;
  handleSave: () => void;
  handleReset: () => void;
}
```

### Per-Controller Compliance

| Controller                  | Extends Base | isDirty                         | isSaving | handleSave                            | handleReset | Violations                                              |
| --------------------------- | ------------ | ------------------------------- | -------- | ------------------------------------- | ----------- | ------------------------------------------------------- |
| `useBrandProfileController` | ✅           | ✅ (derived via JSON.stringify) | ✅       | ⚠️ `Promise<void>` (base says `void`) | ✅          | isDirty + isSaving re-declared in interface (redundant) |
| `useServicesController`     | ✅           | ✅ (manual flag)                | ✅       | ✅ sync void                          | ✅          | isDirty mechanism differs from Brand                    |
| `useProdukPaketController`  | ✅           | ✅ (manual flag)                | ✅       | ✅ sync void                          | ✅          | None                                                    |
| `useTeamController`         | ✅           | ✅ (manual flag)                | ✅       | ✅ sync void                          | ✅          | **Logic bug in addStaff** (see below)                   |

### Contract Violations

**C-1 (P1): `handleSave` return type mismatch**
`BrandProfileController.handleSave` returns `Promise<void>`. `BaseSettingsController.handleSave` declares `() => void`. In TypeScript, `Promise<void>` is not assignable to `void` in all strict contexts. `SettingsPageHeader` calls `actions?.onSave()` without awaiting — this is fine at runtime but wrong at the type level. The base contract and interface override are inconsistent.

**C-2 (P1): `isDirty` computed differently across controllers**

- Brand: `JSON.stringify(profile) !== JSON.stringify(saved)` — derived, always accurate.
- Services / ProdukPaket / Team: manual `setIsDirty(true)` in `setDirtyDomain`. If a reset happens but `setIsDirty(false)` is called inconsistently, the flag can be stale. (Currently correct, but fragile.)

**C-3 (P2): Redundant field declarations in `BrandProfileController`**
`isDirty` and `isSaving` are declared again inside `BrandProfileController extends BaseSettingsController`. This is harmless but noisy and misleads readers into thinking brand's fields are overriding something.

**C-4 (P0 BUG): `useTeamController.addStaff` uses three different generated IDs**

```ts
// Current (BROKEN):
const addStaff = useCallback((draft: Omit<StaffMember, 'id'>) => {
  setDirtyDomain((d) => ({
    ...d,
    staff: [...d.staff, { ...draft, id: nextId('sty') }],           // ID 1
    assignments: [...d.assignments, { staffId: nextId('sty'), ... }], // ID 2 (different!)
    schedules: [...d.schedules, defaultSchedule(nextId('sty'))],      // ID 3 (different!)
  }));
}, []);
```

`nextId()` calls `Date.now()` each time. Three calls in the same render tick can return the same millisecond value OR slightly different values — but even if they collide, the semantics are wrong: assignments and schedules reference a `staffId` that does not match the staff member's `id`. Any feature that looks up assignments or schedule by `staffId` will find nothing for a newly added staff member.

---

## Step 3 — Design System Audit

### Violations by File

#### `SettingsPageHeader.tsx` — CRITICAL (P0)

This is the most visible component in the entire Settings UI. Both action buttons (Batal + Simpan Perubahan) are 100% inline styles with hardcoded hex values:

```tsx
// style={{}} violations — lines 34-46, 54-74
style={{
  height: 40, width: 120, borderRadius: 12,
  background: '#FFFFFF',          // should be: className="bg-bg-card"
  border: '1px solid #E5E5EA',    // should be: border-bd-card
  color: '#FF3B30',               // should be: text-c-danger
  opacity: disabled ? 0.4 : 1,    // should be: disabled:opacity-40
  ...
}}
// + onMouseEnter/onMouseLeave mutating style.background inline
```

Also uses `color: '#1a1a1a'`, `'#333333'`, `'#8E8E93'`, `'#E5E5EA'` directly.

**No Tailwind tokens. No design system. The save/cancel buttons are the most-interacted-with UI in all of Settings.**

#### V1 Orphan Files (root `settings/shared/`) — CRITICAL (P0 to delete, P1 if kept)

These files are dead (zero imports), but their presence is a liability:

| File                      | Violations                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `shared/SettingsCard.tsx` | `bg-white`, `shadow-[0_1px_4px_...]`, `text-[18px]`, `text-[#1a1a1a]`, `text-[13px]`, `text-[#999]` |
| `shared/FormField.tsx`    | `text-[13px]`, `text-[#1a1a1a]`, `text-[12px]`, `text-[#aaa]`                                       |
| `shared/SaveButton.tsx`   | `bg-[#e0e0e0]`, `text-[#999]`, `bg-[#16a34a]`, `bg-[#15923f]`, `text-[13px]`                        |

#### V1 Orphan Components (root `settings/`) — HIGH (P1 to delete)

| File                      | Primary Violations                                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `AddOnsSection.tsx`       | `text-[13px]`, `text-[#999]`, `bg-[#16a34a]`, `text-[#666]`, `text-[#1a1a1a]`, `px-2 py-0.5 bg-green-100`, `text-[12px]`, `text-[14px]` |
| `TeamSection.tsx`         | 8-entry hex palette array (`'#f5c4ab'`, etc.) + `style={{ backgroundColor: color }}`                                                    |
| `UserManagementModal.tsx` | `text-[16px]`, `border-[#e8e8e6]`, `focus:ring-[#16a34a]`, `text-[13px]`, `text-[12px]`                                                 |

#### V2 Active Files — Minor Violations

| File                              | Violation                                                                                                          | Severity |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| `StaffDirectorySection.tsx:40`    | `AVATAR_PALETTE = ['#ddedf8', ...]` — hex palette used for `avatarColor` rendered as `style={{ backgroundColor }}` | P2       |
| `SettingsNavigationPanel.tsx:188` | `my-[1px]` — arbitrary spacing value                                                                               | P2       |

#### Data Fields with Hex (Acceptable but Worth Noting)

`blobColor` in `ServiceCategory` and `BLOB_PRESETS` in `CategoryForm.tsx` are customer-app color values stored in the database, not CSS styling. These are intentional. `avatarColor` in `StaffMember` and mock data is the same pattern but renders as inline style — the rendering is the violation, not the data field.

### Design System Score Breakdown

| Area                                                | Score      | Notes                                         |
| --------------------------------------------------- | ---------- | --------------------------------------------- |
| V2 components (`shared/`, `layout/`)                | 90/100     | Clean token usage throughout                  |
| V2 active pages (Brand, Layanan, ProdukPaket, Team) | 85/100     | One `my-[1px]` and `avatarColor` inline style |
| `SettingsPageHeader.tsx`                            | 0/100      | Entirely inline-styled hex                    |
| V1 orphan files (dead but present)                  | 0/100      | Full violations, no tokens                    |
| **Overall**                                         | **45/100** | Weighted by presence                          |

---

## Step 4 — Barrel Export Audit

### `layout/index.ts`

```ts
SettingsPageShell,
  SettingsSection,
  SettingsSectionHeader,
  SettingsContentCard,
  SettingsActionBar,
  SettingsSubNav,
  SettingsTabbedCard,
  SettingsPanel,
  SettingsPanelSection,
  SettingsSideSheet;
```

- All 10 exports point to existing files. ✅
- `SettingsEntitySheet` removed (from previous session). ✅
- No circular dependencies detected. ✅

### `components/shared/index.ts`

All 19 exports verified against existing files. ✅ No dead exports.

### Missing Barrels (Problems)

**B-1 (P1): No barrel for `hooks/settings/`**
Consumers import directly: `import { useBrandProfileController } from '@/features/dashboard/hooks/settings/useBrandProfileController'`. No `hooks/settings/index.ts` exists. This is fine for 4 controllers, but with 6+ domains it becomes an import path maintenance problem.

**B-2 (P0 — dead code): `components/settings/shared/` has no barrel and zero consumers**
`FormField.tsx`, `SaveButton.tsx`, `SettingsCard.tsx` are not imported anywhere in the codebase. They are silent dead code that could be accidentally picked up by auto-import.

**B-3 (P0 — dead code): Root `components/settings/*.tsx` V1 components have zero consumers**
Confirmed by grep: `AddOnsSection.tsx`, `GeneralInfoSection.tsx`, `OtherSettingsSection.tsx`, `ProfileSection.tsx`, `RolePermissionMatrix.tsx`, `ServicesSection.tsx`, `TeamSection.tsx`, `UserManagementModal.tsx`, `UsersAndRolesSection.tsx`, `SettingsTopTabs.tsx` — all dead.

**Exception:** `SettingsNavigationPanel.tsx` and `SettingsPageHeader.tsx` at the same root level are V2 ACTIVE — used by `settings/layout.tsx`.

---

## Step 5 — Duplication Audit

### Type Duplication

**T-1 (P0): `features/dashboard/types/settings.types.ts` is a V1 ghost type file**

This file defines: `SalonProfile`, `ServiceCategory`, `ServiceQuestion`, `Service`, `StaffMember`, `WeeklySchedule`, `AddOnProduct`, `ShiftTemplate`, `SalonSettings` — the old monolith types.

The V2 types in `components/settings/types/` have completely different shapes:

| Entity            | V1 (`settings.types.ts`)                                                           | V2 (`services.types.ts` / `team.types.ts`)                          |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `StaffMember`     | `name`, `status: ACTIVE/INACTIVE`, `availability: WeeklySchedule`, `color: string` | `fullName`, `isActive: boolean`, `avatarColor: string`, `specialty` |
| `ServiceCategory` | `name`, `icon?`, `description?`                                                    | `color`, `blobColor`, `iconName`, `isActive`, `sortOrder`           |
| `WeeklySchedule`  | `monday: TimeSlot[]` ... `sunday`                                                  | `days: { day: WeekDay, enabled, startTime, endTime }[]`             |

If any new domain accidentally imports from `settings.types.ts`, it will get wrong shapes. The file should be deleted.

**T-2 (P1): `ProdukPaketDomain` interface lives in `useProdukPaketController.ts`**
It should live in `components/settings/types/services.types.ts` (since it contains `AddOnProduct[]` and `ServiceBundle[]` which are already there).

### Utility Duplication

**U-1 (P2): `nextId(prefix)` is copy-pasted in 3 controllers**

```ts
// Identical in useServicesController, useProdukPaketController, useTeamController:
function nextId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}
```

Should live in a shared utility (e.g., `shared/lib/id.ts`).

**U-2 (P2): `setDirtyDomain` pattern is copy-pasted in 3 controllers**

```ts
// Identical pattern in useServicesController, useProdukPaketController, useTeamController:
function setDirtyDomain(updater: (d: Domain) => Domain) {
  setDomain(updater);
  setIsDirty(true);
}
```

**U-3 (P2): Currency formatting**
`formatPrice` is now centralized in `shared/lib/format.ts`. ✅ Verify no remaining local copies (the old root `AddOnsSection.tsx` is dead, so no active duplicates).

### Pattern Duplication

**P-1 (P2): ConfirmDialog usage is copy-pasted across 3 `*Form.tsx` files**
Each of `ServicesForm.tsx`, `ProdukPaketForm.tsx`, and `TeamForm.tsx` (implicitly) manages its own `confirmPending` state:

```ts
const [confirmPending, setConfirmPending] = useState<ConfirmPending | null>(
  null,
);
```

This is acceptable for now. When Operational and Booking App domains arrive, this becomes a 5th and 6th copy. The pattern is correct — the question is whether the `ConfirmPending` state should live in sections rather than the form orchestrator.

---

## Step 6 — Settings Layout Contract

### Verified Contract per Domain

| Contract Requirement                                             | Brand                                                     | Layanan                      | Produk & Paket           | Tim                                                   |
| ---------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------- | ------------------------ | ----------------------------------------------------- |
| Uses `SettingsPageShell` as outermost                            | ✅                                                        | ✅                           | ✅                       | ✅                                                    |
| Uses left `SettingsNavigationPanel`                              | ✅ (via layout)                                           | ✅                           | ✅                       | ✅                                                    |
| Save/Cancel in page header (via Context)                         | ✅ `useRegisterSettingsActions`                           | ✅                           | ✅                       | ✅                                                    |
| `SettingsSideSheet` for add/edit                                 | ❌ None (inline form — correct, brand is a single entity) | ✅ Category + Service sheets | ✅ Addon + Bundle sheets | ✅ Staff sheet                                        |
| `ConfirmDialog` for delete                                       | ❌ No delete (correct)                                    | ✅                           | ✅                       | Partial (deactivateStaff only, no hard delete dialog) |
| Section header via `SettingsSectionHeader`                       | ✅ per section                                            | ✅                           | ✅                       | ✅                                                    |
| Card container via `SettingsContentCard` or `SettingsTabbedCard` | ✅                                                        | ✅ TabbedCard                | ✅ TabbedCard            | ✅ TabbedCard                                         |

### Divergences

**L-1 (P1): Team has `deactivateStaff` but no delete confirmation dialog**
Services and ProdukPaket use `ConfirmDialog` before deletion. Team's `EntityActionMenu` presumably shows "Nonaktifkan" which calls `deactivateStaff` directly without confirmation. This is a UX inconsistency that will confuse users (no "are you sure?").

**L-2 (P2): `SettingsNavigationPanel` uses `weight="regular"` for inactive icons**
The V2 standard is `weight="duotone"` for the settings UI. The nav panel uses `regular` for inactive and `duotone` for active. This is a deliberate design choice, but it differs from SettingsIconPicker which uses `duotone` as the default weight throughout. Not a bug — document the intentional difference.

---

## Step 7 — Team Domain Readiness: What Debt Would Be Multiplied?

If Team Domain were built today (note: TeamPageClient, useTeamController, and all 4 sections already exist), any new work on the Team domain would inherit:

### P0 — Block Before Expanding Team Domain

| ID   | Issue                                                                                                                     | File                           | Impact if Unresolved                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| P0-1 | `useTeamController.addStaff` BUG: three different generated IDs — staff, assignment, and schedule don't share the same ID | `useTeamController.ts:150-156` | Newly added staff have broken assignments and schedules. Feature is silently unusable.                                          |
| P0-2 | `SettingsPageHeader.tsx` 100% inline-styled hex — save/cancel buttons violate every design rule                           | `SettingsPageHeader.tsx:30-78` | Every domain's save flow renders through this component. Not fixable per-domain.                                                |
| P0-3 | V1 dead code: `settings/shared/` and root `settings/*.tsx` orphans still present                                          | 12 files                       | Auto-import will suggest wrong components. New developers will import `SaveButton` or `SettingsCard` instead of V2 equivalents. |
| P0-4 | `settings.types.ts` V1 ghost types still present                                                                          | `types/settings.types.ts`      | `StaffMember` in V1 and V2 have different field names. Wrong import = silent type errors.                                       |

### P1 — Fix Before Team Domain Goes Live in Production

| ID   | Issue                                                                                      | File                                                  | Impact                                                                                      |
| ---- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| P1-1 | `ProdukPaketDomain` interface inside hook file                                             | `useProdukPaketController.ts:9-12`                    | Type has no home. Breaks convention.                                                        |
| P1-2 | `handleSave` return type mismatch vs BaseSettingsController                                | `useBrandProfileController.ts:62`                     | Confuses future developers extending the base contract.                                     |
| P1-3 | Cross-domain controller dependency (`useServicesController` in ProdukPaket and Team pages) | `ProdukPaketPageClient.tsx:7`, `TeamPageClient.tsx:7` | Two isolated mock states for Services. When migrating to tRPC, two consumers need updating. |
| P1-4 | Team `deactivateStaff` lacks confirmation dialog                                           | `StaffDirectorySection.tsx`                           | UX inconsistency with Services and ProdukPaket delete flows.                                |

### P2 — Technical Debt to Clean Up Before More Domains

| ID   | Issue                                                                                      | Impact                                                  |
| ---- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| P2-1 | `nextId()` copy-pasted in 3 controllers                                                    | 4th controller (Operational?) gets a 4th copy           |
| P2-2 | `setDirtyDomain` copy-pasted in 3 controllers                                              | Same                                                    |
| P2-3 | `isDirty` computed differently (JSON.stringify vs manual flag)                             | Inconsistent behavior when reset/save edge cases appear |
| P2-4 | `AVATAR_PALETTE` hex + `style={{ backgroundColor: avatarColor }}` in StaffDirectorySection | Renders inline style on every staff card                |
| P2-5 | `my-[1px]` in SettingsNavigationPanel                                                      | Minor but fails audit                                   |

---

## Required Fixes Before Team Domain Expands

These are the items that must be resolved. Order matters.

```
1. Fix P0-1: useTeamController.addStaff — capture nextId once, use same ID for staff + assignment + schedule
2. Fix P0-2: SettingsPageHeader.tsx — replace all style={{}} and hex with Tailwind tokens
3. Fix P0-3: Delete V1 orphan files (settings/shared/ + root settings/*.tsx except NavigationPanel and PageHeader)
4. Fix P0-4: Delete settings.types.ts (V1 ghost)
5. Fix P1-1: Move ProdukPaketDomain to services.types.ts
6. Fix P1-2: Align handleSave return type — either BaseSettingsController becomes () => void | Promise<void>, or Brand goes sync
7. Fix P1-4: Add ConfirmDialog to deactivateStaff in StaffDirectorySection
```

## Nice-to-Have Fixes (Before Operational/Booking App Domains)

```
8. P1-3: Lift services data dependency — pass services via props from a parent context, not by calling useServicesController twice
9. P2-1: Centralize nextId to shared/lib/id.ts
10. P2-2: Centralize setDirtyDomain pattern (or make isDirty always derived)
11. P2-3: Standardize isDirty to JSON.stringify approach in all controllers
12. P2-4: Map avatarColor to Tailwind token classes instead of hex + inline style
```

---

## Final Verdict

```
┌─────────────────────────────────────┐
│                                     │
│   FIX FIRST                         │
│                                     │
│   7 required fixes before Team      │
│   Domain work can resume safely.    │
│                                     │
│   Most critical:                    │
│   1. addStaff ID bug (P0-1)         │
│   2. SettingsPageHeader hex (P0-2)  │
│   3. Delete V1 dead code (P0-3/4)   │
│                                     │
└─────────────────────────────────────┘
```

The V2 architecture is fundamentally sound. The controller pattern, SettingsSideSheet, ConfirmDialog, and layout contract are all well-designed and will scale. The blockers are concrete, bounded, and fixable — none require redesign. After the 7 required fixes, the system will be ready to receive Team domain work and subsequent domains without multiplying the current debt.
