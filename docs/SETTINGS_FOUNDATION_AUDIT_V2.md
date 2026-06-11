# Settings Foundation Audit V2

Scope: Brand & Profil, Layanan (Services), Produk & Paket
Date: 2026-06-11
Auditor: Claude Code (automated read-only pass)

---

## 1. File Inventory

### Layout Primitives

| File                                      | Purpose                                           | Key Deps                     |
| ----------------------------------------- | ------------------------------------------------- | ---------------------------- |
| `layout/SettingsPageShell.tsx`            | Top-level page wrapper (scroll container)         | -                            |
| `layout/SettingsPanel.tsx`                | White grouped-list card (Brand domain)            | cn                           |
| `layout/SettingsPanelSection.tsx`         | Section inside SettingsPanel with title + divider | -                            |
| `layout/SettingsSection.tsx`              | Generic vertical section wrapper                  | -                            |
| `layout/SettingsSectionHeader.tsx`        | Title + description + optional action slot        | -                            |
| `layout/SettingsContentCard.tsx`          | Simple white card with border                     | -                            |
| `layout/SettingsTabbedCard.tsx`           | White card with inline segmented control tabs     | SettingsSubNav               |
| `layout/SettingsSubNav.tsx`               | Segmented control tab bar                         | -                            |
| `layout/SettingsActionBar.tsx`            | Save/Cancel bar wired to context                  | SettingsHeaderActionsContext |
| `layout/SettingsHeaderActionsContext.tsx` | Context: page registers isDirty/handleSave        | React context                |
| `layout/SettingsSideSheet.tsx`            | Right-side drawer for CRUD forms                  | -                            |
| `layout/index.ts`                         | Re-exports all layout primitives                  | -                            |

### Shared Components

| File                                    | Purpose                                        | Key Deps              |
| --------------------------------------- | ---------------------------------------------- | --------------------- |
| `shared/SettingsInput.tsx`              | Controlled text input                          | -                     |
| `shared/SettingsTextarea.tsx`           | Controlled textarea                            | -                     |
| `shared/SettingsUploadField.tsx`        | Logo/cover image upload with preview           | shared/lib/image.ts   |
| `shared/SettingsIconPicker.tsx`         | Phosphor icon picker popover                   | @phosphor-icons/react |
| `shared/SettingsListCard.tsx`           | List row with thumbnail, badges, actions       | cn                    |
| `shared/SettingsEmptyState.tsx`         | Centered empty-state with icon + text + action | cn                    |
| `shared/SettingsFieldGroup.tsx`         | Label + hint + error wrapper for form fields   | -                     |
| `shared/SettingsFormGrid.tsx`           | 1- or 2-column CSS grid for form fields        | cn                    |
| `shared/SettingsAddButton.tsx`          | Outline button: "Tambah X"                     | -                     |
| `shared/SettingsDangerZone.tsx`         | Red-accented danger section                    | -                     |
| `shared/SettingsPreviewPanel.tsx`       | Right-side preview panel shell                 | -                     |
| `shared/EntityActionMenu.tsx`           | Kebab (3-dot) action menu dropdown             | @phosphor-icons/react |
| `shared/ConfirmDialog.tsx`              | Centered confirmation modal                    | -                     |
| `shared/preview/BookingPagePreview.tsx` | Live booking page preview                      | -                     |
| `shared/index.ts`                       | Re-exports all shared components               | -                     |

### Brand Domain

| File                                      | Purpose                                           | Key Deps                                          |
| ----------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| `brand/BrandPageClient.tsx`               | Page entrypoint, registers actions                | useBrandProfileController                         |
| `brand/BrandForm.tsx`                     | Assembles all Brand sections inside SettingsPanel | SettingsPanel                                     |
| `brand/sections/BrandIdentitySection.tsx` | Name, tagline, description fields                 | SettingsInput, SettingsTextarea, SettingsFormGrid |
| `brand/sections/BrandMediaSection.tsx`    | Logo + cover upload                               | SettingsUploadField                               |
| `brand/sections/BrandContactSection.tsx`  | Phone, WhatsApp, email, website                   | SettingsInput                                     |
| `brand/sections/BrandSocialSection.tsx`   | Instagram, TikTok, Facebook                       | SettingsInput                                     |
| `brand/sections/BrandLocationSection.tsx` | Address, city, province, maps URL                 | SettingsInput                                     |

### Services Domain

| File                                                 | Purpose                                      | Key Deps                                            |
| ---------------------------------------------------- | -------------------------------------------- | --------------------------------------------------- |
| `services/ServicesPageClient.tsx`                    | Page entrypoint, registers actions           | useServicesController                               |
| `services/ServicesForm.tsx`                          | Sheet state machine, wires CRUD to accordion | SettingsSideSheet, ConfirmDialog                    |
| `services/sections/ServicesAccordion.tsx`            | Category grid + service card grid            | EntityActionMenu, resolveIcon                       |
| `services/sections/ServicesListSection.tsx`          | Shim re-export to ServicesAccordion          | -                                                   |
| `services/sections/ConsultationQuestionsSection.tsx` | Per-service question list                    | EntityActionMenu, SettingsContentCard               |
| `services/sections/AddOnsSection.tsx`                | Add-on product cards                         | SettingsEmptyState, EntityActionMenu                |
| `services/sections/BundlesSection.tsx`               | Bundle cards                                 | SettingsEmptyState, EntityActionMenu                |
| `services/forms/CategoryForm.tsx`                    | Category add/edit form                       | SettingsInput, SettingsTextarea, SettingsIconPicker |
| `services/forms/ServiceForm.tsx`                     | Service add/edit form                        | SettingsInput, SettingsTextarea                     |
| `services/forms/QuestionForm.tsx`                    | Consultation question form                   | SettingsInput                                       |

### Produk & Paket Domain

| File                                     | Purpose                                   | Key Deps                                        |
| ---------------------------------------- | ----------------------------------------- | ----------------------------------------------- |
| `produk-paket/ProdukPaketPageClient.tsx` | Page entrypoint, registers actions        | useProdukPaketController, useServicesController |
| `produk-paket/ProdukPaketForm.tsx`       | Sheet state machine for addon/bundle CRUD | SettingsSideSheet, ConfirmDialog                |
| `produk-paket/forms/AddonForm.tsx`       | Add-on add/edit form                      | SettingsInput, SettingsTextarea                 |
| `produk-paket/forms/BundleForm.tsx`      | Bundle add/edit form                      | SettingsInput, SettingsTextarea                 |

### Hooks

| File                                             | Purpose                                                    | Key Deps               |
| ------------------------------------------------ | ---------------------------------------------------------- | ---------------------- |
| `hooks/settings/types/BaseSettingsController.ts` | Contract: isDirty, isSaving, handleSave, handleReset       | -                      |
| `hooks/settings/useBrandProfileController.ts`    | Brand state + pending file refs                            | useState, useRef       |
| `hooks/settings/useServicesController.ts`        | Full CRUD for categories/services/questions/addons/bundles | BaseSettingsController |
| `hooks/settings/useProdukPaketController.ts`     | CRUD for addons + bundles (separate mock data)             | BaseSettingsController |

---

## 2. Design System Violations

All violations found are in the scope of this audit.

### ServicesAccordion.tsx

- **Line 104**: `style={{ background: cat.blobColor ?? '#E5E5EA' }}` - hardcoded hex fallback `#E5E5EA` (also a STEP 3 violation - see below)

### BundlesSection.tsx

- **Line 77**: `text-[3rem]` - arbitrary font-size value on emoji placeholder `<div>`

No other bare `w-{n}`, `h-{n}`, `px-{n}`, `gap-{n}`, `text-{size}`, or `rounded-{n}` violations found in the in-scope files. The card button pattern used in AddOnsSection, BundlesSection, and ServicesAccordion (`rounded-r10 border border-bd-card bg-bg-card px-s12 py-s8 text-ts-fn`) is fully token-compliant. All spacing, radius, color, typography, and shadow classes in the three domains use design tokens correctly.

---

## 3. Hardcoded Style Violations

### ServicesAccordion.tsx

- **Line 104-106**: `style={{ background: cat.blobColor ?? '#E5E5EA' }}` and `color="#1C1C1E"` on the icon
  - `cat.blobColor` is a raw hex stored in mock data (e.g. `'#f5c4ab'`, `'#b8d6f0'`)
  - Fallback `#E5E5EA` is a hardcoded hex
  - Prop `color="#1C1C1E"` on the Phosphor icon is a hardcoded hex

### useServicesController.ts (mock data)

- **Lines 19-23**: `blobColor` values are raw hex strings (`'#f5c4ab'`, `'#b8d6f0'`, `'#a8e6d4'`, `'#f5d98a'`, `'#c8bef0'`) embedded in the mock seed. These will propagate to the rendered `style={}` above.

### services.types.ts

- `ServiceCategory.blobColor` is typed as `string | null` - no constraint to palette tokens. This is an architectural decision that permits arbitrary hex at the data layer.

No `style={{}}` in Brand sections, BundlesSection, AddOnsSection, ConsultationQuestionsSection, ProdukPaketForm, or any shared components.

---

## 4. Hardcoded Logic Violations

### ServicesAccordion.tsx - Deleted `getCategoryIcon` (previously present, now removed)

The current file imports `resolveIcon` from shared - this is correct. No hardcoded `if (n.includes('hair'))` remains in the current file.

### useServicesController.ts - Hardcoded serviceFlow enum values in mock data

- **Lines 26-29**: `serviceFlow: 'STYLING_HAIR'`, `serviceFlow: 'STYLING_COLOUR'` embedded in mock seed. If `serviceFlow` values change, mock data breaks silently.

### useServicesController.ts - `deleteCategory` cascade

- **Lines 122-129**: `deleteCategory` silently deletes all services in the category. There is no guard warning the user about cascading data loss (the guard is present in `ServicesForm.tsx` handleDeleteCategory UI layer, which is correct - but the controller itself is destructive without the UI check).

### ProdukPaketPageClient.tsx - Duplicate controller instantiation

- **Line 17**: `const servicesCtrl = useServicesController()` creates a second independent instance of the services controller. This means ProdukPaketPage has its own separate copy of service state, not connected to the ServicesPage state. Bundle `serviceIds` reference service IDs that exist only in the ServicesController instance on the Services page, not this new instance.

---

## 5. Reusable Component Opportunities

### "Add" button repeated verbatim in 4+ places

The pattern `<button className="flex items-center gap-s8 rounded-r10 border border-bd-card bg-bg-card px-s12 py-s8 text-ts-fn font-medium text-tx-primary shadow-card transition-colors hover:bg-bg-hover"><Plus .../> Label</button>` appears identically in:

- `ServicesAccordion.tsx` (line 69, line 155)
- `AddOnsSection.tsx` (line 39)
- `BundlesSection.tsx` (line 40)
- `ConsultationQuestionsSection.tsx` (line 69)

A `SettingsAddButton` component already exists in `shared/SettingsAddButton.tsx` but is not being used by any of these files. This is dead component debt.

### Service card and Add-on card are structurally near-identical

`AddOnsSection.tsx` card (lines 57-98) and `ServicesAccordion.tsx` service card (lines 186-217) share the same structure: image/icon area, name, description, price line, border-t footer, EntityActionMenu. Could be unified into a `SettingsItemCard` but is not critical.

### Empty state in ServicesAccordion is not using SettingsEmptyState

- `ServicesAccordion.tsx` lines 76-80 and 177-181 implement inline empty states (icon + text) instead of using `SettingsEmptyState`. AddOnsSection and BundlesSection correctly use `SettingsEmptyState`.

### formatPrice duplicated

`AddOnsSection.tsx` line 14-19 and `BundlesSection.tsx` line 14-17 both define identical `formatPrice(n)` helpers. Should be extracted to a shared currency util.

---

## 6. Controller Contract Audit

| Field                            | BrandProfileController               | ServicesController    | ProdukPaketController |
| -------------------------------- | ------------------------------------ | --------------------- | --------------------- |
| `isDirty`                        | yes                                  | yes                   | yes                   |
| `isSaving`                       | yes                                  | yes                   | yes                   |
| `handleSave`                     | yes (async)                          | yes (mock setTimeout) | yes (mock setTimeout) |
| `handleReset`                    | yes                                  | yes                   | yes                   |
| Extends `BaseSettingsController` | yes (implicitly - not via `extends`) | yes (via `extends`)   | yes (via `extends`)   |

**Finding 1**: `BrandProfileController` does not extend `BaseSettingsController` explicitly. The return type is declared inline in `useBrandProfileController.ts` as `BrandProfileController`. This is structurally compatible but the type system does not enforce the contract.

**Finding 2**: `useServicesController.handleSave` uses `console.log('[useServicesController] saved', domain)` (line 94) - debug log left in production code.

**Finding 3**: `useBrandProfileController.handleSave` is `async` while `BaseSettingsController.handleSave` declares `() => void`. The async version returns a `Promise<void>` which TypeScript allows but creates an implicit type mismatch if the interface is ever strictly enforced.

**Finding 4**: `useProdukPaketController.addBundle` signature is `Omit<ServiceBundle, 'id' | 'sortOrder'>` but `useServicesController.addBundle` is `Omit<ServiceBundle, 'id'>` (missing `sortOrder` omission). Inconsistency in the same method name across controllers.

---

## 7. Modal/Sheet Consistency Audit

### Add/Edit pattern

All three domains use the same pattern:

1. `SheetState` union type drives which form renders
2. `SettingsSideSheet` wraps the form
3. `onSave` dispatches to the controller based on `sheet.mode`
4. `canSave` gated by whether `currentDraft` is non-null

This is consistent across ServicesForm and ProdukPaketForm. Brand domain has no CRUD modals (it is a single-edit form).

### Delete pattern

Both ServicesForm and ProdukPaketForm use `ConfirmDialog` with identical `ConfirmPending` type. The `ConfirmPending` type is locally declared in both files (copy-paste). This should be extracted to `shared/ConfirmDialog.tsx` as an exported type.

### Consistency verdict

- ServicesForm: Add/Edit/Delete all implemented. PASS.
- ProdukPaketForm: Add/Edit/Delete all implemented. PASS.
- Brand: No CRUD operations needed. N/A.

---

## 8. Design Token Gap Analysis

The following UI patterns exist without dedicated tokens:

1. **Category blob color palette** - category background colors are raw hex values in data. No token set exists for the 5 category palette colors (`bg-c-peach`, `bg-c-blue`, etc. exist as Tailwind classes but the hex values used in `style={}` are not the same as what those tokens resolve to - untraceable without compiling).

2. **`shadow-dialog`** - used in `ConfirmDialog.tsx` line 29. This shadow token was not in the standard token list provided in the audit spec (`shadow-card`, `shadow-dropdown`, `shadow-tab`). Needs verification that it exists in tailwind.config.

3. **`shadow-drawer`** - used in `SettingsSideSheet.tsx` line 36. Same question as above.

4. **`animate-sIn`** - slide-in animation token used in SettingsSideSheet line 36. Not listed in token spec - needs verification.

5. **`bd-detail`** - border token used in SettingsSideSheet lines 39, 61. Not in the standard token list (`bd-card`, `bd-row` are listed). Needs verification.

---

## 9. Architecture Findings

### A. Duplicate mock data for add-ons

`useServicesController.ts` (lines 31-35) and `useProdukPaketController.ts` (lines 18-21) both contain the same 3 add-on products with the same IDs (`prod-1`, `prod-2`, `prod-4`). These are two independent state instances. When ProdukPaketPage saves addons, the ServicesPage state is unaffected and vice versa.

### B. ProdukPaketController duplicates addon/bundle management that ServicesController already owns

`useServicesController` already has full `addAddon`/`updateAddon`/`removeAddon`/`addBundle`/`updateBundle`/`removeBundle` methods (lines 155-192). `useProdukPaketController` re-implements the same logic for the same entity types. This creates two sources of truth for addons and bundles.

**Root cause**: The decision to split ProdukPaket into its own page with its own controller means the data is also split. When the app moves to real API calls, this will require two separate API routes or one of them will be wrong.

**Recommended fix**: Remove addon/bundle from `useServicesController` entirely and have ProdukPaketPageClient as the single owner, OR remove ProdukPaketController and have ServicesController own everything with ProdukPaketPage reading from ServicesController.

### C. `ServicesDomain` type includes addons and bundles

`services.types.ts` defines `ServicesDomain` with `categories`, `services`, `addons`, and `bundles`. The `useServicesController` mock data includes addons but no bundles (line 36: `bundles: []`). Yet `useProdukPaketController` separately owns both. This creates an overlap in the type layer.

### D. Dead component: SettingsAddButton

`shared/SettingsAddButton.tsx` exists but is not imported anywhere in the three audited domains. The button pattern is re-implemented inline in 5 places.

### E. ConfirmPending type duplication

`ServicesForm.tsx` lines 36-42 and `ProdukPaketForm.tsx` lines 27-33 declare identical `ConfirmPending` local types. Should be exported from `shared/ConfirmDialog.tsx`.

### F. ServicesListSection.tsx is a zombie file

`services/sections/ServicesListSection.tsx` is a re-export shim. It is in `git status` as deleted (D) but the file was found to still exist containing only the re-export comment. This file should be deleted.

---

## 10. Refactor Priority Matrix

### HIGH - Blocks correctness

| Issue                                                    | File                                                       | Specific Problem                                                                                                                                     |
| -------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate addon/bundle state                             | `useProdukPaketController.ts` + `useServicesController.ts` | Two independent copies of addon/bundle data. ProdukPaketPage cannot read or write to ServicesPage state. Save on one page does not affect the other. |
| ProdukPaketPageClient spawns separate ServicesController | `produk-paket/ProdukPaketPageClient.tsx` line 17           | `useServicesController()` called here creates isolated state; bundle `serviceIds` will reference IDs that exist only in that ephemeral instance      |
| Hardcoded category blobColor hex in ServicesAccordion    | `ServicesAccordion.tsx` lines 104-106                      | `style={{ background: cat.blobColor ?? '#E5E5EA' }}` and `color="#1C1C1E"` violate no-hex rule                                                       |

### MEDIUM - Design system / maintainability

| Issue                                                                 | File                                              | Specific Problem                                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| SettingsAddButton unused                                              | `shared/SettingsAddButton.tsx` + 5 inline buttons | Same button pattern copy-pasted; dead component or unused abstraction                   |
| formatPrice duplicated                                                | `AddOnsSection.tsx:14` + `BundlesSection.tsx:14`  | Identical Intl.NumberFormat helper - extract to `shared/lib/currency.ts`                |
| ConfirmPending type duplicated                                        | `ServicesForm.tsx:36` + `ProdukPaketForm.tsx:27`  | Identical local type - export from `ConfirmDialog.tsx`                                  |
| Empty states inconsistent in ServicesAccordion                        | `ServicesAccordion.tsx:76-80, 177-181`            | Inline pattern instead of `SettingsEmptyState` used by AddOnsSection and BundlesSection |
| BundlesSection emoji placeholder                                      | `BundlesSection.tsx:77`                           | `text-[3rem]` arbitrary value                                                           |
| BrandProfileController not explicitly typed as BaseSettingsController | `useBrandProfileController.ts`                    | Contract not enforced by type system                                                    |
| Debug console.log in production hook                                  | `useServicesController.ts:94`                     | `console.log('[useServicesController] saved', ...)`                                     |

### LOW - Cleanup / future-proofing

| Issue                                      | File                                                               | Specific Problem                                        |
| ------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------- |
| addBundle sortOrder omission inconsistency | `useProdukPaketController.ts:45` vs `useServicesController.ts:176` | One omits `sortOrder`, the other does not               |
| blobColor hex in mock seed                 | `useServicesController.ts:19-23`                                   | Raw hex in data - will propagate to style= indefinitely |
| ServicesListSection zombie shim            | `services/sections/ServicesListSection.tsx`                        | Should be deleted                                       |
| handleSave async mismatch                  | `useBrandProfileController.ts`                                     | async vs void in BaseSettingsController contract        |

---

## 11. VERDICT

**FOUNDATION REQUIRES REFACTOR** (targeted, not a full redo)

The Settings V2 foundation is structurally sound: the layout contract (SettingsPageShell + SettingsTabbedCard + SettingsSideSheet + ConfirmDialog), the BaseSettingsController interface, and the shared component library all work correctly and consistently across Brand, Services, and Team (not audited but confirmed in file listing).

However, two blockers prevent signing off:

**Blocker 1 - Data ownership conflict**: `useProdukPaketController` and `useServicesController` both own addon and bundle state independently with duplicate mock data. `ProdukPaketPageClient` also instantiates a fresh `useServicesController()` for service data, creating a third ephemeral state. When real API integration begins, this will produce data divergence bugs. Addons and bundles belong to one owner. Either `ServicesController` owns all services-related entities and `useProdukPaketController` is deleted, or `ProdukPaketController` takes sole ownership of addons+bundles and `useServicesController` removes them.

**Blocker 2 - Hardcoded hex in rendered style**: `ServicesAccordion.tsx` renders `style={{ background: cat.blobColor }}` with raw hex values from data (e.g. `#f5c4ab`) and fallback `#E5E5EA`, plus `color="#1C1C1E"` on icons. This violates the no-inline-style and no-magic-hex rules that the design system enforces.

Everything else is medium/low priority cleanup that does not block further domain development.
