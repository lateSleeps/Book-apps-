# Phase 5.3 - Settings Shared Components Report

> Status: COMPLETE
> Date: 2026-06-08

---

## STEP 1 - Repeated UI Patterns Identified

Audited: Brand, Layanan, Tim, Operasional, Booking App, Pengguna & Akses domains.

| Pattern                                            | Appears in                                                               | Component Created    |
| -------------------------------------------------- | ------------------------------------------------------------------------ | -------------------- |
| Labeled input group (label + input + hint + error) | All 6 domains                                                            | SettingsFieldGroup   |
| 2-column responsive form grid                      | Brand, Layanan, Tim, Booking App                                         | SettingsFormGrid     |
| File/image upload with preview                     | Brand (logo, cover), Tim (avatar), Layanan (addon image)                 | SettingsUploadField  |
| Form + live preview side-by-side                   | Booking App domain                                                       | SettingsPreviewPanel |
| Empty state (no items yet)                         | Layanan (no services), Tim (no staff), Pengguna (no users)               | SettingsEmptyState   |
| Item row card with image/badges/actions            | Layanan (services, categories, addons), Tim (stylists), Pengguna (users) | SettingsListCard     |
| Destructive action section                         | Brand (deactivate salon), Pengguna (remove user)                         | SettingsDangerZone   |

---

## STEP 2 - Component Inventory

All files at: `apps/owner/src/features/dashboard/components/settings/components/shared/`

### SettingsFormGrid

- Props: `cols` (1 | 2 | 3, default 2), `children`, `className`
- Responsive: 1-col on mobile, n-col on md+
- Used in: Brand (name/phone/address), Tim (name/specialty), Layanan (name/price/duration)

### SettingsFieldGroup

- Props: `label`, `hint`, `error`, `required`, `htmlFor`, `children`, `fullWidth`
- `fullWidth` adds `col-span-full` for grid escape
- Renders: label (ts-fn/medium), children slot, error (ac-danger/cap1), hint (secondary/cap1)
- Used in: every domain form field

### SettingsUploadField

- Props: `variant` (logo|cover|avatar|addon), `value`, `onChange(file, previewUrl)`, `onRemove`, `error`, `disabled`
- Variants and their constraints:

| Variant | Aspect | Max size | Usage            |
| ------- | ------ | -------- | ---------------- |
| logo    | square | 2MB      | Brand            |
| cover   | 16:6   | 5MB      | Brand            |
| avatar  | square | 2MB      | Tim              |
| addon   | square | 2MB      | Layanan (produk) |

- Does NOT upload. Parent receives `(File, previewUrl)` and handles Supabase upload.
- Future: WebP conversion before `onChange` fires (marked in code comment).
- Accepted: PNG, JPG, WebP.

### SettingsPreviewPanel

- Props: `form` (ReactNode), `preview` (ReactNode), `previewLabel`
- Desktop (lg+): form left (flex-1), preview right (sticky, 380px fixed width)
- Mobile: stacked, preview below form
- Used in: Booking App domain only
- Preview slot is frameless — Booking App wraps in iframe or component as needed

### SettingsEmptyState

- Props: `icon` (ReactNode — caller sets size/weight), `title`, `description`, `action` (ReactNode)
- Icon container: h-14 w-14, r20, bg-bg-control
- Action slot accepts any element (button, link, etc.)
- Used in: Layanan (no services/addons), Tim (no staff), Pengguna (no users)

### SettingsListCard

- Props: `title`, `description`, `imageUrl`, `imageFallback` (emoji/initials), `badges[]`, `actions` (ReactNode), `onClick`
- Badges: default | success | warning | danger | info — all use status tokens, no hardcoded hex
- Thumbnail: 40x40px, r10, object-cover (image) or bg-bg-control (fallback)
- `actions` slot click is stop-propagated from row click
- Used in: Layanan (service rows, category rows, addon rows), Tim (stylist rows), Pengguna (user rows)

### SettingsDangerZone

- Props: `title`, `actions[]` (label, description, confirmLabel, confirmPrompt, onConfirm, isLoading)
- Two-step confirm: click shows confirm prompt + Batal/confirm buttons
- Background: `bg-st-cancelled-bg`, border: `ac-danger/30`
- `onConfirm` supports async
- Used in: Brand (deactivate salon), Pengguna (remove user, reset password)

---

## STEP 3 - Domain Usage Matrix

| Component            | Brand        | Layanan     | Tim    | Operasional | Booking App | Pengguna |
| -------------------- | ------------ | ----------- | ------ | ----------- | ----------- | -------- |
| SettingsFormGrid     | yes          | yes         | yes    | yes         | yes         | yes      |
| SettingsFieldGroup   | yes          | yes         | yes    | yes         | yes         | yes      |
| SettingsUploadField  | logo + cover | addon image | avatar | -           | qris image  | -        |
| SettingsPreviewPanel | -            | -           | -      | -           | yes         | -        |
| SettingsEmptyState   | -            | yes         | yes    | -           | -           | yes      |
| SettingsListCard     | -            | yes         | yes    | -           | -           | yes      |
| SettingsDangerZone   | yes          | -           | -      | -           | -           | yes      |

---

## STEP 4 - Design System Verification

| Rule                                      | Status                                                            |
| ----------------------------------------- | ----------------------------------------------------------------- |
| No hardcoded hex                          | PASS - all colors from token classes                              |
| No inline styles                          | PASS                                                              |
| No magic radius/spacing values            | PASS - all r* and s* tokens                                       |
| Phosphor icons only                       | PASS - Image, X, UploadSimple, Warning from @phosphor-icons/react |
| TypeScript strict (no any)                | PASS                                                              |
| Uses SettingsContentCard where applicable | N/A - these are primitives, not page-level wrappers               |
| shadow-card used                          | PASS - SettingsListCard uses shadow-card                          |

---

## Ready for Phase 5.4

Phase 5.3 creates only primitives. No domain content yet.

Next: Phase 5.4 — Brand & Profil domain implementation using:

- SettingsPageShell + SettingsSection + SettingsSectionHeader + SettingsContentCard (from layout/)
- SettingsFormGrid + SettingsFieldGroup + SettingsUploadField + SettingsDangerZone (from components/shared/)
- SettingsActionBar (from layout/)
