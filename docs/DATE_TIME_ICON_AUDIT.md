# Date & Time Input Icon Audit

**Tanggal:** 2026-06-12
**Status:** SELESAI. Build clean (tsc --noEmit: 0 error).

---

## Temuan

### Violation yang Ditemukan

Seluruh `<input type="date">` dan `<input type="time">` di Settings V2
menampilkan native browser picker indicator (ikon kalender/jam bawaan OS/browser).
Icon ini tidak mengikuti library standar project (`@phosphor-icons/react`, weight duotone)
dan terlihat berbeda dari ikon di sidebar, settings nav, dan form controls lainnya.

Selain itu, `TIME_INPUT_CLASS` didefinisikan duplikat di dua file terpisah:

- `WeeklyScheduleSection.tsx`
- `OperationalPageClient.tsx`

Tidak ada shared component untuk compact time input, sehingga setiap file
mengimplementasikan style dan markup sendiri.

---

## File yang Teridentifikasi

| File                                                          | Tipe Input                                         | Masalah                                                                  |
| ------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| `settings/components/shared/SettingsInput.tsx`                | generic — termasuk `type="date"` dan `type="time"` | Tidak ada icon overlay, native indicator tampil                          |
| `settings/components/team/sections/WeeklyScheduleSection.tsx` | `type="time"` compact                              | `TIME_INPUT_CLASS` lokal, native clock icon, duplikasi                   |
| `settings/components/operasional/OperationalPageClient.tsx`   | `type="time"` compact + `type="date"` via sheet    | `TIME_INPUT_CLASS` lokal, native indicator, duplikasi                    |
| `settings/components/team/sections/LeaveSection.tsx`          | `type="date"` via `SettingsInput`                  | Inherit dari SettingsInput — fix otomatis setelah SettingsInput diupdate |

---

## Perubahan yang Dibuat

### 1. `SettingsInput.tsx` — Extended

Ditambahkan deteksi otomatis untuk `type="date"` dan `type="time"`.

**Sebelum:**

```tsx
return <input ref={ref} className={cn(inputClass, className)} {...props} />;
```

**Sesudah:**

```tsx
if (type === 'date' || type === 'time') {
  const Icon = type === 'date' ? CalendarBlank : Clock;
  return (
    <div className="relative">
      <input
        type={type}
        className={cn(inputClass, 'pr-s40', PICKER_INDICATOR_HIDDEN, className)}
        ...
      />
      <Icon size={14} weight="duotone" className="pointer-events-none absolute right-s12 top-1/2 -translate-y-1/2 text-tx-secondary" />
    </div>
  );
}
```

**Icon yang dipakai:**

- `type="date"` → `CalendarBlank` weight="duotone" size=14 color=tx-secondary
- `type="time"` → `Clock` weight="duotone" size=14 color=tx-secondary

**Native indicator handling:**

```
[&::-webkit-calendar-picker-indicator]:absolute
[&::-webkit-calendar-picker-indicator]:inset-0
[&::-webkit-calendar-picker-indicator]:h-full
[&::-webkit-calendar-picker-indicator]:w-full
[&::-webkit-calendar-picker-indicator]:cursor-pointer   ← picker masih bisa diklik
[&::-webkit-calendar-picker-indicator]:opacity-0        ← tapi tidak terlihat
```

Picker functionality tetap penuh — klik di mana saja pada field akan membuka
native date/time picker. Hanya visual indicator yang diganti dengan Phosphor icon.

**Call sites yang mendapat fix otomatis (tanpa code change):**

- `LeaveSection.tsx` — `<SettingsInput type="date">` sudah fix
- `OperationalPageClient.tsx` holiday sheet — `<SettingsInput type="date">` sudah fix

---

### 2. `TimeInputInline.tsx` — Komponen Baru

Dibuat di `settings/components/shared/TimeInputInline.tsx`.

Menggantikan pola `<input type="time" className={TIME_INPUT_CLASS}>` yang sebelumnya
diduplikasi di dua file.

**Spesifikasi:**

- Sizing: `py-s4 pl-s8 pr-s24` (compact — cocok untuk table rows dan sheet day-rows)
- Border/bg: `rounded-r8 border border-bd-card bg-bg-input`
- Focus ring: `focus:border-tx-secondary focus:ring-1 focus:ring-tx-secondary`
- Icon: `Clock` weight="duotone" size=11 color=tx-secondary, `right-s6`
- Native indicator: hidden dengan teknik sama seperti SettingsInput

**Diekspor dari:** `settings/components/shared/index.ts`

---

### 3. `WeeklyScheduleSection.tsx` — Migrated

**Dihapus:** `TIME_INPUT_CLASS` constant lokal (8 baris)

**Diganti:** `<input type="time" className={TIME_INPUT_CLASS}>` → `<TimeInputInline>`

---

### 4. `OperationalPageClient.tsx` — Migrated

**Dihapus:** `TIME_INPUT_CLASS` constant lokal (4 baris)

**Diganti:** Raw `<input type="time">` di edit-hours sheet → `<TimeInputInline>`

---

## Icon Standar Setelah Migrasi

| Konteks                     | Icon            | Weight  | Size | Color        |
| --------------------------- | --------------- | ------- | ---- | ------------ |
| `SettingsInput type="date"` | `CalendarBlank` | duotone | 14   | tx-secondary |
| `SettingsInput type="time"` | `Clock`         | duotone | 14   | tx-secondary |
| `TimeInputInline` (compact) | `Clock`         | duotone | 11   | tx-secondary |

Semua dari `@phosphor-icons/react`. Konsisten dengan:

- Sidebar icons (duotone, tx-secondary)
- Settings nav icons (duotone)
- `ServicesAccordion` duration icon (`Clock` duotone)
- `PeriodSelector` calendar icon (`CalendarBlank` duotone)

---

## Design System Violations yang Diperbaiki

| Violation                                                        | Status                                          |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| Native browser calendar picker indicator tampil di `type="date"` | ✅ Fixed                                        |
| Native browser clock indicator tampil di `type="time"`           | ✅ Fixed                                        |
| `TIME_INPUT_CLASS` string constant duplikat di 2 file            | ✅ Fixed — replaced by `TimeInputInline`        |
| Compact time input tanpa shared component                        | ✅ Fixed — `TimeInputInline` sekarang di shared |
| Icon tidak dari `@phosphor-icons/react`                          | ✅ Fixed — semua dari phosphor, weight duotone  |
| Icon size/color hardcoded per-file                               | ✅ Fixed — dikontrol oleh shared component      |

---

## Catatan Browser

**Chrome / Edge / Safari:** Fix penuh — native indicator tersembunyi, Phosphor icon tampil.

**Firefox:** Firefox tidak menggunakan `::-webkit-calendar-picker-indicator`.
Firefox menampilkan UI date/time sendiri yang tidak bisa disembunyikan via CSS pseudo-element.
Phosphor icon tetap terrender di atas field, tetapi Firefox icon mungkin
juga terlihat pada Firefox. Acceptable untuk Phase 1 — mayoritas user
owner dashboard menggunakan Chrome/Edge/Safari.

---

## Komponen yang Tidak Berubah

| File                             | Alasan                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `history/PeriodSelector.tsx`     | Bukan input — hanya display icon `CalendarBlank` pada button trigger. Sudah correct (duotone). |
| `history/HistoryStatsRow.tsx`    | Display only, bukan input field.                                                               |
| `overview/AddVisitFAB.tsx`       | Bukan date input.                                                                              |
| `services/ServicesAccordion.tsx` | `Clock` untuk durasi display, bukan input.                                                     |
