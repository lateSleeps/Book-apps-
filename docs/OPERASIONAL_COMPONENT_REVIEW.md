# Operasional - Component Minimization Review

**Tanggal:** 2026-06-12
**Berdasarkan:** Semua dokumen Operasional + audit langsung source Settings V2
**Prinsip:** Reuse first. Extend second. Create last.

---

## Inventaris Komponen yang Diusulkan Wireframe

Wireframe mengusulkan 6 komponen baru + 1 assembler:

```
BusinessHoursGrid       (baru)
ClosingDateList         (baru)
ClosingDateSummaryStrip (baru)
ClosingDateRow          (baru)
ClosingDateSheet        (baru)
BookingPolicySection    (baru)
OperasionalPageClient   (baru - assembler utama)
```

Total file baru: **7**

---

## Challenge per Komponen

### 1. `BusinessHoursGrid`

**Pertanyaan:** Bisakah `SettingsListCard` + beberapa input menangani ini?

`SettingsListCard` API-nya: `title`, `description`, `imageUrl`, `badges`,
`actions`. Tidak ada slot untuk checkbox sebagai kontrol utama, tidak ada
slot untuk dua time input bersebelahan. Struktur komponen ini vertikal
(thumbnail kiri, teks kanan) - bukan grid tabular horizontal.

**Verdict: Tidak bisa menggunakan SettingsListCard.**

**Pertanyaan kedua:** Bisakah ini hanya berupa JSX di dalam `OperasionalPageClient`?

Ya. Pola yang identik sudah ada di `WeeklyScheduleSection.tsx`:

```tsx
// WeeklyScheduleSection - inner day rows (baris 263-333)
<div className="overflow-hidden rounded-r12 border border-bd-card bg-bg-card shadow-card">
  {schedule.days.map((dd) => (
    <div className="flex items-center gap-s12 px-s16 py-s12 border-b border-bd-row last:border-b-0">
      <input type="checkbox" checked={dd.enabled} ... />
      <span className="w-16">{DAY_LABELS[dd.day]}</span>
      <div className="flex flex-1 items-center gap-s8">
        <input type="time" ... />
        <span>→</span>
        <input type="time" ... />
      </div>
      <span className="w-12">{duration}</span>
    </div>
  ))}
</div>
```

Perbedaan BusinessHoursGrid dari WeeklyScheduleSection:

- Tidak ada StaffPicker header (Operasional tidak per-staf)
- Data dari `OperasionalDomain.businessHours`, bukan `TeamDomain`
- Logika durasi identik (`closeTime - openTime`)

Kompleksitasnya cukup untuk dijadikan **inline function component** di dalam
`OperasionalPageClient` (seperti `PenggunaTableHeader` di `PenggunaPageClient`),
bukan file terpisah.

**Verdict: Tidak perlu file baru. Inline function component dalam OperasionalPageClient.**

**Catatan time input:** `SettingsInput` tidak bisa dipakai langsung untuk time
input kompak karena padding default-nya `py-s12 px-s16` tidak bisa di-override
via `className` (Tailwind concatenation, bukan replacement). Gunakan raw
`<input type="time">` dengan `TIME_INPUT_CLASS` yang sama persis dengan
`WeeklyScheduleSection` - konstanta ini cukup didefinisikan ulang lokal
di `OperasionalPageClient`, tidak perlu di-export ke shared.

---

### 2. `ClosingDateList`

**Pertanyaan:** Apakah ini komponen atau sekadar JSX di dalam `OperasionalPageClient`?

`ClosingDateList` yang diusulkan adalah wrapper untuk:

- Conditional summary strip
- Map atas `specialClosingDates`
- `SettingsEmptyState` jika kosong

Tidak ada logika yang unik. Tidak ada state internal. Semua data datang
dari controller. Ini adalah komposisi 3-4 blok JSX yang bisa langsung
ditulis sebagai bagian dari render `OperasionalPageClient`.

Pola perbandingan: di `PenggunaPageClient`, tidak ada `PenggunaListWrapper`
sebagai komponen - tabel, empty state, dan content semuanya langsung di
render utama. Prinsip yang sama berlaku di sini.

**Verdict: Hapus. Inline ke OperasionalPageClient.**

---

### 3. `ClosingDateSummaryStrip`

**Pertanyaan:** Apakah ini komponen, atau 4 baris JSX?

Setelah revisi dari pre-implementation review, strip ini adalah:

```tsx
{
  upcomingDates.length > 0 && (
    <div className="rounded-r12 bg-bg-control px-s16 py-s12 text-ts-fn text-tx-secondary">
      Penutupan berikutnya: {formatDate(upcomingDates[0])} -{" "}
      {upcomingDates[0].label}
      {upcomingDates.length > 1 && (
        <span className="ml-s8 text-tx-muted">
          +{upcomingDates.length - 1} lainnya
        </span>
      )}
    </div>
  );
}
```

6 baris JSX. Tidak ada state, tidak ada props yang perlu ditype, tidak ada
reuse di halaman lain. Membuat komponen untuk ini adalah abstraksi prematur.

**Verdict: Hapus. 6 baris conditional JSX langsung di OperasionalPageClient.**

---

### 4. `ClosingDateRow`

**Pertanyaan:** Bisakah `SettingsListCard` digunakan?

`SettingsListCard` menghasilkan card individual (`rounded-r12 border bg-bg-card shadow-card`).
Untuk closing date rows yang berada di dalam section card, ini menghasilkan
card-within-card - visual yang salah, sama seperti kenapa Pengguna & Akses
beralih dari `SettingsListCard` ke CSS grid table.

**Pertanyaan kedua:** Bisakah row ini ditulis inline?

Ya. Pola yang dibutuhkan identik dengan pola row di `PenggunaPageClient`:

```tsx
<div className="flex items-center justify-between border-b border-bd-row px-s20 py-s14 last:border-b-0 hover:bg-bg-hover">
  <div>
    <p className="text-ts-fn font-medium text-tx-primary">
      {formatDate(date.date)} - {dayName}
    </p>
    <p className="text-ts-cap1 text-tx-secondary">{date.label || 'Tidak ada keterangan'}</p>
  </div>
  <button onClick={() => onRemove(date.id)} ...>Hapus</button>
</div>
```

Ini adalah div row dengan conditional styling untuk "sudah lewat". Tidak ada
logika yang membenarkan file terpisah.

**Verdict: Hapus. Inline row dalam map di OperasionalPageClient.**

---

### 5. `ClosingDateSheet`

**Pertanyaan:** Apakah ini komponen baru, atau `SettingsSideSheet` + konten standard?

`SettingsSideSheet` sudah memiliki semua yang dibutuhkan: header, scrollable body,
sticky footer dengan Batal/Simpan, `canSave` gating.

Konten sheet-nya adalah:

- `SettingsFieldGroup` + `SettingsInput type="date"` untuk tanggal
- `SettingsFieldGroup` + `SettingsInput` untuk label (opsional)

Ini adalah dua field standard. Pola identik dengan InviteSheetBody di
`PenggunaPageClient` yang ditulis sebagai inline function `InviteSheetBody`
di dalam file yang sama - bukan komponen terpisah.

`SettingsInput` support `type="date"` via `...props` spread - tidak ada
modifikasi yang diperlukan.

**Verdict: Hapus sebagai file terpisah. `SettingsSideSheet` + field standard,
body ditulis inline di OperasionalPageClient.**

---

### 6. `BookingPolicySection`

**Pertanyaan:** Bisakah `SettingsFieldGroup` + `SettingsSelect` menangani ini?

`SettingsFieldGroup` layout-nya `flex flex-col` (label di atas, input di bawah).
Section C menggunakan layout horizontal (label+deskripsi kiri, select kanan).
Ini berbeda - `SettingsFieldGroup` tidak bisa langsung digunakan tanpa modifikasi.

**Pilihan A: Extend `SettingsFieldGroup` dengan prop `direction: 'horizontal'`.**

Ini adalah ekstensi yang legitimate karena pola horizontal label-kontrol
adalah pattern yang mungkin dibutuhkan di halaman settings lain. Namun,
untuk satu halaman dengan 4 field, ini masih terasa prematur.

**Pilihan B: Gunakan raw div inline.**

4 field, pola yang sama. Layout per baris:

```tsx
<div className="flex items-center justify-between gap-s16 border-b border-bd-row last:border-b-0 px-s20 py-s16">
  <div className="flex flex-col gap-s2">
    <span className="text-ts-fn font-medium text-tx-primary">{label}</span>
    <span className="text-ts-cap1 text-tx-secondary">{description}</span>
  </div>
  <SettingsSelect className="w-40">...</SettingsSelect>
</div>
```

Karena pola ini diulang 4 kali dalam file yang sama, dan hanya di halaman ini,
Pilihan B lebih tepat. Tiga baris yang diulang 4 kali lebih baik dari abstraksi
prematur yang menciptakan komponen untuk satu use case.

**Verdict: Hapus sebagai komponen terpisah. Raw div rows di dalam
`SettingsContentCard`, `SettingsSelect` untuk kontrol.**

---

## Apakah Ada Yang Perlu Di-extend?

### `SettingsInput` — Tidak diperlukan untuk Phase 1

Time inputs di BusinessHoursGrid menggunakan pola kompak (`py-s4 px-s8`,
`rounded-r8`) yang tidak cocok dengan `SettingsInput` default (`py-s12 px-s16`,
`rounded-r10`). Solusi: definisikan `TIME_INPUT_CLASS` lokal di
`OperasionalPageClient`, konsisten dengan pola yang sudah ada di
`WeeklyScheduleSection`.

Jika di Phase 2 time input kompak dibutuhkan di halaman lain, baru pertimbangkan
menambahkan prop `size: 'compact' | 'default'` ke `SettingsInput`. Bukan sekarang.

### `SettingsFieldGroup` — Tidak diperlukan untuk Phase 1

Pola horizontal (label kiri, kontrol kanan) bisa divisualkan dengan raw divs
untuk 4 field di Section C. Jika pola ini muncul di halaman lain, tambahkan
`direction?: 'vertical' | 'horizontal'` ke `SettingsFieldGroup` pada saat itu.

### Tidak Ada Yang Perlu Di-extend Sekarang

Semua extension yang mungkin berguna di masa depan bisa defer sampai ada
kebutuhan kedua yang konkret. Phase 1 Operasional tidak memiliki use case
yang membenarkan modifikasi komponen shared.

---

## Komponen Final

### Digunakan Langsung (Reuse, Tanpa Modifikasi)

| Komponen                | Section    | Cara Pakai                                                                      |
| ----------------------- | ---------- | ------------------------------------------------------------------------------- |
| `SettingsPageShell`     | Wrapper    | Wrapper halaman, sama dengan semua settings page                                |
| `SettingsContentCard`   | A, B, C, D | Satu card per section, `padding="none"` agar inner rows punya full-bleed border |
| `SettingsSectionHeader` | A, B, C, D | Title + description, slot `action` untuk tambah tanggal di B                    |
| `SettingsAddButton`     | B          | Di `action` slot `SettingsSectionHeader`                                        |
| `SettingsSideSheet`     | B          | Sheet tambah tanggal tutup                                                      |
| `SettingsInput`         | B (sheet)  | Field label + date input dalam sheet                                            |
| `SettingsFieldGroup`    | B (sheet)  | Wrapper label + input dalam sheet                                               |
| `SettingsSelect`        | C          | 4 dropdown aturan booking                                                       |
| `SettingsEmptyState`    | B          | Empty state saat belum ada tanggal tutup                                        |

**Total komponen shared dipakai: 9**

### Tidak Dibutuhkan (Dihapus dari Proposal)

| Komponen Diusulkan        | Alasan Dihapus                                              |
| ------------------------- | ----------------------------------------------------------- |
| `ClosingDateList`         | Wrapper tanpa logika. Inline JSX.                           |
| `ClosingDateSummaryStrip` | 6 baris conditional JSX. Tidak butuh komponen.              |
| `ClosingDateRow`          | Pola row inline, identik dengan pola di PenggunaPageClient. |
| `ClosingDateSheet`        | SettingsSideSheet + SettingsFieldGroup sudah cukup.         |
| `BookingPolicySection`    | 4 div rows dengan SettingsSelect. Raw divs lebih tepat.     |

**Komponen dihapus: 5**

### Yang Harus Dibuat Baru

| Komponen                | Tipe      | Alasan Tidak Bisa Dihindari                                        |
| ----------------------- | --------- | ------------------------------------------------------------------ |
| `OperasionalPageClient` | File baru | Client component assembler yang memegang seluruh state. Wajib ada. |

Di dalam `OperasionalPageClient`, ada **inline function components** (tidak di-export,
tidak punya file sendiri):

| Inline Component    | Alasan                                                                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BusinessHoursGrid` | State-aware (toggle, time inputs, duration calc). Terlalu kompleks untuk raw JSX tapi tidak cukup besar untuk file terpisah. Pola identik dengan PenggunaTableHeader. |

**File baru yang dibuat: 1**

---

## Ringkasan Pengurangan

```
Proposal wireframe (file baru):
  BusinessHoursGrid       <- inline function dalam OperasionalPageClient
  ClosingDateList         <- hapus, inline JSX
  ClosingDateSummaryStrip <- hapus, 6 baris conditional JSX
  ClosingDateRow          <- hapus, inline div row
  ClosingDateSheet        <- hapus, SettingsSideSheet + field standard
  BookingPolicySection    <- hapus, raw div rows + SettingsSelect
  OperasionalPageClient   <- tetap ada

7 file baru
    ↓
1 file baru
```

**Pengurangan: 86% (6 dari 7 file dihilangkan)**

---

## Struktur File Final

```
apps/owner/src/
  app/dashboard/settings/operasional/
    page.tsx                              <- ganti stub, import OperasionalPageClient

  features/dashboard/
    components/settings/components/
      operasional/
        OperasionalPageClient.tsx         <- SATU-SATUNYA FILE BARU
          |
          |-- inline: BusinessHoursGrid() <- inline function, tidak di-export
          |-- uses: SettingsPageShell
          |-- uses: SettingsContentCard
          |-- uses: SettingsSectionHeader
          |-- uses: SettingsAddButton
          |-- uses: SettingsSideSheet
          |-- uses: SettingsFieldGroup
          |-- uses: SettingsInput
          |-- uses: SettingsSelect
          |-- uses: SettingsEmptyState

    hooks/settings/
      useOperasionalController.ts         <- domain types + mock state (lihat IA doc)
```

`useOperasionalController` bukan bagian dari component review ini, tapi
disebutkan untuk kelengkapan gambaran file yang perlu dibuat.

---

## Prinsip yang Diverifikasi

Setiap keputusan di atas mengikuti filosofi Pengguna & Akses:

**Pengguna & Akses (referensi):**

- PenggunaTableHeader: inline function, bukan file terpisah
- InviteSheetBody: inline function, bukan file terpisah
- EditSheetBody: inline function, bukan file terpisah
- Tidak ada komponen abstraksi untuk satu use case

**Operasional (mengikuti pola yang sama):**

- BusinessHoursGrid: inline function, bukan file terpisah
- Sheet body: inline content, bukan komponen
- Row items: inline divs, bukan komponen
- Strip: conditional JSX, bukan komponen
