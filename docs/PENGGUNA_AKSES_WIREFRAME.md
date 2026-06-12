# Pengguna & Akses — UX Architecture & Wireframe

**Date:** 2026-06-11
**Status:** Pre-implementation proposal
**References:** Apple Business Manager, Notion Team Management, Linear Organization Settings

---

## 1. Current UX Score

| Dimension    | Score | Rationale                                             |
| ------------ | ----- | ----------------------------------------------------- |
| UX           | 1/10  | Blank stub. No implemented UI whatsoever.             |
| Architecture | 7/10  | Foundation cleanup complete. Types are clean.         |
| Scalability  | 3/10  | No search, no filter, no batch actions, no pagination |

**Top 5 UX Problems (post-foundation):**

1. **Page does not exist** — Zero UI for a critical trust-sensitive action (access control).
2. **No invitation lifecycle** — Owner cannot invite staff. Accounts can only be created in code.
3. **No identity hierarchy** — Person identity, account status, and access role are never shown together in a single readable unit.
4. **No role transparency** — "What is the difference between Admin and Staf?" is unanswerable in the current UI.
5. **StaffMember-User gap is invisible** — Owner cannot see which staff have accounts and which do not.

---

## 2. Mental Model

### What the owner actually thinks

A salon owner does not think in terms of `User` records and `AccessRole` enums. Their mental model:

```
"Rina manages the salon when I'm away.
 She needs to see bookings and change schedules.
 Luna is a stylist — she should only see her own jobs.
 Maya just started — she has no access yet."
```

The page must map onto this mental model in three layers:

```
Layer 1 — Siapa orangnya?
  → Person identity: avatar + full name + job function (StaffRole)

Layer 2 — Apakah dia punya akun?
  → Account status: ACTIVE / INVITED / INACTIVE / REVOKED
  → If no account: show a path to invite them

Layer 3 — Apa yang boleh dia lakukan?
  → Access tier: Pemilik / Admin / Staf
  → Capability summary: 4 groups, human language, not enum names
```

These three questions must be answerable by scanning a single row — no clicks required.

### Staff vs Account — never conflate

| Concept      | Question                         | Source model  |
| ------------ | -------------------------------- | ------------- |
| **Tim**      | "Who works at my salon?"         | `StaffMember` |
| **Pengguna** | "Who can log into my dashboard?" | `User`        |

A COLORIST who performs services every day may have no login account.
A remote accountant may have an ADMIN account but no StaffMember record.

The "Pengguna & Akses" page is about accounts — but should surface the staff connection.

---

## 3. Information Architecture

### Primary axis: Account Status

Account status is the most operationally important dimension:

```
Aktif     → People who can log in RIGHT NOW
Diundang  → People waiting to accept their invitation
Nonaktif  → People whose access has been suspended or revoked
```

Mixing these in a single list creates cognitive noise. The Apple Business Manager pattern (status tabs) is correct here.

### Secondary axis: Access tier (within Aktif)

Within the Aktif tab, sort by role tier:

1. Pemilik (always first, singular, pinned)
2. Admin (elevated access)
3. Staf (standard access)

This establishes authority hierarchy at a glance.

### Structure

```
Pengguna & Akses
├── [Banner] Staff tanpa akun (dismissable, conditional)
├── [Tab: Aktif]
│    ├── OWNER rows (max 1, pinned, non-editable)
│    ├── ADMIN rows
│    └── STAFF rows
├── [Tab: Diundang]
│    ├── Pending invitations (with sent date + resend/cancel)
│    └── Empty state: "Belum ada undangan aktif"
└── [Tab: Nonaktif]
     ├── INACTIVE rows (can restore)
     ├── REVOKED rows (cannot restore — new invite required)
     └── Empty state: "Belum ada akun nonaktif"
```

### What Peran & Izin becomes

"Peran & Izin" is not a tab. It is a read-only panel that appears inside the edit side sheet — shown contextually when the owner is looking at a specific user's role. Showing it as a global tab fragments the user's attention.

A separate help link ("Pelajari perbedaan peran →") can open a full-page matrix for owners who want the complete overview.

---

## 4. Page Hierarchy

```
/dashboard/settings/pengguna
│
├── PenggunaPage (server component — fetches, passes to client)
│    └── PenggunaPageClient (tab state, controller binding)
│         ├── Section header + Undang button
│         ├── UninvitedStaffBanner (conditional)
│         ├── StatusTabBar (Aktif | Diundang | Nonaktif)
│         │
│         ├── [Aktif]
│         │    └── UserAccountTable
│         │         ├── UserAccountTableHeader
│         │         └── UserAccountRow (per user)
│         │              └── EntityActionMenu
│         │
│         ├── [Diundang]
│         │    └── InvitedUserTable
│         │         └── InvitedUserRow (per invitation)
│         │              └── EntityActionMenu (resend | cancel)
│         │
│         └── [Nonaktif]
│              └── InactiveUserTable
│                   └── InactiveUserRow (per user)
│                        └── EntityActionMenu (restore | hapus permanen)
│
├── InviteUserSheet (side sheet — triggered from header button)
│    ├── Step 1: Identity (name + email)
│    ├── Step 2: Role (segmented control + role summary card)
│    └── Step 3: Staff link (optional dropdown)
│
└── EditUserSheet (side sheet — triggered from row action)
     ├── User identity card (read-only)
     ├── Role selector + PermissionSummaryCard
     └── Danger zone: Nonaktifkan / Cabut Akses
```

---

## 5. Wireframes

### 5.1 Main page — Aktif tab (default)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Pengguna & Akses                                      [+ Undang Pengguna]│
│ Kelola akun login dan hak akses anggota tim.                            │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💡 2 anggota tim belum punya akun login.  [Lihat siapa] [Abaikan ×]│ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ● Aktif  (3)    ○ Diundang  (1)    ○ Nonaktif  (0)                      │
├─────────────────────────────────────────────────────────────────────────┤
│  Anggota                        Peran         Login Terakhir   Aksi     │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──┐                                                                   │
│  │RK│ Rara Kusuma           (Kamu) ▌ Pemilik ▐    Hari ini      [⋮]    │
│  └──┘ rara@rarabeauty.com          ─────────                           │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──┐                                                                   │
│  │RW│ Rina Wijaya                  ▌ Admin ▐      2 hari lalu   [⋮]    │
│  └──┘ rina@rarabeauty.com          ──────                              │
│       Manager · Terhubung ke staf                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──┐                                                                   │
│  │LS│ Luna Sari                    ▌ Staf ▐       4 hari lalu   [⋮]    │
│  └──┘ luna@rarabeauty.com          ─────                               │
│       Stylist · Terhubung ke staf                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Row anatomy (per user):**

```
[Avatar]  [Full name]      [(Kamu) label if self]    [Role badge]   [Last login]   [⋮]
          [email]
          [StaffRole] · [Terhubung ke staf] OR [Tidak terhubung]
```

**Role badge tokens:**

| Role  | Label   | Classes                                |
| ----- | ------- | -------------------------------------- |
| OWNER | Pemilik | `bg-st-confirmed-bg text-st-confirmed` |
| ADMIN | Admin   | `bg-st-upcoming-bg text-st-upcoming`   |
| STAFF | Staf    | `bg-bg-control text-tx-subtle`         |

**[⋮] action menu — Aktif tab:**

```
For ADMIN/STAFF rows:
  ├── Ubah Peran
  ├── ─────────
  ├── Nonaktifkan Akun
  └── Cabut Akses Permanen  [danger]

For OWNER row:
  └── (no actions — OWNER is protected)

For own row (any role):
  └── (actions disabled — cannot modify self)
```

---

### 5.2 Diundang tab

```
├─────────────────────────────────────────────────────────────────────────┤
│ ● Aktif  (3)    ● Diundang  (1)    ○ Nonaktif  (0)                      │
├─────────────────────────────────────────────────────────────────────────┤
│  Anggota                        Peran         Diundang          Aksi    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──┐                                                                   │
│  │MI│ Maya Indah                   ▌ Staf ▐      3 hari lalu   [⋮]    │
│  └──┘ maya@rarabeauty.com          ─────                               │
│       Undangan belum diterima                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

**[⋮] action menu — Diundang tab:**

```
  ├── Kirim Ulang Undangan
  └── Batalkan Undangan    [danger]
```

---

### 5.3 Nonaktif tab

```
├─────────────────────────────────────────────────────────────────────────┤
│ ● Aktif  (3)    ○ Diundang  (1)    ● Nonaktif  (2)                      │
├─────────────────────────────────────────────────────────────────────────┤
│  Anggota                        Terakhir Aktif  Status          Aksi    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──┐                                                                   │
│  │DR│ Dewi Rahayu                  6 bulan lalu  ▌ Nonaktif ▐   [⋮]    │
│  └──┘ dewi@rarabeauty.com                        ───────────            │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──┐                                                                   │
│  │BS│ Budi Santoso                 1 tahun lalu  ▌ Dicabut ▐    [⋮]    │
│  └──┘ budi@rarabeauty.com                        ──────────             │
└─────────────────────────────────────────────────────────────────────────┘
```

**Account status badge tokens:**

| Status   | Label    | Classes                                    | Meaning                       |
| -------- | -------- | ------------------------------------------ | ----------------------------- |
| ACTIVE   | Aktif    | `bg-st-in-progress-bg text-st-in-progress` | Can log in now                |
| INVITED  | Diundang | `bg-st-upcoming-bg text-st-upcoming`       | Pending — link not clicked    |
| INACTIVE | Nonaktif | `bg-bg-control text-tx-subtle`             | Suspended — can restore       |
| REVOKED  | Dicabut  | `bg-st-cancelled-bg text-st-cancelled`     | Permanent — new invite needed |

**[⋮] action menu — Nonaktif tab:**

```
INACTIVE row:
  ├── Aktifkan Kembali
  └── Hapus Pengguna     [danger]

REVOKED row:
  ├── Undang Ulang (creates new invitation)
  └── Hapus Pengguna     [danger]
```

---

### 5.4 Empty states

**Aktif tab — only owner (just getting started):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [UserGear icon — duotone, 32px]                                        │
│                                                                         │
│  Belum ada anggota tim                                                  │
│  Undang anggota tim untuk memberi mereka akses ke dashboard.            │
│                                                                         │
│                        [+ Undang Pengguna]                              │
└─────────────────────────────────────────────────────────────────────────┘
```

**Diundang tab — no pending invitations:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [EnvelopeSimple icon — duotone, 32px]                                  │
│                                                                         │
│  Tidak ada undangan aktif                                               │
│  Undangan yang belum diterima akan muncul di sini.                      │
└─────────────────────────────────────────────────────────────────────────┘
```

**Nonaktif tab — no inactive accounts:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [CheckCircle icon — duotone, 32px]                                     │
│                                                                         │
│  Tidak ada akun nonaktif                                                │
│  Semua anggota tim masih aktif.                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 5.5 Side sheet — Undang Pengguna

Multi-step inside a single `SettingsSideSheet`. No separate pages or modals — just the sheet content scrolling through logical sections.

```
╔═════════════════════════════════════════╗
║ Undang Pengguna                      [×]║
╠═════════════════════════════════════════╣
║                                         ║
║  Nama Lengkap *                         ║
║  ┌───────────────────────────────────┐  ║
║  │ Contoh: Dewi Rahayu               │  ║
║  └───────────────────────────────────┘  ║
║                                         ║
║  Alamat Email *                         ║
║  ┌───────────────────────────────────┐  ║
║  │ dewi@rarabeauty.com               │  ║
║  └───────────────────────────────────┘  ║
║                                         ║
║  Peran Akses *                          ║
║  ┌──────────────────┬────────────────┐  ║
║  │ ● Admin          │   Staf         │  ║
║  └──────────────────┴────────────────┘  ║
║                                         ║
║  ┌───────────────────────────────────┐  ║
║  │ ✅ Manajemen Pemesanan            │  ║
║  │ ✅ Pengaturan Salon               │  ║
║  │ ✅ Manajemen Klien                │  ║
║  │ ✅ Laporan & Analitik             │  ║
║  │ ❌ Pengguna & Akses               │  ║
║  └───────────────────────────────────┘  ║
║                                         ║
║  Hubungkan ke Anggota Staf (opsional)   ║
║  ┌───────────────────────────────────┐  ║
║  │ Pilih anggota staf...           ▼ │  ║
║  └───────────────────────────────────┘  ║
║  Memungkinkan filter data per staf      ║
║  di pemesanan dan jadwal.               ║
║                                         ║
╠═════════════════════════════════════════╣
║                     [Batal] [Kirim Undangan]║
╚═════════════════════════════════════════╝
```

**Role selector behavior:**

- Segmented control: ADMIN | STAF (OWNER is not assignable via invite)
- Switching role updates the permission summary card immediately
- Permission summary: 5 groups, each showing check / cross

**Validation:**

- Email: format check + "email ini sudah terdaftar" error state
- Name: required, min 2 chars
- Role: required, default STAF

---

### 5.6 Side sheet — Edit Pengguna (role change)

```
╔═════════════════════════════════════════╗
║ Edit Pengguna                        [×]║
╠═════════════════════════════════════════╣
║                                         ║
║  ┌───────────────────────────────────┐  ║
║  │ ┌──┐ Rina Wijaya                  │  ║
║  │ │RW│ rina@rarabeauty.com          │  ║
║  │ └──┘ Manager · Aktif              │  ║
║  │      Bergabung 10 Jun 2023        │  ║
║  │      Terakhir login 2 hari lalu   │  ║
║  └───────────────────────────────────┘  ║
║                                         ║
║  Peran Akses                            ║
║  ┌──────────────────┬────────────────┐  ║
║  │ ● Admin          │   Staf         │  ║
║  └──────────────────┴────────────────┘  ║
║                                         ║
║  ┌───────────────────────────────────┐  ║
║  │ ✅ Manajemen Pemesanan            │  ║
║  │ ✅ Pengaturan Salon               │  ║
║  │ ✅ Manajemen Klien                │  ║
║  │ ✅ Laporan & Analitik             │  ║
║  │ ❌ Pengguna & Akses               │  ║
║  └───────────────────────────────────┘  ║
║                                         ║
║  ─────────────────────────────────────  ║
║  Zona Berbahaya                         ║
║                                         ║
║  [Nonaktifkan Akun]                     ║
║  Akun akan dinonaktifkan sementara.     ║
║  Dapat diaktifkan kembali.              ║
║                                         ║
║  [Cabut Akses Permanen]                 ║
║  Akses dicabut selamanya.               ║
║  Diperlukan undangan baru untuk akses.  ║
║                                         ║
╠═════════════════════════════════════════╣
║                       [Batal] [Simpan]  ║
╚═════════════════════════════════════════╝
```

**Identity card (read-only):** Shows `AvatarBubble` + name + email + StaffRole + account status + join date + last login. This card is not editable — it answers "siapa orangnya?" definitively.

**Role change confirmation (downgrade only):**

When changing Admin → Staf, a `ConfirmDialog` fires before save:

```
Turunkan Peran Rina Wijaya?

Rina tidak akan bisa lagi:
  • Mengubah pengaturan salon
  • Mengelola staf
  • Melihat laporan dan analitik

                      [Batal] [Ya, Turunkan]
```

Upgrade (Staf → Admin) saves without confirmation — less destructive.

---

### 5.7 Permission summary card (reusable)

Used inside both invite and edit sheets. Shows 5 capability groups, not 22 raw permissions.

```
┌───────────────────────────────────────────────────────────┐
│ ✅ Pemesanan          Lihat, buat, edit, batalkan          │
│ ✅ Jadwal             Lihat dan edit jadwal semua staf     │
│ ✅ Klien              Lihat, buat, edit, hapus             │
│ ✅ Pengaturan Salon   Ubah info bisnis, layanan, staf      │
│ ❌ Pengguna & Akses   Tidak bisa mengelola akun            │
└───────────────────────────────────────────────────────────┘
```

Capability group mapping:

| Group            | Permissions included                                           |
| ---------------- | -------------------------------------------------------------- |
| Pemesanan        | VIEW/CREATE/EDIT_BOOKING, CANCEL_BOOKING, MANAGE_PAYMENT       |
| Jadwal           | VIEW/EDIT_SCHEDULE, MANAGE_STAFF_SCHEDULE, APPROVE_SCHEDULE    |
| Klien            | VIEW/CREATE/EDIT/DELETE_CLIENT, VIEW_CLIENT_HISTORY            |
| Pengaturan Salon | VIEW/EDIT_SETTINGS, MANAGE_SERVICES/ADDONS/STAFF/WORKING_HOURS |
| Pengguna & Akses | MANAGE_USERS, MANAGE_ROLES                                     |

For STAF role, add nuance: "Hanya pemesanan sendiri" instead of full capability label.

---

### 5.8 Uninvited staff banner

Shown at the top of the page when `staffWithoutAccounts.length > 0`. Dismissable per session.

```
┌───────────────────────────────────────────────────────────────────────┐
│  ● 2 anggota tim belum memiliki akun login.                          │
│    Beri mereka akses ke dashboard dengan mengundang mereka.           │
│                                                    [Undang] [Abaikan] │
└───────────────────────────────────────────────────────────────────────┘
```

Clicking "Undang": opens the invite sheet with the staff dropdown pre-populated with uninvited members.

Visual: `bg-st-upcoming-bg` border, `UserPlus` icon duotone.

---

## 6. Interaction Flows

### 6.1 Invitation flow

```
Owner clicks [+ Undang Pengguna]
    │
    ▼
InviteUserSheet opens
    │
    ├── Fill: Name, Email, Role (ADMIN or STAF)
    │         ↳ Role summary card updates live as role changes
    │
    ├── [Optional] Link to existing StaffMember
    │
    ├── Click [Kirim Undangan]
    │    ↳ Validate: email format + uniqueness check
    │    ↳ If invalid: inline error under email field
    │
    ▼
User record created (status: INVITED, invitedAt: now)
    │
    ▼
Sheet closes, tab bar switches to "Diundang (1)"
    │
    ▼
[In production] Email sent with magic link
[In mock]       User appears in Diundang tab immediately
```

---

### 6.2 Account activation flow (invited user perspective)

```
Staff member receives invitation email
    │
    ▼
Clicks link → set password page (future: Supabase Auth)
    │
    ▼
Password set → status: ACTIVE, lastLoginAt: now
    │
    ▼
User disappears from Diundang tab
User appears in Aktif tab with "Aktif" badge
```

**For current mock phase:** Simulate by adding a "Tandai Aktif" debug action in Diundang row. Not visible in production.

---

### 6.3 Role change flow

```
Owner clicks [⋮] on user row → "Ubah Peran"
    │
    ▼
EditUserSheet opens, current role pre-selected
    │
    ├── Owner selects new role
    │    ↳ Permission summary card updates live
    │
    ├── Click [Simpan]
    │    │
    │    ├── If UPGRADE (Staf → Admin):
    │    │    ↳ Save immediately, no confirmation
    │    │
    │    └── If DOWNGRADE (Admin → Staf):
    │         ↳ ConfirmDialog: "Turunkan peran Rina Wijaya?"
    │              ↳ [Ya, Turunkan] → save
    │              ↳ [Batal] → cancel, sheet stays open
    │
    ▼
Sheet closes, row updates with new role badge
```

---

### 6.4 Deactivate flow

```
Owner clicks [⋮] → "Nonaktifkan Akun"
    │
    ▼
ConfirmDialog:
  "Nonaktifkan akun Rina Wijaya?"
  "Rina tidak akan bisa login sampai diaktifkan kembali."
  [Batal] [Nonaktifkan]
    │
    ▼
status: ACTIVE → INACTIVE
User moves from Aktif tab to Nonaktif tab
```

---

### 6.5 Revoke access flow

Revoke is permanent — treated as a destructive action requiring explicit confirmation.

```
Owner clicks [⋮] → "Cabut Akses Permanen" (only available in Edit sheet danger zone)
    │
    ▼
ConfirmDialog (danger variant):
  "Cabut akses Rina Wijaya secara permanen?"
  "Akun tidak bisa dipulihkan. Butuh undangan baru untuk akses kembali."
  [Batal] [Cabut Akses]
    │
    ▼
status: ACTIVE/INACTIVE → REVOKED
User moves to Nonaktif tab, badge changes to "Dicabut" (red)
```

---

### 6.6 Restore flow (Nonaktif → Aktif)

```
Owner clicks [⋮] on INACTIVE row → "Aktifkan Kembali"
    │
    ▼
No confirmation required (non-destructive)
    │
    ▼
status: INACTIVE → ACTIVE
User moves from Nonaktif tab to Aktif tab
```

REVOKED cannot be restored — [⋮] shows "Undang Ulang" instead, which starts the invitation flow with email pre-filled.

---

## 7. Active / Invited / Revoked State Visual Treatment

### Aktif row

```
[Colored avatar]  [Full name]    [Role badge]  [Last login text]  [⋮]
                  [email]
                  [StaffRole · Linked]
```

Avatar has full color. All text at full opacity.

### Diundang row

```
[Muted avatar]   [Full name]    [Role badge]  [Pending badge]   [⋮]
                 [email]
                 [Undangan belum diterima · N hari lalu]
```

Avatar has reduced opacity (`opacity-60`). Pending badge: `bg-st-upcoming-bg text-st-upcoming`.

### Nonaktif (INACTIVE) row

```
[Grayscale avatar]  [Full name + strikethrough email]  [Nonaktif badge]  [⋮]
```

Avatar: `grayscale` filter. Name retains color. Email: `text-tx-muted`. Badge: `bg-bg-control text-tx-muted`.

### Nonaktif (REVOKED) row

```
[Grayscale avatar]  [Full name + strikethrough email]  [Dicabut badge]   [⋮]
```

Same as INACTIVE but badge is `bg-st-cancelled-bg text-st-cancelled` (red).

---

## 8. Mobile Considerations

### Breakpoint behavior

Desktop (≥ 768px): full table layout (grid columns — same pattern as StaffDirectorySection).

Mobile (< 768px): stacked card layout.

**Mobile card:**

```
┌──────────────────────────────────────────┐
│  ┌──┐  Rina Wijaya         [Admin badge] │
│  │RW│  rina@rarabeauty.com               │
│  └──┘  Manager · Terhubung ke staf       │
│         2 hari lalu                 [⋮]  │
└──────────────────────────────────────────┘
```

All columns collapse into vertical hierarchy inside a card. The `[⋮]` action menu stays.

### Mobile invite sheet

Full-screen sheet on mobile (`h-screen` bottom drawer). Same content as desktop, scrollable.

### Tab bar

On mobile: tabs become a horizontally scrollable chip strip with count badges.

---

## 9. Scalability — 50+ Employees

### Problem at scale

A salon with 50+ staff has 50+ user rows. The current design is table-first, which becomes unmanageable without:

- Search
- Role filter
- Batch actions

### Search bar (appears at ≥ 10 users)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [🔍] Cari nama atau email...                [Peran: Semua ▼]           │
├─────────────────────────────────────────────────────────────────────────┤
```

Search is live-filtered (client-side for ≤ 100 users, server-side beyond that).

Role filter dropdown: "Semua Peran | Pemilik | Admin | Staf"

### Batch actions (appears when ≥ 1 row selected)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [✓] 5 dipilih         [Ubah Peran ▼]  [Nonaktifkan]  [Batalkan Pilihan]│
├─────────────────────────────────────────────────────────────────────────┤
```

Batch: change role (all to ADMIN or STAFF), deactivate, cancel selection.
Batch delete/revoke is intentionally excluded — too destructive for a multi-select action.

### Pagination / virtual scroll

For ≤ 50 rows: render all (no pagination).
For 51–200 rows: paginate by 25 per page.
For 200+ rows: virtual scroll (out of scope for current phase, note as future work).

### Sort controls

Column headers are clickable for sort:

- Anggota: alphabetical A-Z / Z-A
- Peran: by role tier
- Login Terakhir: most recent first / oldest first

Default sort: by role tier (Owner first, Admin, Staf) then alphabetical within tier.

---

## 10. Component Mapping

### Reusable from Team domain (zero modification needed)

| Component               | Source file                   | Usage in Pengguna                              |
| ----------------------- | ----------------------------- | ---------------------------------------------- |
| `AvatarBubble`          | `shared/components/ui/`       | Every user row                                 |
| `StatusBadge`           | `shared/components/ui/`       | Not used directly (has own AccountStatusBadge) |
| `SettingsSectionHeader` | `settings/layout`             | Page header with [+ Undang] button             |
| `SettingsAddButton`     | `settings/components/shared/` | "Undang Pengguna" button                       |
| `SettingsEmptyState`    | `settings/components/shared/` | All three empty state variants                 |
| `EntityActionMenu`      | `settings/components/shared/` | Per-row action [⋮] menu                        |
| `ConfirmDialog`         | `settings/components/shared/` | Deactivate, revoke, downgrade                  |
| `SettingsSideSheet`     | `settings/layout`             | Invite sheet + Edit sheet                      |
| `SettingsInput`         | `settings/components/shared/` | Name + email fields in invite                  |
| `SettingsSelect`        | `settings/components/shared/` | Staff link dropdown in invite                  |
| `SettingsFieldGroup`    | `settings/components/shared/` | Form field wrappers                            |

### New components required

| Component               | Description                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------- | ------------ |
| `AccessRoleBadge`       | `OWNER/ADMIN/STAFF` pill — distinct from `StatusBadge` and `StaffRole` badge         |
| `AccountStatusBadge`    | `ACTIVE/INVITED/INACTIVE/REVOKED` pill — owns its own token mapping                  |
| `PermissionSummaryCard` | 5-group capability grid (Pemesanan / Jadwal / Klien / Pengaturan / Akses)            |
| `UserAccountRow`        | Table row: AvatarBubble + identity + AccessRoleBadge + last login + EntityActionMenu |
| `InvitedUserRow`        | Variation with opacity treatment + pending badge                                     |
| `InactiveUserRow`       | Variation with grayscale + INACTIVE/REVOKED badge                                    |
| `UserIdentityCard`      | Read-only card in edit sheet: avatar + name + email + StaffRole + dates              |
| `UninvitedStaffBanner`  | Conditional top banner: staff without accounts                                       |
| `StatusTabBar`          | Tab selector: Aktif (N)                                                              | Diundang (N)                    | Nonaktif (N) |
| `RoleSegmentedControl`  | Two-option inline selector: ADMIN                                                    | STAF (wraps `SegmentedControl`) |

### Notes on new components

**`AccessRoleBadge` vs `StatusBadge`:**

- `StatusBadge` (existing) answers "is this person active/inactive?" for StaffMember.isActive.
- `AccountStatusBadge` (new) answers "what is the account lifecycle state?" (ACTIVE/INVITED/INACTIVE/REVOKED).
- `AccessRoleBadge` (new) answers "what is their permission tier?" (OWNER/ADMIN/STAFF).
  These are three separate questions. One badge cannot serve all three.

**`UserAccountRow` grid columns:**

```
gridTemplateColumns: '2fr 1fr 1.2fr 1fr 2.5rem'
// [Identity]  [Role]  [Linked Staff]  [Last Login]  [Actions]
```

Same grid token pattern as `StaffDirectorySection`.

**`PermissionSummaryCard` is stateless:**
Takes `role: AccessRole` as prop, renders grouped capabilities. No internal state.
Used in: InviteUserSheet (live, changes with role selection), EditUserSheet (shows current + pending change).

---

## 11. Recommended Implementation Order

| Step | Task                                                   | What it enables                                                                                         |
| ---- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------- |
| 1    | `usePenggunaController` hook                           | Mock CRUD for User records (add, update role, deactivate, revoke). Mirrors `useTeamController` pattern. | All UI components    |
| 2    | `AccessRoleBadge` + `AccountStatusBadge`               | Visual vocabulary for the page                                                                          | All rows             |
| 3    | `PermissionSummaryCard`                                | Role explanation in sheets                                                                              | Invite + Edit sheets |
| 4    | `UserAccountRow` + `UserAccountTable`                  | Aktif tab list                                                                                          | Aktif tab            |
| 5    | Empty state for Aktif tab                              | First render before data exists                                                                         | Aktif tab            |
| 6    | `StatusTabBar` + tab switching                         | Full page scaffold                                                                                      | All tabs             |
| 7    | `InvitedUserRow` + Diundang tab                        | Second tab                                                                                              | Diundang tab         |
| 8    | `InactiveUserRow` + Nonaktif tab                       | Third tab                                                                                               | Nonaktif tab         |
| 9    | `InviteUserSheet` — form + validation                  | Invite flow                                                                                             | New users            |
| 10   | `EditUserSheet` — role change + danger zone            | Edit/revoke flow                                                                                        | Existing users       |
| 11   | `ConfirmDialog` wiring (downgrade, deactivate, revoke) | Destructive action guards                                                                               | All flows            |
| 12   | `UninvitedStaffBanner`                                 | Staff discovery                                                                                         | Page top             |
| 13   | Search + role filter (deferred to 50+ scale milestone) | Scalability                                                                                             | Large salons         |
| 14   | Replace `page.tsx` stub with `PenggunaPageClient`      | Page goes live                                                                                          | Shipping             |

**Critical dependency:** Step 1 (`usePenggunaController`) must be built before any UI component — it owns the mock state that all components read from.

---

## 12. File Structure

```
apps/owner/src/
  features/dashboard/
    components/settings/
      components/
        pengguna/
          PenggunaPageClient.tsx          ← tab state + controller binding
          sections/
            AktifSection.tsx             ← Aktif tab content
            DiundangSection.tsx          ← Diundang tab content
            NonaktifSection.tsx          ← Nonaktif tab content
          components/
            UserAccountRow.tsx           ← Aktif row
            InvitedUserRow.tsx           ← Diundang row
            InactiveUserRow.tsx          ← Nonaktif row
            UserIdentityCard.tsx         ← read-only identity in edit sheet
            PermissionSummaryCard.tsx    ← capability groups
            AccessRoleBadge.tsx          ← OWNER/ADMIN/STAFF badge
            AccountStatusBadge.tsx       ← ACTIVE/INVITED/INACTIVE/REVOKED
            RoleSegmentedControl.tsx     ← ADMIN | STAF selector
            StatusTabBar.tsx             ← tab bar with counts
            UninvitedStaffBanner.tsx     ← staff-without-accounts prompt
          forms/
            InviteUserForm.tsx           ← inside InviteUserSheet
            EditUserForm.tsx             ← inside EditUserSheet
      types/
        pengguna.types.ts                ← local types + re-exports from auth

    hooks/settings/
      usePenggunaController.ts           ← mock CRUD + state

  app/dashboard/settings/pengguna/
    page.tsx                             ← replace stub with PenggunaPageClient
```

---

## 13. Design Principles Summary

These principles override feature completeness at every decision point:

1. **One question per visual zone.** Identity, account status, and access role are visually distinct. They never merge into a single field.

2. **Actions are contextual.** No global "Manage" button. Actions appear on the row that owns them.

3. **Destructive actions require confirmation.** Deactivate, revoke, role downgrade — all behind `ConfirmDialog` with explicit consequence language.

4. **Role explanation at decision point.** `PermissionSummaryCard` appears inline when the owner is choosing a role — not in a separate "Help" page.

5. **Empty states teach, not just report.** Every empty state tells the owner what to do next with a single action button.

6. **OWNER is always first, always protected.** OWNER row is pinned at the top of the Aktif list, never has an action menu, cannot be changed by anyone.

7. **"Kamu" label prevents self-harm.** Own user row is labeled "(Kamu)" and all modify/deactivate actions are disabled.

8. **Progressive complexity.** The page shows 3 tabs + a simple list. Search/filter and batch actions appear only when the list grows to warrant them (≥ 10 users for search, ≥ 2 selected for batch).
