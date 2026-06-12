# Settings Navigation Refactor Report

## 1. New Information Architecture

| #   | Domain           | Route                            | Permission           |
| --- | ---------------- | -------------------------------- | -------------------- |
| 1   | Brand & Profil   | /dashboard/settings/brand        | EDIT_BUSINESS_INFO   |
| 2   | Layanan          | /dashboard/settings/layanan      | MANAGE_SERVICES      |
| 3   | Produk & Paket   | /dashboard/settings/produk-paket | MANAGE_ADDONS        |
| 4   | Tim              | /dashboard/settings/tim          | MANAGE_STAFF         |
| 5   | Operasional      | /dashboard/settings/operasional  | MANAGE_WORKING_HOURS |
| 6   | Booking App      | /dashboard/settings/booking      | EDIT_BUSINESS_INFO   |
| 7   | Pengguna & Akses | /dashboard/settings/pengguna     | MANAGE_USERS         |

Previous: 6 domains (no Produk & Paket, Operasional used EDIT_BUSINESS_INFO).
New: 7 domains. Operasional now uses MANAGE_WORKING_HOURS permission.

---

## 2. Navigation Architecture

### Old structure (removed)

```
SettingsLayout
  [flex-col]
    SettingsPageHeader
    SettingsTopTabs         <- horizontal tab bar, overflow-x-auto
    [flex-1 overflow-y-auto]
      {children}
```

### New structure

```
SettingsLayout
  [flex-col]
    SettingsPageHeader       <- top, shrink-0, border-b
    [flex-1 flex-col md:flex-row overflow-hidden]
      SettingsNavigationPanel  <- left panel on desktop, top bar on mobile
      [flex-1 overflow-y-auto]
        {children}
```

### SettingsNavigationPanel

File: `settings/SettingsNavigationPanel.tsx`

Each item: phosphor icon (duotone when active, regular when inactive) + label.

Active state: `bg-bg-card text-tx-primary shadow-card rounded-r10`
Inactive state: `text-tx-secondary hover:bg-bg-hover hover:text-tx-primary`

Icons:
| Domain | Icon |
|--------|------|
| Brand & Profil | Storefront |
| Layanan | Scissors |
| Produk & Paket | ShoppingBag |
| Tim | Users |
| Operasional | Clock |
| Booking App | CalendarCheck |
| Pengguna & Akses | UserGear |

Permission filtering: same logic as SettingsTopTabs — each item filtered by
`useHasPermission()`. Items the user lacks permission for are hidden.

---

## 3. Responsive Behavior

| Breakpoint    | Nav Behavior                                   | Content             |
| ------------- | ---------------------------------------------- | ------------------- |
| < md (mobile) | Horizontal scroll bar above content, border-b  | Full width below    |
| md+ (desktop) | Vertical panel, w-56 (224px), border-r, py-s16 | flex-1 to the right |

On mobile: items render as horizontal chips with `overflow-x-auto`, `whitespace-nowrap`.
On desktop: items render as full-width rows with `md:w-full`, `md:whitespace-normal`.

The outer layout uses `flex-col md:flex-row` — no JavaScript, pure CSS responsive.

---

## 4. Design System Additions

### New constants in `settings/constants/layout.ts`

```ts
// Fixed width of settings navigation panel on desktop
export const SETTINGS_NAV_WIDTH = "w-56";

// Min-height for nav items (44px touch target)
export const SETTINGS_NAV_ITEM_HEIGHT = "min-h-[36px]";
```

`SETTINGS_NAV_ITEM_HEIGHT` uses an arbitrary value (`min-h-[36px]`) as the 4pt
grid has no 36px token. This is the only exception — acceptable for touch target
sizing. If added to Tailwind: `s36: '2.25rem'`.

No new color tokens required. All nav states use existing tokens:

- Active bg: `bg-bg-card`
- Active text: `text-tx-primary`
- Active shadow: `shadow-card`
- Inactive text: `text-tx-secondary`
- Hover bg: `bg-bg-hover`
- Border: `border-bd-row`

---

## 5. Routing Updates

| Change                 | Old                                                     | New                                       |
| ---------------------- | ------------------------------------------------------- | ----------------------------------------- |
| AddOns + Bundles route | /dashboard/settings/layanan (tab: packages)             | /dashboard/settings/produk-paket          |
| Legacy redirect        | produk-addon → /layanan                                 | produk-addon → /produk-paket              |
| New route created      | —                                                       | /dashboard/settings/produk-paket/page.tsx |
| Services tabs          | 3 tabs (Layanan & Kategori, Pertanyaan, Paket & Add-on) | 2 tabs (Layanan & Kategori, Pertanyaan)   |

---

## 6. Domain Ownership Updates

### Layanan (Services)

**Owns**: Categories, ServiceItems, ConsultationQuestions
**Removed**: AddOnProducts, ServiceBundles (moved to Produk & Paket)
**Tabs**: Layanan & Kategori | Pertanyaan Konsultasi

### Produk & Paket (new)

**Owns**: AddOnProducts, ServiceBundles
**Reads**: ServiceItem IDs (from Services domain, no duplication)
**Controller**: `useProdukPaketController` — implements BaseSettingsController
**Tabs**: Produk Add-on | Paket Bundle

### AddOnsSection + BundlesSection (shared UI)

`onToggleActive` prop signature changed from `ServicesController['updateAddon']`
to a plain function type: `(id: string, patch: Partial<T>) => void`.
Both sections are now domain-agnostic and can be used by either controller.

---

## 7. Category Grid Refinement

File: `ServicesAccordion.tsx`

| Change               | Before                                      | After                                       |
| -------------------- | ------------------------------------------- | ------------------------------------------- |
| Category grid        | `grid-cols-2 md:grid-cols-3 lg:grid-cols-5` | `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` |
| Category description | `text-ts-cap1` (12px)                       | `text-ts-cap2` (11px)                       |
| Service card grid    | `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` | unchanged                                   |

Category description reduced one typography level (cap1 → cap2) without changing
hierarchy or content. Name remains `text-ts-head font-semibold`.

---

## Final Verdict

**READY FOR OPERATIONS DOMAIN**

Completed:

- SettingsNavigationPanel replacing SettingsTopTabs ✓
- Two-panel layout (nav + content) with responsive mobile fallback ✓
- New 7-domain IA with correct permission mapping ✓
- Produk & Paket domain created with dedicated controller ✓
- Services domain cleaned of AddOns/Bundles ✓
- Category grid max 4 columns, 1 on mobile ✓
- Category description reduced to ts-cap2 ✓
- Design system constants added ✓
- Sections decoupled from ServicesController type ✓
