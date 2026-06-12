# Operasional - Information Architecture Design

**Tanggal:** 2026-06-12
**Berdasarkan:** `docs/OPERASIONAL_AUDIT.md`
**Prasyarat sebelum implementasi:** Dokumen ini harus di-review dan disetujui sebelum wireframe atau kode apapun dibuat.

---

## Section 1 — Domain Boundary

### Apa yang Menjadi Tanggung Jawab Halaman Operasional

Halaman Operasional adalah **konfigurasi level salon**, bukan level individu. Semua setting di sini berlaku untuk seluruh salon sebagai satu entitas, bukan untuk staf tertentu atau layanan tertentu.

Pertanyaan paling mudah untuk mengujinya:

> "Setting ini berlaku untuk satu orang, atau untuk seluruh salon?"

Jika jawabannya "seluruh salon" - masuk Operasional. Jika "satu orang" atau "satu layanan" - tidak masuk.

---

#### Masuk Operasional

| Setting                    | Alasan                                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Jam buka salon**         | Berlaku untuk semua staf dan semua layanan. Batas luar dari semua slot yang bisa dipesan customer.                                  |
| **Hari operasional**       | Mana hari salon buka secara umum. Setting salon, bukan setting staf.                                                                |
| **Hari tutup khusus**      | Penutupan karena renovasi, hari raya, atau kondisi luar biasa. Berlaku seluruh salon.                                               |
| **Slot interval booking**  | Seberapa rapat slot waktu yang ditawarkan ke customer (15/30/45/60 menit). Ini keputusan operasional salon, bukan property layanan. |
| **Lead time booking**      | Berapa jam minimum sebelum waktu layanan customer bisa booking. Aturan salon.                                                       |
| **Advance booking window** | Berapa hari ke depan customer bisa memesan. Aturan salon.                                                                           |
| **Aturan pembatalan**      | Batas waktu customer boleh membatalkan tanpa penalti. Kebijakan salon.                                                              |
| **Reminder notifikasi**    | Otomasi pengingat booking ke customer. Triggered oleh data booking, diatur di level salon.                                          |

---

#### Tidak Masuk Operasional

| Setting                       | Di mana seharusnya    | Alasan                                                                                                                       |
| ----------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Jadwal staf individual**    | Halaman Tim           | Spesifik per orang. Satu staf bisa punya hari libur berbeda, jam kerja berbeda. Bukan kebijakan salon.                       |
| **Penugasan layanan ke staf** | Halaman Tim / Layanan | Relasi many-to-many antara staf dan layanan. Bukan aturan waktu salon.                                                       |
| **Durasi layanan**            | Halaman Layanan       | Properti intrinsik layanan. Dipotong rambut pendek butuh 30 menit, bukan 60 - ini sifat layanannya, bukan operasional salon. |
| **Harga layanan**             | Halaman Layanan       | Jelas bukan operasional.                                                                                                     |
| **Profil dan biodata staf**   | Halaman Tim           | Data staf, bukan aturan operasional.                                                                                         |
| **Informasi bisnis**          | Halaman Profil Salon  | Nama, alamat, foto - identity, bukan operasional.                                                                            |

---

#### Kasus Batas: Slot Interval

Slot interval (15/30/45/60 menit) bisa diargumentasikan masuk ke Layanan karena mempengaruhi durasi. Namun keputusannya adalah: **masuk Operasional**, karena:

1. Satu salon biasanya punya satu granularitas slot yang berlaku untuk semua layanan.
2. Slot interval adalah keputusan kapasitas operasional (berapa banyak booking per hari), bukan keputusan tentang layanan itu sendiri.
3. Mengubah slot interval mempengaruhi semua layanan sekaligus - ini bukan setting per-layanan.

Jika di masa depan ada kebutuhan slot interval berbeda per layanan, itu menjadi override di level Layanan, tapi defaultnya tetap di Operasional.

---

## Section 2 — Source of Truth

### Tabel Source of Truth

| Data                                                        | Owner (Siapa yang punya) | Reader (Siapa yang baca)                                 | Writer (Siapa yang tulis)       |
| ----------------------------------------------------------- | ------------------------ | -------------------------------------------------------- | ------------------------------- |
| **Jam buka salon** (`business_hours`)                       | Operasional Domain       | Customer App, Tim (validasi silang)                      | Owner App - halaman Operasional |
| **Hari tutup khusus** (`special_closing_dates`)             | Operasional Domain       | Customer App                                             | Owner App - halaman Operasional |
| **Slot interval** (`booking_policy.slot_duration`)          | Operasional Domain       | Customer App                                             | Owner App - halaman Operasional |
| **Lead time booking** (`booking_policy.lead_time_hours`)    | Operasional Domain       | Customer App                                             | Owner App - halaman Operasional |
| **Advance booking window** (`booking_policy.advance_days`)  | Operasional Domain       | Customer App                                             | Owner App - halaman Operasional |
| **Aturan pembatalan** (`booking_policy.cancellation_hours`) | Operasional Domain       | Customer App                                             | Owner App - halaman Operasional |
| **Jadwal staf individual** (`stylist_schedules`)            | Team Domain              | Customer App (ketersediaan staf), Operasional (validasi) | Owner App - halaman Tim         |
| **Durasi layanan** (`services.duration`)                    | Services Domain          | Customer App (kalkulasi end time), Booking App           | Owner App - halaman Layanan     |
| **Profil staf** (`staff_members`)                           | Team Domain              | Customer App (stylist picker)                            | Owner App - halaman Tim         |
| **Data booking** (`bookings`)                               | Booking Domain           | Owner App (dashboard, riwayat), Reminder system          | Customer App, Owner App         |

---

### Catatan Penting per Data

**`business_hours`**

Saat ini tabel ini ada di Supabase dan sudah dibaca customer app, tapi tidak ada writer. Ini adalah **gap paling kritis** yang harus diselesaikan di Phase 1 implementasi. Sampai halaman Operasional selesai, tabel ini kosong atau berisi data stale.

**`stylist_schedules`**

Dibaca oleh customer app untuk menentukan staf mana yang tersedia pada slot tertentu. Saat ini datanya in-memory di `useTeamController`. Halaman Tim adalah writer-nya, tapi harus ditulis ke Supabase agar customer bisa membacanya. Ini adalah dependency dari Tim, bukan Operasional - tetapi Operasional harus bisa **memvalidasi** bahwa jadwal staf tidak keluar dari jam buka salon.

**`services.duration`**

Dimiliki oleh domain Layanan. Operasional tidak boleh mengubah ini. Customer app mengambil nilai ini dan menghitung `endTime = startTime + duration`. Jika slot interval di Operasional adalah 30 menit tapi ada layanan yang durasi 45 menit, sistem booking customer harus bisa menangani ini (bukan tanggung jawab Operasional untuk menyelesaikannya).

---

### Relasi Antar Domain

```
Operasional Domain
  |
  |-- defines --> "window of possibility" untuk booking
  |                (kapan salon buka, hari apa, sampai kapan bisa pesan)
  |
  |-- validates --> jadwal staf tidak boleh keluar batas jam buka
  |                 (baca dari Team Domain, bukan write)
  |
  |-- dikonsumsi oleh --> Customer App
                          (render slot, validasi booking, tampil jam buka)

Team Domain
  |
  |-- defines --> ketersediaan per staf dalam satu hari
  |               (jam kerja, hari aktif)
  |
  |-- constrained by --> Operasional Domain (jam buka salon adalah batas luar)
  |
  |-- dikonsumsi oleh --> Customer App (stylist availability)

Services Domain
  |
  |-- defines --> berapa lama setiap layanan
  |
  |-- dikonsumsi oleh --> Customer App (end time calculation)
  |                       Tidak ada dependency ke Operasional

Booking Domain
  |
  |-- depends on --> Operasional (slot tersedia, hari buka, batas cancel)
  |-- depends on --> Team Domain (staf tersedia)
  |-- depends on --> Services Domain (durasi)
  |
  |-- outcome --> booking tersimpan, trigger reminder
```

---

## Section 3 — User Questions

Halaman Operasional harus dapat menjawab semua pertanyaan berikut. Setiap setting yang tidak berkontribusi pada salah satu jawaban ini perlu dipertanyakan tempatnya.

---

### "Kapan salon buka?"

**Setting yang menjawab:** Jam buka salon - hari operasional + jam per hari.

Contoh jawaban yang bisa dihasilkan: "Senin-Sabtu, 09:00-20:00. Minggu tutup."

Customer app membaca ini untuk: menampilkan jam operasional di halaman booking, memblokir tanggal/hari yang tutup.

---

### "Kapan customer boleh booking?"

**Setting yang menjawab:** Lead time booking (minimum) + advance booking window (maksimum).

Contoh jawaban: "Minimum 2 jam sebelum. Maksimum 30 hari ke depan."

Customer app membaca ini untuk: memblokir slot yang terlalu dekat dengan waktu sekarang, memblokir tanggal yang terlalu jauh ke depan.

Jika setting ini tidak ada, customer bisa booking 1 menit sebelum jadwal, atau booking setahun ke depan. Keduanya bermasalah secara operasional.

---

### "Berapa jauh hari customer bisa booking?"

**Setting yang menjawab:** Advance booking window (`advance_booking_days`).

Setting ini terpisah dari "kapan buka" karena salon yang buka setiap hari sekalipun mungkin tidak ingin menerima booking lebih dari 2 minggu ke depan (kapasitas tidak bisa diprediksi, staf bisa berubah).

---

### "Kapan salon tutup?"

Dua level jawaban:

1. **Tutup reguler** - dijawab oleh hari operasional (misal: Minggu tutup setiap minggu).
2. **Tutup khusus** - dijawab oleh daftar `special_closing_dates` (misal: 1 Jan, 17 Agt).

Customer app membaca keduanya dan menggabungkannya sebelum menampilkan kalender booking.

---

### "Bolehkah booking di hari libur?"

**Setting yang menjawab:** `special_closing_dates` dengan flag `blocksBooking: true`.

Ini adalah pertanyaan yang berbeda dari "kapan tutup" karena ada edge case: owner mungkin ingin menandai hari raya sebagai informasi tanpa memblokir booking (misal: "buka tapi dengan jadwal terbatas"). Untuk Phase 1, semua tanggal tutup khusus otomatis memblokir booking.

---

### Setting yang Tidak Menjawab Pertanyaan di Atas

Setting berikut sempat dipertimbangkan untuk Operasional tapi tidak menjawab salah satu dari lima pertanyaan di atas:

| Setting             | Komentar                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Walk-in toggle      | Relevan untuk operasional tapi lebih ke kebijakan bisnis. Masuk Operasional sebagai setting sekunder, bukan prioritas. |
| Deposit / uang muka | Tidak menjawab pertanyaan waktu. Lebih ke domain payment policy. Defer ke Phase 2.                                     |
| Notifikasi reminder | Triggered by booking data. Masuk Operasional sebagai otomasi, tapi Phase 2.                                            |

---

## Section 4 — Page Structure

Struktur halaman diurutkan dari informasi yang paling fundamental (tanpa ini halaman booking tidak bisa berjalan) ke yang paling opsional.

---

### A. Jam Operasional

**Fungsi:** Mendefinisikan kapan salon buka setiap minggunya.

Ini adalah setting paling mendasar. Tanpa ini, customer app tidak tahu hari dan jam apa yang bisa ditawarkan. Semua setting lain di halaman ini bergantung pada section ini sebagai landasan.

Informasi yang dikonfigurasi:

- Per hari dalam seminggu (Senin - Minggu): toggle buka/tutup
- Jam buka dan jam tutup per hari yang aktif
- Hari-hari dengan jam berbeda (misal: Sabtu tutup lebih awal) dikonfigurasi satu per satu, bukan sebagai "jam default"

**Tidak termasuk di sini:** jam kerja per staf - itu di Tim.

---

### B. Hari Libur dan Penutupan Khusus

**Fungsi:** Mendefinisikan tanggal-tanggal spesifik di luar jadwal normal di mana salon tutup.

Ini adalah override terhadap Section A. Jika Section A mengatakan "Senin buka", tapi Section B berisi "2026-12-25 tutup (Natal)", maka 25 Desember 2026 yang kebetulan hari Senin tetap ditampilkan sebagai tutup.

Informasi yang dikonfigurasi:

- List tanggal + label (misal: "Lebaran Hari Pertama")
- Add / remove tanggal
- Tidak ada recurring pattern untuk Phase 1 (setiap tahun harus ditambahkan manual)

**Alasan dipisah dari Section A:** Jam operasional adalah pola mingguan yang berulang (repeating weekly pattern). Tanggal tutup khusus adalah exception satu kali (one-off override). Keduanya secara konseptual berbeda dan harus dikonfigurasi secara terpisah.

---

### C. Aturan Booking

**Fungsi:** Mendefinisikan batasan waktu dalam sistem booking - kapan customer boleh dan tidak boleh memesan.

Ini adalah "batas permainan" yang customer app terapkan saat customer memilih slot. Tanpa ini, sistem tidak punya dasar untuk memblokir booking yang terlalu mendadak atau terlalu jauh ke depan.

Informasi yang dikonfigurasi:

- **Slot interval** - interval minimum antar slot waktu yang ditawarkan (15/30/45/60 menit)
- **Lead time** - minimum jam sebelum layanan dimana booking masih diterima
- **Advance window** - maksimum hari ke depan yang bisa dipesan
- **Aturan pembatalan** - batas jam sebelum layanan dimana customer masih bisa cancel

**Urutan prioritas implementasi dalam section ini:**

1. Slot interval - langsung mempengaruhi tampilan kalender customer
2. Lead time - mencegah booking last-minute
3. Advance window - mencegah booking terlalu jauh ke depan
4. Aturan pembatalan - kebijakan, bisa defer

---

### D. Otomasi (Phase 2)

**Fungsi:** Pengiriman notifikasi dan reminder secara otomatis berdasarkan data booking.

Masuk Operasional karena ini adalah pengaturan level salon yang berlaku untuk semua booking, bukan setting per-customer atau per-staf. Namun ini membutuhkan infrastruktur notifikasi yang belum ada, sehingga defer ke Phase 2.

Informasi yang akan dikonfigurasi:

- Reminder H-1 sebelum booking (toggle)
- Reminder H-hari booking (toggle)
- Konfirmasi booking otomatis (toggle)

---

### Urutan Section dalam Halaman

```
Halaman Operasional
  A. Jam Operasional          <- Phase 1, prioritas tertinggi
  B. Hari Libur & Penutupan   <- Phase 1
  C. Aturan Booking           <- Phase 1 (slot interval + lead time minimal)
  D. Otomasi                  <- Phase 2
```

Section A dan B harus selesai sebelum customer app bisa berfungsi dengan benar. Section C adalah functional requirement. Section D adalah enhancement.

---

## Section 5 — Implementation Order

Urutan ini mengikuti prinsip: **data model dulu, kontrak API kedua, UI terakhir**. Tidak boleh dibalik karena UI yang dibuat tanpa domain model yang jelas akan menghasilkan state shape yang salah dan harus di-refactor.

---

### Fase 1: Domain Types

**File yang perlu dibuat:**
`apps/owner/src/features/dashboard/components/settings/types/operasional.types.ts`

```typescript
// Urutan definisi dalam file:

// 1. Hari dalam seminggu
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Minggu, ISO 8601 day

// 2. Jam buka per hari
interface BusinessHoursDay {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime: string | null; // "HH:mm", null jika isOpen = false
  closeTime: string | null; // "HH:mm", null jika isOpen = false
}

// 3. Tanggal tutup khusus
interface SpecialClosingDate {
  id: string;
  date: string; // "YYYY-MM-DD"
  label: string; // "Lebaran Hari Pertama"
}

// 4. Kebijakan booking
type SlotIntervalMinutes = 15 | 30 | 45 | 60;

interface BookingPolicy {
  slotIntervalMinutes: SlotIntervalMinutes;
  leadTimeHours: number; // min jam sebelum bisa booking
  advanceBookingDays: number; // max hari ke depan
  cancellationWindowHours: number;
}

// 5. Seluruh domain sebagai satu unit
interface OperasionalDomain {
  businessHours: BusinessHoursDay[]; // 7 entri, satu per hari
  specialClosingDates: SpecialClosingDate[];
  bookingPolicy: BookingPolicy;
}
```

**Catatan desain:**

- `businessHours` selalu berisi tepat 7 item (Minggu-Sabtu). Tidak ada insert/delete, hanya update.
- `specialClosingDates` adalah list yang bisa ditambah/dikurangi.
- `BookingPolicy` adalah satu objek datar, bukan array.

---

### Fase 2: Mock Seed Data

**File yang perlu dibuat:**
`apps/owner/src/features/dashboard/hooks/settings/useOperasionalController.ts`

Seed data harus mencerminkan kondisi salon yang realistis. Contoh yang akan dipakai sebagai default:

```
Jam buka:
  Senin-Jumat: 09:00 - 20:00
  Sabtu: 09:00 - 18:00
  Minggu: tutup

Hari tutup khusus:
  (kosong - owner tambahkan sendiri)

Kebijakan booking:
  slotInterval: 30 menit
  leadTime: 2 jam
  advanceWindow: 30 hari
  cancellationWindow: 2 jam
```

Seed ini realistis untuk salon kecil-menengah dan tidak membuat customer app langsung error saat dihubungkan.

---

### Fase 3: Controller Interface

**Dalam file yang sama (`useOperasionalController.ts`), tentukan interface controller:**

```typescript
interface OperasionalController {
  domain: OperasionalDomain;

  // Business hours - per hari, bukan bulk
  updateBusinessHoursDay: (
    dayOfWeek: DayOfWeek,
    patch: Partial<Omit<BusinessHoursDay, "dayOfWeek">>,
  ) => void;

  // Special closing dates
  addSpecialClosingDate: (date: Omit<SpecialClosingDate, "id">) => void;
  removeSpecialClosingDate: (id: string) => void;

  // Booking policy - patch partial, simpan semua sekaligus
  updateBookingPolicy: (patch: Partial<BookingPolicy>) => void;
}
```

**Catatan:** Tidak ada `saveAll` atau `isDirty` pattern untuk Phase 1. Setiap perubahan langsung applied ke state (optimistic). Ini akan berubah saat terhubung ke tRPC.

---

### Fase 4: tRPC Router (Sebelum UI, Bukan Setelahnya)

Sebelum membuat komponen UI, tentukan kontrak API-nya dulu.

**File yang perlu diupdate:**
`apps/owner/src/server/trpc/routers/business-hours.ts`

Tambahkan mutations:

- `upsertDay` - update satu hari (buka/tutup + jam)
- `upsertPolicy` - update booking policy
- `addSpecialClosing` - tambah tanggal tutup
- `removeSpecialClosing` - hapus tanggal tutup

**Urutan ini penting:** jika UI dibuat dulu, shape state akan ikut kebutuhan komponen, bukan kebutuhan domain. Ini menghasilkan controller yang bentuknya aneh dan sulit disambungkan ke Supabase.

---

### Fase 5: UI Components

Baru setelah Fase 1-4 selesai, buat UI. Komponen yang perlu dibuat:

1. **`BusinessHoursGrid`** - tabel 7 hari dengan toggle + time range per baris

   - Extract pattern dari `WeeklyScheduleSection.tsx` yang sudah ada di Tim
   - Bukan copy-paste, tapi mengikuti pola yang sama dengan data yang berbeda

2. **`SpecialClosingList`** - list tanggal tutup khusus

   - Menggunakan `SettingsEmptyState` saat list kosong
   - Add via inline form atau side sheet kecil

3. **`BookingPolicyForm`** - sekumpulan `SettingsSelect` + `SettingsInput`

   - Tidak perlu side sheet, langsung inline

4. **`OperasionalPageClient`** - client component utama
   - Menggunakan `useOperasionalController`
   - Merakit ketiga komponen di atas

---

### Ringkasan Urutan

```
1. operasional.types.ts          <- type definitions
      |
      v
2. useOperasionalController.ts   <- mock state + controller interface
      |
      v
3. business-hours.ts (tRPC)      <- kontrak API, mutations
      |
      v
4. BusinessHoursGrid.tsx         <- UI per section
   SpecialClosingList.tsx
   BookingPolicyForm.tsx
      |
      v
5. OperasionalPageClient.tsx     <- assembler
      |
      v
6. operasional/page.tsx          <- server entry point (ganti stub)
```

Tidak ada langkah yang boleh dilewati. Tidak ada langkah yang boleh dikerjakan terbalik.

---

## Keputusan yang Harus Dikonfirmasi Sebelum Implementasi

Pertanyaan berikut perlu jawaban eksplisit sebelum Fase 1 dimulai:

1. **Apakah slot interval berlaku global atau bisa override per layanan?**
   Keputusan saat ini: global. Jika berubah, domain model Services harus ikut berubah.

2. **Apakah `specialClosingDates` otomatis memblokir semua booking, atau ada flag "informasi saja"?**
   Keputusan saat ini: selalu blokir. Phase 2 bisa tambahkan flag.

3. **Apakah jam buka salon memvalidasi jadwal staf secara realtime (warning jika staf dijadwal di luar jam buka)?**
   Keputusan saat ini: tidak untuk Phase 1. Validasi silang masuk Phase 2.

4. **Apakah customer app perlu di-update segera setelah halaman Operasional selesai, atau bisa menunggu?**
   Ini mempengaruhi prioritas Fase 4 (tRPC). Jika customer butuh data ini segera, Fase 4 harus dikerjakan bersama Fase 5, bukan setelahnya.
