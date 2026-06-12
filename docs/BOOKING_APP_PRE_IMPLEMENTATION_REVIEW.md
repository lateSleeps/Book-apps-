# Booking App — Pre-Implementation Design Review

**Tanggal:** 2026-06-12
**Dokumen yang direview:** `docs/BOOKING_APP_WIREFRAME.md`
**Format:** KEEP / REVISE / REMOVE / PHASE 2

---

## Ringkasan Eksekutif

Wireframe benar dalam memilih domain dan menolak duplikasi dengan Operasional.
Struktur dasarnya defensible. Tapi ada lima masalah fundamental yang harus
diselesaikan sebelum satu baris kode ditulis:

1. Section C adalah grouping palsu — dua field yang tidak punya hubungan logis
2. "Batas Waktu Bayar" dan "Kode Booking" bukan setting owner — ini implementation detail yang menyamar jadi UX
3. Mode pembayaran dan jumlah deposit punya dependency yang tidak diakui wireframe
4. SegmentedControl salah digunakan sebagai toggle switch
5. Kode Promo tidak bisa diimplementasikan dengan bermakna sampai customer app punya validation endpoint

---

## Section A — Metode Pembayaran

### KEEP: Konsep toggle rows dengan sub-row kondisional

Toggle list per payment method adalah keputusan yang benar. iOS pakai pola ini di Settings > Notifications dan Settings > Wi-Fi. Setiap metode punya state dan konfigurasinya sendiri. Sub-row yang muncul saat toggle ON adalah pattern yang terbukti mengurangi cognitive load — tidak ada konfigurasi yang terlihat sampai fiturnya diaktifkan.

Warning inline jika semua toggle OFF — keep. Ini bukan toast. Dampaknya persisten (customer tidak bisa booking sama sekali), jadi warning-nya harus persisten juga.

---

### REVISE: SegmentedControl bukan komponen yang tepat untuk toggle

Wireframe menyebut "Toggle: `SegmentedControl` bukan native checkbox". Ini salah.

`SegmentedControl` di Settings V2 adalah komponen untuk memilih satu dari beberapa opsi yang saling eksklusif — digunakan sebagai tab navigation (Ketersediaan / Aturan Booking di Operasional). Menggunakannya untuk on/off toggle merusak semantik komponen.

Payment method toggle adalah binary: aktif atau tidak aktif. Ini butuh `ToggleSwitch` — komponen yang belum ada di Settings V2. Ini adalah **kebutuhan komponen baru** yang wireframe sembunyikan dengan istilah "toggle".

**Yang perlu dibuat:** `ToggleSwitch` shared component (`bg-tx-primary` saat ON, `bg-bd-card` saat OFF, animasi thumb slide, `aria-checked`). Ini terpisah dari `SegmentedControl`. Setelah ini ada, baru Section A bisa diimplementasi.

---

### REVISE: QRIS upload sebaiknya lewat SideSheet, bukan inline file picker

Wireframe bilang "tap → buka native file picker langsung (bukan SideSheet)".

Masalahnya:

- Settings V2 punya konvensi: semua edit lewat SideSheet. Inline file picker adalah exception yang tidak punya precedent di halaman lain.
- QRIS image butuh konteks: ukuran berapa? Format apa? Crop atau tidak? Preview sebelum save penting — customer akan melihat gambar ini. Native file picker tidak memberikan preview.
- `SettingsUploadField` sudah ada di `components/shared/` dan handle semua ini.

**Revisi:** Sub-row "Foto QRIS" tap → `SettingsSideSheet` dengan satu `SettingsUploadField`. Konsisten dengan cara field lain di-edit.

---

### KEEP: Rekening Bank sebagai sub-row Transfer Bank

Logika yang benar. Rekening bank hanya relevan kalau transfer bank diaktifkan. Menempatkannya sebagai sub-row kondisional lebih baik daripada menempatkannya di section terpisah.

Detail SideSheet rekening (bank name select + nomor + nama pemilik) — wajar dan cukup untuk Phase 1.

---

## Section B — Deposit & Waktu Bayar

### REVISE: Urutan rows salah — Mode Pembayaran harus pertama

Wireframe menempatkan "Mode Pembayaran" sebagai baris ketiga:

```
Jumlah Deposit    Rp 20.000  >
Batas Waktu Bayar  5 Menit   >
Mode Pembayaran   DP + Pelunasan  >
```

Ini terbalik. "Mode Pembayaran" (Lunas Saja / DP + Pelunasan / Bebas) adalah keputusan utama. "Jumlah Deposit" adalah konsekuensinya — hanya relevan jika mode bukan "Lunas Saja".

Kalau owner memilih "Lunas Saja", baris "Jumlah Deposit" tidak boleh terlihat. Bukan disabled — tidak ada. Wireframe tidak mengakui dependency ini.

**Urutan yang benar:**

```
Mode Pembayaran   DP + Pelunasan  >   ← selalu tampil
Jumlah Deposit    Rp 20.000       >   ← hanya muncul jika mode bukan "Lunas Saja"
Batas Waktu Bayar  5 Menit        >
```

---

### REMOVE: "Batas Waktu Bayar" tidak boleh ada di Phase 1

"Berapa menit countdown timer sebelum slot dilepas jika customer tidak bayar" bukan sebuah business decision yang owner salon buat. Owner tidak punya pendapat tentang ini. Mereka tidak tahu apa itu `SLOT_RESERVATION_SECONDS`.

Yang mereka tahu: "kalau customer tidak bayar, slot saya kembali bebas". Kapan? Tidak peduli — yang penting ada batasnya.

Ini adalah technical parameter yang perlu ada di database untuk sistem berjalan, tapi tidak perlu dikonfigurasi oleh owner. Hardcode 5 menit di Phase 1. Expose di Phase 2 hanya jika ada salon yang benar-benar meminta fleksibilitas ini.

Memajang field ini di halaman settings mengajarkan owner bahwa ini adalah hal yang perlu mereka pikirkan. Itu salah.

**Verdict: REMOVE dari wireframe. Hardcode di controller.**

---

### KEEP: Jumlah Deposit sebagai value row (dengan revisi posisi)

Konsep tepat. Nilai deposit adalah keputusan bisnis nyata yang owner buat: "saya minta DP berapa dari customer?" Ini bukan technical parameter. Ini ada di sini dengan alasan yang benar.

---

## Section C — Konfirmasi & Identitas Booking

### REMOVE: Section ini adalah grouping palsu

Section C berisi dua field:

1. Batas Konfirmasi Otomatis
2. Kode Booking (prefix "BK")

Keduanya dikelompokkan sebagai "hal yang terjadi setelah booking dibuat". Ini adalah post-hoc rationalization, bukan pengelompokan yang bermakna. Satu field tentang workflow owner (kapan booking dikonfirmasi), satu lagi tentang identifier teknis (prefix string di kode booking). Tidak ada hubungan logisnya dari perspektif owner.

---

### REVISE: "Batas Konfirmasi Otomatis" — framing salah

Field ini benar ada di Booking App. Tapi cara wireframe menyajikannya salah.

"Batas Konfirmasi Otomatis: 60 Menit" — ini adalah framing engineer.

Owner tidak berpikir: "saya mau konfirmasi otomatis setelah 60 menit". Owner berpikir: **"apakah saya mau konfirmasi booking sendiri, atau biarkan otomatis?"**

Framing yang benar adalah pilihan workflow, bukan timer:

```
Konfirmasi Booking
Setiap booking yang masuk...   Otomatis dikonfirmasi  >
```

Saat tap → SideSheet → `SettingsSelect`:

- "Otomatis dikonfirmasi" (default — cocok untuk owner yang tidak aktif pantau)
- "Saya konfirmasi sendiri" (manual — untuk owner yang selektif terima booking)

Timer (berapa menit) adalah detail implementasi. Untuk Phase 1, kalau owner pilih "Otomatis", hardcode 60 menit. Expose timer di Phase 2 hanya untuk salon yang butuh kontrol lebih presisi.

**Konsekuensi arsitektur:** "Konfirmasi Booking" ini bisa berpindah ke Section B dan bergabung dengan Mode Pembayaran + Jumlah Deposit sebagai satu section "Alur Booking". Ketiganya menjawab: "bagaimana booking ini diproses?"

---

### REMOVE: "Kode Booking" (prefix) bukan setting owner

Wireframe mengakui sendiri bahwa ini adalah bug fix dari contract audit (`constants.ts` pakai "RB", router pakai "BK"). Artinya field ini muncul bukan karena kebutuhan UX, tapi karena ada teknikal debt yang perlu diselesaikan.

Pertanyaan yang harus dijawab: apakah ada satu salon owner nyata yang peduli prefix kode booking mereka adalah "BK" vs "RB" vs "SL"?

Tidak ada. Tidak ada owner salon di Indonesia yang pernah komplain tentang prefix kode booking di tiket customer. Ini adalah angka internal untuk tracking bookings. Owner tidak punya domain expertise atau alasan bisnis untuk mengonfigurasinya.

**Verdict:** Fix bug-nya di layer kode (standardize ke "BK"), hapus dari UI. Kalau suatu hari ada salon franchise yang minta custom prefix, itu adalah Phase 3.

Section C sebagai section terpisah tidak perlu ada. "Konfirmasi Booking" pindah ke Section B. Kode Booking dihapus.

---

## Section D — Kode Promo

### PHASE 2: Kode Promo tidak bisa diimplementasikan bermakna di Phase 1

Ini bukan tentang apakah fitur ini berguna — berguna. Ini tentang apakah fitur ini bisa bekerja di Phase 1.

Kode promo di owner settings hanya punya value kalau customer app memvalidasi kode tersebut saat checkout. `StepConfirm.tsx` di customer app sudah punya input field promo code, tapi validasinya hardcoded dan tidak terhubung ke database. Tidak ada endpoint `validatePromoCode(salonId, code)`.

Kalau kita bangun management promo di owner settings Phase 1 (mock in-memory), owner bisa membuat 10 kode promo yang tidak pernah bekerja di customer app. Itu bukan "Phase 1 mock" — itu feature yang misleading.

**Lebih dalam:** Promo system yang bermakna butuh lebih dari yang wireframe define:

- `maxUses` — berapa kali kode bisa dipakai total sebelum expired by usage
- `singleUsePerCustomer` — apakah satu customer bisa pakai kode yang sama dua kali
- `minimumOrderAmount` — apakah ada minimum nilai booking

Tanpa tiga field ini, promo system tidak bisa dipakai untuk campaign nyata. Salon yang punya 30 customer aktif akan langsung mengeksploitasi kode tanpa batas kalau tidak ada maxUses.

**Verdict:** Pindahkan ke Phase 2. Di Phase 1, tampilkan placeholder "coming soon" atau hapus sama sekali dari scope. Jangan bangun setengah fitur.

---

## Pertanyaan yang Belum Dijawab Wireframe

### 1. Bagaimana owner mengkomunikasikan syarat dan ketentuan booking ke customer?

Customer melihat step-by-step booking flow. Di mana owner bisa menulis:

- "Keterlambatan lebih dari 15 menit dianggap tidak hadir"
- "Kami tidak menerima cancellasi di hari H"
- "Pembayaran DP tidak dapat dikembalikan"

Ini adalah **kebijakan salon**, bukan booking rules teknis. Booking rules ada di Operasional. Tapi teks kebijakan yang customer baca di checkout — tidak ada di wireframe ini, tidak ada di domain lain. Ini adalah gap.

Ini tidak harus di Booking App. Bisa di Brand (karena itu bagian dari identitas/kebijakan salon). Tapi harus ada di satu tempat. Wireframe ini harus acknowledge gap ini.

---

### 2. Satu rekening bank cukup? Tidak untuk salon yang berkembang

Wireframe mengasumsikan satu rekening bank. Salon dengan 10+ staff yang sudah memproses transfer secara aktif sering punya dua rekening: satu BCA (yang paling umum), satu Mandiri (backup). Ini bukan edge case — ini sangat umum.

Struktur `bankAccount: BankAccount | null` (singular) di types perlu menjadi `bankAccounts: BankAccount[]` sejak awal. Mengubah dari singular ke plural setelah ada data di database adalah migration yang menyakitkan.

**Keputusan arsitektur yang perlu dibuat sekarang**, bukan Phase 2.

---

### 3. Apakah deposit opsional atau wajib?

Wireframe mendeskripsikan "Mode Pembayaran" sebagai pilihan antara Lunas Saja / DP + Pelunasan / Bebas. Tapi tidak menjawab: kalau mode "DP + Pelunasan" — apakah deposit WAJIB untuk semua layanan?

Bagaimana dengan layanan yang harganya Rp 30.000 tapi deposit ditetapkan Rp 50.000? Apakah deposit bisa melebihi harga layanan?

Bagaimana dengan layanan "Cuci Blow" yang harganya Rp 85.000 — apakah deposit Rp 20.000 masuk akal? Tapi untuk "Highlight Full" Rp 750.000, deposit Rp 20.000 terlalu kecil.

Mungkin deposit seharusnya **persentase** (30% dari total), bukan nominal fixed. Atau mungkin ada per-service deposit. Wireframe tidak menyentuh ini sama sekali. Ini adalah business logic gap yang akan menjadi support ticket di Phase 2.

---

## Verdict Akhir per Item

| Item                                                 | Verdict                                 | Alasan                                            |
| ---------------------------------------------------- | --------------------------------------- | ------------------------------------------------- |
| Section A: konsep toggle per payment method          | **KEEP**                                | Pola yang tepat, familiar dari iOS                |
| Section A: SegmentedControl sebagai toggle           | **REVISE**                              | Butuh `ToggleSwitch` baru, bukan SegmentedControl |
| Section A: QRIS upload via inline file picker        | **REVISE**                              | Pakai SideSheet + SettingsUploadField             |
| Section A: Rekening Bank sebagai sub-row Transfer    | **KEEP**                                | Dependency yang benar                             |
| Section A: Warning jika semua payment OFF            | **KEEP**                                | Inline persistent warning tepat                   |
| Section B: Mode Pembayaran                           | **KEEP** (pindah ke row pertama)        | Keputusan utama owner                             |
| Section B: Jumlah Deposit                            | **KEEP** (kondisional pada mode)        | Business decision nyata                           |
| Section B: Batas Waktu Bayar                         | **REMOVE**                              | Technical param, bukan keputusan owner            |
| Section C: sebagai section terpisah                  | **REMOVE**                              | Grouping palsu                                    |
| Section C: Batas Konfirmasi Otomatis                 | **KEEP** (pindah ke Section B, reframe) | Business concern nyata, tapi framing salah        |
| Section C: Kode Booking prefix                       | **REMOVE**                              | Bukan setting owner, ini teknikal debt            |
| Section D: Kode Promo                                | **PHASE 2**                             | Membutuhkan validation endpoint di customer app   |
| Types: `bankAccount: BankAccount \| null` (singular) | **REVISE**                              | Harus plural dari awal                            |
| Kebijakan salon (T&C text)                           | **GAP**                                 | Belum ada di domain manapun                       |
| Deposit sebagai nominal vs persentase                | **GAP**                                 | Business logic belum diputuskan                   |

---

## Wireframe Revisi — Struktur yang Diusulkan

```
SettingsPageShell
  |
  +-- [A] Metode Pembayaran
  |     QRIS [toggle]
  |       └── Foto QRIS (jika ON) → SideSheet + SettingsUploadField
  |     Transfer Bank [toggle]
  |       └── Rekening Bank (jika ON) → SideSheet
  |     Tunai [toggle]
  |     [warning jika semua OFF]
  |
  +-- [B] Alur Booking
  |     Mode Pembayaran         DP + Pelunasan  >
  |     Jumlah Deposit          Rp 20.000       >   (hilang jika mode = Lunas Saja)
  |     Konfirmasi Booking      Otomatis        >
```

Dua section, bukan empat. Lebih sedikit scroll. Tidak ada field yang membingungkan.

---

## Komponen Baru yang Wajib Ada Sebelum Implementasi

| Komponen       | Kenapa wajib                                                               |
| -------------- | -------------------------------------------------------------------------- |
| `ToggleSwitch` | Section A tidak bisa dibangun tanpa ini. SegmentedControl bukan pengganti. |

`ToggleSwitch` harus masuk ke `settings/components/shared/` dan di-export dari `shared/index.ts`.
Ini adalah prerequisite, bukan optional. Kalau wireframe ditulis tanpa mengakui ini,
implementor akan menggunakan workaround yang menciptakan inkonsistensi UX.
