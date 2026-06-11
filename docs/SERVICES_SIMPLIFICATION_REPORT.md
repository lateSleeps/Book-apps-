# Services Domain Simplification Report

Date: 2026-06-11

---

## 1. Features Removed

| Feature                   | What was removed                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------ |
| Archive (Arsipkan)        | UI action, controller method, state, filter tab                                      |
| Restore (Pulihkan)        | UI action, controller method                                                         |
| Soft Delete               | Controller method that set `deletedAt` to ISO timestamp                              |
| Recycle Bin (Dihapus tab) | ViewFilter state, SettingsSubNav filter strip, empty states                          |
| Status dots               | Green/gray/red status indicator dots on cards                                        |
| Status opacity            | 0.45/0.6/1.0 opacity based on entity status                                          |
| Status labels             | "Diarsipkan", "Dihapus" text badges on cards                                         |
| `DangerConfirmDialog`     | Whole component — required typing "HAPUS" + dependency count                         |
| `deletedAt` field         | Removed from `ServiceCategory`, `ServiceItem`, `AddOnProduct`, `ServiceBundle` types |

---

## 2. Controllers Cleaned

### `useServicesController.ts`

**Removed methods:**

- `archiveCategory(id)` — set `isActive: false`
- `restoreCategory(id)` — set `isActive: true, deletedAt: null`
- `deleteCategory(id)` — soft-delete (set `deletedAt`)
- `archiveService(id)` — set `isActive: false`
- `restoreService(id)` — set `isActive: true, deletedAt: null`
- `deleteService(id)` — soft-delete

**Renamed/simplified:**

- `permanentDeleteCategory(id)` → `deleteCategory(id)` — removes category AND all its services
- `permanentDeleteService(id)` → `deleteService(id)` — removes service from array

**Interface before:** 12 methods for categories+services  
**Interface after:** 6 methods for categories+services (add, update, delete each)

### `useProdukPaketController.ts`

**Removed methods:**

- `archiveAddon`, `restoreAddon`, `deleteAddon` (soft)
- `archiveBundle`, `restoreBundle`, `deleteBundle` (soft)

**Renamed/simplified:**

- `permanentDeleteAddon` → `deleteAddon`
- `permanentDeleteBundle` → `deleteBundle`

**Interface before:** 12 methods  
**Interface after:** 6 methods

---

## 3. Delete Confirmation Modals

All delete actions use `ConfirmDialog` (existing shared component). No new component needed.

| Entity                      | Title                  | Message                                                                                                                                  |
| --------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Category** (no children)  | "Hapus kategori?"      | `"[Name]" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`                                                                   |
| **Category** (has services) | "Hapus kategori?"      | `"[Name]" masih memiliki N layanan. Menghapus kategori akan menghapus seluruh layanan di dalamnya. Tindakan ini tidak dapat dibatalkan.` |
| **Service**                 | "Hapus layanan?"       | `Layanan "[Name]" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`                                                           |
| **Add-on**                  | "Hapus produk add-on?" | `Produk "[Name]" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`                                                            |
| **Bundle**                  | "Hapus bundle?"        | `Bundle "[Name]" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`                                                            |

All modals use `variant: 'danger'` and `confirmLabel: 'Hapus Permanen'`.

---

## 4. Cards with Action Menus

| Card              | Actions                        |
| ----------------- | ------------------------------ |
| **Category card** | Edit Kategori / Hapus Permanen |
| **Service card**  | Edit Layanan / Hapus Permanen  |
| **Add-on card**   | Edit Produk / Hapus Permanen   |
| **Bundle card**   | Edit Bundle / Hapus Permanen   |

Status dots removed from all cards.  
Filter strip (Aktif/Arsip/Dihapus) removed from all sections.  
"Tambah" button is always visible (no filter-gating).

---

## 5. Files Changed

| File                                         | Change                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `types/services.types.ts`                    | Removed `deletedAt` from all 4 entity interfaces                          |
| `hooks/settings/useServicesController.ts`    | Removed archive/restore/soft-delete, simplified to add/update/delete      |
| `hooks/settings/useProdukPaketController.ts` | Same simplification                                                       |
| `sections/ServicesAccordion.tsx`             | Removed ViewFilter, filter strip, status helpers, archive/restore actions |
| `sections/AddOnsSection.tsx`                 | Removed ViewFilter, filter strip, status helpers                          |
| `sections/BundlesSection.tsx`                | Removed ViewFilter, filter strip, status helpers                          |
| `ServicesForm.tsx`                           | Removed DangerConfirmDialog, viewFilter state, archive handlers           |
| `ProdukPaketForm.tsx`                        | Removed DangerConfirmDialog, addonFilter, bundleFilter, archive handlers  |
| `forms/CategoryForm.tsx`                     | Removed `deletedAt` from Omit                                             |
| `forms/ServiceForm.tsx`                      | Removed `deletedAt` from Omit                                             |
| `forms/AddonForm.tsx`                        | Removed `deletedAt` from Omit                                             |
| `forms/BundleForm.tsx`                       | Removed `deletedAt` from Omit                                             |
| `shared/DangerConfirmDialog.tsx`             | DELETED                                                                   |
| `shared/index.ts`                            | Removed DangerConfirmDialog exports                                       |
| `sections/CategoriesSection.tsx`             | DELETED (legacy shim, no longer needed)                                   |
| `sections/ServicesListSection.tsx`           | DELETED (legacy shim, no longer needed)                                   |

---

## 6. Customer App Impact

**Zero.** The customer app was not touched.

The `isActive` field is preserved on all entity types — the customer app uses it to
filter which services/categories are visible during booking. Items created via owner
settings continue to default to `isActive: true`.

The removed `deletedAt` field was added only in this session (June 2026) and was never
used by the customer booking flow.
