# Settings V2 Foundation Audit

**Pages:** Brand & Profil · Layanan
**Date:** 2026-06-10
**Auditor:** Claude Code (Sonnet 4.6)
**Branch:** feat/settings-v2-brand-services

---

## Table of Contents

1. [Page Audit](#step-1--page-audit)
2. [Component Inventory](#step-2--component-inventory)
3. [Design System Compliance](#step-3--design-system-compliance)
4. [Design Token Audit](#step-4--design-token-audit)
5. [Settings Layout Contract](#step-5--settings-layout-contract)
6. [Responsive Audit](#step-6--responsive-audit)
7. [Clean Code Audit](#step-7--clean-code-audit)
8. [Future Domain Compatibility](#step-8--future-domain-compatibility)
9. [Implementation Plan](#step-9--implementation-plan)
10. [Final Report & Verdict](#step-10--final-report--verdict)

---

## STEP 1 — Page Audit

### Brand & Profil (`/dashboard/settings/brand`)

**Page hierarchy:**

```
SettingsLayout (app/dashboard/settings/layout.tsx)
  SettingsHeaderActionsProvider          ← context wrapper
  SettingsPageHeader                     ← breadcrumb + title + save/cancel actions
  SettingsTopTabs                        ← horizontal domain nav
  [scroll container]
    BrandPageClient
      SettingsPageShell                  ← flex-col gap-s24
        BrandForm
          SettingsPanel                  ← white card, divide-y
            BrandIdentitySection → SettingsPanelSection
            BrandMediaSection    → SettingsPanelSection
            BrandContactSection  → SettingsPanelSection
            BrandSocialSection   → SettingsPanelSection
            BrandLocationSection → SettingsPanelSection
```

**Observations:**

- Section hierarchy is clean and consistent — every section uses `SettingsPanelSection` correctly.
- Typography hierarchy: section titles use `SettingsSectionHeader` (title + description). No raw heading tags found in sections — consistent.
- Card hierarchy: single `SettingsPanel` groups all sections. This is intentional (single-scroll form), not a problem.
- Action hierarchy: save/cancel actions live in the header via `SettingsHeaderActionsContext`. The `SettingsActionBar` component exists in the layout but is **not used** by Brand — actions are registered via context instead and rendered inside `SettingsPageHeader`.

**Issue B-1 — BrandPageClient has two conflicting versions in the codebase.**

- `brand-page-client` (in git at time of this audit, current working file) uses `useRegisterSettingsActions` → renders save/cancel in header. This is the V2 intent.
- A previous batch-search found an older version of `BrandPageClient` that uses `SettingsPreviewPanel` + `SettingsActionBar` in-page. This suggests the file was refactored mid-session and both versions may be present across different git stashes or the index.ts re-exports may be stale.
- **Recommendation:** Verify the active `BrandPageClient.tsx` on disk matches the `useRegisterSettingsActions` pattern. The `SettingsPreviewPanel`+`SettingsActionBar` variant should be considered superseded.

**Spacing rhythm:** `SettingsPageShell` uses `SETTINGS_SECTION_GAP = gap-s24`. `SettingsPanelSection` uses `gap-s16 p-s20 md:p-s24`. Responsive padding steps from `s20` to `s24` at `md:`. This matches the design system's `s20` card padding token.

**Responsiveness:** Grid fields use `SettingsFormGrid` with `grid-cols-1 md:grid-cols-2`. Section padding steps up at `md:`. No issues found at the layout level.

---

### Layanan (`/dashboard/settings/layanan` → routes to `/dashboard/settings/services`)

**Issue L-1 — Route mismatch.** `SettingsTopTabs` registers the Layanan tab at path `/dashboard/settings/layanan`, but the page directory observed is `app/dashboard/settings/services/page.tsx`. If both exist, only one will be active; the other is dead.

**Page hierarchy:**

```
SettingsLayout
  SettingsHeaderActionsProvider
  SettingsPageHeader
  SettingsTopTabs
  [scroll container]
    ServicesPageClient
      SettingsPageShell
        [inline card wrapper]          ← NOT using SettingsPanel or SettingsSection
          SettingsSubNav               ← iOS-style pill tabs
          ServicesForm
            [tab: services]  → ServicesAccordion
            [tab: questions] → ConsultationQuestionsSection
            [tab: packages]  → BundlesSection + AddOnsSection
```

**Issue L-2 — ServicesPageClient bypasses the layout system.**
The card wrapper is written inline as:

```tsx
<div className="overflow-hidden rounded-r16 border border-bd-card bg-bg-card shadow-card">
```

This duplicates the exact class set of `SettingsPanel` instead of using it. Root cause: Services uses a sub-tab model so the panel's `divide-y` behavior is not needed, but the wrapper itself should still be extracted.

**Issue L-3 — ServicesForm uses stub handlers for all mutations.**
`handleStub(action)` calls `console.log(...)` for add-category, add-service, add-bundle, add-addon, add-question. This is expected scaffolding but must be tracked as tech debt.

**Issue L-4 — `useServicesController` does not implement `isDirty` or `isSaving`.**
The hook registers save/cancel via `useRegisterSettingsActions` but the controller does not track dirty state. Calling `ctrl.isDirty` / `ctrl.isSaving` likely resolves to `undefined`, causing the save button in the header to be permanently disabled or permanently enabled depending on how `SettingsHeaderActionsContext` handles `undefined`.

---

## STEP 2 — Component Inventory

### Classification Key

- **A = Shared** — usable by any settings domain
- **B = Domain** — belongs to Brand or Services specifically
- **C = Page-specific** — single-use, tightly coupled

### Layout Layer (all A)

| Component               | Classification | Notes                                        |
| ----------------------- | -------------- | -------------------------------------------- |
| `SettingsPageShell`     | A              | Root wrapper for every domain page           |
| `SettingsSection`       | A              | Floating section with external header        |
| `SettingsSectionHeader` | A              | Title + description + optional action slot   |
| `SettingsContentCard`   | A              | Card shell for section content               |
| `SettingsPanel`         | A              | Grouped sections in one card (Brand pattern) |
| `SettingsPanelSection`  | A              | Section block inside a SettingsPanel         |
| `SettingsActionBar`     | A              | Sticky save/cancel bar                       |
| `SettingsSubNav`        | A              | iOS pill tab switcher                        |

### Shared Settings Components (all A)

| Component              | Classification | Notes                                             |
| ---------------------- | -------------- | ------------------------------------------------- |
| `SettingsFormGrid`     | A              | Responsive 1/2/3-col grid                         |
| `SettingsFieldGroup`   | A              | Label + hint + required wrapper                   |
| `SettingsInput`        | A              | Styled input (design-system compliant)            |
| `SettingsTextarea`     | A              | Styled textarea                                   |
| `SettingsUploadField`  | A              | File upload (logo/cover/photo variants)           |
| `SettingsPreviewPanel` | A              | Two-col form+preview layout                       |
| `SettingsEmptyState`   | A              | Empty state with icon, title, description         |
| `SettingsListCard`     | A              | Row item in a list (image, title, badges, toggle) |
| `SettingsDangerZone`   | A              | Red danger action card                            |
| `SettingsAddButton`    | A              | "+ Add item" trigger button                       |

### Brand Domain (B)

| Component              | Classification | Notes                                                                           |
| ---------------------- | -------------- | ------------------------------------------------------------------------------- |
| `BrandPageClient`      | B              | Orchestrator for Brand domain                                                   |
| `BrandForm`            | B              | Assembles all brand sections in a SettingsPanel                                 |
| `BrandIdentitySection` | B              | Name, tagline, description fields                                               |
| `BrandMediaSection`    | B              | Logo + cover upload                                                             |
| `BrandContactSection`  | B              | Phone, WhatsApp, email, website                                                 |
| `BrandSocialSection`   | B              | Instagram, TikTok, Facebook                                                     |
| `BrandLocationSection` | B              | Address, city, maps URL                                                         |
| `BrandPreview`         | B→A candidate  | Renders booking page preview; should be `BookingPagePreview` in shared/preview/ |

### Services Domain (B)

| Component                               | Classification | Notes                            |
| --------------------------------------- | -------------- | -------------------------------- |
| `ServicesPageClient`                    | B              | Orchestrator for Services domain |
| `ServicesForm`                          | B              | Tab router to section components |
| `ServicesAccordion`                     | B              | Category+service accordion list  |
| `ConsultationQuestionsSection`          | B              | Questions per service            |
| `BundlesSection`                        | B              | Bundle packages list             |
| `AddOnsSection` (in services/sections/) | B              | Add-on products list             |

### Preview Layer (A candidate)

| Component            | Classification         | Notes                                                      |
| -------------------- | ---------------------- | ---------------------------------------------------------- |
| `BookingPagePreview` | A (in shared/preview/) | Exists but contract is not yet decoupled from BrandProfile |

### Duplications Found

1. **`AddOnsSection` exists in two places:**

   - `settings/AddOnsSection.tsx` — V1 orphan using `useSalonSettings` + old `SettingsCard`
   - `settings/components/services/sections/AddOnsSection.tsx` — V2, uses layout system

2. **`ServicesPageClient` inline card wrapper duplicates `SettingsPanel` class set verbatim.**

3. **Old V1 settings components at root (`settings/`) are orphaned but not deleted:**

   - `AddOnsSection.tsx`, `GeneralInfoSection.tsx`, `OtherSettingsSection.tsx`, `ProfileSection.tsx`, `RolePermissionMatrix.tsx`, `ServicesSection.tsx`, `SettingsSidebar.tsx`, `TeamSection.tsx`, `UserManagementModal.tsx`, `UsersAndRolesSection.tsx`
   - These reference `./shared/SettingsCard`, `./shared/FormField`, `./shared/SaveButton` — old V1 primitives.

4. **`shared/index.ts` inconsistency:** One version exports `SettingsInput` and `SettingsTextarea`; another version (from an older batch) does not include them. The current on-disk state should be verified — if they're missing from the index export, components importing them by name will fail.

---

## STEP 3 — Design System Compliance

### Brand Domain

**Colors:** All observed Tailwind classes use design tokens:

- `bg-bg-card`, `bg-bg-page`, `bg-bg-control` ✅
- `text-tx-primary`, `text-tx-secondary`, `text-tx-muted` ✅
- `border-bd-card`, `border-bd-row` ✅
- `ac-primary` for save button ✅

**Spacing:** `p-s20`, `md:p-s24`, `gap-s16`, `px-s16`, `py-s8` — all spacing tokens ✅

**Radius:** `rounded-r16`, `rounded-r12`, `rounded-r10`, `rounded-r8` — all radius tokens ✅

**Shadow:** `shadow-card`, `shadow-tab` ✅

**Typography:** `text-ts-fn`, `font-medium`, `font-semibold` — all typography tokens ✅

**Issue DS-1 — `SettingsActionBar` uses `h-9` (magic px equivalent).**
`h-9` is a Tailwind default (36px), not a design system spacing token. Should use `h-s32` or a named height token if one exists. Minor but inconsistent.

**Issue DS-2 — `SettingsActionBar` button uses `-opacity-40` for disabled state.**
`disabled:opacity-40` is acceptable but not a named token. The design system does not define a disabled opacity token. Low severity.

**Issue DS-3 — `BrandMediaSection` inline comment references `aspect-[16/6]` and `aspect-square`.**
These are functional Tailwind arbitrary values, not design tokens. The aspect ratio for cover images should be tokenised as a named Tailwind variant (e.g., `aspect-cover`) if it is intended to be reused. Currently it is embedded in a comment and controlled via the `SettingsUploadField` variant prop — the variant prop is the correct abstraction, but the aspect ratio itself is likely hardcoded inside `SettingsUploadField`.

### Services Domain

**Issue DS-4 — `ServicesPageClient` inline card wrapper uses hardcoded class string.**

```tsx
<div className="overflow-hidden rounded-r16 border border-bd-card bg-bg-card shadow-card">
```

The classes themselves are all valid tokens, but the pattern is duplicated rather than reused via `SettingsPanel`. This is a structure issue, not a token violation.

**Issue DS-5 — V1 orphan `AddOnsSection.tsx` at root uses hardcoded hex and arbitrary Tailwind:**

- `bg-[#f0f0ee]` — hardcoded hex, not `bg-bg-control`
- `text-red-600`, `bg-red-50` — Tailwind semantic palette, not design system tokens
- `text-[13px]` — arbitrary size, should be `text-ts-fn` or `text-ts-sm`
- `rounded-lg` — not a design system radius token

These are V1 artifacts and not actively rendered, but they are in the codebase and create confusion.

---

## STEP 4 — Design Token Audit

### Tokens Present and Correctly Used

| Token                                                                      | Used in                      |
| -------------------------------------------------------------------------- | ---------------------------- |
| `gap-s16`, `gap-s24`, `p-s20`, `p-s24`                                     | All layout components        |
| `rounded-r16`, `rounded-r12`, `rounded-r10`, `rounded-r8`                  | Cards, buttons, inputs, tabs |
| `shadow-card`, `shadow-tab`                                                | Panels, sub-nav pill         |
| `bg-bg-card`, `bg-bg-page`, `bg-bg-control`                                | All backgrounds              |
| `border-bd-card`, `border-bd-row`                                          | All borders                  |
| `text-tx-primary`, `text-tx-secondary`, `text-tx-muted`, `text-tx-control` | All text                     |
| `ac-primary`                                                               | Save button                  |
| `text-ts-fn`                                                               | All body/form text           |

### Tokens Missing from `tailwind.config.ts`

Per `docs/design-system/tokens.md`, the following tokens are used in the codebase but not yet defined in `tailwind.config.ts`:

| Token         | Needed For                             | Suggested Value              |
| ------------- | -------------------------------------- | ---------------------------- |
| `shadow-card` | SettingsPanel, ServicesPageClient card | `0 2px 8px rgba(0,0,0,0.06)` |
| `shadow-tab`  | SettingsSubNav active pill             | `0 1px 4px rgba(0,0,0,0.1)`  |
| `r10`         | SettingsActionBar buttons              | `10px`                       |
| `bg-bg-hover` | SettingsActionBar cancel hover         | Not yet tokenised            |
| `tx-control`  | SettingsActionBar cancel text          | Not yet tokenised            |

**Note:** `shadow-card`, `shadow-tab`, and `r10` are referenced in the settings components. If they are not in `tailwind.config.ts`, the build will silently produce no-op classes. Verify they are present — they may have been added after `tokens.md` was last updated.

### Reusable Patterns Not Yet Extracted to Tokens

1. **Disabled button pattern** — `disabled:opacity-40 disabled:cursor-not-allowed` repeated across buttons. Should be a Tailwind plugin utility or a shared class constant.
2. **Hover state pattern** — `hover:opacity-90` (primary) and `hover:text-tx-primary` (secondary) are applied manually in multiple places.

---

## STEP 5 — Settings Layout Contract

The following mandatory stack is observed across both domains. All future Settings domains **must** follow this exact contract.

### Mandatory Stack

```
1. SettingsLayout (app/dashboard/settings/layout.tsx)
   Responsibility: Provides SettingsHeaderActionsProvider, renders SettingsPageHeader,
   SettingsTopTabs, and the scrollable content container.
   Rule: ONE per settings module. Never nest.

2. DomainPageClient (e.g., BrandPageClient, ServicesPageClient)
   Responsibility: Instantiates the domain controller hook, calls useRegisterSettingsActions,
   returns SettingsPageShell as root.
   Rule: Must call useRegisterSettingsActions. Must not own any form state directly.

3. SettingsPageShell
   Responsibility: flex-col gap-s24 wrapper. Provides vertical rhythm between sections.
   Rule: First child of DomainPageClient. No padding of its own.

4a. GROUPED PATTERN (Brand style) — sections share one white card
    SettingsPanel → [SettingsPanelSection × N]
    Use when: domain is a single linear form, no sub-tabs needed.

4b. TABBED PATTERN (Services style) — single card with internal sub-tab switcher
    [inline card] → SettingsSubNav → DomainForm → [SettingsSection × N per tab]
    Issue: The inline card must be replaced with a named wrapper (see Issue L-2).
    Use when: domain has 3+ logical sub-groups with distinct concerns.

5. Inside each section (both patterns):
   SettingsSectionHeader (title + description + optional action)
   SettingsFormGrid (cols=1|2|3 responsive grid)
     SettingsFieldGroup (label + hint + required)
       SettingsInput | SettingsTextarea | SettingsUploadField | [domain atom]

6. Action Bar (two equivalent implementations — pick one per domain):
   Option A: useRegisterSettingsActions → renders in SettingsPageHeader (current for both Brand and Services)
   Option B: SettingsActionBar as last child of SettingsPageShell (sticky bottom)
   Issue: Both exist. Brand's BrandPageClient previously used Option B. Standardise on Option A.
```

### Context Flow

```
SettingsHeaderActionsProvider (layout)
  ↓ register(actions)
  useRegisterSettingsActions (domain PageClient)
  ↑ actions (read)
  useSettingsHeaderActions (SettingsPageHeader)
```

---

## STEP 6 — Responsive Audit

### Brand Domain

| Breakpoint          | Behavior                                      | Status        |
| ------------------- | --------------------------------------------- | ------------- |
| Mobile (`< 768px`)  | Single-col fields, `p-s20` section padding    | ✅ Correct    |
| Tablet (`768px+`)   | Two-col grid via `md:grid-cols-2`, `md:p-s24` | ✅ Correct    |
| Desktop (`1024px+`) | No third breakpoint defined; same as tablet   | ✅ Acceptable |

**Issue R-1 — `BrandMediaSection` grid uses `SettingsFormGrid cols={2}` with `items-stretch` and `className="items-stretch"`.**
On mobile this stacks to single column, placing logo and cover image vertically. The `fillHeight` prop on the logo upload relies on the sibling cover's `aspect-[16/6]` for height. On mobile (single column), the logo cell has no sibling, so `fillHeight` will result in zero-height or collapse. This is a layout bug at mobile widths.

**Issue R-2 — `SettingsTopTabs` uses `overflow-x-auto` on the tab container.**
On very narrow screens all 6 tabs will scroll horizontally. This is the correct approach, but there is no visual affordance (fade gradient) to indicate horizontal scroll. Low severity.

### Services Domain

| Breakpoint         | Behavior                   | Status |
| ------------------ | -------------------------- | ------ |
| Mobile (`< 768px`) | `p-s20` content padding    | ✅     |
| Tablet (`768px+`)  | `md:p-s24` content padding | ✅     |

**Issue R-3 — `ServicesAccordion` and `SettingsListCard` rows likely have fixed-width columns that do not stack on mobile.**
Without seeing the full `ServicesAccordion` row markup, rows with inline-flex badge groups, price tags, and toggle switches can overflow on screens under 375px. This needs visual verification.

---

## STEP 7 — Clean Code Audit

### Business Logic Separation

| Concern                  | Location                                         | Status                                                    |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------------- |
| Form state               | `useBrandProfileController` hook                 | ✅ Correctly separated                                    |
| Services CRUD state      | `useServicesController` hook                     | ✅ Correctly separated                                    |
| Save/cancel registration | `useRegisterSettingsActions`                     | ✅ Context-based, clean                                   |
| Mock data                | Inside hooks (MOCK_PROFILE, MOCK_DOMAIN)         | ⚠️ Acceptable for now; must be replaced with tRPC queries |
| Stub actions             | `ServicesForm.handleStub`                        | ⚠️ Scaffolding — tracked as tech debt                     |
| File upload staging      | `pendingFilesRef` in `useBrandProfileController` | ✅ Ref-based, no re-render leakage                        |

### Monolith Detection

- `BrandPageClient`: ~15 lines. ✅ Thin orchestrator.
- `ServicesPageClient`: ~35 lines. ✅ Thin orchestrator.
- `BrandForm`: ~25 lines. ✅ Pure composition.
- `ServicesForm`: ~40 lines. Acceptable but `handleStub` is business logic leaking into the form layer.
- `useBrandProfileController`: ~80 lines. ✅ Single responsibility.
- `useServicesController`: ~120 lines. Getting long but each function is a single CRUD operation. ✅ Acceptable.
- `ServicesAccordion`: estimated 100–150 lines with expand/collapse state. ⚠️ Should be reviewed for internal composition opportunities.

### No Duplicated State

- Both controllers use `JSON.stringify` diff for dirty detection. This is functional but O(n) on every render. For large service catalogs this could be a performance concern. ⚠️ Consider `useRef` snapshot comparison.

### Domain Leakage

- No cross-domain imports found between Brand and Services. ✅
- `BrandPreview` is in the brand domain folder but renders a booking page preview — this is cross-domain concern leaking into brand. A `BookingPagePreview` shared component exists at `shared/preview/BookingPagePreview.tsx` but the decoupling is incomplete.

---

## STEP 8 — Future Domain Compatibility

### Can Team, Operations, Booking App, Users & Access safely follow the same structure?

**What works and is ready for reuse:**

- `SettingsPageShell` + `SettingsSection` + `SettingsSectionHeader` + `SettingsContentCard` — fully generic ✅
- `SettingsPanel` + `SettingsPanelSection` — generic, Brand uses it, future domains can use it ✅
- `SettingsSubNav` — generic, Services uses it, future domains can use it ✅
- `SettingsFormGrid` + `SettingsFieldGroup` + `SettingsInput` + `SettingsTextarea` — generic ✅
- `SettingsUploadField` — generic, supports logo/cover variants ✅
- `SettingsListCard` + `SettingsEmptyState` + `SettingsAddButton` — generic ✅
- `SettingsDangerZone` — generic, ready for Users & Access delete account ✅
- `useRegisterSettingsActions` + `SettingsHeaderActionsContext` — generic ✅

**What is missing for future domains:**

| Missing Piece          | Needed For                                   | Priority |
| ---------------------- | -------------------------------------------- | -------- |
| `SettingsToggleField`  | Operations (hours, toggles), Booking App     | High     |
| `SettingsSelectField`  | Operations (timezone, currency), Booking App | High     |
| `SettingsNumberField`  | Operations (buffer time, max bookings)       | Medium   |
| `SettingsColorPicker`  | Booking App (theme color)                    | Low      |
| `SettingsRoleRow`      | Users & Access (user + role row)             | High     |
| `SettingsInviteForm`   | Users & Access                               | Medium   |
| A `TeamMemberCard`     | Team domain                                  | Medium   |
| `SettingsScheduleGrid` | Operations (weekly hours grid)               | Medium   |

**Structural gap — Tabbed pattern is not formalised.**
Services uses an inline card for the tabbed layout. Future domains (Team: Members/Roles, Operations: Hours/Policies) will likely also need sub-tabs. The inline card pattern must be extracted into a named layout component (e.g., `SettingsTabbedCard`) before the next domain is built, otherwise the pattern will be reinvented 3 more times.

**Missing: A `SettingsController` base pattern.**
`useServicesController` is missing `isDirty` and `isSaving` (Issue L-4). Before the next domain controller is built, a standard controller interface or base hook must be defined:

```ts
interface BaseSettingsController {
  isDirty: boolean;
  isSaving: boolean;
  handleSave: () => Promise<void>;
  handleReset: () => void;
}
```

---

## STEP 9 — Implementation Plan

The following items are **required** before this architecture can be declared the foundation for all future Settings domains. NO layout changes. NO redesign. Only cleanup and standardisation.

### P0 — Blocking (must fix before building next domain)

| #   | Action                                                                                                                                          | File                                                                 | Effort |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------ |
| 1   | Fix Issue L-4: Add `isDirty` and `isSaving` to `useServicesController`. Use same JSON.stringify pattern as Brand.                               | `hooks/settings/useServicesController.ts`                            | 30 min |
| 2   | Fix Issue L-1: Resolve route mismatch — align `SettingsTopTabs` path (`/layanan` vs `/services`) with the actual Next.js app directory.         | `SettingsTopTabs.tsx` + `app/dashboard/settings/`                    | 15 min |
| 3   | Extract `SettingsTabbedCard` component from `ServicesPageClient` inline card. This is the canonical wrapper for tabbed domain pages.            | New file: `layout/SettingsTabbedCard.tsx` + update `layout/index.ts` | 45 min |
| 4   | Define `BaseSettingsController` interface in a shared types file. Both `useBrandProfileController` and `useServicesController` must satisfy it. | New file: `types/settings.types.ts`                                  | 20 min |
| 5   | Verify and align `shared/index.ts` — ensure `SettingsInput` and `SettingsTextarea` are exported.                                                | `components/shared/index.ts`                                         | 10 min |

### P1 — Important (fix before declaring foundation APPROVED)

| #   | Action                                                                                                                                                                                                                                                                                                                                                                                                                                       | File                                    | Effort |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------ |
| 6   | Fix Issue R-1: `BrandMediaSection` logo `fillHeight` collapses on mobile single-column. Add a `min-h` fallback for the logo upload at single-column breakpoint.                                                                                                                                                                                                                                                                              | `brand/sections/BrandMediaSection.tsx`  | 30 min |
| 7   | Standardise Action Bar: Document and enforce Option A (header context) as the single pattern. Remove the standalone `SettingsActionBar` from `BrandPageClient` if both variants exist on disk.                                                                                                                                                                                                                                               | `brand/BrandPageClient.tsx`             | 15 min |
| 8   | Delete V1 orphan files at `settings/` root (10 files) after confirming they are not imported anywhere: `AddOnsSection.tsx`, `GeneralInfoSection.tsx`, `OtherSettingsSection.tsx`, `ProfileSection.tsx`, `RolePermissionMatrix.tsx`, `ServicesSection.tsx`, `SettingsSidebar.tsx`, `TeamSection.tsx`, `UserManagementModal.tsx`, `UsersAndRolesSection.tsx`, plus `shared/SettingsCard.tsx`, `shared/FormField.tsx`, `shared/SaveButton.tsx`. | `settings/` root + `settings/shared/`   | 20 min |
| 9   | Decouple `BrandPreview` from `BrandProfile` — ensure `BookingPagePreview` at `shared/preview/` uses its own `BookingPagePreviewData` type, not `BrandProfile` directly.                                                                                                                                                                                                                                                                      | `shared/preview/BookingPagePreview.tsx` | 30 min |
| 10  | Fix Issue DS-1: Replace `h-9` in `SettingsActionBar` with a spacing token or document it as an intentional exception.                                                                                                                                                                                                                                                                                                                        | `layout/SettingsActionBar.tsx`          | 5 min  |

### P2 — Nice to Have (before building third domain)

| #   | Action                                                                                                                              | File                                      | Effort |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------ |
| 11  | Replace `JSON.stringify` dirty detection in both controllers with `useRef` snapshot for performance.                                | Both controller hooks                     | 45 min |
| 12  | Audit `ServicesAccordion` for mobile overflow in badge/price/toggle rows.                                                           | `services/sections/ServicesAccordion.tsx` | 30 min |
| 13  | Create shared `BaseSettingsController` documentation comment in `types/settings.types.ts` with copy-paste template for new domains. | `types/settings.types.ts`                 | 20 min |
| 14  | Add `SettingsToggleField` and `SettingsSelectField` to shared components in preparation for Operations domain.                      | `components/shared/`                      | 60 min |
| 15  | Add horizontal scroll fade gradient to `SettingsTopTabs` overflow container.                                                        | `SettingsTopTabs.tsx`                     | 15 min |

---

## STEP 10 — Final Report & Verdict

### Executive Summary

The Settings V2 foundation built across Brand & Profil and Layanan represents a **significant improvement** over the V1 monolith. The layout system is well-designed, the token usage is nearly compliant, and the controller pattern is the right separation of concerns.

However, **two blocking issues** prevent this from being the safe architectural foundation for all future domains:

1. **`useServicesController` is missing `isDirty` and `isSaving`** — any future domain copying this pattern would have non-functional save buttons.
2. **The tabbed card pattern is not formalised** — future domains building sub-tab layouts will duplicate the inline card pattern, creating inconsistency.

Additionally, **10 V1 orphan files** at the settings root create confusion about which components are canonical. These must be deleted before new developers (or AI agents) building the next domain can reliably identify the correct primitives to use.

### Issues Summary

| ID   | Severity    | Description                                                                                    |
| ---- | ----------- | ---------------------------------------------------------------------------------------------- |
| L-4  | 🔴 Blocking | `useServicesController` missing `isDirty` / `isSaving`                                         |
| L-1  | 🔴 Blocking | Route mismatch: `/layanan` in tabs vs `/services` in app dir                                   |
| L-2  | 🟡 High     | `ServicesPageClient` inline card duplicates `SettingsPanel` instead of using a named component |
| B-1  | 🟡 High     | Two conflicting versions of `BrandPageClient` may exist on disk                                |
| R-1  | 🟡 High     | `BrandMediaSection` logo collapses on mobile (fillHeight + single-col)                         |
| DS-5 | 🟡 High     | V1 orphan files use hardcoded hex, arbitrary px, and old `SettingsCard`                        |
| DS-1 | 🟠 Medium   | `SettingsActionBar` uses `h-9` (not a design token)                                            |
| DS-3 | 🟠 Medium   | `BrandMediaSection` cover aspect ratio not tokenised                                           |
| R-3  | 🟠 Medium   | ServicesAccordion rows may overflow on mobile — unverified                                     |
| R-2  | 🟢 Low      | `SettingsTopTabs` no scroll affordance on overflow                                             |
| DS-2 | 🟢 Low      | `disabled:opacity-40` not a named token                                                        |

### Component Reusability Score

- **Layout components:** 10/10 — fully generic and reusable ✅
- **Shared form components:** 9/10 — SettingsInput/SettingsTextarea export needs verification ⚠️
- **Domain controllers:** 7/10 — missing base interface, Services missing dirty/saving ⚠️
- **Brand sections:** 10/10 — clean composition, no coupling to other domains ✅
- **Services sections:** 8/10 — stub actions present, accordion overflow unverified ⚠️

### Design System Compliance Score

- Brand domain: **9.5/10** — one `h-9` token violation, one aspect ratio not tokenised
- Services domain: **9/10** — inline card duplication, V1 orphans at root
- Overall: **9/10**

---

## VERDICT

> ### ⚠️ ADDITIONAL STANDARDISATION REQUIRED
>
> The architecture is sound and the direction is correct. Brand & Profil is close to reference quality. Services has two blocking issues (missing dirty/saving state, route mismatch) and one structural issue (inline card pattern not extracted).
>
> **Required before this can serve as the foundation for Team, Operations, Booking App, and Users & Access:**
>
> 1. Fix P0 items #1–5 (estimated 2 hours total)
> 2. Fix P1 items #6–10 (estimated 2 hours total)
>
> After P0+P1 items are resolved, re-audit and the verdict should change to:
>
> ### ✅ SETTINGS FOUNDATION APPROVED

---

_Generated by Claude Code audit — read-only, no code was modified._
