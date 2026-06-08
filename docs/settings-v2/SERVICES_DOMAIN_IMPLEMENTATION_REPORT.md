# Services Domain Implementation Report

> Phase 5.5 | Date: 2026-06-08
> Status: READY FOR TEAM DOMAIN

---

## 1. Component Tree

```
app/dashboard/settings/layanan/page.tsx       (Server, 5 lines)
  └── ServicesPageClient.tsx                  ('use client', 15 lines)
        ├── useServicesController()
        └── ServicesForm.tsx                  (orchestrator, 52 lines)
              ├── CategoriesSection.tsx        (72 lines)
              ├── ServicesListSection.tsx      (90 lines)
              ├── ConsultationQuestionsSection.tsx (86 lines)
              ├── AddOnsSection.tsx            (77 lines)
              └── BundlesSection.tsx           (86 lines)
```

All sections consume only:

- `SettingsListCard`, `SettingsEmptyState` from `settings/components/shared/`
- `SettingsSection`, `SettingsSectionHeader`, `SettingsContentCard` from `settings/layout`
- Phosphor icons only

---

## 2. Domain Ownership

| Entity          | Owner           | Customer App Field                                                         |
| --------------- | --------------- | -------------------------------------------------------------------------- |
| ServiceCategory | Services Domain | `ALL_CATEGORIES[].name`, `.color`, `.blobColor`, `.icon`                   |
| ServiceItem     | Services Domain | `ALL_SERVICES[].name`, `.price`, `.priceType`, `.duration`, `.serviceFlow` |
| ServiceQuestion | Services Domain | `ALL_SERVICES[].questions[].label`, `.type`, `.options`                    |
| AddOnProduct    | Services Domain | `PRODUCTS[]` (full)                                                        |
| ServiceBundle   | Services Domain | Not yet in customer app — future                                           |

Customer app currently reads mock data from `use-mock-data.ts`. Once Services Domain is wired to DB, customer app reads from the same source.

---

## 3. Data Contracts

### Type File: `services.types.ts` (102 lines)

```
ServicePriceType   'fixed' | 'starting_from'
ServiceFlow        'STYLING_HAIR' | 'STYLING_COLOUR' | 'TREATMENT'
QuestionType       'chips' | 'photo' | 'text'
ServiceCategory    id, name, description, color, blobColor, icon, isActive, sortOrder
ServiceQuestion    id, serviceId, label, type, required, options[], sortOrder
ServiceItem        id, categoryId, name, description, price, duration,
                   priceType, serviceFlow, requiresSpecialist, isActive, sortOrder, questions[]
AddOnProduct       id, name, description, price, imageEmoji, imageUrl, isActive, sortOrder
ServiceBundle      id, name, description, serviceIds[], bundlePrice, isActive
ServicesDomain     { categories, services, addons, bundles }
```

### Controller: `useServicesController.ts` (154 lines)

```
ServicesController interface:
  domain: ServicesDomain

  // Categories
  addCategory(data)         → void
  updateCategory(id, patch) → void
  removeCategory(id)        → void

  // Services
  addService(data)          → void
  updateService(id, patch)  → void
  archiveService(id)        → void  (sets isActive=false, not delete)

  // Add-ons
  addAddon(data)            → void
  updateAddon(id, patch)    → void
  removeAddon(id)           → void

  // Bundles
  addBundle(data)           → void
  updateBundle(id, patch)   → void
  removeBundle(id)          → void
```

Pattern: list domain, no global isDirty, no SettingsActionBar. Each entity has its own save lifecycle (stubs now, dialogs later).

---

## 4. Customer App Compatibility

Mock data in `useServicesController.ts` mirrors the customer app's `ALL_CATEGORIES` and a representative subset of `ALL_SERVICES`. The type contracts are compatible:

| `services.types.ts`                  | Customer app equivalent                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| `ServiceFlow`                        | Used directly in booking routing (STYLING_HAIR → colour-flow, TREATMENT → standard) |
| `ServicePriceType = 'starting_from'` | Renders "Mulai dari Rp X" in customer booking page                                  |
| `requiresSpecialist`                 | Controls "Pilih Stylist" step in booking flow                                       |
| `QuestionType = 'chips'`             | Renders chip-select UI in consultation step                                         |
| `QuestionType = 'photo'`             | Renders photo-upload UI in consultation step                                        |

No customer app files were touched (scope rule enforced).

---

## 5. Design System Compliance

### Tokens used

| Category   | Tokens                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------- |
| Background | `bg-bg-input`, `bg-bg-hover`, `bg-bg-control`                                                |
| Text       | `text-tx-primary`, `text-tx-secondary`, `text-tx-subtle`, `text-tx-muted`, `text-tx-control` |
| Border     | `border-bd-card`, `border-bd-row`                                                            |
| Action     | `bg-ac-primary`, `text-ac-danger`                                                            |
| Spacing    | `gap-s32`, `gap-s24`, `gap-s16`, `gap-s12`, `px-s12`, `py-s8`, `px-s8`, `py-s4`              |
| Radius     | `rounded-r10`, `rounded-r8`                                                                  |
| Typography | `text-ts-cap2`, `text-ts-cap1`, `text-ts-fn`, `text-ts-sub`                                  |

### Forbidden tokens check

- `accent` — NOT used
- `label`, `label2`, `label3` — NOT used
- `sep`, `surface`, `bg` (old) — NOT used
- `text-t12`, `text-t14` — NOT used
- Inline `style={{}}` — NOT used
- Hardcoded hex colors — NOT used

Compliance: PASS

---

## 6. File Size Report

| File                               | Lines   | Budget | Status |
| ---------------------------------- | ------- | ------ | ------ |
| `services.types.ts`                | 102     | <150   | OK     |
| `useServicesController.ts`         | 154     | <200   | OK     |
| `ServicesPageClient.tsx`           | 15      | <30    | OK     |
| `ServicesForm.tsx`                 | 52      | <60    | OK     |
| `CategoriesSection.tsx`            | 72      | <100   | OK     |
| `ServicesListSection.tsx`          | 90      | <100   | OK     |
| `ConsultationQuestionsSection.tsx` | 86      | <100   | OK     |
| `AddOnsSection.tsx`                | 77      | <100   | OK     |
| `BundlesSection.tsx`               | 86      | <100   | OK     |
| **Total**                          | **734** |        | OK     |

No file exceeds its budget.

---

## 7. Future Dependency Audit

### Who will depend on Services Domain

| Future System          | Dependency                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Booking Engine         | `ServiceItem.serviceFlow` routes hair-colour vs treatment booking paths                 |
| Staff/Team Domain      | `ServiceItem.requiresSpecialist` determines which services appear in stylist assignment |
| Booking App (customer) | `ServiceItem`, `ServiceCategory`, `AddOnProduct` render the catalog                     |
| Availability Engine    | `ServiceItem.duration` determines slot blocking                                         |
| Reporting              | `ServiceItem.price`, `ServiceCategory` for revenue breakdown                            |
| Bundling Payments      | `ServiceBundle.bundlePrice` vs sum of individual prices                                 |

### What Services Domain depends on

- Nothing in Settings V2 (no imports from Brand, Operasional, etc.)
- Shared UI primitives only (`SettingsListCard`, `SettingsEmptyState`, etc.)
- No circular dependencies

### Stub actions status

All "Tambah" and "Edit" buttons call `handleStub(action)` which logs to console. These must be replaced with proper dialogs or sub-routes before production. Required before booking engine integration:

- `add-category` → CategoryDialog (create/edit)
- `add-service` → ServiceDialog (create/edit, includes question management)
- `add-addon` → AddonDialog (create/edit, includes image upload)
- `add-bundle` → BundleDialog (create/edit, service multi-select)
- `add-question:{serviceId}` → QuestionDialog or inline form within ServiceDialog

---

## 8. Readiness Score

| Dimension           | Score | Notes                                                                        |
| ------------------- | ----- | ---------------------------------------------------------------------------- |
| Architecture        | 5/5   | Follows Brand reference pattern. Clean controller/form/section split.        |
| Type safety         | 5/5   | No `any`. All props typed. Controller interface exported.                    |
| Design system       | 5/5   | Zero violations found.                                                       |
| File budget         | 5/5   | All files within limits.                                                     |
| Customer app compat | 4/5   | Types compatible. Wiring to DB not yet done.                                 |
| CRUD completeness   | 2/5   | All read/toggle/archive work. Create/edit are stubs.                         |
| DB contract         | 3/5   | Contract documented. Migrations not yet applied. Several tables UNCONFIRMED. |

**Overall: 29/35 (83%) — READY FOR TEAM DOMAIN**

---

## Final Verdict

**READY FOR TEAM DOMAIN (Phase 5.6)**

Blockers before production (not blockers for next phase):

1. Replace stub actions with proper dialogs (CategoryDialog, ServiceDialog, AddonDialog, BundleDialog)
2. Confirm/apply migrations in `services-database-contract.md`
3. Wire `useServicesController` to tRPC/Supabase calls (remove mock data)
