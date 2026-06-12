# Auth Hydration Gate — Implementation Report

> Date: 2026-06-12

---

## Changes Made

### 1. New file — `SettingsContentGate.tsx`

`apps/owner/src/features/dashboard/components/settings/layout/SettingsContentGate.tsx`

Client component. Reads `isLoading` from `useAuth()`. Renders a 3-card shimmer skeleton while auth hydration is in progress. Renders children once `isLoading === false`.

The skeleton uses `animate-pulse rounded-r16 border border-bd-card bg-bg-card shadow-card` — the same visual tokens as real settings cards — so the page maintains its layout rhythm while loading.

### 2. Modified — `settings/layout.tsx`

`apps/owner/src/app/dashboard/settings/layout.tsx`

Wraps `{children}` with `<SettingsContentGate>`. The layout remains a Server Component. The gate is a leaf import; no RSC/Client boundary issues.

Before:

```tsx
<div className="px-s16 py-s16 md:px-s24 md:py-s24">{children}</div>
```

After:

```tsx
<div className="px-s16 py-s16 md:px-s24 md:py-s24">
  <SettingsContentGate>{children}</SettingsContentGate>
</div>
```

### 3. Modified — `trpc.ts` (error message only)

`apps/owner/src/server/trpc/trpc.ts:31`

Before:

```
'Missing salon context. Ensure x-salon-id header is set.'
```

After:

```
'Missing salon context. Authorization token missing or invalid.'
```

Behavior unchanged. Stale reference to `x-salon-id` removed.

---

## Verification

### TypeScript

`npx tsc --noEmit` in `apps/owner` — 0 errors, 0 output.

### Fix logic

The race condition was:

```
mount → useQuery fires → getAuthHeaders() → null → server: no token → UNAUTHORIZED
```

With the gate:

```
mount → isLoading=true → skeleton shown → queries NOT fired
      → getSession() resolves → authAccessToken written to localStorage
      → isLoading=false → children mount → useQuery fires → token present → OK
```

Controllers are untouched. The gate stops them from mounting until the token is ready.

---

## Verification Checklist (manual)

- [ ] Fresh page refresh on `/dashboard/settings/brand` — skeleton shown briefly, then content loads
- [ ] Fresh page refresh on `/dashboard/settings/operasional` — no UNAUTHORIZED error in console
- [ ] Fresh page refresh on `/dashboard/settings/booking` — no UNAUTHORIZED error
- [ ] Network tab: tRPC requests only appear after auth resolves (no early UNAUTHORIZED 401)
- [ ] After login, navigating to settings — no flash of unauthorized state
- [ ] `isLoading` skeleton is visually consistent with Settings V2 card rhythm

---

## Why one gate beats N enabled flags

The alternative — adding `enabled: !isLoading` to every `useQuery` call across 7 controllers — would require touching ~14 call sites, testing each, and trusting that future controllers remember to add the flag. The layout gate is a single enforcement point. Any controller added in the future is automatically protected without any additional code.

---

## Files changed

| File                                                                                   | Change                     |
| -------------------------------------------------------------------------------------- | -------------------------- |
| `apps/owner/src/features/dashboard/components/settings/layout/SettingsContentGate.tsx` | Created                    |
| `apps/owner/src/app/dashboard/settings/layout.tsx`                                     | Wrap children with gate    |
| `apps/owner/src/server/trpc/trpc.ts`                                                   | Update stale error message |
