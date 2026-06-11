# Settings V2 — Release Audit

**Tanggal:** 2026-06-11  
**Scope:** `apps/owner/src/features/dashboard/components/settings/`  
**Tujuan:** Pre-release health check — bukan perubahan kode.

---

## Ringkasan Eksekutif

Settings V2 dalam kondisi **baik untuk dilanjutkan ke Phase 2 (Supabase)**. Tidak ada orphan components, tidak ada duplicate types/controllers, tidak ada unused exports atau critical token violations. Semua temuan di bawah adalah WARNING atau INFO — tidak ada yang memblokir release.

| Kategori                       | Status                                     |
| ------------------------------ | ------------------------------------------ |
| Orphan components              | ✅ Bersih                                  |
| Dead files                     | ✅ Bersih                                  |
| Duplicate types                | ✅ Bersih                                  |
| Duplicate controllers          | ✅ Bersih                                  |
| Unused exports                 | ✅ Bersih                                  |
| Unused imports                 | ✅ Bersih                                  |
| Inline styles                  | ⚠️ 2 instance (data-driven, lihat detail)  |
| Hex colors                     | ⚠️ 2 lokasi (data values & avatar palette) |
| Hardcoded Tailwind (non-token) | ⚠️ 6 class (mostly sizing/blur)            |
| Design token violations        | ⚠️ 3 spacing class di layout components    |

---

## 1. Orphan Components & Dead Files

**Hasil:** Bersih.

Semua file di `settings/components/` dan `settings/layout/` digunakan. `SettingsTabbedCard` tersedia di layout tapi tidak dipakai oleh halaman operasional (pilihan disengaja — `SettingsSubNav` dipakai langsung karena `SettingsTabbedCard` memaksa padding yang merusak full-bleed rows). Export `SettingsSection` dan `SettingsContentCard` masih di-export tapi digunakan oleh halaman lain (profil, produk, dll).

---

## 2. Duplicate Types

**Hasil:** Bersih.

- `operational.types.ts` adalah single source of truth untuk domain operasional. Tidak ada duplikasi di file lain.
- `team.types.ts`, `services.types.ts`, `pengguna.types.ts` — masing-masing hanya didefinisikan di satu file.
- `WeeklyScheduleSection.tsx` memiliki konstanta lokal `DAY_LABELS` untuk tipe `WeekDay` dari `team.types.ts` — ini bukan duplikasi tipe, hanya label display yang tepat berada di komponen.

---

## 3. Duplicate Controllers

**Hasil:** Bersih.

Setiap domain hanya memiliki satu controller hook:

| Hook                       | Domain          |
| -------------------------- | --------------- |
| `useOperationalController` | Operasional     |
| `useTeamController`        | Tim & Jadwal    |
| `useServicesController`    | Layanan & Paket |
| `usePenggunaController`    | Pengguna        |
| `useProfilController`      | Profil Salon    |

Tidak ada controller ganda untuk domain yang sama.

---

## 4. Unused Exports

**Hasil:** Bersih.

Semua export di `shared/index.ts` dan `layout/index.ts` dikonsumsi oleh minimal satu halaman. `SettingsFormGrid` dipakai di form produk/paket. `SettingsPanel`/`SettingsPanelSection` dipakai di profil salon. `SettingsActionBar` dipakai di team page.

---

## 5. Unused Imports

**Hasil:** Bersih.

Tidak ada `import` yang dideteksi sebagai unused di file-file utama. TypeScript `--noEmit` bersih (0 error, berdasarkan run setelah date/time icon migration).

---

## 6. Inline Styles

### 6.1 `PenggunaPageClient.tsx` — line 149

```tsx
style={{ background: bg, color: avatarText, fontSize: initials.length > 1 ? '0.8125rem' : '1rem' }}
```

**Severity:** WARNING  
**Alasan diterima:** Nilai `background` dan `color` bersumber dari `avatarColor()` utility (`shared/lib/avatar.ts`) yang menghitung warna dinamis berdasarkan nama. Tidak bisa diganti Tailwind token karena nilainya runtime-computed. `fontSize` juga kondisional berdasarkan panjang inisial.  
**Rekomendasi untuk Phase 2:** Pertimbangkan memindahkan logika `fontSize` ke `text-ts-fn` / `text-ts-cap1` Tailwind class dengan kondisi, tapi `background`/`color` memang harus inline.

### 6.2 `StaffDirectorySection.tsx` — line ~200

```tsx
style={{ background: bg }}
```

**Severity:** WARNING  
**Alasan diterima:** Sama — nilai `bg` dari `AVATAR_PALETTE` runtime lookup berdasarkan nama staff. Tidak ada Tailwind equivalent untuk warna dinamis.

---

## 7. Hex Colors

### 7.1 `StaffDirectorySection.tsx` — `AVATAR_PALETTE` constant (~line 130)

```typescript
const AVATAR_PALETTE = ['#F2C4CE', '#C4E4F2', '#C4F2D0', ...];
```

**Severity:** WARNING  
**Konteks:** Data-driven palette untuk avatar background. Nilai ini tidak dipakai langsung sebagai Tailwind class — dipakai via `style={{ background: bg }}` (lihat 6.2). Ini adalah acceptable pattern untuk dynamic avatar coloring.

### 7.2 `CategoryForm.tsx` — color blob data (~line 14–19)

```typescript
const COLOR_OPTIONS = [
  { value: '#FF6B6B', label: 'Merah', tw: 'bg-red-400' },
  { value: '#4ECDC4', label: 'Teal', tw: 'bg-teal-400' },
  ...
];
```

**Severity:** INFO  
**Konteks:** `value` adalah data yang disimpan ke database (warna kategori). `tw` adalah Tailwind class untuk preview visual di UI. Hex disini adalah data value, bukan styling langsung — ini benar.

### 7.3 `services/types/services.types.ts` — komentar hex

**Severity:** INFO  
**Konteks:** Hex muncul di komentar dokumentasi, bukan sebagai nilai CSS. Tidak ada pengaruh runtime.

---

## 8. Hardcoded Tailwind (Non-Token Sizing)

### 8.1 Arbitrary width/min-width

| File                       | Class           | Line | Severity                                                     |
| -------------------------- | --------------- | ---- | ------------------------------------------------------------ |
| `SettingsPreviewPanel.tsx` | `lg:w-[380px]`  | 34   | INFO — fixed preview panel width, tidak ada token equivalent |
| `SettingsUploadField.tsx`  | `max-w-[140px]` | 126  | INFO — thumbnail max-width yang sangat spesifik              |
| `EntityActionMenu.tsx`     | `min-w-[140px]` | 54   | INFO — dropdown minimum width agar label tidak terpotong     |

**Rekomendasi:** Bisa dibiarkan — arbitrary sizing untuk layout-specific constraints adalah acceptable Tailwind pattern. Tidak perlu token baru.

### 8.2 Backdrop blur

| File                    | Class                 | Severity |
| ----------------------- | --------------------- | -------- |
| `SettingsSideSheet.tsx` | `backdrop-blur-[3px]` | INFO     |
| `ConfirmDialog.tsx`     | `backdrop-blur-[2px]` | INFO     |

**Konteks:** Nilai blur untuk overlay/scrim. Tidak ada token `blur-*` di design system. Acceptable sampai design system mendefinisikan blur tokens.

---

## 9. Design Token Violations (Spacing)

### 9.1 `SettingsSideSheet.tsx` — line 28

```tsx
<div className="... p-4 ...">
```

**Severity:** ⚠️ WARNING — harus `p-s16`  
**Penjelasan:** `p-4` adalah Tailwind default (16px), bukan design system token `p-s16`. Secara visual identik, tapi melanggar aturan "semua spacing pakai token".

### 9.2 `SettingsPageHeader.tsx` — line 13

```tsx
className = "... gap-1.5 ...";
```

**Severity:** INFO — tidak ada token `gap-s6` yang tepat, terdekat adalah `gap-s8` (8px) atau `gap-s4` (4px). `gap-1.5` = 6px.

### 9.3 `PenggunaPageClient.tsx` — line 157

```tsx
className = "... gap-0.5 ...";
```

**Severity:** INFO — `gap-0.5` = 2px. Tidak ada token untuk 2px gap. Gunakan `gap-s4` (4px) jika visual masih acceptable, atau tetapkan `s2` token.

### 9.4 `SettingsSideSheet.tsx` — close button

```tsx
className = "... h-8 w-8 ...";
```

**Severity:** INFO — `h-8 w-8` = 32px, tidak ada token `h-s32`/`w-s32`. Icon button sizing yang umum.

### 9.5 `SettingsPageHeader.tsx` — action buttons

```tsx
className = "... h-10 ...";
```

**Severity:** INFO — `h-10` = 40px button height, tidak ada token. Standard button height.

---

## 10. `font-bold` Usage

`font-bold` dipakai di beberapa heading dan label:

- `SettingsPageHeader.tsx` — `<h1>` title: `font-bold` ✅ sesuai
- `SettingsSectionHeader.tsx` — `<h2>`: `font-bold` ✅ sesuai
- `SettingsSideSheet.tsx` — sheet title: `font-bold` ✅ sesuai
- `ConfirmDialog.tsx` — dialog title: `font-bold` ✅ sesuai

**Hasil:** Semua penggunaan `font-bold` ada pada elemen heading/title — ini correct usage, bukan violation.

---

## 11. TIME_INPUT_CLASS Migration

**Status:** ✅ Fully Migrated (dikerjakan di sesi ini)

`TIME_INPUT_CLASS` yang sebelumnya diduplikasi di `WeeklyScheduleSection.tsx` dan `OperationalPageClient.tsx` sudah dihapus. Digantikan oleh `TimeInputInline` shared component di `settings/components/shared/TimeInputInline.tsx`.

---

## 12. Date/Time Icon Migration

**Status:** ✅ Selesai (lihat `docs/DATE_TIME_ICON_AUDIT.md`)

Semua native browser calendar/clock picker indicator sudah diganti dengan Phosphor Icons duotone via:

- `SettingsInput.tsx` auto-upgrade untuk `type="date"` dan `type="time"`
- `TimeInputInline.tsx` untuk compact time inputs

---

## Prioritas Perbaikan Sebelum Phase 2

### Wajib diperbaiki (WARNING)

1. **`SettingsSideSheet.tsx` line 28** — ganti `p-4` → `p-s16`

### Opsional (INFO)

2. `SettingsPageHeader.tsx` — `gap-1.5` → `gap-s4` atau `gap-s8`
3. `PenggunaPageClient.tsx` — `gap-0.5` → `gap-s4` (jika layout masih OK)
4. `SettingsSideSheet.tsx` — `h-8 w-8` → tunggu token `s32` didefinisikan

### Tidak perlu diubah

- Inline styles di avatar components (data-driven, tidak bisa di-tokenize)
- Hex di `AVATAR_PALETTE` dan `COLOR_OPTIONS` (data values)
- Arbitrary sizing di `SettingsPreviewPanel`, `SettingsUploadField`, `EntityActionMenu`
- Backdrop blur values (tunggu design system blur tokens)

---

## Kesimpulan

Settings V2 siap untuk Phase 2 dengan satu fix minor wajib (`p-4` → `p-s16` di SettingsSideSheet). Arsitektur bersih — tidak ada orphans, dead code, atau duplikasi. Semua pattern inline style yang tersisa memiliki justifikasi teknis yang valid.
