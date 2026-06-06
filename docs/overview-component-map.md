# Overview Module — Component Map

> Every major component in the overview module with its responsibility and dependencies.

---

## Scope Classification

- **Shared** — lives in `shared/`, reusable by any feature
- **Overview-specific** — lives in `features/dashboard/components/overview/`, used only by overview
- **Reusable primitive** — a pattern that could be promoted to shared with minor effort

---

## Page & Controller

| Component / File                  | Type       | Responsibility                                          | Depends On                                                     |
| --------------------------------- | ---------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| `app/dashboard/overview/page.tsx` | Page       | Orchestrates all regions; no business logic             | `useOverviewController`, all 5 top-level components            |
| `use-overview-controller.ts`      | Controller | Composes all domain hooks; wires cross-domain callbacks | All 7 hooks + `useDashboardData`, `useServices`, `useStylists` |

---

## Top-Level Page Regions

| Component             | Type              | Responsibility                                                            | Depends On                                                                                                                     |
| --------------------- | ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `OverviewHeader`      | Overview-specific | Greeting text + breadcrumb + "Tambah Pelanggan" button                    | `AddVisitDropdown`                                                                                                             |
| `AddVisitDropdown`    | Overview-specific | Desktop dropdown trigger for Walk-in / Booking Online entry               | `walkIn` props from controller                                                                                                 |
| `StatCardsRow`        | Overview-specific | 4 KPI cards: today's revenue, bookings, completed, cancelled              | `stats`, `allBookings`                                                                                                         |
| `OverviewBookingList` | Overview-specific | Full booking table (desktop) + mobile list; owns scroll + expand/collapse | `BookingTableHeader`, `BookingRow`, `BookingDetailPanel`, mobile components                                                    |
| `WalkInDrawer`        | Overview-specific | Slide-in side panel for walk-in entry or booking code lookup              | `WalkInNamePhoneFields`, `ServiceSearchDropdown`, `StylistTimeSelector`, `BookingCodeSection`, `BarcodeScanner`, `AddVisitFAB` |
| `OverviewDialogs`     | Overview-specific | Mounts all 5 dialogs conditionally; sits outside scroll area              | All 5 dialog components                                                                                                        |

---

## Booking List Components

| Component                 | Type              | Responsibility                                                                  | Depends On                                                                                         |
| ------------------------- | ----------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `BookingTableHeader`      | Overview-specific | Segmented tabs, search input, sort toggle, refresh button                       | `use-booking-list` state via props                                                                 |
| `BookingRowColumnHeaders` | Overview-specific | Fixed column header row (exported from `BookingRow.tsx`)                        | None                                                                                               |
| `BookingRow`              | Overview-specific | Single collapsed booking row in 6-column grid; expands to show detail           | `BookingDetailPanel` as `children`, `avatarColor`, `getInitials`, status constants                 |
| `OverviewBookingList`     | Overview-specific | Renders skeleton, empty state, or list of `BookingRow`; also mounts mobile path | `BookingTableHeader`, `BookingRow`, `BookingDetailPanel`, `MobileBookingList`, `MobileDetailSheet` |

---

## Booking Detail Panel

| Component            | Type              | Responsibility                                                                                 | Depends On                                                             |
| -------------------- | ----------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `BookingDetailPanel` | Overview-specific | 3-column expanded detail: Contact \| Service \| Add-ons + full-width Payment                   | `PaymentSection`, internal `Label`, `AddItemButton`, `PickerSearchRow` |
| `PaymentSection`     | Overview-specific | Layout wrapper: PaymentStatusCard (left) + PaymentInputCard (right, 2 cols)                    | `PaymentStatusCard`, `PaymentInputCard`                                |
| `PaymentStatusCard`  | Overview-specific | Read-only: payment status badge, progress bar, paid/remaining amounts, promo code, proof links | Internal `ProofViewButton`                                             |
| `PaymentInputCard`   | Overview-specific | Interactive: payment method selector, cash amount input, proof upload button                   | None                                                                   |

**Internal components** (defined inside `BookingDetailPanel.tsx`, not exported):

| Internal          | Purpose                                                            |
| ----------------- | ------------------------------------------------------------------ |
| `Label`           | Eyebrow label (11px, uppercase, `#8E8E93`)                         |
| `AddItemButton`   | "+ Tambah X" link-style button (Phosphor `Plus` + label)           |
| `PickerSearchRow` | Search input row used in both service and product picker dropdowns |

---

## Dialog Components

| Component              | Type              | Responsibility                                                              | Depends On                          | Dialog Variant |
| ---------------------- | ----------------- | --------------------------------------------------------------------------- | ----------------------------------- | -------------- |
| `ConfirmBookingDialog` | Overview-specific | Payment method + amount + optional proof upload + confirm                   | Dialog primitives, `formatRupiah`   | success        |
| `DeclineBookingDialog` | Overview-specific | Reason textarea + optional WA notification link                             | Dialog primitives                   | danger         |
| `DeleteBookingDialog`  | Overview-specific | Permanent delete confirmation                                               | Dialog primitives                   | danger         |
| `WANotificationDialog` | Overview-specific | Post-confirm: send WA message or skip                                       | Dialog primitives, `buildWAMessage` | success        |
| `ProofZoomDialog`      | Overview-specific | Fullscreen proof image overlay; not using dialog primitives (custom layout) | None                                |

### Dialog Primitives (Shared)

| Primitive               | Type   | Responsibility                                                       |
| ----------------------- | ------ | -------------------------------------------------------------------- |
| `BaseDialog`            | Shared | Backdrop overlay, z-index, click-to-close handler                    |
| `DialogHeader`          | Shared | Icon area + eyebrow + title + description + close button             |
| `DialogContent`         | Shared | Scrollable body area with consistent padding                         |
| `DialogFooter`          | Shared | Button row with consistent padding                                   |
| `DialogIcon`            | Shared | 40px colored circle: variants `success`, `danger`, `warning`, `info` |
| `DialogPrimaryButton`   | Shared | Primary CTA: variants `neutral`, `danger`, `success`; loading state  |
| `DialogSecondaryButton` | Shared | Ghost-style cancel button                                            |
| `DialogWAButton`        | Shared | Green WhatsApp branded link button                                   |

---

## Walk-In Drawer Components

| Component               | Type              | Responsibility                                                                      | Depends On                                                                                                                     |
| ----------------------- | ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `WalkInDrawer`          | Overview-specific | Side panel shell; renders Walk-in or Booking Online form based on `addDrawer` state | `WalkInNamePhoneFields`, `ServiceSearchDropdown`, `StylistTimeSelector`, `BookingCodeSection`, `BarcodeScanner`, `AddVisitFAB` |
| `WalkInNamePhoneFields` | Overview-specific | Name + phone number inputs for walk-in form                                         | None                                                                                                                           |
| `ServiceSearchDropdown` | Overview-specific | Searchable service selector within walk-in form                                     | None                                                                                                                           |
| `StylistTimeSelector`   | Overview-specific | Stylist chips + available time slots                                                | Real stylists and bookings data                                                                                                |
| `BookingCodeSection`    | Overview-specific | Manual booking code input + barcode scan trigger                                    | None                                                                                                                           |
| `BarcodeScanner`        | Overview-specific | Fullscreen camera overlay for QR/barcode scanning (mobile only)                     | None                                                                                                                           |
| `AddVisitFAB`           | Overview-specific | Mobile floating action button; opens Walk-in or Booking Online                      | None                                                                                                                           |

---

## Mobile Components

| Component           | Type              | Responsibility                                                     | Depends On                                                    |
| ------------------- | ----------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| `MobileBookingList` | Overview-specific | Horizontal scroll tabs + card list for mobile viewport             | `MobileBookingCard`                                           |
| `MobileBookingCard` | Overview-specific | Single booking card: avatar, name, service, status badge, meta row | Status + visitor type constants, `avatarColor`, `getInitials` |
| `MobileDetailSheet` | Overview-specific | Slides in from right; contains `BookingDetailPanel` for mobile     | `BookingDetailPanel`                                          |

---

## Shared Library Components

| File                     | Type      | Responsibility                                                                                                                                    |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/lib/avatar.ts`   | Utility   | `avatarColor(name)` → `{bg, text}`, `getInitials(name)` → string, `AVATAR_BG_COLORS`                                                              |
| `shared/lib/format.ts`   | Utility   | `formatRupiah(n)`, `formatCompactRupiah(n)`                                                                                                       |
| `shared/lib/greeting.ts` | Utility   | `getGreeting(hour)` → "Selamat pagi/siang/sore/malam"                                                                                             |
| `shared/lib/tokens.ts`   | Constants | `BOOKING_STATUS_META`, `PAYMENT_STATUS_META`, `VISITOR_TYPE_META`, `STAT_ICON_COLORS`, `ACTION_COLORS`, `UPCOMING_DOT_COLOR`, `AVATAR_TEXT_COLOR` |

---

## Promotion Candidates

These overview-specific components have patterns generic enough to be promoted to `shared/` in a future pass:

| Component                                                  | Why Promotable                                              | Effort                                                  |
| ---------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| `BookingRow` avatar + initials div                         | Pattern reused in `MobileBookingCard` with slight variation | Medium                                                  |
| Status badge (inline in `BookingRow`, `MobileBookingCard`) | Same semantic pattern, different visual scales              | Medium — needs design decision on unified `StatusBadge` |
| `PaymentStatusCard.ProofViewButton`                        | Already extracted as internal component                     | Low — just move to `shared/`                            |
