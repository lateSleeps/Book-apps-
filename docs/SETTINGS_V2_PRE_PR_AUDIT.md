# Settings V2 Pre-PR Audit

**Tanggal:** 2026-06-12
**Auditor mindset:** Staff Engineer + Principal Frontend Engineer + Design System Maintainer + PR Reviewer
**Scope:** Brand, Layanan, Produk & Paket, Tim, Pengguna & Akses, Operasional, Booking App

---

## Executive Summary

**Ready for Merge:** NO

**Blocker Count:** 0

**Should Fix Count:** 15

**Post-Merge Count:** 5

Tidak ada bug runtime yang meledak. Tidak ada type error (tsc clean). Tapi 15 SHOULD FIX harus bersih sebelum PR masuk review. Mayoritas adalah icon weight violations yang konsisten dan bisa diselesaikan dalam satu pass.

---

## Detailed Findings

---

### BLOCKER — 0 item

Tidak ada.

---

### SHOULD FIX BEFORE MERGE

---

#### [SF-01] `SettingsSideSheet.tsx:28` — Hardcoded spacing `p-4`

**File:** `layout/SettingsSideSheet.tsx`
**Line:** 28

```tsx
// Sekarang
<div className="fixed inset-0 z-50 flex items-center justify-end p-4">

// Harus
<div className="fixed inset-0 z-50 flex items-center justify-end p-s16">
```

`p-4` adalah Tailwind default spacing, bukan token design system. Semua spacing harus dari token `s-*`.

---

#### [SF-02] `BookingAppPageClient.tsx` — Toast timer tidak dibersihkan

**File:** `components/booking-app/BookingAppPageClient.tsx`
**Line:** 70-73

```tsx
// Sekarang — timer lama tidak dibatalkan jika toast baru muncul sebelum 3.5 detik
function showToast(msg: string) {
  setToast(msg);
  setTimeout(() => setToast(null), 3500);
}

// Harus — ikuti pola OperationalPageClient
const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
function showToast(msg: string) {
  if (toastTimer.current) clearTimeout(toastTimer.current);
  setToast(msg);
  toastTimer.current = setTimeout(() => setToast(null), 3500);
}
```

Skenario: owner save QRIS lalu hapus QRIS dalam < 3.5 detik. Timer pertama masih berjalan dan akan menghapus toast kedua sebelum waktunya. Bug nyata yang bisa terjadi dalam penggunaan normal.

---

#### [SF-03] `BookingAppPageClient.tsx` — Header typography tidak konsisten dengan domain lain

**File:** `components/booking-app/BookingAppPageClient.tsx`
**Lines:** 224, 371, 392

```tsx
// Sekarang — BookingApp menggunakan p + text-ts-sub
<p className="text-ts-sub font-bold text-tx-primary">Metode Pembayaran</p>

// Semua domain lain via SettingsSectionHeader menggunakan h2 + text-ts-t3
<h2 className="m-0 text-ts-t3 font-bold text-tx-primary">{title}</h2>
```

Perbedaan: elemen (p vs h2), token tipografi (ts-sub vs ts-t3). Section heading di Booking App terlihat lebih kecil dari domain lain. Gunakan `SettingsSectionHeader` atau sesuaikan ke `text-ts-t3` dan element `h2`.

---

#### [SF-04] `PenggunaPageClient.tsx:141` — Keyboard handler tidak menangani Space

**File:** `components/pengguna/PenggunaPageClient.tsx`
**Line:** 141

```tsx
// Sekarang
onKeyDown={(e) => e.key === 'Enter' && onClick()}

// Harus — WCAG 2.1: interactive elements respond to both Enter and Space
onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
```

`role="row"` dengan `tabIndex={0}` harus merespons Space sesuai ARIA pattern untuk interactive rows.

---

#### [SF-05] `PenggunaPageClient.tsx:519` — Unsafe cast OWNER ke InvitableRole

**File:** `components/pengguna/PenggunaPageClient.tsx`
**Line:** 519

```tsx
// Sekarang
const ROLE_RANK: Record<InvitableRole, number> = {
  ADMIN: 0,
  MANAGER: 1,
  STAFF: 2,
};
const currentRank = ROLE_RANK[user.role as InvitableRole] ?? 0;
```

`user.role` bisa `'OWNER'`. `ROLE_RANK['OWNER']` adalah `undefined`. `undefined ?? 0` menghasilkan 0, sehingga OWNER diperlakukan sebagai ADMIN rank. TypeScript hanya diam karena ada `as` cast.

Di konteks ini, `handleEditSave` hanya dipanggil ketika `canSaveEdit()` true, dan `canSaveEdit` mengembalikan `false` jika `user.role === 'OWNER'`. Jadi tidak akan crash. Tapi cast-nya tetap salah secara semantik dan berisiko jika `canSaveEdit` berubah di masa depan.

```tsx
// Harus
const currentRank =
  user.role === "OWNER" ? -1 : ROLE_RANK[user.role as InvitableRole] ?? 0;
```

---

#### [SF-06] `SettingsIconPicker.tsx:158` — Trigger button tanpa aria-label

**File:** `components/shared/SettingsIconPicker.tsx`
**Line:** ~158 (trigger button untuk icon picker)

Tombol trigger icon picker tidak memiliki `aria-label`. Screen reader hanya membaca konten visual (icon yang sedang dipilih), tanpa context aksi. Tambahkan `aria-label="Pilih ikon"`.

---

#### [SF-07] Icon weight violations — 9 instance

Semua icon di project harus `weight="duotone"`. Violations berikut ditemukan:

| #   | File                        | Line | Icon                | Weight Sekarang | Harus     |
| --- | --------------------------- | ---- | ------------------- | --------------- | --------- |
| 1   | `SettingsDangerZone.tsx`    | 46   | `Warning`           | `fill`          | `duotone` |
| 2   | `EntityActionMenu.tsx`      | 50   | `DotsThreeVertical` | `bold`          | `duotone` |
| 3   | `SettingsAddButton.tsx`     | 21   | `Plus`              | `bold`          | `duotone` |
| 4   | `SettingsUploadField.tsx`   | 144  | `X`                 | `bold`          | `duotone` |
| 5   | `PermissionSummaryCard.tsx` | 86   | `Check`             | `bold`          | `duotone` |
| 6   | `PermissionSummaryCard.tsx` | 86   | `X`                 | `bold`          | `duotone` |
| 7   | `BookingPagePreview.tsx`    | 74   | `Phone`             | `fill`          | `duotone` |
| 8   | `BookingPagePreview.tsx`    | 80   | `MapPin`            | `fill`          | `duotone` |
| 9   | `OperationalPageClient.tsx` | 537  | `CaretRight`        | `bold`          | `duotone` |
| 10  | `BundleForm.tsx`            | ~205 | `Check`             | `bold`          | `duotone` |
| 11  | `QuestionForm.tsx`          | ~171 | `Plus`              | `bold`          | `duotone` |

Semua 11 instances ini adalah satu jenis fix yang seragam: ganti `weight="bold"` dan `weight="fill"` ke `weight="duotone"`.

**Catatan khusus:** `SettingsDangerZone` menggunakan `Warning weight="fill"` di header danger zone untuk penekanan visual. Ini adalah pilihan intentional yang bisa dipertahankan (`fill` untuk icon status danger adalah precedent yang valid). Tim bisa memutuskan, tapi secara sistem harusnya konsisten.

---

### POST-MERGE

---

#### [PM-01] `PenggunaController.deleteUser` — Dead code di interface

**File:** `hooks/settings/usePenggunaController.ts`

`deleteUser` didefinisikan di `PenggunaController` interface dan diimplementasikan di hook, tapi tidak pernah dipanggil dari `PenggunaPageClient`. `buildActions()` tidak pernah menggunakan `ctrl.deleteUser`. Hapus dari interface atau buat UI trigger-nya.

---

#### [PM-02] `BankAccount.isActive` — Field tanpa UI

**File:** `types/booking-app.types.ts`, `BookingAppPageClient.tsx`

`BankAccount.isActive` ada di interface dan selalu `true` saat create/edit. Tidak ada toggle per-rekening di halaman. Field ini orphan sampai ada kebutuhan nyata. Tidak memblokir merge — data modelnya sudah benar untuk future use.

---

#### [PM-03] `auditLog` tidak dikonsumsi di UI

**File:** `hooks/settings/useBookingAppController.ts`

`auditLog: AuditLogEntry[]` dikembalikan controller tapi tidak ada komponen yang menampilkannya. In-memory, hilang saat refresh. Acceptable Phase 1 — tapi interface yang diekspor ke luar jadi membingungkan karena memberi kesan ada audit log UI.

---

#### [PM-04] `TeamPageClient` double-instantiate `useServicesController`

**File:** `components/team/TeamPageClient.tsx`

`TeamPageClient` memanggil `useServicesController()` untuk mengambil `services` dan `categories`. Jika `ServicesPageClient` juga aktif di tree yang sama (tidak mungkin di routing saat ini, tapi possible future), ada dua independent mock state untuk services. Solusinya adalah React Context atau props injection di Phase 2.

---

#### [PM-05] `draftConfirmationMode` — Stale state risk di Phase 2

**File:** `components/booking-app/BookingAppPageClient.tsx:62`

```tsx
const [draftConfirmationMode, setDraftConfirmationMode] = useState(
  ctrl.settings.confirmationMode,
);
```

Nilai initial hanya diambil saat mount. Jika `ctrl.settings.confirmationMode` berubah dari luar (server update di Phase 2), draft tidak mengikuti. `openConfirmationSheet()` sudah melakukan reset yang benar, tapi initial render state bisa stale. Tidak masalah untuk Phase 1 mock.

---

## Recommended Actions

**Prioritas 1 — Selesaikan dalam satu PR:**

1. Fix `SettingsSideSheet.tsx:28` — `p-4` → `p-s16` (1 line)
2. Fix `BookingAppPageClient` toast timer — tambah `useRef` (5 lines)
3. Fix `BookingAppPageClient` header typography — `text-ts-sub` → `text-ts-t3`, `p` → `h2` (3 lines)
4. Fix `PenggunaPageClient:141` — tambah Space key handler (1 line)
5. Fix `PenggunaPageClient:519` — OWNER guard sebelum ROLE_RANK lookup (1 line)
6. Fix `SettingsIconPicker` — tambah `aria-label` (1 line)
7. Fix 11 icon weight violations — semua `weight="bold"/"fill"` → `weight="duotone"` (11 lines, satu pass)

Total effort: ~25 baris perubahan di 8 file.

---

## Final Verdict

```
DO NOT MERGE
```

Bukan karena ada yang akan crash. Tapi karena 15 items di atas adalah standar minimum yang sudah ditetapkan sendiri oleh project (design system rules, icon system, accessibility). Merge sebelum ini bersih berarti melanjutkan pola yang salah ke PR berikutnya.

Setelah 15 items diselesaikan: **SAFE TO MERGE**.

Estimasi waktu perbaikan: 60-90 menit untuk satu engineer yang familiar dengan codebase.
