# Booking App — Information Architecture V3

**Tanggal:** 2026-06-12
**Status:** Locked. Siap untuk implementation planning.
**Changelog dari V2:**

- Deposit dipindahkan keluar dari Booking App → milik domain Layanan
- Payment gateway didefer sepenuhnya → Phase 1 hanya static QRIS upload
- QRIS ditetapkan sebagai financial asset dengan permission eksplisit
- QRIS change flow didokumentasikan (ConfirmDialog → Upload → Preview → Save → Audit log)

---

## Definisi Domain (Direvisi)

Booking App menjawab tiga pertanyaan dan tidak lebih:

1. **Bagaimana customer membayar?** — metode, QRIS, rekening bank
2. **Bagaimana booking dikonfirmasi?** — otomatis atau manual oleh owner
3. **Aturan apa yang harus diterima customer?** — kebijakan salon di checkout

Deposit **tidak** dijawab di sini. Deposit adalah keputusan per layanan, bukan keputusan per salon. Lihat bagian "Services Integration Notes" di bawah.

---

## Domain Ownership Matrix

### Booking App — OWNS

| Field              | Tipe                                 | Keterangan                                           |
| ------------------ | ------------------------------------ | ---------------------------------------------------- |
| `paymentMethods`   | `('qris' \| 'transfer' \| 'cash')[]` | Metode pembayaran yang diterima salon                |
| `qrisImageUrl`     | `string \| null`                     | Foto QRIS yang ditampilkan di StepPayment            |
| `bankAccounts`     | `BankAccount[]`                      | Satu atau lebih rekening bank tujuan transfer        |
| `confirmationMode` | `'auto' \| 'manual'`                 | Booking dikonfirmasi otomatis atau manual            |
| `salonPolicy`      | `string \| null`                     | Teks aturan yang ditampilkan ke customer di checkout |

### Booking App — TIDAK OWNS

| Field                                      | Domain yang Benar         | Alasan                                                                       |
| ------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------- |
| `depositAmount`                            | **Layanan** (per service) | Deposit berbeda per layanan — haircut tidak perlu DP, bridal package 100% DP |
| `depositMode`                              | **Layanan** (per service) | Sama: keputusan per layanan, bukan per salon                                 |
| Slot interval                              | Operasional               | Kapasitas waktu                                                              |
| Lead time minimum                          | Operasional               | Kapan booking bisa dibuat                                                    |
| Advance booking days                       | Operasional               | Seberapa jauh ke depan                                                       |
| Cancellation window                        | Operasional               | Aturan pembatalan waktu                                                      |
| Jam buka / hari libur                      | Operasional               | Jadwal salon                                                                 |
| Nama / deskripsi salon                     | Brand                     | Identitas                                                                    |
| Nomor telepon / alamat                     | Brand                     | Kontak                                                                       |
| Layanan dan harga                          | Layanan                   | Katalog                                                                      |
| Staff dan jadwal                           | Tim                       | Sumber daya                                                                  |
| `reservationTimeoutSeconds`                | Hardcoded (300s)          | Bukan keputusan owner                                                        |
| `bookingCodePrefix`                        | Hardcoded ('BK')          | Bug fix di kode, bukan setting                                               |
| `promoCodes[]`                             | Phase 2                   | Butuh validation endpoint di customer app                                    |
| Payment gateway (Midtrans, Xendit, Duitku) | Phase 2                   | Tidak ada di V1                                                              |

---

## Field Inventory

### Group 1 — Metode Pembayaran

**`paymentMethods: ('qris' | 'transfer' | 'cash')[]`**

- Default: `['qris', 'transfer']`
- Constraint: minimal satu metode aktif — controller menolak array kosong
- Customer impact: menentukan opsi yang ditampilkan di StepPayment
- Permission: hanya OWNER yang bisa mengubah daftar metode

---

**`qrisImageUrl: string | null`**

- Default: `null`
- Aktif jika: `paymentMethods` includes `'qris'`
- Warning state: QRIS aktif tapi tidak ada foto — customer tidak bisa scan
- Phase 1: mock URL string (upload nyata butuh Supabase Storage — Phase 2)
- **Permission: hanya OWNER** — lihat bagian Permission Matrix dan QRIS Protection Flow
- Audit: setiap perubahan dicatat di audit log — lihat QRIS Change Flow

---

**`bankAccounts: BankAccount[]`**

- Default: `[]`
- Aktif jika: `paymentMethods` includes `'transfer'`
- Warning state: Transfer aktif tapi tidak ada rekening — customer tidak tahu harus transfer ke mana
- Plural dari awal. Tidak boleh diubah ke singular setelah ada data di DB.
- Permission: hanya OWNER yang bisa add/edit/remove rekening

```typescript
interface BankAccount {
  id: string;
  bankName: string; // "BCA" | "Mandiri" | "BNI" | "BRI" | "CIMB" | ...
  accountNumber: string;
  accountHolderName: string;
  isActive: boolean; // nonaktifkan tanpa hapus — untuk rekening yang sedang diuji
}
```

---

### Group 2 — Konfirmasi

**`confirmationMode: 'auto' | 'manual'`**

- Default: `'auto'`
- `'auto'` = booking dikonfirmasi otomatis setelah pembayaran diterima, tanpa action owner
- `'manual'` = owner harus eksplisit mengkonfirmasi setiap booking yang masuk
- Phase 1: mode `'auto'` menggunakan hardcoded timeout 60 menit di controller. Durasi tidak dikonfigurasi owner.
- Customer impact: menentukan pesan status di StepTicket ("Booking dikonfirmasi" vs "Menunggu konfirmasi pemilik salon")

---

### Group 3 — Kebijakan Salon

**`salonPolicy: string | null`**

- Default: `null`
- Format: plain text, max 500 karakter
- Ditampilkan di: StepConfirm — sebelum customer submit booking
- Null = tidak ada kebijakan yang tampil (opsional sepenuhnya)
- Contoh konten: "Keterlambatan lebih dari 15 menit dianggap tidak hadir dan deposit hangus. Pembatalan kurang dari 2 jam sebelum jadwal tidak dapat dikembalikan."
- Display mode di customer app: **open question** — collapsible info atau required checkbox "Saya setuju". Keputusan ini menentukan scope perubahan di StepConfirm customer app. Harus diputuskan sebelum Phase 2.

---

## Permission Matrix

Booking App menyentuh aset keuangan (QRIS, rekening bank). Permission harus eksplisit.

| Aksi                          | OWNER | ADMIN | MANAGER | STAFF |
| ----------------------------- | ----- | ----- | ------- | ----- |
| Lihat metode pembayaran aktif | ✅    | ✅    | ✅      | ❌    |
| Aktifkan / nonaktifkan metode | ✅    | ❌    | ❌      | ❌    |
| Upload QRIS                   | ✅    | ❌    | ❌      | ❌    |
| Ganti QRIS                    | ✅    | ❌    | ❌      | ❌    |
| Hapus QRIS                    | ✅    | ❌    | ❌      | ❌    |
| Lihat foto QRIS (full size)   | ✅    | ❌    | ❌      | ❌    |
| Tambah rekening bank          | ✅    | ❌    | ❌      | ❌    |
| Edit rekening bank            | ✅    | ❌    | ❌      | ❌    |
| Hapus rekening bank           | ✅    | ❌    | ❌      | ❌    |
| Ubah confirmation mode        | ✅    | ✅    | ❌      | ❌    |
| Edit salon policy             | ✅    | ✅    | ❌      | ❌    |

**Aturan fundamental:**

- QRIS dan rekening bank adalah financial assets. Hanya OWNER yang bisa menyentuhnya.
- Tidak ada exception. ADMIN tidak bisa mengakses meskipun OWNER sedang tidak ada.
- Alasan: QRIS bisa disalahgunakan untuk dialihkan ke rekening lain. Ini bukan paranoia — ini adalah attack vector nyata untuk penipuan transfer.
- Phase 1 (mock): permission dicheck di controller level meskipun auth masih localStorage mock.
- Phase 2 (Supabase Auth): permission dicheck di RLS policy level di database.

**Catatan untuk implementasi:**
Permission check di controller harus eksplisit, bukan implicit melalui route protection saja. Setiap mutasi QRIS dan rekening bank harus memverifikasi `currentUser.role === 'OWNER'` sebelum melanjutkan.

---

## QRIS Change Flow

QRIS adalah foto kode pembayaran aktif yang langsung digunakan customer untuk transfer uang. Mengganti QRIS tanpa verifikasi bisa mengakibatkan customer mentransfer ke rekening yang salah.

### Flow: Ganti QRIS

```
1. OWNER tap "Ganti Foto QRIS"
   │
   ▼
2. ConfirmDialog muncul
   ┌─────────────────────────────────────────┐
   │ Ganti Foto QRIS?                        │
   │                                         │
   │ QRIS lama akan digantikan. Customer     │
   │ yang sedang dalam proses booking akan   │
   │ melihat QRIS baru. Pastikan foto baru   │
   │ adalah QRIS Anda yang aktif.            │
   │                                         │
   │               [Batal]  [Ya, Ganti]      │
   └─────────────────────────────────────────┘
   │
   ▼
3. File picker terbuka (native)
   OWNER memilih foto baru
   │
   ▼
4. Preview modal / inline
   ┌─────────────────────────────────────────┐
   │ Preview QRIS Baru                       │
   │                                         │
   │  [foto QRIS dalam kotak 200×200]        │
   │                                         │
   │ Pastikan kode QR terlihat jelas dan     │
   │ tidak buram sebelum menyimpan.          │
   │                                         │
   │               [Batal]  [Simpan]         │
   └─────────────────────────────────────────┘
   │
   ▼
5. Save
   Controller menyimpan URL baru ke state (Phase 1: in-memory)
   Controller mencatat audit log entry:
   {
     action: 'qris_replaced',
     actor: currentUser.id,
     actorRole: 'OWNER',
     timestamp: new Date().toISOString(),
     previousUrlHash: sha256(oldUrl),   // bukan full URL — hanya hash untuk audit
     note: 'QRIS replaced via settings'
   }
   │
   ▼
6. Toast konfirmasi
   "Foto QRIS berhasil diperbarui."
   │
   ▼
7. UI kembali ke state normal
   Sub-row QRIS menampilkan thumbnail baru
```

### Flow: Hapus QRIS

```
1. OWNER tap "Hapus Foto QRIS"
   │
   ▼
2. ConfirmDialog
   ┌─────────────────────────────────────────┐
   │ Hapus Foto QRIS?                        │
   │                                         │
   │ Customer tidak bisa membayar via QRIS   │
   │ sampai foto baru diunggah. QRIS akan    │
   │ tetap tampil sebagai metode sampai      │
   │ Anda juga menonaktifkannya.             │
   │                                         │
   │               [Batal]  [Hapus]          │
   └─────────────────────────────────────────┘
   │
   ▼
3. Controller set qrisImageUrl = null
   Audit log entry:
   { action: 'qris_removed', actor: currentUser.id, timestamp: ... }
   │
   ▼
4. Toast "Foto QRIS dihapus."
   Sub-row menampilkan state "Belum diunggah"
```

### Audit Log — Struktur (Phase 1 in-memory, Phase 2 ke DB)

```typescript
interface AuditLogEntry {
  id: string;
  action:
    | "qris_uploaded"
    | "qris_replaced"
    | "qris_removed"
    | "bank_account_added"
    | "bank_account_edited"
    | "bank_account_removed"
    | "payment_method_changed";
  actor: string; // user ID
  actorRole: "OWNER"; // selalu OWNER untuk aksi ini
  timestamp: string; // ISO string
  metadata?: Record<string, string>; // optional detail tambahan
}
```

Phase 1: audit log disimpan in-memory di controller, bisa di-inspect di dev tools.
Phase 2: audit log disimpan ke tabel `audit_logs` di Supabase.

---

## Section Hierarchy (Final)

```
/dashboard/settings/booking
  │
  ├── [1] Metode Pembayaran                    ← OWNER only untuk edit
  │     paymentMethods    (toggle per metode)
  │     qrisImageUrl      (muncul jika qris aktif — OWNER only)
  │     bankAccounts[]    (muncul jika transfer aktif — OWNER only)
  │
  ├── [2] Konfirmasi Booking                   ← OWNER + ADMIN
  │     confirmationMode  ('auto' / 'manual')
  │
  └── [3] Kebijakan Salon                      ← OWNER + ADMIN
        salonPolicy       (textarea, max 500 char, opsional)
```

Tiga section. Lima field (dua kondisional). Lebih kecil dari V2.

---

## Type Contract (Final)

```typescript
// booking-app.types.ts

type PaymentMethod = "qris" | "transfer" | "cash";

type ConfirmationMode = "auto" | "manual";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isActive: boolean;
}

interface AuditLogEntry {
  id: string;
  action:
    | "qris_uploaded"
    | "qris_replaced"
    | "qris_removed"
    | "bank_account_added"
    | "bank_account_edited"
    | "bank_account_removed"
    | "payment_method_changed";
  actor: string;
  actorRole: "OWNER";
  timestamp: string;
  metadata?: Record<string, string>;
}

interface BookingAppSettings {
  paymentMethods: PaymentMethod[];
  qrisImageUrl: string | null;
  bankAccounts: BankAccount[];
  confirmationMode: ConfirmationMode;
  salonPolicy: string | null;
}

const DEFAULT_BOOKING_APP_SETTINGS: BookingAppSettings = {
  paymentMethods: ["qris", "transfer"],
  qrisImageUrl: null,
  bankAccounts: [],
  confirmationMode: "auto",
  salonPolicy: null,
};
```

---

## Phase 1 vs Phase 2

### Phase 1 — Implement

| Field / Fitur      | Catatan                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `paymentMethods`   | Toggle per metode. In-memory. Permission check di controller.                                                            |
| `qrisImageUrl`     | Mock string. Upload real di Phase 2. QRIS flow (confirm → preview → save) tetap diimplementasi meskipun upload-nya mock. |
| `bankAccounts[]`   | Full CRUD in-memory. Plural dari awal.                                                                                   |
| `confirmationMode` | Binary 'auto'/'manual'. Timeout 60 mnt hardcoded.                                                                        |
| `salonPolicy`      | Textarea. Plain text. Null jika kosong.                                                                                  |
| Audit log          | In-memory array. Tidak persistent di Phase 1. Struktur tipe sudah final.                                                 |
| Permission check   | Controller-level. Role diambil dari mock auth (localStorage).                                                            |

### Phase 2 — Defer

| Fitur                                        | Alasan                                                   |
| -------------------------------------------- | -------------------------------------------------------- |
| QRIS upload ke Supabase Storage              | Butuh bucket `qris-images` + signed URL + RLS policy     |
| Audit log ke database                        | Tabel `audit_logs` di Supabase                           |
| RLS-level permission untuk QRIS/rekening     | Sekarang di controller, Phase 2 di Supabase RLS          |
| Payment gateway (Midtrans / Xendit / Duitku) | Tidak ada di V1 sama sekali                              |
| Promo codes                                  | Butuh `validatePromoCode(salonId, code)` di customer app |
| `confirmationTimeout` (durasi otomatis)      | Expose hanya jika ada demand nyata dari salon            |
| Deposit konfigurasi                          | Pindah ke domain Layanan — lihat bagian bawah            |

---

## Constraint Validation (Controller-level)

| Kondisi                                          | Behavior                                                               |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| `paymentMethods` kosong                          | **Tolak.** Minimal satu metode wajib aktif.                            |
| `qris` aktif, `qrisImageUrl` null                | Izinkan. Warning state di UI.                                          |
| `transfer` aktif, `bankAccounts` kosong          | Izinkan. Warning state di UI.                                          |
| `salonPolicy` lebih dari 500 karakter            | **Tolak di controller.** Tampilkan karakter counter.                   |
| Mutasi QRIS oleh non-OWNER                       | **Tolak.** `throw new Error('Permission denied: OWNER role required')` |
| Mutasi rekening bank oleh non-OWNER              | **Tolak.** Error yang sama.                                            |
| Hapus `BankAccount` terakhir saat transfer aktif | Izinkan hapus. Warning state muncul. Tidak ada blocking.               |
| `bankAccount.accountNumber` kosong               | Tolak saat add/edit. Field wajib diisi.                                |

---

## Hubungan ke Customer App

| Field              | Digunakan di Step | Cara Dipakai                                          |
| ------------------ | ----------------- | ----------------------------------------------------- |
| `paymentMethods`   | StepPayment       | Filter opsi pembayaran yang ditampilkan               |
| `qrisImageUrl`     | StepPayment       | Gambar QRIS untuk scan (null = tidak ditampilkan)     |
| `bankAccounts[]`   | StepPayment       | Daftar rekening tujuan transfer                       |
| `confirmationMode` | StepTicket        | Pesan status: "Dikonfirmasi" vs "Menunggu konfirmasi" |
| `salonPolicy`      | StepConfirm       | Teks kebijakan (null = tidak ada yang ditampilkan)    |

Field hardcoded yang tetap di customer app dan **tidak** berasal dari domain ini:

- `SLOT_RESERVATION_SECONDS = 300` — timer payment countdown
- `BOOKING_CODE_PREFIX = 'BK'` — prefix kode booking

---

## Services Integration Notes

### Deposit dipindahkan ke domain Layanan

Deposit adalah keputusan per layanan, bukan per salon. Contoh nyata:

| Layanan                        | Deposit yang masuk akal |
| ------------------------------ | ----------------------- |
| Cuci Blow (Rp 85.000)          | Tidak perlu deposit     |
| Potong Rambut (Rp 120.000)     | Tidak perlu deposit     |
| Hair Coloring (Rp 450.000)     | 30–50% deposit          |
| Perawatan Keratin (Rp 750.000) | 50% deposit             |
| Paket Pengantin (Rp 2.500.000) | 100% deposit            |

Deposit per-salon flat (Rp 20.000 untuk semua layanan) tidak mencerminkan realita bisnis salon. Owner yang melayani haircut dan bridal makeup di salon yang sama butuh deposit rule yang berbeda per layanan.

### Fields yang harus ditambahkan ke domain Layanan

Ditambahkan ke `Service` entity di domain Layanan, bukan di Booking App:

```typescript
// Tambahan di service.types.ts (belum ada, perlu dibuat)
interface ServiceDepositConfig {
  required: boolean;
  type: "none" | "fixed" | "percentage";
  value: number; // Rupiah jika type='fixed', 0–100 jika type='percentage'
}

// Di interface Service yang sudah ada:
interface Service {
  // ... fields yang sudah ada ...
  deposit: ServiceDepositConfig; // Phase 2: default { required: false, type: 'none', value: 0 }
}
```

### Siapa yang menampilkan deposit ke customer?

Customer app di StepConfirm dan StepPayment perlu membaca deposit config dari layanan yang dipilih, bukan dari salon-level setting. Logic-nya:

```
1. Customer memilih layanan
2. Customer app membaca deposit config dari setiap layanan yang dipilih
3. Jika ada layanan dengan deposit.required = true:
   - Hitung total deposit (sum of fixed, atau persentase dari harga)
   - Tampilkan di StepPayment sebagai "DP yang harus dibayar sekarang"
4. Pelunasan ditangani di visit (offline) atau dikonfigurasi per salon di Phase 3
```

### Timing implementasi deposit di Layanan

Deposit config di service tidak perlu diimplementasikan bersamaan dengan Booking App. Booking App V3 bisa selesai terlebih dahulu tanpa deposit. Deposit ditambahkan ke domain Layanan di sprint berikutnya, setelah `Service` entity sudah stabil.

Customer app yang masih menggunakan `DEPOSIT_AMOUNT` hardcoded (20000) tetap bekerja sampai deposit per-service selesai diimplementasikan.

---

## Open Question (Satu yang Tersisa)

**`salonPolicy` — collapsible info atau required checkbox di StepConfirm?**

- **Collapsible:** Customer bisa abaikan. Lebih mudah di customer app. Tapi memberi sedikit legal coverage untuk owner.
- **Required checkbox:** "Saya setuju dengan ketentuan ini" sebelum bisa submit. Lebih kuat secara legal. Tapi butuh perubahan di StepConfirm yang tidak trivial.

Ini product decision, bukan engineering. Harus diputuskan dengan input dari owner salon nyata sebelum Phase 2.

Phase 1: tampilkan sebagai collapsible. Lebih mudah dan tidak memblokir implementasi.
