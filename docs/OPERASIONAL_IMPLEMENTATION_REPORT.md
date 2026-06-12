# Operasional - Implementation Report

**Tanggal:** 2026-06-12
**Status:** SELESAI. Build clean (tsc --noEmit: 0 error).

---

## Files Created / Modified

| File                                                                                                     | Status     | Deskripsi                                              |
| -------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------ |
| `apps/owner/src/features/dashboard/hooks/settings/useOperationalController.ts`                           | Baru       | Domain controller Phase 1 (mock in-memory)             |
| `apps/owner/src/features/dashboard/components/settings/components/operasional/OperationalPageClient.tsx` | Baru       | Full page client — semua 4 section                     |
| `apps/owner/src/app/dashboard/settings/operasional/page.tsx`                                             | Diperbarui | Ganti stub 22-baris dengan `<OperationalPageClient />` |

---

## Component Reuse Inventory

| Komponen                | Asal   | Section            |
| ----------------------- | ------ | ------------------ |
| `SettingsPageShell`     | layout | Wrapper            |
| `SettingsSection`       | layout | A, B, C, D         |
| `SettingsSectionHeader` | layout | A, B, C, D         |
| `SettingsContentCard`   | layout | A, C, D            |
| `SettingsSideSheet`     | layout | B (add/edit sheet) |
| `SettingsListCard`      | shared | B (tiap item)      |
| `SettingsEmptyState`    | shared | B (kosong)         |
| `SettingsAddButton`     | shared | B (header action)  |
| `SettingsFieldGroup`    | shared | B (sheet body)     |
| `SettingsInput`         | shared | B (sheet body)     |
| `SettingsSelect`        | shared | C (4 dropdown)     |
| `EntityActionMenu`      | shared | B (tiap item)      |
| `ConfirmDialog`         | shared | B (hapus)          |

**Total komponen shared reused: 13. Komponen baru: 0.**

---

## Inline Components (tidak di-export, tidak punya file sendiri)

Tidak ada. Semua yang sebelumnya direncanakan sebagai inline function component
(`BusinessHoursGrid`) ditulis langsung sebagai JSX di dalam render `OperationalPageClient`.
Pola `map(WEEK_DAYS_ORDERED)` cukup ringkas sehingga inline function tidak diperlukan.

---

## Design System Compliance

- Semua spacing menggunakan Tailwind token (`s8`, `s12`, `s16`, `s20`, `s24`, dll)
- Tidak ada inline `style={{}}`
- Tidak ada magic color hex
- `TIME_INPUT_CLASS` didefinisikan lokal, konsisten dengan `WeeklyScheduleSection.tsx`
- Header tabel Section A menggunakan `rounded-t-r12 bg-bg-header` sesuai pola `PenggunaPageClient`
- `SettingsContentCard padding="none" className="overflow-hidden"` untuk Section A dan C

---

## Data Contract Compliance

- Semua tipe diimpor dari `operational.types.ts` — tidak ada definisi duplikat
- `isClosed` digunakan konsisten — tidak ada `isOpen`
- `WEEK_DAYS_ORDERED = [1,2,3,4,5,6,0]` dipakai untuk render urutan hari
- `DAY_LABELS` dari canonical types untuk nama hari
- Date parsing: `new Date(isoDate + 'T00:00:00')` di `formatDisplayDate`
- `openTime`/`closeTime` dipertahankan saat `isClosed` toggle true (controller tidak null-kan)
- `label` default ke `'Hari Libur'` jika dikosongkan, tidak pernah disimpan sebagai string kosong
- `SlotIntervalMinutes` sebagai literal cast saat onChange, tidak `as any`

---

## Section Summary

### Section A: Jam Operasional

- Tabel 7 baris via `WEEK_DAYS_ORDERED`
- Checkbox "buka" = `!isClosed`, toggle auto-save + toast
- `<input type="time">` dengan `TIME_INPUT_CLASS`, disabled saat `isClosed = true`
- Durasi dihitung otomatis (`closeTime - openTime`), tampil `Tutup` saat hari tutup
- Header row: `rounded-t-r12 bg-bg-header` konsisten dengan halaman lain

### Section B: Hari Libur & Penutupan Khusus

- Summary strip: tampil hanya bila ada upcoming date — "Penutupan berikutnya: ..."
- List: `SettingsListCard` per item, sorted ascending by date
- Badge "Sudah Lewat" + `opacity-60` untuk past dates
- `EntityActionMenu` dengan Edit (buka sheet) dan Hapus (buka ConfirmDialog)
- `SettingsSideSheet` add/edit: date input + label input
- `ConfirmDialog` hapus dengan pesan spesifik (nama tanggal + label)
- `SettingsEmptyState` dengan `CalendarX` icon saat list kosong

### Section C: Aturan Booking

- 4 baris horizontal: label+deskripsi kiri, `SettingsSelect` kanan (w-44)
- Auto-save, toast copy menjelaskan dampak ke customer:
  - Slot: "Customer hanya bisa booking setiap N menit."
  - Lead time: "Customer harus booking minimal N jam sebelumnya."
  - Advance: "Customer hanya bisa booking hingga N hari ke depan."
  - Cancel: "Customer tidak bisa membatalkan dalam N jam sebelum jadwal."

### Section D: Otomasi

- Disabled placeholder dengan badge "Segera Hadir" di action slot `SettingsSectionHeader`
- Tidak ada toggle palsu, tidak ada form yang bisa diisi
- Teks deskriptif menjelaskan fitur yang akan datang

---

## Build Verification

```
cd apps/owner && npx tsc --noEmit
→ 0 errors (file-scoped ke domain operasional)
```

---

## Phase 2 Dependencies

Sebelum Phase 2 (Supabase integration), berikut yang harus dikerjakan:

### Owner Side

1. Buat tabel `special_closing_dates` (SQL ada di `OPERASIONAL_CONTRACT_LOCK_REPORT.md`)
2. Buat tabel `booking_policies` (SQL ada di `OPERASIONAL_CONTRACT_LOCK_REPORT.md`)
3. Buat tRPC router `operasional` dengan mutations:
   - `upsertBusinessHoursDay`
   - `addSpecialClosingDate` / `updateSpecialClosingDate` / `removeSpecialClosingDate`
   - `upsertBookingPolicy`
4. Ganti `useOperationalController` mock state dengan tRPC queries + optimistic updates

### Customer Side (agar settings benar-benar efektif)

1. `booking.constants.ts`: hapus `CLOSED_DAYS = [1]`, baca dari `business_hours`
2. `CalendarView.tsx`: hapus `disabledDays = [1]` default, derive dari `businessHours`
3. `SESSION_TIMES` constant: ganti dengan slot generator yang baca `slotIntervalMinutes` + `openTime`/`closeTime`

Tanpa perubahan customer side, halaman Operasional adalah dead write —
data tersimpan di Supabase tapi tidak dibaca oleh booking flow.
