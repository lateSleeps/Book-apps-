# Overview Module — Data Flow

> Traces how data moves through the overview module for each major user flow.

---

## Architecture Summary

```
External APIs / Services
        │
        ▼
useDashboardData ─── useServices ─── useStylists
        │
        ▼
useOverviewController   ←── cross-domain callbacks
   ├── useBookingList       ← "effective bookings" (merged + overridden)
   ├── useBookingDetail     ← per-booking edit state
   ├── useBookingStatus     ← confirm/decline/delete state machines
   ├── useBookingPayment    ← payment dialog state
   ├── useBookingPromo      ← promo code state
   ├── useWalkInFlow        ← walk-in drawer state
   └── useDashboardUi       ← viewport + UI flags
        │
        ▼
   page.tsx (props down, callbacks up)
        │
   Components (pure presentation)
```

---

## 1. Booking List Flow

### Initial Load

```
useDashboardData
  └── fetches upcoming bookings from API
        │
        ▼
useBookingList
  └── buildEffectiveBookings(upcomingBookings, manualBookings, statusOverrides, paymentOverrides, deletedIds)
        │  (pure function in booking-list.utils.ts)
        ▼
  effectiveBookings[]   ← what the user sees
        │
        ▼
  filterBookings(tab, search)  ← applies active tab + search query
  sortBookings(order)          ← ASC/DESC by time
        │
        ▼
  OverviewBookingList → BookingRow × N
```

### Tab / Search / Sort

```
User clicks tab / types in search / toggles sort
        │
        ▼
  BookingTableHeader fires callback
        │ setActiveTab / setSearchQuery / setSortOrder
        ▼
  useBookingList re-derives filtered/sorted list
        │
        ▼
  BookingRow list re-renders
```

### Expand / Collapse

```
User clicks BookingRow
        │
        ▼
  onToggle() → list.toggleExpand(bookingId)
        │
        ▼
  useBookingList: expandedId = bookingId (or null if same row)
        │
        ▼
  BookingRow renders BookingDetailPanel as children (conditional)
```

---

## 2. Booking Detail Flow

### View Detail

```
BookingRow expanded
        │
        ▼
  BookingDetailPanel receives:
    - booking (from list)
    - detail  (from useBookingDetail)
    - status  (from useBookingStatus)
    - payment (from useBookingPayment)
    - promo   (from useBookingPromo)
        │
        ▼
  Renders 3-column layout:
    Col 1: phone, WA link, DP proof, confirm/decline buttons
    Col 2: service (view/edit), additional services, treatment notes
    Col 3: add-ons, product picker, promo code
    Bottom: PaymentSection (full width)
```

### Edit Service

```
User clicks edit icon → detail.setEditServiceId(bookingId)
        │
        ▼
  Service picker appears (PickerSearchRow + category list)
  User selects service → detail.replaceService(bookingId, service)
        │
        ▼
  useBookingDetail: updates servicesMap[bookingId]
        │
        ▼
  PaymentSection re-derives finalTotal with new price
```

### Add Additional Service / Add-On

```
User clicks "+ Tambah layanan" / "+ Tambah add-on"
        │
        ▼
  detail.setShowServicePicker / setShowProductPicker
        │
        ▼
  Picker panel appears with PickerSearchRow
  User selects → detail.addService / detail.addProduct
        │
        ▼
  useBookingDetail: updates additionalServicesMap / addOnsMap
        │
        ▼
  finalTotal recalculated in PaymentSection
```

---

## 3. Payment Flow

### Open Payment Confirmation

```
User clicks "Konfirmasi" button (in BookingDetailPanel Col 1)
        │
        ▼
  status.confirmBooking(bookingId, waData)  ← async
        │
        ▼
  useBookingStatus: sets confirmingId (shows loading skeleton in row)
  After success:
    1. list.overrideBookingStatus(bookingId, 'CONFIRMED')
    2. Opens WANotificationDialog if customer has phone
        │
        ▼
  payment.openConfirmPaymentDialog(data)
        │
        ▼
  OverviewDialogs renders ConfirmBookingDialog
```

### Payment Confirmation Dialog

```
ConfirmBookingDialog
  ├── Owner selects payment method (CASH / TRANSFER / QRIS)
  ├── If CASH: enters amount received → kembalian computed locally
  ├── If TRANSFER/QRIS: uploads settlement proof photo
        │
        ▼
  onConfirm() → payment.processPayment()
        │
        ▼
  useBookingPayment:
    - Calls API (or mock) to record payment
    - list.overridePaymentStatus(bookingId, 'PAID')
    - Closes dialog
```

### Proof Upload

```
User clicks proof upload label (file input trigger)
        │
        ▼
  onChange → payment.setSettlementProof({ file, preview: blobURL })
        │
        ▼
  ConfirmBookingDialog shows image preview
  onConfirm uploads file to storage (TODO: real API)
        │
        ▼
  URL stored in booking record
  PaymentStatusCard shows "Lihat bukti pelunasan" link
```

---

## 4. Walk-In Flow

### Open Drawer (Desktop)

```
User clicks "Tambah Pelanggan" → AddVisitDropdown opens
User selects "Walk-in" or "Booking Online"
        │
        ▼
  openDrawerAndReset('WALK_IN' | 'BOOKING')
    → openDrawer(type)         ← walkIn.openDrawer
    → setDrawerServiceOpen(false)
    → setDrawerServiceSearch('')
    → setAddDropdownOpen(false)
        │
        ▼
  useWalkInFlow: addDrawer = 'WALK_IN' | 'BOOKING'
        │
        ▼
  WalkInDrawer slides in from right
```

### Open Drawer (Mobile)

```
User taps AddVisitFAB (fixed bottom-right)
        │
        ▼
  setAddDropdownOpen(true) → mini dropdown appears
  User taps option → onOpenWalkIn / onOpenBooking callbacks
        │
        ▼
  Same walkIn.openDrawer flow as desktop
```

### Walk-In Submission

```
WalkInDrawer: Walk-in tab
  1. WalkInNamePhoneFields: name + phone
  2. ServiceSearchDropdown: select service
  3. StylistTimeSelector: select stylist + time slot
        │
        ▼
  "Tambahkan ke Daftar" enabled when name + serviceId + stylistId present
  User clicks → submitWalkIn(realServices, realStylists)
        │
        ▼
  useWalkInFlow:
    - Creates DashboardBooking object (WALK_IN type, UPCOMING status)
    - list.addManualBooking(newBooking)  ← cross-domain callback
    - Closes drawer, resets form
        │
        ▼
  useBookingList: manualBookings.push(newBooking)
  effectiveBookings recalculated → new row appears at top
```

### Booking Code Lookup

```
WalkInDrawer: Booking Online tab
  Owner enters code (RB-2025-XXX format) manually
  OR taps "Scan Barcode" → BarcodeScanner opens (mobile only)
        │
        ▼
  useWalkInFlow handles scanner results
  (TODO: API lookup not yet implemented — form submission TBD)
```

---

## 5. Dialog Flow

### General Pattern

```
User performs action (button click in BookingDetailPanel)
        │
        ▼
  Hook's open*Dialog() called with dialog data payload
        │
        ▼
  Dialog state set in hook (e.g. useBookingStatus.declineDialog)
        │
        ▼
  OverviewDialogs reads hook state → renders dialog conditionally
        │
        ▼
  User confirms → hook's async action fires
  On success: updates relevant state + closes dialog
  On cancel: closes dialog, no state change
```

### Specific Flows

**Confirm Booking:**

```
Konfirmasi button → status.confirmBooking()
  → loading state in row
  → on success: list.overrideBookingStatus('CONFIRMED')
  → payment.openConfirmPaymentDialog()
  → ConfirmBookingDialog
  → processPayment() → list.overridePaymentStatus('PAID') → close
  → WANotificationDialog opens
```

**Decline Booking:**

```
Tolak button → status.openDeclineDialog({ bookingId, customerName, customerPhone })
  → DeclineBookingDialog
  → reason input (required)
  → optional: sends WA message via DialogWAButton
  → status.submitDecline() → list.overrideBookingStatus('CANCELLED')
  → close dialog
```

**Delete Booking:**

```
Trash icon in BookingRow → status.openDeleteDialog({ bookingId, customerName })
  → DeleteBookingDialog (z-[60], above main dialogs)
  → "Ya, Hapus" → status.submitDelete()
  → list.markDeleted(bookingId)
  → booking disappears from effective list
  → close dialog
```

**WA Notification (post-confirm):**

```
After booking confirmation:
  → WANotificationDialog automatically opens
  → Shows WA message preview
  → "Kirim via WhatsApp" → opens wa.me link in new tab
  → "Lewati" / backdrop click → onDismiss → close
```

---

## Optimistic Update Strategy

All status and payment changes are **optimistic** — they update the UI immediately without waiting for API confirmation. The actual API calls are mock/pending.

```
User action
    │
    ▼
Hook updates local override maps
    │
    ▼
buildEffectiveBookings() merges overrides → immediate UI update
    │
    ▼
Background: API call fires (mock for now)
    │
    ▼
On error (future): revert override, show error toast
```

Override maps live in `useBookingList`:

- `bookingStatusMap: Record<string, BookingStatus>` — status overrides
- `paymentStatusMap: Record<string, PaymentStatus>` — payment overrides
- `deletedIds: Set<string>` — IDs to exclude from display
- `manualBookings: DashboardBooking[]` — walk-ins added this session

---

## Auto-Refresh

`useDashboardData` (via `useOverviewController`) sets a 10-minute auto-refresh interval. The refresh button in `BookingTableHeader` triggers it manually. During refresh, `isRefreshing` is true — the BookingTableHeader shows a spinning ArrowClockwise icon.

```
Every 10 minutes (or manual trigger)
    │
    ▼
useDashboardData re-fetches from API
    │
    ▼
upcomingBookings updated
    │
    ▼
buildEffectiveBookings re-runs (preserves local overrides)
    │
    ▼
List re-renders with fresh data
```
