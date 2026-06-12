# Booking App — Information Architecture V2

**Tanggal:** 2026-06-12
**Status:** Locked. Siap untuk implementation planning.
**Berdasarkan:** `BOOKING_APP_WIREFRAME.md` + `BOOKING_APP_PRE_IMPLEMENTATION_REVIEW.md`

---

## Definisi Domain

Booking App adalah domain yang mengontrol **pengalaman transaksi** customer
di halaman booking salon. Bukan tampilan (Brand). Bukan jadwal (Operasional).
Bukan layanan yang ditawarkan (Layanan). Bukan siapa yang menangani (Tim).

Domain ini menjawab empat pertanyaan dan tidak lebih:

1. **Bagaimana customer membayar?**
2. **Apakah customer harus membayar deposit?**
3. **Bagaimana booking dikonfirmasi?**
4. **Aturan apa yang harus disetujui customer?**

---

## Domain Ownership Matrix

### Booking App — OWNS

| Field              | Tipe                                 | Keterangan                                                         |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------ |
| `paymentMethods`   | `('qris' \| 'transfer' \| 'cash')[]` | Metode pembayaran yang diterima salon                              |
| `qrisImageUrl`     | `string \| null`                     | Foto QRIS yang ditampilkan di step payment                         |
| `bankAccounts`     | `BankAccount[]`                      | Satu atau lebih rekening bank (plural dari awal)                   |
| `depositMode`      | `'none' \| 'fixed'`                  | Tidak ada DP, atau DP nominal tetap                                |
| `depositAmount`    | `number`                             | Nominal DP dalam Rupiah (hanya relevan jika depositMode = 'fixed') |
| `confirmationMode` | `'auto' \| 'manual'`                 | Booking dikonfirmasi otomatis atau manual oleh owner               |
| `salonPolicy`      | `string \| null`                     | Teks aturan/syarat yang ditampilkan ke customer di checkout        |

### Booking App — TIDAK OWNS (deliberately excluded)

| Field                           | Domain yang Benar | Alasan                                                   |
| ------------------------------- | ----------------- | -------------------------------------------------------- |
| Slot interval (15/30/45/60 mnt) | Operasional       | Tentang kapasitas waktu, bukan pembayaran                |
| Lead time minimum               | Operasional       | Tentang kapan booking bisa dibuat, bukan bagaimana bayar |
| Advance booking days            | Operasional       | Tentang seberapa jauh ke depan, bukan payment            |
| Cancellation window             | Operasional       | Tentang aturan pembatalan waktu                          |
| Jam buka / hari libur           | Operasional       | Jadwal salon                                             |
| Nama / deskripsi salon          | Brand             | Identitas, bukan transaksi                               |
| Nomor telepon / alamat          | Brand             | Kontak, bukan transaksi                                  |
| Layanan dan harga               | Layanan           | Katalog, bukan checkout                                  |
| Staff dan jadwal                | Tim               | Sumber daya, bukan transaksi                             |
| `reservationTimeoutSeconds`     | Hardcoded (300)   | Bukan keputusan owner — Phase 2 jika ada demand          |
| `bookingCodePrefix`             | Hardcoded ('BK')  | Bukan keputusan owner — bug fix di kode                  |
| `promoCodes[]`                  | Phase 2           | Butuh validation endpoint di customer app                |

---

## Field Inventory

### Group 1 — Metode Pembayaran

**`paymentMethods: ('qris' | 'transfer' | 'cash')[]`**

- Default: `['qris', 'transfer']`
- Constraint: tidak boleh kosong (minimal satu metode aktif)
- Customer impact: menentukan opsi yang ditampilkan di StepPayment

**`qrisImageUrl: string | null`**

- Default: `null`
- Constraint: hanya relevan jika `paymentMethods` includes `'qris'`
- Warning state: QRIS aktif tapi tidak ada foto — customer tidak bisa scan
- Storage: Phase 2 → Supabase Storage bucket `qris-images`. Phase 1 → mock URL string.

**`bankAccounts: BankAccount[]`**

- Default: `[]`
- Constraint: hanya relevan jika `paymentMethods` includes `'transfer'`
- Warning state: Transfer aktif tapi tidak ada rekening — customer tidak tahu harus transfer ke mana
- Plural dari awal. Tidak boleh diubah ke singular setelah ada data.

```typescript
interface BankAccount {
  id: string;
  bankName: string; // "BCA" | "Mandiri" | "BNI" | "BRI" | ...
  accountNumber: string;
  accountHolderName: string;
  isActive: boolean; // izinkan nonaktifkan tanpa hapus
}
```

---

### Group 2 — Deposit

**`depositMode: 'none' | 'fixed'`**

- Default: `'none'`
- `'none'` = tidak ada DP, customer bayar penuh (atau pilih sendiri jika Tunai)
- `'fixed'` = customer wajib membayar nominal deposit untuk menyelesaikan booking
- Customer impact: menentukan apakah StepPayment menampilkan partial payment flow

**`depositAmount: number`**

- Default: `20000`
- Unit: Rupiah
- Constraint: hanya relevan dan ditampilkan jika `depositMode === 'fixed'`
- Constraint: harus > 0 jika depositMode = 'fixed'
- Tidak ada validasi terhadap harga layanan (deposit bisa lebih kecil atau lebih besar dari layanan) — edge case ini diserahkan ke owner

---

### Group 3 — Konfirmasi

**`confirmationMode: 'auto' | 'manual'`**

- Default: `'auto'`
- `'auto'` = setelah pembayaran terverifikasi, booking langsung dikonfirmasi tanpa action dari owner
- `'manual'` = owner harus secara eksplisit mengkonfirmasi setiap booking yang masuk
- Phase 1: `'auto'` menggunakan hardcoded timeout 60 menit. Owner tidak mengonfigurasi durasinya.
- Customer impact: menentukan apakah StepTicket menampilkan "booking dikonfirmasi" atau "menunggu konfirmasi owner"

---

### Group 4 — Kebijakan Salon

**`salonPolicy: string | null`**

- Default: `null`
- Format: plain text, max 500 karakter
- Tampil di: StepConfirm (sebelum customer submit booking) — sebagai collapsible atau fixed text block
- Contoh isi: "Keterlambatan lebih dari 15 menit dianggap cancel. Deposit tidak dapat dikembalikan. Pembatalan kurang dari 2 jam sebelum jadwal dikenakan biaya penuh."
- Null = tidak ada kebijakan yang ditampilkan (opsional)
- Owner menulis bebas — tidak ada structured fields

---

## Final Section Hierarchy

```
/dashboard/settings/booking
  │
  ├── [1] Metode Pembayaran
  │     paymentMethods  (toggle per metode)
  │     qrisImageUrl    (muncul jika qris aktif)
  │     bankAccounts[]  (muncul jika transfer aktif)
  │
  ├── [2] Deposit & Konfirmasi
  │     depositMode     (pilihan utama: Ada DP / Tidak Ada DP)
  │     depositAmount   (muncul hanya jika depositMode = 'fixed')
  │     confirmationMode (Otomatis / Manual)
  │
  └── [3] Kebijakan Salon
        salonPolicy     (textarea, opsional)
```

Tiga section. Tujuh field (dua kondisional). Tidak ada section untuk field yang diremove.

---

## Type Contract

```typescript
// booking-app.types.ts

type PaymentMethod = "qris" | "transfer" | "cash";

type DepositMode = "none" | "fixed";

type ConfirmationMode = "auto" | "manual";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isActive: boolean;
}

interface BookingAppSettings {
  // Group 1 — Pembayaran
  paymentMethods: PaymentMethod[];
  qrisImageUrl: string | null;
  bankAccounts: BankAccount[];

  // Group 2 — Deposit
  depositMode: DepositMode;
  depositAmount: number; // hanya bermakna jika depositMode = 'fixed'

  // Group 3 — Konfirmasi
  confirmationMode: ConfirmationMode;

  // Group 4 — Kebijakan
  salonPolicy: string | null; // max 500 chars, plain text
}

const DEFAULT_BOOKING_APP_SETTINGS: BookingAppSettings = {
  paymentMethods: ["qris", "transfer"],
  qrisImageUrl: null,
  bankAccounts: [],
  depositMode: "none",
  depositAmount: 20000,
  confirmationMode: "auto",
  salonPolicy: null,
};
```

---

## Phase 1 vs Phase 2

### Phase 1 — Implement

| Field              | Catatan                                                           |
| ------------------ | ----------------------------------------------------------------- |
| `paymentMethods`   | Toggle on/off per metode. No storage concern.                     |
| `qrisImageUrl`     | Phase 1: mock string (URL placeholder). Upload nyata di Phase 2.  |
| `bankAccounts[]`   | CRUD in-memory. Multiple accounts supported dari awal (plural).   |
| `depositMode`      | Toggle 'none' / 'fixed'.                                          |
| `depositAmount`    | Nominal input. Conditional pada depositMode.                      |
| `confirmationMode` | Binary 'auto' / 'manual'. Timeout hardcoded 60 mnt di controller. |
| `salonPolicy`      | Textarea. Plain text. Null jika tidak diisi.                      |

### Phase 2 — Tidak Dibangun Phase 1

| Field / Fitur                 | Alasan Defer                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| QRIS image upload (real)      | Butuh Supabase Storage + signed URL                                                                           |
| `depositMode: 'percentage'`   | Persentase dari total booking lebih fleksibel dari nominal tetap tapi butuh price calculation di customer app |
| `confirmationTimeout: number` | Expose durasi konfirmasi otomatis hanya jika ada demand nyata                                                 |
| `reservationTimeoutSeconds`   | Hardcoded 300s cukup untuk semua salon Phase 1                                                                |
| Promo codes                   | Butuh `validatePromoCode(salonId, code)` endpoint di customer app — tidak ada sekarang                        |
| Per-service deposit override  | Salon besar mungkin butuh DP berbeda per layanan                                                              |
| Booking policies per layanan  | Kebijakan khusus untuk color/treatment vs potong biasa                                                        |
| Multiple policy languages     | ID + EN                                                                                                       |

---

## Validasi Constraint (Controller-level)

| Kondisi                                                 | Behavior                                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `paymentMethods` kosong                                 | Tolak. Minimal satu metode wajib aktif.                                                           |
| `qris` aktif, `qrisImageUrl` null                       | Izinkan. Warning state di UI. Customer akan melihat "coming soon" atau empty.                     |
| `transfer` aktif, `bankAccounts` kosong                 | Izinkan. Warning state di UI. Customer tidak bisa lihat rekening tujuan — owner harus segera isi. |
| `depositMode = 'fixed'`, `depositAmount <= 0`           | Tolak. Nominal DP harus lebih dari Rp 0.                                                          |
| `salonPolicy` lebih dari 500 karakter                   | Tolak di controller. Bukan di DB constraint.                                                      |
| Hapus `BankAccount` yang terakhir saat `transfer` aktif | Izinkan hapus. Warning state muncul (transfer aktif tapi tidak ada rekening).                     |

---

## Hubungan ke Customer App

| Field Owner Settings            | Digunakan di Step | Cara Dipakai                                                     |
| ------------------------------- | ----------------- | ---------------------------------------------------------------- |
| `paymentMethods`                | StepPayment       | Menentukan opsi yang ditampilkan                                 |
| `qrisImageUrl`                  | StepPayment       | Ditampilkan sebagai gambar scan                                  |
| `bankAccounts[]`                | StepPayment       | Ditampilkan sebagai rekening tujuan transfer                     |
| `depositMode` + `depositAmount` | StepPayment       | Menentukan apakah ada DP dan berapa nilainya                     |
| `confirmationMode`              | StepTicket        | Menentukan pesan status: "Dikonfirmasi" vs "Menunggu konfirmasi" |
| `salonPolicy`                   | StepConfirm       | Ditampilkan sebelum customer submit (jika tidak null)            |

Field yang tidak ada di atas (`reservationTimeoutSeconds`, `bookingCodePrefix`) tetap dipakai customer app tapi bersumber dari hardcoded constants, bukan dari settings domain ini.

---

## Tidak Diputuskan (Open Questions)

Dua pertanyaan ini harus dijawab sebelum Phase 2, tidak harus Phase 1:

1. **Deposit sebagai persentase vs nominal tetap:** Nominal tetap (Rp 20.000) tidak masuk akal untuk semua layanan. Layanan Rp 75.000 dengan DP Rp 20.000 wajar. Layanan Rp 800.000 dengan DP Rp 20.000 tidak. Tapi menambahkan "persentase" mengharuskan customer app menghitung DP dari total harga yang bisa berubah (add-ons, multiple services). Ini adalah product decision, bukan engineering decision — harus diputuskan dengan input dari owner salon nyata.

2. **`salonPolicy` — siapa yang menampilkannya di customer app?** Apakah ini collapsible (customer bisa abaikan), atau required checkbox ("Saya setuju dengan ketentuan ini" sebelum bisa submit)? Jika checkbox, customer app butuh perubahan di StepConfirm yang tidak trivial. Jika collapsible, lebih mudah tapi mengurangi legal coverage untuk owner. Keputusan ini menentukan scope pekerjaan di customer app.
