# Sprint 1.1 — Architecture Review

**Date:** 2026-06-12
**Purpose:** Lock the persistence pattern before Sprint 1.2 begins.
**Scope:** Pattern review only. Business hours feature not reviewed.

---

## Summary Verdict

The foundation is sound. Nine of twelve patterns are KEEP without modification.
Two have targeted revisions required before reuse. One pattern must not be copied.

---

## 1. Repository Design

**Verdict: KEEP**

The pattern is correct and consistent.

- Imports only from `../../db` — no `@rara/database` direct access anywhere.
- Row shape defined as a local interface (`BusinessHoursRow`). Not exported, not shared. Correct — it is a DB implementation detail.
- `rowToDay` and `dayToRow` mappers are private to the file. Column names do not leak into the service layer.
- Error handling is uniform: `if (error) throw handleDbError(error)` at the bottom of every query/mutation.
- Postgres TIME quirk (`.slice(0, 5)`) is handled in the mapper, not in the service. Correct placement.

**Reuse rule:** Every new repository follows the same structure:

1. Local row interface
2. Private mappers (rowToModel, modelToRow)
3. Named query/mutation functions — no class, no base class
4. `handleDbError` on every Supabase error
5. Never returns raw DB types — always maps to domain model before returning

---

## 2. Service Design

**Verdict: KEEP**

- Service does not import `db` or anything from `@rara/database`. Correct — DB access is entirely behind the repository boundary.
- Validation is in the service, not the repository and not the router. Correct placement. Repositories are trusted at the service boundary.
- Throws `ServiceError` for business rule violations. Repository errors (DB failures) propagate as `RepositoryError` and are not caught here. Correct — each layer handles its own errors.
- `DEFAULT_BUSINESS_HOURS` fallback is in the service, not the repository. Repository returns what the DB has (empty array). Service decides what empty means. Correct placement.
- No `any`. No Supabase types in function signatures.

**Reuse rule:** Every new service:

1. Imports only from its repository and `../lib/*`
2. Validates input, throws `ServiceError` with a user-readable message and a field name when applicable
3. Handles "not found → return default" in the service, not the repository
4. Does not catch `RepositoryError` — lets it propagate to the router

---

## 3. Router Design

**Verdict: KEEP with one note**

- All procedures use `protectedProcedure`. Correct — `ctx.salonId` is narrowed to `string` before service calls.
- Zod input schemas defined locally in the router file. Correct for now — schemas do not need to be shared until a domain has both a router and a webhook/background job consuming the same shape.
- `try/catch` with `toTRPCError()` wraps every procedure body. Correct.
- Returns `{ success: true as const }` for mutations. This is a concrete type (`{ success: true }`) not `MutationResult<T>`.

**Note on `MutationResult<T>` vs `{ success: true }`:**

The router returns `{ success: true as const }` directly, not `ok()` from `result.ts`. Both typecheck correctly. However `result.ts` was built specifically for this pattern. Routers should use `ok()` consistently:

```typescript
// AVOID (current pattern — works but inconsistent with result.ts)
return { success: true as const };

// PREFER (uses result.ts, consistent across all routers)
return ok();
```

This is a cosmetic inconsistency now. It becomes a real inconsistency when a router returns `ok(createdItem)` with data — if some routers use `ok()` and others use raw objects, the client-side handling diverges.

**Reuse rule:** All routers use `ok()` / `ok(data)` from `result.ts`. Never return raw `{ success: true }`.

---

## 4. Controller Design

**Verdict: REVISE — interface split required**

The current `OperationalController` interface mixes two data sources:

```typescript
export interface OperationalController {
  settings: OperationalSettings;   // businessHours from DB, rest from local state
  isLoading: boolean;              // from tRPC query
  isSavingHours: boolean;          // from tRPC mutation
  saveBusinessHours: ...           // writes to DB
  updateBusinessHoursDay: ...      // patches query cache
  addSpecialClosingDate: ...       // local state only (mock)
  updateSpecialClosingDate: ...    // local state only (mock)
  removeSpecialClosingDate: ...    // local state only (mock)
  updateBookingPolicy: ...         // local state only (mock)
}
```

This is intentional for Sprint 1 — `specialClosingDates` and `bookingPolicy` are not yet connected. However, the mixed interface creates a problem for future sprints: when Sprint 2 connects `bookingPolicy`, the controller interface will need `isSavingPolicy`, `saveBookingPolicy`, etc. If these are added without structure, the interface becomes a flat list of unrelated fields.

The pattern to adopt before Sprint 1.2 is **per-section loading/saving state**:

```typescript
export interface OperationalController {
  businessHours: {
    data: BusinessHoursDay[];
    isLoading: boolean;
    isSaving: boolean;
    save: (hours: BusinessHoursDay[]) => Promise<void>;
    updateDay: (dayOfWeek: DayOfWeek, patch: Partial<...>) => void;
  };
  bookingPolicy: {
    data: BookingPolicy;
    isSaving: boolean;  // false until Sprint 2
    save: (policy: BookingPolicy) => Promise<void>;
    update: (patch: Partial<BookingPolicy>) => void;
  };
  specialClosingDates: {
    data: SpecialClosingDate[];
    isSaving: boolean;
    add: (entry: Omit<SpecialClosingDate, 'id'>) => void;
    update: (id: string, patch: Partial<...>) => void;
    remove: (id: string) => void;
  };
}
```

This structure scales cleanly: each section is independently loadable and saveable. The page component accesses `ctrl.businessHours.data` instead of `ctrl.settings.businessHours`, which is more explicit about data origin.

**This revision is NOT required before Sprint 1.2 (booking_policies) but MUST be done before Sprint 1.3 (special_closing_dates) to avoid interface debt accumulating across three mixed-source sections.**

For Brand, Layanan, Tim, Pengguna — each has simpler domain models with fewer sections, so the flat interface is acceptable. The section-scoped interface applies to domains with multiple independently-saveable subsections (Operasional, Booking App).

---

## 5. React Query Integration

**Verdict: KEEP**

- `useQuery` with `placeholderData: DEFAULT_*` — UI never shows an empty/loading skeleton on first paint. Correct approach for settings pages.
- `staleTime: 30_000` on the business hours query. Conservative and intentional — settings data changes rarely, 30s prevents redundant refetches when navigating away and back.
- `useMutation` with `onSuccess` invalidation — forces a refetch after save to confirm the DB state matches what was sent. No optimistic update, which avoids the complexity of rollback on failure.

**One issue — `getAuthHeaders` is called once at client creation, not per-request:**

```typescript
// trpc-provider.tsx (current)
const [trpcClient] = useState(() =>
  trpc.createClient({
    links: [httpBatchLink({ url: "/api/trpc", headers: getAuthHeaders })],
  }),
);
```

`getAuthHeaders` is passed as a function reference — `httpBatchLink` calls it on each request. This is correct. However, if the user logs out and back in as a different salon owner during the same browser session, the `QueryClient` still holds cached data from the previous salon. There is no cache flush on auth change.

**This is acceptable for Phase 1** (single mock user, no real logout flow), but must be addressed in Sprint 4 when Supabase Auth is connected. Flag for Sprint 4.

**Reuse rule for new domains:**

- `placeholderData: DEFAULT_*` on all settings queries
- `staleTime: 30_000` minimum — increase per domain if data changes rarely
- `onSuccess: () => void utils.<domain>.invalidate()` on all mutations
- No optimistic updates — invalidate and refetch

---

## 6. Error Handling

**Verdict: KEEP**

The three-layer chain is correct and complete:

```
Supabase error (raw object)
  → handleDbError()   → RepositoryError (repository layer)
  → propagates up     → caught in router
  → toTRPCError()     → TRPCError (sent to client)

ServiceError (business rule)
  → thrown in service
  → propagates up
  → toTRPCError()     → TRPCError with code: BAD_REQUEST (sent to client)
```

`PG_CODE_MAP` covers the five most common Postgres error codes. Any unmapped code falls through to `INTERNAL_SERVER_ERROR`, which is correct — unmapped DB errors are not safe to surface to clients.

The client-side handler in `OperationalPageClient.tsx` is a bare `catch {}` with a toast. This is intentional — the tRPC error message is not shown to the user directly. Error messages from `ServiceError` could be shown if the client reads `err.message` from the caught `TRPCClientError`. Whether to do this is a UI decision for each domain.

**Reuse rule:** Do not catch `RepositoryError` in services. Do not catch `ServiceError` in repositories. Each layer only throws its own error type.

---

## 7. Loading States

**Verdict: REVISE — naming standardization required**

Currently:

- `isLoading: boolean` — initial query fetch in flight
- `isSavingHours: boolean` — mutation in flight

The suffix `Hours` in `isSavingHours` is domain-specific. Other controllers (Tim, Brand, Layanan) use `isSaving: boolean` from `BaseSettingsController`. When these controllers are migrated to tRPC, their interfaces will use `isSaving` (matching `BaseSettingsController`), while Operasional uses `isSavingHours`. This is a minor inconsistency but creates friction when reading code across domains.

**Resolution:** For single-mutation controllers (Brand, Layanan, Tim, Pengguna — one save operation each), use `isSaving`. For multi-mutation controllers (Operasional, Booking App — multiple independently saveable sections), use per-section naming: `isSavingHours`, `isSavingPolicy`, etc. This is the correct distinction and does not need to change.

**Required action:** Update `BaseSettingsController.ts` to clarify this. The current interface:

```typescript
export interface BaseSettingsController {
  isDirty: boolean;
  isSaving: boolean;
  handleSave: () => void;
  handleReset: () => void;
}
```

Should be documented as applying to single-save-target controllers only. Multi-section controllers do not extend this base.

---

## 8. Mutation Pattern

**Verdict: KEEP with one correction**

The `mutateAsync` + `await` pattern in the controller is correct:

```typescript
const saveBusinessHours = useCallback(
  async (hours: BusinessHoursDay[]) => {
    await upsertMutation.mutateAsync({ hours });
  },
  [upsertMutation],
);
```

The page component handles errors:

```typescript
async function handleHoursSave() {
  try {
    await ctrl.saveBusinessHours(draftHours);
    showToast("Jam operasional disimpan.");
    setSheet(null);
  } catch {
    showToast("Gagal menyimpan jam operasional. Coba lagi.");
  }
}
```

**One issue:** `upsertMutation` is in the `useCallback` dependency array. React's `useCallback` referential equality check will create a new `saveBusinessHours` reference every render if `upsertMutation` changes identity. `useMutation` from React Query returns a stable `mutateAsync` reference but the full mutation object may not be stable.

**Fix for all future controllers:**

```typescript
// AVOID
const saveBusinessHours = useCallback(
  async (hours) => { await upsertMutation.mutateAsync({ hours }); },
  [upsertMutation],  // mutation object, may change
);

// PREFER
const { mutateAsync: upsertHours, isLoading: isSavingHours } =
  trpc.settings.operational.upsertBusinessHours.useMutation({ onSuccess: ... });

const saveBusinessHours = useCallback(
  async (hours) => { await upsertHours({ hours }); },
  [upsertHours],  // stable mutateAsync reference
);
```

This is a low-risk issue in practice (the callback is recreated but not passed as a prop that would cause child re-renders), but the destructured form is cleaner and explicit about what is actually needed.

---

## 9. Cache Invalidation Pattern

**Verdict: KEEP**

```typescript
const upsertMutation =
  trpc.settings.operational.upsertBusinessHours.useMutation({
    onSuccess: () => {
      void utils.settings.operational.getBusinessHours.invalidate();
    },
  });
```

Invalidating the specific query (not all settings queries) is correct. Broad invalidation (`utils.settings.invalidate()`) would cause unnecessary refetches across all settings domains.

The `void` operator on the invalidate call is correct — `invalidate()` returns a Promise that should not be awaited inside `onSuccess` (it would delay the mutation completion callback).

**Reuse rule:** After every mutation, invalidate only the queries that read the data that was mutated. If a mutation writes to table A and table B, invalidate both A and B queries. Never invalidate at the namespace level.

---

## Pattern Classification Table

| #   | Pattern                                                      | Classification | Action Required                                                               |
| --- | ------------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------- |
| 1   | Repository structure (row interface, mappers, handleDbError) | **KEEP**       | None                                                                          |
| 2   | Service validates, repository trusts                         | **KEEP**       | None                                                                          |
| 3   | protectedProcedure for all settings procedures               | **KEEP**       | None                                                                          |
| 4   | `toTRPCError()` in every router try/catch                    | **KEEP**       | None                                                                          |
| 5   | `ok()` / `ok(data)` from result.ts                           | **KEEP**       | Fix Sprint 1.1 router to use `ok()` instead of `{ success: true as const }`   |
| 6   | Controller per-section scoping for multi-mutation domains    | **REVISE**     | Restructure Operasional controller before Sprint 1.3                          |
| 7   | `placeholderData: DEFAULT_*` on all settings queries         | **KEEP**       | None                                                                          |
| 8   | `staleTime: 30_000` minimum                                  | **KEEP**       | None                                                                          |
| 9   | `onSuccess` invalidation, no optimistic updates              | **KEEP**       | None                                                                          |
| 10  | Loading state naming (`isSaving` vs `isSavingX`)             | **REVISE**     | Document in BaseSettingsController that it applies to single-save-target only |
| 11  | `mutateAsync` destructured from mutation object              | **REVISE**     | Apply destructured form in all new controllers                                |
| 12  | `BaseSettingsController` interface for single-save domains   | **KEEP**       | None                                                                          |

---

## Patterns to AVOID

### AVOID: `useState` isSaving simulation

Current mock controllers (Brand, Tim, Pengguna) simulate saving with:

```typescript
const [isSaving, setIsSaving] = useState(false);

async function handleSave() {
  setIsSaving(true);
  await delay(600);
  setSaved({ ...draft });
  setIsSaving(false);
}
```

Do not carry this pattern forward into real tRPC controllers. The `isSaving` state is provided by `useMutation().isLoading`. There is no need for manual state management.

### AVOID: Catching `RepositoryError` in services

Services must not wrap repository calls in try/catch:

```typescript
// AVOID
export async function getProfile(salonId: string) {
  try {
    return await profileRepo.getProfile(salonId);
  } catch (err) {
    // handling RepositoryError here breaks the error chain
    throw new ServiceError("Failed to load profile", "LOAD_FAILED");
  }
}
```

This destroys the PG error code that `toTRPCError()` uses to map DB errors to correct HTTP status codes. Let `RepositoryError` propagate unmodified through the service layer.

### AVOID: Page components importing `db` or any Supabase type

The `OperationalPageClient.tsx` calls only `ctrl.*`. No server imports. This boundary must hold for every settings page client. Pages may import from `hooks/settings/*`, `components/*`, and `types/*`. They may not import from `server/*`.

---

## Pre-Sprint 1.2 Checklist

Before Sprint 1.2 (booking_policies) begins:

- [ ] Fix `operational.ts` router to return `ok()` instead of `{ success: true as const }`
- [ ] Update `BaseSettingsController.ts` with a comment that it is for single-save-target domains only
- [ ] Apply destructured `mutateAsync` form in the Operasional controller (low priority — functional as-is)
- [ ] No structural change to `OperationalController` interface yet — defer until Sprint 1.3

No infrastructure changes required. The pattern is ready for Brand, Layanan, Booking App, Tim, Pengguna.
