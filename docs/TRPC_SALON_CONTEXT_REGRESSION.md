# tRPC Salon Context Regression

> Audit date: 2026-06-12

---

## Classification

**Race condition — auth hydration.**

Not cosmetic. Not a security issue. Not an architecture issue.

The error fires because settings queries execute before the Supabase access token is written to localStorage. The server never receives a Bearer header, so `context.ts` returns `{ salonId: null }`, and `protectedProcedure` throws UNAUTHORIZED.

---

## Answers to the 6 Verification Questions

### 1. Where is this exact error string defined?

`apps/owner/src/server/trpc/trpc.ts:31`

```ts
message: 'Missing salon context. Ensure x-salon-id header is set.',
```

The message is stale. It was written during Phase 1 when `x-salon-id` was the mechanism. Sprint 4.5 replaced that mechanism with JWT derivation in `context.ts`, but the error string in `trpc.ts` was never updated. The throw condition is real; the message is misleading.

### 2. Is any code path still expecting x-salon-id?

No. `context.ts` explicitly documents that `x-salon-id` is no longer trusted:

```ts
// The x-salon-id / x-user-id headers are no longer trusted — any client can forge them.
```

`TRPCProvider` sends only `Authorization: Bearer <token>`. No code reads or sends `x-salon-id` on any path. The string in the error message is a ghost.

### 3. Is protectedProcedure executing before auth hydration completes?

Yes. This is the root cause.

`useOperationalController` calls:

```ts
trpc.settings.operational.getBusinessHours.useQuery(undefined, {
  staleTime: 30_000,
  placeholderData: DEFAULT_BUSINESS_HOURS,
});
```

No `enabled` flag. The query fires immediately on component mount. A grep for `enabled` across all settings controllers returns zero results — this affects every controller, not just Operational.

### 4. Can a query fire while AuthContext.isLoading === true?

Yes, and it does. The sequence on first page load:

```
1. React renders settings page
2. useOperationalController mounts
3. useQuery fires (no enabled guard)
4. getAuthHeaders() reads localStorage.getItem('authAccessToken')
5. → null  (AuthContext.getSession() has not resolved yet)
6. Request reaches server with no Authorization header
7. context.ts: no Bearer token → returns { salonId: null, userId: null }
8. protectedProcedure: ctx.salonId is null → throws UNAUTHORIZED
9. TRPCClientError: "Missing salon context. Ensure x-salon-id header is set."
```

AuthContext writes `authAccessToken` to localStorage inside a `.then()` callback on `getSession()`, which also awaits `fetchUserProfile()`. By the time that resolves, the query has already failed.

### 5. Is TRPCProvider created before access token exists?

Yes, but this is not the problem. `TRPCProvider` passes `headers: getAuthHeaders` as a **function reference**, not a static object. `getAuthHeaders` is called fresh on every request. The client itself is fine.

The problem is that the query fires before `getAuthHeaders()` has anything to return.

### 6. Is this (a) stale error message, (b) auth hydration race condition, or (c) actual salon context failure?

**(b) Auth hydration race condition.** The context failure at the server is real — the request genuinely arrives without a token. The error message is also stale (a), but that is a symptom of (b), not the cause.

---

## Root Cause

Settings controllers call `useQuery` with no `enabled` guard. Queries fire on mount. `authAccessToken` is not yet in localStorage when they fire. Server receives no Bearer token. `salonId` is null. `protectedProcedure` throws.

The SHOULD FIX item in `SETTINGS_V2_SHIP_READINESS.md` ("tRPC auth loading gate") describes exactly this problem and was deferred. It is no longer deferrable.

---

## Affected Files

| File                                                                                                                                                                                       | Issue                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `apps/owner/src/server/trpc/trpc.ts:31`                                                                                                                                                    | Stale error message references `x-salon-id`      |
| `apps/owner/src/features/dashboard/hooks/settings/useOperationalController.ts`                                                                                                             | `useQuery` has no `enabled` guard                |
| All other settings controllers (`useBookingAppController`, `useBrandProfileController`, `useTeamController`, `usePenggunaController`, `useServicesController`, `useProdukPaketController`) | Same — no `enabled` guard on any `useQuery` call |

---

## Smallest Possible Fix

Two changes. One in the layout, one in `trpc.ts`. Do not touch the controllers.

### Fix 1 — Gate settings page on auth (one file)

The settings layout (or the settings page root) must not render children until `AuthContext.loading === false`. This suppresses all settings queries until the token is in localStorage.

File: the component that wraps `/dashboard/settings/*` routes.

```tsx
// Before rendering settings content:
const { loading } = useAuth();
if (loading) return <SettingsLoadingSkeleton />;
```

`SettingsLoadingSkeleton` can be as simple as the existing loading skeleton already used elsewhere in the dashboard. The exact implementation is a one-liner null/skeleton return.

This single guard prevents every settings controller from firing before auth resolves. No controller changes required.

### Fix 2 — Update stale error message (one line)

File: `apps/owner/src/server/trpc/trpc.ts:31`

```ts
// Before
message: 'Missing salon context. Ensure x-salon-id header is set.',

// After
message: 'Missing salon context. Authorization token missing or invalid.',
```

This does not change behavior. It makes the error actionable when it appears in logs.

---

## What NOT to do

- Do not add `enabled` flags to individual controllers. That is the right long-term pattern, but it requires touching 7+ files and testing each. The layout gate achieves the same result in one place.
- Do not add `retry` to the query client as a workaround. That would mask the race condition rather than fix it, and add latency on every cold load.
- Do not move `authAccessToken` out of localStorage. The TRPCProvider architecture depends on it being readable synchronously at request time.
