# Settings V2 — Final Production Audit

**Date:** 2026-06-12
**Scope:** Sprint 1.1 through Sprint 4 — all 7 Settings domains
**Question answered:** Can Settings V2 be considered production-ready after migrations are applied?

---

## Verdict

**NO. Settings V2 is NOT production-ready as-is.**

Three blockers must be resolved before the system can serve real salon owners:

1. `context.ts` does not verify that `x-salon-id` belongs to the authenticated user — any request with a forged header accesses another salon's data.
2. `business_hours` table has no migration file — the Operational domain may not work on a fresh DB.
3. `useAuth.ts` is still a dummy stub — components that import from it (not `AuthContext`) still get hardcoded mock data.

All other issues are SHOULD FIX or POST-MVP.

---

## Scores

| Dimension                | Score  | Rationale                                                                                                           |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------- |
| **Production Readiness** | 4 / 10 | Three blockers; no RLS; uploads all deferred; customer app not updated                                              |
| **Architecture**         | 7 / 10 | Consistent layered stack across all 7 domains; 3 non-atomic operations; `context.ts` still Phase 1                  |
| **Security**             | 2 / 10 | No RLS; `x-salon-id` header not verified; service role key used for all server queries                              |
| **Scalability**          | 6 / 10 | `Promise.all` for parallel reads; `staleTime` consistent; `placeholderData` missing in 2 controllers; no pagination |

---

## Check 1 — Migration Order

**Status: SHOULD FIX**

| #    | File                           | Depends On                              | Status                                                           |
| ---- | ------------------------------ | --------------------------------------- | ---------------------------------------------------------------- |
| 0001 | `alter_salons_brand_booking`   | `salons`                                | Ordered correctly                                                |
| 0002 | `alter_categories_services`    | `categories`, `services`                | Ordered correctly                                                |
| 0003 | `create_bank_accounts`         | `salons`                                | Ordered correctly                                                |
| 0004 | `create_staff_tables`          | `salons`, `services`                    | Ordered correctly                                                |
| 0005 | `create_add_on_products`       | `salons`                                | Ordered correctly                                                |
| 0006 | `create_service_bundles`       | `salons`, `services`                    | Ordered correctly                                                |
| 0007 | `create_salon_users`           | `salons`, `auth.users`, `staff_members` | Ordered correctly — but depends on `staff_members` from 0004     |
| —    | `add_settlement_proof_url.sql` | `bookings`                              | **NOT SEQUENCED** — no number prefix; outside the ordered system |

### Issue A — `add_settlement_proof_url.sql` is unsequenced

The file `packages/database/src/migrations/add_settlement_proof_url.sql` does not carry a sequence prefix. If a migration runner is ever adopted (Supabase CLI), this file will not be automatically discovered and applied. Rename to `0008_add_settlement_proof_url.sql`.

**Classification: SHOULD FIX** | Effort: 5 minutes

### Issue B — `business_hours` table: no migration file exists

The `operational.repository.ts` reads and writes to a `business_hours` table, requiring `UNIQUE(salon_id, day_of_week)` for the UPSERT `ON CONFLICT` clause. **There is no SQL migration file for this table in the codebase.** No file from 0001–0007 creates it.

This means the table either:

- Pre-existed in the Supabase project before the Sprint system was established (undocumented baseline), OR
- Does not exist — in which case the Operational domain throws a `42P01` ("undefined table") error for all salons.

The missing migration cannot be retroactively created without knowing the original schema.

**Classification: BLOCKER** | Effort: 30 minutes (inspect live DB → document exact DDL → create `0000_create_business_hours.sql`)

---

## Check 2 — Missing Foreign Keys

**Status: POST-MVP**

| Table                       | Column                                                      | Issue                                                                                                                                                                          |
| --------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `staff_service_assignments` | `service_ids TEXT[]`                                        | Array column — Postgres cannot enforce FK constraints on array elements. Deleted services leave stale UUIDs in the array. Silent data corruption.                              |
| `service_bundle_items`      | `service_id UUID REFERENCES services(id) ON DELETE CASCADE` | FK exists with CASCADE. **However:** a deleted service silently removes items from bundles, potentially degrading a bundle below its 2-service minimum. No alerting mechanism. |
| `staff_schedules`           | All FK correct                                              | No issue.                                                                                                                                                                      |
| `salon_users`               | `staff_id REFERENCES staff_members(id) ON DELETE SET NULL`  | Correct — FK exists, SET NULL on staff delete.                                                                                                                                 |

### Issue C — `service_bundle_items` silent degradation

When a service is deleted, `ON DELETE CASCADE` removes it from all bundles. A bundle can degrade to 0 service items. The `BundlesSection` UI will show the bundle with an empty service list and no warning.

Mitigation: add a `CHECK` in the service delete path that counts active bundle items and warns (or blocks) if deleting would degrade a bundle below 2.

**Classification: SHOULD FIX** | Effort: 2 hours (add service-layer check in `services.service.ts` `deleteService`)

### Issue D — `staff_service_assignments` stale service IDs

`service_ids TEXT[]` has no FK. When a service is deleted, its ID stays in the array silently. The `ServiceAssignmentSection` will show a ghost checkbox for a service that no longer exists (it tries to look it up in `domainFromDb.services` and finds nothing — UI renders nothing, but the stale ID remains in DB).

**Classification: POST-MVP** | Effort: 3 hours (cleanup trigger or service-layer guard on service delete)

---

## Check 3 — Missing Indexes

**Status: SHOULD FIX**

| Table                       | Missing Index                                                                                                                                                                                   | Impact                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `staff_service_assignments` | `salon_id` index exists. `staff_id` index exists. No composite.                                                                                                                                 | Acceptable for small salon sizes.     |
| `bank_accounts`             | `salon_id` index exists.                                                                                                                                                                        | Acceptable.                           |
| `salon_users`               | `salon_id` and `auth_user_id` indexes exist.                                                                                                                                                    | Covered.                              |
| `business_hours`            | Unknown — table has no migration file. The UPSERT requires `UNIQUE(salon_id, day_of_week)` to exist. If the index does not exist, `upsertBusinessHours` inserts duplicates instead of updating. | **Critical if constraint is absent.** |

### Issue E — `business_hours` UNIQUE constraint may be absent

The `upsertBusinessHours` repository function uses:

```typescript
.upsert(rows, { onConflict: 'salon_id,day_of_week' })
```

If the `UNIQUE(salon_id, day_of_week)` constraint does not exist on the live `business_hours` table, every save creates new rows instead of updating, resulting in duplicate entries per day. After N saves, a salon has N×7 rows. The `getBusinessHours` query takes the first 7 rows, so duplicates are silently ignored — until they're not.

**Classification: BLOCKER** (part of Issue B) | Verify constraint exists on live DB before shipping.

---

## Check 4 — Missing RLS Policies

**Status: BLOCKER before public launch; POST-MVP for closed beta**

No RLS policies exist on any table. All server-side queries use the `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS entirely. All client-side Supabase usage (browser client, `/api/auth/me`) uses the service role via the server.

**Current exposure:**

- Direct Supabase REST calls (bypassing tRPC) with the anon key can read all rows from all tables across all salons.
- The anon key is `NEXT_PUBLIC_SUPABASE_ANON_KEY` — visible in the browser bundle.
- A motivated attacker can enumerate all salon data, staff records, user emails, bank accounts, and salon policies.

**Required before public launch:**

```sql
-- Example: salon_users
ALTER TABLE salon_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "salon_users: read own salon" ON salon_users
  FOR SELECT USING (auth.uid() IN (
    SELECT auth_user_id FROM salon_users WHERE salon_id = salon_users.salon_id
  ));
```

Similar policies needed for: `salons`, `categories`, `services`, `bank_accounts`, `business_hours`, `staff_members`, `staff_service_assignments`, `staff_schedules`, `staff_leaves`, `add_on_products`, `service_bundles`, `service_bundle_items`.

**Classification: BLOCKER (public launch)** | Effort: 1–2 days (13 tables × ~3 policies each)

For a **closed beta** with known, trusted salon owners who cannot make arbitrary Supabase API calls, this can be POST-MVP. Mark as deferred only if all test users are pre-approved and the anon key is not exposed in a public deployment.

---

## Check 5 — Missing Repository Coverage

**Status: COMPLETE with one gap**

| Domain              | Repository                  | Coverage                                                                                                           |
| ------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Operational         | `operational.repository.ts` | `getBusinessHours`, `upsertBusinessHours` — complete                                                               |
| Brand               | `brand.repository.ts`       | `getBrandProfile`, `updateBrandProfile`, `updateLogoUrl`, `updateCoverUrl` — complete                              |
| Services            | `services.repository.ts`    | Full CRUD for categories and services — complete                                                                   |
| Booking App         | `booking-app.repository.ts` | Full CRUD + salon columns — complete                                                                               |
| Team                | `team.repository.ts`        | 2 queries + 9 write ops — complete                                                                                 |
| Products & Packages | `produkpaket.repository.ts` | Full CRUD for add-ons and bundles + cross-salon validation — complete                                              |
| Users & Access      | `pengguna.repository.ts`    | `getUsers`, `createInvite`, `updateRole`, `setStatus`, `cancelInvite`, `getUserById`, `getUserByAuthId` — complete |

### Issue F — `getUserByAuthId` is unused

`getUserByAuthId` in `pengguna.repository.ts` is defined but never called. The `/api/auth/me` route queries `salon_users` directly via `db` (bypassing the repository layer). The repository function exists but is orphaned.

**Classification: POST-MVP** | Effort: 15 minutes (either delete the function or route `/api/auth/me` through it)

---

## Check 6 — Missing Router Registration

**Status: COMPLETE**

All 7 routers are registered in `_settings.ts`:

```typescript
export const settingsRouter = router({
  brand: brandRouter, // Sprint 1.2
  operational: operationalRouter, // Sprint 1.1
  services: servicesRouter, // Sprint 1.3
  bookingApp: bookingAppRouter, // Sprint 2
  team: teamRouter, // Sprint 3.1
  produkPaket: produkPaketRouter, // Sprint 3.2
  pengguna: penggunaRouter, // Sprint 4
});
```

No missing registrations.

---

## Check 7 — Missing Controller Wiring

**Status: 2 gaps**

### Issue G — `useAuth.ts` is still a dummy stub

`apps/owner/src/features/auth/hooks/useAuth.ts` returns hardcoded dummy data (OWNER role, `dummy-user` id, all permissions granted). It has not been updated to read from `AuthContext`. Any component that imports `useAuth()` instead of `useContext(AuthContext)` gets stale mock data after Sprint 4.

Affected: `PermissionGate.tsx`, `ProtectedRoute.tsx`, `DashboardSidebar.tsx` (uses `useAuth` or `useContext(AuthContext)` — needs verification), and `overview/page.tsx`.

**Classification: BLOCKER** | Effort: 1 hour (update `useAuth.ts` to read from `AuthContext`)

### Issue H — Missing `placeholderData` in Brand and BookingApp controllers

`SETTINGS_PERSISTENCE_MILESTONE_REVIEW.md` called this out as a required fix before Sprint 3. It was not fixed in any subsequent sprint.

- `useBrandProfileController.ts` — no `placeholderData` on `getBrandProfile` query
- `useBookingAppController.ts` — no `placeholderData` on `getBookingAppSettings` query

Both controllers show an empty/loading state on first render instead of the skeleton that Operational and Services pages show.

**Classification: SHOULD FIX** | Effort: 30 minutes (add `EMPTY_BRAND_PROFILE` and `DEFAULT_BOOKING_APP_SETTINGS` constants as `placeholderData`)

---

## Check 8 — Missing `placeholderData`

Already covered in Check 7 Issue H. Comprehensive table:

| Controller                  | `placeholderData`        | Status     |
| --------------------------- | ------------------------ | ---------- |
| `useOperationalController`  | `DEFAULT_BUSINESS_HOURS` | Present    |
| `useBrandProfileController` | **MISSING**              | SHOULD FIX |
| `useServicesController`     | `EMPTY_DOMAIN`           | Present    |
| `useBookingAppController`   | **MISSING**              | SHOULD FIX |
| `useTeamController`         | `EMPTY_DOMAIN` / `[]`    | Present    |
| `useProdukPaketController`  | `EMPTY_DOMAIN`           | Present    |
| `usePenggunaController`     | `[]`                     | Present    |

---

## Check 9 — Auth Edge Cases

### Issue I — `x-salon-id` header not verified against the authenticated user (CRITICAL)

**Classification: BLOCKER**

`context.ts` reads `salonId` from the `x-salon-id` request header. `TRPCProvider` sets this header from `localStorage.currentUser.salonId`. After Sprint 4, `currentUser.salonId` comes from the real Supabase Auth session via `/api/auth/me`.

**However:** `context.ts` does NOT verify that the header value actually belongs to the authenticated user. An attacker can:

1. Log in with their own account (get a real `x-user-id`)
2. Send a different `x-salon-id` pointing to another salon
3. All `protectedProcedure` calls succeed — they only check `ctx.salonId !== null`
4. The attacker reads/writes another salon's data

**Fix:** Update `context.ts` to derive `salonId` from the Supabase JWT, not from a header:

```typescript
import { db } from "../db";

export async function createContext(
  opts: CreateNextContextOptions,
): Promise<TRPCContext> {
  const authHeader = opts.req.headers["authorization"] as string | undefined;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return { salonId: null, userId: null };

  const {
    data: { user },
  } = await db.auth.getUser(token);
  if (!user) return { salonId: null, userId: null };

  const { data: salonUser } = await db
    .from("salon_users")
    .select("id, salon_id")
    .eq("auth_user_id", user.id)
    .eq("status", "ACTIVE")
    .maybeSingle();

  return {
    salonId: salonUser?.salon_id ?? null,
    userId: salonUser?.id ?? null,
  };
}
```

This adds ~1 DB lookup per tRPC request. Use `@supabase/ssr` for JWT verification without a network call as an optimization.

Also requires `TRPCProvider` to send the Supabase `access_token` as `Authorization: Bearer <token>` instead of (or in addition to) the `x-salon-id` header.

**Effort:** 2–3 hours (context.ts rewrite + TRPCProvider header update + regression test)

---

### Issue J — `logout` type mismatch

`AuthContextType.logout` is typed as `() => void` but `AuthProvider.logout` is now `async () => Promise<void>`. TypeScript accepts this (async functions are assignable to `() => void`) but callers that do `await ctx.logout()` against the typed interface will get a type error. Update the type to `logout: () => Promise<void>`.

**Classification: SHOULD FIX** | Effort: 5 minutes

---

### Issue K — TRPCProvider salonId timing gap

On cold page load: `AuthContext` is loading (async `getSession()` + `/api/auth/me` fetch). `TRPCProvider` fires the first batch of tRPC queries before localStorage is populated with the real user. All `protectedProcedure` calls return `UNAUTHORIZED` (no `x-salon-id` header). React Query retries on UNAUTHORIZED after a delay.

**Impact:** ~300–800ms blank state on cold load. Not a crash — React Query retries. But creates a flash of "UNAUTHORIZED" state that might surface as empty/error states in edge cases.

**Fix:** Suspend tRPC queries until `AuthContext.loading === false`. Add `enabled: !auth.loading` to all domain queries, or wrap the settings shell in a loading gate.

**Classification: SHOULD FIX** | Effort: 2 hours (add loading gate in settings layout)

---

### Issue L — `cancelInvite` leaves orphaned auth user

`cancelInvite` deletes the `salon_users` row but does not call `db.auth.admin.deleteUser(auth_user_id)`. The cancelled invitee retains a Supabase Auth account. Their email is blocked in `auth.users`. If the owner re-invites the same email later, Supabase re-sends the invite to the existing auth user (correct behavior) — but if the auth user has already set a password (they clicked the invite link and set up an account), re-inviting them is not a clean operation.

**Classification: SHOULD FIX** | Effort: 1 hour (fetch `auth_user_id` before delete, call `db.auth.admin.deleteUser`)

---

## Check 10 — Cross-Domain Dependencies

| Dependency                                                                  | Risk                                                 | Status                   |
| --------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------ |
| `service_bundle_items.service_id → services.id`                             | Bundle degrades silently on service delete           | Issue C (SHOULD FIX)     |
| `staff_service_assignments.service_ids TEXT[]`                              | Stale IDs on service delete                          | Issue D (POST-MVP)       |
| `salon_users.staff_id → staff_members.id ON DELETE SET NULL`                | Clean — FK exists                                    | OK                       |
| `getTeamDomain` includes staff assignments which reference service IDs      | Services must load before assignments are meaningful | No code dependency; safe |
| Products domain reads `services` for bundle composition (cross-salon check) | `getValidServiceIds` guards this correctly           | OK                       |

### Issue M — No guard on service delete when service is in active bundles

`servicesService.deleteService` does not check whether the service being deleted is referenced in any `service_bundle_items`. After deletion, affected bundles silently have fewer services.

**Classification: SHOULD FIX** | Effort: 2 hours (add lookup before delete; surface warning or block)

---

## Check 11 — Upload-Related Blockers

All file uploads are **deferred** across all domains. This is the largest functional gap for an owner completing their salon setup.

| Field        | Domain      | Current behavior                                        | Sprint 4 note          |
| ------------ | ----------- | ------------------------------------------------------- | ---------------------- |
| Logo         | Brand       | blob: URL stored locally; never persisted to DB         | Documented as deferred |
| Cover image  | Brand       | blob: URL stored locally; never persisted to DB         | Documented as deferred |
| QRIS image   | Booking App | blob: URL silently dropped; DB unchanged                | Documented as deferred |
| Staff avatar | Team        | blob: URL never passed to mutation (no upload UI wired) | Documented as deferred |
| Add-on image | Products    | blob: URL stripped in service layer before DB write     | Documented as deferred |
| Bundle image | Products    | blob: URL stripped in service layer before DB write     | Documented as deferred |

**Required infrastructure for all uploads:**

1. Supabase Storage buckets: `logos`, `covers`, `qris-images`, `staff-avatars`, `product-images`
2. Presigned URL generation endpoint (server-side, service role)
3. Client-side upload flow: file → presigned PUT → confirm URL → tRPC mutation with `https://` URL

All upload mutations already accept `https://` URLs. No router or service changes needed — only the client-side upload pipeline.

**Classification: SHOULD FIX (logo/cover/QRIS are user-visible gaps); POST-MVP (staff avatar, product images)** | Effort: 1–2 days (shared upload utility + 5 bucket configurations)

---

## Check 12 — Production Readiness

### Summary of all findings

**BLOCKERS (must fix before production)**

| #   | Issue                                                   | Location                             | Effort                          |
| --- | ------------------------------------------------------- | ------------------------------------ | ------------------------------- |
| B   | `business_hours` table: no migration file               | `packages/database/migrations/`      | 30 min                          |
| E   | `business_hours` UNIQUE constraint may be absent        | `business_hours` table in live DB    | 30 min (audit + add if missing) |
| I   | `x-salon-id` header forgeable — cross-salon data access | `src/server/trpc/context.ts`         | 2–3 hrs                         |
| G   | `useAuth.ts` is still a dummy stub                      | `src/features/auth/hooks/useAuth.ts` | 1 hr                            |
| RLS | No row-level security on any table                      | Supabase dashboard                   | 1–2 days                        |

**SHOULD FIX (fix before GA; acceptable for closed beta)**

| #       | Issue                                             | Location                        | Effort   |
| ------- | ------------------------------------------------- | ------------------------------- | -------- |
| H       | Missing `placeholderData` in Brand + BookingApp   | 2 controller files              | 30 min   |
| J       | `logout` typed as `() => void` but is async       | `auth.types.ts`                 | 5 min    |
| K       | tRPC fires before auth loads — UNAUTHORIZED flash | Settings layout                 | 2 hrs    |
| L       | `cancelInvite` leaves orphaned auth user          | `pengguna.service.ts`           | 1 hr     |
| C       | `service_bundle_items` silent bundle degradation  | `services.service.ts`           | 2 hrs    |
| M       | No guard on service delete when in active bundles | `services.service.ts`           | 2 hrs    |
| A       | `add_settlement_proof_url.sql` unsequenced        | `packages/database/migrations/` | 5 min    |
| Uploads | Logo, cover, QRIS uploads not persisted           | Upload pipeline                 | 1–2 days |

**POST-MVP (technical debt; does not block operation)**

| #              | Issue                                                      | Location                           | Effort          |
| -------------- | ---------------------------------------------------------- | ---------------------------------- | --------------- |
| D              | `staff_service_assignments.service_ids` stale IDs          | `services.service.ts`              | 3 hrs           |
| F              | `getUserByAuthId` repository function unused               | `pengguna.repository.ts`           | 15 min          |
| Atomic         | `createStaff` 3 non-atomic INSERTs                         | Supabase RPC                       | 3 hrs           |
| Atomic         | `inviteUser` non-atomic auth + salon_users                 | Supabase RPC / error recovery      | 2 hrs           |
| Atomic         | `updateBundle` non-atomic UPDATE + DELETE + INSERT         | Supabase RPC                       | 2 hrs           |
| sortOrder      | sort_order race on concurrent adds                         | All CRUD domains                   | 4 hrs           |
| Audit          | `NoopAuditLogger` — no audit trail                         | `audit_logs` table + DbAuditLogger | 4 hrs           |
| Pagination     | Leave history and user list grow unbounded                 | Repositories + UI                  | 3 hrs           |
| Hex colors     | `DashboardSidebar` uses deprecated `getRoleColor()`        | `DashboardSidebar.tsx`             | 30 min          |
| `useAuth`      | `useAuth.ts` stub not connected to auth context            | `useAuth.ts`                       | 1 hr            |
| Customer app   | Booking flow still uses mock/static data                   | `apps/customer`                    | separate sprint |
| Staff avatars  | No upload UI wired to controller                           | StaffDirectorySection              | 2 hrs           |
| Product images | blob: URLs stripped; images never persist                  | Upload pipeline                    | 2 hrs           |
| Multi-salon    | Single salon per auth user assumption                      | `/api/auth/me`                     | separate sprint |
| `updated_at`   | Manual `updated_at` set may double-write if trigger exists | Multiple repositories              | 1 hr            |

---

## Answer: Can Settings V2 be considered production-ready after migrations are applied?

**No.** Applying migrations alone does not make it production-ready.

Three issues remain after all migrations are applied:

1. **Cross-salon data access via forged header** — `context.ts` reads `salonId` from a request header it does not verify. A logged-in attacker can read or write any salon's settings, users, staff, bank accounts, and service data by sending an arbitrary `x-salon-id` header. This is a data-isolation failure. **Effort: 2–3 hours.**

2. **`useAuth.ts` dummy stub** — Components that use `useAuth()` (not `useContext(AuthContext)`) return hardcoded `OWNER` access and `dummy-user` identity regardless of who is logged in. This includes permission gates. **Effort: 1 hour.**

3. **`business_hours` table origin unknown** — If the live DB does not have this table with the correct unique constraint, the Operational domain throws a 42P01 error for all salons. Must be verified and documented. **Effort: 30 minutes.**

After fixing these three, the system is **safe for a closed beta** (known, trusted salon owners). It is **not safe for public access** without RLS policies.

Estimated total effort to reach **closed beta**: ~6 hours.
Estimated total effort to reach **public GA**: closed beta fixes + RLS + uploads + auth guard = ~4–5 days.
