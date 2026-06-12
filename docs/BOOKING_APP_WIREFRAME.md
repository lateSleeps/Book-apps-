# Booking App — UX Wireframe

**Tanggal:** 2026-06-12
**Berdasarkan:** `docs/settings-v2/phase-5.2-customer-app-contract-audit.md`
**Route:** `/dashboard/settings/booking`
**Scope:** UX design dan visual hierarchy. Bukan kode. Bukan implementasi.

---

## Konteks Domain

Booking App adalah satu-satunya settings domain yang secara langsung mempengaruhi
pengalaman **transaksi** customer — bukan tampilan (Brand), bukan jadwal (Operasional),
bukan layanan (Layanan). Owner mengatur domain ini satu kali saat setup, kemudian
jarang kembali kecuali ada perubahan metode pembayaran atau promo.

**Yang diatur di sini (dari contract audit):**

- Metode pembayaran yang diterima (QRIS / Transfer Bank / Tunai)
- Upload foto QRIS
- Rekening bank untuk transfer
- Jumlah deposit
- Batas waktu pembayaran (timer countdown di step payment)
- Batas waktu konfirmasi booking (auto-confirm timeout)
- Kode prefix booking (e.g. "BK")
- Kode promo

**Yang TIDAK ada di sini (sudah di domain lain):**

- Interval slot → Operasional
- Lead time minimum booking → Operasional
- Advance booking days → Operasional
- Cancellation window → Operasional
- Jam buka → Operasional
- Profil salon / nomor telepon → Brand

---

## Mental Model Owner

Owner salon membuka halaman ini dengan tiga pertanyaan:

1. **"Customer bisa bayar pakai apa?"** — methods + QRIS + rekening
2. **"Berapa DP dan berapa lama bisa bayar?"** — deposit + timer
3. **"Ada promo aktif?"** — kode promo

Urutan section mengikuti urutan pertanyaan ini.

---

## Layout Hierarchy

```
SettingsPageShell
  |
  +-- [A] Metode Pembayaran      <- white card, toggle rows
  |
  +-- [B] Deposit & Waktu        <- white card, iOS label/value rows
  |
  +-- [C] Kode & Konfirmasi      <- white card, iOS label/value rows
  |
  +-- [D] Kode Promo             <- white card, list + add button
```

Empat card terpisah — tidak ada tab (tidak perlu, total field lebih sedikit dari Operasional).
Setiap card mengikuti pola Settings V2: `rounded-r16 bg-bg-card shadow-card`.

---

## Section A — Metode Pembayaran

### Keputusan Layout: Toggle Rows dengan Conditional Detail

Metode pembayaran bukan pilihan tunggal — bisa aktif lebih dari satu.
Pola toggle list (seperti iOS Settings > Notifications) tepat di sini.

Setiap metode punya "sub-row" kondisional yang muncul saat toggle ON:

- QRIS → baris "Foto QRIS" (upload)
- Transfer Bank → baris "Rekening Bank" (navigasi ke side sheet)
- Tunai → tidak perlu sub-row (tidak ada konfigurasi tambahan)

Sub-row ditampilkan dengan indentasi `pl-s20` ekstra dan separator dashed,
memberi signal visual bahwa ini "pengaturan untuk metode di atasnya".

### Wireframe Section A

```
+------------------------------------------------------------------+
| Metode Pembayaran                                                |
| Pilih metode yang diterima di halaman booking.                   |
+------------------------------------------------------------------+
|                                                                  |
|  QRIS                                              [ toggle ON ] |
+--  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  --+
|    Foto QRIS                                                     |
|    Belum diunggah                          [ Upload Foto >     ] |
+------------------------------------------------------------------+
|  Transfer Bank                             [ toggle ON ]         |
+--  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  --+
|    Rekening Bank                                                 |
|    BCA · 1234567890 a.n. Salon             [             >     ] |
+------------------------------------------------------------------+
|  Tunai                                     [ toggle OFF ]        |
+------------------------------------------------------------------+
```

**State: semua off (fresh setup)**

```
+------------------------------------------------------------------+
| Metode Pembayaran                                                |
+------------------------------------------------------------------+
|  QRIS                                            [ toggle OFF ]  |
+------------------------------------------------------------------+
|  Transfer Bank                                   [ toggle OFF ]  |
+------------------------------------------------------------------+
|  Tunai                                           [ toggle OFF ]  |
+------------------------------------------------------------------+
|  ⚠  Belum ada metode pembayaran aktif.                           |
|  Customer tidak bisa menyelesaikan booking.                      |
+------------------------------------------------------------------+
```

Warning inline muncul hanya jika semua toggle off — inline, bukan toast,
karena ini kondisi persisten yang harus terlihat setiap kali halaman dibuka.
Gunakan `bg-st-warning-bg text-st-warning` atau `text-ac-danger text-ts-cap1`.

**Detail toggle row:**

- Label: `text-ts-fn font-medium text-tx-primary`
- Toggle: `SegmentedControl` bukan native checkbox — konsisten dengan Settings V2

**Detail sub-row "Foto QRIS":**

- Muncul dengan animasi slide-down saat toggle QRIS on
- Jika belum ada foto: teks "Belum diunggah" `text-tx-subtle` + button "Upload Foto"
- Jika sudah ada foto: thumbnail kecil (24×24px) + nama file + icon pensil untuk ganti
- Tap baris → buka native file picker (bukan SideSheet, karena ini upload, bukan form)

**Detail sub-row "Rekening Bank":**

- Value: format singkat "BCA · 1234567890" `text-ts-fn text-tx-secondary`
- Tap → `SettingsSideSheet` dengan form: bank name (select), nomor rekening, nama pemilik
- Jika belum diisi: "Belum diatur" `text-tx-subtle`

---

## Section B — Deposit & Waktu Bayar

### Keputusan Layout: iOS Label/Value Rows (identik dengan Aturan Booking di Operasional)

Pola yang sama dengan policy rows di Operasional. Label di kiri (kecil, secondary),
nilai di kanan (medium, primary), CaretRight sebagai signal "bisa diedit".
Tap → SideSheet dengan satu kontrol.

Tiga field dikelompokkan dalam satu card karena ketiganya menjawab
pertanyaan yang sama: **"apa yang terjadi di step pembayaran?"**

### Wireframe Section B

```
+------------------------------------------------------------------+
| Deposit & Waktu Bayar                                            |
| Pengaturan langkah pembayaran di halaman booking customer.       |
+------------------------------------------------------------------+
|                                                                  |
|  Jumlah Deposit                              Rp 20.000       >  |
+------------------------------------------------------------------+
|  Batas Waktu Bayar                           5 Menit         >  |
+------------------------------------------------------------------+
|  Mode Pembayaran                             DP + Pelunasan  >  |
+------------------------------------------------------------------+
```

**Detail per baris:**

- **Jumlah Deposit** — nominal DP yang harus dibayar customer di step payment.
  SideSheet: input angka (`SettingsInput type="number"`, prefix "Rp").
  Opsi preset: Rp 10.000 / Rp 20.000 / Rp 50.000 / Nominal lain.
  Tampil sebagai `formatPrice(depositAmount)`, e.g. "Rp 20.000".

- **Batas Waktu Bayar** — countdown timer step payment sebelum slot dilepas.
  SideSheet: `SettingsSelect` dengan pilihan 3 / 5 / 10 / 15 / 30 menit.
  Default: 5 Menit.
  Relevansi: `SLOT_RESERVATION_SECONDS` di `constants.ts` customer app (hardcoded 300s = 5 min).

- **Mode Pembayaran** — apakah customer wajib bayar lunas atau boleh DP saja.
  SideSheet: `SettingsSelect`: "Lunas Saja" / "DP + Pelunasan" / "Bebas (customer pilih)".
  Ini menentukan apakah step payment menampilkan toggle "Bayar Penuh / Bayar DP".

---

## Section C — Konfirmasi & Identitas Booking

### Keputusan Layout: iOS Label/Value Rows (sama dengan Section B)

Dua field yang berbeda concern (teknis booking ID + timing konfirmasi) tapi
jarang diubah, sehingga tidak memerlukan section terpisah. Dikelompokkan sebagai
"hal yang terjadi setelah booking dibuat".

### Wireframe Section C

```
+------------------------------------------------------------------+
| Konfirmasi & Identitas Booking                                   |
| Pengaturan setelah booking berhasil dibuat.                      |
+------------------------------------------------------------------+
|                                                                  |
|  Batas Konfirmasi Otomatis                   60 Menit        >  |
+------------------------------------------------------------------+
|  Kode Booking                                BK-****         >  |
+------------------------------------------------------------------+
```

**Detail per baris:**

- **Batas Konfirmasi Otomatis** — berapa lama setelah booking dibuat dan
  pembayaran diterima, booking otomatis dikonfirmasi jika owner tidak action.
  SideSheet: `SettingsSelect`: 15 mnt / 30 mnt / 1 jam / 2 jam / Manual saja.
  "Manual saja" = konfirmasi hanya bisa dilakukan owner, tidak ada auto-confirm.
  Relevansi: `confirmation_timeout_minutes` di salons table, hardcoded "1 jam" di `StepTicket.tsx`.

- **Kode Booking** — prefix 2 huruf untuk kode unik setiap booking.
  Display: "BK-\*\*\*\*" (format preview, bukan input).
  SideSheet: `SettingsInput` dengan maxLength=2, uppercase transform, placeholder "BK".
  Contoh hasil: BK-0612-4521.
  Catatan inline di SideSheet: "Prefix ini tertera di tiket booking customer."
  Relevansi: bug yang tercatat di contract audit — `constants.ts` pakai "RB", router pakai "BK". Fix saat domain ini diimplementasi.

---

## Section D — Kode Promo

### Keputusan Layout: List + Add Button (identik dengan Hari Libur di Operasional)

Kode promo adalah entitas plural — bisa ada lebih dari satu, bisa kosong.
Pola yang sama dengan `SpecialClosingDate` di Operasional: list dengan
action menu per item, add button di header, SideSheet untuk add/edit.

### Wireframe Section D — Ada Promo

```
+------------------------------------------------------------------+
| Kode Promo                             [ + Tambah Kode Promo ] |
| Diskon yang bisa dimasukkan customer saat booking.               |
+------------------------------------------------------------------+
|                                                                  |
|  GRAND10                                                 [ ··· ] |
|  Diskon 10% — Aktif · Berlaku s.d. 31 Jul 2026                  |
+--  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  --+
|  WELCOM50K                                               [ ··· ] |
|  Diskon Rp 50.000 — Aktif · Tidak ada batas waktu               |
+--  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  --+
|  AGUSTUS2026                                             [ ··· ] |
|  Diskon 15% — Tidak aktif · Sudah kedaluwarsa                    |
+------------------------------------------------------------------+
```

### Wireframe Section D — Empty State

```
+------------------------------------------------------------------+
| Kode Promo                             [ + Tambah Kode Promo ] |
| Diskon yang bisa dimasukkan customer saat booking.               |
+------------------------------------------------------------------+
|                                                                  |
|       [icon Tag duotone]                                         |
|       Belum ada kode promo                                       |
|       Buat kode promo untuk menarik customer baru                |
|       atau memberikan diskon spesial.                            |
|                                                                  |
|                    [ + Tambah Kode Promo ]                       |
|                                                                  |
+------------------------------------------------------------------+
```

**Detail per baris promo:**

- Line 1: Kode promo (`text-ts-fn font-medium text-tx-primary`) + `EntityActionMenu` kanan
- Line 2: Deskripsi singkat + status badge + tanggal kedaluwarsa
  - Status: "Aktif" (`text-st-confirmed`) / "Tidak aktif" (`text-tx-subtle`)
  - Expired: "Sudah kedaluwarsa" + `opacity-50` seluruh baris

**SideSheet Add/Edit Promo:**

```
+----------------------------------+
| Kode Promo          [×]          |
+----------------------------------+
| Kode                             |
| [GRAND10              ]          |
|                                  |
| Jenis Diskon                     |
| [  Persentase (%)    v]          |
|                                  |
| Nilai Diskon                     |
| [10                   ]          |
| (Masukkan angka persentase)      |
|                                  |
| Tanggal Kedaluwarsa (opsional)   |
| [  31 Juli 2026      📅]         |
|                                  |
| Status                           |
| [  Aktif             v]          |
|              [Batal] [Simpan]    |
+----------------------------------+
```

Field SideSheet:

- Kode: `SettingsInput` uppercase transform, no spaces, alphanumeric
- Jenis: `SettingsSelect` — "Persentase (%)" / "Nominal (Rp)"
- Nilai: `SettingsInput type="number"` — label berubah sesuai jenis
- Kedaluwarsa: `SettingsInput type="date"` (opsional — boleh kosong = no expiry)
- Status: `SettingsSelect` — "Aktif" / "Tidak Aktif"

Delete promo: via `EntityActionMenu` → `ConfirmDialog` (ini adalah aksi permanen,
customer yang sudah pakai kode ini akan affected — butuh konfirmasi).

---

## Boundary: Tidak Duplikat dengan Operasional

| Setting                                 | Ada di      | Tidak ada di |
| --------------------------------------- | ----------- | ------------ |
| Interval slot (15/30/45/60 menit)       | Operasional | Booking App  |
| Lead time minimum (jam sebelum booking) | Operasional | Booking App  |
| Advance booking days                    | Operasional | Booking App  |
| Cancellation window                     | Operasional | Booking App  |
| Jam buka / tutup                        | Operasional | Booking App  |
| Hari libur                              | Operasional | Booking App  |
| Metode pembayaran                       | Booking App | Operasional  |
| Jumlah deposit                          | Booking App | Operasional  |
| Batas waktu bayar (timer)               | Booking App | Operasional  |
| Kode prefix booking                     | Booking App | Operasional  |
| Batas konfirmasi otomatis               | Booking App | Operasional  |
| Kode promo                              | Booking App | Operasional  |

---

## Component Mapping

### Reuse dari Settings V2 (tidak perlu buat baru)

| Komponen                | Dipakai di                                                         |
| ----------------------- | ------------------------------------------------------------------ |
| `SettingsPageShell`     | Wrapper halaman                                                    |
| `SettingsSectionHeader` | Header semua section                                               |
| `SettingsContentCard`   | Semua section cards                                                |
| `SettingsSideSheet`     | Add/edit promo, rekening bank, semua value rows                    |
| `SettingsInput`         | Kode promo, rekening, nominal deposit, kode booking                |
| `SettingsSelect`        | Batas waktu bayar, mode pembayaran, batas konfirmasi, jenis diskon |
| `SettingsFieldGroup`    | Wrapper label + input di setiap SideSheet                          |
| `SettingsAddButton`     | Header Section D                                                   |
| `SettingsEmptyState`    | Empty state Section D                                              |
| `EntityActionMenu`      | Aksi per promo row                                                 |
| `ConfirmDialog`         | Konfirmasi hapus promo                                             |

### Komponen Baru yang Perlu Dibuat

| Komponen                  | Section | Deskripsi                                                            |
| ------------------------- | ------- | -------------------------------------------------------------------- |
| `PaymentMethodToggle`     | A       | Toggle row + sub-row kondisional. Satu instance per metode.          |
| `QrisUploadRow`           | A       | Sub-row upload foto QRIS: thumbnail/placeholder + upload trigger     |
| `BankAccountSheet`        | A       | SideSheet: bank select + nomor + nama pemilik rekening               |
| `BookingAppPageClient`    | —       | Page client utama, orchestrates semua section                        |
| `useBookingAppController` | —       | Mock in-memory controller, interface siap Phase 2                    |
| `booking-app.types.ts`    | —       | Single source of truth: PaymentMethod, PromoCode, BookingAppSettings |

`PaymentMethodToggle` adalah komponen paling unik karena punya children kondisional.
Sisanya semua merupakan komposisi komponen existing + state lokal.

---

## Data Types (Draft Contract)

```typescript
// booking-app.types.ts

type PaymentMethod = "qris" | "transfer" | "cash";

type DiscountType = "percentage" | "fixed";

type PaymentMode = "full_only" | "deposit_only" | "customer_choice";

interface BankAccount {
  bankName: string; // "BCA" | "Mandiri" | "BNI" | dst
  accountNumber: string;
  accountHolderName: string;
}

interface PromoCode {
  id: string;
  code: string; // uppercase, alphanumeric
  discountType: DiscountType;
  discountValue: number; // percentage (0–100) atau nominal (Rp)
  expiresAt: string | null; // ISO date string atau null (no expiry)
  isActive: boolean;
}

interface BookingAppSettings {
  paymentMethods: PaymentMethod[];
  qrisImageUrl: string | null;
  bankAccount: BankAccount | null;
  depositAmount: number; // Rp, default 20000
  reservationTimeoutSeconds: number; // default 300 (5 menit)
  paymentMode: PaymentMode; // default 'deposit_only'
  confirmationTimeoutMinutes: number; // default 60
  bookingCodePrefix: string; // 2 chars, default 'BK'
  promoCodes: PromoCode[];
}
```

---

## Interaction Model

### Prinsip (konsisten dengan Settings V2)

1. **Value rows (Section B, C):** tap → SideSheet → edit → Simpan. Tidak ada
   inline edit. Nilai selalu tampil sebagai read-only label/value row.

2. **Toggle rows (Section A):** immediate effect. Tidak perlu Simpan.
   Sub-row QRIS dan Transfer Bank muncul/hilang dengan animasi.

3. **Promo codes (Section D):** add via SideSheet, edit via SideSheet,
   delete via ConfirmDialog (karena impak ke customer yang sudah pakai kode).

4. **QRIS upload:** tap → native file picker langsung (bukan SideSheet).
   Setelah upload, tampilkan thumbnail + confirm toast.

5. **Warning "tidak ada metode aktif":** inline warning di bawah toggle list,
   tampil hanya saat semua toggle off. Ini adalah edge case yang harus terlihat
   jelas karena dampaknya langsung ke customer (tidak bisa booking sama sekali).

### Edge Cases

| Edge Case                                    | Behavior                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Transfer Bank ON tapi rekening belum diisi   | Sub-row "Rekening Bank" tampil merah/warning. Toast saat save booking: "Isi rekening bank dulu."                |
| QRIS ON tapi foto belum diupload             | Sub-row tampil status "Belum diunggah" — warning ringan, tidak blocking setup                                   |
| Semua payment methods OFF                    | Inline warning di Section A. Customer app tidak menampilkan step payment.                                       |
| Kode promo duplikat (kode sama sudah ada)    | Inline error di SideSheet: "Kode ini sudah digunakan."                                                          |
| Kode promo sudah expired (tanggal lewat)     | Baris tetap tampil dengan `opacity-50` + label "Sudah kedaluwarsa". Tidak auto-delete.                          |
| depositAmount = 0                            | Valid. Artinya tidak ada DP, customer langsung bayar lunas (atau sesuai paymentMode).                           |
| bookingCodePrefix diubah setelah ada booking | Tidak ada validasi retroaktif. Prefix baru hanya berlaku untuk booking baru. Note ini ditampilkan di SideSheet. |

---

## Estimasi Tinggi Halaman

```
Section A Metode Pembayaran:  ~260px  (header + 3 toggle + 2 sub-row)
Section B Deposit & Waktu:    ~220px  (header + 3 value rows)
Section C Konfirmasi:         ~180px  (header + 2 value rows)
Section D Kode Promo:         ~200px  (header + 2-3 item atau empty state)
Gap antar section: 4 × 24px: ~96px

Total estimasi: ~956px
```

Lebih pendek dari Operasional (~1.356px). Tidak ada alasan untuk tab —
semua section muat dalam 1–1.5x scroll pada viewport 1024px.

---

## Open Questions untuk Implementation

1. **QRIS image storage:** Supabase Storage bucket apa? Perlu confirm `payment-proofs`
   vs bucket baru `qris-images`. Customer app saat ini belum ada referensi bucket QRIS.

2. **Bank list:** Hardcode pilihan bank populer Indonesia (BCA, BNI, BRI, Mandiri,
   CIMB, Permata, dst) atau free-text? Rekomendasi: `SettingsSelect` dengan
   ~15 bank populer + "Lainnya" sebagai fallback.

3. **Promo validation di customer app:** Saat ini `StepConfirm.tsx` punya promo code
   input field tapi validasinya belum terhubung ke database. Phase 2: endpoint
   `validatePromoCode(salonId, code)` harus dibuat.

4. **Deposit display:** Customer app menampilkan deposit sebagai "Rp 20.000" di
   step payment. Dengan Phase 2, ini harus di-fetch dari `salons.deposit_amount`.
   Tidak ada perubahan UI customer, hanya source of truth berubah dari hardcode ke DB.
