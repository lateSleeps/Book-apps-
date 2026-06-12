# Sprint 4 — Users & Access Persistence Report

**Date:** 2026-06-12
**Status:** Complete
**tsc --noEmit:** 0 errors

---

## Files Created

| File                                                           | Purpose                                                |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| `packages/database/src/migrations/0007_create_salon_users.sql` | `salon_users` table + indexes                          |
| `src/server/settings/repositories/pengguna.repository.ts`      | DB layer — 7 functions                                 |
| `src/server/settings/services/pengguna.service.ts`             | Business logic — validation, Supabase Auth admin calls |
| `src/server/trpc/routers/settings/pengguna.ts`                 | tRPC router — 1 query + 7 mutations                    |
| `src/lib/supabase-browser.ts`                                  | Browser-side Supabase client (anon key)                |
| `src/app/api/auth/me/route.ts`                                 | Next.js API route — JWT verify + user hydration        |

## Files Modified

| File                                                             | Change                                                                        |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/server/trpc/routers/settings/_settings.ts`                  | Registered `pengguna: penggunaRouter`                                         |
| `src/features/dashboard/hooks/settings/usePenggunaController.ts` | Full rewrite — mock state removed, tRPC-backed, AuthContext for currentUserId |
| `src/features/auth/context/AuthContext.tsx`                      | Mock replaced with `supabase.auth.getSession` + `onAuthStateChange`           |
| `src/lib/trpc-provider.tsx`                                      | Phase 4 comment added; behavior unchanged (still reads localStorage)          |

---

## Migration Requirements

### `0007_create_salon_users.sql`

```sql
CREATE TABLE IF NOT EXISTS salon_users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id       UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  auth_user_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  email          TEXT        NOT NULL,
  role           TEXT        NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'STAFF')),
  status         TEXT        NOT NULL DEFAULT 'INVITED'
                             CHECK (status IN ('ACTIVE', 'INVITED', 'INACTIVE', 'REVOKED')),
  staff_id       UUID        REFERENCES staff_members(id) ON DELETE SET NULL,
  join_date      DATE,
  invited_at     TIMESTAMPTZ,
  last_login_at  TIMESTAMPTZ,
  avatar_url     TEXT,
  phone          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salon_id, auth_user_id),
  UNIQUE(salon_id, email)
);
CREATE INDEX IF NOT EXISTS salon_users_salon_id_idx     ON salon_users (salon_id);
CREATE INDEX IF NOT EXISTS salon_users_auth_user_id_idx ON salon_users (auth_user_id);
```

**Key constraints:**

- `UNIQUE(salon_id, email)` — prevents duplicate invitations per salon
- `UNIQUE(salon_id, auth_user_id)` — prevents adding the same auth user twice
- `ON DELETE CASCADE` from `salons` — removes all users when salon is deleted
- `ON DELETE CASCADE` from `auth.users` — removes salon_user when auth account is deleted
- `staff_id` FK is `ON DELETE SET NULL` — staff record can be deleted without removing login access

---

## Queries Added

### `trpc.settings.pengguna.getUsers`

- Type: `protectedProcedure.query`
- Output: `User[]`
- Reads: `salon_users WHERE salon_id = ctx.salonId ORDER BY created_at ASC`
- `permissions[]` derived from `ROLE_PERMISSIONS_MAP[role]` in repository layer (not stored in DB)

---

## Mutations Added

| Procedure        | Input                    | Output     | DB operation                                        |
| ---------------- | ------------------------ | ---------- | --------------------------------------------------- |
| `inviteUser`     | `{ name, email, role }`  | `ok(User)` | `auth.admin.inviteUserByEmail` + INSERT salon_users |
| `updateRole`     | `{ userId: UUID, role }` | `ok()`     | UPDATE salon_users SET role                         |
| `deactivateUser` | `{ userId: UUID }`       | `ok()`     | UPDATE salon_users SET status = 'INACTIVE'          |
| `reactivateUser` | `{ userId: UUID }`       | `ok()`     | UPDATE salon_users SET status = 'ACTIVE'            |
| `revokeUser`     | `{ userId: UUID }`       | `ok()`     | UPDATE salon_users SET status = 'REVOKED'           |
| `resendInvite`   | `{ userId: UUID }`       | `ok()`     | `auth.admin.inviteUserByEmail` (resend)             |
| `cancelInvite`   | `{ userId: UUID }`       | `ok()`     | DELETE FROM salon_users WHERE status = 'INVITED'    |

---

## Auth Changes

### Before (mock)

```
AuthContext.tsx
  initialUser = DEFAULT_CURRENT_USER (hardcoded mock)
  useEffect: reads localStorage, sets state from stored JSON
  logout: sets currentUser = null
  switchUser: selects from mock array
  loading: false (hardcoded)
```

### After (Supabase Auth)

```
AuthContext.tsx
  loading: true on mount; false after getSession() resolves
  useEffect:
    supabaseBrowser.auth.getSession()
      -> if session: fetch('/api/auth/me', { Authorization: Bearer <token> })
         -> db.auth.getUser(token) server-side (verifies JWT)
         -> SELECT salon_users WHERE auth_user_id = user.id AND status IN ('ACTIVE', 'INVITED')
         -> returns User object
      -> setCurrentUser(user) + localStorage.setItem
    onAuthStateChange subscription
      -> session present: re-hydrate
      -> session null: setCurrentUser(null) + localStorage.removeItem
  logout: supabaseBrowser.auth.signOut() + setCurrentUser(null)
  switchUser: no-op (mock stub removed)
```

### `/api/auth/me` route

- Reads `Authorization: Bearer <token>` header
- Calls `db.auth.getUser(token)` using service role key — verifies JWT server-side
- Reads `salon_users` row by `auth_user_id`
- Derives `permissions[]` from `ROLE_PERMISSIONS_MAP[role]` — not stored in DB
- Side-effect: updates `last_login_at` and sets `status = 'ACTIVE'` (non-blocking fire-and-forget)
- Returns `User` object compatible with existing `AuthContextType`

### `supabase-browser.ts`

Separate browser client using `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Used only in `AuthContext` for session management. All DB queries continue to go through tRPC (server-side, service role key).

### TRPCProvider unchanged

`getAuthHeaders()` still reads `salonId` and `userId` from `localStorage`. Now populated by the real auth flow:

1. `onAuthStateChange` fires with real session
2. `/api/auth/me` returns real `User` with real `salonId`
3. `setCurrentUser(user)` writes to localStorage
4. Next tRPC request picks up the real `x-salon-id` header

---

## Controller Contract Compliance

| Requirement                                      | Implemented                                      |
| ------------------------------------------------ | ------------------------------------------------ |
| No `BaseSettingsController`                      | Yes — flat interface                             |
| No mock state / `useState` for users             | Yes — `trpc.settings.pengguna.getUsers.useQuery` |
| `currentUserId` from `AuthContext`               | Yes — `auth?.currentUser?.id ?? ''`              |
| `staleTime: 30_000`                              | Yes                                              |
| `placeholderData: []`                            | Yes                                              |
| All mutations invalidate `getUsers`              | Yes — `onSuccess: invalidate`                    |
| No optimistic updates                            | Yes                                              |
| `useRegisterSettingsActions({ isDirty: false })` | Yes — already in `PenggunaPageClient.tsx`        |

---

## Mutation Policy Compliance

| Action               | Required policy                                    | Implemented |
| -------------------- | -------------------------------------------------- | ----------- |
| `inviteUser`         | Immediate — sheet submission                       | Yes         |
| `updateRole`         | Immediate — sheet save, ConfirmDialog on downgrade | Yes         |
| `deactivateUser`     | Immediate — SettingsDangerZone confirm             | Yes         |
| `reactivateUser`     | Immediate — SettingsDangerZone confirm             | Yes         |
| `revokeUser`         | Immediate — SettingsDangerZone confirm             | Yes         |
| `resendInvite`       | Immediate — row action, no dialog                  | Yes         |
| `cancelInvite`       | Immediate — ConfirmDialog                          | Yes         |
| No global batch save | Verified                                           | Yes         |

---

## End-to-End Flow

### Page load (authenticated user)

```
Browser loads /dashboard/settings/pengguna
  -> AuthProvider mounts
     -> supabaseBrowser.auth.getSession()
        -> session found (Supabase cookie)
        -> fetch('/api/auth/me', { Authorization: Bearer <token> })
           -> db.auth.getUser(token)  [server, service role]
           -> SELECT salon_users WHERE auth_user_id = ...
           <- User{ id, name, email, role, salonId, ... }
        -> setCurrentUser(user) + localStorage.setItem
        -> setLoading(false)
  -> TRPCProvider: next request sends x-salon-id = user.salonId
  -> usePenggunaController()
     -> trpc.settings.pengguna.getUsers.useQuery()
        -> SELECT salon_users WHERE salon_id = ctx.salonId
        <- User[]
  -> PenggunaPageClient renders with real user list
```

### Invite user

```
Owner fills invite sheet -> clicks "Kirim Undangan"
  -> ctrl.inviteUser({ name, email, role })
     -> trpc.settings.pengguna.inviteUser
        -> penggunaService.inviteUser(salonId, input)
           -> db.auth.admin.inviteUserByEmail(email)  [service role]
              <- { user: { id: authUserId } }
           -> penggunaRepo.createInvite(salonId, { authUserId, name, email, role })
              -> INSERT salon_users (status = 'INVITED', invited_at = now)
              <- User
        <- ok(User)
     -> onSuccess: invalidate getUsers
     -> list refetches; new user appears with [Diundang] badge
```

### Invited user accepts

```
User clicks invite email link -> Supabase Auth sets session
  -> AuthContext.onAuthStateChange fires
     -> fetch('/api/auth/me', { Authorization: Bearer <token> })
        -> SELECT salon_users WHERE auth_user_id = ...
           (status IN ('ACTIVE', 'INVITED') — catches newly-invited user)
        -> UPDATE last_login_at, SET status = 'ACTIVE' (fire-and-forget)
        <- User{ status: 'ACTIVE', ... }
     -> setCurrentUser(user) -> user can now access dashboard
```

### Deactivate user

```
Owner opens edit sheet -> clicks "Nonaktifkan Akun" in danger zone
  -> SettingsDangerZone confirm dialog shown
  -> Owner confirms
  -> ctrl.deactivateUser(user.id)
     -> trpc.settings.pengguna.deactivateUser({ userId })
        -> penggunaService.deactivateUser(salonId, userId, actorId)
           -> validates actorId !== userId (no self-deactivation)
           -> penggunaRepo.setStatus(salonId, userId, 'INACTIVE')
              -> UPDATE salon_users SET status = 'INACTIVE'
        <- ok()
     -> onSuccess: invalidate getUsers
     -> user row updates to [Nonaktif] badge
```

---

## Known Limitations

1. **`inviteUser` is not transactional.** `auth.admin.inviteUserByEmail` succeeds then `createInvite` INSERT may fail. Result: Supabase auth user exists with no `salon_users` row. They cannot access the dashboard (no row found in `/api/auth/me`) but their email is taken in `auth.users`. Recovery: delete the orphaned auth user manually or re-invite with the same email (Supabase resends the invite to the existing auth user).

2. **`cancelInvite` does not delete the auth user.** Deleting the `salon_users` row removes dashboard access but leaves an orphaned `auth.users` record. The auth user can no longer log in usefully (no salon_users row), but the email remains registered in Supabase Auth. Full cleanup would require `db.auth.admin.deleteUser(auth_user_id)` — deferred as it requires fetching the auth_user_id first and is two sequential operations.

3. **Single salon per auth user.** `/api/auth/me` returns the first active `salon_users` row for the auth user. If the same email is invited to multiple salons, only the first match is returned. Multi-salon support is a post-Sprint 4 concern.

4. **`last_login_at` update is fire-and-forget.** The UPDATE in `/api/auth/me` is not awaited. If it fails, `last_login_at` remains stale. Non-critical.

5. **TRPCProvider salonId timing.** On first page load, tRPC queries may fire before `AuthContext` has written to localStorage (async session fetch). The `protectedProcedure` will throw UNAUTHORIZED for those requests. React Query will retry on error, and by the time of the retry, localStorage has the correct value. No data loss; brief delay on cold load.

6. **`switchUser` is now a no-op.** Dev convenience for switching between mock users is removed. Use Supabase Auth login/logout to change users.

7. **RLS not implemented.** All `salon_users` reads use the service role key (server-side tRPC + `/api/auth/me`). Row-level security is deferred to the security sprint.

---

## Typecheck Result

```
npx tsc --noEmit  ->  0 errors
```
