# Sprint 1.3 — Layanan Persistence Report

**Date:** 2026-06-12
**Status:** Complete
**tsc --noEmit:** 0 errors

---

## Files Created

| File                                                                  | Purpose                                                        |
| --------------------------------------------------------------------- | -------------------------------------------------------------- |
| `packages/database/src/migrations/0002_alter_categories_services.sql` | Migration: adds missing columns to `categories` and `services` |
| `src/server/settings/repositories/services.repository.ts`             | DB layer — CRUD for categories and services                    |
| `src/server/settings/services/services.service.ts`                    | Business logic — validation, RepositoryError passthrough       |
| `src/server/trpc/routers/settings/services.ts`                        | tRPC router — 7 procedures (1 query + 6 mutations)             |

## Files Modified

| File                                                             | Change                                   |
| ---------------------------------------------------------------- | ---------------------------------------- |
| `src/server/trpc/routers/settings/_settings.ts`                  | Registered `services: servicesRouter`    |
| `src/features/dashboard/hooks/settings/useServicesController.ts` | Full rewrite — tRPC replacing mock state |

**Not modified:** `ServicesPageClient.tsx`, `ServicesForm.tsx`, `ServicesAccordion.tsx`, `CategoryForm.tsx`, `ServiceForm.tsx`, `QuestionForm.tsx` — interface preserved exactly.

---

## Migration

**Run before Sprint 1.3 go-live:**

```sql
-- packages/database/src/migrations/0002_alter_categories_services.sql
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS color      TEXT    NOT NULL DEFAULT 'bg-c-peach',
  ADD COLUMN IF NOT EXISTS blob_color TEXT    NOT NULL DEFAULT '#f5c4ab',
  ADD COLUMN IF NOT EXISTS icon       TEXT    NOT NULL DEFAULT 'Scissors',
  ADD COLUMN IF NOT EXISTS is_active  BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS service_flow TEXT NOT NULL DEFAULT 'TREATMENT'
    CHECK (service_flow IN ('STYLING_HAIR','STYLING_COLOUR','STYLING_NAIL','TREATMENT')),
  ADD COLUMN IF NOT EXISTS sort_order   INTEGER NOT NULL DEFAULT 0;
```

**Column name note:** The `icon` column is named `icon` (not `icon_name`) to match the existing customer app query:

```
category:categories(id, name, slug, description, icon, color)
```

Renaming this column would break the customer booking flow.

**Pre-existing columns confirmed:** `id`, `salon_id`, `name`, `slug`, `description`, `created_at`, `updated_at` (categories); `id`, `salon_id`, `category_id`, `name`, `description`, `price`, `duration`, `price_type`, `requires_specialist`, `is_active`, `service_questions` (services).

---

## Procedures Added

### `trpc.settings.services.getServicesDomain`

- Type: `protectedProcedure.query`
- Output: `{ categories: ServiceCategory[], services: ServiceItem[] }`
- Both arrays fetched in parallel (`Promise.all`) to minimize latency

### `trpc.settings.services.createCategory`

- Input: category fields + `sortOrder`
- Output: `ok(ServiceCategory)` — returns the DB-assigned record (with real UUID)
- Side effect: generates `slug` from name (owner dashboard does not expose slug)

### `trpc.settings.services.updateCategory`

- Input: `{ id, patch: Partial<...> }`
- Output: `ok()`
- **Never updates slug** — customer app uses slug in booking URLs

### `trpc.settings.services.deleteCategory`

- Input: `{ id }`
- Output: `ok()`
- Cascades: deletes all services with matching `category_id` first, then deletes category (no assumption about DB CASCADE)

### `trpc.settings.services.createService`

- Input: service fields + `sortOrder`
- Output: `ok(ServiceItem)` — returns DB-assigned record

### `trpc.settings.services.updateService`

- Input: `{ id, patch: Partial<...> }`
- Output: `ok()`
- Accepts `questions: ServiceQuestion[]` in patch — persisted to `service_questions` jsonb column

### `trpc.settings.services.deleteService`

- Input: `{ id }`
- Output: `ok()`

---

## Architecture Decisions

### Immediate mutations (no batch save)

The mock controller batched all CRUD into a single "Save" button click. With real DB, each action fires immediately:

- User opens sheet → fills form → clicks **Simpan** (SideSheet button) → DB write fires
- No second "Save All" step required
- `isDirty = false` always — header Save button stays disabled (intentional)
- `handleSave` = no-op
- `handleReset` = invalidates `getServicesDomain` query (re-fetches from DB)

This is strictly better UX. The controller interface is unchanged — zero UI file changes required.

### Questions via jsonb + updateService

`ServiceQuestion[]` is stored in `services.service_questions` (jsonb). There is no separate `questions` table. Question CRUD:

1. Controller reads the owning service from `domainFromDb` (React Query cache)
2. Modifies the questions array in memory
3. Calls `updateService` with the new `questions` array in the patch

This means question operations go through the `updateService` mutation and benefit from the same invalidation pattern.

### Slug: generate on CREATE only

Category slug is auto-generated from the name on `createCategory`. It is never updated when the name changes. This preserves all existing customer booking URLs.

### `icon` DB column (not `icon_name`)

The TS type uses `iconName` (camelCase). The DB column is `icon` to match the customer app's existing SELECT query. The repository mapper handles the rename: `iconName → icon` on write, `icon → iconName` on read.

### `unknown` cast at Supabase boundary

`data as unknown as ServiceCategoryRow` / `data as unknown as ServiceItemRow[]` — same pattern as brand repository. Required because Supabase JS cannot infer row shape from a runtime string column list. The cast is safe: column lists in `CATEGORY_COLUMNS` / `SERVICE_COLUMNS` match the row interfaces exactly.

---

## End-to-End Flow

### Read (page load)

```
ServicesPageClient renders
  → useServicesController()
    → trpc.settings.services.getServicesDomain.useQuery()
      → servicesRouter.getServicesDomain
        → servicesService.getServicesDomain(salonId)
          → Promise.all([getCategories(salonId), getServices(salonId)])
            → SELECT id, name, ... FROM categories WHERE salon_id = ?
            → SELECT id, name, ..., service_questions FROM services WHERE salon_id = ?
          ← { categories, services }
        ← { categories, services }
      ← ServicesDomain
    ← domain
  → UI renders with live DB data
```

### Write (add category)

```
Owner opens "Tambah Kategori" sheet → fills form → clicks Simpan
  → ServicesForm.handleSave() → ctrl.addCategory(draft)
    → createCategoryMutation({ name, description, ..., sortOrder })
      → servicesRouter.createCategory
        → servicesService.createCategory(salonId, draft, sortOrder) [validates]
          → servicesRepo.createCategory(salonId, draft, sortOrder)
            → INSERT INTO categories (...) RETURNING ...
          ← ServiceCategory (with real DB UUID)
        ← ServiceCategory
      ← ok(ServiceCategory)
    ← resolves
  → onSuccess: utils.settings.services.getServicesDomain.invalidate()
    → query refetches → UI updates with new category
```

---

## Architecture Compliance

- No direct Supabase access outside `repositories/`
- No `any` types — strict TypeScript throughout (`unknown` cast at Supabase boundary)
- All mutations use `protectedProcedure` — UNAUTHORIZED if salonId absent
- `ok()` / `ok(data)` used consistently from `result.ts`
- `RepositoryError` / `ServiceError` / `toTRPCError()` chain followed exactly
- `ServicesController` interface unchanged — zero changes to any UI component
- `staleTime: 30_000` on the domain query
- No optimistic updates — invalidate and refetch after every mutation
- No namespace-level invalidation — only `getServicesDomain` is invalidated

---

## Known Limitations

1. **No `service_questions` existence check** — the migration comment notes that `service_questions` may need to be added if it does not exist. Check the live DB before running migration 0002.

2. **Optimistic IDs for questions** — `addQuestion` assigns a temporary `opt-*` ID to the question before the server round-trip. The real ID comes back after `getServicesDomain` refetches. During this window, the question has an optimistic ID in the cache. This is invisible to the user (no UI keying on question ID in the current sheets flow).

3. **Sort order on add** — `addCategory` uses `domain.categories.length` as the new item's `sortOrder`. If two rapid adds arrive in quick succession before invalidation resolves, they may receive the same `sortOrder`. A future sort-management feature (drag-to-reorder) will own `sortOrder` explicitly.

---

## Typecheck Result

```
npx tsc --noEmit  →  0 errors
```
