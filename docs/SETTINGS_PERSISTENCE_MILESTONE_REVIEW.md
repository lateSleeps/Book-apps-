# Settings Persistence Milestone Review

**Date:** 2026-06-12
**Scope:** Architecture review after Sprint 0 (Foundation) + Sprint 1.1 (Operasional) + Sprint 1.2 (Brand) + Sprint 1.3 (Layanan) + Sprint 2 (Booking App)
**Goal:** Determine whether persistence architecture is mature enough for Tim and Pengguna domains.

---

## Summary Verdict

**Architecture is ready for Sprint 3 (Tim) with two required fixes before starting.**

The five-sprint body of work has produced a consistent, layered persistence stack. The core patterns -- repository/service/router separation, `ok()` return shape, `RepositoryError`/`ServiceError`/`toTRPCError()` chain, `protectedProcedure` on all procedures, `staleTime` + specific invalidation -- are uniform across all four domains. Two gaps need closing before Tim goes in: the `placeholderData` inconsistency in Brand and Booking App, and the TeamController interface (currently flat -- needs section-based for Sprint 3 given its multi-section domain shape). These are mechanical fixes, not architectural changes. Pengguna is a different story -- its auth-dependent nature means it needs its own interface design regardless of Sprint 3 readiness.

---

## 1. Repository Layer

**Classification: KEEP**

Consistent patterns across all four repositories:

- `handleDbError()` called on every Supabase error path without exception -- zero missed error conversions found across `operational.repository.ts`, `brand.repository.ts`, `services.repository.ts`, `booking-app.repository.ts`
- `as unknown as RowType` cast at every Supabase query boundary -- consistent, documented, necessary until Supabase type generation (Sprint 4)
- No `@rara/database` imports outside `src/server/db.ts` -- the indirection layer holds. One exception: `src/app/api/debug/update-salon/route.ts` -- this is a debug utility, not production code, acceptable
- No DB types leak into service layer or controller layer -- all row types are defined and used exclusively within their repository file
- `PGRST116` (no rows) handled explicitly in brand and booking-app repositories -- returns safe fallback instead of throwing

One known issue:

- `booking-app.repository.ts` `updateBankAccount` manually sets `updated_at: new Date().toISOString()`. If a Postgres trigger manages `updated_at` on the `bank_accounts` table, this creates a redundant write. Harmless but should be verified against the live DB before Sprint 3. Remove the manual set if a trigger is confirmed.

---

## 2. Service Layer

**Classification: KEEP**

Consistent patterns across all four services:

- Zero `try/catch` blocks wrapping repository calls -- `RepositoryError` propagates correctly to `toTRPCError()` in every service
- All services import only from their own repository and `../lib/*` -- no cross-domain service calls, no direct Supabase imports
- All business validation lives in services (not routers, not repositories) -- price >= 0, duration > 0, policy max 500 chars, payment methods min 1, bank account non-empty fields

No gaps found.

---

## 3. Router Layer

**Classification: KEEP**

Consistent patterns across all four routers:

- `{ success: true as const }` fully eliminated -- every procedure returns `ok()` or `ok(data)` from `result.ts`
- All procedures use `protectedProcedure` -- UNAUTHORIZED thrown if `ctx.salonId` is null
- All procedures have `try/catch { throw toTRPCError(err) }` -- no unhandled throws escape to tRPC
- Input validation via Zod on all mutation inputs -- UUID validation on ID parameters, string constraints, array minimums
- `salonId` sourced from `ctx`, never from procedure input -- no cross-salon access possible

One note:

- `services.ts` router has no UUID validation on `categoryId`/`serviceId` in delete procedures -- it passes string directly. The `services.repository.ts` deleteCategory and deleteService use `.eq('id', id).eq('salon_id', salonId)` which provides the security guarantee. The missing Zod UUID validation is a DX gap, not a security gap. Low priority.

---

## 4. Controller Layer

**Classification: REVISE BEFORE SPRINT 3**

Two established patterns are in production:

**Pattern A -- Section-based (multi-section domains):**
Used by: `useOperationalController`, `useBookingAppController`
Shape: `ctrl.<section>.data`, `ctrl.<section>.isLoading`, `ctrl.<section>.isSaving`, `ctrl.<section>.save()` or immediate mutation methods

**Pattern B -- Immediate-mutation CRUD (list domains):**
Used by: `useServicesController` (categories and services)
Shape: flat CRUD methods, `isDirty = false` always, no batch save

**Pattern C -- BaseSettingsController (single-section save):**
Used by: `useBrandController`, `useTeamController` (current mock)
Shape: `ctrl.data`, `ctrl.isDirty`, `ctrl.isSaving`, `ctrl.save()`

The problem: `TeamController` currently extends `BaseSettingsController` with a flat interface. Looking at `TeamDomain` -- it has `staff[]`, `assignments[]`, `schedules[]`, `leaves[]`. This is a multi-section domain. Staff CRUD fires immediately. Schedule is upsert-per-staff. Service assignments are toggled immediately. None of these share a single save action.

**Required fix before Sprint 3:** Define `TeamController` as section-based, matching Pattern A:

```typescript
export interface TeamController {
  staff: {
    data: StaffMember[];
    isLoading: boolean;
    isSaving: boolean;
    add: (draft: Omit<StaffMember, "id">) => void;
    update: (id: string, patch: Partial<Omit<StaffMember, "id">>) => void;
    remove: (id: string) => void;
  };
  schedules: {
    data: WeeklySchedule[];
    isLoading: boolean;
    isSaving: boolean;
    upsert: (staffId: string, schedule: WeeklySchedule) => void;
  };
  leaves: {
    data: StaffLeave[];
    isLoading: boolean;
    isSaving: boolean;
    add: (draft: Omit<StaffLeave, "id">) => void;
    remove: (id: string) => void;
  };
  assignments: {
    data: ServiceAssignment[];
    isLoading: boolean;
    isSaving: boolean;
    toggle: (staffId: string, serviceId: string, active: boolean) => void;
  };
}
```

This interface should be agreed on before any Sprint 3 implementation begins. Changing the interface mid-sprint breaks the page component.

**Pengguna:** `PenggunaController` should NOT extend `BaseSettingsController` or use section-based pattern. Auth domain (invites, roles, permissions) has a fundamentally different mutation shape -- it maps to user-management operations, not form saves. Design its interface independently at Sprint start.

---

## 5. React Query Patterns

**Classification: REVISE BEFORE SPRINT 3**

**staleTime -- consistent:**
All four controllers set `staleTime: 30_000`. No gaps.

**onSuccess invalidation -- consistent:**
All controllers invalidate only the specific query that was mutated, never the namespace. No gaps.

**No optimistic updates -- consistent:**
All controllers invalidate and refetch after mutations. Correct choice for a settings domain where conflicts are rare and stale state is worse than a brief reload.

**placeholderData -- INCONSISTENT:**

| Controller               | placeholderData          |
| ------------------------ | ------------------------ |
| useOperationalController | `DEFAULT_BUSINESS_HOURS` |
| useServicesController    | `EMPTY_DOMAIN`           |
| useBrandController       | missing                  |
| useBookingAppController  | missing                  |

Brand and Booking App show empty/loading state on first render instead of a consistent skeleton. This is not a bug but produces a worse experience than the Operational and Services pages.

**Required fix before Sprint 3:** Add `placeholderData` to Brand and Booking App controllers. For Brand:

```typescript
const EMPTY_BRAND_PROFILE: BrandProfile = {
  salonName: '',
  tagline: '',
  description: '',
  address: '',
  phone: '',
  media: { logoUrl: null, coverImageUrl: null },
};
// in useQuery options:
placeholderData: EMPTY_BRAND_PROFILE,
```

For Booking App, `DEFAULT_PAYMENT_DATA` constant already exists in the controller file. Extend it or add a `DEFAULT_BOOKING_APP_SETTINGS` constant and pass it as `placeholderData`.

Fix this before Sprint 3 so the pattern is uniform when Tim controller is written.

---

## 6. Error Handling

**Classification: KEEP**

Three-layer chain is consistent:

```
Supabase error
  → handleDbError() → RepositoryError
    → propagates (no service catch)
      → toTRPCError() → TRPCError (appropriate HTTP code)
```

No service catching `RepositoryError` anywhere -- confirmed via grep. No router swallowing errors -- every procedure has `catch (err) { throw toTRPCError(err) }`. No untyped `any` in error paths.

`ServiceError` maps to `BAD_REQUEST`. `RepositoryError` maps to `INTERNAL_SERVER_ERROR`. Both are handled in `toTRPCError()`. This mapping is appropriate.

---

## 7. Migration Strategy

**Classification: REVISE BEFORE SPRINT 3**

Current state:

| Migration                             | Status                                             |
| ------------------------------------- | -------------------------------------------------- |
| `0001_alter_salons_brand_booking.sql` | Created Sprint 1.2 -- not confirmed run on live DB |
| `0002_alter_categories_services.sql`  | Created Sprint 1.3 -- not confirmed run on live DB |
| `0003_create_bank_accounts.sql`       | Created Sprint 2 -- not confirmed run on live DB   |

Problems:

1. **No migration runner.** Files exist as raw SQL in `packages/database/src/migrations/`. There is no migration table tracking which have been applied. There is no CLI command to run them. Each sprint has added "run this SQL" to its report but there is no enforcement mechanism.

2. **No confirmation of live state.** Brand, Layanan, and Booking App persistence all depend on schema changes from these migrations. If any migration was not applied, those features silently fail or throw DB errors at runtime.

3. **Naming discrepancy.** The `SETTINGS_DATABASE_IMPLEMENTATION_PLAN.md` numbered bank_accounts as `0005`. The actual file is `0003`. Documents may reference the wrong number.

**Required before Sprint 3:**

- Confirm all three migrations have been applied to the live Supabase instance
- Document the confirmed state in `PROGRESS.md` or a dedicated `migrations-run.md`
- Decide on migration tooling: either adopt Supabase CLI migrations (`supabase migration`) which provides a `supabase_migrations` tracking table, or document the manual-apply process explicitly

Sprint 3 (Tim) will require at minimum one new migration (staff table, schedules table). Without a migration runner, it risks the same untracked state.

---

## 8. Architectural Debt

**Classification: POST-SPRINT 3 (unless otherwise noted)**

| Item                               | Priority      | Notes                                                                                                                                                                                                                                                                                   |
| ---------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase type generation           | Post-Sprint 3 | `as unknown as RowType` casts are necessary until `supabase gen types` is wired. Sprint 4 prerequisite.                                                                                                                                                                                 |
| Auth still mock localStorage       | Post-Sprint 3 | `ctx.userId` returns mock value. `CURRENT_USER_ID = 'owner-001'` stub still present. Supabase Auth migration is Sprint 4. Cache flush on auth change is documented but unimplemented.                                                                                                   |
| `audit_logs` table missing         | Post-Sprint 3 | `NoopAuditLogger` used everywhere. `IAuditLogger` / `DbAuditLogger` contract is in place -- wiring it in is zero service changes once the table exists. Sprint 4 prerequisite.                                                                                                          |
| QRIS upload deferred               | Post-Sprint 3 | `supabaseAdmin` (service_role_key) not available. Controller and router already accept `https://` URLs -- Sprint 4 wiring requires only the upload call, not interface changes.                                                                                                         |
| Validation duplication             | Post-Sprint 3 | Zod validates at router boundary AND ServiceError validates in service (e.g., bank account field lengths checked in both). Not a bug. Maintenance surface doubles for constrained fields. Decide post-Sprint 3: Zod-only (service validates business rules only) vs current dual-layer. |
| `sort_order` race on bank accounts | Post-Sprint 3 | Two rapid `addBankAccount` calls before refetch may produce duplicate `sort_order`. Drag-to-reorder (Sprint 3+) will own sort_order explicitly.                                                                                                                                         |
| `updated_at` manual set            | Low           | `updateBankAccount` sets `updated_at` manually. Verify whether a DB trigger also manages it. Remove manual set if trigger is confirmed.                                                                                                                                                 |

---

## Sprint 3 Checklist -- Required Before Starting Tim

The following must be done before the first line of Tim persistence code is written:

- [ ] **Confirm migrations 0001, 0002, 0003 applied** on live Supabase instance. Block Sprint 3 go-live if unconfirmed.
- [ ] **Add `placeholderData`** to `useBrandController` and `useBookingAppController`.
- [ ] **Define `TeamController` interface** with section-based pattern (staff, schedules, leaves, assignments). Agree on interface shape before implementation starts.
- [ ] **Design `PenggunaController` interface** independently -- not BaseSettingsController, not section-based. Auth domain has its own shape.

The first two items are 30-minute fixes. The third and fourth are design decisions, not code. Do them before the sprint, not during.

---

## Sprint 3 -- What Carries Over Without Change

The following patterns are proven and should be copied verbatim for Tim:

- Repository file structure: `RowType` interface, column constant, `as unknown as RowType` cast, `handleDbError` on all errors
- Service file structure: no try-catch wrapping repos, validation only, `ServiceError` for business rule violations
- Router file structure: `protectedProcedure`, Zod input schema, `ok()`/`ok(data)` return, `try/catch { throw toTRPCError(err) }`
- Controller file structure: section-based interface, `useCallback` with destructured `mutateAsync`, `onSuccess: invalidate`, `staleTime: 30_000`, specific query invalidation
- `salonId` from `ctx` only, never from input
- Migration file: new SQL file in `packages/database/src/migrations/` with `IF NOT EXISTS` guards

---

## Files Referenced

| File                                                           | Reviewed |
| -------------------------------------------------------------- | -------- |
| `SPRINT0_FOUNDATION_REPORT.md`                                 | Yes      |
| `SPRINT1_1_BUSINESS_HOURS_REPORT.md`                           | Yes      |
| `SPRINT1_2_BRAND_REPORT.md`                                    | Yes      |
| `SPRINT1_3_SERVICES_REPORT.md`                                 | Yes      |
| `SPRINT2_BOOKING_REPORT.md`                                    | Yes      |
| `src/server/settings/repositories/*.repository.ts` (x4)        | Scanned  |
| `src/server/settings/services/*.service.ts` (x4)               | Scanned  |
| `src/server/trpc/routers/settings/*.ts` (x4)                   | Scanned  |
| `src/features/dashboard/hooks/settings/use*Controller.ts` (x4) | Scanned  |
| `packages/database/src/migrations/0001-0003`                   | Reviewed |
