# Sprint 4 — Users & Access Readiness Review

**Date:** 2026-06-12
**Reviewed against:** `PENGGUNA_AKSES_AUDIT.md`, `PENGGUNA_AKSES_WIREFRAME.md`, `PENGGUNA_AKSES_COMPONENT_REVIEW.md`, `SETTINGS_PERSISTENCE_MILESTONE_REVIEW.md`
**Goal:** Determine exact scope before Sprint 4 begins.

---

## Overall Verdict

| Area                                  | Classification        |
| ------------------------------------- | --------------------- |
| 1. Existing auth architecture         | NEEDS AUTH CHANGE     |
| 2. Existing role model                | NEEDS CONTRACT CHANGE |
| 3. Existing invitation flow           | NEEDS AUTH CHANGE     |
| 4. Existing permission system         | READY NOW             |
| 5. Existing Supabase Auth integration | NEEDS AUTH CHANGE     |
| 6. Required tables                    | NEEDS AUTH CHANGE     |
| 7. Required migrations                | NEEDS AUTH CHANGE     |
| 8. Controller contract                | NEEDS CONTRACT CHANGE |
| 9. Mutation policy                    | READY NOW             |

**Sprint 4 cannot start without:** Supabase Auth integration (Areas 1, 3, 5, 6, 7) and `usePenggunaController.ts` creation (Area 8).

**What is already done:** `PenggunaPageClient.tsx` and `PermissionSummaryCard.tsx` are fully implemented. UI, filtering, search, segmented control, invite sheet, edit sheet, danger zone actions — all built. Controller interface is defined in the import; only the hook itself is missing.

---

## 1. Existing Auth Architecture

**Classification: NEEDS AUTH CHANGE**

### Current state

Auth is implemented entirely with mock data. No Supabase Auth calls are made anywhere.

```
features/auth/context/AuthContext.tsx
  -> reads / writes localStorage
  -> DEFAULT_CURRENT_USER from auth-mock.ts
  -> switchUser() selects from mock array (dev-only convenience)
  -> loading: false hardcoded (never truly async)
```

The `AuthContext` exposes:

- `currentUser: User | null` — mock User object
- `salonId: string` — from mock user
- `switchUser(userId: string)` — in-memory only; not a real sign-in

### What must change

When Supabase Auth is connected:

1. `AuthContext` must call `supabase.auth.getSession()` on mount and listen to `supabase.auth.onAuthStateChange`
2. `currentUser` must be hydrated from the `salon_users` table (see Area 6) using `session.user.id`
3. `salonId` must come from `salon_users.salon_id`, not mock data
4. `loading` must reflect the async session fetch; `null` currentUser during loading must not throw
5. `switchUser` must be removed or guarded to dev-only

### What does NOT change

- `User` type, `AccessRole`, `UserAccountStatus`, `Permission`, `ROLE_PERMISSIONS_MAP` — all correct; no changes required
- `AuthContext` shape (`currentUser`, `salonId`) — same interface; only implementation changes

---

## 2. Existing Role Model

**Classification: NEEDS CONTRACT CHANGE**

### Current state

`AccessRole` in code has **4 tiers**:

```typescript
type AccessRole = "OWNER" | "ADMIN" | "MANAGER" | "STAFF";
```

`ROLE_PERMISSIONS_MAP` maps all 4. `PermissionSummaryCard` has capability details for all 4. `PenggunaPageClient` sorts by 4 roles and renders badge classes for all 4.

### Discrepancy with wireframes

`PENGGUNA_AKSES_WIREFRAME.md` describes the invite role selector as showing **ADMIN | STAF** (2 invitable roles). The code has:

```typescript
// PenggunaPageClient.tsx — invite sheet select
<option value="ADMIN">Admin</option>
<option value="MANAGER">Manager</option>
<option value="STAFF">Staf</option>
```

**MANAGER is present in the code** but absent from all wireframe documentation. This is an intentional extension beyond the wireframes (the audit and component review files do not mention MANAGER either).

### Required clarification before Sprint 4

**MANAGER tier must be officially acknowledged.** The readiness doc records it as present and correct. `InvitableRole` is already defined as:

```typescript
type InvitableRole = "ADMIN" | "MANAGER" | "STAFF";
```

OWNER is correctly excluded from the invite sheet (OWNER is a singleton per salon; cannot be invited).

### What must change

- `PENGGUNA_AKSES_WIREFRAME.md` should be updated to add MANAGER to the invite role documentation (non-blocking; cosmetic)
- No code changes required for the role model — it is already correct

---

## 3. Existing Invitation Flow

**Classification: NEEDS AUTH CHANGE**

### Current state

`PenggunaPageClient` calls `ctrl.inviteUser({ name, email, role })`. This controller method does not yet exist. When it does, the real implementation must:

1. Create a Supabase Auth user invite via `supabase.auth.admin.inviteUserByEmail(email, { data: { name, role } })`
2. Insert a row into `salon_users` with `status = 'INVITED'`
3. The invited user receives an email; clicking it triggers `supabase.auth.onAuthStateChange` with event `USER_UPDATED` which updates the row to `status = 'ACTIVE'`

### What is already done

- `UserAccountStatus.INVITED` type is defined
- `STATUS_LABEL.INVITED` and `STATUS_BADGE_CLASS.INVITED` are implemented in `PenggunaPageClient`
- Invite sheet UI (`InviteSheetBody`) is fully built including name, email, role fields and `PermissionSummaryCard` preview
- `canSaveInvite()` validates name length + email format before enabling the button
- Duplicate email check against `ctrl.users` list is already implemented

### What is missing

- Supabase Auth admin invite API call (requires service role key or edge function; not a client-side call)
- `salon_users` DB table (see Area 6)
- `usePenggunaController.inviteUser` implementation

---

## 4. Existing Permission System

**Classification: READY NOW**

### Current state

All permission infrastructure is complete and correct.

| Asset                                                     | Status    |
| --------------------------------------------------------- | --------- |
| `Permission` enum — 26 values                             | READY NOW |
| `ROLE_PERMISSIONS_MAP` — maps all 4 roles                 | READY NOW |
| `getRoleDisplayName()`                                    | READY NOW |
| `getRoleTokenClasses()`                                   | READY NOW |
| `PermissionSummaryCard` — 5 capability groups × 4 roles   | READY NOW |
| `AvatarBubble` component (extracted in foundation sprint) | READY NOW |
| `StatusBadge` component (extracted in foundation sprint)  | READY NOW |

`PermissionSummaryCard` is self-contained: it derives all display from the `role` prop and the static `CAPABILITY_GROUPS` map. No backend dependency. No controller dependency.

### Deprecated items (non-blocking)

`getRoleColor()` and `getRoleBackgroundColor()` are deprecated but kept for `DashboardSidebar`. These return hardcoded hex values. They should be removed after `DashboardSidebar` is updated to use `getRoleTokenClasses()`. Not blocking Sprint 4.

---

## 5. Existing Supabase Auth Integration

**Classification: NEEDS AUTH CHANGE**

### Current state

Zero Supabase Auth calls exist anywhere in `apps/owner`. The project uses Supabase JS v2 (`packages/database/src/client.ts` exports the `supabase` singleton), but only for database queries via `db.from(...)`. Auth methods (`supabase.auth.*`) are never called.

### What must be added

```
supabase.auth.getSession()           — on AuthContext mount
supabase.auth.onAuthStateChange()    — subscribe to sign-in / sign-out events
supabase.auth.signInWithPassword()   — login page (currently mock)
supabase.auth.signOut()              — logout
supabase.auth.admin.inviteUserByEmail() — invite (server-side only; needs Edge Function or API route)
```

### Scope boundary for Sprint 4

Sprint 4 should implement:

1. `getSession` / `onAuthStateChange` in `AuthContext` to replace mock
2. `salon_users` table read in `AuthContext` to populate `currentUser`
3. `inviteUser` mutation via Edge Function (or tRPC mutation calling Supabase Admin SDK)
4. `updateRole`, `deactivateUser`, `reactivateUser`, `revokeUser` mutations via `salon_users` UPDATE

Sprint 4 should **not** implement:

- Login page (redirects / OAuth / magic link) — out of scope unless explicitly requested
- Row-level security policies — deferred to security sprint

---

## 6. Required Tables

**Classification: NEEDS AUTH CHANGE**

### Current state

No user-related tables exist. Current migration sequence ends at `0006_create_service_bundles.sql`.

### Required table: `salon_users`

This is the primary table for the Users & Access domain. It bridges Supabase Auth users to a salon's access control.

```sql
CREATE TABLE IF NOT EXISTS salon_users (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id     UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  auth_user_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  role         TEXT        NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'STAFF')),
  status       TEXT        NOT NULL DEFAULT 'INVITED'
                           CHECK (status IN ('ACTIVE', 'INVITED', 'INACTIVE', 'REVOKED')),
  staff_id     UUID        REFERENCES staff_members(id) ON DELETE SET NULL,
  join_date    DATE,
  invited_at   TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  avatar_url   TEXT,
  phone        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salon_id, auth_user_id),
  UNIQUE(salon_id, email)
);
CREATE INDEX IF NOT EXISTS salon_users_salon_id_idx ON salon_users (salon_id);
CREATE INDEX IF NOT EXISTS salon_users_auth_user_id_idx ON salon_users (auth_user_id);
```

### Key design decisions

- `auth_user_id` links to Supabase Auth's `auth.users` table — this is the identity source of truth
- `UNIQUE(salon_id, email)` prevents duplicate invitations to the same email per salon
- `UNIQUE(salon_id, auth_user_id)` prevents a user from being added to the same salon twice
- `staff_id` is nullable — not every salon user maps to a staff member (e.g. OWNER/ADMIN may not perform services)
- `last_login_at` is updated via a Supabase trigger or `onAuthStateChange` handler in `AuthContext`

### Required table: `salon_user_permissions` (optional / deferred)

Currently permissions are derived from `ROLE_PERMISSIONS_MAP` in code. No per-user permission overrides exist. A `salon_user_permissions` table (storing individual `Permission` overrides) is **not required for Sprint 4**. The role-based derivation in `ROLE_PERMISSIONS_MAP` is sufficient.

---

## 7. Required Migrations

**Classification: NEEDS AUTH CHANGE**

### Migration plan

Next number in sequence: **`0007`**

| File                          | Content                                    |
| ----------------------------- | ------------------------------------------ |
| `0007_create_salon_users.sql` | `salon_users` table as specified in Area 6 |

One migration file covers all user access requirements for Sprint 4.

### No additional join tables required

- Permissions are code-derived from role, not stored per-user
- Role is a single TEXT column (no `salon_user_roles` join table needed)
- Staff linkage is a nullable FK on `salon_users.staff_id` (no separate mapping table)

---

## 8. Controller Contract

**Classification: NEEDS CONTRACT CHANGE**

### Current state

`usePenggunaController.ts` **does not exist**. `PenggunaPageClient.tsx` imports it and calls it:

```typescript
import type {
  InvitableRole,
  PenggunaController,
} from "@/features/dashboard/hooks/settings/usePenggunaController";
import { usePenggunaController } from "@/features/dashboard/hooks/settings/usePenggunaController";
```

The file must be created before the page can compile.

### Required contract — derived from `PenggunaPageClient.tsx`

```typescript
export type InvitableRole = "ADMIN" | "MANAGER" | "STAFF";

export interface PenggunaController {
  // Read
  users: User[]; // all salon users; sorted in UI
  isLoading: boolean;
  currentUserId: string; // guards "Kamu" label + disables self-edit

  // Mutations
  inviteUser: (draft: {
    name: string;
    email: string;
    role: InvitableRole;
  }) => void;
  updateRole: (userId: string, role: InvitableRole) => void;
  deactivateUser: (userId: string) => void;
  reactivateUser: (userId: string) => void;
  revokeUser: (userId: string) => void;
  resendInvite: (userId: string) => void;
  cancelInvite: (userId: string) => void;
}
```

### Controller query strategy

Single query: `trpc.settings.pengguna.getUsers` — returns all `salon_users` rows for the current salon.

- `staleTime: 30_000`
- `placeholderData: []`
- Invalidated by all mutations

No secondary lazy query needed (unlike Team's leave query). All user data fits in a single list read per salon.

### Controller mutation policy

All mutations are **Immediate Persistence** (no local draft, no explicit save button):

| Mutation         | Policy                                             |
| ---------------- | -------------------------------------------------- |
| `inviteUser`     | Immediate — sheet submission                       |
| `updateRole`     | Immediate — sheet save, ConfirmDialog on downgrade |
| `deactivateUser` | Immediate — SettingsDangerZone confirm             |
| `reactivateUser` | Immediate — SettingsDangerZone confirm             |
| `revokeUser`     | Immediate — SettingsDangerZone confirm             |
| `resendInvite`   | Immediate — row action menu (no dialog)            |
| `cancelInvite`   | Immediate — ConfirmDialog in row action menu       |

`useRegisterSettingsActions` must be called with `isDirty: false` to permanently hide the global action bar. This matches the pattern used in Products & Packages.

### `SettingsListCard` extension required

`PENGGUNA_AKSES_COMPONENT_REVIEW.md` identifies that `SettingsListCard` needs a `leadingSlot?: ReactNode` prop to accommodate `AvatarBubble` in the user list rows. However, `PenggunaPageClient.tsx` does **not use `SettingsListCard`** — it uses a custom table layout with `GRID_STYLE`. The `leadingSlot` extension is **not blocking Sprint 4**. Can be added if `SettingsListCard` is refactored later.

---

## 9. Mutation Policy

**Classification: READY NOW**

The mutation policy for Users & Access is straightforward and already established by prior sprints.

| Rule                                   | Status                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| No global batch save                   | READY NOW — `useRegisterSettingsActions({ isDirty: false })` pattern established |
| SideSheet submission fires immediately | READY NOW — pattern used in all prior CRUD domains                               |
| ConfirmDialog on destructive actions   | READY NOW — `SettingsDangerZone` component already in `PenggunaPageClient`       |
| No optimistic updates                  | READY NOW — invalidate + refetch pattern                                         |
| `salonId` from `ctx` only              | READY NOW — all tRPC procedures use `protectedProcedure`; `ctx.salonId` enforced |
| `isSaving` tracks in-flight mutations  | READY NOW — controller exposes per-mutation loading states                       |

---

## Summary — What Sprint 4 Must Deliver

### Prerequisite (blocks compilation)

1. **Create `usePenggunaController.ts`** — even a mock-backed implementation unblocks the build. The page currently fails to compile because the import target is missing.

### Core Sprint 4 work

2. **Migration `0007_create_salon_users.sql`** — one file; spec in Area 6
3. **Repository `pengguna.repository.ts`** — 8 functions: `getUsers`, `createInvite`, `updateRole`, `deactivateUser`, `reactivateUser`, `revokeUser`, `resendInvite`, `cancelInvite`
4. **Service `pengguna.service.ts`** — validates role not OWNER for invites; validates caller is not revoking themselves
5. **Router `settings/pengguna.ts`** — 1 query + 7 mutations; all `protectedProcedure`
6. **Register router in `_settings.ts`** — add `pengguna: penggunaRouter`
7. **Replace mock in `AuthContext.tsx`** — connect `getSession` / `onAuthStateChange`; read `currentUser` from `salon_users` by `auth.user.id`

### What is already complete (no Sprint 4 work needed)

- `User` type, `AccessRole`, `UserAccountStatus` — complete
- `Permission` enum + `ROLE_PERMISSIONS_MAP` — complete
- `PenggunaPageClient.tsx` — fully implemented; only needs the controller hook to compile
- `PermissionSummaryCard.tsx` — complete; no dependencies on DB
- `AvatarBubble`, `StatusBadge` — extracted in foundation sprint
- Token-based badge classes — complete; no hex anywhere in Users domain
- Status filter, search, segmented control, invite sheet, edit sheet, danger zone — all built

### Migration sequence after Sprint 4

```
0001 — create_salons
0002 — create_services
0003 — create_bookings (or equivalent)
0004 — create_staff_tables        (Sprint 3.1)
0005 — create_add_on_products     (Sprint 3.2)
0006 — create_service_bundles     (Sprint 3.2)
0007 — create_salon_users         (Sprint 4)
```
