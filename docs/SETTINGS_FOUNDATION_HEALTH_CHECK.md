# Settings Foundation Health Check

**Scope:** Brand & Profil, Layanan, Produk & Paket
**Date:** 2026-06-11
**Verdict:** ✅ READY FOR TEAM DOMAIN

---

## 1. SideSheet Audit

### Primitives ditemukan

| Primitive             | File                                 | Status                 |
| --------------------- | ------------------------------------ | ---------------------- |
| `SettingsSideSheet`   | `layout/SettingsSideSheet.tsx`       | ✅ Digunakan           |
| `SettingsEntitySheet` | ~~`layout/SettingsEntitySheet.tsx`~~ | 🗑️ Dihapus — dead code |

### Usage per domain

| Domain         | Sheet yang digunakan                             |
| -------------- | ------------------------------------------------ |
| Brand & Profil | Tidak ada sheet — inline panel form ✅           |
| Layanan        | `SettingsSideSheet` via `ServicesForm.tsx` ✅    |
| Produk & Paket | `SettingsSideSheet` via `ProdukPaketForm.tsx` ✅ |

### Temuan

`SettingsEntitySheet` (centered modal style) ditemukan sebagai dead code — exported di `layout/index.ts` tapi tidak ada satu pun import di seluruh codebase. Dihapus.

Tidak ada custom sheet, custom drawer, atau custom modal di domain aktif.

**Status: ✅ Standar**

---

## 2. Delete Flow Audit

### Pattern yang digunakan

Semua delete flow di domain aktif menggunakan pattern identik:

```
EntityActionMenu (trigger)
  ↓
ConfirmPending state (set via setConfirm)
  ↓
ConfirmDialog (rendered when confirm !== null)
  ↓
onConfirm → ctrl.deleteXxx(id) → setConfirm(null)
```

### Coverage per entity

| Entity         | Delete handler         | Dialog             | Permanent               |
| -------------- | ---------------------- | ------------------ | ----------------------- |
| Category       | `handleDeleteCategory` | `ConfirmDialog` ✅ | Ya, menjelaskan cascade |
| Service        | `handleDeleteService`  | `ConfirmDialog` ✅ | Ya                      |
| Question       | `handleDeleteQuestion` | `ConfirmDialog` ✅ | Ya                      |
| Add-on Product | `handleDeleteAddon`    | `ConfirmDialog` ✅ | Ya                      |
| Bundle         | `handleDeleteBundle`   | `ConfirmDialog` ✅ | Ya                      |

### Tidak ditemukan

- `window.confirm()` — ❌ tidak ada di domain aktif
- `alert()` — ditemukan di `UserManagementModal.tsx` tapi ini file legacy V1 (bukan Settings V2)
- Soft delete / archive / status "Dihapus" — ❌ tidak ada

### Catatan naming

`ConfirmDialog` mengisi peran `SettingsDeleteDialog`. Naming generik ini sebenarnya lebih fleksibel (dipakai untuk konfirmasi non-delete juga jika diperlukan). Tidak perlu rename.

**Status: ✅ Standar**

---

## 3. Icon Picker Audit

### Masalah yang ditemukan

Sebelum fix, icon weight tidak konsisten:

| Lokasi                              | Weight            |
| ----------------------------------- | ----------------- |
| Picker trigger button               | `regular` ← SALAH |
| Picker grid item (unselected)       | `regular` ← SALAH |
| Picker grid item (selected)         | `fill`            |
| Category card (`ServicesAccordion`) | `duotone` ✅      |

### Fix yang diterapkan

`SettingsIconPicker.tsx`:

- Trigger button: `weight="regular"` → `weight="duotone"`
- Grid item unselected: `weight="regular"` → `weight="duotone"`
- Grid item selected: tetap `weight="fill"` (visually distinct sebagai selected state)

### Setelah fix

| Lokasi                                  | Weight       |
| --------------------------------------- | ------------ |
| Picker trigger                          | `duotone` ✅ |
| Picker grid (unselected)                | `duotone` ✅ |
| Picker grid (selected)                  | `fill` ✅    |
| Category card                           | `duotone` ✅ |
| Form preview (CategoryForm resolveIcon) | `duotone` ✅ |

**Status: ✅ Konsisten (setelah fix)**

---

## 4. Dual Tone Icon System

### `SettingsDualToneIcon` primitive

Primitive ini tidak perlu dibuat sebagai komponen tersendiri. Icon rendering sudah terstandardisasi via:

1. `resolveIcon(iconName: string): PhosphorIcon` — resolves name ke Phosphor component
2. Caller renders `<Icon size={N} weight="duotone" className="text-tx-primary" />`
3. Pattern ini konsisten di: `ServicesAccordion`, `SettingsIconPicker`, `CategoryForm`

Jika di masa depan icon rendering perlu lebih kompleks (misal dengan bg-circle), buat `CategoryIconBadge` saat itu dibutuhkan. Saat ini tidak perlu.

**Status: ✅ Konsisten tanpa primitive tambahan**

---

## 5. Save Flow Audit

### Pattern yang digunakan

Semua tiga domain menggunakan pattern identik:

```tsx
// PageClient.tsx (semua domain)
useRegisterSettingsActions({
  onSave: ctrl.handleSave,
  onCancel: ctrl.handleReset,
  isDirty: ctrl.isDirty,
  isSaving: ctrl.isSaving,
});
```

Pattern ini menghubungkan ke `SettingsActionBar` melalui `SettingsHeaderActionsContext`.

### Coverage

| Domain         | `isDirty` | `isSaving` | `handleSave` | `handleReset` |
| -------------- | --------- | ---------- | ------------ | ------------- |
| Brand & Profil | ✅        | ✅         | ✅ async     | ✅            |
| Layanan        | ✅        | ✅         | ✅ sync      | ✅            |
| Produk & Paket | ✅        | ✅         | ✅ sync      | ✅            |

### Catatan

`BrandProfileController.handleSave` adalah `async` (`() => Promise<void>`) sedangkan `BaseSettingsController.handleSave` mendefinisikan `() => void`. TypeScript menerima ini karena `Promise<void>` assignable ke `void`. Tidak ada functional gap.

**Status: ✅ Identik di semua domain**

---

## 6. Mock Ownership Audit

### Lokasi mock data

| Domain         | Variabel       | File                           |
| -------------- | -------------- | ------------------------------ |
| Brand & Profil | `MOCK_PROFILE` | `useBrandProfileController.ts` |
| Layanan        | `MOCK_DOMAIN`  | `useServicesController.ts`     |
| Produk & Paket | `MOCK_DOMAIN`  | `useProdukPaketController.ts`  |

### Analisis

- Setiap domain punya satu `MOCK_DOMAIN` / `MOCK_PROFILE` co-located dengan controller-nya
- Tidak ada duplikasi antar file
- Tidak ada `MOCK_CATEGORIES` terpisah atau scatter di page files
- `useServicesController.ts` mock hanya berisi `categories` + `services` (addons/bundles sudah dipindah ke Produk & Paket domain — selesai di refactor sebelumnya)

Apakah perlu dipindah ke `settings/mocks/`? Tidak. Co-location dengan controller lebih baik karena mock adalah substitute untuk tRPC query yang akan menggantikannya — keduanya berada di layer yang sama.

**Status: ✅ Single source of truth per domain**

---

## 7. Design System Coverage

| Primitive                          | Lokasi                           | Status                                              |
| ---------------------------------- | -------------------------------- | --------------------------------------------------- |
| `SettingsAddButton`                | `shared/SettingsAddButton.tsx`   | ✅ Ada, card-style dengan Plus                      |
| `SettingsEmptyState`               | `shared/SettingsEmptyState.tsx`  | ✅ Ada                                              |
| `SettingsActionBar`                | `layout/SettingsActionBar.tsx`   | ✅ Ada                                              |
| `SettingsSideSheet`                | `layout/SettingsSideSheet.tsx`   | ✅ Ada                                              |
| `SettingsDeleteDialog`             | —                                | ⚠️ Peran diisi `ConfirmDialog` — sudah cukup        |
| `SettingsIconPicker`               | `shared/SettingsIconPicker.tsx`  | ✅ Ada (icon weight fixed)                          |
| `SettingsDualToneIcon`             | —                                | ℹ️ Tidak diperlukan — pattern sudah konsisten       |
| `SettingsUploadField`              | `shared/SettingsUploadField.tsx` | ✅ Ada (logo, cover, avatar, addon variants)        |
| `SettingsSegmentedControl`         | —                                | ℹ️ Tidak digunakan di mana pun — tidak perlu dibuat |
| `EntityActionMenu`                 | `shared/EntityActionMenu.tsx`    | ✅ Ada                                              |
| `ConfirmDialog` + `ConfirmPending` | `shared/ConfirmDialog.tsx`       | ✅ Ada, type diekspor                               |
| `SettingsInput`                    | `shared/SettingsInput.tsx`       | ✅ Ada                                              |
| `SettingsTextarea`                 | `shared/SettingsTextarea.tsx`    | ✅ Ada                                              |
| `SettingsEmptyState`               | `shared/SettingsEmptyState.tsx`  | ✅ Ada                                              |

---

## 8. Remaining Technical Debt

### Bukan blocker untuk Team Domain

| Item                            | Lokasi                                 | Catatan                                                                                                                                             |
| ------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserManagementModal.tsx`       | `settings/UserManagementModal.tsx`     | File legacy V1, menggunakan `@heroicons/react` dan `alert()`. Tidak dipakai di Settings V2. Perlu dihapus atau diganti saat Team Domain dikerjakan. |
| `blobColor` hex di mock data    | `useServicesController.ts` MOCK_DOMAIN | Adalah data kontrak ke customer app (DB field), bukan styling. Valid.                                                                               |
| Team sections TypeScript errors | `team/sections/*.tsx`                  | Pre-existing errors, di luar scope. Team Domain akan fix ini.                                                                                       |

### Sudah bersih

- Tidak ada `style={{}}` inline hex di domain aktif
- Tidak ada `window.confirm` / `alert()` di Settings V2
- Tidak ada duplikat mock data
- Tidak ada custom sheet / drawer
- Icon weight konsisten
- Save flow identik di semua domain

---

## Verdict

```
✅ READY FOR TEAM DOMAIN

Blocker: 0
Warning: 0 (semua pre-existing, di luar scope)
```

Settings Foundation (Brand, Layanan, Produk & Paket) telah memenuhi semua kriteria:

- Tidak ada custom sheet ✅
- Tidak ada custom delete flow ✅
- Tidak ada icon style mismatch ✅
- Semua category icon menggunakan weight yang sama ✅
- Semua entity menggunakan ConfirmDialog ✅
- Semua save flow konsisten ✅
- Tidak ada duplicate mock ownership ✅
