# Linva Owner App — Post-Incident Architecture Audit

**Date:** 2026-06-12  
**Branch:** feat/settings-v2-brand-services  
**Auditor:** Claude Code (automated)

---

## Section 1 — Executive Summary

| Area                | Score | Notes                                                                                                |
| ------------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| Auth / Session      | 6/10  | Two-layer token strategy with known race window                                                      |
| Multi-Tenant Safety | 7/10  | salonId flows correctly server-side; 3 `bank_accounts` queries need audit                            |
| Architecture        | 8/10  | Repository → Service → Router → Controller pattern clean and consistent                              |
| Preview Readiness   | 5/10  | Customer app has 6 hardcoded values; no auth guard documented                                        |
| TRPC Authorization  | 8/10  | All 53 settings procedures use `protectedProcedure`; public procedures still exist on legacy routers |

---

## Section 2 — Critical Findings

### CRIT-1: TRPCProvider has two diverging implementations — one is stale

**Files:**

- `apps/owner/src/lib/trpc-provider.tsx` (current on disk — uses `supabaseBrowser.auth.getSession()` async)
- Same file also referenced in git-diff state as previously using `localStorage.getItem('authAccessToken')` sync

**Evidence:**

```ts
// Current (live) trpc-provider.tsx line 14-26
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabaseBrowser.auth.getSession();
  const token = session?.access_token ?? null;
  ...
}
```

The comment on line 10-13 explicitly says the old `localStorage` approach was abandoned. However, `AuthContext.tsx` lines 70-71 **still writes** `authAccessToken` to localStorage:

```ts
localStorage.setItem("authAccessToken", session.access_token);
```

And `setCurrentUser(null)` at line 53 **still removes** `authAccessToken`:

```ts
localStorage.removeItem("authAccessToken");
```

**Impact:** The `authAccessToken` localStorage key is now a phantom write — nothing reads it for TRPC headers anymore. But the `removeItem` in `setCurrentUser(null)` is a sign that the old code path was `removeItem → TRPC fires → 401`. The migration to `getSession()` is correct but the localStorage writes/removes are dead code creating confusion.

**Recommendation:** Remove all `authAccessToken` localStorage read/write/remove from `AuthContext.tsx`. Confirm `trpc-provider.tsx` is 100% on the `getSession()` path.

---

### CRIT-2: Auth hydration race — TRPC queries can fire before session is ready

**File:** `apps/owner/src/lib/trpc-provider.tsx`  
**File:** `apps/owner/src/features/auth/context/AuthContext.tsx` lines 64-92

**Evidence:**

- `AuthContext` sets `loading = true` on mount, then calls `getSession()` async to hydrate
- `TRPCProvider` wraps `QueryClientProvider` — queries start on mount
- No `enabled: !loading` guard on settings query hooks (confirmed in `usePenggunaController.ts` line 41: `useQuery(undefined, {` — no `enabled` check visible)
- Ship Readiness Audit (previously indexed) confirmed: **"Issue K: tRPC fires before auth loads — UNAUTHORIZED flash on cold start"**

**Impact:** On cold load, a protectedProcedure throws `UNAUTHORIZED` before session is hydrated. This is the nav panel blank / 401 bug from the incident.

**Recommendation:** Add `enabled: !!currentUser` or `enabled: !authLoading` to all `useQuery` calls in settings controllers. The `SettingsContentGate.tsx` file (untracked in git status) appears to be the intended fix — verify it gates all routes.

---

### CRIT-3: Stale error message in `trpc.ts` still references `x-salon-id`

**File:** `apps/owner/src/server/trpc/trpc.ts` line 24 and 31

**Evidence:**

```
apps/owner/src/server/trpc/trpc.ts:24: * Phase 1: salonId comes from 'x-salon-id' header sent by TRPCProvider.
apps/owner/src/server/trpc/trpc.ts:31:      message: 'Missing salon context. Ensure x-salon-id header is set.',
```

The comment says "Phase 1" but `context.ts` comment says `x-salon-id` is no longer trusted. The error message thrown to clients still says "Ensure x-salon-id header is set" — this is misleading for debugging and confirms the incident was diagnosed incorrectly at first.

**Impact:** Developer confusion during incidents. The error message sent to the client is wrong.

**Recommendation:** Update line 31 message to: `'Missing salon context. Authorization token missing, invalid, or no active salon_users row.'`

---

## Section 3 — High Priority Findings

### HIGH-1: `bank_accounts` table queried without explicit `salonId` filter at query level

**File:** `apps/owner/src/server/settings/repositories/booking-app.repository.ts` lines 77, 144, 176

**Evidence:** grep shows `.from('bank_accounts')` without `.eq('salon_id', ...)` in the same chain (they appear as separate lines). Requires manual line inspection to confirm whether `salonId` is chained differently.

**Impact:** If the `salonId` filter is missing, any authenticated user can read/write another salon's bank accounts (tenant leak).

**Recommendation:** Read lines 73-185 of `booking-app.repository.ts` and verify every `bank_accounts` query has `.eq('salon_id', salonId)`.

---

### HIGH-2: `pengguna.repository.ts` — multiple `salon_users` queries without visible `salonId` filter

**File:** `apps/owner/src/server/settings/repositories/pengguna.repository.ts` lines 67, 78, 94, 116, 132, 144, 157, 168

**Evidence:** grep shows `from('salon_users')` at 8 locations without `salonId` in the same line. If any of these query all users across salons, it is a tenant data leak.

**Recommendation:** Audit each function signature — `getUsers(salonId)` at line 65 takes it as param. Verify all 8 query sites chain `.eq('salon_id', salonId)`.

---

### HIGH-3: Customer app has 6 hardcoded values that will show wrong data in Preview

**Evidence (from CUSTOMER_APP_MAP.md):**
| Location | Hardcoded Value |
|----------|----------------|
| `StepStylist.tsx:13` | `MOCK_SLOTS` — 7 fixed time slots |
| `StepContact.tsx:42` | `useMockData().products` — addon products |
| `booking.constants.ts` | `DEPOSIT_AMOUNT = 20_000` |
| `app/layout.tsx:14` | Static description "Book your salon appointment at Rara Beauty" |

**Impact:** If Preview embeds the customer app via iframe, owners will see mock data instead of their real salon data.

---

### HIGH-4: `setCurrentUser(null)` deletes `authAccessToken` — logout path not safe if called accidentally

**File:** `apps/owner/src/features/auth/context/AuthContext.tsx` lines 48-56

**Evidence:**

```ts
} else {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authAccessToken');  // ← still here
}
```

If any code calls `setCurrentUser(null)` for a non-logout reason (e.g., failed profile fetch returns null), the token is deleted and the next TRPC request gets 401.

**Recommendation:** Move `authAccessToken` removal exclusively to the `logout()` function. `setCurrentUser(null)` should only clear the profile, not the session token.

---

## Section 4 — Safe To Ignore

- **`publicProcedure` on legacy routers** — used for `getByCode` (bookings lookup by phone) and customer-facing endpoints. These are intentionally public; no customer-identifying data is returned without phone number input.
- **`switchUser()` no-op** — removed in production, kept as API stub. No security risk.
- **`AVATAR_COLORS` hardcoded array in `StepStylist`** — design token, acceptable.
- **`check-booking/page.tsx:142` static confirmation text** — UX copy, not data, acceptable.
- **`console.log` debug lines in AuthContext** — flagged `[DEBUG] remove after verification` already. Low risk but should be cleaned before GA.

---

## Section 5 — Recommended Next PRs (by risk reduction × effort)

| Priority | PR Title                                                                    | Risk Reduced | Effort | Files                                                        |
| -------- | --------------------------------------------------------------------------- | ------------ | ------ | ------------------------------------------------------------ |
| 1        | fix: remove dead `authAccessToken` localStorage from AuthContext            | CRIT-1       | 30 min | `AuthContext.tsx`                                            |
| 2        | fix: correct stale `x-salon-id` error message in `trpc.ts`                  | CRIT-3       | 5 min  | `trpc.ts:31`                                                 |
| 3        | fix: add `enabled: !authLoading` guard to all settings `useQuery` hooks     | CRIT-2       | 2 hrs  | All `use*Controller.ts` files                                |
| 4        | audit: verify `bank_accounts` and `salon_users` queries filter by `salonId` | HIGH-1/2     | 1 hr   | `booking-app.repository.ts`, `pengguna.repository.ts`        |
| 5        | fix: move `authAccessToken` removal to `logout()` only                      | HIGH-4       | 15 min | `AuthContext.tsx`                                            |
| 6        | feat: replace customer app mock data before enabling Preview                | HIGH-3       | 3+ hrs | `StepStylist.tsx`, `StepContact.tsx`, `booking.constants.ts` |
| 7        | chore: remove all `[DEBUG]` console.log before GA                           | Low          | 30 min | `AuthContext.tsx`, `trpc-provider.tsx`                       |
