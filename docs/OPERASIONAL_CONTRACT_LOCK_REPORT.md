# Operasional - Contract Lock Report

**Tanggal:** 2026-06-12
**Status:** LOCKED. Implementasi boleh dimulai.
**File canonical:**
`apps/owner/src/features/dashboard/components/settings/types/operational.types.ts`

---

## Contract Rule

Semua kode yang menyentuh domain Operasional harus mengimpor dari file ini:

```typescript
import type {
  DayOfWeek,
  SlotIntervalMinutes,
  BusinessHoursDay,
  SpecialClosingDate,
  BookingPolicy,
  OperationalSettings,
} from "@/features/dashboard/components/settings/types/operational.types";
```

Tidak ada definisi tipe duplikat yang diizinkan — di controller, komponen,
tRPC router, atau file apapun. Jika ada tipe baru yang dibutuhkan untuk domain
Operasional, tambahkan ke `operational.types.ts`, bukan di tempat lain.

---

## A. Final Types

### `DayOfWeek`

```typescript
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
```

0 = Minggu, 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu.

Menggunakan konvensi JavaScript `Date.prototype.getDay()`. Tidak mengacu ISO 8601.
Konsisten dengan customer app (`date-utils.ts`, `validation.ts`) dan Supabase
column `business_hours.day_of_week`.

Konstanta pendukung yang juga diekspor:

```typescript
DAY_LABELS: Record<DayOfWeek, string>      // { 0: 'Minggu', 1: 'Senin', ... }
WEEK_DAYS_ORDERED: DayOfWeek[]             // [1, 2, 3, 4, 5, 6, 0]  — Senin pertama
```

`WEEK_DAYS_ORDERED` dipakai oleh `BusinessHoursGrid` untuk render hari dalam
urutan Senin–Minggu (konvensi kalender Indonesia), meskipun data tersimpan
dengan Minggu=0 di Supabase.

---

### `SlotIntervalMinutes`

```typescript
type SlotIntervalMinutes = 15 | 30 | 45 | 60;
```

Literal union, bukan enum. Nilai langsung dipakai sebagai angka.
Default: 30. Diekspor terpisah karena dipakai sebagai tipe untuk
field dropdown di `BookingPolicy`.

---

### `BusinessHoursDay`

```typescript
interface BusinessHoursDay {
  dayOfWeek: DayOfWeek;
  isClosed: boolean;
  openTime: string | null; // "HH:mm"
  closeTime: string | null; // "HH:mm"
}
```

**Keputusan desain:**

- Menggunakan `isClosed` (bukan `isOpen`) untuk match dengan Supabase column
  `is_closed` secara exact. UI BusinessHoursGrid membalik logika: checkbox
  "Buka" = `!isClosed`.

- `openTime`/`closeTime` dipertahankan (tidak di-null) saat `isClosed` diubah
  ke `true`. Ini memungkinkan owner mengaktifkan kembali hari tanpa harus
  mengisi ulang jam.

- Format `"HH:mm"` untuk konsistensi dengan `<input type="time">`. Saat membaca
  dari Supabase, `"HH:MM:SS"` dinormalisasi ke `"HH:mm"` via `.slice(0, 5)`.

---

### `SpecialClosingDate`

```typescript
interface SpecialClosingDate {
  id: string; // UUID, dibuat oleh controller
  date: string; // "YYYY-MM-DD"
  label: string; // non-empty, default "Hari Libur"
}
```

**Keputusan desain:**

- `id` dibuat oleh controller (`crypto.randomUUID()`), bukan oleh UI. Dipakai
  sebagai key untuk operasi remove.

- `date` dalam format `"YYYY-MM-DD"`. Aturan parsing wajib: selalu gunakan
  `new Date(date + 'T00:00:00')`, tidak boleh `new Date(date)`. ISO date
  tanpa waktu di-parse sebagai UTC oleh JS, yang menyebabkan date shift
  sebesar offset timezone lokal.

- `label` wajib diisi (non-empty string). Form menggunakan default "Hari Libur"
  agar tidak ada entry tanpa keterangan.

---

### `BookingPolicy`

```typescript
interface BookingPolicy {
  slotIntervalMinutes: SlotIntervalMinutes; // default: 30
  leadTimeHours: number; // 0–24, default: 2
  advanceBookingDays: number; // 1–90, default: 30
  cancellationWindowHours: number; // 0–48, default: 2
}
```

**Range constraint per field:**

| Field                     | Min | Max | Default | Alasan batas                                      |
| ------------------------- | --- | --- | ------- | ------------------------------------------------- |
| `slotIntervalMinutes`     | 15  | 60  | 30      | Enum terbatas, tidak perlu range                  |
| `leadTimeHours`           | 0   | 24  | 2       | Lebih dari 24 jam = pakai advanceBookingDays      |
| `advanceBookingDays`      | 1   | 90  | 30      | Min 1: harus bisa booking besok. Max 90: ~3 bulan |
| `cancellationWindowHours` | 0   | 48  | 2       | 0 = cancel bebas. Max 48 = 2 hari                 |

Constraint ini tidak di-enforce di level TypeScript (karena `number` tidak
bisa dibatasi range), tapi harus di-enforce di:

- Controller: validasi sebelum update state
- Supabase schema: `CHECK` constraint (lihat bagian F)

---

### `OperationalSettings`

```typescript
interface OperationalSettings {
  businessHours: BusinessHoursDay[];
  specialClosingDates: SpecialClosingDate[];
  bookingPolicy: BookingPolicy;
}
```

Top-level aggregate. Ini adalah tipe yang di-hold oleh `useOperasionalController`.

`businessHours` selalu berisi tepat 7 item, satu per `DayOfWeek`. Tidak ada
insert atau delete — hanya upsert per hari. Urutan: `dayOfWeek` ascending
(0=Minggu di index 0), konsisten dengan `ORDER BY day_of_week ASC` di Supabase.

`specialClosingDates` panjangnya variabel. Pengurutan ascending by date
adalah tanggung jawab controller/selector, bukan type.

`bookingPolicy` adalah satu flat object (satu record per salon di Supabase,
bukan array).

---

### Default Values (diekspor)

```typescript
DEFAULT_BUSINESS_HOURS: BusinessHoursDay[]   // 7 hari, Minggu tutup
DEFAULT_BOOKING_POLICY: BookingPolicy        // semua nilai reasonable defaults
```

Digunakan oleh controller Phase 1 sebagai seed data, dan sebagai fallback
saat Supabase mengembalikan hasil kosong (salon belum setup operasional).

---

## B. Final Enums

Semua tipe di domain Operasional menggunakan **literal union**, bukan TypeScript
`enum`. Alasan konsisten dengan seluruh codebase (lihat `AccessRole`,
`InvitableRole`, `ServiceFlow` di types lain).

| Type                  | Values                | Purpose                   |
| --------------------- | --------------------- | ------------------------- |
| `DayOfWeek`           | `0\|1\|2\|3\|4\|5\|6` | Index hari, JS convention |
| `SlotIntervalMinutes` | `15\|30\|45\|60`      | Granularitas slot booking |

Tidak ada enum lain. `leadTimeHours`, `advanceBookingDays`, `cancellationWindowHours`
bukan enum karena nilainya tidak dipakai sebagai konstanta dalam logika —
hanya sebagai angka yang dipilih owner dari dropdown.

---

## C. Database Alignment

### Tabel yang Sudah Ada

**`business_hours`** — sudah ada di Supabase

| Supabase Column | TypeScript Field | Type                           |
| --------------- | ---------------- | ------------------------------ |
| `salon_id`      | (di tRPC layer)  | UUID                           |
| `day_of_week`   | `dayOfWeek`      | INTEGER 0–6                    |
| `is_closed`     | `isClosed`       | BOOLEAN                        |
| `open_time`     | `openTime`       | TIME → normalize `.slice(0,5)` |
| `close_time`    | `closeTime`      | TIME → normalize `.slice(0,5)` |

Catatan: Supabase `TIME` column mengembalikan `"HH:MM:SS"`. Controller harus
normalize ke `"HH:mm"` saat load. Saat write: Postgres menerima `"HH:mm"`.

### Tabel yang Belum Ada (Phase 2)

**`special_closing_dates`** — perlu dibuat

```sql
CREATE TABLE special_closing_dates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id   UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  label      TEXT NOT NULL DEFAULT 'Hari Libur' CHECK (label <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (salon_id, date)
);
CREATE INDEX ON special_closing_dates (salon_id, date);
```

**`booking_policies`** — perlu dibuat

```sql
CREATE TABLE booking_policies (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id                  UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  slot_interval_minutes     SMALLINT NOT NULL DEFAULT 30
                            CHECK (slot_interval_minutes IN (15, 30, 45, 60)),
  lead_time_hours           SMALLINT NOT NULL DEFAULT 2
                            CHECK (lead_time_hours BETWEEN 0 AND 24),
  advance_booking_days      SMALLINT NOT NULL DEFAULT 30
                            CHECK (advance_booking_days BETWEEN 1 AND 90),
  cancellation_window_hours SMALLINT NOT NULL DEFAULT 2
                            CHECK (cancellation_window_hours BETWEEN 0 AND 48),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (salon_id)
);
```

---

## D. Future Migration Considerations

### Phase 1 → Phase 2: Shape Tidak Berubah

`OperationalSettings` yang digunakan controller Phase 1 (mock) adalah
shape yang sama persis yang akan dibaca dari Supabase di Phase 2.
Ini adalah properti yang harus dijaga saat implementasi:

```
Phase 1: useOperasionalController
  load:   dari DEFAULT_BUSINESS_HOURS + DEFAULT_BOOKING_POLICY
  write:  update local state

Phase 2: useOperasionalController
  load:   dari tRPC query (business_hours + booking_policies)
  write:  optimistic update + tRPC mutation
```

Controller interface tidak berubah. Hanya implementasi internal yang berubah.

### Customer App: Tiga Hardcode yang Harus Dihapus di Phase 2

```typescript
// 1. booking.constants.ts
export const CLOSED_DAYS = [1] as const;
// → Ganti dengan: data dari business_hours Supabase via useBusinessHours

// 2. CalendarView.tsx
disabledDays = [1]  // default prop
// → Ganti dengan: derived dari businessHours.filter(d => d.isClosed).map(d => d.dayOfWeek)

// 3. SESSION_TIMES constant
export const SESSION_TIMES = { PAGI: ['09:00', '10:30'], ... }
// → Ganti dengan: slot generator yang membaca slotIntervalMinutes + openTime/closeTime
```

Ketiga perubahan ini adalah prerequisite agar setting Operasional benar-benar
mempengaruhi pengalaman customer. Tanpa ini, halaman Operasional adalah
dead write — data tersimpan tapi tidak dibaca.

### Timezone Rule — Wajib Diikuti di Semua Kode

```typescript
// BENAR — safe di semua timezone
new Date(isoDate + "T00:00:00");

// SALAH — ISO date tanpa waktu di-parse sebagai UTC
// Di GMT+7: "2026-08-17" → 2026-08-16T17:00:00 lokal
new Date(isoDate);
```

`customer/lib/validation.ts` baris 28 saat ini menggunakan pola yang salah.
Ini adalah known bug yang akan muncul saat data live tersambung.

### `special_closing_dates` — Unique Constraint Handling

Ketika owner mencoba menambahkan tanggal yang sudah ada, Supabase akan
melempar unique constraint violation. Controller Phase 2 harus menangani
ini sebagai user-friendly error:

```
"Tanggal ini sudah ditambahkan."
```

Bukan sebagai generic server error.

---

## Checklist Sebelum Commit Setiap File Operasional

- [ ] Semua tipe diimpor dari `operational.types.ts`
- [ ] Tidak ada `isOpen` — selalu `isClosed`
- [ ] Tidak ada `dayOfWeek = ISO` komentar
- [ ] Date parsing menggunakan `+ 'T00:00:00'`
- [ ] `label` tidak pernah disimpan sebagai string kosong
- [ ] `openTime`/`closeTime` dipertahankan saat toggle `isClosed = true`
