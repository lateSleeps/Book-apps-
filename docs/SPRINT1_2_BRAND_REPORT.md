# Sprint 1.2 — Brand Persistence Report

**Date:** 2026-06-12
**Status:** Complete
**tsc --noEmit:** 0 errors

---

## Files Created

| File                                                                   | Purpose                                                                                  |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `packages/database/src/migrations/0001_alter_salons_brand_booking.sql` | Migration: adds Brand + Booking App columns to `salons`                                  |
| `src/server/settings/repositories/brand.repository.ts`                 | DB layer — `getBrandProfile`, `updateBrandProfile`, `updateLogoUrl`, `updateCoverUrl`    |
| `src/server/settings/services/brand.service.ts`                        | Business logic — validation, EMPTY_BRAND_PROFILE fallback                                |
| `src/server/trpc/routers/settings/brand.ts`                            | tRPC router — `getBrandProfile`, `updateBrandProfile`, `updateLogoUrl`, `updateCoverUrl` |

## Files Modified

| File                                                                 | Change                                                    |
| -------------------------------------------------------------------- | --------------------------------------------------------- |
| `src/server/trpc/routers/settings/_settings.ts`                      | Registered `brand: brandRouter` in settings namespace     |
| `src/features/dashboard/hooks/settings/useBrandProfileController.ts` | Full rewrite — tRPC query + mutation replacing mock state |

**Not modified:** `BrandPageClient.tsx`, `BrandForm.tsx`, all `sections/*.tsx` — interface preserved exactly.

---

## Queries Added

### `trpc.settings.brand.getBrandProfile`

- Type: `protectedProcedure.query`
- Input: none (salonId from context)
- Output: `BrandProfile` — full profile or `EMPTY_BRAND_PROFILE` if salon has no data yet

## Mutations Added

### `trpc.settings.brand.updateBrandProfile`

- Type: `protectedProcedure.mutation`
- Input: `BrandProfile` (validated by `brandProfileSchema`)
- Output: `ok()`
- Validation: salonName required; email valid if non-empty; website/mapsUrl must be https:// if non-empty

### `trpc.settings.brand.updateLogoUrl`

- Type: `protectedProcedure.mutation`
- Input: `{ url: string | null }` — null or https:// URL
- Output: `ok()`
- Used by Sprint 4 after presigned upload completes, or for explicit removal

### `trpc.settings.brand.updateCoverUrl`

- Type: `protectedProcedure.mutation`
- Input: `{ url: string | null }` — null or https:// URL
- Output: `ok()`
- Same as updateLogoUrl

---

## Storage Integration

File uploads (logo, cover image) are **deferred to Sprint 4**. The upload flow requires the `supabaseAdmin` client (service_role_key) to generate presigned URLs. Until Sprint 4:

- `setLogo(file, blobUrl)` — stages the file in `pendingFilesRef`, shows blob URL preview
- `setCoverImage(file, blobUrl)` — same pattern
- `handleSave()` — strips blob URLs before sending to the tRPC mutation:
  - `null` → persisted (user explicitly removed)
  - `https://...` → persisted (existing DB URL)
  - `blob:` / `data:` → replaced with the current DB value (upload not yet implemented)
- `pendingFilesRef` is cleared after each save — Sprint 4 reads it to issue the upload

The UI behavior is unchanged: file preview appears immediately. The persisted URL updates only after a real upload (Sprint 4).

---

## Migration Requirements

**Run before Sprint 1.2 go-live:**

```sql
-- packages/database/src/migrations/0001_alter_salons_brand_booking.sql
ALTER TABLE salons
  ADD COLUMN IF NOT EXISTS tagline          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_image_url  TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp         TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram        TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tiktok           TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook         TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city             TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS maps_url         TEXT NOT NULL DEFAULT '',
  -- Booking App (same migration, one ALTER TABLE)
  ADD COLUMN IF NOT EXISTS payment_methods  TEXT[] NOT NULL DEFAULT ARRAY['qris','transfer'],
  ADD COLUMN IF NOT EXISTS qris_image_url   TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_mode TEXT NOT NULL DEFAULT 'auto'
    CHECK (confirmation_mode IN ('auto', 'manual')),
  ADD COLUMN IF NOT EXISTS salon_policy     TEXT;
```

**Already confirmed to exist:** `name`, `description`, `address`, `phone`, `email`, `logo_url`

---

## End-to-End Flow

### Read (page load)

```
BrandPageClient renders
  → useBrandProfileController()
    → trpc.settings.brand.getBrandProfile.useQuery()
      → brandRouter.getBrandProfile
        → brandService.getBrandProfile(salonId)
          → brandRepo.getBrandProfile(salonId)
            → SELECT name, tagline, ... FROM salons WHERE id = salonId
          ← BrandProfile | null
        ← BrandProfile (or EMPTY_BRAND_PROFILE fallback)
      ← BrandProfile
    ← savedProfile
  → useEffect: setDraft(savedProfile) [once, on first load]
  → UI renders with live DB data
```

### Write (save)

```
Owner edits form fields
  → ctrl.setIdentity/setContact/... → setDraft(patch)
  → isDirty = true (draft !== savedProfile)
  → header Save button enabled

Owner clicks Save
  → BrandPageClient: ctrl.handleSave()
    → strips blob: URLs from draft.media
    → upsertBrand.mutateAsync({ ...draft, media: safeMedia })
      → brandRouter.updateBrandProfile
        → brandService.updateBrandProfile(salonId, data) [validates]
          → brandRepo.updateBrandProfile(salonId, data)
            → UPDATE salons SET name=..., tagline=..., ... WHERE id = salonId
          ← void
        ← void
      ← ok()
    ← resolves
  → onSuccess: utils.settings.brand.getBrandProfile.invalidate()
    → query refetches from DB
  → isDirty = false
```

---

## Architecture Compliance

- No direct Supabase access outside `repositories/`
- No `any` types — strict TypeScript throughout (`unknown` cast at Supabase boundary)
- All brand mutations use `protectedProcedure` — UNAUTHORIZED if salonId absent
- `ok()` used consistently from `result.ts`
- `RepositoryError` / `ServiceError` / `toTRPCError()` chain followed exactly
- `BrandProfileController` interface unchanged — zero changes to `BrandPageClient`, `BrandForm`, or any section component
- `pendingFilesRef` preserved for Sprint 4 file upload wiring

---

## Known Limitations

1. **File uploads not persisted** — selecting a new logo/cover stores a blob preview but does not upload to Supabase Storage. The DB value is unchanged until Sprint 4 implements the presigned URL flow.

2. **`unknown` cast in repository** — `data as unknown as SalonBrandRow` at the Supabase boundary. This is necessary because `supabase-js` cannot infer row shape from a runtime string column list. The cast is safe — the column list in `BRAND_COLUMNS` matches `SalonBrandRow` exactly. When Supabase type generation is set up (Sprint 4), this cast can be replaced with generated types.

3. **Draft initialization on re-mount** — `hasInitialized.current` is a ref. If the component unmounts and remounts (e.g., navigating away and back), the ref resets and `draft` re-initializes from the query cache. This is correct behavior — the user starts fresh from the latest DB state.

4. **No optimistic update** — like the Operasional pattern, this invalidates the query after mutation completes. The form briefly shows the draft values until the refetch resolves.

---

## Typecheck Result

```
npx tsc --noEmit  →  0 errors
```
