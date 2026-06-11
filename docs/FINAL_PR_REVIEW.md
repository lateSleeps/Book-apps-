# Settings V2 — Final PR Review

**Tanggal:** 2026-06-12
**Reviewer mindset:** Staff Engineer pre-merge gate
**TypeScript compiler:** `tsc --noEmit` — 0 errors

---

## Verdict

**BLOCKER: 0**
**SHOULD FIX BEFORE MERGE: 12**
**SAFE TO MERGE: 8**

---

## BLOCKER

Tidak ada. TypeScript clean. Tidak ada runtime crash yang teridentifikasi.

---

## SHOULD FIX BEFORE MERGE

### [DS-1] `SettingsSideSheet.tsx:28` — Non-token spacing

```tsx
<div className="... p-4 ...">
```

`p-4` adalah Tailwind default. Harus `p-s16`. Ini bukan minor — ini adalah komponen shared yang dipakai oleh semua SideSheet di seluruh Settings V2.

**Fix:** Ganti `p-4` → `p-s16` di baris padding wrapping `{children}`.

---

### [DS-2] `OperationalPageClient.tsx:533` — Icon non-duotone

```tsx
<CaretRight size={14} weight="bold" className="shrink-0 text-tx-muted" />
```

Design system rule: semua icon `weight="duotone"`. `CaretRight` di policy rows menggunakan `weight="bold"`.

**Fix:** `weight="bold"` → `weight="duotone"`

---

### [DS-3] `EntityActionMenu.tsx:50` — Icon non-duotone

```tsx
<DotsThreeVertical size={16} weight="bold" />
```

`EntityActionMenu` adalah komponen shared. Trigger icon harus duotone.

**Fix:** `weight="bold"` → `weight="duotone"`

---

### [DS-4] `SettingsAddButton.tsx:21` — Icon non-duotone

```tsx
<Plus size={13} weight="bold" />
```

Komponen shared, dipakai di banyak halaman.

**Fix:** `weight="bold"` → `weight="duotone"`

---

### [DS-5] `SettingsUploadField.tsx:144` — Icon non-duotone

```tsx
<X size={14} weight="bold" />
```

Remove button di upload field.

**Fix:** `weight="bold"` → `weight="duotone"`

---

### [DS-6] `SettingsDangerZone.tsx:46` — Icon non-duotone

```tsx
<Warning size={16} weight="fill" className="shrink-0 text-ac-danger" />
```

**Fix:** `weight="fill"` → `weight="duotone"`. Warna `text-ac-danger` tetap memberikan visual emphasis.

---

### [DS-7] `PermissionSummaryCard.tsx:86` — Icon non-duotone

```tsx
{
  allowed ? <Check size={11} weight="bold" /> : <X size={11} weight="bold" />;
}
```

**Fix:** `weight="bold"` → `weight="duotone"` pada kedua icon.

---

### [DS-8] `BookingPagePreview.tsx:74,80` — Icon non-duotone

```tsx
<Phone size={11} weight="fill" className="text-tx-secondary" />
<MapPin size={11} weight="fill" className="text-tx-secondary" />
```

**Fix:** `weight="fill"` → `weight="duotone"` pada keduanya.

---

### [DS-9] `BundleForm.tsx:205` dan `QuestionForm.tsx:171` — Icon non-duotone

```tsx
{
  selected && <Check size={10} weight="bold" className="text-bg-card" />;
} // BundleForm
<Plus size={14} weight="bold" />; // QuestionForm
```

**Fix:** `weight="bold"` → `weight="duotone"` pada keduanya.

---

### [A11Y-1] `SettingsIconPicker.tsx:158-160` — Trigger button tidak accessible

```tsx
<button
  aria-haspopup="true"
  aria-expanded={open}
  title={currentEntry?.name ?? 'Pilih ikon'}
  ...>
```

`title` attribute tidak reliable untuk screen reader. Tombol trigger tidak memiliki `aria-label`. Jika icon picker belum ada value, screen reader tidak bisa mengidentifikasi tombol ini.

**Fix:** Tambah `aria-label={currentEntry?.name ?? 'Pilih ikon'}` di samping `title`.

---

### [A11Y-2] `PenggunaPageClient.tsx:141` — Row keyboard handler tidak lengkap

```tsx
onKeyDown={(e) => e.key === 'Enter' && onClick()}
```

Element memiliki `role="row"` dan `tabIndex={0}` — artinya accessible sebagai interactive element. ARIA spec mensyaratkan `Space` sebagai activation key untuk button-like elements, bukan hanya `Enter`.

**Fix:**

```tsx
onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
```

---

### [TS-1] `PenggunaPageClient.tsx:494,519` — Unsafe cast pada `user.role`

```typescript
// Line 494
const safeRole: InvitableRole =
  user.role === "OWNER" ? "ADMIN" : (user.role as InvitableRole);

// Line 519
const currentRank = ROLE_RANK[user.role as InvitableRole] ?? 0;
```

`OWNER` bukan bagian dari `InvitableRole`. Jika `user.role === 'OWNER'`, baris 494 sudah benar (masuk ke branch pertama). Tapi baris 519 langsung cast tanpa guard — jika role adalah `'OWNER'`, `ROLE_RANK['OWNER']` adalah `undefined`, di-null-coalesce ke `0`. Ini bukan crash, tapi logikanya tersembunyi.

**Fix line 519:**

```typescript
const roleForRank = user.role === "OWNER" ? "ADMIN" : user.role;
const currentRank = ROLE_RANK[roleForRank as InvitableRole] ?? 0;
```

---

## SAFE TO MERGE

### [TS-SAFE-1] `OperationalPageClient.tsx:338` — Cast `as SlotIntervalMinutes`

```typescript
ctrl.updateBookingPolicy({
  slotIntervalMinutes: draftPolicyValue as SlotIntervalMinutes,
});
```

`draftPolicyValue` di-set dari `Number(e.target.value)` di `<SettingsSelect>` yang option-nya adalah `SLOT_OPTIONS` (15 | 30 | 45 | 60 saja). Cast aman dalam praktik karena select options sudah membatasi nilai. Safe to merge.

---

### [TS-SAFE-2] Non-null assertions di `OperationalPageClient.tsx`

```typescript
sorted[0]!;
sorted[sorted.length - 1]!;
map.get(key)!.days.push(dow);
```

Semua bounded: `sorted[0]!` hanya dipanggil dalam branch yang sudah mengecek `days.length >= 2`. `map.get(key)!` dipanggil setelah `map.set(key, ...)` di baris sebelumnya. Safe to merge.

---

### [TS-SAFE-3] `as InvitableRole` dari `e.target.value` (line 253, 359, 651)

Select/SegmentedControl options dikontrol langsung oleh code — tidak ada nilai luar yang masuk. Safe to merge.

---

### [DS-SAFE-1] Avatar inline styles di `PenggunaPageClient.tsx` dan `StaffDirectorySection.tsx`

```tsx
style={{ background: bg, color: avatarText, fontSize: ... }}
```

Nilai bersumber dari `avatarColor()` runtime computation. Tidak ada Tailwind token untuk warna dinamis. Acceptable exception. Safe to merge.

---

### [DS-SAFE-2] Arbitrary sizing: `lg:w-[380px]`, `max-w-[140px]`, `min-w-[140px]`

Layout-specific constraints yang tidak memiliki token equivalent. Safe to merge.

---

### [DS-SAFE-3] Spacing minor di `SettingsPageHeader.tsx` (`gap-1.5`, `h-10`) dan `PenggunaPageClient.tsx` (`gap-0.5`)

Tidak ada token yang tepat untuk nilai ini. Visual tidak broken. Safe to merge — follow-up di sprint berikutnya.

---

### [A11Y-SAFE-1] `EntityActionMenu.tsx:44` — `aria-label="Aksi"`

Generic tapi functional. Screen reader dapat mengidentifikasi tombol. Safe to merge.

---

### [ARCH-SAFE-1] Outside-click pattern duplikat di 5 file

Logic yang sama di `EntityActionMenu`, `SettingsIconPicker`, `WeeklyScheduleSection`, `LeaveSection`, `ServiceAssignmentSection`. Kandidat untuk `useOutsideClick` hook. Tidak ada bug — refactor di sprint berikutnya. Safe to merge.

---

## Checklist Sebelum Merge

- [ ] `SettingsSideSheet.tsx:28` — `p-4` → `p-s16`
- [ ] `OperationalPageClient.tsx:533` — `CaretRight weight="bold"` → `weight="duotone"`
- [ ] `EntityActionMenu.tsx:50` — `DotsThreeVertical weight="bold"` → `weight="duotone"`
- [ ] `SettingsAddButton.tsx:21` — `Plus weight="bold"` → `weight="duotone"`
- [ ] `SettingsUploadField.tsx:144` — `X weight="bold"` → `weight="duotone"`
- [ ] `SettingsDangerZone.tsx:46` — `Warning weight="fill"` → `weight="duotone"`
- [ ] `PermissionSummaryCard.tsx:86` — `Check/X weight="bold"` → `weight="duotone"`
- [ ] `BookingPagePreview.tsx:74,80` — `Phone/MapPin weight="fill"` → `weight="duotone"`
- [ ] `BundleForm.tsx:205` + `QuestionForm.tsx:171` — `weight="bold"` → `weight="duotone"`
- [ ] `SettingsIconPicker.tsx:158` — tambah `aria-label` di trigger button
- [ ] `PenggunaPageClient.tsx:141` — tambah `' '` ke keyboard handler
- [ ] `PenggunaPageClient.tsx:519` — perbaiki `ROLE_RANK` cast dengan guard
