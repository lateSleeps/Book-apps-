# Products Domain Readiness — Sprint 3.2 Preparation

**Date:** 2026-06-12
**Domain:** Produk & Paket (Add-on Products + Service Bundles)
**Status:** Analysis only — no code written

---

## 1. Current UI Structure

### Page entry

`/dashboard/settings/produk-paket` → `ProdukPaketPage` → `ProdukPaketPageClient`

### Tab layout

Two tabs inside `SettingsTabbedCard`:
| Tab ID | Label | Content |
|--------|-------|---------|
| `addons` | Produk Add-on | `AddOnsSection` |
| `bundles` | Paket Bundel | `BundlesSection` |

### Component tree

```
ProdukPaketPageClient
  useRegisterSettingsActions  ← global batch save (MUST be replaced)
  useProdukPaketController    ← mock, extends BaseSettingsController
  useServicesController       ← needed for bundle service picker
  SettingsTabbedCard
    AddOnsSection             ← receives addons, onAdd, onEdit, onDelete props
    BundlesSection            ← receives bundles, services, onAdd, onEdit, onDelete props
      ProdukPaketForm         ← SideSheet with 4 modes
        AddonForm             ← controlled, emits AddonFormDraft via callback
        BundleForm            ← controlled, emits BundleFormDraft via callback
```

### Form modes in ProdukPaketForm

| Mode          | Trigger                | Commits via                    |
| ------------- | ---------------------- | ------------------------------ |
| `add-addon`   | "Tambah Add-on" button | `ctrl.addAddon(draft)`         |
| `edit-addon`  | Row edit button        | `ctrl.updateAddon(id, draft)`  |
| `add-bundle`  | "Tambah Paket" button  | `ctrl.addBundle(draft)`        |
| `edit-bundle` | Row edit button        | `ctrl.updateBundle(id, draft)` |

Delete uses ConfirmDialog → `ctrl.deleteAddon(id)` / `ctrl.deleteBundle(id)`.

### Current save behavior (mock — MUST change)

`useProdukPaketController extends BaseSettingsController`. Page registers `ctrl.handleSave`, `ctrl.handleReset`, `ctrl.isDirty` with the global action bar. All mutations write to in-memory mock state and mark `isDirty = true`. A "Simpan" click on the global action bar commits. This is the global batch save anti-pattern identified in SETTINGS_PERSISTENCE_MILESTONE_REVIEW.md. Sprint 3.2 replaces it with immediate mutations (SideSheet submission = DB commit).

### User flow

1. Owner opens Settings > Produk & Paket
2. Tab defaults to "Produk Add-on"
3. "Tambah Add-on" → SideSheet opens with AddonForm
4. Owner fills name (required), description (optional), price (required ≥ 0), image (optional), isActive toggle
5. Sheet save → `ctrl.addons.add(draft)` → fires immediately to DB
6. Switch to "Paket Bundel" tab
7. "Tambah Paket" → SideSheet with BundleForm
8. Owner picks ≥ 2 services (required), fills name, description, bundle price (> 0), image, isActive
9. Original price auto-calculated from selected services for reference
10. Sheet save → `ctrl.bundles.add(draft)` → fires immediately to DB

---

## 2. Domain Model

### TypeScript types (from `services.types.ts`)

```typescript
export interface AddOnProduct {
  id: string;
  name: string;
  description: string;
  price: number; // IDR, >= 0
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number; // not exposed in UI yet; managed on DB side
}

export interface ServiceBundle {
  id: string;
  name: string;
  description: string;
  serviceIds: string[]; // IDs of ServiceItem; min 2 in form validation
  bundlePrice: number; // IDR, > 0
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number; // not exposed in UI yet
}
```

No `BundleItem` type in TypeScript. The `serviceIds` flat array is the domain abstraction. The join table is a DB implementation detail hidden in the repository layer.

### Form draft types (used internally in forms, never sent to DB directly)

```typescript
type AddonFormDraft = Omit<AddOnProduct, "id" | "sortOrder">;
// name, description, price, imageUrl, isActive

type BundleFormDraft = Omit<ServiceBundle, "id" | "sortOrder">;
// name, description, serviceIds, bundlePrice, imageUrl, isActive
```

### Entity relationship

```
salons
  └── add_on_products (1:many, salon_id FK)

salons
  └── service_bundles (1:many, salon_id FK)
        └── service_bundle_items (1:many, bundle_id FK)
              └── services (many:1, service_id FK)
```

`ServiceBundle.serviceIds` in TypeScript maps to `service_bundle_items` rows in the DB. The repository assembles the flat `serviceIds` array from the join table on read, and performs DELETE+INSERT on write.

---

## 3. Database Requirements

### Tables needed

All three are new. None exist yet.

#### `add_on_products`

| Column        | Type                                              | Notes                            |
| ------------- | ------------------------------------------------- | -------------------------------- |
| `id`          | UUID PK                                           | `gen_random_uuid()`              |
| `salon_id`    | UUID NOT NULL FK → `salons(id) ON DELETE CASCADE` | tenant isolation                 |
| `name`        | TEXT NOT NULL                                     |                                  |
| `description` | TEXT NOT NULL DEFAULT ''                          |                                  |
| `price`       | BIGINT NOT NULL DEFAULT 0                         | IDR in smallest unit; CHECK >= 0 |
| `image_url`   | TEXT                                              | nullable                         |
| `is_active`   | BOOLEAN NOT NULL DEFAULT true                     |                                  |
| `sort_order`  | INTEGER NOT NULL DEFAULT 0                        |                                  |
| `created_at`  | TIMESTAMPTZ NOT NULL DEFAULT now()                |                                  |
| `updated_at`  | TIMESTAMPTZ NOT NULL DEFAULT now()                |                                  |

Index: `(salon_id)` for per-salon queries.

#### `service_bundles`

| Column         | Type                                              | Notes               |
| -------------- | ------------------------------------------------- | ------------------- |
| `id`           | UUID PK                                           | `gen_random_uuid()` |
| `salon_id`     | UUID NOT NULL FK → `salons(id) ON DELETE CASCADE` | tenant isolation    |
| `name`         | TEXT NOT NULL                                     |                     |
| `description`  | TEXT NOT NULL DEFAULT ''                          |                     |
| `bundle_price` | BIGINT NOT NULL                                   | IDR; CHECK > 0      |
| `image_url`    | TEXT                                              | nullable            |
| `is_active`    | BOOLEAN NOT NULL DEFAULT true                     |                     |
| `sort_order`   | INTEGER NOT NULL DEFAULT 0                        |                     |
| `created_at`   | TIMESTAMPTZ NOT NULL DEFAULT now()                |                     |
| `updated_at`   | TIMESTAMPTZ NOT NULL DEFAULT now()                |                     |

Index: `(salon_id)`.

#### `service_bundle_items`

| Column       | Type                                                       | Notes                                         |
| ------------ | ---------------------------------------------------------- | --------------------------------------------- |
| `bundle_id`  | UUID NOT NULL FK → `service_bundles(id) ON DELETE CASCADE` | removes items when bundle deleted             |
| `service_id` | UUID NOT NULL FK → `services(id) ON DELETE CASCADE`        | removes item when service deleted — see Risks |

Composite PK: `(bundle_id, service_id)`. No `salon_id` — inherited from bundle. No timestamps needed (junction record only).

### Migration file plan

| File                              | Content                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| `0005_create_add_on_products.sql` | `add_on_products` table + index                             |
| `0006_create_service_bundles.sql` | `service_bundles` + `service_bundle_items` tables + indexes |

**Corrected from plan.** `SETTINGS_DATABASE_IMPLEMENTATION_PLAN.md` listed these as `0006` and `0007`. The actual repo sequence ends at `0004_create_staff_tables.sql` (created in Sprint 3.1). Correct next numbers are `0005` and `0006`.

### Cross-check against SETTINGS_DATABASE_AUDIT.md

Audit identified these three tables as missing with the same column shapes. Confirmed — no other existing tables can be reused for this domain.

---

## 4. Mutation Policy

Every action in the Produk & Paket domain is **Immediate**. There is no explicit save pattern here. The SideSheet modal is the confirmation boundary — when the owner clicks save inside the sheet, the mutation fires to the DB immediately.

| Action                                             | Policy                               | Rationale                                                                                                                                    |
| -------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Add-on: create                                     | **Immediate** — SideSheet submission | Modal acts as confirmation. Owner has reviewed all fields before submitting. Same pattern as Staff.create.                                   |
| Add-on: edit name/description/price/image/isActive | **Immediate** — SideSheet submission | Not a multi-step form with time dependencies. Clicking save in the modal is explicit intent.                                                 |
| Add-on: delete                                     | **Immediate + ConfirmDialog**        | Irreversible. ConfirmDialog already exists in ProdukPaketForm.                                                                               |
| Bundle: create                                     | **Immediate** — SideSheet submission | Modal is the confirmation boundary. Service picker (min 2) enforced before sheet save is enabled.                                            |
| Bundle: edit (any field including serviceIds)      | **Immediate** — SideSheet submission | Editing serviceIds replaces the entire composition in one atomic DB operation (DELETE+INSERT on items). No intermediate dirty state exposed. |
| Bundle: delete                                     | **Immediate + ConfirmDialog**        | Irreversible. Cascades to `service_bundle_items`. ConfirmDialog already exists in ProdukPaketForm.                                           |

### Why NOT global batch save (current mock behavior)

The current mock controller uses `isDirty`/`handleSave`/`handleReset` inherited from `BaseSettingsController`. This is wrong for this domain because:

1. Add-ons and bundles are discrete entities with their own identity (`id`). They are not properties of one settings object.
2. The global save bar accumulates multiple entity changes (add 2 add-ons, edit 1 bundle) and tries to commit them together. This is not atomic — partial failure has no defined behavior.
3. The SideSheet is already a confirmation modal. Adding a second "Simpan" on the global bar is redundant friction.
4. Consistent with Team domain (which also removed global batch save in Sprint 3.1).

### Prohibitions for Sprint 3.2

- No global batch save on this page. `useRegisterSettingsActions` must be called with `isDirty: false`.
- No optimistic updates. Invalidate and refetch after every mutation.
- No debounce on any field. Form fields write to local draft state; DB is only written on sheet save.
- No rollback on failed mutation. Show error state; let owner retry from current form values.

---

## 5. Controller Architecture

### Decision: Section-based, NOT BaseSettingsController

`BaseSettingsController` is documented in its own file as applying to "domains with a single save target." Add-ons and bundles are two independent CRUD lists. Neither has a "single save target." Using `BaseSettingsController` here was always incorrect.

The section-based pattern (same as Team domain from Sprint 3.1) is the right fit. Each section owns its own data lifecycle, loading state, saving state, and mutations.

### Proposed final interface

```typescript
export interface ProdukPaketController {
  addons: AddonsSection;
  bundles: BundlesSection;
}

export interface AddonsSection {
  data: AddOnProduct[];
  isLoading: boolean;
  isSaving: boolean;
  add: (draft: Omit<AddOnProduct, "id" | "sortOrder">) => void;
  update: (
    id: string,
    patch: Partial<Omit<AddOnProduct, "id" | "sortOrder">>,
  ) => void;
  remove: (id: string) => void;
}

export interface BundlesSection {
  data: ServiceBundle[];
  isLoading: boolean;
  isSaving: boolean;
  add: (draft: Omit<ServiceBundle, "id" | "sortOrder">) => void;
  update: (
    id: string,
    patch: Partial<Omit<ServiceBundle, "id" | "sortOrder">>,
  ) => void;
  remove: (id: string) => void;
}
```

### Query design

One shared `getProdukPaketDomain` query returning `{ addons: AddOnProduct[], bundles: ServiceBundle[] }`. Unlike Team's `getTeamDomain` + `getStaffLeaves` split, there is no unbounded sub-list here. Both add-ons and bundles are small datasets (a salon has at most dozens of each). A single query on page mount is appropriate.

```typescript
// Controller hook skeleton
const { data: domainFromDb, isLoading: isDomainLoading } =
  trpc.settings.produkPaket.getDomain.useQuery(undefined, {
    staleTime: 30_000,
    placeholderData: EMPTY_DOMAIN, // { addons: [], bundles: [] }
  });
```

### isSaving per section

Each section uses a separate mutation group. `addons.isSaving` reflects add/update/delete mutations on add-ons only. `bundles.isSaving` reflects bundle mutations only. This allows the UI to show a saving indicator on the correct section without blocking the other.

### UI wiring changes required

| File                          | Change                                                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useProdukPaketController.ts` | Full rewrite — section-based, tRPC replacing mock state, no BaseSettingsController                                                                          |
| `ProdukPaketPageClient.tsx`   | `useRegisterSettingsActions` with `isDirty: false`; `ctrl.addAddon` → `ctrl.addons.add` etc.                                                                |
| `ProdukPaketForm.tsx`         | Method renames: `ctrl.addAddon` → `ctrl.addons.add`, `ctrl.updateAddon` → `ctrl.addons.update`, `ctrl.deleteAddon` → `ctrl.addons.remove`, same for bundles |

`AddonForm` and `BundleForm` are pure controlled components that receive `initialData` and emit drafts via callback. No changes needed to either form component.

`AddOnsSection` and `BundlesSection` receive props (addons, onAdd, onEdit, onDelete). No changes needed to either section component.

---

## 6. Persistence Complexity

**Rating: Medium**

### Why not Low

- `service_bundle_items` join table requires non-trivial read (Supabase nested select + map to `serviceIds` array) and non-trivial write (DELETE all existing items + INSERT new items on every bundle update).
- Bundle serviceIds cross-salon validation in the service layer requires an extra DB read to confirm all provided service IDs belong to the same salon. This is a security requirement (prevents cross-salon data access via forged IDs).

### Why not High

- No unbounded sub-list (no need for lazy parameterized query like leaves).
- No explicit save pattern (no draft + save button complexity like schedules).
- No multi-step non-atomic create (unlike createStaff which chains 3 inserts; createBundle can be done in two inserts: bundle row + batch items insert).
- No transitive domain dependencies (add-ons are fully self-contained; bundles reference services but do not need to load them in the repository).
- Customer app does not yet read from these tables — zero breaking risk during rollout.

### Bundle read strategy

Use Supabase nested select to avoid a separate query for bundle items:

```typescript
const { data: bundleRows } = await db
  .from("service_bundles")
  .select("*, service_bundle_items(service_id)")
  .eq("salon_id", salonId)
  .order("sort_order", { ascending: true });

// Map to ServiceBundle[]
return bundleRows.map((row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  serviceIds: (row.service_bundle_items ?? []).map((item) => item.service_id),
  bundlePrice: row.bundle_price,
  imageUrl: row.image_url,
  isActive: row.is_active,
  sortOrder: row.sort_order,
}));
```

Supabase JS v2 supports this automatically when the FK is declared.

### Bundle write strategy (update)

```
1. UPDATE service_bundles SET name, description, bundle_price, image_url, is_active, updated_at
   WHERE id = $bundleId AND salon_id = $salonId

2. DELETE FROM service_bundle_items WHERE bundle_id = $bundleId

3. INSERT INTO service_bundle_items (bundle_id, service_id)
   VALUES ($bundleId, $serviceId1), ($bundleId, $serviceId2), ...
```

This is non-transactional (same known limitation as `createStaff`). If step 3 fails, the bundle exists with no service items. This is surfaced to the owner as a mutation error; they can retry.

---

## 7. Risks

### Risk 1 — Silent bundle degradation via service deletion (High severity, Low likelihood)

When a service is deleted in the Services domain, `service_bundle_items.service_id` has `ON DELETE CASCADE`. The item is silently removed from the bundle. A bundle previously containing 3 services may now contain 1 — below the minimum of 2.

The bundle continues to exist in `service_bundles` with no indication that its composition is now invalid. The owner only discovers this if they open the bundle for editing and see fewer services than expected.

**Mitigation:** The `BundlesSection` display can show a warning badge on bundles where `serviceIds.length < 2`. The `getBundles` repository result already surfaces the correct count. No additional DB query needed.

This is a **cross-domain behavioral dependency**. Note it in the Sprint 3.2 report.

### Risk 2 — Image blob: URLs not persisted (Known, deferred)

`AddonForm` and `BundleForm` both use the same `prepareUploadImage` pattern as `AddonForm`. The form state holds a `blob:` or `https://` URL. The controller receives whatever URL is in the form draft.

When Sprint 3.2 connects to real DB, any `blob:` URL stored in the DB will be a dead reference on next page load. This is the same known limitation as QRIS upload (Sprint 2.3) and avatar upload (Sprint 3.1).

**Mitigation:** Same as other domains — the service layer must strip `blob:` URLs before writing:

```typescript
if (data.imageUrl?.startsWith("blob:")) {
  data = { ...data, imageUrl: null };
}
```

File upload to Supabase Storage deferred to Sprint 4.

### Risk 3 — Cross-salon serviceIds injection (Security)

The `ctrl.bundles.add(draft)` mutation receives `serviceIds: string[]` from the form. If a malicious actor fabricates a request with service IDs from a different salon, the repository would associate those services with the bundle without a salon check (the FK constraint on `service_bundle_items` only checks referential integrity, not salon ownership).

**Mitigation:** Service layer must validate that all `serviceIds` belong to `ctx.salonId` before writing. This requires one `SELECT id FROM services WHERE id = ANY($serviceIds) AND salon_id = $salonId` query and a comparison of returned count vs input count.

### Risk 4 — sortOrder not managed (Low severity, cosmetic)

Both `add_on_products` and `service_bundles` have `sort_order` columns. Sprint 3.2 will set them to `0` on create. All items appear in insert order. The owner cannot reorder items. This is the same limitation as staff `sort_order` in Sprint 3.1. No change needed; drag-to-reorder can be added later without interface changes.

---

## 8. Sprint 3.2 Implementation Plan

### Step 1 — Migrations

Create in this order (dependency: bundles references services via items):

**`packages/database/src/migrations/0005_create_add_on_products.sql`**

```sql
CREATE TABLE IF NOT EXISTS add_on_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price BIGINT NOT NULL DEFAULT 0 CHECK (price >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS add_on_products_salon_id_idx ON add_on_products (salon_id);
```

**`packages/database/src/migrations/0006_create_service_bundles.sql`**

```sql
CREATE TABLE IF NOT EXISTS service_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  bundle_price BIGINT NOT NULL CHECK (bundle_price > 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS service_bundles_salon_id_idx ON service_bundles (salon_id);

CREATE TABLE IF NOT EXISTS service_bundle_items (
  bundle_id UUID NOT NULL REFERENCES service_bundles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (bundle_id, service_id)
);
CREATE INDEX IF NOT EXISTS service_bundle_items_bundle_id_idx ON service_bundle_items (bundle_id);
```

### Step 2 — Repository

Create `src/server/settings/repositories/produkpaket.repository.ts`.

Functions:
| Function | DB operation |
|----------|-------------|
| `getAddOns(salonId)` | SELECT _ FROM add_on_products WHERE salon_id = $1 ORDER BY sort_order ASC |
| `createAddOn(salonId, data)` | INSERT INTO add_on_products |
| `updateAddOn(salonId, id, patch)` | UPDATE add_on_products WHERE id AND salon_id |
| `deleteAddOn(salonId, id)` | DELETE FROM add_on_products WHERE id AND salon_id |
| `getBundles(salonId)` | SELECT _, service_bundle_items(service_id) FROM service_bundles WHERE salon_id ORDER BY sort_order |
| `createBundle(salonId, data)` | INSERT service_bundles → get id → batch INSERT service_bundle_items |
| `updateBundle(salonId, id, patch)` | UPDATE service_bundles + DELETE items WHERE bundle_id + batch INSERT new items |
| `deleteBundle(salonId, id)` | DELETE service_bundles WHERE id AND salon_id (CASCADE removes items) |
| `getDomain(salonId)` | Promise.all([getAddOns, getBundles]) → `{ addons, bundles }` |

Use `as unknown as AddOnRow` and `as unknown as BundleRow` at Supabase boundary. Use `handleDbError()` on every Supabase call.

### Step 3 — Service

Create `src/server/settings/services/produkpaket.service.ts`.

Validations:
| Method | Validation |
|--------|-----------|
| `createAddOn` | `name.trim()` non-empty; `price >= 0`; strip `blob:` imageUrl |
| `updateAddOn` | same as above for provided fields |
| `createBundle` | `name.trim()` non-empty; `bundlePrice > 0`; `serviceIds.length >= 2`; all serviceIds belong to salonId (cross-salon check); strip `blob:` imageUrl |
| `updateBundle` | same as above; re-validate serviceIds on every update |

No try-catch wrapping repository calls. Let `RepositoryError` propagate naturally.

### Step 4 — Router

Create `src/server/trpc/routers/settings/produkpaket.ts`.

Procedures:
| Procedure | Type | Input |
|-----------|------|-------|
| `getDomain` | protectedProcedure.query | none |
| `createAddOn` | protectedProcedure.mutation | addonInputSchema |
| `updateAddOn` | protectedProcedure.mutation | `{ id: UUID, patch: addonPatchSchema }` |
| `deleteAddOn` | protectedProcedure.mutation | `{ id: UUID }` |
| `createBundle` | protectedProcedure.mutation | bundleInputSchema |
| `updateBundle` | protectedProcedure.mutation | `{ id: UUID, patch: bundlePatchSchema }` |
| `deleteBundle` | protectedProcedure.mutation | `{ id: UUID }` |

All return `ok()` or `ok(data)`. All `try { } catch (err) { throw toTRPCError(err); }`.

Register in `src/server/trpc/routers/settings/_settings.ts`:

```typescript
produkPaket: produkPaketRouter,
```

### Step 5 — Controller rewrite

Rewrite `src/features/dashboard/hooks/settings/useProdukPaketController.ts`.

Remove `extends BaseSettingsController`. Remove `isDirty`, `handleSave`, `handleReset`.

Implement section-based pattern:

```typescript
export function useProdukPaketController(): ProdukPaketController {
  const utils = trpc.useContext();

  function invalidateDomain() {
    void utils.settings.produkPaket.getDomain.invalidate();
  }

  const { data: domainFromDb, isLoading: isDomainLoading } =
    trpc.settings.produkPaket.getDomain.useQuery(undefined, {
      staleTime: 30_000,
      placeholderData: EMPTY_DOMAIN,
    });

  // addon mutations (create/update/delete)
  // bundle mutations (create/update/delete)
  // each onSuccess: invalidateDomain()

  return {
    addons: {
      data: domainFromDb.addons,
      isLoading: isDomainLoading,
      isSaving: isCreatingAddon || isUpdatingAddon || isDeletingAddon,
      add: (draft) => createAddonMutation({ ...draft }),
      update: (id, patch) => updateAddonMutation({ id, patch }),
      remove: (id) => deleteAddonMutation({ id }),
    },
    bundles: {
      data: domainFromDb.bundles,
      isLoading: isDomainLoading,
      isSaving: isCreatingBundle || isUpdatingBundle || isDeletingBundle,
      add: (draft) => createBundleMutation({ ...draft }),
      update: (id, patch) => updateBundleMutation({ id, patch }),
      remove: (id) => deleteBundleMutation({ id }),
    },
  };
}
```

### Step 6 — UI wiring

**`ProdukPaketPageClient.tsx`** — two changes:

1. `useRegisterSettingsActions` with `isDirty: false, isSaving: false` (remove `ctrl.handleSave` / `ctrl.handleReset` / `ctrl.isDirty`).
2. Update props passed to `ProdukPaketForm`:
   - `onAddAddon={() => ctrl.addons.add(draft)}`
   - `onEditAddon={(id, draft) => ctrl.addons.update(id, draft)}`
   - `onDeleteAddon={(id) => ctrl.addons.remove(id)}`
   - same pattern for bundles

**`ProdukPaketForm.tsx`** — rename 6 method references:
| Old | New |
|-----|-----|
| `ctrl.addAddon` | `ctrl.addons.add` |
| `ctrl.updateAddon` | `ctrl.addons.update` |
| `ctrl.deleteAddon` | `ctrl.addons.remove` |
| `ctrl.addBundle` | `ctrl.bundles.add` |
| `ctrl.updateBundle` | `ctrl.bundles.update` |
| `ctrl.deleteBundle` | `ctrl.bundles.remove` |

No changes to `AddonForm.tsx`, `BundleForm.tsx`, `AddOnsSection.tsx`, or `BundlesSection.tsx`.

### Step 7 — Typecheck

```
npx tsc --noEmit
```

Expected: 0 errors. Success condition for Sprint 3.2.

---

## Summary Table

| Area              | Status             | Notes                                                              |
| ----------------- | ------------------ | ------------------------------------------------------------------ |
| UI completeness   | Ready              | All 4 form modes, 2 tabs, ConfirmDialog guards already exist       |
| TypeScript types  | Ready              | AddOnProduct, ServiceBundle already defined in services.types.ts   |
| DB migrations     | Needs creation     | 0005 + 0006 (not 0006 + 0007 as plan stated)                       |
| Repository        | Needs creation     | Bundle read needs nested select; bundle update needs DELETE+INSERT |
| Service layer     | Needs creation     | Cross-salon serviceIds validation required                         |
| Router            | Needs creation     | 7 procedures                                                       |
| Controller        | Needs full rewrite | Remove BaseSettingsController, implement section-based             |
| UI wiring         | Needs update       | ProdukPaketPageClient + ProdukPaketForm only                       |
| Cross-domain risk | Document in report | Bundle degradation on service delete; imageUrl blob: stripping     |
| Customer app      | Not affected       | Does not yet read from these tables                                |

**After reading this document, implementation can begin immediately. No further architecture decisions are required for Sprint 3.2.**
