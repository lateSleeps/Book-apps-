# Pengguna & Akses — Foundation Cleanup Report

**Commit:** `4e03985`
**Date:** 2026-06-11
**Branch:** `feat/settings-v2-brand-services`

---

## Task 1 — Add `staffId` to User type

**File:** `apps/owner/src/features/auth/types/auth.types.ts`

Added `staffId?: string | null` to `User` interface.

- Null for OWNER accounts that have no corresponding StaffMember record.
- Non-null when an account maps to a specific staff member (future FK join).

---

## Task 2 — Separate StaffRole from AccessRole

### auth.types.ts

**Before:** `UserRole = 'OWNER' | 'MANAGER' | 'STYLIST' | 'STAFF'`

**After:**

```typescript
export type AccessRole = "OWNER" | "ADMIN" | "STAFF";
export type UserRole = "OWNER" | "MANAGER" | "STYLIST" | "STAFF"; // kept for type compat
```

- `User.role` now typed as `AccessRole`
- `RolePermissionMap = Record<AccessRole, Permission[]>`

### team.types.ts

**Before:** `StaffRole = 'OWNER' | 'STYLIST' | 'COLORIST' | 'NAIL_ARTIST' | 'THERAPIST' | 'RECEPTIONIST'`

**After:** `StaffRole = 'MANAGER' | 'STYLIST' | 'COLORIST' | 'NAIL_ARTIST' | 'THERAPIST' | 'RECEPTIONIST'`

- Removed `OWNER` (access tier, not a job function)
- Added `MANAGER` (salon day-to-day manager role)

### role-permissions.ts

Permission map updated from 4 keys (OWNER/MANAGER/STYLIST/STAFF) to 3 keys (OWNER/ADMIN/STAFF):

| Old key | New key             | Permission set                           |
| ------- | ------------------- | ---------------------------------------- |
| OWNER   | OWNER               | All permissions (unchanged)              |
| MANAGER | ADMIN               | All except MANAGE_USERS/MANAGE_ROLES     |
| STYLIST | (merged into STAFF) | —                                        |
| STAFF   | STAFF               | Own bookings + schedule + client history |

### ROLE_LABEL / ROLE_META updates

All four team section files updated to reflect the new StaffRole set:

- `StaffDirectorySection.tsx` — ROLE_META and ROLE_OPTIONS
- `WeeklyScheduleSection.tsx` — ROLE_LABEL
- `ServiceAssignmentSection.tsx` — ROLE_LABEL
- `LeaveSection.tsx` — ROLE_LABEL

---

## Task 3 — Extract AvatarBubble + StatusBadge

**New files:**

- `apps/owner/src/shared/components/ui/AvatarBubble.tsx`
- `apps/owner/src/shared/components/ui/StatusBadge.tsx`

**Updated (removed local definitions, added shared imports):**

- `WeeklyScheduleSection.tsx`
- `ServiceAssignmentSection.tsx`
- `LeaveSection.tsx`

`AvatarBubble` supports `size='sm'|'md'` (canonical API from ServiceAssignmentSection).
`StatusBadge` shows Aktif/Nonaktif with `bg-st-in-progress-bg`/`bg-bg-control` tokens.

Both are the only legitimate users of `style={{ background: bg }}` (runtime avatar palette).

---

## Task 4 — Replace hardcoded hex with design system tokens

**File:** `apps/owner/src/features/auth/utils/role-permissions.ts`

Added `getRoleTokenClasses(role: string): string` — returns combined `bg-* text-*` Tailwind classes:

```typescript
OWNER → 'bg-st-confirmed-bg text-st-confirmed'
ADMIN → 'bg-st-upcoming-bg text-st-upcoming'
STAFF → 'bg-bg-control text-tx-subtle'
```

`getRoleColor()` and `getRoleBackgroundColor()` kept but marked `@deprecated` — still needed by
`DashboardSidebar.tsx` (pre-existing inline-style component, out of scope for this task).

**`RoleBadge.tsx`** fully migrated to `getRoleTokenClasses()` — no more inline `style={{ color, backgroundColor }}`.

---

## Task 5 — Extend User type with account lifecycle fields

**File:** `apps/owner/src/features/auth/types/auth.types.ts`

New fields on `User`:

```typescript
status: UserAccountStatus;   // 'ACTIVE' | 'INVITED' | 'INACTIVE' | 'REVOKED'
invitedAt?: string | null;   // ISO datetime
lastLoginAt?: string | null; // ISO datetime
avatarUrl?: string | null;   // replaces emoji avatar?
staffId?: string | null;     // FK to StaffMember.id
```

`avatar?: string` kept with `@deprecated` comment (backward compat).
`isActive: boolean` kept with `@deprecated` comment — will derive from `status === 'ACTIVE'` post Supabase Auth.

**Mock data updated (`auth-mock.ts`):**

- `'MANAGER'` user → `role: 'ADMIN'`
- `'STYLIST'` user → `role: 'STAFF'`
- All users now have `status`, `invitedAt`, `lastLoginAt`, `avatarUrl`, `staffId`

---

## TypeScript check

```
pnpm --filter owner exec tsc --noEmit
# 0 errors
```

---

## What this enables

The foundation is now ready for Pengguna & Akses UI implementation:

- `User.status` drives the account lifecycle tabs (Aktif / Diundang / Nonaktif)
- `AccessRole` (OWNER/ADMIN/STAFF) maps cleanly to 3-tier permission selector
- `staffId` enables the staff-account join for the linked staff profile card
- `AvatarBubble` + `StatusBadge` are available from `shared/components/ui` for the new page
- `getRoleTokenClasses()` produces badge classes without magic hex
