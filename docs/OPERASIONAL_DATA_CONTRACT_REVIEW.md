# Operasional - Data Contract Review

**Tanggal:** 2026-06-12
**Scope:** Validasi domain model sebelum controller atau UI ditulis.
**Sumber ground-truth:**

- `packages/database/verify-schema.ts` — Supabase schema aktual
- `apps/customer/src/features/booking/lib/date-utils.ts` — konvensi hari customer
- `apps/customer/src/features/booking/lib/validation.ts` — logika validasi tanggal
- `apps/customer/src/features/booking/constants/booking.constants.ts` — konstanta hardcode

---

## Temuan Kritis Sebelum Review Per-Field

Tiga masalah ditemukan saat membandingkan IA document dengan kode aktual.
Ketiganya harus diselesaikan sebelum implementasi dimulai.

### Temuan 1: `isOpen` vs `isClosed` — Mismatch dengan Supabase

IA document mengusulkan field `isOpen: boolean`. Namun `verify-schema.ts`
menunjukkan field aktual di Supabase adalah `isClosed`:

```typescript
// verify-schema.ts (baris 101-106) — ground truth
if (h.isClosed) {
  console.log(`  • ${day}: CLOSED`);
} else {
  console.log(`  • ${day}: ${h.openTime} - ${h.closeTime}`);
}
```

Ini berarti kolom Supabase adalah `is_closed`, bukan `is_open`.
Jika TypeScript type menggunakan `isOpen` tapi Supabase column adalah `is_closed`,
semua query dan mutation akan salah.

**Keputusan:** Gunakan `isClosed: boolean` agar konsisten dengan Supabase schema.
Di UI, balik logika: checkbox "Buka" = `!isClosed`. Ini adalah konversi trivial
di render, bukan di domain.

### Temuan 2: `dayOfWeek` Convention — Komentar IA Salah

IA document menulis: `type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Minggu, ISO 8601 day`

Komentar "ISO 8601" ini salah. ISO 8601 mendefinisikan 1=Senin sampai 7=Minggu.

Konvensi yang benar — yang dipakai di seluruh codebase — adalah JavaScript
`Date.prototype.getDay()`: **0=Minggu, 1=Senin, ..., 6=Sabtu**.

Bukti dari tiga sumber independent:

```typescript
// customer/lib/date-utils.ts
dayOfWeek: getDay(date),         // date-fns getDay = JS convention, 0=Sunday

// customer/lib/validation.ts
const dayOfWeek = date.getDay(); // native JS, 0=Sunday
if (closedDays.includes(dayOfWeek)) ...

// packages/database/verify-schema.ts
const dayNames = ["Sunday", "Monday", "Tuesday", ...]; // index 0 = Sunday
hours.forEach((h) => {
  const day = dayNames[h.dayOfWeek] // h.dayOfWeek=0 → "Sunday"
})
```

**Keputusan:** `DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6` dengan **0=Minggu (JS
`Date.getDay()` convention)**. Hapus komentar "ISO 8601" dari type definition
— itu akan menyesatkan implementer.

### Temuan 3: Booking App Tidak Menggunakan `business_hours` Supabase

Customer booking flow (`app/book/[slug]/_steps/`) menggunakan konstanta hardcode:

```typescript
// booking.constants.ts
export const CLOSED_DAYS = [1] as const; // Senin tutup — HARDCODE

// CalendarView.tsx
disabledDays = [1]; // default prop — HARDCODE
```

`useBusinessHours` memang ada, tapi hanya dipakai di `BookingForm.tsx` — sebuah
form lama yang tidak dipakai di main booking flow (`/book/[slug]`). Main booking
flow tidak membaca `business_hours` dari Supabase sama sekali.

Ini berarti: bahkan ketika owner menulis data ke `business_hours` melalui
halaman Operasional, customer app di main flow tidak akan membacanya.

**Keputusan:** Ini adalah gap Phase 2 yang harus dicatat secara eksplisit
dalam contract. Owner app bisa selesai lebih dulu, tapi integrasi end-to-end
baru terjadi saat customer app diupdate untuk membaca `business_hours` live.

---

## A. Required Types

### `DayOfWeek`

```typescript
/**
 * Day of week index using JavaScript Date.getDay() convention.
 * 0 = Minggu, 1 = Senin, 2 = Selasa, 3 = Rabu,
 * 4 = Kamis, 5 = Jumat, 6 = Sabtu
 * Konsisten dengan Supabase business_hours.day_of_week
 * dan customer app date-utils.ts / validation.ts
 */
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
```

**Kenapa ada:** Tanpa tipe eksplisit, `number` bisa menerima 7, 8, 99.
Literal union memaksa validitas di compile time.

**Siapa yang tulis:** Owner app menulis via `updateBusinessHoursDay(dayOfWeek, patch)`.
**Siapa yang baca:** Customer app membaca sebagai `h.dayOfWeek` dari Supabase.
**Apa yang rusak jika salah:** Hari Senin (1) dan Minggu (0) tertukar. Calendar
customer menampilkan hari yang salah sebagai tutup.

---

### `BusinessHoursDay`

```typescript
interface BusinessHoursDay {
  dayOfWeek: DayOfWeek;

  /**
   * Menggunakan isClosed (bukan isOpen) agar konsisten dengan
   * kolom Supabase: business_hours.is_closed
   */
  isClosed: boolean;

  /**
   * "HH:mm" format (24-jam). NULL hanya ketika isClosed = true.
   * Tidak di-nullable saat isClosed berubah false — nilai terakhir
   * dipertahankan agar UI dapat me-restore jam sebelumnya jika owner
   * mengaktifkan kembali hari yang sempat ditutup.
   */
  openTime: string | null;
  closeTime: string | null;
}
```

**Validasi field per field:**

`dayOfWeek`

- Kenapa ada: Primary key per hari. Tidak ada insert/delete, hanya update.
- Siapa yang tulis: Owner app. Nilainya fixed (0-6), tidak pernah berubah.
- Siapa yang baca: Customer app — untuk menentukan hari mana yang tutup.
- Apa yang rusak: Semua. Tanpa dayOfWeek tidak ada cara mengidentifikasi baris.

`isClosed`

- Kenapa ada: Flag utama yang dibaca customer untuk memblokir tanggal.
- Siapa yang tulis: Owner via checkbox toggle di BusinessHoursGrid.
- Siapa yang baca: Customer app `validateDateNotClosed()` → `closedDays.includes(dayOfWeek)`.
- Apa yang rusak: Customer bisa booking di hari salon tutup, atau sebaliknya.

`openTime` / `closeTime`

- Kenapa ada: Menentukan jam buka. Digunakan untuk slot generation di Phase 2.
  Saat ini belum ada slot generation di owner app — nilai ini tersimpan ke
  Supabase untuk dipakai booking engine di masa depan.
- Siapa yang tulis: Owner via time input di BusinessHoursGrid.
- Siapa yang baca: Saat ini belum dibaca oleh customer app main flow.
  Akan dibaca saat slot generation dipindah dari hardcode ke dynamic.
- Apa yang rusak jika null saat `isClosed=false`: Runtime error saat customer
  app mencoba parse jam buka. Guard: jangan simpan ke Supabase jika `isClosed=false`
  tapi `openTime` null.

**Format `openTime`/`closeTime`:**

Owner UI menggunakan `<input type="time">` yang menghasilkan string `"HH:mm"`
(misalnya `"09:00"`). Supabase `TIME` column menyimpan dalam format `"HH:MM:SS"`.
Ketika membaca dari Supabase, nilainya mungkin `"09:00:00"`. Owner UI harus
handle kedua format: parse `"09:00:00"` menjadi `"09:00"` saat load dari Supabase.

**Aturan null:**

```
isClosed = false → openTime WAJIB diisi, closeTime WAJIB diisi
isClosed = true  → openTime BOLEH null (pertahankan nilai jika ada)
```

Jangan set `openTime = null` saat `isClosed` diubah ke `true`.
Retain nilai yang ada agar bisa dipakai kembali jika diaktifkan.

---

### `BusinessHours` (domain aggregate)

```typescript
/**
 * Selalu berisi tepat 7 entri (satu per hari).
 * Tidak ada insert/delete — hanya upsert per hari.
 * Index 0 = Minggu, index 6 = Sabtu (sesuai DayOfWeek convention).
 */
type BusinessHours = [
  BusinessHoursDay, // Minggu
  BusinessHoursDay, // Senin
  BusinessHoursDay, // Selasa
  BusinessHoursDay, // Rabu
  BusinessHoursDay, // Kamis
  BusinessHoursDay, // Jumat
  BusinessHoursDay, // Sabtu
];
```

Menggunakan tuple (bukan array) untuk memaksa panjang 7 di compile time.
Urutan tuple = urutan DayOfWeek (0=Minggu di index 0).

Alternatif `Record<DayOfWeek, BusinessHoursDay>` juga valid dan mungkin lebih
ekspresif untuk lookup by day, tapi tuple lebih natural untuk iterasi di UI.

**Keputusan:** Gunakan `BusinessHoursDay[]` biasa (bukan tuple) di controller
karena Supabase akan mengembalikan array dari query. Gunakan tuple hanya jika
ada kebutuhan strict compile-time enforcement yang konkret.

---

### `SpecialClosingDate`

```typescript
interface SpecialClosingDate {
  /**
   * UUID. Dibuat oleh controller saat add, bukan oleh UI.
   * Dipakai sebagai key untuk remove.
   */
  id: string;

  /**
   * "YYYY-MM-DD" format. TIDAK boleh menyimpan datetime atau timestamp.
   * Ketika parsing: selalu gunakan new Date(date + 'T00:00:00') untuk
   * menghindari timezone shift. Jangan gunakan new Date(date) karena
   * ISO date tanpa waktu di-parse sebagai UTC, bukan lokal.
   */
  date: string;

  /**
   * Label wajib diisi (non-empty string). Default nilai di form: "Hari Libur".
   * Tidak boleh disimpan sebagai string kosong.
   * Alasan: label kosong menciptakan data ambigu — owner tidak ingat kenapa
   * salon tutup pada tanggal tersebut.
   */
  label: string;
}
```

**Validasi field per field:**

`id`

- Kenapa ada: Identifier untuk operasi remove. Tanpa id, tidak bisa remove
  tanggal tertentu jika ada dua tanggal yang sama (edge case).
- Siapa yang tulis: Controller saat `addSpecialClosingDate()`. Gunakan `crypto.randomUUID()`.
- Siapa yang baca: Controller internal untuk `removeSpecialClosingDate(id)`.
- Apa yang rusak: Tanpa id, hapus by date index — tidak aman jika duplikat.

`date`

- Kenapa ada: Menentukan tanggal spesifik yang salon tutup.
- Siapa yang tulis: Owner via date input di side sheet.
- Siapa yang baca: Customer app untuk memblokir tanggal di kalender.
  Controller untuk kalkulasi "berikutnya".
- Apa yang rusak jika format salah: Customer app parse gagal, tanggal tidak
  terblokir. Validasi: regex `^\\d{4}-\\d{2}-\\d{2}$` sebelum simpan.

`label`

- Kenapa ada: Owner perlu tahu konteks setiap penutupan.
- Siapa yang tulis: Owner via text input.
- Siapa yang baca: Owner di list view. Tidak dibaca customer app.
- Apa yang rusak jika kosong: UI menampilkan row tanpa keterangan, owner
  tidak ingat alasannya setahun kemudian. Bukan bug teknis, tapi data quality.

**Timezone rule (penting):**

```typescript
// BENAR - tidak timezone-sensitive
new Date(date + "T00:00:00");

// SALAH - ISO date tanpa waktu di-parse sebagai UTC
// di timezone GMT+7 ini menjadi 07:00 tanggal sebelumnya
new Date(date);
```

`customer/lib/validation.ts` baris 28 menggunakan `new Date(isoDate)` tanpa
`T00:00:00` — ini adalah bug latent yang akan muncul saat live data tersambung.
Catat sebagai technical debt di customer app. Owner app HARUS menggunakan
pola `+ 'T00:00:00'` konsisten.

---

### `BookingPolicy`

```typescript
interface BookingPolicy {
  /**
   * Interval antar slot yang ditawarkan ke customer (menit).
   * Enum terbatas — bukan arbitrary number.
   * Default: 30 (paling umum untuk salon menengah).
   */
  slotIntervalMinutes: SlotIntervalMinutes;

  /**
   * Minimum jam sebelum waktu layanan dimana booking masih diterima.
   * Range: 0-24. 0 = tidak ada minimum (booking boleh last-minute).
   * Default: 2.
   * Unit: jam (bukan menit) karena granularitas yang relevan untuk salon.
   */
  leadTimeHours: number;

  /**
   * Maksimum hari ke depan yang bisa dipesan customer.
   * Range: 1-90. Tidak boleh 0 (artinya tidak ada booking yang bisa dibuat).
   * Default: 30.
   */
  advanceBookingDays: number;

  /**
   * Batas jam sebelum layanan dimana customer masih boleh membatalkan.
   * Range: 0-48. 0 = boleh cancel kapan saja sampai waktu layanan.
   * Default: 2.
   */
  cancellationWindowHours: number;
}
```

**Validasi field per field:**

`slotIntervalMinutes`

- Kenapa ada: Menentukan granularitas slot di kalender booking customer.
  30 menit = slot tersedia di 09:00, 09:30, 10:00, dst.
- Siapa yang tulis: Owner via dropdown.
- Siapa yang baca: Customer app slot generator. SAAT INI belum dibaca —
  `SESSION_TIMES` masih hardcode di `booking.constants.ts`. Gap ini harus
  diselesaikan di Phase 2.
- Apa yang rusak: Tidak ada yang rusak Phase 1. Di Phase 2: jika slot generator
  tidak membaca nilai ini, setting ini menjadi dead data.

`leadTimeHours`

- Kenapa ada: Mencegah booking last-minute yang tidak bisa dilayani.
- Siapa yang tulis: Owner via dropdown.
- Siapa yang baca: Customer app saat customer memilih slot waktu —
  slot yang kurang dari `leadTimeHours` jam ke depan harus di-disable.
  SAAT INI belum diimplementasikan di customer app.
- Apa yang rusak: Customer bisa booking 5 menit sebelum jadwal.
- Constraint: `0 <= leadTimeHours <= 24`. Lebih dari 24 jam tidak masuk akal
  untuk salon (lebih tepat pakai `advanceBookingDays`).

`advanceBookingDays`

- Kenapa ada: Mencegah booking terlalu jauh ke depan yang tidak bisa diprediksi
  kapasitasnya (staf bisa berubah, salon mungkin tutup).
- Siapa yang tulis: Owner via dropdown.
- Siapa yang baca: Customer app — disable tanggal yang lebih dari X hari ke depan.
  SAAT INI belum diimplementasikan.
- Apa yang rusak: Customer bisa booking setahun ke depan.
- Constraint: `1 <= advanceBookingDays <= 90`. Minimum 1 (harus bisa booking
  setidaknya besok). 90 hari adalah batas atas yang masuk akal.

`cancellationWindowHours`

- Kenapa ada: Memberikan salon waktu untuk mengisi slot yang dibatalkan.
- Siapa yang tulis: Owner via dropdown.
- Siapa yang baca: Customer app di cancellation flow. SAAT INI belum ada
  cancellation flow di customer app — ini adalah gap Phase 2.
- Apa yang rusak: Customer bisa cancel 1 menit sebelum jadwal.
- Constraint: `0 <= cancellationWindowHours <= 48`.

---

### `OperasionalDomain`

```typescript
interface OperasionalDomain {
  /**
   * Tepat 7 entri. Diurutkan by dayOfWeek ascending (0=Minggu pertama).
   * Konsisten dengan Supabase ORDER BY day_of_week ASC.
   */
  businessHours: BusinessHoursDay[];

  /**
   * Diurutkan ascending by date saat ditampilkan ke UI.
   * Pengurutan dilakukan di controller/selector, bukan di type.
   */
  specialClosingDates: SpecialClosingDate[];

  bookingPolicy: BookingPolicy;
}
```

---

## B. Required Enums

### `SlotIntervalMinutes`

```typescript
type SlotIntervalMinutes = 15 | 30 | 45 | 60;
```

Menggunakan literal union, bukan `enum`. Alasan: nilai langsung dipakai sebagai
angka (bukan sebagai label string), literal union lebih natural untuk tipe numerik,
dan konsisten dengan pola `AccessRole`, `InvitableRole` di codebase ini.

Nilai 15 disertakan meski mungkin terlalu granular untuk salon kecil karena:
beberapa layanan (fringe trim, beard trim) memang 15-20 menit, dan owner yang
setup salon modern mungkin ingin densitas booking tinggi.

Nilai di atas 60 tidak dimasukkan. Layanan yang durasi 90+ menit (balayage,
keratin) tidak mengubah slot interval — slot tetap bisa per 30 menit, booking
hanya akan memakan 3 slot sekaligus.

### `DayOfWeek` (lihat bagian A)

```typescript
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Minggu ... 6=Sabtu (JS convention)
```

Tidak ada enum lain yang diperlukan untuk domain ini. `leadTimeHours`,
`advanceBookingDays`, `cancellationWindowHours` tidak direpresentasikan sebagai
enum karena nilainya disajikan sebagai pilihan dropdown di UI, bukan sebagai
konstanta yang dipakai di logika aplikasi.

---

## C. Ownership Matrix

| Data                           | Domain Owner | Writer (Phase 1)   | Reader (Phase 1) | Writer (Phase 2) | Reader (Phase 2)      |
| ------------------------------ | ------------ | ------------------ | ---------------- | ---------------- | --------------------- |
| `business_hours.day_of_week`   | Operasional  | Mock controller    | Owner UI         | tRPC mutation    | Customer app (live)   |
| `business_hours.is_closed`     | Operasional  | Mock controller    | Owner UI         | tRPC mutation    | Customer app (live)   |
| `business_hours.open_time`     | Operasional  | Mock controller    | Owner UI         | tRPC mutation    | Booking engine        |
| `business_hours.close_time`    | Operasional  | Mock controller    | Owner UI         | tRPC mutation    | Booking engine        |
| `special_closing_dates.*`      | Operasional  | Mock controller    | Owner UI         | tRPC mutation    | Customer calendar     |
| `booking_policy.slot_interval` | Operasional  | Mock controller    | Owner UI         | tRPC mutation    | Slot generator        |
| `booking_policy.lead_time`     | Operasional  | Mock controller    | Owner UI         | tRPC mutation    | Slot validator        |
| `booking_policy.advance_days`  | Operasional  | Mock controller    | Owner UI         | tRPC mutation    | Date picker           |
| `booking_policy.cancel_window` | Operasional  | Mock controller    | Owner UI         | tRPC mutation    | Cancel flow           |
| `stylist_schedules.*`          | Team         | Tim controller     | Tim UI           | Tim tRPC         | Customer availability |
| `services.duration`            | Services     | Layanan controller | Layanan UI       | Layanan tRPC     | End time calc         |

**Tidak ada overlap ownership.** Operasional tidak menulis ke `stylist_schedules`
atau `services`. Team domain tidak menulis ke `business_hours`.

---

## D. Booking App Dependencies

"Booking App" di sini merujuk ke logic yang memproses booking — saat ini ada
di customer app dan (masa depan) di owner app.

### Dependency Langsung (Phase 2)

| Operasional Field             | Booking Logic yang Tergantung   | Lokasi Saat Ini              |
| ----------------------------- | ------------------------------- | ---------------------------- |
| `businessHours[n].isClosed`   | Blokir tanggal di kalender      | `CLOSED_DAYS = [1]` hardcode |
| `businessHours[n].openTime`   | Batas awal slot generation      | Tidak ada (slots hardcode)   |
| `businessHours[n].closeTime`  | Batas akhir slot generation     | Tidak ada (slots hardcode)   |
| `slotIntervalMinutes`         | Granularitas slot di picker     | `SESSION_TIMES` hardcode     |
| `leadTimeHours`               | Disable slot yang terlalu dekat | Tidak ada validasi           |
| `advanceBookingDays`          | Disable tanggal terlalu jauh    | Tidak ada validasi           |
| `cancellationWindowHours`     | Blokir pembatalan terlambat     | Tidak ada cancel flow        |
| `specialClosingDates[*].date` | Blokir tanggal spesifik         | Tidak ada                    |

### Dependency pada `services.duration` (bukan milik Operasional)

Customer app menghitung `endTime = startTime + service.duration`. Jika
`slotIntervalMinutes = 30` tapi layanan durasi 45 menit, booking akan tumpang
tindih dengan slot berikutnya. Resolusi konflik ini adalah tanggung jawab
booking engine, bukan domain Operasional.

### Gap Kritis Phase 1 → Phase 2

```
SAAT INI (Phase 1):
  Customer CalendarView.tsx:
    disabledDays = [1]  ← HARDCODE, tidak baca Supabase

  Customer booking.constants.ts:
    CLOSED_DAYS = [1]   ← HARDCODE

  Customer SESSION_TIMES:
    { PAGI: ['09:00', '10:30'], SIANG: [...], SORE: [...] }  ← HARDCODE

SETELAH PHASE 2:
  Semua hardcode di atas harus diganti dengan data live dari:
    - business_hours (via useBusinessHours)
    - booking_policy (via useBookingPolicy — belum ada)
```

Tanpa update customer app di Phase 2, semua data yang owner simpan ke
`business_hours` melalui halaman Operasional tidak akan berpengaruh ke
pengalaman customer.

---

## E. Customer App Dependencies

Customer app membaca dari Supabase melalui dua router:

### `businessHours.getBySalon` (owner + customer)

```typescript
// Kedua router identik — select * dari business_hours where salon_id = ?
// Owner router: apps/owner/src/server/trpc/routers/business-hours.ts
// Customer router: apps/customer/src/server/trpc/routers/business-hours.ts
```

Response shape yang diexpect customer app (dari `verify-schema.ts`):

```typescript
{
  salonId: string;
  dayOfWeek: number; // 0-6
  isClosed: boolean;
  openTime: string | null; // "HH:MM:SS" format dari Postgres
  closeTime: string | null;
}
```

**Penting:** Customer app saat ini menggunakan `hours` yang dikembalikan
`useBusinessHours` tapi hanya di `BookingForm.tsx` (form lama). Main booking
flow di `app/book/[slug]/_steps/` **tidak memanggil useBusinessHours sama sekali**.

Ini artinya bahkan jika `business_hours` Supabase terisi, customer booking
flow tidak berubah sampai main flow diupdate untuk menggunakan data live.

### `stylistSchedules.getByStylest` (owner only, typo pada nama procedure)

```typescript
// apps/owner/src/server/trpc/routers/stylist-schedules.ts
// Nama procedure ada typo: "getByStylest" (harusnya getByStyleist)
// Response: rows dari stylist_schedules where stylist_id = ? AND is_available = true
```

Halaman Tim (bukan Operasional) yang bertanggung jawab menulis ke tabel ini.
Operasional tidak punya dependency ke tabel ini.

### Shape Response Perlu Normalisasi

Ketika owner app membaca `business_hours` dari Supabase untuk mengisi
`OperasionalDomain`, ada dua normalisasi yang perlu dilakukan:

1. **Time format:** Postgres `TIME` column mengembalikan `"09:00:00"` bukan `"09:00"`.
   Saat load ke controller: `openTime.slice(0, 5)` untuk trim seconds.

2. **Missing rows:** Jika Supabase belum memiliki entri untuk semua 7 hari
   (tabel kosong atau partial), controller harus generate default 7 hari dengan
   `isClosed: false` dan jam default, bukan crash.

---

## F. Future Migration Considerations

### `booking_policy` — Tabel Baru yang Perlu Dibuat

Saat ini tidak ada tabel `booking_policy` di Supabase (tidak muncul di
`verify-schema.ts`). Untuk Phase 2, perlu migration:

```sql
-- Supabase migration (naming convention: snake_case)
CREATE TABLE booking_policies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id      UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  slot_interval_minutes   SMALLINT NOT NULL DEFAULT 30
                          CHECK (slot_interval_minutes IN (15, 30, 45, 60)),
  lead_time_hours         SMALLINT NOT NULL DEFAULT 2
                          CHECK (lead_time_hours BETWEEN 0 AND 24),
  advance_booking_days    SMALLINT NOT NULL DEFAULT 30
                          CHECK (advance_booking_days BETWEEN 1 AND 90),
  cancellation_window_hours SMALLINT NOT NULL DEFAULT 2
                          CHECK (cancellation_window_hours BETWEEN 0 AND 48),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (salon_id)  -- satu policy per salon
);
```

Constraint `UNIQUE (salon_id)` memastikan tidak ada duplikasi. Operasi
dari owner app adalah upsert, bukan insert.

### `special_closing_dates` — Tabel Baru yang Perlu Dibuat

```sql
CREATE TABLE special_closing_dates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id   UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  label      TEXT NOT NULL DEFAULT 'Hari Libur' CHECK (label <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (salon_id, date)  -- satu entri per tanggal per salon
);

CREATE INDEX ON special_closing_dates (salon_id, date);
```

Constraint `UNIQUE (salon_id, date)` mencegah duplikat tanggal. Controller
harus menangani unique constraint violation dengan pesan error user-friendly:
"Tanggal ini sudah ditambahkan."

### `business_hours` — Kolom Yang Mungkin Belum Lengkap

`verify-schema.ts` menunjukkan `h.isClosed`, `h.openTime`, `h.closeTime`,
`h.dayOfWeek`, `h.salonId`. Jika tabel ini sudah ada di Supabase tapi belum
memiliki semua kolom ini, owner app tRPC mutations perlu upsert semua field.

Rekomendasikan menambahkan column `updated_at` ke `business_hours` untuk
audit trail:

```sql
ALTER TABLE business_hours ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
```

### Automasi (Phase 2) — Tidak Perlu Tabel Baru Dulu

Setting automasi (reminder H-1, H-hari, konfirmasi otomatis) akan menjadi
field tambahan di `booking_policies` atau tabel terpisah `notification_settings`.
Keputusan ini defer ke Phase 2 karena bergantung pada infrastruktur notifikasi
(WhatsApp/Email) yang belum ada.

### Dari Mock ke Supabase — Tidak Butuh Refactor Shape

Controller Phase 1 menggunakan `OperasionalDomain` interface yang sama dengan
yang akan dibaca dari Supabase. Perubahan di Phase 2:

- `useOperasionalController` load awal: dari seed data → dari tRPC query
- Setiap mutation: update local state → optimistic update + tRPC mutation

Shape data tidak berubah antara Phase 1 dan Phase 2. Ini adalah property
penting yang harus dijaga saat implementasi Phase 1.

---

## Ringkasan: Perubahan dari IA Document

| Item                       | IA Document                  | Contract Final                 | Alasan                                |
| -------------------------- | ---------------------------- | ------------------------------ | ------------------------------------- |
| `isOpen`                   | `isOpen: boolean`            | `isClosed: boolean`            | Konsisten dengan Supabase `is_closed` |
| `DayOfWeek` komentar       | "ISO 8601"                   | "JS Date.getDay()"             | ISO 8601 = 1-7, JS = 0-6              |
| `label`                    | `string` (implisit opsional) | `string` wajib non-empty       | Data quality                          |
| `openTime` saat tutup      | `null`                       | Retain last value              | UX: toggle balik tidak reset jam      |
| `BusinessHours` type       | `BusinessHoursDay[]`         | `BusinessHoursDay[]` (7 items) | Array biasa, enforce 7 di runtime     |
| `slotIntervalMinutes`      | `15 \| 30 \| 45 \| 60`       | Sama                           | Valid                                 |
| `leadTimeHours` range      | Tidak dispesifikasi          | `0-24`                         | Constrain valid range                 |
| `advanceBookingDays` range | Tidak dispesifikasi          | `1-90`                         | Minimum 1, maximum 90                 |

Setelah review ini, tidak ada blocker. Dua tabel baru (`booking_policies`,
`special_closing_dates`) dan normalisasi time format adalah hal yang harus
diingat saat Phase 2, bukan halangan Phase 1.
