# Operasional Page - Full Audit

**Tanggal audit:** 2026-06-11
**Status halaman:** Stub (belum diimplementasi)
**Prioritas implementasi:** Phase 5.6

---

## 1. Arsitektur Saat Ini

### Halaman (`app/dashboard/settings/operasional/page.tsx`)

```tsx
// 22 baris - hanya placeholder
export default function OperasionalPage() {
  return (
    <SettingsPageShell>
      <ComingSoonPlaceholder title="Operasional" />
    </SettingsPageShell>
  );
}
```

Tidak ada fitur fungsional. Tidak ada feature folder `operasional/`.

---

## 2. Domain Model Saat Ini

### Yang Ada

Domain `operasional` **belum ada** sebagai konsep terpisah. Setting terkait operasional tersebar di beberapa tempat:

| Domain                        | Lokasi                                               | Format                                              |
| ----------------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| Jadwal staf per hari          | `useTeamController.ts` + `WeeklyScheduleSection.tsx` | In-memory mock (`StaffSchedule`, `DaySchedule`)     |
| Jam buka salon                | `server/trpc/routers/business-hours.ts`              | Supabase table `business_hours` (read-only stub)    |
| Jadwal staf berbasis Supabase | `server/trpc/routers/stylist-schedules.ts`           | Supabase table `stylist_schedules` (read-only stub) |
| Durasi layanan                | `packages/mock-data` + customer `booking.types.ts`   | Field `duration: number` (menit) pada `Service`     |
| Kebijakan booking             | Tidak ada                                            | Belum ada sama sekali                               |

### Tipe yang Perlu Dibuat

```typescript
// Belum ada - perlu dibuat untuk domain Operasional
interface BusinessHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Minggu
  isOpen: boolean;
  openTime: string; // "HH:mm"
  closeTime: string; // "HH:mm"
}

interface BreakTime {
  startTime: string;
  endTime: string;
  label: string; // "Istirahat Siang", dll
}

interface BookingPolicy {
  slotDurationMinutes: 15 | 30 | 45 | 60;
  advanceBookingDays: number;
  cancellationWindowHours: number;
  allowWalkIn: boolean;
  requireDeposit: boolean;
  depositAmountPercent?: number;
}

interface SpecialClosingDate {
  date: string; // ISO date
  label: string; // "Lebaran", "Tahun Baru", dll
}
```

---

## 3. Controller dan State Management

### Lokasi Logika Jadwal Saat Ini

**`useTeamController.ts`** (238 baris)

- Mengelola `TeamDomain` yang berisi staf + jadwal staf
- `StaffSchedule` berisi `weeklySchedule: DaySchedule[]` (7 hari)
- `DaySchedule` berisi `{ dayName, isWorking, startTime, endTime }`
- Semua in-memory mock, tidak tersambung ke Supabase

**`WeeklyScheduleSection.tsx`** (336 baris)

- UI editor jadwal mingguan **per staf**
- Berada di halaman Tim (`/settings/tim`), bukan Operasional
- Logika: toggle hari kerja, set jam mulai/selesai per staf

### Masalah Penempatan

Jadwal staf ada di **Tim**, sedangkan jam buka salon seharusnya ada di **Operasional**. Keduanya saat ini tidak terhubung secara konseptual atau teknis.

### Controller yang Diperlukan untuk Operasional

```typescript
// Perlu dibuat: useOperasionalController.ts
interface OperasionalController {
  businessHours: BusinessHours[];
  bookingPolicy: BookingPolicy;
  specialClosingDates: SpecialClosingDate[];

  updateBusinessHours: (day: number, patch: Partial<BusinessHours>) => void;
  updateBookingPolicy: (patch: Partial<BookingPolicy>) => void;
  addSpecialClosingDate: (date: SpecialClosingDate) => void;
  removeSpecialClosingDate: (date: string) => void;
}
```

---

## 4. Dependency ke Booking App (Customer)

### Tabel Supabase yang Digunakan Customer

Customer app di `apps/customer` memanggil:

```typescript
// apps/customer/src/hooks/useBusinessHours.ts
trpc.businessHours.getBySalon({ salonId });

// apps/customer/src/server/trpc/routers/business-hours.ts
// Query: SELECT * FROM business_hours WHERE salon_id = ?
```

**Masalah kritis:** Customer mengambil jam buka dari Supabase `business_hours`, namun owner **tidak memiliki UI untuk menulis ke tabel ini**. Artinya tabel ini kosong atau berisi data hardcode yang tidak bisa diubah owner.

### Dampak Fungsional

| Customer Feature         | Tergantung pada              | Status                   |
| ------------------------ | ---------------------------- | ------------------------ |
| Tampilkan jam buka salon | `business_hours` Supabase    | Owner tidak bisa update  |
| Validasi slot booking    | `business_hours` (jam buka)  | Tidak terhubung ke owner |
| Ketersediaan stylist     | `stylist_schedules` Supabase | Owner tidak bisa update  |
| Kalkulasi end time       | `Service.duration` (menit)   | Tersambung via mock data |

---

## 5. Dependency ke Tim (Jadwal Staf)

### Tumpang Tindih Konseptual

Halaman Tim (`/settings/tim`) menyimpan jadwal kerja **per staf** (hari aktif, jam mulai/selesai). Halaman Operasional seharusnya menyimpan jam buka **salon** (bukan per staf).

Namun dalam praktiknya keduanya saling mempengaruhi:

- Staf hanya bisa melayani dalam jam buka salon
- Slot booking dibatasi oleh jam buka + jam kerja staf
- Tidak ada validasi silang antara keduanya saat ini

### Tipe Jadwal Staf (ada di `team.types.ts`)

```typescript
interface DaySchedule {
  dayName: string;
  isWorking: boolean;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

interface StaffSchedule {
  staffId: string;
  weeklySchedule: DaySchedule[];
}
```

Data ini **in-memory** dan tidak ditulis ke `stylist_schedules` di Supabase.

---

## 6. Dependency ke Layanan (Durasi)

### Di Owner App

Tipe `Service` di packages mock-data memiliki field `duration` (menit), tapi tidak ada UI di owner dashboard untuk mengubahnya selain via form layanan di halaman Layanan.

### Di Customer App

```typescript
// apps/customer/src/lib/time-utils.ts
export function calculateEndTime(
  timeSlot: TimeSlot,
  durationMinutes: number,
): string;

// apps/customer/src/features/booking/types/booking.types.ts
duration: z.number(); // field pada Service schema
```

Customer menghitung `endTime = startTime + duration`. Jika duration diubah di owner app (dalam mock), customer tidak otomatis ikut berubah karena keduanya berjalan dari mock data yang berbeda.

---

## 7. Komponen UI yang Sudah Ada (Reusable)

Dari Settings V2 foundation, komponen berikut **sudah ada** dan bisa langsung dipakai:

| Komponen                | Path                    | Kegunaan                 |
| ----------------------- | ----------------------- | ------------------------ |
| `SettingsPageShell`     | `shared/components/ui/` | Wrapper halaman          |
| `SettingsSectionHeader` | `shared/components/ui/` | Header tiap section      |
| `SettingsFieldGroup`    | `shared/components/ui/` | Group input dengan label |
| `SettingsInput`         | `shared/components/ui/` | Input teks/angka         |
| `SettingsSelect`        | `shared/components/ui/` | Dropdown pilihan         |
| `SettingsToggle`        | `shared/components/ui/` | On/off toggle            |
| `SettingsEmptyState`    | `shared/components/ui/` | Empty state              |
| `ConfirmDialog`         | `shared/components/ui/` | Dialog konfirmasi        |
| `SettingsSideSheet`     | `shared/components/ui/` | Side sheet edit          |

Komponen yang **perlu dibuat baru**:

- `TimeRangePicker` - pilih jam mulai & selesai (reuse dari `WeeklyScheduleSection` logic)
- `WeekdayToggleGrid` - toggle 7 hari + time range per hari (extract dari `WeeklyScheduleSection`)
- `SpecialDateList` - list tanggal tutup khusus + add/remove

---

## 8. Design System Violations

### Di `useTeamController.ts` / MOCK_STAFF

```typescript
// VIOLATION: hardcoded hex string di mock data
avatarColor: '#ddedf8',  // seharusnya pakai avatarColor() dari shared/lib/avatar
avatarColor: '#fde8dc',
avatarColor: '#e8e2f8',
```

**Catatan:** Field `avatarColor` pada `StaffMember` adalah hex string yang dipakai di `style={{ background: avatarColor }}`. Pola `avatarColor()` dari `shared/lib/avatar` sudah dipakai di Pengguna & Akses dan merupakan satu-satunya penggunaan inline style yang diizinkan.

### Di `WeeklyScheduleSection.tsx`

- Input time (`<input type="time">`) menggunakan class Tailwind campuran tanpa token spacing yang konsisten
- Tidak ada `SettingsInput` wrapper - menggunakan `<input>` native langsung
- Border radius menggunakan `rounded` bukan token `rounded-r*`

### Di `StaffPicker` (komponen di Tim)

- Menggunakan `document.addEventListener('mousedown', ...)` untuk close-on-outside-click
- Pola ini tidak konsisten dengan cara komponen lain menangani dismiss (biasanya via portal/overlay)
- Seharusnya menggunakan `useClickOutside` hook atau `onBlur`

---

## 9. UX Problems

### 9.1 Jam Buka Tidak Bisa Diubah Owner

Tidak ada UI. Owner tidak tahu jam buka salon yang dilihat customer. Ini adalah **bug fungsional**: customer bisa mencoba booking di luar jam buka yang sebenarnya.

### 9.2 Jadwal Staf Terpisah dari Jam Buka Salon

Owner bisa set staf bekerja jam 07:00-09:00 tapi salon tutup jam 09:00. Tidak ada validasi. Booking bisa jatuh di slot yang tidak valid.

### 9.3 Durasi Slot Tidak Bisa Dikonfigurasi

Slot booking customer hardcode di `SESSION_TIMES` (09:00, 10:30, 12:00, dst). Tidak ada UI untuk mengubah interval slot. Owner tidak bisa mengatur misalnya slot per 15 menit vs per 30 menit.

### 9.4 Tidak Ada Tanggal Tutup Khusus

Tidak ada cara untuk menutup salon pada tanggal tertentu (hari raya, renovasi, dll). Customer bisa booking saat salon tutup.

### 9.5 Kebijakan Booking Tidak Bisa Diatur

Tidak ada UI untuk:

- Batas hari pemesanan ke depan (misal: max 30 hari)
- Window pembatalan (misal: minimal 2 jam sebelum)
- Deposit / uang muka
- Apakah walk-in diterima

---

## 10. Scalability Problems

### 10.1 Tiga Sistem Jadwal yang Saling Bertentangan

```
Sistem 1: useTeamController (in-memory mock)
  - Sumber: MOCK_STAFF di useTeamController.ts
  - Format: DaySchedule[] per staf
  - Ditulis ke: tidak kemana-mana

Sistem 2: Supabase stylist_schedules (owner side - stub)
  - Sumber: apps/owner/src/server/trpc/routers/stylist-schedules.ts
  - Format: baris tabel Supabase
  - Dibaca: tidak ada yang membaca dari sisi owner

Sistem 3: Supabase business_hours (customer side - live)
  - Sumber: apps/customer/src/server/trpc/routers/business-hours.ts
  - Format: baris tabel Supabase
  - Ditulis ke: tidak ada yang menulis (owner tidak punya UI)
```

Saat migrasi ke Supabase, ketiganya harus dikonsolidasi.

### 10.2 Mock Data Tidak Sinkron Antara Apps

`apps/customer/src/features/booking/hooks/use-mock-data.ts` memiliki daftar staf dan layanan yang hardcode terpisah dari `packages/mock-data`. Jika owner menambah staf atau layanan, customer tidak otomatis ikut.

### 10.3 Tidak Ada `parseMinutes` Validation

Di `WeeklyScheduleSection.tsx`, input time diparse manual:

```typescript
// Tidak ada validasi - bisa NaN
const [h, m] = value.split(":").map(Number);
const minutes = h * 60 + m;
```

Jika user memasukkan nilai kosong atau format salah, hasil `NaN` tidak ditangani dan akan tersimpan ke state tanpa error.

### 10.4 Tidak Ada Source of Truth untuk Slot Duration

Durasi slot (`15`, `30`, `45`, `60` menit) tidak ada di config salon. Hardcode di `SESSION_TIMES` constants customer app. Untuk multi-salon atau salon dengan durasi layanan berbeda, ini tidak scalable.

---

## Rekomendasi Information Architecture

### Setting yang Termasuk Halaman Operasional

```
/settings/operasional
  ├── Jam Buka Salon
  │   ├── Toggle per hari (Senin-Minggu)
  │   ├── Jam buka - Jam tutup per hari
  │   └── Hari libur rutin (misal: setiap Minggu tutup)
  │
  ├── Tanggal Tutup Khusus
  │   ├── List tanggal + label
  │   └── Add / remove
  │
  ├── Pengaturan Booking
  │   ├── Durasi slot (15/30/45/60 menit)
  │   ├── Booking maksimal (X hari ke depan)
  │   ├── Batas pembatalan (X jam sebelum)
  │   └── Terima walk-in (toggle)
  │
  └── Kebijakan Deposit (opsional, Phase 2)
      ├── Wajib deposit (toggle)
      └── Persentase deposit
```

### Setting yang TETAP di Tim

```
/settings/tim
  └── Jadwal Kerja Staf
      ├── Per staf: hari aktif + jam kerja
      └── (validasi: tidak boleh di luar jam buka salon)
```

### Urutan Implementasi yang Disarankan

1. **Buat domain types** (`BusinessHours`, `BookingPolicy`, `SpecialClosingDate`)
2. **Buat `useOperasionalController`** dengan mock data
3. **Buat UI jam buka** (WeekdayToggleGrid + TimeRangePicker)
4. **Buat UI booking policy** (SettingsSelect + SettingsToggle)
5. **Buat UI tanggal tutup** (list + side sheet add)
6. **Sambungkan ke tRPC** (`business-hours` router, write mutations)
7. **Validasi silang** jadwal staf vs jam buka salon di `useTeamController`
