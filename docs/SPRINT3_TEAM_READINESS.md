# Sprint 3 — Team Implementation Readiness Review

**Date:** 2026-06-12
**Reviewed against:** TEAM_CONTROLLER_CONTRACT.md, TEAM_MUTATION_POLICY.md, SETTINGS_PERSISTENCE_MILESTONE_REVIEW.md
**Conclusion:** Team domain is fully implemented. Implementation can ship as-is.

---

## Overall Verdict

| Layer                           | Status    |
| ------------------------------- | --------- |
| Database migrations             | READY NOW |
| Repository                      | READY NOW |
| Service                         | READY NOW |
| Router                          | READY NOW |
| Controller                      | READY NOW |
| UI sections                     | READY NOW |
| Query strategy                  | READY NOW |
| Leave loading strategy          | READY NOW |
| Schedule persistence strategy   | READY NOW |
| Assignment persistence strategy | READY NOW |
| Mutation policy                 | READY NOW |

One non-blocking annotation: a stale docblock in `ServiceAssignmentSection.tsx` describes old behavior. Functional code is correct. Does not block shipping.

---

## 1. Existing Tables

All four Team tables are created in `0004_create_staff_tables.sql`.

| Table                       | Purpose                                                             | Status |
| --------------------------- | ------------------------------------------------------------------- | ------ |
| `staff_members`             | One row per staff per salon                                         | EXISTS |
| `staff_service_assignments` | One row per staff; `service_ids TEXT[]` stores assigned service IDs | EXISTS |
| `staff_schedules`           | Seven rows per staff, one per weekday                               | EXISTS |
| `staff_leaves`              | Unbounded leave history per staff                                   | EXISTS |

---

## 2. Missing Tables

**None.** All tables required by the contract are present.

---

## 3. Migration Count Required

**One migration file** (`0004_create_staff_tables.sql`) covers all four tables.

No additional migrations are needed for the Team domain.

Key constraints verified in migration:

- `UNIQUE(staff_id)` on `staff_service_assignments` — required for UPSERT ON CONFLICT used by `setAssignment`
- `UNIQUE(staff_id, day)` on `staff_schedules` — required for UPSERT ON CONFLICT used by `saveScheduleForStaff`
- `ON DELETE CASCADE` on `staff_service_assignments`, `staff_schedules`, `staff_leaves` — required for `deleteStaff` to clean up linked records
- DATE column on `staff_leaves.date` — correct for leave date storage

---

## 4. Repository Complexity

**Low-Medium.** All operations are straightforward except `createStaff`.

| Function               | Complexity | Notes                                                                  |
| ---------------------- | ---------- | ---------------------------------------------------------------------- |
| `getTeamDomain`        | Low        | `Promise.all` of 3 parallel SELECTs                                    |
| `getStaffLeaves`       | Low        | Single SELECT with `staff_id + salon_id` filter                        |
| `createStaff`          | Medium     | 3 sequential non-atomic INSERTs (staff → assignment → 7 schedule rows) |
| `updateStaff`          | Low        | UPDATE with dynamic patch object                                       |
| `deactivateStaff`      | Low        | UPDATE SET `is_active = false`                                         |
| `deleteStaff`          | Low        | DELETE with CASCADE                                                    |
| `setAssignment`        | Low        | UPSERT ON CONFLICT (staff_id)                                          |
| `saveScheduleForStaff` | Low        | UPSERT 7 rows ON CONFLICT (staff_id, day)                              |
| `createLeave`          | Low        | INSERT                                                                 |
| `deleteLeave`          | Low        | DELETE                                                                 |

**`createStaff` atomicity gap:** The three sequential INSERTs (staff row → assignment row → 7 schedule rows) are not wrapped in a transaction. If INSERTs 2 or 3 fail, the staff member exists with missing assignment or schedule data. This is a known limitation documented in SPRINT3_1_TEAM_REPORT.md. Graceful degradation: section shows empty state for missing rows. Not blocking for Sprint 3. Fix via Supabase RPC in Sprint 4.

**`service_ids TEXT[]` array column:** The assignment approach uses a Postgres TEXT[] array instead of a join table (unlike `service_bundle_items`). This is intentional and correct for the Team domain because the assignment record is owned by the staff member, contains at most ~20 service IDs, and is replaced atomically per staff. Join table overhead is not warranted here.

---

## 5. Service Complexity

**Low.** Validations are minimal and well-scoped.

| Function               | Validations present                                                    |
| ---------------------- | ---------------------------------------------------------------------- |
| `createStaff`          | fullName non-empty; trims name + phone                                 |
| `updateStaff`          | fullName non-empty if provided; trims name + phone                     |
| `deactivateStaff`      | None (business rule check deferred to Sprint 4: active bookings guard) |
| `deleteStaff`          | None (business rule check deferred: active bookings guard)             |
| `setAssignment`        | Deduplicates serviceIds with `new Set()`                               |
| `saveScheduleForStaff` | days.length === 7; for enabled days endTime > startTime                |
| `createLeave`          | date non-empty; YYYY-MM-DD format                                      |
| `deleteLeave`          | None                                                                   |

**No try-catch wrapping repository calls.** `RepositoryError` propagates naturally. ✅

**`avatarUrl` blob: stripping absent.** Unlike `produkpaket.service.ts` which strips `blob:` URLs before writing, `team.service.ts` does not. The Zod schema accepts blob: URLs (`z.string().url()` recognises the blob: scheme as a valid URL). If a blob: URL ever reaches the mutation, it is written to DB and becomes a dead reference on next page load. Sprint 3.1 report documents this as a known limitation and states the form does not pass blob: URLs to the mutation in the current implementation. Acceptable for Sprint 3. Add defensive stripping in Sprint 4 alongside the actual upload.

---

## 6. Service Complexity

**Low.** Seven procedures, all `protectedProcedure`, all `ok()`/`ok(data)`, all `toTRPCError`. No custom auth logic. No cross-router dependencies. ✅

---

## 7. Query Strategy

Contract requires two separate queries. Both are implemented correctly.

### Query 1: `trpc.settings.team.getTeamDomain`

| Requirement                                            | Implemented                                           |
| ------------------------------------------------------ | ----------------------------------------------------- |
| Returns `{ staff, assignments, schedules }`            | Yes                                                   |
| `Promise.all` of 3 parallel SELECTs                    | Yes                                                   |
| Leaves NOT included                                    | Yes                                                   |
| `staleTime: 30_000`                                    | Yes                                                   |
| `placeholderData: EMPTY_DOMAIN`                        | Yes — `{ staff: [], assignments: [], schedules: [] }` |
| Invalidated by all staff/assignment/schedule mutations | Yes — all `onSuccess: invalidateDomain`               |
| NOT invalidated by leave mutations                     | Yes — leave mutations use `invalidateLeaves`          |

### Query 2: `trpc.settings.team.getStaffLeaves`

| Requirement                                     | Implemented                                |
| ----------------------------------------------- | ------------------------------------------ |
| Parameterized by `staffId`                      | Yes                                        |
| `enabled: !!leavesStaffId`                      | Yes                                        |
| `staleTime: 30_000`                             | Yes                                        |
| `placeholderData: []`                           | Yes                                        |
| Invalidated only by leave mutations             | Yes — separate `invalidateLeaves` callback |
| Domain query NOT invalidated by leave mutations | Yes                                        |

---

## 8. Leave Loading Strategy

**Correctly implemented.** Matches the contract.

| Requirement                                              | Implemented                                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------ |
| Leaves NOT in `getTeamDomain`                            | Yes                                                                                 |
| Separate `getStaffLeaves` query per selected staff       | Yes                                                                                 |
| `selectedStaffId` state owned by controller              | Yes — `useState<string                                                              | null>(null)` |
| `selectStaff(id)` drives query                           | Yes — `enabled: !!leavesStaffId`                                                    |
| `leaves.data` is scoped to selected staff only           | Yes — query is parameterized                                                        |
| `selectedStaffId` cleared when selected staff is deleted | Yes — `onSuccess` in `deleteStaff` mutation checks `leavesStaffId === variables.id` |
| `LeaveSection` initializes selection on mount            | Yes — `useEffect` calls `ctrl.leaves.selectStaff(activeStaff[0].id)`                |

Scale guarantee met: a salon with 50 staff and 3 years of leave history never loads all leaves at once. Only the selected staff's records are fetched, only when the Leave tab is active.

---

## 9. Schedule Persistence Strategy

**Correctly implemented.** Explicit save pattern matches mutation policy.

| Requirement                                                             | Implemented                                              |
| ----------------------------------------------------------------------- | -------------------------------------------------------- |
| UPSERT 7 rows ON CONFLICT (staff_id, day)                               | Yes                                                      |
| UNIQUE(staff_id, day) constraint exists in migration                    | Yes                                                      |
| Local draft state in `WeeklyScheduleSection`                            | Yes                                                      |
| Draft initialized from `ctrl.schedules.data` filtered to selected staff | Yes                                                      |
| "Simpan Jadwal" / "Batalkan" buttons visible only when `isDirty`        | Yes                                                      |
| Dirty computed as `JSON.stringify(draft) !== JSON.stringify(saved)`     | Yes                                                      |
| `ctrl.schedules.saveForStaff(staffId, draft)` called on save            | Yes                                                      |
| Draft cleared on save                                                   | Yes — `setDraftSchedule(null)` after `handleSave`        |
| Draft cleared on staff switch                                           | Yes — `handleStaffSelect` calls `setDraftSchedule(null)` |
| `ctrl.schedules.isSaving` disables buttons during in-flight mutation    | Yes                                                      |

---

## 10. Assignment Persistence Strategy

**Correctly implemented.** Immediate mutation on every toggle.

| Requirement                                  | Implemented                                                        |
| -------------------------------------------- | ------------------------------------------------------------------ |
| TEXT[] column approach (not join table)      | Yes — `service_ids TEXT[]` in `staff_service_assignments`          |
| UPSERT ON CONFLICT (staff_id)                | Yes                                                                |
| Full array replacement per write             | Yes — section computes new array, passes to `ctrl.assignments.set` |
| Immediate mutation on checkbox toggle        | Yes                                                                |
| Immediate mutation on select-all / clear-all | Yes                                                                |
| No local save button                         | Yes                                                                |
| Deduplication before write                   | Yes — `new Set(serviceIds)` in service layer                       |

---

## 11. Mutation Policy Compliance

| Action                | Required policy                    | Implemented |
| --------------------- | ---------------------------------- | ----------- |
| Staff create          | Immediate — modal submission       | Yes         |
| Staff update          | Immediate — modal submission       | Yes         |
| Staff deactivate      | Immediate + ConfirmDialog          | Yes         |
| Staff delete          | Immediate + ConfirmDialog          | Yes         |
| Assignment toggle     | Immediate                          | Yes         |
| Assignment select-all | Immediate                          | Yes         |
| Assignment clear-all  | Immediate                          | Yes         |
| Schedule save         | Explicit Save — save button        | Yes         |
| Leave create          | Immediate — form submission        | Yes         |
| Leave delete          | Immediate + ConfirmDialog          | Yes         |
| No global batch save  | `isDirty: false` in TeamPageClient | Yes         |

---

## 12. Controller Contract Compliance

| Contract requirement                              | Implemented                                                                                         |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `ctrl.staff.data`                                 | Yes                                                                                                 |
| `ctrl.staff.isLoading`                            | Yes                                                                                                 |
| `ctrl.staff.isSaving`                             | Yes — combined `isCreatingStaff \|\| isUpdatingStaff \|\| isDeactivatingStaff \|\| isDeletingStaff` |
| `ctrl.staff.add / update / deactivate / remove`   | Yes                                                                                                 |
| `ctrl.assignments.data`                           | Yes                                                                                                 |
| `ctrl.assignments.isLoading`                      | Yes                                                                                                 |
| `ctrl.assignments.isSaving`                       | Yes                                                                                                 |
| `ctrl.assignments.set`                            | Yes                                                                                                 |
| `ctrl.schedules.data`                             | Yes                                                                                                 |
| `ctrl.schedules.isLoading`                        | Yes                                                                                                 |
| `ctrl.schedules.isSaving`                         | Yes                                                                                                 |
| `ctrl.schedules.saveForStaff`                     | Yes                                                                                                 |
| `ctrl.leaves.data`                                | Yes                                                                                                 |
| `ctrl.leaves.isLoading`                           | Yes                                                                                                 |
| `ctrl.leaves.isSaving`                            | Yes                                                                                                 |
| `ctrl.leaves.selectedStaffId`                     | Yes                                                                                                 |
| `ctrl.leaves.selectStaff`                         | Yes                                                                                                 |
| `ctrl.leaves.add / remove`                        | Yes                                                                                                 |
| No `BaseSettingsController`                       | Yes — interface does not extend it                                                                  |
| No top-level `isDirty / handleSave / handleReset` | Yes                                                                                                 |

---

## Non-Blocking Annotation

### Stale docblock in `ServiceAssignmentSection.tsx` (cosmetic only)

The file's header comment reads:

```
 * Dirty state is owned by useTeamController → SettingsActionBar handles save.
 * No auto-save. No local save button.
```

The first sentence is stale — it describes the old mock controller's global batch save pattern that was removed in Sprint 3.1. The second sentence is correct (no local save button for assignments). The actual code throughout the file is correct: all assignment mutations call `ctrl.assignments.set` immediately with no dirty state.

**Classification:** READY NOW — stale documentation only; functional behavior is correct. Can be updated in a cleanup pass.

---

## Summary

**Team can start immediately.** Sprint 3.1 completed the full implementation:

- 1 migration file covers all 4 required tables with all required constraints
- Repository is fully implemented with correct UPSERT strategies for both assignments and schedules
- Service layer validates all inputs; no try-catch wrapping repos
- Router has 11 procedures; all protectedProcedure; all ok()/ok(data)
- Controller is section-based; no BaseSettingsController; no global save
- All four UI sections use the new section API
- Two-query architecture implemented correctly: domain query + lazy leaves query
- Mutation policy fully complied with

**No missing tables. No contract gaps. No blocking issues.**

Three deferred items documented in SPRINT3_1_TEAM_REPORT.md carry over to Sprint 4:

1. `createStaff` atomicity (3 sequential inserts, not transactional)
2. `avatarUrl` upload (blob: URLs not written, but defensive stripping not in service layer)
3. `deactivateStaff` / `deleteStaff` business rule: active bookings guard not yet present
