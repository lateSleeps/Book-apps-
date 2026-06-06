# Overview Module — Architecture

> Last updated: June 2026 (post Step 11 V3 refactor)

---

## Purpose

The Overview page (`/dashboard/overview`) is the primary daily operations screen for salon owners. It shows:

- KPI stat cards (revenue, bookings, completions, cancellations)
- A filterable, searchable, sortable booking table (desktop) or card list (mobile)
- An expandable booking detail panel for managing each booking
- Walk-in entry and booking lookup via drawer
- Confirmation/decline/delete/payment dialogs

---

## Main Architecture

### Layer Diagram

```
app/dashboard/overview/page.tsx          ← orchestration only, ~61 lines
        │
        ▼
useOverviewController()                  ← single state entry point
        │
        ├── useBookingList               ← filtered/sorted booking list + tabs
        ├── useBookingDetail             ← per-booking edit state (service, notes)
        ├── useBookingStatus             ← confirm / decline / delete + dialogs
        ├── useBookingPayment            ← payment method, proof upload, confirm
        ├── useBookingPromo              ← promo code input and application
        ├── useWalkInFlow                ← walk-in drawer form + barcode scanner
        ├── useDashboardUi               ← UI flags: mobile, greeting, expanded row
        ├── useDashboardData             ← upstream API data (bookings, stats)
        ├── useServices                  ← available services from Settings
        └── useStylists                  ← available stylists from Settings
```

### page.tsx

`app/dashboard/overview/page.tsx` is the **orchestration layer only**. It:

1. Calls `useOverviewController()` — the single source of truth for all state
2. Renders 5 top-level regions: `OverviewHeader`, `StatCardsRow`, `OverviewBookingList`, `WalkInDrawer`, `OverviewDialogs`
3. Contains no business logic, no local state, no conditional rendering beyond what the controller provides

**Rule:** page.tsx should never exceed ~80 lines. All logic lives in the controller or hooks.

### useOverviewController

`features/dashboard/controller/use-overview-controller.ts` is a **composition layer**. It:

- Instantiates all domain hooks
- Wires cross-domain callbacks (e.g. `useBookingStatus` calls `list.overrideBookingStatus` after a confirmation)
- Exposes a single typed object consumed by page.tsx

**Rule:** No business logic lives here. Only hook instantiation and callback wiring.

### Domain Hooks

Each hook owns exactly one domain. Hooks do not import each other — cross-domain communication goes through the controller via callbacks.

| Hook                | Domain             | Key Responsibilities                                                                                |
| ------------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| `useBookingList`    | Booking list state | Filter tabs, search, sort, expand/collapse, optimistic overrides, manual booking insertion          |
| `useBookingDetail`  | Per-booking edits  | Service picker, additional services, treatment notes, add-on management, product picker             |
| `useBookingStatus`  | Status transitions | Confirm booking, decline booking, delete booking, open/close dialogs, WA notification trigger       |
| `useBookingPayment` | Payment processing | Payment method selection, amount input, proof upload, settlement proof, payment confirmation dialog |
| `useBookingPromo`   | Promo codes        | Promo input per booking, apply/remove promo, discount computation                                   |
| `useWalkInFlow`     | Walk-in drawer     | Form state (name, phone, service, stylist, time), barcode scanner, drawer open/close, submit        |
| `useDashboardUi`    | UI flags           | Greeting text, mobile detection, mobile selected booking ID                                         |

---

## Component Relationships

```
OverviewPage (page.tsx)
│
├── OverviewHeader
│     └── AddVisitDropdown          ← desktop "Tambah Pelanggan" button + dropdown
│
├── StatCardsRow                    ← 4 KPI cards (Pendapatan, Booking, Selesai, Pembatalan)
│
├── OverviewBookingList             ← contains all list UI
│     ├── BookingTableHeader        ← tabs, search, sort, refresh (desktop)
│     ├── BookingRowColumnHeaders   ← column heading row
│     ├── BookingRow (×N)           ← one row per booking
│     │     └── BookingDetailPanel  ← expanded detail (rendered as children)
│     │           ├── PaymentSection
│     │           │     ├── PaymentStatusCard   ← read-only payment summary
│     │           │     └── PaymentInputCard    ← payment method + proof upload
│     │           └── (service picker, add-on picker, promo section inline)
│     └── MobileBookingList (mobile only)
│           ├── MobileBookingCard (×N)
│           └── MobileDetailSheet   ← slides in, contains BookingDetailPanel
│
├── WalkInDrawer                    ← side panel, always in DOM, conditional visibility
│     ├── WalkInNamePhoneFields
│     ├── ServiceSearchDropdown
│     ├── StylistTimeSelector
│     ├── BookingCodeSection        ← "Booking Online" tab
│     ├── BarcodeScanner            ← fullscreen camera overlay (mobile)
│     └── AddVisitFAB               ← mobile floating action button
│
└── OverviewDialogs                 ← portal-mounted, rendered outside scroll area
      ├── ConfirmBookingDialog      ← payment confirmation
      ├── DeclineBookingDialog      ← decline with reason + optional WA
      ├── DeleteBookingDialog       ← permanent delete confirmation
      ├── WANotificationDialog      ← post-confirm WA prompt
      └── ProofZoomDialog           ← fullscreen payment proof image
```

---

## Design Principles

### 1. Separation of Concerns

- **page.tsx** — orchestration only
- **controller** — hook composition + cross-domain wiring
- **hooks** — domain business logic (state machines, computations, API calls)
- **components** — pure presentation; receive props, emit callbacks

Components never import hooks directly. They receive all data and callbacks as props.

### 2. Dumb UI vs Business Logic

All components in `features/dashboard/components/overview/` are presentation-only unless explicitly noted. They:

- Receive state as props
- Emit events via callbacks
- Contain no `useState`, `useEffect`, or API calls

The only exception is ephemeral UI state (e.g. form input in `WalkInNamePhoneFields`) which is lifted to `useWalkInFlow`.

### 3. Reusable Primitives

Shared UI primitives live in `shared/components/ui/dialog/`:

- `BaseDialog` — backdrop, z-index, click-to-close
- `DialogHeader` — eyebrow + title + close button
- `DialogContent` — scrollable body area
- `DialogFooter` — button row
- `DialogIcon` — colored circle icon with variant (success/danger/warning/info)
- `DialogPrimaryButton` / `DialogSecondaryButton` / `DialogWAButton` — styled buttons

These are used by all 5 dialogs and should never be modified for a single use case. If a dialog needs something unique, it renders it inside `DialogContent`, not by modifying the primitives.

### 4. Token-First Styling

All visual values should use design tokens from `tailwind.config.ts`. See `docs/design-system-rules.md` for the full token reference.

Inline `style={{}}` is only allowed for:

- Dynamic values (e.g. `background: isExpanded ? '#fafaf8' : 'transparent'`)
- Values that require JS computation (avatar colors, conditional transforms)
- Legacy components during active migration

Static visual values must use Tailwind classes.

---

## File Locations

```
apps/owner/src/
├── app/dashboard/overview/
│     └── page.tsx
├── features/dashboard/
│     ├── components/overview/
│     │     ├── *.tsx                    (top-level overview components)
│     │     ├── dialogs/                 (5 dialog components)
│     │     └── mobile/                  (3 mobile-specific components)
│     ├── constants/overview/
│     │     ├── booking-status.ts        (status meta, payment meta, visitor type meta)
│     │     └── mock-data.ts             (MOCK_SERVICES, MOCK_PRODUCTS — temporary)
│     ├── controller/
│     │     └── use-overview-controller.ts
│     ├── hooks/overview/
│     │     ├── use-booking-list.ts
│     │     ├── use-booking-detail.ts
│     │     ├── use-booking-payment.ts
│     │     ├── use-booking-promo.ts
│     │     ├── use-booking-status.ts
│     │     ├── use-dashboard-ui.ts
│     │     └── use-walk-in-flow.ts
│     ├── types/
│     │     ├── dashboard.types.ts       (DashboardBooking, BookingStatus, etc.)
│     │     └── overview.types.ts        (VisitorTab, WalkInFormData, ConfirmPaymentDialogData, etc.)
│     └── utils/
│           └── booking-list.utils.ts    (pure functions: filter, sort, merge)
└── shared/
      ├── components/ui/dialog/          (BaseDialog + 5 primitives)
      └── lib/
            ├── avatar.ts                (avatarColor, getInitials)
            ├── format.ts                (formatRupiah, formatCompactRupiah)
            ├── greeting.ts              (getGreeting)
            └── tokens.ts                (JS constants: BOOKING_STATUS_META, etc.)
```
