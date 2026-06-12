# Booking App — Component Minimization Review

**Tanggal:** 2026-06-12
**Berdasarkan:** `BOOKING_APP_IA_V3.md` + `BOOKING_APP_PRE_IMPLEMENTATION_REVIEW.md`
**Metode:** Reuse first. Extend second. Create last.

---

## Hasil

|                                            | Jumlah |
| ------------------------------------------ | ------ |
| **Komponen yang direncanakan (wireframe)** | 7      |
| **Komponen yang akan dibuat**              | **4**  |
| **File yang diperluas**                    | 1      |
| **Komponen yang dieliminasi**              | 3      |

---

## Original Plan vs Final Decision

| Komponen (rencana awal)   | Verdict          | Pengganti                                                                |
| ------------------------- | ---------------- | ------------------------------------------------------------------------ |
| `ToggleSwitch`            | ✅ **CREATE**    | — (genuinely new, tidak ada equivalent)                                  |
| `PaymentMethodToggle`     | ❌ **ELIMINATE** | Inline JSX di `BookingAppPageClient`                                     |
| `QrisUploadRow`           | ❌ **ELIMINATE** | `SettingsUploadField` variant `'qris'` di dalam `SettingsSideSheet`      |
| `BankAccountSheet`        | ❌ **ELIMINATE** | Inline JSX di `BookingAppPageClient` (pola dari `OperationalPageClient`) |
| `PolicyEditor`            | ❌ **ELIMINATE** | `SettingsTextarea` + `SettingsSideSheet` + inline state                  |
| `BookingAppPageClient`    | ✅ **CREATE**    | — (page client, wajib ada)                                               |
| `useBookingAppController` | ✅ **CREATE**    | — (domain controller, wajib ada)                                         |
| `booking-app.types.ts`    | ✅ **CREATE**    | — (type contract, wajib ada)                                             |

---

## Challenge Detail — Per Komponen

### PaymentMethodToggle — ELIMINATE

**Argumen wireframe:** Setiap metode pembayaran butuh komponen sendiri karena punya sub-row kondisional.

**Challenge:** Ada tiga payment method rows. Semuanya identik secara struktur (label + toggle). Sub-row (QRIS upload, rekening bank) berbeda per metode dan hanya ada dua dari tiga yang punya sub-row. Ini bukan pola yang cukup repetitif untuk diabstraksi.

**Bukti dari codebase:** `OperationalPageClient.tsx` membangun keempat policy rows sebagai inline JSX `map()` tanpa komponen terpisah. Strukturnya lebih repetitif dari payment method rows (empat baris identik vs tiga baris yang berbeda), tapi tetap inline.

**Keputusan:** Tiga rows dibangun sebagai inline JSX di `BookingAppPageClient`. Toggle state per metode dikelola di page client. Tidak ada abstraksi.

---

### QrisUploadRow — ELIMINATE

**Argumen wireframe:** QRIS butuh sub-row khusus dengan thumbnail preview, upload trigger, dan state "belum diunggah".

**Challenge:** `SettingsUploadField` sudah melakukan semua ini. Komponen tersebut:

- Menampilkan preview gambar jika `value` ada
- Menampilkan empty zone dengan hint jika `value` null
- Menangani file selection dan `onChange(file, previewUrl)` callback
- Menangani remove dengan `onRemove()` callback

Yang dibutuhkan adalah variant `'qris'` baru — penambahan satu entry di `VARIANT_CONFIG`. Sisanya sudah ada.

**Tambahan untuk QRIS:** QRIS change flow membutuhkan `ConfirmDialog` sebelum upload (dari IA V3). `ConfirmDialog` sudah ada. Logic confirm → upload dikelola di `BookingAppPageClient`. `SettingsUploadField` sendiri tidak perlu tahu tentang confirm step.

**Keputusan:** `SettingsUploadField` diperluas dengan variant `'qris'`. Tidak ada komponen baru.

---

### BankAccountSheet — ELIMINATE

**Argumen wireframe:** Form rekening bank (bank name select + nomor + nama pemilik) butuh SideSheet tersendiri.

**Challenge:** Ini adalah tiga field standar di dalam `SettingsSideSheet`. Pola yang identik sudah ada di:

- Holiday sheet di `OperationalPageClient` (date input + label input) — dibangun inline
- Staff form sheets di `TeamPageClient` — dibangun inline
- Semua sheet di Settings V2 menggunakan `SettingsSideSheet` + `SettingsFieldGroup` + `SettingsInput`/`SettingsSelect` inline

Tidak ada precedent di Settings V2 untuk mengekstrak sheet ke file komponen terpisah. Semua sheet dibangun inline di page client yang menggunakannya.

**Keputusan:** Bank account sheet dibangun inline di `BookingAppPageClient`. State draft (`draftBankName`, `draftAccountNumber`, `draftAccountHolder`) dikelola di page client seperti pola dari `OperationalPageClient`.

---

### PolicyEditor — ELIMINATE

**Argumen wireframe:** `salonPolicy` textarea butuh komponen editor tersendiri dengan character counter.

**Challenge:** `SettingsTextarea` sudah ada dan menerima semua `React.TextareaHTMLAttributes`. Character counter adalah satu baris state dan satu baris JSX. `SettingsSideSheet` membungkus semuanya.

Tidak ada logika yang cukup kompleks untuk dijadikan komponen terpisah. Ini adalah:

```
<SettingsSideSheet ...>
  <SettingsFieldGroup label="Kebijakan Salon" hint={`${draft.length}/500`}>
    <SettingsTextarea
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      maxLength={500}
      rows={6}
      placeholder="Tuliskan aturan yang perlu diketahui customer..."
    />
  </SettingsFieldGroup>
</SettingsSideSheet>
```

Tidak ada yang perlu diabstraksi.

**Keputusan:** Inline di `BookingAppPageClient`. Tidak ada komponen baru.

---

### ToggleSwitch — CREATE (satu-satunya komponen UI baru yang dibenarkan)

**Argumen:** Payment method toggles butuh binary on/off toggle. `SegmentedControl` adalah tab-switcher (multi-option, mutually exclusive, visual pill), bukan toggle switch.

**Challenge balik:** Bisa pakai `SegmentedControl` dengan dua item ["Aktif", "Nonaktif"]?

**Jawaban:** Tidak. Semantik visual berbeda fundamental. `SegmentedControl` terlihat seperti dua tombol berdampingan. Toggle switch terlihat seperti saklar dengan thumb yang bergerak. Pengguna salah salon akan bingung kenapa "metode pembayaran" menggunakan komponen yang sama dengan tab navigasi.

**Mengapa tidak bisa pakai native `<input type="checkbox">`?** Bisa, tapi style-nya tidak konsisten dengan design system. `accent-tx-primary` styling (dipakai di `WeeklyScheduleSection`) menghasilkan checkbox standar OS, bukan toggle switch.

**Mengapa tidak dalam-settings saja?** Toggle switch akan dibutuhkan di luar Booking App:

- Staff active/inactive — Tim
- Service active/inactive — Layanan
- Promo active/inactive — Phase 2
- Per-service deposit required — Phase 2

Ini adalah general UI primitive. Letaknya di `shared/components/ui/`, bukan di `settings/components/shared/`.

**Interface yang dibutuhkan:**

```typescript
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string; // jika tidak ada visible label di luar
  id?: string;
  className?: string;
}
```

Visual spec (tidak diimplementasi di sini):

- OFF: `bg-bd-card` track, thumb `bg-bg-card`
- ON: `bg-tx-primary` track, thumb `bg-bg-card`
- Animasi thumb: `transition-transform duration-150`
- Dimensi: track `w-s40 h-s20`, thumb `w-s16 h-s16` (atau sesuai token yang tersedia)
- Disabled: `opacity-50 cursor-not-allowed`

---

## Files to Create

### 1. `apps/owner/src/shared/components/ui/toggle-switch/ToggleSwitch.tsx`

General UI primitive. Binary on/off toggle dengan thumb animation.
Diekspor dari `shared/components/ui/` (belum ada barrel export di sana — cek apakah perlu update).

---

### 2. `apps/owner/src/features/dashboard/components/settings/types/booking-app.types.ts`

Type contract dari IA V3. Isi:

- `type PaymentMethod`
- `type ConfirmationMode`
- `interface BankAccount`
- `interface AuditLogEntry`
- `interface BookingAppSettings`
- `const DEFAULT_BOOKING_APP_SETTINGS`

Pola: identik dengan `operational.types.ts` yang sudah ada.

---

### 3. `apps/owner/src/features/dashboard/hooks/settings/useBookingAppController.ts`

Mock in-memory controller. Interface stabil untuk Phase 2.

```typescript
export interface BookingAppController {
  settings: BookingAppSettings;
  setPaymentMethod: (method: PaymentMethod, active: boolean) => void;
  setQrisImageUrl: (url: string | null) => void;
  addBankAccount: (account: Omit<BankAccount, "id">) => void;
  updateBankAccount: (
    id: string,
    patch: Partial<Omit<BankAccount, "id">>,
  ) => void;
  removeBankAccount: (id: string) => void;
  setConfirmationMode: (mode: ConfirmationMode) => void;
  setSalonPolicy: (text: string | null) => void;
  auditLog: AuditLogEntry[]; // in-memory Phase 1, DB Phase 2
}
```

Permission check di setiap mutasi QRIS dan rekening: `if (currentUser.role !== 'OWNER') throw`.

---

### 4. `apps/owner/src/features/dashboard/components/settings/components/booking-app/BookingAppPageClient.tsx`

Page client utama. Mengorkestrasikan semua section, sheet, dan dialog. Pola: identik dengan `OperationalPageClient.tsx`.

`SheetState` union untuk semua sheet yang mungkin:

```typescript
type SheetState =
  | { kind: "qris" }
  | { kind: "qris-confirm-replace" }
  | { kind: "add-bank" }
  | { kind: "edit-bank"; id: string }
  | { kind: "confirmation" }
  | { kind: "policy" }
  | null;
```

Semua sub-section (payment rows, bank list, confirmation row, policy row) dibangun inline — tidak ada sub-komponen terpisah.

---

## Files to Extend

### `apps/owner/src/features/dashboard/components/settings/components/shared/SettingsUploadField.tsx`

**Perubahan:** Tambah variant `'qris'` ke `UploadVariant` type dan `VARIANT_CONFIG`.

```typescript
// UploadVariant: tambah 'qris'
export type UploadVariant = 'logo' | 'cover' | 'avatar' | 'addon' | 'qris';

// VARIANT_CONFIG: tambah entry
qris: {
  label: 'Foto QRIS',
  aspectClass: 'aspect-square',
  maxBytes: 5_242_152,   // 5MB
  hint: 'PNG atau JPG, maks 5MB. Pastikan kode QR terlihat jelas.',
},
```

Tidak ada perubahan lain di file ini. Semua logic upload, preview, remove sudah ada.

---

## Files to Update (Wiring)

### `apps/owner/src/app/dashboard/settings/booking/page.tsx`

Ganti placeholder dengan:

```tsx
import { BookingAppPageClient } from "@/features/dashboard/components/settings/components/booking-app/BookingAppPageClient";
export default function BookingPage() {
  return <BookingAppPageClient />;
}
```

---

## Komponen Settings V2 yang Digunakan Tanpa Perubahan

| Komponen                | Digunakan untuk                                                   |
| ----------------------- | ----------------------------------------------------------------- |
| `SettingsPageShell`     | Wrapper halaman                                                   |
| `SettingsSectionHeader` | Header Section A, B, C                                            |
| `SettingsSection`       | Wrapper tiap section                                              |
| `SettingsContentCard`   | Card tiap section                                                 |
| `SettingsSideSheet`     | QRIS sheet, add/edit bank sheet, confirmation sheet, policy sheet |
| `SettingsFieldGroup`    | Wrapper label+input di dalam setiap sheet                         |
| `SettingsInput`         | Account number, account holder name                               |
| `SettingsSelect`        | Bank name, confirmation mode select (jika pakai select)           |
| `SettingsTextarea`      | `salonPolicy` textarea                                            |
| `SettingsUploadField`   | Upload foto QRIS (variant `'qris'` — setelah extension)           |
| `ConfirmDialog`         | Confirm dialog sebelum ganti/hapus QRIS                           |
| `EntityActionMenu`      | Aksi per bank account row (edit, hapus)                           |

---

## Komponen yang Tidak Dipakai dari Settings V2

| Komponen                                | Alasan                                                           |
| --------------------------------------- | ---------------------------------------------------------------- |
| `SettingsSubNav` / `SettingsTabbedCard` | Tidak ada tab — tiga section cukup flat                          |
| `SettingsAddButton`                     | Digunakan untuk bank account "Tambah Rekening" — **ya, dipakai** |
| `TimeInputInline`                       | Tidak ada time input                                             |
| `SettingsEmptyState`                    | Untuk empty bank accounts list — **ya, dipakai**                 |
| `SettingsIconPicker`                    | Tidak relevan                                                    |
| `SettingsDangerZone`                    | Tidak ada zona bahaya di domain ini                              |
| `SettingsPreviewPanel`                  | Tidak ada preview panel                                          |

Koreksi: `SettingsAddButton` dan `SettingsEmptyState` masuk daftar dipakai.

---

## Ringkasan

```
CREATE (4 files)
  shared/components/ui/toggle-switch/ToggleSwitch.tsx     ← UI primitive baru
  settings/types/booking-app.types.ts                     ← type contract
  settings/hooks/useBookingAppController.ts               ← domain controller
  settings/components/booking-app/BookingAppPageClient.tsx ← page client

EXTEND (1 file)
  settings/components/shared/SettingsUploadField.tsx      ← tambah variant 'qris'

UPDATE (1 file)
  app/dashboard/settings/booking/page.tsx                 ← wire ke BookingAppPageClient

ELIMINATED FROM PLAN (3 components)
  PaymentMethodToggle   → inline JSX di BookingAppPageClient
  QrisUploadRow         → SettingsUploadField variant 'qris' + SettingsSideSheet
  BankAccountSheet      → inline JSX di BookingAppPageClient
  PolicyEditor          → SettingsTextarea + SettingsSideSheet + inline state
```

---

## Catatan Sebelum Implementasi

Satu hal yang belum diputuskan dari IA V3 tetap terbuka dan tidak memblokir implementasi Phase 1:

**`salonPolicy` — collapsible atau required checkbox di StepConfirm?**
Phase 1: tampilkan sebagai collapsible. `BookingAppPageClient` hanya perlu menyimpan string. Cara customer app menampilkannya adalah concern customer app di Phase 2.
