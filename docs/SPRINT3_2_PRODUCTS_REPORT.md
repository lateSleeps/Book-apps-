# Sprint 3.2 — Products & Packages Persistence Report

**Date:** 2026-06-12
**Status:** Complete
**tsc --noEmit:** 0 errors

---

## Files Created

| File                                                               | Purpose                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `packages/database/src/migrations/0005_create_add_on_products.sql` | `add_on_products` table + salon_id index                                       |
| `packages/database/src/migrations/0006_create_service_bundles.sql` | `service_bundles` + `service_bundle_items` tables + indexes                    |
| `src/server/settings/repositories/produkpaket.repository.ts`       | DB layer — 1 domain query + 8 write operations + cross-salon validation helper |
| `src/server/settings/services/produkpaket.service.ts`              | Business logic — validation, blob: stripping, cross-salon check                |
| `src/server/trpc/routers/settings/produkpaket.ts`                  | tRPC router — 1 query + 6 mutations                                            |

## Files Modified

| File                                                                                           | Change                                                                               |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/server/trpc/routers/settings/_settings.ts`                                                | Registered `produkPaket: produkPaketRouter`                                          |
| `src/features/dashboard/hooks/settings/useProdukPaketController.ts`                            | Full rewrite — section-based, tRPC replacing mock state, no BaseSettingsController   |
| `src/features/dashboard/components/settings/components/produk-paket/ProdukPaketPageClient.tsx` | `useRegisterSettingsActions` with `isDirty: false` — global batch save removed       |
| `src/features/dashboard/components/settings/components/produk-paket/ProdukPaketForm.tsx`       | `ctrl.addAddon` → `ctrl.addons.add`, `ctrl.deleteAddon` → `ctrl.addons.remove`, etc. |

---

## Migration Requirements

### `0005_create_add_on_products.sql` — new in Sprint 3.2

```sql
CREATE TABLE IF NOT EXISTS add_on_products (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id    UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  price       BIGINT      NOT NULL DEFAULT 0 CHECK (price >= 0),
  image_url   TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS add_on_products_salon_id_idx ON add_on_products (salon_id);
```

### `0006_create_service_bundles.sql` — new in Sprint 3.2

```sql
CREATE TABLE IF NOT EXISTS service_bundles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id     UUID        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  description  TEXT        NOT NULL DEFAULT '',
  bundle_price BIGINT      NOT NULL CHECK (bundle_price > 0),
  image_url    TEXT,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS service_bundles_salon_id_idx ON service_bundles (salon_id);

CREATE TABLE IF NOT EXISTS service_bundle_items (
  bundle_id  UUID NOT NULL REFERENCES service_bundles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (bundle_id, service_id)
);
CREATE INDEX IF NOT EXISTS service_bundle_items_bundle_id_idx ON service_bundle_items (bundle_id);
```

Apply both migrations before Sprint 3.2 go-live. `0005` has no dependencies on `0006`. Apply in order.

---

## Queries Added

### `trpc.settings.produkPaket.getDomain`

- Type: `protectedProcedure.query`
- Output: `{ addons: AddOnProduct[], bundles: ServiceBundle[] }`
- Implementation: `Promise.all([getAddOns, getBundles])`
- `getBundles` uses Supabase nested select `service_bundle_items(service_id)` to assemble `serviceIds` in one round-trip
- Fallback: returns `{ addons: [], bundles: [] }` when salon has no data

---

## Mutations Added

### Add-on

| Procedure     | Input                 | Output             | DB operation                               |
| ------------- | --------------------- | ------------------ | ------------------------------------------ |
| `createAddOn` | addonInputSchema      | `ok(AddOnProduct)` | INSERT add_on_products                     |
| `updateAddOn` | `{ id: UUID, patch }` | `ok()`             | UPDATE add_on_products WHERE id + salon_id |
| `deleteAddOn` | `{ id: UUID }`        | `ok()`             | DELETE WHERE id + salon_id                 |

### Bundle

| Procedure      | Input                 | Output              | DB operation                                                 |
| -------------- | --------------------- | ------------------- | ------------------------------------------------------------ |
| `createBundle` | bundleInputSchema     | `ok(ServiceBundle)` | INSERT service_bundles + INSERT service_bundle_items (batch) |
| `updateBundle` | `{ id: UUID, patch }` | `ok()`              | UPDATE service_bundles + DELETE items + INSERT new items     |
| `deleteBundle` | `{ id: UUID }`        | `ok()`              | DELETE service_bundles (CASCADE removes items)               |

---

## Controller Contract Compliance

Per `PRODUCTS_DOMAIN_READINESS.md`:

| Requirement                                     | Implemented                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `ctrl.addons.*` section shape                   | Yes                                                                  |
| `ctrl.bundles.*` section shape                  | Yes                                                                  |
| No `BaseSettingsController`                     | Yes — no extends, no `isDirty`/`handleSave`/`handleReset`            |
| Single shared `getDomain` query                 | Yes — `Promise.all([getAddOns, getBundles])`                         |
| `staleTime: 30_000`                             | Yes                                                                  |
| `placeholderData: EMPTY_DOMAIN`                 | Yes — `{ addons: [], bundles: [] }`                                  |
| Specific query invalidation                     | Yes — `utils.settings.produkPaket.getDomain.invalidate()` only       |
| No optimistic updates                           | Yes                                                                  |
| `addons.isSaving` tracks addon mutations only   | Yes — `isCreatingAddon \|\| isUpdatingAddon \|\| isDeletingAddon`    |
| `bundles.isSaving` tracks bundle mutations only | Yes — `isCreatingBundle \|\| isUpdatingBundle \|\| isDeletingBundle` |

---

## Mutation Policy Compliance

Per `PRODUCTS_DOMAIN_READINESS.md`:

| Action               | Policy                           | Implemented                                                        |
| -------------------- | -------------------------------- | ------------------------------------------------------------------ |
| Add-on create        | Immediate — SideSheet submission | Yes — `ctrl.addons.add` fires on sheet save                        |
| Add-on update        | Immediate — SideSheet submission | Yes — `ctrl.addons.update` fires on sheet save                     |
| Add-on delete        | Immediate + ConfirmDialog        | Yes — ConfirmDialog in ProdukPaketForm, then `ctrl.addons.remove`  |
| Bundle create        | Immediate — SideSheet submission | Yes — `ctrl.bundles.add` fires on sheet save                       |
| Bundle update        | Immediate — SideSheet submission | Yes — `ctrl.bundles.update` fires on sheet save                    |
| Bundle delete        | Immediate + ConfirmDialog        | Yes — ConfirmDialog in ProdukPaketForm, then `ctrl.bundles.remove` |
| No global batch save | Verified                         | Yes — `useRegisterSettingsActions` with `isDirty: false`           |

---

## End-to-End Flow

### Read (page load)

```
ProdukPaketPageClient renders
  -> useProdukPaketController()
    -> trpc.settings.produkPaket.getDomain.useQuery()
      -> produkPaketService.getDomain(salonId)
        -> Promise.all([getAddOns, getBundles])
           getAddOns: SELECT from add_on_products WHERE salon_id
           getBundles: SELECT *, service_bundle_items(service_id) WHERE salon_id
      <- { addons: [...], bundles: [...] }
  -> ctrl.addons.data, ctrl.bundles.data hydrated
  -> AddOnsSection and BundlesSection render with real data
```

### Write example — add add-on

```
Owner fills SideSheet form -> clicks Simpan
  -> ProdukPaketForm.handleSave()
    -> ctrl.addons.add(draft)
      -> createAddonMutation({ name, description, price, imageUrl, isActive })
        -> produkPaketRouter.createAddOn
          -> produkPaketService.createAddOn(salonId, input)
             [validates: name non-empty, price >= 0, strip blob: imageUrl]
            -> produkPaketRepo.createAddOn(salonId, data)
              -> INSERT add_on_products
            <- AddOnProduct
          <- ok(AddOnProduct)
        -> onSuccess: invalidate getDomain
          -> query refetches -> new add-on appears in list
  -> closeSheet()
```

### Write example — create bundle

```
Owner picks 3 services, fills name + price -> clicks Simpan
  -> ctrl.bundles.add(draft)
    -> createBundleMutation({ name, description, serviceIds: [...], bundlePrice, ... })
      -> produkPaketRouter.createBundle
        -> produkPaketService.createBundle(salonId, input)
           [validates: name, bundlePrice > 0, serviceIds.length >= 2]
           [deduplicate serviceIds with Set]
           [getValidServiceIds: SELECT id FROM services WHERE salon_id + id IN serviceIds]
           [if count mismatch: throw ServiceError BUNDLE_INVALID_SERVICE_IDS]
          -> produkPaketRepo.createBundle(salonId, data)
            -> INSERT service_bundles -> get UUID
            -> INSERT service_bundle_items (bundle_id, service_id) x3
          <- ServiceBundle
        <- ok(ServiceBundle)
      -> onSuccess: invalidate getDomain
        -> query refetches -> new bundle appears with correct serviceIds
```

### Write example — update bundle (change services)

```
Owner opens edit sheet, removes one service, clicks Simpan
  -> ctrl.bundles.update(bundleId, { serviceIds: ['svc-A', 'svc-B'] })
    -> updateBundleMutation({ id: bundleId, patch: { serviceIds: [...] } })
      -> produkPaketService.updateBundle(salonId, id, input)
         [validates serviceIds length >= 2, cross-salon check]
        -> produkPaketRepo.updateBundle(salonId, id, patch)
          -> UPDATE service_bundles (updated_at only if no other fields changed)
          -> DELETE service_bundle_items WHERE bundle_id
          -> INSERT service_bundle_items x2
        <- void
      <- ok()
    -> onSuccess: invalidate getDomain
      -> query refetches -> bundle shows new service composition
```

---

## Architecture Compliance

- No direct Supabase access outside `repositories/`
- No `any` types — strict TypeScript throughout (`unknown` cast at Supabase boundary)
- All procedures use `protectedProcedure` — UNAUTHORIZED if salonId absent
- `ok()` / `ok(data)` used consistently
- `RepositoryError` / `ServiceError` / `toTRPCError()` chain followed
- No try-catch wrapping repository calls in service layer
- Section-based controller — no `BaseSettingsController`, no `isDirty`/`handleSave` at top level
- `salonId` from `ctx` only — never from procedure input
- `salon_id` guard on every write operation (`.eq('salon_id', salonId)`)
- `staleTime: 30_000` on domain query
- `placeholderData` on domain query — no loading flash

---

## Known Limitations

1. **Bundle update is not transactional.** `updateBundle` does: UPDATE service_bundles → DELETE service_bundle_items → INSERT new items. If the INSERT fails, the bundle exists with no service items. The mutation error surfaces to the UI; owner can retry from the current form values. Fix via Supabase RPC in Sprint 4.

2. **createBundle is not transactional.** Two sequential operations: INSERT service_bundles → INSERT service_bundle_items. If items INSERT fails, the bundle row exists with no service associations. Same graceful degradation; same Sprint 4 fix path.

3. **Image blob: URLs are stripped, not uploaded.** The service layer replaces any `blob:` URL with `null` before writing to DB. This matches the pattern used for QRIS (Sprint 2.3) and avatars (Sprint 3.1). File upload to Supabase Storage is deferred to Sprint 4.

4. **Silent bundle degradation on service delete.** If a service is deleted in the Services domain, `service_bundle_items.service_id` has `ON DELETE CASCADE`. The service is removed from the bundle silently. A bundle may end up with fewer than 2 services. The `BundlesSection` receives the current `serviceIds` count from `getDomain`; a warning badge on bundles where `serviceIds.length < 2` can be added without further backend changes.

5. **sortOrder set to 0 on create.** All add-ons and bundles have `sort_order = 0`. They appear in insert order. Drag-to-reorder can be added later without interface changes.

6. **Customer app not yet reading from these tables.** Zero breaking risk during rollout. Customer booking flow still uses mock/static product data.

---

## Typecheck Result

```
npx tsc --noEmit  ->  0 errors
```
