# Brand Domain Architecture Audit

> Phase 5.4A — Architecture Review Only. No code changes.
> Date: 2026-06-08

---

## 1. Executive Summary

Brand Domain is structurally sound at the macro level. The controller-form-preview pattern is clean, component depth is shallow, and design system compliance is complete. However, three issues must be resolved before this architecture is used as the blueprint for Services, Tim, and other domains.

**Critical fixes required before Phase 5.5:**

1. `INPUT_CLASS` / `TEXTAREA_CLASS` are module-level constants inside `BrandForm`. If cloned into every domain form, divergence is guaranteed. Extract to `SettingsInput` shared component.
2. `BrandForm.tsx` is ~220 lines and growing. All 5 sections are inline JSX. Services domain following this pattern would produce a 600+ line file. Extract sections to sub-components.
3. `BrandPreview` ownership is wrong. It renders the customer booking page header but lives in `brand/`. It will need to evolve into the Booking App live preview. Move to a shared preview layer now.

**Decision: GO WITH FIXES**

---

## 2. Component Tree

```
app/dashboard/settings/brand/page.tsx        [Server Component, 5 lines]
  └── BrandPageClient                        [Client, state root]
        ├── useBrandProfileController()      [Hook, all form state]
        ├── SettingsPreviewPanel             [Layout primitive, shared]
        │     ├── form slot
        │     │     └── BrandForm           [Client, 220+ lines]
        │     │           ├── SettingsSection x5
        │     │           │     ├── SettingsSectionHeader
        │     │           │     ├── SettingsContentCard
        │     │           │     └── SettingsFormGrid
        │     │           │           └── SettingsFieldGroup
        │     │           │                 └── <input> / <textarea>
        │     │           └── SettingsUploadField x2    (logo, cover)
        │     └── preview slot
        │           └── BrandPreview        [Client, 100 lines]
        └── SettingsActionBar               [Client, shared, sticky]
```

**Component depth:** 7 levels max (page -> PageClient -> PreviewPanel -> Form -> Section -> Grid -> FieldGroup -> input).

**Ownership boundaries:**

- `BrandPageClient` — state root. Owns controller, passes props down.
- `BrandForm` — presentation + field binding. Should not own logic.
- `BrandPreview` — presentation only. But wrong location (see Section 6).
- `SettingsPreviewPanel`, `SettingsActionBar` — shared layout primitives, domain-agnostic.

---

## 3. File Size Report

| File                           | Lines | Responsibility                      | Risk   |
| ------------------------------ | ----- | ----------------------------------- | ------ |
| `brand/page.tsx`               | 5     | Route shell                         | LOW    |
| `BrandPageClient.tsx`          | 22    | State root + layout wiring          | LOW    |
| `BrandPreview.tsx`             | 100   | Customer app header preview         | MEDIUM |
| `useBrandProfileController.ts` | 177   | Form state + save + upload contract | MEDIUM |
| `brand.types.ts`               | ~45   | Types + DB mapping comments         | LOW    |
| `BrandForm.tsx`                | ~220  | 5 sections, all inline JSX          | HIGH   |

**Flags:**

- `BrandForm.tsx` at ~220 lines is already above the 100-line target. This file will grow every time a new field is added. If Services domain follows the same pattern with 10+ fields per service, the equivalent form file will be 600+ lines.

- `useBrandProfileController.ts` at 177 lines is acceptable now (it contains the full `BrandProfileController` interface, mock data, and all setters), but will need refactoring when tRPC is wired — the mock initialisation pattern does not support async loading state.

---

## 4. Responsibility Audit

| File                        | Responsibility                     | Status    |
| --------------------------- | ---------------------------------- | --------- |
| `brand/page.tsx`            | Infrastructure (routing)           | PASS      |
| `BrandPageClient.tsx`       | Orchestration only                 | PASS      |
| `BrandPreview.tsx`          | Presentation                       | PASS      |
| `SettingsPreviewPanel`      | Layout primitive                   | PASS      |
| `SettingsActionBar`         | Presentation + minimal UI state    | PASS      |
| `SettingsFormGrid`          | Layout primitive                   | PASS      |
| `SettingsFieldGroup`        | Presentation                       | PASS      |
| `SettingsUploadField`       | Presentation + file validation     | PASS      |
| `useBrandProfileController` | State + orchestration              | PASS      |
| `BrandForm.tsx`             | Presentation + domain logic        | VIOLATION |
| `brand.types.ts`            | Type definitions + migration notes | VIOLATION |

**Violations:**

`BrandForm.tsx` - Presentation + Domain Logic

- Contains `INPUT_CLASS` and `TEXTAREA_CLASS` — styling constants that belong to a shared input primitive, not a domain form.
- The social media prefix inputs (instagram.com/, tiktok.com/@) embed URL-formatting logic inline in JSX. If the platform URL format changes, it requires a BrandForm edit instead of a config change.

`brand.types.ts` - Type definitions + DB migration notes

- DB column mapping comments (`salons.tagline (MISSING)`) are infrastructure documentation, not type definitions. Type files should contain only types.

---

## 5. Coupling Audit

**Question 1: Is Brand coupled to Booking App Preview?**

Yes. `BrandPreview` renders the customer booking page header (cover image, logo, name, tagline, CTA). This is conceptually the Booking App live preview, not a Brand-specific component. If Booking App domain is built separately, there will be two competing preview components.

**Question 2: Can Brand exist without Preview?**

Yes. `BrandPreview` is passed as a prop slot to `SettingsPreviewPanel`. Removing it requires only removing the `preview={}` prop. Brand form and save flow are completely independent.

**Question 3: Can Preview move into Booking App domain later?**

Yes, but it will require a type contract change. Currently `BrandPreview` accepts `BrandProfile` directly. Booking App domain will need a broader type (includes payment config, booking rules, etc.). The move is possible but will involve a type refactor.

**Question 4: Is upload logic leaking into UI components?**

No. `SettingsUploadField` calls `onChange(file, previewUrl)` and does nothing else with the file. File routing (storage bucket, path, compression) is entirely the controller's concern. This boundary is clean.

**Question 5: Is controller coupled to storage implementation?**

Partially. The controller has:

```
// TODO: upload pendingFilesRef.current.logo / .cover to Supabase Storage
```

The upload destination (Supabase) is named in a comment inside the controller. The actual upload is not yet implemented, so there is no hard coupling yet. When implemented, the controller should call a service layer (`uploadImage(file, bucket, path)`) rather than calling Supabase client directly. If Supabase is called directly, the controller mixes state management with infrastructure.

**Additional finding — `pendingFiles` return value is misleading:**

The controller interface exports `pendingFiles: { logo?: File; cover?: File }`. This value is `pendingFilesRef.current` captured at render time. Since `useRef` mutations do not trigger re-renders, any consumer reading `pendingFiles` from outside the controller will always see a stale snapshot. The ref is only accessed correctly inside `handleSave`. The exported `pendingFiles` property is never used by any consumer (BrandPageClient does not read it), making it dead API surface on the public interface.

---

## 6. Preview Audit

**Component:** `BrandPreview`

**Data consumed:** `BrandProfile.identity`, `BrandProfile.media`, `BrandProfile.contact`, `BrandProfile.location`

**What it renders:** Customer booking page header — cover image, logo, salon name, tagline, description, contact chips, primary CTA button.

**Current location:** `settings/components/brand/`

**Analysis:**

BrandPreview renders the customer-facing booking page. The comment in the file confirms this: "Layout mirrors the customer app booking page top section." This is not a brand configuration preview — it is the first iteration of the Booking App live preview.

As Settings evolves:

- Booking App domain will need its own full live preview (cover + services + CTA + booking widget)
- That preview will need `BrandProfile` data AND booking config data (deposit, payment methods, etc.)
- If `BrandPreview` stays in `brand/`, it will be forked or duplicated when Booking App is built

The component does not belong to Brand domain. It belongs to a shared preview system that will be owned by Booking App domain.

**Recommendation: MOVE**

Move to: `settings/components/shared/preview/BookingPagePreview.tsx`

Accept a narrower props interface: `BookingPagePreviewProps` that accepts only the fields it renders (`salonName`, `tagline`, `description`, `logoUrl`, `coverImageUrl`, `phone`, `city`). This decouples it from `BrandProfile` type entirely and makes it reusable by both Brand and Booking App domains.

---

## 7. Upload Architecture Audit

**Current state:**

```
SettingsUploadField (UI)
  onChange(file: File, previewUrl: string) -> controller
  File validation (size, type) -> in UI component (correct)

useBrandProfileController (state)
  pendingFilesRef.current.logo / .cover -> stored in ref
  handleSave -> TODO: upload to Supabase
```

**Is upload UI presentation-only?** Yes. `SettingsUploadField` does not know where files go.

**Is WebP conversion injectable?** Partially. The comment "Future: auto-converted to WebP before upload" is in `SettingsUploadField`, before `onChange` fires. The correct location for conversion is between file selection and `onChange` callback. The current structure allows a future uploader service to be inserted at that exact point without UI changes.

**Is the workflow reusable for other domains?**

| Domain  | Asset        | UploadVariant | Reuse    |
| ------- | ------------ | ------------- | -------- |
| Brand   | Logo         | `logo`        | existing |
| Brand   | Cover        | `cover`       | existing |
| Tim     | Staff avatar | `avatar`      | existing |
| Layanan | Add-on image | `addon`       | existing |

All 4 variants are already defined. No new variants needed for current domains.

**Recommended architecture when wiring backend:**

```
SettingsUploadField
  onChange(file, previewUrl)
       |
       v
useDomainController
  pendingFiles ref
       |
       v (on save)
uploadImage(file, { bucket, path, variant }) -> UploadService
       |
       v
supabaseStorage.from(bucket).upload(path, file)
       |
       v
publicUrl -> update profile state -> tRPC mutation
```

The `UploadService` layer should be a standalone async function in `shared/lib/upload.ts`, not inside any controller. Controllers call it; they do not implement it.

---

## 8. Database Contract Audit

**Current state:** `brand.types.ts` contains:

1. Type definitions (`BrandIdentity`, `BrandMedia`, etc.) -- correct location
2. DB column mapping comments with `(MISSING)` annotations -- wrong location

**Issue:**

DB migration notes embedded in a TypeScript type file create a maintenance problem. When migrations are run and columns are added, developers must remember to update comments in a `.ts` file. Comments in source files are not part of any migration workflow.

**Recommendation:**

Remove the DB mapping comment block from `brand.types.ts`. Keep only type definitions.

Move the DB gap analysis to: `docs/settings-v2/phase-5.2-customer-app-contract-audit.md` (already exists) under a "Brand domain pending migrations" section.

The type file should be self-documenting through field names alone.

---

## 9. Reusability Score

| Component             | Score | Notes                                                                                                                                      |
| --------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `SettingsUploadField` | 9/10  | 4 variants, clean contract, WebP-ready. -1: `VARIANT_CONFIG` labels are in Indonesian, minor i18n concern                                  |
| `SettingsFormGrid`    | 10/10 | Pure layout, no assumptions, 3 column options                                                                                              |
| `SettingsFieldGroup`  | 9/10  | Clean label/error/hint slot. -1: `fullWidth` prop is a grid-escape hack; consider `colSpan` instead                                        |
| `SettingsActionBar`   | 8/10  | Covers the primary save/cancel pattern. -2: no support for multi-action bars (e.g., "Save & Publish" pattern needed by Booking App)        |
| `BrandForm`           | 3/10  | Tightly coupled to `BrandProfile` type and `BrandProfileController`. `INPUT_CLASS` should be extracted. Not reusable outside Brand domain. |
| `BrandPreview`        | 4/10  | Renders customer app header correctly, but typed to `BrandProfile`. Moving and retyping to narrower props would raise this to 8/10.        |

---

## 10. Technical Debt Report

| Debt Item                                              | Classification | Impact                                                                                                                  |
| ------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `INPUT_CLASS` / `TEXTAREA_CLASS` duplicated per-domain | MEDIUM         | Every domain form will declare its own copy. Token drift guaranteed within 3 domains.                                   |
| `BrandForm.tsx` sections not extracted                 | MEDIUM         | File will reach 600+ lines if Services domain follows same pattern.                                                     |
| `BrandPreview` in wrong domain                         | MEDIUM         | Will be forked when Booking App domain is built. Two competing preview components.                                      |
| `isDirty` via `JSON.stringify` per-render              | LOW            | Acceptable for BrandProfile size. Will become noticeable in Services domain with 20+ service objects.                   |
| `MOCK_PROFILE` in controller                           | LOW            | Will be replaced by tRPC query. Requires architectural change to support loading state (init from null, not from mock). |
| `pendingFiles` exported from controller interface      | LOW            | Dead API surface. Always stale. Misleads future developers.                                                             |
| DB migration notes in `brand.types.ts`                 | LOW            | Maintenance drift risk. No workflow enforces keeping comments current.                                                  |
| Social URL prefixes hardcoded in BrandForm JSX         | LOW            | Brittle. If Instagram changes URL format, requires BrandForm edit.                                                      |
| Controller names Supabase in a TODO comment            | LOW            | No hard coupling yet. Risk materialises only if upload is implemented directly in controller.                           |

---

## 11. Go / No-Go Decision

**Decision: GO WITH FIXES**

The Brand Domain architecture is sound enough to ship and demonstrate the pattern. The controller-form-preview split is correct. Token compliance is complete. Component depth is acceptable. No monolith exists yet.

However, the three issues below must be resolved before Services domain (Phase 5.5) begins. If they are not fixed, each subsequent domain will clone the same mistakes at increasing cost.

### Required fixes before Phase 5.5

**FIX 1 — Extract SettingsInput (MEDIUM priority)**

Create `settings/components/shared/SettingsInput.tsx` and `SettingsTextarea.tsx` (or a single component with a `multiline` prop) using the current `INPUT_CLASS` token string as the default style. Remove `INPUT_CLASS` / `TEXTAREA_CLASS` from `BrandForm.tsx`. Every domain form uses this component. Prevents divergence across 6 domains.

**FIX 2 — Extract BrandForm sections to sub-components (MEDIUM priority)**

Split BrandForm into:

```
BrandForm.tsx (orchestrator, ~30 lines)
  BrandIdentitySection.tsx
  BrandMediaSection.tsx
  BrandContactSection.tsx
  BrandSocialSection.tsx
  BrandLocationSection.tsx
```

Each section file stays under 60 lines. BrandForm becomes an orchestrator only. This is the pattern Services domain must follow from day one (CategorySection, ServiceListSection, AddonSection).

**FIX 3 — Move BrandPreview to shared preview layer (MEDIUM priority)**

Move `BrandPreview` to `settings/components/shared/preview/BookingPagePreview.tsx`. Change prop type from `BrandProfile` to a minimal interface:

```ts
interface BookingPagePreviewData {
  salonName: string;
  tagline: string;
  description: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  phone: string;
  city: string;
}
```

BrandPageClient maps `ctrl.profile` fields to this interface when passing to preview. Booking App domain later passes its own data to the same component.

### Not blocking Phase 5.5 (backlog)

- Remove DB notes from `brand.types.ts` -> move to docs
- Replace `JSON.stringify` dirty check with shallow field comparison
- Remove `pendingFiles` from exported controller interface
- Add `SettingsInput` / `SettingsTextarea` to components/shared inventory doc

---

## Appendix — File Inventory

```
settings/components/brand/
  BrandForm.tsx              ~220 lines  HIGH risk monolith
  BrandPageClient.tsx          22 lines  clean
  BrandPreview.tsx            100 lines  wrong domain

hooks/settings/
  useBrandProfileController.ts  177 lines  acceptable, needs loading state later

settings/types/
  brand.types.ts                ~45 lines  needs DB notes removed

app/dashboard/settings/brand/
  page.tsx                        5 lines  correct thin shell
```
