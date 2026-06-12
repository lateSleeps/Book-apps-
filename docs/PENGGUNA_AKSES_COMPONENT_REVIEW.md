# Pengguna & Akses — Component Architecture Review

**Date:** 2026-06-11
**Purpose:** Challenge the wireframe. Eliminate unnecessary new primitives before implementation.

---

## Verdict First

The wireframe proposed **10 new components**. After audit: **1 truly new component** is required.
Everything else maps to an existing primitive, with one small extension.

---

## Question 1 — Tabs or filter chips for account status?

### The wireframe said: 3 tabs (Aktif | Diundang | Nonaktif)

### Challenge

Tabs make sense when each pane represents a meaningfully different _task context_, not just
a filtered view of the same data. Apple Business Manager uses tabs because People, Devices,
and Apps are completely different domains. Notion and Linear show one unified member list
because all members are the same kind of object — just in different states.

For Pengguna & Akses: ACTIVE, INVITED, INACTIVE/REVOKED are states of the same object (`User`).
A typical salon has 3–15 users. At that scale, tabs create friction:

- Owner clicks "Diundang" → sees 0 or 1 row → clicks back
- Owner cannot see active + invited users side by side
- Tab count badges require a separate data fetch or pre-scan before render

### Decision: **Single list, status filter using `SegmentedControl`**

```
[ Semua (8) ]  [ Aktif (5) ]  [ Diundang (2) ]  [ Nonaktif (1) ]
```

`SegmentedControl` already handles this exactly — it exists, it works, it requires zero changes.
The active filter value drives `usePenggunaController.filteredUsers`.

"Semua" as default keeps all users visible. Owner scans the full picture first.

**Scale note (50+ users):** At scale, filter chips become search + filter. The `SegmentedControl`
slot is replaced by a search field. The tab structure would have the same problem.

---

## Question 2 — Can SegmentedControl replace StatusTabBar?

### Yes, completely. Drop StatusTabBar.

`SegmentedControl` API:

```typescript
items: { id: string; label: string }[]
activeId: string
onChange: (id: string) => void
```

Usage with counts (computed from controller):

```typescript
const filterItems = [
  { id: "all", label: `Semua (${total})` },
  { id: "active", label: `Aktif (${activeCount})` },
  { id: "invited", label: `Diundang (${invitedCount})` },
  { id: "inactive", label: `Nonaktif (${inactiveCount})` },
];
```

Count embedded in `label` string — no new component needed. `SegmentedControl` already renders
`overflow-x-auto` so this works on mobile too.

**`StatusTabBar` → REMOVED from the list. Use `SegmentedControl` directly.**

---

## Question 3 — Can StatusBadge replace AccountStatusBadge and AccessRoleBadge?

### No. But they don't need to be components at all.

**`StatusBadge` is hardwired:**

```typescript
interface StatusBadgeProps {
  isActive: boolean;
}
// Two states only: "Aktif" | "Nonaktif"
// Fixed tokens: bg-st-in-progress-bg | bg-bg-control
```

It cannot represent INVITED, REVOKED, OWNER, or ADMIN.

**But `SettingsListCard` already has a 5-variant badge system:**

```typescript
type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";
// default  → bg-bg-control text-tx-subtle
// success  → bg-st-in-progress-bg text-st-in-progress
// warning  → bg-st-upcoming-bg text-st-upcoming
// danger   → bg-st-cancelled-bg text-st-cancelled
// info     → bg-st-confirmed-bg text-st-confirmed
```

All required badge mappings fit this existing vocabulary:

| Value    | SettingsListCard variant | Visual          |
| -------- | ------------------------ | --------------- |
| ACTIVE   | `success`                | green           |
| INVITED  | `warning`                | blue-upcoming   |
| INACTIVE | `default`                | gray            |
| REVOKED  | `danger`                 | red             |
| OWNER    | `info`                   | green-confirmed |
| ADMIN    | `warning`                | blue-upcoming   |
| STAFF    | `default`                | gray            |

Callers compute `BadgeConfig[]` from the user record — no wrapper component needed.

Where a badge appears _outside_ `SettingsListCard` (e.g., in the edit sheet identity section),
use a file-local inline `<span>` with the correct token classes. Too simple to extract.

**`AccessRoleBadge` → REMOVED. Use `SettingsListCard.badges` or inline span.**
**`AccountStatusBadge` → REMOVED. Same.**

---

## Question 4 — Can SettingsListCard replace UserAccountRow?

### Yes, with one optional prop added.

**`SettingsListCard` currently:**

```
[thumbnail]  [title]          [actions]
             [description]
             [badges row]
```

The thumbnail slot supports `imageUrl?: string` (photo) or `imageFallback?: string` (emoji/initials).
`imageFallback` renders inside a `bg-bg-control` div — it cannot use `AvatarBubble`'s computed
palette color.

**Required extension:** Add one optional prop:

```typescript
/** Custom leading slot — replaces the thumbnail when provided */
leadingSlot?: ReactNode;
```

When `leadingSlot` is present, skip the `imageUrl / imageFallback` rendering entirely.
Backward-compatible: zero changes to existing callers.

**`UserAccountRow` mapped to `SettingsListCard`:**

```typescript
<SettingsListCard
  leadingSlot={<AvatarBubble name={user.name} />}
  title={user.name}
  description={user.email}
  badges={[
    { label: roleLabel[user.role], variant: roleVariant[user.role] },
    { label: statusLabel[user.status], variant: statusVariant[user.status] },
  ]}
  actions={<EntityActionMenu actions={buildActions(user)} />}
/>
```

The secondary info line (StaffRole + staff link, last login) maps to `description`.
If two lines are needed (email AND staff link), `description` accepts JSX when the prop is typed
as `ReactNode` — or just concatenate: `"luna@... · Stylist · Terhubung ke staf"`.

**`UserAccountRow` → REMOVED. Extend `SettingsListCard` with `leadingSlot?: ReactNode`.**
**`InvitedUserRow` → REMOVED. Same component, different data.**
**`InactiveUserRow` → REMOVED. Same component, different data.**

---

## Question 5 — Minimize new primitives. What remains?

### After dropping all the above, the list is:

| Original new component      | Decision           | Reasoning                                            |
| --------------------------- | ------------------ | ---------------------------------------------------- |
| `StatusTabBar`              | DROP               | `SegmentedControl` handles this without modification |
| `AccessRoleBadge`           | DROP               | `SettingsListCard.badges` + inline spans             |
| `AccountStatusBadge`        | DROP               | Same                                                 |
| `UserAccountRow`            | DROP               | `SettingsListCard` + `leadingSlot` extension         |
| `InvitedUserRow`            | DROP               | Same                                                 |
| `InactiveUserRow`           | DROP               | Same                                                 |
| `UserIdentityCard`          | DROP               | Inline JSX in edit sheet (read-only, ~10 lines)      |
| `RoleSegmentedControl`      | DROP               | `SegmentedControl` directly, 2 items                 |
| `UninvitedStaffBanner`      | Inline JSX for now | Too page-specific to extract; extract if reused      |
| **`PermissionSummaryCard`** | **BUILD**          | See below                                            |

---

## The One New Component: PermissionSummaryCard

### Why it cannot be eliminated

`PermissionSummaryCard` displays 5 capability groups (not 22 raw permissions) for a given
`AccessRole`. It is needed in two distinct places:

1. InviteUserSheet — updates live as role selector changes
2. EditUserSheet — shows current role's capabilities

Using a component avoids duplicating the permission→group mapping logic twice.
No existing primitive approximates this layout (icon + group label + capability summary per row).

### What it is

A stateless pure-display component. Input: `role: AccessRole`. Output: 5 rows.

```
┌──────────────────────────────────────────────────────┐
│ ✅  Pemesanan       Buat, edit, batalkan, pembayaran  │
│ ✅  Jadwal          Kelola jadwal semua staf           │
│ ✅  Klien           Lihat, buat, edit, hapus           │
│ ✅  Pengaturan      Info bisnis, layanan, staf         │
│ ❌  Pengguna & Akses  Tidak bisa mengelola akun        │
└──────────────────────────────────────────────────────┘
```

Approximately 40 lines of code. Token classes only. No state.

---

## Final Component Map

### Reuse — zero changes

| Component                                                 | Used for                                                                    |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| `SegmentedControl`                                        | Status filter (Semua / Aktif / Diundang / Nonaktif)                         |
| `SettingsSideSheet`                                       | Invite sheet (`saveLabel="Kirim Undangan"`) + Edit sheet                    |
| `SettingsEmptyState`                                      | All three filter-state empty states                                         |
| `EntityActionMenu`                                        | Per-row action menus                                                        |
| `ConfirmDialog`                                           | Role downgrade confirmation                                                 |
| `SettingsDangerZone`                                      | Deactivate + revoke in edit sheet (already handles two-step confirm inline) |
| `SettingsSectionHeader`                                   | Page header with "Undang Pengguna" button                                   |
| `SettingsAddButton`                                       | "Undang Pengguna" button                                                    |
| `SettingsFieldGroup` + `SettingsInput` + `SettingsSelect` | Invite form                                                                 |
| `AvatarBubble`                                            | User identity thumbnail in every row                                        |
| `SettingsTabbedCard`                                      | NOT needed — filter uses SegmentedControl standalone                        |

### Extend — minimal change

| Component          | Change                                            | Impact to existing callers       |
| ------------------ | ------------------------------------------------- | -------------------------------- |
| `SettingsListCard` | Add `leadingSlot?: ReactNode` (one optional prop) | Zero — fully backward-compatible |

### Build new

| Component               | Lines (est.) | Where used                        |
| ----------------------- | ------------ | --------------------------------- |
| `PermissionSummaryCard` | ~40          | InviteUserSheet, EditUserSheet    |
| `usePenggunaController` | ~80          | PenggunaPageClient (hook, not UI) |

---

## Architecture Decisions (revised)

### Page structure

```
PenggunaPageClient
├── SettingsSectionHeader (title + Undang button)
├── UninvitedStaffBanner (inline JSX, conditional)
├── SegmentedControl (status filter)
├── [filtered list]
│    └── SettingsListCard per user
│         ├── leadingSlot: AvatarBubble
│         ├── title: user.name
│         ├── description: user.email · StaffRole · linked/not
│         ├── badges: [AccessRole, AccountStatus]
│         └── actions: EntityActionMenu
├── SettingsEmptyState (when filtered list is empty)
│
├── InviteUserSheet (SettingsSideSheet)
│    ├── SettingsFieldGroup × 3 (name, email, staffLink)
│    ├── SegmentedControl (ADMIN | STAF)
│    └── PermissionSummaryCard
│
└── EditUserSheet (SettingsSideSheet)
     ├── Inline identity section (AvatarBubble + text — not a component)
     ├── SegmentedControl (role change)
     ├── PermissionSummaryCard
     └── SettingsDangerZone (Nonaktifkan + Cabut Akses)
```

### SettingsDangerZone eliminates the "danger zone" in the wireframe

The wireframe showed a hand-rolled danger zone inside the edit sheet.
`SettingsDangerZone` already implements:

- Two-step inline confirmation (button → confirm prompt + confirm/cancel)
- `description` text per action
- Multiple actions in one container

Configuration for edit sheet:

```typescript
<SettingsDangerZone
  actions={[
    {
      label: 'Nonaktifkan Akun',
      description: 'Akun dinonaktifkan sementara. Dapat diaktifkan kembali.',
      confirmLabel: 'Nonaktifkan',
      confirmPrompt: 'Yakin? Pengguna tidak bisa login sampai diaktifkan kembali.',
      onConfirm: () => ctrl.deactivateUser(user.id),
    },
    {
      label: 'Cabut Akses Permanen',
      description: 'Akses dicabut selamanya. Butuh undangan baru untuk akses kembali.',
      confirmLabel: 'Cabut Akses',
      confirmPrompt: 'Tindakan ini tidak dapat dibatalkan.',
      onConfirm: () => ctrl.revokeUser(user.id),
    },
  ]}
/>
```

---

## What Changed from the Wireframe

| Wireframe decision  | Revised decision               | Why                                                          |
| ------------------- | ------------------------------ | ------------------------------------------------------------ |
| 3 status tabs       | 1 list + filter chips          | Fewer taps, all users visible at once                        |
| 10 new components   | 1 new component + 1 hook       | Everything else already exists                               |
| Custom danger zone  | `SettingsDangerZone`           | Already built, already tested                                |
| `AccessRoleBadge`   | `SettingsListCard.badges`      | Existing badge system covers all variants                    |
| `StatusTabBar`      | `SegmentedControl`             | Already handles this pattern exactly                         |
| Table layout (grid) | Card list (`SettingsListCard`) | Scales better to 3–15 users; table is premature optimization |
| `UserIdentityCard`  | Inline JSX                     | Read-only, ~8 lines, no reuse elsewhere                      |

---

## Risk: SettingsListCard extension

The one code change to an existing component is `SettingsListCard.leadingSlot`.
Risk assessment:

- **Breaking change risk:** None. New optional prop, existing callers pass nothing.
- **Test impact:** None. No tests exist for this component (visual-only).
- **Scope creep risk:** Low. One prop, clear purpose, backward-compatible.

This is the safest possible extension to an existing component.

---

## Approved to implement

1. Add `leadingSlot?: ReactNode` to `SettingsListCard`
2. Build `PermissionSummaryCard`
3. Build `usePenggunaController`
4. Build `PenggunaPageClient` using the component map above
