# Settings V2 Layout Consolidation Report

> Phase 5.X | Date: 2026-06-08
> Scope: Brand & Profil + Layanan — unify into one layout contract
> Customer booking flow untouched.

---

## 1. Layout Problems Found

### Problem A — Two different section spacing rhythms

| Domain   | Section gap source                                             | Value     |
| -------- | -------------------------------------------------------------- | --------- |
| Brand    | `BrandForm` inner `<div className="flex flex-col gap-s24">`    | `gap-s24` |
| Services | `ServicesForm` inner `<div className="flex flex-col gap-s32">` | `gap-s32` |

Both forms hardcoded their own gap inside a wrapper div, **bypassing** `SettingsPageShell`'s `SETTINGS_SECTION_GAP` (`gap-s32`). The shell only saw a single child (the wrapper), so its rhythm never applied. Two domains, two different vertical rhythms.

**Root cause**: Section rhythm was owned by each domain's form wrapper, not by the shared shell. The contract had a spacing layer (`SettingsPageShell`) but nothing was using it for section spacing.

---

### Problem B — Brand embeds a customer booking preview

`BrandPageClient` rendered `SettingsPreviewPanel` with a `BookingPagePreview` in a sticky 380px right column. Consequences:

- The Brand form was crammed into the left ~60% of the viewport, forcing single-column fields and tall vertical scroll.
- A customer-app concern (the booking page preview) leaked into a configuration domain.
- Brand had a layout no other domain shared (form+preview two-column), so it could never "feel like the same product" as Services.

**Root cause**: Preview ownership was misassigned. The booking page preview belongs to the Booking App domain, not to Brand configuration.

---

### Problem C — Services invented a section-header-with-action pattern 4x

Each list section (Categories, Services, Bundles, Add-ons) wrapped its header in a bespoke `<div className="flex items-center justify-between">` with a hand-styled `+ Add` button (`bg-ac-primary px-s12 py-s8 ...`) duplicated verbatim four times. The Consultation section even had an empty `justify-between` wrapper with no action.

**Root cause**: `SettingsSectionHeader` had no action slot, so every section reinvented the header-action row inline.

---

### Problem D — Brand wasted horizontal space

With the preview occupying the right column, `BrandIdentitySection` and `BrandMediaSection` used `SettingsFormGrid cols={1}`, stacking everything vertically in a narrow column. Excess scrolling, low information density on desktop.

**Root cause**: Single-column grids chosen to fit the cramped preview layout, not the natural full-width page.

---

## 2. New Settings Layout Contract

Every Settings sub-page MUST follow this exact stack. No page may invent its own layout, hierarchy, spacing, or preview behavior.

```
SettingsPageHeader      ← owned by layout.tsx        (breadcrumb + page title, once)
  ↓
SettingsTopTabs         ← owned by layout.tsx        (domain navigation, permission-aware)
  ↓
SettingsPageShell       ← owned by page client       (max-w-1200, mx-auto, gap-s32 section rhythm)
  ↓
SettingsSection         ← one per logical group      (gap-s16 between header and cards)
  ↓
SettingsSectionHeader   ← title + description + action slot
  ↓
SettingsContentCard     ← contained block            (rounded-r16, border bd-card, shadow-card)
  ↓
SettingsActionBar       ← single-record domains only  (sticky, bottom)
```

### Ownership of each layer

| Layer                   | Owner                     | Responsibility                         | May NOT                                    |
| ----------------------- | ------------------------- | -------------------------------------- | ------------------------------------------ |
| `SettingsPageHeader`    | `layout.tsx`              | Breadcrumb + "Pengaturan" title        | Be re-rendered by a domain page            |
| `SettingsTopTabs`       | `layout.tsx`              | Tab nav + permission filtering         | Be re-styled per domain                    |
| `SettingsPageShell`     | Domain page client        | Max-width + **section spacing rhythm** | Be skipped or wrapped in another container |
| `SettingsSection`       | Domain section component  | Group a header + its cards             | Hardcode a vertical gap to siblings        |
| `SettingsSectionHeader` | Domain section component  | Title, description, optional `action`  | Wrap itself in a custom flex row           |
| `SettingsContentCard`   | Domain section component  | Card surface + padding variant         | Invent its own border/shadow               |
| `SettingsActionBar`     | Single-record page client | Save/cancel, sticky                    | Appear in list domains                     |

### The one rule that fixes spacing

> Domain forms (`BrandForm`, `ServicesForm`) return a **Fragment**, never a wrapper div.
> Sections become direct children of `SettingsPageShell`, which owns the single `gap-s32` rhythm for the whole product.

### New contract primitives added

- `SettingsSectionHeader` gained an optional `action?: ReactNode` slot (space-between row when present).
- `SettingsAddButton` — the one standard primary section action. Replaces 4 duplicated inline buttons.

---

## 3. Brand Domain Refactor Summary

| Change                  | Before                                                       | After                                   |
| ----------------------- | ------------------------------------------------------------ | --------------------------------------- |
| Preview                 | `SettingsPreviewPanel` + `BookingPagePreview` (sticky 380px) | Removed. Brand is pure configuration.   |
| `BrandPreview.tsx` shim | Orphan re-export                                             | Deleted                                 |
| `BrandForm` wrapper     | `<div className="flex flex-col gap-s24">`                    | Fragment (shell owns `gap-s32`)         |
| Identity grid           | `cols={1}`                                                   | `cols={2}`, description `fullWidth`     |
| Media grid              | `cols={1}`                                                   | `cols={2}` (logo + cover side by side)  |
| Section rhythm          | `gap-s24` (local)                                            | `gap-s32` (shell, shared with Services) |
| `BrandPageClient`       | 43 lines, builds preview data                                | 28 lines, form + action bar only        |

Allowed sections, unchanged in content: Brand Identity, Brand Assets (Logo & Cover), Contact, Social Media, Location. No live customer preview.

Preview components (`SettingsPreviewPanel`, `BookingPagePreview`) are retained in `shared/preview/` for the future Booking App domain — they are simply no longer referenced by Brand.

---

## 4. Services Domain Refactor Summary

| Change                 | Before                                                | After                                                    |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| `ServicesForm` wrapper | `<div className="flex flex-col gap-s32">`             | Fragment (shell owns `gap-s32`)                          |
| Section order          | Categories, Services, Consultation, Add-ons, Bundles  | Categories, Services, Consultation, **Bundles, Add-ons** |
| Header + action        | 4x inline `flex justify-between` + hand-styled button | `SettingsSectionHeader action={<SettingsAddButton/>}`    |
| Consultation header    | Redundant empty `justify-between` wrapper             | Plain header                                             |
| Section rhythm         | `gap-s32` (local)                                     | `gap-s32` (shell, shared with Brand)                     |

Section structure now identical to Brand: every section is `SettingsSection > SettingsSectionHeader > SettingsContentCard`. Same spacing rhythm, same card surface, same interaction patterns.

---

## 5. Responsive Verification

| Breakpoint          | Behavior                                                | Mechanism                                           |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| Desktop (≥1024px)   | Multi-column form grids; content centered at max 1200px | `SETTINGS_MAX_WIDTH`, `SettingsFormGrid cols={2/3}` |
| Tablet (768–1023px) | Adaptive grid — 2-col grids hold, 3-col drops to 2      | `md:grid-cols-2`, `lg:grid-cols-3`                  |
| Mobile (<768px)     | Single column throughout                                | `grid-cols-1` base in `SettingsFormGrid`            |

- No fixed widths remain in Brand or Services (the only fixed width — preview `lg:w-[380px]` — left with the unused `SettingsPreviewPanel`).
- Section header action collapses gracefully: `flex items-start justify-between gap-s16` with `shrink-0` action and `min-w-0` title column — no overflow on narrow screens.
- Tabs scroll horizontally on overflow (`overflow-x-auto`) instead of breaking.

---

## 6. Design System Compliance

| Requirement                                               | Status                                                                                              |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Design tokens only (no magic hex)                         | PASS — only user-data color (`cat.blobColor`, `avatarColor`) is non-token, and is data, not styling |
| No inline `style={{}}`                                    | PASS in Brand + Services                                                                            |
| `SettingsSection` / `SettingsContentCard` used everywhere | PASS                                                                                                |
| `SettingsActionBar` for single-record (Brand)             | PASS                                                                                                |
| `SettingsInput` / `SettingsTextarea`                      | PASS (all Brand fields)                                                                             |
| `SettingsUploadField`                                     | PASS (Brand media)                                                                                  |
| `SettingsListCard`                                        | PASS (all Services lists)                                                                           |
| `SettingsAddButton` (new standard)                        | PASS (Categories, Services, Bundles, Add-ons)                                                       |
| Hardcoded spacing/widths/layout hacks                     | REMOVED from Brand + Services                                                                       |

---

## 7. File Size Report

| File                               | Lines      | Note                           |
| ---------------------------------- | ---------- | ------------------------------ |
| `layout/SettingsSectionHeader.tsx` | 26         | +action slot                   |
| `shared/SettingsAddButton.tsx`     | 22         | new primitive                  |
| `brand/BrandPageClient.tsx`        | 28         | was 43 (preview removed)       |
| `brand/BrandForm.tsx`              | 34         | fragment                       |
| `brand/sections/*`                 | 51–70 each | within budget                  |
| `services/ServicesForm.tsx`        | 54         | fragment, reordered            |
| `services/sections/*`              | 64–84 each | within budget, simpler headers |

Brand domain total: 367 lines. Services domain total: 446 lines. No file exceeds 120 lines. Net reduction in Brand (preview wiring gone) and Services (inline button duplication gone).

---

## 8. Remaining UI Debt

| Item                                                                                                                                                                                                                 | Severity | Note                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Legacy `settings/shared/` (`FormField`, `SaveButton`, `SettingsCard`)                                                                                                                                                | LOW      | Dead code, zero imports. Safe to delete in a cleanup pass.                                                                     |
| Legacy root section files (`GeneralInfoSection`, `ProfileSection`, `ServicesSection`, `AddOnsSection`, `TeamSection`, `UsersAndRolesSection`, `OtherSettingsSection`, `RolePermissionMatrix`, `UserManagementModal`) | MEDIUM   | Pre-V2 settings components. Not part of Brand/Layanan V2. Must be audited/removed when their domains migrate (Team, Pengguna). |
| `SettingsPreviewPanel` + `BookingPagePreview` unused                                                                                                                                                                 | LOW      | Intentionally retained for the future Booking App domain. Re-confirm ownership when that domain is built.                      |
| Services CRUD dialogs                                                                                                                                                                                                | KNOWN    | `+ Add` and per-row actions are still stubs (`handleStub`). Tracked in Phase 5.5 reports.                                      |
| `SettingsDangerZone` unused-var lint (`idx`)                                                                                                                                                                         | TRIVIAL  | Pre-existing, unrelated to consolidation.                                                                                      |

---

## Final Verdict

**SETTINGS V2 CONSISTENT**

Brand & Profil and Layanan now share one layout contract:

- One spacing rhythm source (`SettingsPageShell`, `gap-s32`) — both forms are rhythm-transparent fragments.
- One section structure (`SettingsSection > SettingsSectionHeader > SettingsContentCard`).
- One section-action pattern (`SettingsSectionHeader action` + `SettingsAddButton`).
- One save model per domain type (single-record → `SettingsActionBar`; list → section/row actions).
- Preview responsibility removed from Brand; Brand is pure configuration.
- Responsive verified across desktop/tablet/mobile with no fixed widths or overflow.

The contract is documented and enforceable. Future domains (Team, Operasional, Booking App, Pengguna) must follow Section 2 exactly. Team Domain may now begin on this foundation.
