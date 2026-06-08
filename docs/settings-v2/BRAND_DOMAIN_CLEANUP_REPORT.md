# Brand Domain Cleanup Report

> Phase 5.4B
> Date: 2026-06-08

---

## 1. File Tree (after cleanup)

```
settings/components/shared/
  SettingsInput.tsx                  NEW  -- styled input, prefix support, error state
  SettingsTextarea.tsx               NEW  -- styled textarea, error state
  SettingsFormGrid.tsx               unchanged
  SettingsFieldGroup.tsx             unchanged
  SettingsUploadField.tsx            unchanged
  SettingsPreviewPanel.tsx           unchanged
  SettingsEmptyState.tsx             unchanged
  SettingsListCard.tsx               unchanged
  SettingsDangerZone.tsx             unchanged
  index.ts                           UPDATED -- exports SettingsInput, SettingsTextarea

settings/components/shared/preview/
  BookingPagePreview.tsx             NEW  -- moved from brand/, domain-agnostic

settings/components/brand/
  BrandPageClient.tsx                UPDATED -- uses BookingPagePreview, maps BrandProfile → BookingPagePreviewData
  BrandForm.tsx                      REFACTORED -- orchestrator only, 34 lines
  BrandPreview.tsx                   DEPRECATED -- shim re-export only, 4 lines

settings/components/brand/sections/
  BrandIdentitySection.tsx           NEW  -- identity fields using SettingsInput, SettingsTextarea
  BrandMediaSection.tsx              NEW  -- logo + cover using SettingsUploadField
  BrandContactSection.tsx            NEW  -- phone, wa, email, website using SettingsInput
  BrandSocialSection.tsx             NEW  -- instagram, tiktok, facebook with prefix support
  BrandLocationSection.tsx           NEW  -- address, city, mapsUrl

settings/types/
  brand.types.ts                     CLEANED -- DB notes removed, pointer to docs added

hooks/settings/
  useBrandProfileController.ts       CLEANED -- pendingFiles removed from public API, upload flow documented

docs/settings-v2/
  brand-database-contract.md         NEW  -- DB column mapping + migration SQL + storage buckets
  BRAND_DOMAIN_ARCHITECTURE_AUDIT.md
  BRAND_DOMAIN_CLEANUP_REPORT.md     (this file)
```

---

## 2. Before / After Line Counts

| File                           | Before | After | Delta                         |
| ------------------------------ | ------ | ----- | ----------------------------- |
| `BrandForm.tsx`                | 220    | 34    | -186                          |
| `BrandPageClient.tsx`          | 22     | 38    | +16 (preview mapping)         |
| `BrandPreview.tsx`             | 100    | 4     | -96 (logic moved)             |
| `useBrandProfileController.ts` | 177    | 168   | -9 (pendingFiles removed)     |
| `brand.types.ts`               | 45     | 28    | -17 (DB notes moved)          |
| `BrandIdentitySection.tsx`     | 0      | 52    | new                           |
| `BrandMediaSection.tsx`        | 0      | 44    | new                           |
| `BrandContactSection.tsx`      | 0      | 57    | new                           |
| `BrandSocialSection.tsx`       | 0      | 55    | new                           |
| `BrandLocationSection.tsx`     | 0      | 54    | new                           |
| `BookingPagePreview.tsx`       | 0      | 80    | new (moved from BrandPreview) |
| `SettingsInput.tsx`            | 0      | 47    | new                           |
| `SettingsTextarea.tsx`         | 0      | 24    | new                           |

BrandForm went from 220 lines to 34. Each section file stays under 60 lines.

---

## 3. Shared Components Created

| Component            | Purpose                                   | Reusable by                      |
| -------------------- | ----------------------------------------- | -------------------------------- |
| `SettingsInput`      | Styled input, prefix variant, error state | All 6 domains                    |
| `SettingsTextarea`   | Styled textarea, error state              | Brand, Layanan, Operasional      |
| `BookingPagePreview` | Customer booking page header preview      | Brand, Booking App, Theme Editor |

`SettingsInput` includes a `prefix` prop replacing the inline custom JSX pattern previously used for social media fields (instagram.com/, tiktok.com/@). The prefix variant renders the same visual but is now a single component with no JSX duplication.

---

## 4. Coupling Reduction

| Coupling                                    | Before | After                                               |
| ------------------------------------------- | ------ | --------------------------------------------------- |
| BrandForm owns INPUT_CLASS / TEXTAREA_CLASS | YES    | NO - moved to SettingsInput/Textarea                |
| BrandPreview coupled to BrandProfile type   | YES    | NO - BookingPagePreview uses BookingPagePreviewData |
| BrandPageClient imports BrandPreview        | YES    | NO - imports BookingPagePreview directly            |
| Controller exposes stale pendingFiles ref   | YES    | NO - removed from public interface                  |
| DB migration notes in type file             | YES    | NO - moved to brand-database-contract.md            |

---

## 5. Preview Ownership Verification

`BookingPagePreview` in `settings/components/shared/preview/`:

- Accepts `BookingPagePreviewData` interface (7 fields: salonName, tagline, description, logoUrl, coverImageUrl, phone, city)
- Does NOT import from `brand.types.ts`
- Does NOT depend on `BrandProfile`
- Can be imported by any domain without pulling Brand dependencies

`BrandPageClient` maps `ctrl.profile` to `BookingPagePreviewData` at the usage site. The mapping is 7 explicit field assignments — no spread, no partial, explicit and type-safe.

`BrandPreview.tsx` is now a 4-line deprecation shim. It re-exports `BookingPagePreview` under the old name. Any lingering import of `BrandPreview` continues to compile but gets the new implementation.

---

## 6. Controller API Verification

Removed from public interface:

- `pendingFiles: { logo?: File; cover?: File }` -- was stale (ref value captured at render)

`pendingFilesRef` remains as an implementation detail inside the hook. It is accessed correctly only inside `handleSave`, where the ref value is current.

Upload flow is now documented as a commented code block inside `handleSave`:

```
Future: uploadAsset(file, { bucket, variant }) -> url -> tRPC mutation
```

The service layer (`uploadAsset`) is named but not imported -- it does not exist yet. No hard coupling to Supabase inside the hook.

---

## 7. Token Compliance Verification

`SettingsInput` and `SettingsTextarea` use only V2 dashboard tokens:

| Token                       | Purpose            |
| --------------------------- | ------------------ |
| `rounded-r10`               | input radius       |
| `border-bd-card`            | default border     |
| `bg-bg-input`               | input background   |
| `text-ts-fn`                | font size          |
| `text-tx-primary`           | text color         |
| `placeholder:text-tx-muted` | placeholder        |
| `focus:border-tx-secondary` | focus border       |
| `focus:ring-tx-secondary`   | focus ring         |
| `border-ac-danger`          | error state border |

Zero hardcoded hex. Zero legacy tokens (`accent`, `label`, `sep`, `surface`).

All 5 section files use SettingsInput/SettingsTextarea exclusively. No raw `<input>` with class strings.

---

## 8. Readiness for Services Domain

| Check                                   | Status          |
| --------------------------------------- | --------------- |
| SettingsInput shared primitive ready    | PASS            |
| SettingsTextarea shared primitive ready | PASS            |
| Section extraction pattern established  | PASS            |
| Controller pattern clean                | PASS            |
| Preview decoupled from domain type      | PASS            |
| DB contract in docs (not in types)      | PASS            |
| BrandForm < 50 lines                    | PASS (34 lines) |
| Each section < 60 lines                 | PASS            |
| Zero INPUT_CLASS duplication            | PASS            |
| Upload architecture documented          | PASS            |

---

## Final Decision: READY FOR PHASE 5.5

Brand Domain is now the reference architecture for all future Settings domains.

**Pattern to clone for Services, Tim, Operasional:**

```
{Domain}PageClient.tsx          -- state root, controller + layout wiring
{Domain}Form.tsx                -- orchestrator only, imports sections
{Domain}/sections/
  {Domain}{Section}Section.tsx  -- one file per logical group of fields
hooks/settings/
  use{Domain}Controller.ts      -- state, dirty, save (mock), upload contract
settings/types/
  {domain}.types.ts             -- type definitions only, pointer to docs
docs/settings-v2/
  {domain}-database-contract.md -- migration SQL, storage buckets
```
