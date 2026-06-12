# Operasional - UX Wireframe

**Tanggal:** 2026-06-12
**Berdasarkan:** `OPERASIONAL_AUDIT.md`, `OPERASIONAL_INFORMATION_ARCHITECTURE.md`
**Scope:** UX design dan visual hierarchy. Bukan implementasi, bukan kode.

---

## Layout Hierarchy

Halaman Operasional mengikuti pola Settings V2 yang sudah ada: satu kolom,
`SettingsPageShell` sebagai wrapper, section dipisah dengan jarak vertikal.
Tidak ada sidebar tambahan. Tidak ada tab.

```
SettingsPageShell
  |
  +-- [A] Jam Operasional        <- SettingsContentCard
  |
  +-- [B] Hari Libur             <- SettingsContentCard
  |
  +-- [C] Aturan Booking         <- SettingsContentCard
  |
  +-- [D] Otomasi (Phase 2)      <- SettingsContentCard, disabled state
```

Setiap section adalah card terpisah (`rounded-r16 bg-bg-card shadow-card`),
konsisten dengan pola Brand, Produk & Paket, dan Pengguna & Akses.

Urutan section = urutan kepentingan fungsional. Owner yang baru membuka halaman
ini untuk pertama kali harus langsung melihat jam buka sebagai hal pertama.

---

## Section A — Jam Operasional

### Keputusan Layout: Tabel Baris, Bukan Card, Bukan Accordion

**Dipilih:** Tabel baris (flat list, 7 baris tetap).

**Alasan:**

Jam buka salon adalah informasi yang harus bisa dibaca sekaligus, bukan satu per
satu. Owner perlu menjawab "kapan salon buka?" dalam satu tatapan - bukan dengan
membuka accordion satu per satu, bukan dengan scroll melalui 7 card.

Accordion buruk di sini karena: 7 item yang semuanya sama-sama penting tidak
memiliki hierarki bawaan yang membenarkan collapsing. Accordion tepat untuk
konten yang panjang dan jarang dilihat sekaligus. Ini bukan kasus itu.

Card per hari buruk karena: menghabiskan space vertikal yang tidak perlu,
dan visual weight yang sama untuk 7 hari menciptakan kesan bahwa masing-masing
adalah entitas terpisah, padahal secara konsep ini adalah satu konfigurasi
mingguan yang dibaca sebagai satu blok.

Tabel baris optimal karena: density yang tepat (7 baris muat dalam satu layar),
pola yang sudah familiar dari `WeeklyScheduleSection` di Tim, dan owner bisa
scan vertikal dengan cepat untuk melihat mana hari yang buka dan tutup.

---

### Wireframe Section A

```
+------------------------------------------------------------------+
| Jam Operasional                                                  |
| Atur hari dan jam salon buka setiap minggunya.                   |
+------------------------------------------------------------------+
|  [ header row - bg-bg-header ]                                   |
|  Hari               Jam Buka        Jam Tutup       Durasi       |
+------------------------------------------------------------------+
|  [x] Senin          09:00     ->    20:00           11 jam       |
|  [x] Selasa         09:00     ->    20:00           11 jam       |
|  [x] Rabu           09:00     ->    20:00           11 jam       |
|  [x] Kamis          09:00     ->    20:00           11 jam       |
|  [x] Jumat          09:00     ->    20:00           11 jam       |
|  [x] Sabtu          09:00     ->    18:00            9 jam       |
|  [ ] Minggu         Tutup                                        |
+------------------------------------------------------------------+
```

**Detail per baris:**

- Kolom 1 (Hari): checkbox + label hari. Ketika unchecked, baris menjadi
  `opacity-50` dan jam input disembunyikan, diganti teks "Tutup" berwarna
  `text-tx-subtle`. Ini identik dengan pola di `WeeklyScheduleSection.tsx`.

- Kolom 2-3 (Jam Buka / Jam Tutup): `<input type="time">` dengan style yang
  konsisten dengan pola existing di `WeeklyScheduleSection`. Visible hanya
  saat hari aktif.

- Kolom 4 (Durasi): kalkulasi otomatis `closeTime - openTime`, tampil sebagai
  `text-tx-subtle`. Read-only, bukan input. Fungsi: visual confirmation bahwa
  jam yang dimasukkan masuk akal (owner langsung sadar jika durasi 1 jam atau
  negatif karena salah ketik).

- Separator antar baris: `border-b border-bd-row`.

- Baris Minggu default tutup (unchecked). Ini paling umum untuk salon Indonesia.

**Interaksi:**

- Checkbox toggle: immediate effect ke visual baris (fade + hide inputs).
- Tidak ada save button per baris. Setiap perubahan auto-apply ke state.
- Tidak ada konfirmasi untuk perubahan jam (low-stakes, reversible).

**Empty state:** Tidak ada empty state untuk section ini. Selalu ada 7 baris.
Default seed data sudah terisi sehingga bukan blank slate.

---

### Apple Review - Section A

**Kelebihan:**

- Scannable dalam satu tatapan. Owner bisa jawab "kapan buka?" dalam < 2 detik.
- Kolom Durasi sebagai feedback langsung mencegah error jam terbalik.
- Familiar: pola identik dengan WeeklyScheduleSection yang owner mungkin sudah pakai di Tim.
- Density tepat: 7 baris tidak terlalu padat, tidak terlalu sparse.

**Kekurangan:**

- Tidak ada cara cepat untuk "copy jam ke semua hari" (misal: semua hari sama kecuali Sabtu-Minggu).
  Owner harus ubah satu per satu jika ingin mengubah jam buka dari 09:00 ke 10:00 untuk semua hari.
- `<input type="time">` styling di browser berbeda-beda, terutama di mobile.
  Ini masalah implementasi, bukan masalah UX wireframe - tapi harus dicatat.

**Mengapa dipilih:**
Tabel baris adalah satu-satunya format yang memenuhi syarat "jawab kapan buka dalam < 3 detik".
Trade-off "tidak ada bulk edit" diterima karena frekuensi perubahan jam buka sangat rendah -
owner mengatur ini sekali saat setup, jarang berubah.

---

## Section B — Hari Libur & Penutupan Khusus

### Keputusan Layout: Summary Strip + Daftar Tanggal

**Dipilih:** Summary strip di atas + list tanggal di bawah, bukan kalender penuh.

**Alasan:**

Kalender penuh (grid bulan) terlalu mahal secara visual dan kognitif untuk
use case ini. Owner tidak perlu melihat kalender bulan untuk mengelola 3-5
tanggal libur per tahun. Kalender penuh tepat untuk membuat jadwal, bukan
untuk mengelola daftar exception.

Yang dibutuhkan owner adalah:

1. Berapa tanggal tutup yang aktif? (summary angka)
2. Mana yang paling dekat? (prioritized list)
3. Tambah / hapus tanggal. (aksi)

Summary strip menjawab pertanyaan 1 dan 2 dalam satu tatapan. List di
bawahnya menjawab pertanyaan 3.

---

### Wireframe Section B

```
+------------------------------------------------------------------+
| Hari Libur & Penutupan                       [+ Tambah Tanggal] |
| Tanggal spesifik saat salon tutup.                               |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------------------------------------------------+  |
|  |  3 penutupan aktif         Berikutnya: 17 Agt 2026        |  |
|  +------------------------------------------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
|  17 Agt 2026 - Senin                                            |
|  Hari Kemerdekaan                                    [ Hapus ]  |
+--  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  --+
|  25 Des 2026 - Jumat                                            |
|  Natal                                               [ Hapus ]  |
+--  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  --+
|  1 Jan 2027 - Jumat                                             |
|  Tahun Baru                                          [ Hapus ]  |
+------------------------------------------------------------------+
```

**Detail Summary Strip:**

Strip dengan `bg-bg-control` atau `bg-st-upcoming-bg` (subtle, bukan alert).
Dua informasi: jumlah penutupan aktif (tanggal yang belum lewat) + tanggal
berikutnya. Tanggal yang sudah lewat tidak ikut dihitung dalam "aktif".

- Jika tidak ada tanggal tutup: strip tidak ditampilkan, diganti
  `SettingsEmptyState` dengan pesan dan tombol tambah.

- "Berikutnya:" hanya tampil jika ada tanggal yang belum lewat. Jika semua
  tanggal sudah lewat (misal: tahun lama lupa dibersihkan), strip tetap tampil
  tapi hanya tunjukkan angka, tanpa "Berikutnya:".

**Detail List:**

- Diurutkan ascending by date (paling dekat di atas).
- Tanggal yang sudah lewat: tetap tampil tapi dengan `opacity-50` dan label
  "(Sudah lewat)". Owner bisa hapus manual, tidak auto-delete.
- Setiap baris: tanggal + nama hari + label + tombol hapus.
- Tombol hapus: langsung hapus tanpa konfirmasi dialog (low-stakes, mudah
  ditambah ulang). Ini mengikuti pola `cancelInvite` di Pengguna yang juga
  tidak konfirmasi untuk aksi yang easily reversible.
- Separator antar baris: dashed atau `border-b border-bd-row`.

**Aksi "Tambah Tanggal":**

Tombol `SettingsAddButton` di header section (pola dari Pengguna & Akses,
Layanan, Tim). Membuka `SettingsSideSheet` kecil dengan dua field:

- Date picker (input type="date" atau native date picker)
- Label / nama hari libur (text input, opsional)

Sheet ini sederhana, tidak perlu lebih dari itu.

**Empty State:**

```
+------------------------------------------------------------------+
| Hari Libur & Penutupan                       [+ Tambah Tanggal] |
| Tanggal spesifik saat salon tutup.                               |
+------------------------------------------------------------------+
|                                                                  |
|    [icon kalender]                                               |
|    Belum ada tanggal tutup                                       |
|    Tambahkan hari libur nasional atau penutupan                  |
|    khusus salon.                                                 |
|                                                                  |
|                        [+ Tambah Tanggal]                        |
|                                                                  |
+------------------------------------------------------------------+
```

Menggunakan `SettingsEmptyState` yang sudah ada dengan ikon `CalendarX`
dari Phosphor Icons.

---

### Apple Review - Section B

**Kelebihan:**

- Summary strip menjawab "berapa penutupan aktif" dan "mana yang berikutnya"
  tanpa harus membaca seluruh list.
- List diurutkan by date - informasi paling relevan (paling dekat) ada di atas.
- Tanggal sudah lewat tetap tampil tapi visually de-emphasized - owner tahu
  ada data lama tanpa terganggu olehnya.
- Tidak ada kalender penuh = tidak ada complexity yang tidak perlu.

**Kekurangan:**

- Tidak ada visual "ini hari apa" selain label teks. Tidak ada mini-calendar
  preview saat memilih tanggal. Ini bisa menyulitkan owner yang tidak hafal
  kalender.
- Tidak ada cara untuk menandai "buka setengah hari" - hanya biner tutup/buka.
  Ini adalah keterbatasan yang diterima untuk Phase 1.

**Mengapa dipilih:**
Summary strip + list adalah pattern yang paling umum di aplikasi produktivitas
(Google Calendar blocking dates, Shopify closed dates, dst). Kalender penuh
adalah overkill untuk 5-10 tanggal per tahun. Pattern ini meminimalkan
cognitive load tanpa mengorbankan informasi.

---

## Section C — Aturan Booking

### Keputusan Layout: Grid Dua Kolom, Bukan Vertical Stack Form

**Dipilih:** Grid 2 kolom dengan label di kiri dan kontrol di kanan,
dikelompokkan dalam satu card tanpa sub-header per field.

**Alasan:**

Vertical stack form (`label di atas, input di bawah, lalu label, input, dst`)
menciptakan halaman yang sangat panjang untuk 4 field. Ini adalah kelemahan
umum di settings page: form yang terasa seperti checkout wizard padahal isinya
hanya beberapa pilihan.

Grid 2 kolom (`label + deskripsi singkat | kontrol`) adalah pola yang Apple
dan Google pakai di System Preferences / Settings. Ini tepat karena:

1. Semua 4 setting terlihat sekaligus dalam satu card.
2. Label di kiri memberi konteks, kontrol di kanan langsung bisa diubah.
3. Tidak ada scrolling ekstra untuk melihat semua aturan booking.

---

### Wireframe Section C

```
+------------------------------------------------------------------+
| Aturan Booking                                                   |
| Mengatur kapan dan bagaimana customer bisa melakukan booking.    |
+------------------------------------------------------------------+
|                                                                  |
|  Interval Slot                                                   |
|  Jarak minimum antar slot waktu yang         [ 30 menit  v ]    |
|  ditawarkan ke customer.                                         |
|                                                                  |
+--  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  --+
|                                                                  |
|  Pemesanan Minimum                                               |
|  Minimal berapa jam sebelum layanan           [ 2 jam     v ]   |
|  customer masih bisa booking.                                    |
|                                                                  |
+--  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  --+
|                                                                  |
|  Batas Booking ke Depan                                          |
|  Seberapa jauh ke depan customer              [ 30 hari   v ]   |
|  bisa memesan.                                                   |
|                                                                  |
+--  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  --+
|                                                                  |
|  Batas Pembatalan                                                |
|  Minimal berapa jam sebelum layanan           [ 2 jam     v ]   |
|  customer masih bisa membatalkan.                                |
|                                                                  |
+------------------------------------------------------------------+
```

**Detail per baris:**

Setiap baris adalah satu `SettingsFieldGroup` yang sudah ada, dengan layout:

- Kiri: label (`text-ts-fn font-medium text-tx-primary`) + deskripsi satu baris
  (`text-ts-cap1 text-tx-secondary`)
- Kanan: `SettingsSelect` dengan pilihan yang terbatas

Pilihan dropdown per field:

- **Interval Slot:** 15 menit / 30 menit / 45 menit / 60 menit
- **Pemesanan Minimum:** 1 jam / 2 jam / 4 jam / 6 jam / 12 jam / 24 jam
- **Batas Booking ke Depan:** 7 hari / 14 hari / 30 hari / 60 hari / 90 hari
- **Batas Pembatalan:** 1 jam / 2 jam / 4 jam / 6 jam / 12 jam / 24 jam

Semua pilihan adalah enum terbatas (bukan free-text input). Alasan: owner
salon bukan software engineer. Memberi input numerik bebas (ketik "2" untuk
2 jam) membuka kemungkinan input yang tidak valid dan menambah cognitive load.
Pilihan terbatas langsung menunjukkan opsi yang masuk akal.

**Separator antar field:** dashed separator (`border-dashed border-bd-row`),
lebih ringan dari solid - memberi jarak visual tanpa membuat section terasa
seperti tabel.

**Tidak ada Save button:** Setiap perubahan auto-apply. Konsisten dengan
Section A. Untuk Phase 1 (in-memory mock), ini aman karena tidak ada API call.
Saat tRPC diintegrasikan, perlu ditambahkan optimistic update + error toast.

---

### Apple Review - Section C

**Kelebihan:**

- Semua 4 setting terlihat dalam satu card tanpa scroll.
- Dropdown terbatas mengurangi kemungkinan input invalid.
- Label + deskripsi singkat per baris memberi konteks langsung tanpa owner
  harus membuka tooltip atau dokumentasi.
- Tidak ada save button = less friction untuk mengubah setting.

**Kekurangan:**

- Dropdown dengan pilihan terbatas tidak fleksibel. Jika owner butuh "3 jam"
  untuk lead time tapi pilihannya hanya "2 jam" atau "4 jam", ini jadi masalah.
  Solusi: tambahkan "Custom..." di bawah dropdown yang membuka input numerik
  sebagai escape hatch - defer ke Phase 2.
- Tidak ada preview dampak perubahan. Jika interval slot diubah dari 30 ke 15
  menit, owner tidak tahu artinya "jumlah slot per hari berlipat dua". Informasi
  ini bisa ditambahkan sebagai inline footnote - defer ke Phase 2.

**Mengapa dipilih:**
Grid label-kontrol adalah pola paling mature untuk settings page yang berisi
sedikit field dengan nilai terbatas. Ini lebih baik dari vertical form stack
karena semua informasi terlihat sekaligus, dan lebih baik dari card per field
karena tidak menciptakan visual weight yang berlebihan.

---

## Section D — Otomasi (Phase 2)

### Keputusan: Tampilkan Placeholder Disabled, Jangan Sembunyikan

**Dipilih:** Tampilkan section dengan state disabled/locked, bukan
menyembunyikan sama sekali.

**Alasan:**

Menyembunyikan section Phase 2 sepenuhnya menciptakan masalah ekspektasi:
owner yang mendengar tentang fitur reminder akan mencari di mana mengaturnya
dan tidak menemukannya - ini menciptakan support ticket dan kebingungan.

Placeholder disabled adalah pola yang lebih honest: owner tahu fitur ini ada,
tahu bahwa ini "coming soon", dan tahu di mana akan ditemukan ketika sudah
tersedia. Ini lebih baik dari menghilangkan sama sekali.

Placeholder disabled TIDAK boleh terlihat seperti fitur yang rusak. Harus
jelas bahwa ini adalah fitur yang belum tersedia, bukan error.

---

### Wireframe Section D

```
+------------------------------------------------------------------+
| Otomasi                                              [Segera Hadir] |
| Pengiriman notifikasi otomatis ke customer.                      |
+------------------------------------------------------------------+
|                                                                  |
|  [opacity-50]                                                    |
|                                                                  |
|  Pengingat H-1                                                   |
|  Kirim pengingat 1 hari sebelum jadwal.      [toggle - off]     |
|                                                                  |
|  Pengingat Hari H                                                |
|  Kirim pengingat di hari layanan.            [toggle - off]     |
|                                                                  |
|  Konfirmasi Otomatis                                             |
|  Kirim konfirmasi saat booking dibuat.       [toggle - off]     |
|                                                                  |
|  [footnote kecil]                                                |
|  Fitur ini membutuhkan integrasi WhatsApp atau                   |
|  Email. Tersedia di update berikutnya.                           |
|                                                                  |
+------------------------------------------------------------------+
```

**Detail:**

- Badge "Segera Hadir" di kanan header section, menggunakan token yang sudah
  ada: `bg-st-upcoming-bg text-st-upcoming` atau `bg-bg-control text-tx-subtle`.
- Seluruh konten section: `opacity-50 pointer-events-none`.
- Toggle dalam state disabled (semua off, tidak bisa diklik).
- Footnote di bawah menjelaskan alasan (butuh integrasi WA/Email) bukan
  sekadar "coming soon" yang tidak informatif.
- Tidak ada border atau styling khusus yang menandai "ini section berbeda" -
  cukup dengan badge dan opacity.

**Alternatif yang ditolak:**

- Sembunyikan sepenuhnya: owner tidak tahu fitur ini ada.
- Tampilkan tapi tampilkan loading spinner: menyesatkan.
- Redirect ke halaman lain: tidak ada halaman lain untuk ini.

---

### Apple Review - Section D

**Kelebihan:**

- Mengatur ekspektasi tanpa menyesatkan.
- Owner tahu di mana setting ini akan berada saat Phase 2 rilis.
- Footnote yang eksplisit tentang dependency (WA/Email) mencegah pertanyaan
  "kenapa belum aktif?"

**Kekurangan:**

- Section yang disabled bisa terasa seperti halaman yang tidak selesai
  (unpolished). Ini adalah trade-off yang diterima secara sadar.
- Owner mungkin mencoba mengklik toggle dan bingung kenapa tidak bergerak.
  `cursor-not-allowed` pada hover adalah mitigation yang cukup.

**Mengapa dipilih:**
Placeholder honest lebih baik daripada feature yang invisible. Apple sendiri
melakukan ini dengan fitur yang butuh hardware/subscription tertentu -
mereka tampilkan tapi dengan state "not available" yang jelas. Ini pola yang
matang dan tidak menipu pengguna.

---

## Component Mapping

### Komponen yang Bisa Di-reuse (Sudah Ada)

| Komponen                | Lokasi                                     | Dipakai di Section                                     |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------ |
| `SettingsPageShell`     | `layout/SettingsPageShell.tsx`             | Wrapper halaman                                        |
| `SettingsContentCard`   | `layout/SettingsContentCard.tsx`           | Semua section                                          |
| `SettingsSectionHeader` | `layout/SettingsSectionHeader.tsx`         | Header semua section                                   |
| `SettingsAddButton`     | `components/shared/SettingsAddButton.tsx`  | Section B header                                       |
| `SettingsSideSheet`     | `layout/SettingsSideSheet.tsx`             | Sheet tambah tanggal (B)                               |
| `SettingsFieldGroup`    | `components/shared/SettingsFieldGroup.tsx` | Setiap baris di Section C                              |
| `SettingsSelect`        | `components/shared/SettingsSelect.tsx`     | Semua dropdown di Section C                            |
| `SettingsInput`         | `components/shared/SettingsInput.tsx`      | Input label di sheet Section B                         |
| `SettingsEmptyState`    | `components/shared/SettingsEmptyState.tsx` | Empty state Section B                                  |
| `EntityActionMenu`      | `components/shared/EntityActionMenu.tsx`   | Aksi hapus di Section B (opsional, bisa inline button) |

Pattern checkbox + time input dari `WeeklyScheduleSection.tsx` di Tim
digunakan sebagai referensi implementasi untuk Section A, tapi **tidak
di-import** - dibuat ulang di komponen baru.

---

### Komponen yang Perlu Dibuat Baru

| Komponen                  | Section | Deskripsi Singkat                                            |
| ------------------------- | ------- | ------------------------------------------------------------ |
| `BusinessHoursGrid`       | A       | 7 baris tetap, checkbox + time inputs + durasi kalkulasi     |
| `ClosingDateList`         | B       | List tanggal tutup + summary strip                           |
| `ClosingDateSummaryStrip` | B       | Strip "N penutupan aktif / berikutnya: X"                    |
| `ClosingDateRow`          | B       | Satu baris: tanggal + label + hapus                          |
| `ClosingDateSheet`        | B       | Side sheet add: date picker + label input                    |
| `BookingPolicySection`    | C       | Assembler 4 field dengan SettingsFieldGroup + SettingsSelect |

`BusinessHoursGrid` adalah komponen yang paling kompleks karena mengelola
state 7 hari dengan interaksi per baris. Sisanya relatif sederhana.

**Tidak ada komponen baru yang dibutuhkan untuk Section D.** Section D murni
presentasional: HTML + CSS + komponen existing yang di-disable.

---

## Data Density Review

### Section A: Jam Operasional

- **7 baris**, masing-masing berisi checkbox + label + 2 time input + durasi.
- Estimasi tinggi per baris: `py-s12` = ~48px per baris. Total 7 baris: ~336px.
- **Verdict: Tepat.** Tidak terlalu padat (ada breathing room `py-s12`),
  tidak terlalu sparse. Semua 7 hari muat dalam satu layar tanpa scroll
  pada viewport 1024px+.

### Section B: Hari Libur

- Summary strip: satu baris, ~44px.
- List item: ~56px per baris (dua baris teks: tanggal + label).
- Dengan 3-5 tanggal: ~280px total untuk list + strip.
- **Verdict: Tepat.** Density rendah adalah bagus di sini karena list ini
  jarang diisi banyak. Empty state harus terasa "bersih", bukan "kosong".

### Section C: Aturan Booking

- 4 field, masing-masing ~64px (label + deskripsi + kontrol dalam satu baris).
- Total: ~256px.
- **Verdict: Tepat.** 4 field dalam satu card terlihat informasi-dense tapi
  tidak overwhelming. Grid 2-kolom mengoptimalkan horizontal space.

### Section D: Otomasi (Placeholder)

- 3 field disabled: ~192px.
- **Verdict: Sedikit wasteful** karena semua tidak bisa diinteraksi.
  Mitigasinya: opacity-50 secara visual mengkomunikasikan bahwa ini bukan
  konten prioritas, jadi mata owner tidak terlalu lama berhenti di sini.

### Total Estimasi Tinggi Halaman

```
Section A: ~380px  (header + 7 baris + padding)
Section B: ~340px  (header + strip + 3-5 item atau empty state)
Section C: ~300px  (header + 4 field)
Section D: ~240px  (header + 3 field disabled)
Gap antar section: 4 x 24px = ~96px

Total: ~1.356px
```

Pada viewport 1024px (laptop standar), halaman membutuhkan scroll sekitar
1-1.5x. Ini acceptable untuk settings page. Bukan halaman yang bisa dilihat
sekaligus, tapi tidak excessively long.

---

## Interaction Model Summary

### Prinsip Utama

1. **Auto-apply, no Save button.** Perubahan langsung tersimpan ke state.
   Tidak ada "Simpan" di bawah halaman. Konsisten dengan pola settings
   modern (Settings di iOS/Android, Notion, Linear).

2. **Destructive actions tanpa konfirmasi** untuk hal yang mudah di-undo:

   - Hapus tanggal tutup: langsung hapus, tidak ada dialog.
   - Uncheck hari di Section A: langsung tutup, tidak ada dialog.

3. **Destructive actions dengan konfirmasi** hanya jika impak nyata:

   - Di Phase 1 tidak ada aksi yang membutuhkan ini di halaman Operasional.

4. **Disabled state untuk Phase 2** harus `pointer-events-none`, bukan
   interaktif tapi tidak berfungsi. Perbedaan penting dari perspektif UX.

5. **Tidak ada inline error** untuk Phase 1 (in-memory mock). Error handling
   dipersiapkan di level controller untuk Phase 2 (tRPC + Supabase).

### Edge Cases yang Harus Ditangani

| Edge Case                                               | Behavior                                                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Semua hari dimatikan (semua unchecked)                  | Tidak ada validasi. Owner boleh set salon tutup total. Customer app yang handle (tampilkan "saat ini tidak menerima booking").              |
| Jam tutup lebih awal dari jam buka                      | Durasi tampil sebagai "-" atau "0 jam". Tidak ada blocking error. Warning visual (warna merah di durasi) cukup.                             |
| Tanggal tutup yang sudah lewat                          | Tetap tampil dengan `opacity-50` + label "(Sudah lewat)". Tidak auto-delete.                                                                |
| Duplikat tanggal tutup                                  | Jika owner menambahkan tanggal yang sudah ada, tampilkan inline error di sheet: "Tanggal ini sudah ditambahkan."                            |
| Interval slot lebih besar dari durasi layanan terpendek | Tidak divalidasi di Operasional. Ini adalah konflik antar domain (Operasional vs Layanan) yang diselesaikan di booking engine customer app. |
