# Sprint 3.1 — Team Persistence Report

**Date:** 2026-06-12
**Status:** Complete
**tsc --noEmit:** 0 errors

---

## Files Created

| File                                                            | Purpose                                                                           |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `packages/database/src/migrations/0004_create_staff_tables.sql` | 4 tables: staff_members, staff_service_assignments, staff_schedules, staff_leaves |
| `src/server/settings/repositories/team.repository.ts`           | DB layer — 2 queries + 9 write operations                                         |
| `src/server/settings/services/team.service.ts`                  | Business logic — validation, RepositoryError passthrough                          |
| `src/server/trpc/routers/settings/team.ts`                      | tRPC router — 2 queries + 9 mutations                                             |

## Files Modified

| File                                                                                               | Change                                                                                |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/server/trpc/routers/settings/_settings.ts`                                                    | Registered `team: teamRouter`                                                         |
| `src/features/dashboard/hooks/settings/useTeamController.ts`                                       | Full rewrite — section-based controller, tRPC replacing mock state                    |
| `src/features/dashboard/components/settings/components/team/TeamPageClient.tsx`                    | `useRegisterSettingsActions` with `isDirty: false` — global batch save removed        |
| `src/features/dashboard/components/settings/components/team/sections/StaffDirectorySection.tsx`    | `ctrl.domain.*` → section API, method renames                                         |
| `src/features/dashboard/components/settings/components/team/sections/ServiceAssignmentSection.tsx` | `ctrl.domain.*` → section API, `ctrl.setAssignment` → `ctrl.assignments.set`          |
| `src/features/dashboard/components/settings/components/team/sections/WeeklyScheduleSection.tsx`    | Full rewrite — local draft state, explicit save button, `ctrl.schedules.saveForStaff` |
| `src/features/dashboard/components/settings/components/team/sections/LeaveSection.tsx`             | `ctrl.domain.*` → section API, `ctrl.leaves.selectStaff` initialization               |

---

## Migration Requirements

### `0004_create_staff_tables.sql` — new in Sprint 3.1

All four tables in dependency order. **Apply before Sprint 3.1 go-live.**

```sql
-- 1. staff_members
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('MANAGER','STYLIST','COLORIST','NAIL_ARTIST','THERAPIST','RECEPTIONIST')),
  specialty TEXT CHECK (specialty IN ('HAIR_STYLIST','COLORIST','NAIL_ARTIST','THERAPIST')),
  avatar_url TEXT,
  avatar_color TEXT NOT NULL DEFAULT '#e8e8e8',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. staff_service_assignments (one row per staff, UNIQUE(staff_id))
-- 3. staff_schedules (seven rows per staff, UNIQUE(staff_id, day))
-- 4. staff_leaves (unbounded, indexed by staff_id and date)
```

The `UNIQUE(staff_id, day)` constraint on `staff_schedules` is required for the UPSERT
pattern used by `saveScheduleForStaff`. If this constraint is missing, the upsert inserts
duplicates instead of updating.

---

## Queries Added

### `trpc.settings.team.getTeamDomain`

- Type: `protectedProcedure.query`
- Output: `{ staff: StaffMember[], assignments: ServiceAssignment[], schedules: WeeklySchedule[] }`
- Implementation: `Promise.all` of 3 SELECTs (staff_members, staff_service_assignments, staff_schedules)
- Schedule rows: 7 per-day rows grouped into `WeeklySchedule[]` in the repository
- Fallback: returns `{ staff: [], assignments: [], schedules: [] }` when salon has no data

### `trpc.settings.team.getStaffLeaves`

- Type: `protectedProcedure.input({ staffId: UUID }).query`
- Output: `StaffLeave[]` for the specified staff member only
- Sorted: `date DESC` (most recent first)
- Not included in `getTeamDomain` — separate query because leave history is unbounded

---

## Mutations Added

### Staff

| Procedure         | Input                 | Output            | DB operation                                               |
| ----------------- | --------------------- | ----------------- | ---------------------------------------------------------- |
| `createStaff`     | staffInputSchema      | `ok(StaffMember)` | INSERT staff + assignment (empty) + 7 schedule rows        |
| `updateStaff`     | `{ id: UUID, patch }` | `ok()`            | UPDATE staff_members WHERE id + salon_id                   |
| `deactivateStaff` | `{ id: UUID }`        | `ok()`            | UPDATE SET is_active = false                               |
| `deleteStaff`     | `{ id: UUID }`        | `ok()`            | DELETE — DB CASCADE removes assignments, schedules, leaves |

### Assignments

| Procedure       | Input                                     | Output | DB operation                                            |
| --------------- | ----------------------------------------- | ------ | ------------------------------------------------------- |
| `setAssignment` | `{ staffId: UUID, serviceIds: string[] }` | `ok()` | UPSERT staff_service_assignments ON CONFLICT (staff_id) |

### Schedules

| Procedure              | Input                  | Output | DB operation                              |
| ---------------------- | ---------------------- | ------ | ----------------------------------------- |
| `saveScheduleForStaff` | `weeklyScheduleSchema` | `ok()` | UPSERT 7 rows ON CONFLICT (staff_id, day) |

### Leaves

| Procedure     | Input                           | Output           | DB operation               |
| ------------- | ------------------------------- | ---------------- | -------------------------- |
| `createLeave` | `{ staffId, type, date, note }` | `ok(StaffLeave)` | INSERT staff_leaves        |
| `deleteLeave` | `{ id: UUID }`                  | `ok()`           | DELETE WHERE id + salon_id |

---

## Controller Contract Compliance

Per `TEAM_CONTROLLER_CONTRACT.md`:

| Requirement                                                         | Implemented                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------ |
| `ctrl.staff.*` section shape                                        | Yes                                                                |
| `ctrl.assignments.*` section shape                                  | Yes                                                                |
| `ctrl.schedules.*` section shape                                    | Yes                                                                |
| `ctrl.leaves.*` section shape                                       | Yes                                                                |
| No `BaseSettingsController`                                         | Yes — no extends, no `isDirty`/`handleSave` at top level           |
| `getTeamDomain` single shared query for staff/assignments/schedules | Yes                                                                |
| `getStaffLeaves` separate parameterized query                       | Yes                                                                |
| `leaves.selectedStaffId` state in controller                        | Yes — `useState<string                                             | null>(null)` |
| `leaves.selectStaff` drives query                                   | Yes — `enabled: !!leavesStaffId`                                   |
| `staff.remove` clears `leaves.selectedStaffId`                      | Yes — `onSuccess` callback checks `leavesStaffId === variables.id` |
| `staleTime: 30_000` on both queries                                 | Yes                                                                |
| `placeholderData` on both queries                                   | Yes — `EMPTY_DOMAIN` / `[]`                                        |
| Specific query invalidation (not namespace)                         | Yes                                                                |
| No optimistic updates                                               | Yes                                                                |

---

## Mutation Policy Compliance

Per `TEAM_MUTATION_POLICY.md`:

| Action                      | Policy                             | Implemented                                                     |
| --------------------------- | ---------------------------------- | --------------------------------------------------------------- |
| Staff create                | Immediate (modal submission guard) | Yes — `ctrl.staff.add` fires immediately                        |
| Staff update                | Immediate (modal submission guard) | Yes — `ctrl.staff.update` fires immediately                     |
| Staff deactivate            | Immediate + ConfirmDialog          | Yes — ConfirmDialog in StaffDirectorySection, then immediate    |
| Staff delete                | Immediate + ConfirmDialog          | Yes — ConfirmDialog in StaffDirectorySection, then immediate    |
| Assignment toggle           | Immediate                          | Yes — `ctrl.assignments.set` fires on each checkbox change      |
| Assignment select/clear all | Immediate                          | Yes — same `ctrl.assignments.set`                               |
| Schedule save               | Explicit Save                      | Yes — WeeklyScheduleSection holds draft, "Simpan Jadwal" button |
| Leave create                | Immediate (form submission guard)  | Yes — `ctrl.leaves.add` fires on form submit                    |
| Leave delete                | Immediate + ConfirmDialog          | Yes — ConfirmDialog in LeaveSection's TimelineEntry             |
| No global batch save        | Verified                           | Yes — `useRegisterSettingsActions` with `isDirty: false`        |

---

## WeeklyScheduleSection — Behavioral Change

The WeeklyScheduleSection was substantially rewritten per mutation policy.

**Before (mock — immediate `updateDaySchedule`):**

- Every checkbox change, every time field blur called `ctrl.updateDaySchedule` immediately
- Changes wrote to in-memory mock state
- Global action bar handled save

**After (explicit save):**

- Checkbox and time changes update local `draftSchedule` state only (no ctrl calls)
- `displaySchedule = draftSchedule ?? savedSchedule` — renders draft if present, saved otherwise
- "Simpan Jadwal" / "Batalkan" buttons appear only when `isDirty` (draft differs from saved)
- `ctrl.schedules.saveForStaff(staffId, draft)` fires on save click
- Draft clears on: save, cancel, or staff member switch
- `ctrl.schedules.isSaving` disables save/cancel buttons during in-flight mutation

No visual change to the day rows UI — same layout, same time inputs, same checkbox behavior from the user's perspective. The only visible addition is the save/cancel bar at the bottom.

---

## LeaveSection — Behavioral Change

The `selectedStaffId` state was lifted from the section into the controller (`ctrl.leaves.selectedStaffId`). This drives the parameterized `getStaffLeaves` query.

**Before:** Section held its own `selectedStaffId` state, filtered `ctrl.domain.leaves` by it.
All leaves for all staff were loaded in the domain query.

**After:** Section calls `ctrl.leaves.selectStaff(id)` on mount and on staff change.
Only the selected staff's leaves are fetched. Zero leaves are loaded for other staff members.

---

## End-to-End Flow

### Read (page load)

```
TeamPageClient renders
  -> useTeamController()
    -> trpc.settings.team.getTeamDomain.useQuery()   [staff + assignments + schedules]
    -> trpc.settings.team.getStaffLeaves.useQuery()  [enabled: false, not yet fetched]
  -> all sections hydrate from domainFromDb
  -> LeaveSection mounts -> calls ctrl.leaves.selectStaff(staff[0].id)
    -> enables getStaffLeaves query -> fetches leaves for first staff member
```

### Write example — add staff

```
Owner fills modal -> clicks Tambah
  -> ctrl.staff.add(draft)
    -> createStaffMutation({ fullName, phone, role, specialty, ... })
      -> teamRouter.createStaff
        -> teamService.createStaff(salonId, data)  [validates fullName non-empty]
          -> teamRepo.createStaff(salonId, data)
            -> INSERT staff_members  -> get UUID
            -> INSERT staff_service_assignments (service_ids: [])
            -> INSERT staff_schedules x7 (default Mon-Sat 09:00-18:00)
          <- StaffMember
        <- StaffMember
      <- ok(StaffMember)
    -> onSuccess: invalidate getTeamDomain
      -> query refetches -> new staff appears with empty assignments + default schedule
```

### Write example — save schedule

```
Owner selects staff -> edits day rows -> draft state updates (no DB calls)
"Simpan Jadwal" button appears (isDirty = true)
Owner clicks Simpan Jadwal
  -> ctrl.schedules.saveForStaff(staffId, draftSchedule)
    -> saveScheduleMutation({ staffId, days: [...] })
      -> teamRouter.saveScheduleForStaff
        -> teamService.saveScheduleForStaff  [validates 7 days, startTime < endTime per enabled day]
          -> teamRepo.saveScheduleForStaff
            -> UPSERT staff_schedules x7 ON CONFLICT (staff_id, day) DO UPDATE
      <- ok()
    -> onSuccess: invalidate getTeamDomain
      -> query refetches -> saved schedule reflected in ctrl.schedules.data
    -> setDraftSchedule(null) -> save bar disappears
```

### Write example — set assignment

```
Owner selects staff -> checks "Ladies Haircut" checkbox
  -> toggleService('svc-5')
    -> ctrl.assignments.set(staffId, [...existingIds, 'svc-5'])
      -> setAssignmentMutation({ staffId, serviceIds: [...] })
        -> teamRouter.setAssignment
          -> teamService.setAssignment  [deduplicates serviceIds]
            -> teamRepo.setAssignment
              -> UPSERT staff_service_assignments ON CONFLICT (staff_id) DO UPDATE
        <- ok()
      -> onSuccess: invalidate getTeamDomain
        -> query refetches -> checkbox state reflects DB value
```

---

## Architecture Compliance

- No direct Supabase access outside `repositories/`
- No `any` types — strict TypeScript throughout (`unknown` cast at Supabase boundary)
- All procedures use `protectedProcedure` — UNAUTHORIZED if salonId absent
- `ok()` / `ok(data)` used consistently
- `RepositoryError` / `ServiceError` / `toTRPCError()` chain followed
- No try-catch wrapping repository calls in service layer
- Section-based controller — no `BaseSettingsController`, no `isDirty`/`handleSave` at top level
- `salonId` from `ctx` only — never from procedure input
- salonId guard on all write operations (`.eq('salon_id', salonId)` on every mutation)
- `staleTime: 30_000` on both queries
- `placeholderData` on both queries — no loading flash

---

## Known Limitations

1. **`createStaff` is not transactional.** Three sequential Supabase calls: INSERT staff
   → INSERT assignment → INSERT 7 schedule rows. If calls 2 or 3 fail, the staff member
   exists but has missing related data (empty assignment section / empty schedule). This is
   graceful (no crash, section shows empty state) but not atomic. Fix in Sprint 4 via
   Supabase RPC stored procedure.

2. **`updated_at` manual set on write operations.** The repository sets
   `updated_at: new Date().toISOString()` on UPDATE calls. If a Postgres trigger also manages
   `updated_at`, this creates a redundant write (harmless). Verify trigger existence on
   the live DB before Sprint 4.

3. **No avatar upload.** `avatarUrl` accepts an https:// URL in the input schema. The actual
   file upload (Supabase Storage `avatars` bucket) is deferred to Sprint 4 when
   `supabaseAdmin` is available. The add/edit staff form currently has no upload UI for
   avatar — existing `SettingsUploadField` in StaffDirectorySection is wired to a local
   preview only (blob: URL), not to the controller. The blob: URL is never passed to the
   mutation (same pattern as QRIS in Sprint 2).

4. **Customer app not yet reading from `staff_members` or `staff_schedules`.** The customer
   booking flow's stylist selection and slot availability still use mock/static data.
   Per rollout plan: owner fills data via Settings > Tim, then customer app is updated in a
   separate deployment to read from DB. Feature flag recommended to prevent empty stylist
   selection during the transition window.

5. **No leave history pagination.** `getStaffLeaves` returns all leave records for a staff
   member in descending date order. For a staff member with years of leave history, this is
   an unbounded result set. The section-based lazy query (separate from `getTeamDomain`)
   prevents bulk loading at page mount, but a single staff's history could still be large.
   Add `limit`/`cursor` pagination in a future sprint if needed.

6. **Sort order on staff not exposed to UI.** `sort_order` column exists on `staff_members`
   for future drag-to-reorder. Sprint 3.1 sets it to `0` on create. All staff appear in
   insert order. Drag-to-reorder can be added without interface changes.

---

## Typecheck Result

```
npx tsc --noEmit  ->  0 errors
```
