# Sprint 0 — Persistence Foundation Report

**Tanggal:** 2026-06-12
**Status:** Complete
**tsc --noEmit:** 0 errors

---

## Files Created

| File                                            | Purpose                                                                                   |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/server/db.ts`                              | Server-side Supabase singleton — single import point for all repositories                 |
| `src/server/trpc/context.ts`                    | tRPC request context with salonId + userId from headers                                   |
| `src/server/settings/lib/errors.ts`             | RepositoryError, ServiceError, handleDbError, toTRPCError                                 |
| `src/server/settings/lib/result.ts`             | MutationResult\<T\>, ok(), err()                                                          |
| `src/server/settings/lib/audit.ts`              | AuditAction, AuditEntry, IAuditLogger, NoopAuditLogger                                    |
| `src/server/settings/lib/upload.ts`             | UploadRequest, UploadResult, uploadRequestSchema, validateUploadRequest, buildStoragePath |
| `src/server/trpc/routers/settings/_settings.ts` | Empty settings namespace router — Sprint 1+ domains plug in here                          |

## Files Modified

| File                              | Change                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/server/trpc/trpc.ts`         | Added TRPCContext type, added protectedProcedure                                                      |
| `src/server/trpc/routers/_app.ts` | Added `settings` namespace (settingsRouter)                                                           |
| `src/pages/api/trpc/[trpc].ts`    | Replaced `() => ({})` context with real createContext                                                 |
| `src/lib/trpc-provider.tsx`       | Added getAuthHeaders(), sends x-salon-id + x-user-id per request, changed URL to relative `/api/trpc` |

---

## Architecture Decisions

### 1. Context over input for salonId

All existing routers pass `salonId` as a procedure input (`.input(z.object({ salonId: z.string() }))`). Settings domain routers will NOT do this. `salonId` comes from `ctx.salonId` — set once per request in `createContext`, not repeated per call.

This enforces that:

- Controllers don't need to know where salonId comes from
- salonId source (header now, session later) changes in one place (`context.ts`)
- `protectedProcedure` is the enforcement point — no procedure-level null checks needed

### 2. Existing routers untouched

`bookings`, `business-hours`, `salons`, `services`, `stylist-schedules`, `stylists` all use `publicProcedure` and pass `salonId` as input. These are NOT part of the settings persistence layer and were not modified.

The `initTRPC.context<TRPCContext>()` change is backward compatible — `publicProcedure` receives context but ignores it, which TypeScript accepts.

### 3. db.ts as indirection layer

```typescript
// src/server/db.ts
export { supabase as db } from "@rara/database";
```

All settings repositories will `import { db } from '../../db'` (relative path), never `from '@rara/database'` directly. When Sprint 4 introduces `createSupabaseClient()` (proper factory pattern), this is the only file that changes.

### 4. Layered error handling

Three distinct error types, each with a clear scope:

```
Supabase error
  → handleDbError()     → RepositoryError  (thrown by repositories)
  → toTRPCError()       → ServiceError     (thrown by services, converted in routers)
  → toTRPCError()       → TRPCError        (returned to client)
```

Routers never catch raw Supabase errors. They catch `RepositoryError` and `ServiceError` via `toTRPCError()`.

### 5. MutationResult vs throwing

Settings mutations return `MutationResult<T>` for non-critical errors that the UI should handle gracefully (validation, not-found). Critical errors (DB down, auth failure) still throw via `toTRPCError()` and become tRPC 5xx responses.

### 6. NoopAuditLogger for Phase 1

`IAuditLogger` is injected into services as a dependency. `NoopAuditLogger` (console-only) is the Phase 1 implementation. Sprint 2 (Booking App) will introduce `DbAuditLogger` that writes to the `audit_logs` table. No service code changes when the logger is swapped.

### 7. Upload contract without implementation

`upload.ts` defines the full contract (request/response types, bucket registry, size limits, path builder) but does NOT implement the presigned URL generation. That requires the `supabaseAdmin` client (service_role_key), which is a Sprint 4 concern. Sprint 2 domain routers that need uploads will stub the upload procedure with `NOT_IMPLEMENTED` until then.

### 8. TRPCProvider URL changed to relative

Changed from hardcoded `http://localhost:3001/api/trpc` to `/api/trpc`. The hardcoded URL would fail in production or if the port changes.

---

## Phase 1 salonId Mismatch — Known Issue

Mock auth users have `salonId: 'salon-001'` (string identifier). The real Supabase salon has UUID `5cdb0848-1b43-44f6-be29-b2ead49ff65a`.

When Sprint 1 connects `useOperasionalController` to tRPC, it will send `x-salon-id: salon-001`. The repository will query `business_hours WHERE salon_id = 'salon-001'` — this returns zero rows.

**Required fix before Sprint 1 can produce live data:**

Option A (recommended): Update `DEFAULT_CURRENT_USER.salonId` in `auth-mock.ts` to the real UUID:

```typescript
salonId: '5cdb0848-1b43-44f6-be29-b2ead49ff65a',
```

Option B: Add a `NEXT_PUBLIC_DEV_SALON_ID` env var and read it in `getAuthHeaders()` as fallback.

This is one line. It is NOT part of Sprint 0 because it touches mock auth data, and the rollout plan keeps mock auth untouched until Sprint 4.

---

## Readiness for Sprint 1

Sprint 1 adds the Operasional domain (business_hours). The required work is:

1. **`src/server/settings/repositories/operational.repository.ts`**

   - Import `db` from `../../db`
   - Call `db.from('business_hours').select().eq('salon_id', salonId)`
   - Wrap errors with `handleDbError()`

2. **`src/server/settings/services/operational.service.ts`**

   - Call `operationalRepository.getBusinessHours(salonId)`
   - Validate business rules (closeTime > openTime)
   - Throw `ServiceError` for violations

3. **`src/server/trpc/routers/settings/operational.ts`**

   - Use `protectedProcedure` — gets `ctx.salonId` automatically
   - Call `operationalService.*`
   - Wrap errors with `toTRPCError()`

4. **Register in `_settings.ts`**

   ```typescript
   import { operationalRouter } from "./operational";
   export const settingsRouter = router({ operational: operationalRouter });
   ```

5. **Refactor `useOperasionalController.ts`**
   - Replace `useState` mock with `trpc.settings.operational.getBusinessHours.useQuery()`
   - Fix salonId mismatch (see Known Issue above)

No new infrastructure is needed. Everything Sprint 1 requires is in place.
