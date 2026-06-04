# Overview Page — Full Refactor Plan (v2)

> Branch: feat/clean-overview
> Rules: docs/design-system/DESIGN_SYSTEM.md + REFACTOR RULES (user-defined)
> Goal: page.tsx < 200 lines, pure orchestration layer

---

## Target Folder Structure

```
apps/owner/src/
├── app/dashboard/overview/
│   └── page.tsx                          ← thin ~80 lines, compose only
│
├── features/dashboard/
│   │
│   ├── components/overview/
│   │   ├── StatCardsRow.tsx              ← 4 stat cards
│   │   ├── BookingTableHeader.tsx        ← tabs + search + sort + add button
│   │   ├── BookingRow.tsx                ← single collapsed row
│   │   ├── BookingDetailPanel/
│   │   │   ├── index.tsx                 ← 3-col layout wrapper
│   │   │   ├── ContactColumn.tsx         ← phone + WA + proof upload
│   │   │   ├── ServiceColumn.tsx         ← service + stylist + notes
│   │   │   └── AddOnColumn.tsx           ← add-ons + promo
│   │   ├── PaymentSection.tsx            ← payment status + input + submit
│   │   ├── WalkInDrawer.tsx              ← walk-in form + barcode scanner
│   │   ├── MobileBookingCard.tsx         ← mobile card view
│   │   ├── MobileDetailPanel.tsx         ← mobile bottom sheet
│   │   └── dialogs/
│   │       ├── ConfirmPaymentDialog.tsx
│   │       ├── DeclineDialog.tsx
│   │       ├── DeleteDialog.tsx
│   │       ├── WANotifDialog.tsx
│   │       └── ProofZoomDialog.tsx
│   │
│   ├── hooks/overview/
│   │   ├── use-booking-list.ts           ← filter, sort, frozen order, tabs
│   │   ├── use-booking-actions.ts        ← confirm, decline, delete, payment
│   │   ├── use-walk-in-flow.ts           ← walk-in form, barcode, drawer
│   │   └── use-payment.ts               ← payment state, proof upload
│   │
│   ├── services/
│   │   └── booking.service.ts            ← API calls: confirm, decline, delete, payment, upload
│   │
│   └── constants/overview/
│       ├── booking-status.ts             ← STATUS_META, PAYMENT_META, VISITOR_META
│       └── mock-data.ts                  ← DUMMY_BOOKINGS, MOCK_SERVICES, MOCK_PRODUCTS (temp)
│
└── shared/lib/
    ├── avatar.ts                         ← avatarColor(), getInitials(), AVATAR_BG_COLORS
    ├── greeting.ts                       ← getGreeting(), DAYS_ID, MONTHS_ID
    └── format.ts                         ← tambah formatCompactRupiah()
```

---

## Execution Order (10 Steps)

### Step 1 — Shared Utils (AMAN, zero risk) ✅ Mulai dari sini

- `shared/lib/avatar.ts` — avatarColor, getInitials
- `shared/lib/greeting.ts` — getGreeting, DAYS_ID, MONTHS_ID
- `shared/lib/format.ts` — tambah formatCompactRupiah

### Step 2 — Constants

- `features/dashboard/constants/overview/booking-status.ts` — STATUS_META lengkap
- `features/dashboard/constants/overview/mock-data.ts` — DUMMY_BOOKINGS, MOCK_SERVICES, dll

### Step 3 — Types

- Update/extend `features/dashboard/types/dashboard.types.ts`
- Tambah: `ServiceData`, `MockService`, `MockProduct`, `VisitorTab`, `PromoData`

### Step 4 — Services

- `features/dashboard/services/booking.service.ts`
  - `confirmBooking(id)`
  - `declineBooking(id, reason)`
  - `deleteBooking(id)`
  - `processPayment(id, data)`
  - `uploadProof(file)` → returns URL

### Step 5 — Hook: use-booking-list

State yang dipindah: visitorTab, visitorSearch, sortOrder, expandedId, frozenOrder,
effectiveBookings, filteredVisitors, visitorCounts, pendingConfirmCount, manualBookings,
bookingStatusMap, paymentStatusMap, deletedIds

### Step 6 — Hook: use-booking-actions

State yang dipindah: addOnsMap, notesMap, serviceMap, additionalServicesMap,
editServiceId, showServicePicker, showProductPicker, serviceSearchQuery, productSearchQuery,
promoInputMap, promoMap, paymentAmountMap, paymentMethodMap, paymentError,
pelunasanProofMap, uploadingProof, confirmDialog, declineDialog, declineReason,
showWANotif, waBookingData, confirmingId, loadingBookingId, deleteConfirm,
frozenOrder, confirmingId

### Step 7 — Hook: use-walk-in-flow

State yang dipindah: addDrawer, addDropdownOpen, walkInForm, expandedStylistSlots,
bookingCodeInput, drawerServiceSearch, drawerServiceOpen, barcodeScannerActive,
isMobile, videoRef, canvasRef, scannerIntervalRef

### Step 8 — Components: Atoms + Dialogs (kecil, aman)

- Semua dialogs (5 file kecil)
- MobileBookingCard

### Step 9 — Components: Organisms (besar)

- StatCardsRow
- BookingTableHeader
- BookingRow
- BookingDetailPanel (+ 3 sub-columns)
- PaymentSection
- WalkInDrawer
- MobileDetailPanel

### Step 10 — Slim page.tsx

- Hapus semua yang sudah dipindah
- Compose hooks + components
- Target: < 200 baris

---

## Documentation Standard

Setiap file yang dibuat wajib punya header comment:

```ts
/**
 * @responsibility
 * [Jelaskan apa yang dilakukan file ini]
 *
 * @usedBy
 * [Siapa yang pakai file ini]
 *
 * @notes
 * [Hal penting yang perlu diketahui]
 */
```

---

## Aturan Tambahan

- Tidak ada function > 30 baris di page.tsx
- Tidak ada inline style={{}} di komponen baru — gunakan Tailwind tokens
- Tidak ada magic hex color — gunakan token dari tailwind.config.ts atau shared/lib/tokens.ts
- Tidak ada `any` type
- Setiap komponen: props typed dengan interface
- Visual IDENTIK dengan sebelum refactor

---

## Progress Tracking

| Step                     | Status | Branch              | PR  |
| ------------------------ | ------ | ------------------- | --- |
| 1 - Shared Utils         | 🔜     | feat/clean-overview | -   |
| 2 - Constants            | 🔜     | feat/clean-overview | -   |
| 3 - Types                | 🔜     | feat/clean-overview | -   |
| 4 - Services             | 🔜     | feat/clean-overview | -   |
| 5 - use-booking-list     | 🔜     | feat/clean-overview | -   |
| 6 - use-booking-actions  | 🔜     | feat/clean-overview | -   |
| 7 - use-walk-in-flow     | 🔜     | feat/clean-overview | -   |
| 8 - Dialogs + MobileCard | 🔜     | feat/clean-overview | -   |
| 9 - Organisms            | 🔜     | feat/clean-overview | -   |
| 10 - Slim page.tsx       | 🔜     | feat/clean-overview | -   |
