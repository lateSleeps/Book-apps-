# Settings Foundation Refactor Report

**Scope:** Brand & Profil, Layanan, Produk & Paket
**Constraint:** No UI changes. No layout changes. No behavior changes. No new features.
**Date:** 2026-06-11

---

## P0 - Critical (Data & Styling)

### P0.1 - Data Ownership Conflict FIXED

**Problem:** `ServicesController` owned `addons` and `bundles` in addition to `useProdukPaketController`. Dual ownership caused risk of state divergence.

**Fix:**

- `services.types.ts` - Removed `addons: AddOnProduct[]` and `bundles: ServiceBundle[]` from `ServicesDomain`. Added doc comment clarifying sole ownership.
- `useServicesController.ts` - Full rewrite. Removed all addon/bundle state, mock data, interface methods (`addAddon`, `updateAddon`, `removeAddon`, `addBundle`, `updateBundle`, `removeBundle`) and their implementations. Removed debug `console.log`.
- `useProdukPaketController.ts` - Confirmed as sole owner of `AddOnProduct[]` and `ServiceBundle[]`.
- `ProdukPaketPageClient.tsx` - Keeps `useServicesController()` call as read-only reference for bundle service selection (approved by architecture requirement).

### P0.2 - Hardcoded Hex in ServicesAccordion FIXED

**Problem:** Category icon container used `style={{ background: cat.blobColor ?? '#E5E5EA' }}`. Icon used `color="#1C1C1E"`.

**Fix:** `ServicesAccordion.tsx`

- `style={{ background: ... }}` replaced with `className={cn('...', cat.color ?? 'bg-bg-control')}` - uses the Tailwind bg class already stored on the category.
- `color="#1C1C1E"` replaced with `className="text-tx-primary"`.

### P0.3 - Hardcoded Hex in CategoryForm FIXED

**Problem:** Color swatch selection used `style={{ borderColor: '#1C1C1E', outline: '2px solid #1C1C1E' }}` for active state and `style={{ background: p.blob }}` for swatch fill.

**Fix:** `CategoryForm.tsx`

- Swatch fill now uses `className={p.color}` - the `bg-c-*` Tailwind class stored in BLOB_PRESETS.
- Selected state uses `ring-2 ring-tx-primary ring-offset-2` Tailwind classes.
- All `style={{}}` removed from swatch buttons.
- `blobColor` state retained (still needed for customer app contract via DB).

---

## P1 - Architecture (Shared Code & Contracts)

### P1.1 - Shared formatPrice FIXED

**Problem:** `AddOnsSection.tsx`, `BundlesSection.tsx`, `ServicesAccordion.tsx` each had a local `formatPrice` function (identical implementation, triplicated).

**Fix:**

- `shared/lib/format.ts` - Added exported `formatPrice(n: number): string`.
- `AddOnsSection.tsx` - Removed local `formatPrice`, imports from `@/shared/lib/format`.
- `BundlesSection.tsx` - Removed local `formatPrice`, imports from `@/shared/lib/format`.
- `ServicesAccordion.tsx` - Has its own `formatPrice(price, priceType)` with an extra `priceType` param (different signature - kept as-is, no behavior change).

### P1.2 - Shared ConfirmPending type FIXED

**Problem:** `ServicesForm.tsx` and `ProdukPaketForm.tsx` each had an identical local `type ConfirmPending` definition.

**Fix:**

- `ConfirmDialog.tsx` - Exported `ConfirmPending` interface.
- `shared/index.ts` - Added `export type { ConfirmPending }`.
- `ServicesForm.tsx` - Removed local type, imports from shared.
- `ProdukPaketForm.tsx` - Removed local type, imports from shared.

### P1.3 - SettingsAddButton: card-style with embedded Plus FIXED

**Problem:** `SettingsAddButton` was solid blue (unused). All actual add buttons were inline card-style outline buttons with a `Plus` icon.

**Fix:** `SettingsAddButton.tsx` rewritten to card-style with embedded `Plus` icon matching the approved UI appearance. `children: ReactNode` prop retained.

### P1.4 - Inline add buttons replaced with SettingsAddButton FIXED

Replaced raw `<button>` add buttons with `<SettingsAddButton>` in:

- `ServicesAccordion.tsx` - "Tambah Kategori" and "Tambah Layanan"
- `AddOnsSection.tsx` - "Tambah Produk"
- `BundlesSection.tsx` - "Buat Paket"
- `ConsultationQuestionsSection.tsx` - "Tambah" (per-service question add button)

### P1.5 - Inline empty states replaced with SettingsEmptyState FIXED

Replaced raw `<div>` empty states with `<SettingsEmptyState>` in:

- `ServicesAccordion.tsx` - Category empty state and Service empty state (when category selected but no services)

### P1.6 - BundlesSection emoji placeholder FIXED

**Problem:** No-image placeholder used `text-[3rem]` arbitrary class with 📦 emoji.

**Fix:** Replaced with `<Package size={40} weight="duotone" className="text-tx-muted" />` icon.

### P1.7 - BaseSettingsController contract FIXED

**Problem:** `BrandProfileController` did not extend `BaseSettingsController`, breaking the contract.

**Fix:** `useBrandProfileController.ts`

- Added import of `BaseSettingsController`.
- `BrandProfileController` now `extends BaseSettingsController`.
- `handleSave: () => Promise<void>` is compatible with base `handleSave: () => void` (Promise<void> is assignable to void in TypeScript).

---

## Pre-existing Issues (Out of Scope)

The following TS errors existed before this refactor and are not in scope:

| File                                      | Error                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `team/sections/LeaveSection.tsx`          | `SettingsAddButton` used with old `label` prop                           |
| `team/sections/StaffDirectorySection.tsx` | Multiple type errors (EditState, SettingsAddButton, SettingsUploadField) |
| `team/sections/*.tsx`                     | `SettingsEmptyState` called without required `icon` prop                 |
| `server/trpc/routers/*.ts`                | `@rara/database` module not found                                        |
| `app/dashboard/layout.tsx`                | Unused imports                                                           |
| `app/api/debug/...`                       | `@rara/database` module not found                                        |

These are tracked separately and belong to the Team domain (out of current scope) and infrastructure setup.

---

## Files Changed

| File                                                 | Change                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| `types/services.types.ts`                            | Removed addons/bundles from ServicesDomain                     |
| `hooks/settings/useServicesController.ts`            | Removed addon/bundle ownership, removed debug log              |
| `hooks/settings/useBrandProfileController.ts`        | Extends BaseSettingsController                                 |
| `shared/lib/format.ts`                               | Added formatPrice                                              |
| `shared/components/shared/ConfirmDialog.tsx`         | Exported ConfirmPending type                                   |
| `shared/components/shared/index.ts`                  | Re-exported ConfirmPending                                     |
| `shared/components/shared/SettingsAddButton.tsx`     | Rewritten to card-style with Plus                              |
| `services/sections/ServicesAccordion.tsx`            | Fixed hex styling, replaced buttons/empty states               |
| `services/sections/AddOnsSection.tsx`                | Removed local formatPrice, uses SettingsAddButton              |
| `services/sections/BundlesSection.tsx`               | Removed local formatPrice, uses SettingsAddButton, fixed emoji |
| `services/sections/ConsultationQuestionsSection.tsx` | Uses SettingsAddButton                                         |
| `services/forms/CategoryForm.tsx`                    | Replaced hex style with ring-\* tokens                         |
| `services/ServicesForm.tsx`                          | Uses shared ConfirmPending                                     |
| `produk-paket/ProdukPaketForm.tsx`                   | Uses shared ConfirmPending                                     |
