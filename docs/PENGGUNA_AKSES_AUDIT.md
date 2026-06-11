# Pengguna & Akses — UX + Architecture Audit

**Date:** 2026-06-11  
**Status:** Pre-implementation — read-only audit  
**Scope:** `/dashboard/settings/pengguna` and the entire `apps/owner/src/features/auth/` domain

---

## Scores

| Dimension    | Score | Rationale                                                                     |
| ------------ | ----- | ----------------------------------------------------------------------------- |
| UX           | 1/10  | Page is a blank stub. Zero implemented UI.                                    |
| Architecture | 4/10  | Solid permission enum + role map. Critical type conflicts and missing fields. |
| Scalability  | 3/10  | Hard-coded role matrix, no custom roles, no invitation flow, no audit trail.  |

---

## 1. Current State

```
app/dashboard/settings/pengguna/page.tsx
```

Renders a single `<p>` tag:

> "Domain belum diimplementasi — Phase 5.8."

No controller. No types file in the settings domain. No components.

The auth infrastructure **does exist** in `features/auth/`:

| File                         | Contains                                          |
| ---------------------------- | ------------------------------------------------- |
| `types/auth.types.ts`        | `User`, `UserRole`, `AuthContextType`             |
| `types/permissions.types.ts` | `Permission` enum (22 values), `DashboardSection` |
| `utils/role-permissions.ts`  | `ROLE_PERMISSIONS_MAP` per role + display utils   |
| `utils/permission.utils.ts`  | `hasPermission`, `canManage*` helpers             |
| `mocks/auth-mock.ts`         | 4 mock users (OWNER/MANAGER/STYLIST/STAFF)        |
| `context/AuthContext.tsx`    | React context for current session user            |

---

## 2. Critical Type Conflict — P0

There are **two separate `role` enumerations** on overlapping models with the same field name:

```typescript
// team.types.ts — StaffMember.role
type StaffRole =
  | "OWNER"
  | "STYLIST"
  | "COLORIST"
  | "NAIL_ARTIST"
  | "THERAPIST"
  | "RECEPTIONIST";
//               ^ job title / service specialization

// auth.types.ts — User.role
type UserRole = "OWNER" | "MANAGER" | "STYLIST" | "STAFF";
//              ^ dashboard access level
```

They share `OWNER` and `STYLIST` names but mean completely different things:

- `StaffRole.STYLIST` = a job title used for service routing
- `UserRole.STYLIST` = a permission tier (can view bookings + own schedule)

A staff member who is a `COLORIST` in the team domain has **no corresponding `UserRole`**. The mapping between the two is undefined.

### Staff ↔ User relationship: undefined

`StaffMember` has no `userId` field.  
`User` has no `staffId` field.

There is no formal join between a dashboard login account and a physical staff member record. Questions that cannot currently be answered:

- "Does Luna Sari (StaffMember) have a login account?"
- "Which staff member does this User correspond to?"
- "Should this user see only their own schedule, or all staff?"

---

## 3. Issues Ranked by Priority

### P0 — Blockers

| #   | Issue                                  | Location                         | Impact                                                                                                                                   |
| --- | -------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **StaffMember ↔ User: no join field** | `team.types.ts`, `auth.types.ts` | Cannot link login accounts to staff records. All per-staff permission scoping is impossible.                                             |
| 2   | **StaffRole vs UserRole collision**    | Same as above                    | Two enums with identical member names, different semantics. Will cause runtime confusion as soon as any component needs to display both. |
| 3   | **No User status field**               | `auth.types.ts`                  | Cannot distinguish ACTIVE / PENDING (invited, not yet logged in) / INACTIVE / REVOKED. Invitation flow is unimplementable.               |

### P1 — High

| #   | Issue                                          | Location                      | Impact                                                                                                                                    |
| --- | ---------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 4   | **Hardcoded hex colors in role utils**         | `role-permissions.ts:153-173` | `getRoleColor()` returns `'#2563eb'`. Violates design system. Cannot respond to dark mode.                                                |
| 5   | **`User.avatar` is an emoji string**           | `auth-mock.ts` (👑, 💼, ✨)   | Inconsistent with `StaffMember.avatarUrl` (URL \| null). The `avatarColor()` + `getInitials()` pattern from Team domain cannot be reused. |
| 6   | **No `invitedAt`, `lastLoginAt`, `createdAt`** | `auth.types.ts`               | Cannot show "Bergabung: 15 Jan 2023" or "Terakhir aktif: 3 hari lalu" in the user list.                                                   |
| 7   | **`MANAGE_ROLES` permission exists but no UI** | `permissions.types.ts:43`     | Owner can manage roles but no role editor is planned. Creates a dangling permission expectation. Needs explicit scope decision.           |

### P2 — Medium

| #   | Issue                                         | Location        | Impact                                                                                                                           |
| --- | --------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 8   | **Custom per-user permissions unenforceable** | `auth.types.ts` | `User.permissions` is a plain array — UI always overwrites it from ROLE_PERMISSIONS_MAP. Override at user level is not possible. |
| 9   | **Self-edit protection absent**               | N/A             | Any user with MANAGE_USERS can deactivate themselves. No guard.                                                                  |
| 10  | **No audit trail**                            | N/A             | No record of who changed whose permissions or when.                                                                              |

---

## 4. Information Architecture

### Current (planned in nav, not implemented)

```
Settings
  └── Tim & Operasional
        ├── Tim            /settings/tim        — StaffMember CRUD
        └── Pengguna & Akses /settings/pengguna  — [STUB]
```

### Mental Model Problem

Owners think in two separate concepts that the current architecture conflates:

| Concept     | Owner's question                 | Data model                             |
| ----------- | -------------------------------- | -------------------------------------- |
| **Staff**   | "Who works at my salon?"         | `StaffMember` — name, role, schedule   |
| **Account** | "Who can log into my dashboard?" | `User` — email, password, access level |

These are related but distinct. A staff member may have no login account (they only appear in bookings). A manager may have a login account but not be a listed staff member performing services.

The page label "Pengguna & Akses" correctly targets the second concept. The implementation must not blur the two.

### Proposed IA

```
Pengguna & Akses
  ├── Tab A: Akun Pengguna   — list of User records with role + status
  └── Tab B: Peran & Izin    — role permission matrix (read-only, for transparency)
```

Tab B is display-only at this phase. Editing roles is deferred until role customization is scoped.

---

## 5. User Mental Model

Owner's sequential questions when opening this page:

1. "Who has access to my dashboard?"
2. "What can each person do?"
3. "How do I invite a new person?"
4. "How do I remove someone's access?"

The page must answer question 1 within 3 seconds (scannable list).  
Questions 2-4 require secondary interaction (row action, side sheet, confirmation dialog).

---

## 6. Navigation Clarity

Current nav label: **"Pengguna & Akses"** with `UserGear` icon.

This is correct and unambiguous. No change needed.

Potential confusion point: "Tim" (staff) vs "Pengguna & Akses" (accounts). The two pages serve different mental models and should remain separate. Do not merge.

---

## 7. Role Management Flow

### Current state

4 roles defined in `ROLE_PERMISSIONS_MAP`:

| Role    | Indonesian | Permissions                                       |
| ------- | ---------- | ------------------------------------------------- |
| OWNER   | Pemilik    | All 22                                            |
| MANAGER | Manajer    | All except MANAGE_USERS, MANAGE_ROLES             |
| STYLIST | Stylist    | Bookings (own) + schedule (own) + view clients    |
| STAFF   | Staf       | View only: dashboard, bookings, schedule, clients |

### Gaps

- No `RECEPTIONIST` role (exists in StaffRole but not UserRole)
- No custom role creation
- `MANAGER` cannot invite users — architectural constraint, currently intentional

### Recommended scope for Phase 5.8

Role editing is out of scope. Tab B (Peran & Izin) shows a read-only matrix. This is sufficient for "what can each person do?" without needing custom role CRUD.

---

## 8. Permission Management Flow

### Current model

Permissions are assigned at role level. Individual overrides are not supported by the UI (even though `User.permissions` is an array in the type).

### Recommended approach for this phase

Keep role-based model. Show permission summary inside user row or side sheet. Do not expose individual permission toggles — too granular for a small salon owner.

---

## 9. Account Invitation Flow

No invitation infrastructure exists. No `InvitationStatus`, no pending user concept.

### Required additions to `User` type

```typescript
export type UserAccountStatus = "ACTIVE" | "PENDING" | "INACTIVE" | "REVOKED";

export interface User {
  // existing fields ...
  status: UserAccountStatus; // replaces/augments isActive
  staffId: string | null; // link to StaffMember.id (nullable)
  invitedAt: string | null; // ISO date — when invite was sent
  lastLoginAt: string | null; // ISO date — last session
}
```

### Invitation flow (recommended)

```
Owner clicks "Undang Pengguna"
  → Side sheet opens: name, email, role
  → On save: creates User with status = 'PENDING'
  → User appears in list with [Menunggu] badge
  → Owner can resend invite or revoke
  → On first login: status = 'ACTIVE'
```

For this phase (mock-only): skip the email send, create user as PENDING immediately.

---

## 10. Active / Inactive States

### `isActive: boolean` is insufficient

Four states are needed:

| Status   | Meaning                       | Badge             |
| -------- | ----------------------------- | ----------------- |
| ACTIVE   | Has logged in, can access     | [Aktif] green     |
| PENDING  | Invited but never logged in   | [Menunggu] yellow |
| INACTIVE | Manually deactivated by owner | [Nonaktif] gray   |
| REVOKED  | Access permanently removed    | [Dicabut] red     |

INACTIVE and REVOKED differ: INACTIVE can be re-enabled. REVOKED requires a new invite.

---

## 11. Design System Consistency

### Issues in auth utilities

```typescript
// role-permissions.ts — hardcoded hex, violates design system
getRoleColor("OWNER"); // returns '#2563eb' — WRONG
getRoleBackgroundColor(); // returns '#eff6ff' — WRONG
```

### Correct approach: token-based role badge

```typescript
const USER_ROLE_BADGE: Record<UserRole, string> = {
  OWNER: "bg-st-confirmed-bg text-st-confirmed",
  MANAGER: "bg-st-upcoming-bg text-st-upcoming",
  STYLIST: "bg-st-in-progress-bg text-st-in-progress",
  STAFF: "bg-bg-control text-tx-subtle",
};
```

### `User.avatar` must follow the same pattern as `StaffMember`

Replace emoji avatar with `avatarUrl: string | null` + initials fallback via `avatarColor()` + `getInitials()`.

---

## 12. Reusable Components from Team Domain

These sub-components are currently **private (file-local)** inside team section files. They should be extracted to `shared/` before implementing Pengguna & Akses — both domains need them.

| Component      | Currently in                                                                               | Should move to                          |
| -------------- | ------------------------------------------------------------------------------------------ | --------------------------------------- |
| `AvatarBubble` | `WeeklyScheduleSection.tsx`, `ServiceAssignmentSection.tsx`, `LeaveSection.tsx` (3 copies) | `shared/components/ui/AvatarBubble.tsx` |
| `StatusBadge`  | Same 3 files (3 copies)                                                                    | `shared/components/ui/StatusBadge.tsx`  |

Components already in `shared/` that are directly reusable:

- `SettingsListCard` — user rows in directory
- `SettingsEmptyState` — no users state
- `SettingsAddButton` — "Undang Pengguna"
- `SettingsSectionHeader` — tab headers
- `SettingsTabbedCard` — tab container (already used by Tim page)
- `EntityActionMenu` — per-row actions (Edit, Deactivate, Remove)
- `ConfirmDialog` / `ConfirmPending` — deactivate / revoke confirmations
- `SettingsSideSheet` — invite form + edit form
- `SettingsSelect` — role selector in invite form
- `SettingsInput` — name and email fields

---

## 13. Proposed Wireframe

### Page shell

```
Pengguna & Akses                               [+ Undang Pengguna]
Kelola akun pengguna dashboard dan izin akses per peran.

[ Akun Pengguna ]  [ Peran & Izin ]
```

---

### Tab A — Akun Pengguna

```
┌─────────────────────────────────────────────────────────────────────┐
│  [RK]  Rara Kusuma                [Pemilik]    [Aktif]              │
│        rara@rarabeauty.com                                    [⋮]  │
├─────────────────────────────────────────────────────────────────────┤
│  [RW]  Rina Wijaya                [Manajer]    [Aktif]              │
│        rina@rarabeauty.com                                    [⋮]  │
├─────────────────────────────────────────────────────────────────────┤
│  [LS]  Luna Sari                  [Stylist]    [Menunggu]           │
│        luna@rarabeauty.com        Diundang 3 hari lalu        [⋮]  │
├─────────────────────────────────────────────────────────────────────┤
│  [MI]  Maya Indah                 [Staf]       [Nonaktif]           │
│        maya@rarabeauty.com                                    [⋮]  │
└─────────────────────────────────────────────────────────────────────┘
```

Row action menu `[⋮]` options (contextual by status and role):

- Edit Peran
- Kirim Ulang Undangan (PENDING only)
- Nonaktifkan Akun (ACTIVE only)
- Aktifkan Kembali (INACTIVE only)
- Hapus Pengguna (not self, not OWNER)

---

### Tab B — Peran & Izin (read-only matrix)

```
                    Pemilik   Manajer   Stylist   Staf
─────────────────────────────────────────────────────
Dashboard
  Lihat Dashboard     ✓         ✓         ✓        ✓
  Lihat Statistik     ✓         ✓         -        -

Pemesanan
  Lihat               ✓         ✓         ✓        ✓
  Buat                ✓         ✓         ✓        -
  Edit                ✓         ✓         ✓        -
  Batalkan            ✓         ✓         -        -
  Kelola Pembayaran   ✓         ✓         -        -

Jadwal
  Lihat               ✓         ✓         ✓        ✓
  Edit                ✓         ✓         ✓        -
  Kelola Jadwal Staf  ✓         ✓         -        -

Klien
  Lihat               ✓         ✓         ✓        ✓
  Buat / Edit         ✓         ✓         -        -
  Hapus               ✓         ✓         -        -

Pengaturan
  Kelola Bisnis       ✓         ✓         -        -
  Kelola Layanan      ✓         ✓         -        -
  Kelola Staf         ✓         ✓         -        -
  Kelola Pengguna     ✓         -         -        -
─────────────────────────────────────────────────────
```

No edit interaction. This tab is informational.

---

### Side sheet — Undang Pengguna / Edit Pengguna

```
Undang Pengguna
─────────────────────────────
Nama Lengkap *
[                           ]

Email *
[                           ]

Peran *
[ Manajer                 ▼ ]

Terhubung ke Staff (opsional)
[ Luna Sari               ▼ ]

─────────────────────────────
                 [Batal] [Undang]
```

---

## 14. Recommended Implementation Order

| Step | Task                                                                                      | Priority     |
| ---- | ----------------------------------------------------------------------------------------- | ------------ |
| 1    | **Extract `AvatarBubble` + `StatusBadge` to `shared/`**                                   | Prerequisite |
| 2    | **Extend `User` type** — add `status`, `staffId`, `invitedAt`, `lastLoginAt`              | Prerequisite |
| 3    | **Fix role badge colors** — replace hex in `role-permissions.ts` with token classes       | Prerequisite |
| 4    | **Create `useUsersController`** — mock CRUD mirroring `useTeamController` pattern         | P0           |
| 5    | **Build `PenggunaSection`** — user list with `SettingsListCard` rows + `EntityActionMenu` | P0           |
| 6    | **Build invite side sheet** — name, email, role, optional staffId link                    | P0           |
| 7    | **Build status flows** — deactivate, reactivate, revoke with `ConfirmDialog`              | P1           |
| 8    | **Build `PeranIzinSection`** — read-only permission matrix                                | P1           |
| 9    | **Wire `PenggunaPageClient`** — `SettingsTabbedCard` with both sections                   | P1           |
| 10   | **Replace `page.tsx` stub**                                                               | Final        |

**Step 1 is a prerequisite for both this domain AND cleaning up the Team domain.** It should be done before any Pengguna UI work begins, because both `AvatarBubble` and `StatusBadge` are needed here and are currently duplicated 3 times in team sections.

---

## 15. Type Changes Required (summary)

```typescript
// auth.types.ts — additions

export type UserAccountStatus = "ACTIVE" | "PENDING" | "INACTIVE" | "REVOKED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  salonId: string;

  // Replace isActive: boolean
  status: UserAccountStatus;

  // New — link to staff record
  staffId: string | null;

  // New — timestamps
  invitedAt: string | null;
  lastLoginAt: string | null;
  joinDate: string;

  // Fix: replace emoji string with proper pattern
  avatarUrl: string | null; // was: avatar?: string (emoji)
  phone?: string;
}
```

`isActive` can be derived: `status === 'ACTIVE'`. Keeping both creates a sync risk — remove `isActive`.

---

## Appendix — Files That Will Be Created

```
apps/owner/src/
  shared/
    components/
      ui/
        AvatarBubble.tsx          (extracted from Team sections)
        StatusBadge.tsx           (extracted from Team sections)

  features/dashboard/components/settings/
    components/
      pengguna/
        PenggunaPageClient.tsx
        sections/
          PenggunaSection.tsx
          PeranIzinSection.tsx

    types/
      pengguna.types.ts           (re-exports from auth.types + local additions)

  features/dashboard/hooks/settings/
    usePenggunaController.ts
```

---

## Appendix — Files That Will Be Modified

```
apps/owner/src/features/auth/
  types/auth.types.ts             — extend User (status, staffId, invitedAt, lastLoginAt)
  utils/role-permissions.ts       — replace getRoleColor/getRoleBackgroundColor with token classes
  mocks/auth-mock.ts              — update mock users to match new type shape

apps/owner/src/app/dashboard/settings/pengguna/
  page.tsx                        — replace stub with PenggunaPageClient
```
