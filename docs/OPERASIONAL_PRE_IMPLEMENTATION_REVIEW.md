# Operasional - Pre-Implementation UX Review

**Tanggal:** 2026-06-12
**Scope:** Challenge review sebelum implementasi dimulai.
**Input:** `OPERASIONAL_AUDIT.md`, `OPERASIONAL_INFORMATION_ARCHITECTURE.md`,
`OPERASIONAL_WIREFRAME.md`

---

## Challenge 1 — "3 Penutupan Aktif" vs "Berikutnya"

### Pertanyaan

Apakah angka total penutupan aktif membantu owner salon?
Atau informasi "berikutnya" yang lebih bernilai?

### Analisis

Wireframe saat ini menampilkan keduanya dalam satu strip:

```
| 3 penutupan aktif         Berikutnya: 17 Agt 2026 |
```

Ini terlihat intuitif, tapi mengandung masalah ketika diperiksa lebih dekat.

**"N penutupan aktif" adalah metadata sistem, bukan informasi bisnis.**

Owner salon tidak bertanya "berapa tanggal tutup yang sudah saya daftarkan?"
Owner bertanya "apakah ada sesuatu yang perlu saya persiapkan minggu ini?"
Angka total adalah jawaban untuk pertanyaan pertama yang tidak pernah ditanya.

Bandingkan dua kondisi:

```
Kondisi 1: 3 penutupan aktif   | Berikutnya: 17 Agt 2026
Kondisi 2: 1 penutupan aktif   | Berikutnya: 17 Agt 2026
```

Di kondisi 2, "1 penutupan aktif" tidak menambahkan informasi apapun
di atas "Berikutnya: 17 Agt 2026" yang sudah memberitahu ada satu
tanggal mendatang. Strip menjadi redundan dengan dirinya sendiri.

**Masalah kedua: "aktif" adalah framing yang ambigu.**

Wireframe mendefinisikan "aktif" = belum lewat. Tapi framing ini membuat owner
bertanya "aktif versus apa? Versus yang sudah lewat? Versus yang dinonaktifkan?"
Kata yang lebih jelas adalah "mendatang".

**Masalah ketiga: strip dua kolom menciptakan skema baca yang tidak natural.**

Owner membaca kiri ke kanan. Urutan "3 mendatang → Berikutnya: 17 Agt" artinya
owner membaca angka dulu, lalu tanggal spesifik. Urutan yang lebih natural adalah
kebalikannya: tanggal spesifik dulu (ini yang actionable), lalu konteks berapa
banyak yang ada.

**"Berikutnya" adalah satu-satunya informasi yang bernilai di strip ini.**

Nilai "Berikutnya" adalah karena:

- Memberitahu owner bahwa ada sesuatu yang dekat
- Memberikan tanggal konkret yang bisa di-act on
- Mengurangi kebutuhan owner untuk membaca seluruh list

Ketika tidak ada tanggal mendatang, strip tidak perlu tampil sama sekali.
Ketika ada satu tanggal mendatang, cukup tampilkan tanggal itu.
Ketika ada beberapa, tampilkan yang paling dekat + berapa lagi yang ada
sebagai informasi kontekstual ringan ("+ 2 lainnya"), bukan hitungan total.

### Keputusan

**REVISI.** Strip dirancang ulang.

### Rekomendasi

Ganti strip dua kolom dengan satu baris kontekstual yang kontennya berubah
berdasarkan kondisi:

```
Kondisi: tidak ada tanggal mendatang
-> Strip tidak tampil. Empty state + tombol tambah sudah cukup.

Kondisi: 1 tanggal mendatang
-> "Penutupan berikutnya: Senin, 17 Agt 2026 - Hari Kemerdekaan"

Kondisi: 2+ tanggal mendatang
-> "Penutupan berikutnya: Senin, 17 Agt 2026 - Hari Kemerdekaan  (+2 lainnya)"
```

Format "+2 lainnya" di kanan berfungsi ganda: memberitahu ada lebih banyak
tanggal (contextual count) tanpa menjadi metrik utama yang mendominasi.

Warna strip: tetap `bg-bg-control` (neutral). Bukan `bg-st-upcoming-bg`
karena ini informasi, bukan peringatan.

---

## Challenge 2 — Auto-save vs Explicit Save

### Pertanyaan

Setting Operasional langsung mempengaruhi perilaku booking customer.
Apakah auto-apply tanpa save button adalah keputusan yang aman?

### Analisis

Wireframe menggunakan satu model untuk semua section: auto-apply, tidak ada
save button. Ini adalah over-simplification. Tiga section memiliki profil risiko
yang berbeda.

---

#### Section A — Jam Operasional

**Profil risiko: Sedang, tapi dengan mitigasi bawaan.**

Mengubah jam buka atau mematikan satu hari berpotensi membuat customer tidak
bisa booking di hari tersebut. Namun, feedback visual langsung (baris fade,
"Tutup" muncul) membuat owner sadar segera bahwa perubahan terjadi. Perubahan
ini juga terlokalisasi: mengubah satu baris tidak mempengaruhi hari lain.

Auto-apply dapat diterima di sini karena:

- Feedback visual immediate
- Scope perubahan terbatas (satu hari)
- Mudah di-reverse (check kembali checkbox)

**Rekomendasi Section A: Auto-apply diterima, dengan satu syarat.**

Saat Phase 2 (terhubung ke Supabase), setiap save ke business hours harus
disertai undo toast: _"Jadwal Senin diperbarui. [Batalkan]"_ dengan window
5 detik. Ini bukan bagian dari Phase 1 (mock), tapi harus direncanakan dari
sekarang agar state shape controller mendukungnya.

---

#### Section B — Hari Libur

**Profil risiko: Rendah untuk tambah, sedang untuk hapus.**

Menambah tanggal: tidak ada konsekuensi segera. Customer yang sudah booking
di tanggal tersebut tidak terpengaruh karena tanggal tutup hanya memblokir
booking baru.

Menghapus tanggal: berpotensi membuka kembali slot di hari yang seharusnya
tutup. Ini adalah perubahan yang tidak disengaja paling berbahaya di Section B.
Namun, wireframe berargumen ini "low-stakes, mudah ditambah ulang."

Argumen ini sebagian benar: secara teknis mudah ditambah ulang. Tapi dari
perspektif owner yang tidak terlalu tech-savvy, "mudah ditambah ulang" hanya
benar jika mereka sadar bahwa penghapusan terjadi dan tahu cara menambahnya
kembali. Kalau owner salah klik hapus dan tidak sadar, konsekuensinya nyata.

**Rekomendasi Section B: Hapus dengan undo toast, bukan konfirmasi dialog.**

Konfirmasi dialog ("Yakin ingin menghapus?") terlalu interruptive untuk aksi
yang bisa di-reverse. Namun hapus tanpa feedback sama sekali terlalu silent.

Solusi tengah: hapus langsung tapi tampilkan undo toast _"Natal dihapus.
[Batalkan]"_ selama 5 detik. Ini adalah pola yang dipakai Gmail, Notion,
Linear - aksi dilakukan immediately tapi ada jendela undo yang singkat.

Ini juga lebih konsisten dengan pola `cancelInvite` di Pengguna & Akses yang
memang tidak punya konfirmasi, karena invite bisa dibuat ulang.

---

#### Section C — Aturan Booking

**Profil risiko: Tinggi. Ini adalah satu-satunya section yang bermasalah
dengan auto-apply.**

Mengubah "Batas Pembatalan" dari 2 jam ke 24 jam langsung mengubah kebijakan
yang berlaku untuk SEMUA customer yang akan membatalkan ke depan. Mengubah
"Interval Slot" dari 30 ke 15 menit mengubah tampilan kalender booking customer
secara struktural.

Perbedaan fundamental antara Section A dan Section C:

|                 | Section A                      | Section C                                                     |
| --------------- | ------------------------------ | ------------------------------------------------------------- |
| Scope perubahan | Satu hari                      | Semua booking ke depan                                        |
| Feedback visual | Immediate, visible di layar    | Tidak ada di halaman Operasional                              |
| Reversibility   | Trivial (check ulang checkbox) | Trivial teknis, tapi owner tidak tahu dampaknya sudah terjadi |
| Frequency       | Jarang (setup once)            | Jarang, tapi policy-level                                     |

Yang membuat Section C berbeda adalah: **dampaknya tidak terlihat di halaman
Operasional itu sendiri.** Owner mengubah "Interval Slot" dari 30 ke 15 menit
dan tampilan halaman tidak berubah sama sekali - semua field tetap terlihat
normal. Dampak nyata ada di customer app, bukan di layar owner saat itu.

Ini adalah kondisi di mana auto-apply tanpa feedback yang jelas bisa membuat
owner melakukan perubahan yang tidak disengaja tanpa sadar.

**Rekomendasi Section C: Auto-apply dengan perubahan undo toast yang spesifik.**

Tidak direkomendasikan menambahkan explicit save button hanya untuk Section C,
karena ini menciptakan inkonsistensi pada halaman yang sama. Satu halaman
tidak boleh punya dua interaction model.

Solusi: Auto-apply untuk semua section (konsisten), TAPI Section C menampilkan
undo toast dengan deskripsi yang lebih informatif tentang dampak perubahan:

```
Section A toast:  "Jadwal Senin diperbarui."
Section B toast:  "Natal dihapus."
Section C toast:  "Interval slot diubah ke 15 menit.
                   Slot booking customer akan berubah."
```

Toast untuk Section C secara eksplisit menyebutkan bahwa ada dampak ke customer
app. Ini adalah perbedaan yang meaningful dalam komunikasi risiko.

Ini bukan Phase 1 concern (mock tidak perlu toast). Tapi harus masuk sebagai
requirement untuk Phase 2 sebelum tRPC diintegrasikan.

---

### Keputusan

**REVISI sebagian.** Auto-apply dipertahankan sebagai model interaksi tunggal,
tapi dengan gradasi feedback yang berbeda per section.

### Rekomendasi Final: Model Interaksi Tiga Level

| Section                | Model Phase 1        | Model Phase 2                                            |
| ---------------------- | -------------------- | -------------------------------------------------------- |
| A - Jam Operasional    | Auto-apply, no toast | Auto-apply + undo toast "Jadwal X diperbarui"            |
| B - Hari Libur (hapus) | Langsung hapus       | Undo toast "X dihapus. Batalkan?"                        |
| C - Aturan Booking     | Auto-apply, no toast | Auto-apply + undo toast yang menyebut dampak ke customer |

Satu prinsip yang harus masuk ke controller sejak Phase 1:
**setiap mutation harus bisa di-undo** (return previous state). Bukan karena
Phase 1 butuh undo UI, tapi karena jika controller tidak dirancang untuk itu
dari awal, Phase 2 akan membutuhkan refactor controller bukan hanya UI.

---

## Challenge 3 — Apakah Perlu Operational Summary Block?

### Pertanyaan

Haruskah ada summary block di atas halaman yang menampilkan:
jam buka, booking window, dan penutupan berikutnya dalam satu view?

### Analisis

Argumen PRO summary block paling kuat adalah: **owner sering datang ke halaman
ini hanya untuk mengecek, bukan mengubah.** Misalnya staf baru bertanya "kapan
salon kita buka?" - owner buka Operasional, cek, tutup. Summary block membuat
flow ini lebih cepat tanpa harus scroll ke Section A.

Namun, tiga hal melemahkan argumen ini:

**1. Section A sudah menjawab "kapan buka" dalam < 3 detik.**

Wireframe membuktikan ini dengan tabel 7 baris. Owner yang landing di halaman
Operasional langsung melihat tabel jam buka karena itu adalah Section pertama
dan paling atas. Summary block tidak memberikan penghematan kognitif yang
signifikan untuk informasi yang sudah di bagian paling atas.

**2. Summary block menciptakan dua source of truth visual.**

Jika summary menampilkan "Senin-Jumat: 09:00-20:00" dan Section A
menampilkan hal yang sama dalam bentuk tabel, owner mungkin bertanya "yang
mana yang saya edit?" dan "kalau saya ubah di tabel, summary ikut berubah?"
Ini adalah cognitive overhead yang tidak perlu.

Masalah ini tidak ada jika summary adalah read-only dan jelas tidak bisa diedit.
Tapi perbedaan antara "bisa diedit" dan "tidak bisa diedit" harus dikomunikasikan
secara visual, yang membutuhkan styling khusus yang menambah kompleksitas desain.

**3. Page load position menghilangkan nilai summary.**

Owner yang membuka halaman Operasional akan landing di bagian paling atas.
Jika summary ada di atas, lalu Section A (jam buka) ada tepat di bawahnya,
owner akan melihat informasi yang sama dua kali dalam satu scroll. Duplikasi
ini lebih mengganggu dari membantu.

Summary block memiliki nilai berbeda jika halaman ini panjang dan Section A
ada jauh ke bawah. Tapi wireframe menempatkan Section A sebagai section
pertama - jarak dari landing ke informasi jam buka adalah nol.

**Kapan summary block tepat:**

Summary block tepat ketika halaman berisi banyak section dan pengguna ingin
tahu "apa kondisi saat ini" tanpa harus scroll dan scan semua section.
Contoh yang tepat: halaman dengan 8+ section, atau halaman di mana kondisi
bisa "error/warning" sehingga summary berfungsi sebagai status indicator.

Halaman Operasional Phase 1 memiliki 4 section, dan tiga di antaranya
adalah active configuration (bukan status report). Summary untuk 4 section
tidak memberikan nilai lebih dari membaca section-nya langsung.

**Satu use case yang valid untuk summary: completion status saat onboarding.**

Ketika owner pertama kali setup salon, summary block bisa berfungsi sebagai
"setup checklist":

```
[ ] Jam Operasional     Dikonfigurasi
[ ] Hari Libur          Belum ada tanggal
[x] Aturan Booking      Menggunakan default
```

Ini adalah nilai yang berbeda dari "ringkasan nilai" - ini adalah "ringkasan
kelengkapan." Tapi ini adalah fitur onboarding, bukan fitur halaman settings.

### Keputusan

**DITOLAK untuk Phase 1.** Summary block tidak ditambahkan.

### Rationale

Section A yang sudah optimal (tabel baris, scannable < 3 detik) menghilangkan
kebutuhan utama summary block. Menambahkan summary akan menciptakan duplikasi
dan menambah total tinggi halaman tanpa memberikan nilai proporsional.

Untuk Phase 2, summary block bisa dipertimbangkan dalam konteks yang berbeda:
sebagai onboarding setup completion indicator, bukan sebagai informasi review.
Ini adalah keputusan Phase 2 yang harus dievaluasi ulang dengan data penggunaan.

---

## Final Recommendations

### Keputusan yang Dipertahankan dari Wireframe

| Keputusan                                    | Alasan Dipertahankan                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| Tabel baris untuk Section A                  | Optimal untuk "baca semua 7 hari sekaligus". Tidak ada alternativ yang lebih baik. |
| Tidak ada kalender penuh di Section B        | Overkill untuk 5-10 tanggal per tahun. Strip + list sudah cukup.                   |
| Grid dua kolom untuk Section C               | Semua 4 field terlihat sekaligus, tidak ada scrolling ekstra.                      |
| Placeholder disabled untuk Section D         | Lebih honest dari menyembunyikan.                                                  |
| Semua pilihan dropdown sebagai enum terbatas | Owner bukan software engineer. Free input menambah risiko nilai invalid.           |
| Tidak ada save button di halaman             | Konsistensi dengan Settings V2 dan pola settings modern.                           |

---

### Keputusan yang Direvisi

#### Revisi 1: Summary Strip Section B

**Dari:**

```
| 3 penutupan aktif         Berikutnya: 17 Agt 2026 |
```

**Menjadi:**

```
0 tanggal mendatang  -> strip tidak tampil
1 tanggal mendatang  -> "Berikutnya: Senin, 17 Agt 2026 - Hari Kemerdekaan"
2+ tanggal mendatang -> "Berikutnya: Senin, 17 Agt 2026 - Hari Kemerdekaan  (+2 lainnya)"
```

**Alasan:** "N penutupan aktif" adalah metadata sistem bukan informasi bisnis.
"Berikutnya" adalah satu-satunya informasi yang actionable. "+N lainnya" sebagai
konteks sekunder cukup.

---

#### Revisi 2: Hapus Tanggal di Section B

**Dari:** Hapus langsung tanpa feedback.

**Menjadi:** Hapus langsung + undo toast _"[label] dihapus. [Batalkan]"_ selama 5 detik.

**Alasan:** Silent delete untuk tanggal tutup terlalu berisiko. Undo toast
adalah middle ground antara konfirmasi dialog (terlalu interruptive) dan no
feedback (terlalu silent). Ini adalah requirement untuk Phase 2, tidak perlu
untuk Phase 1 mock.

---

#### Revisi 3: Diferensiasi Toast per Section (Phase 2 Requirement)

Bukan revisi untuk Phase 1, tapi keputusan yang harus masuk ke
implementation plan sekarang:

- Section A toast: _"Jadwal [Hari] diperbarui."_
- Section B toast: _"[Label] dihapus. [Batalkan]"_
- Section C toast: _"[Nama setting] diubah ke [nilai baru]. Booking customer akan terpengaruh."_

Toast Section C secara eksplisit menyebut dampak ke customer karena perubahan
di Section C tidak terlihat di layar owner - dampaknya ada di customer app.

---

#### Revisi 4: Controller Harus Menyimpan Previous State

Bukan revisi UI, tapi requirement controller yang harus direncanakan sekarang
agar tidak menjadi refactor besar saat Phase 2:

Setiap mutation di `useOperasionalController` harus dapat menghasilkan
"revert to previous" tanpa fetch ulang dari Supabase. Ini bisa sesederhana
menyimpan satu level history per field yang terakhir diubah.

---

### Status Blocker

Tidak ada blocker baru yang ditemukan dari review ini. Empat revisi di atas
adalah perbaikan incremental, bukan perubahan arsitektur. Wireframe tetap valid
sebagai referensi implementasi dengan catatan revisi yang sudah dicatat.

---

### Ringkasan Final untuk Implementasi

```
Section A - Jam Operasional
  Layout:     Tabel baris, 7 baris tetap          <- PERTAHANKAN
  Interaksi:  Auto-apply, immediate visual feedback <- PERTAHANKAN
  Phase 2:    Tambahkan undo toast per baris       <- CATAT

Section B - Hari Libur
  Layout:     Strip kontekstual + list ascending   <- REVISI (strip)
  Strip:      "Berikutnya: [tanggal]" + "+N lainnya" saja  <- REVISI
  Hapus:      Auto-delete + undo toast             <- REVISI
  Tambah:     Side sheet kecil (date + label)      <- PERTAHANKAN
  Empty:      SettingsEmptyState + CalendarX icon  <- PERTAHANKAN

Section C - Aturan Booking
  Layout:     Grid 2 kolom, SettingsFieldGroup      <- PERTAHANKAN
  Kontrol:    SettingsSelect, enum terbatas          <- PERTAHANKAN
  Interaksi:  Auto-apply                             <- PERTAHANKAN
  Phase 2:    Toast informatif tentang dampak        <- CATAT

Section D - Otomasi
  Layout:     Placeholder disabled                   <- PERTAHANKAN
  Badge:      "Segera Hadir"                         <- PERTAHANKAN

Summary Block: Tidak ada                             <- DITOLAK

Save button:  Tidak ada                             <- PERTAHANKAN
```
