# Overview Module — Refactor History

> Historical record of the Step 10–11 refactor on branch `feat/clean-overview`.
> Base commit: `193c64f` (restored OverviewHeader + AddVisitDropdown post-rollback)

---

## Background

The overview module originally lived in a single `page.tsx` file that grew to **5,791 lines**. It contained all state, business logic, UI components, and inline styles in one monolithic file. This made it impossible to:

- Review individual changes without reading 5,000+ lines
- Test individual concerns in isolation
- Apply design-system standards consistently
- Onboard new developers

The Step 10–11 refactor decomposed it into a layered architecture over multiple sessions.

---

## Step 10 — Component and Hook Extraction

**Goal:** Reduce `page.tsx` to an orchestration shell; extract all business logic into hooks and all UI into components.

### Phase 10.1–10.3: Type and data infrastructure

Created:

- `types/overview.types.ts` — `VisitorTab`, `WalkInFormData`, `ConfirmPaymentDialogData`, `ServiceData`, `PromoData`, etc.
- `constants/overview/booking-status.ts` — `BOOKING_STATUS_META`, `PAYMENT_STATUS_META`, `VISITOR_TYPE_META`, `UPCOMING_NOTIF_COLOR`
- `constants/overview/mock-data.ts` — `MOCK_SERVICES`, `MOCK_PRODUCTS`
- `utils/booking-list.utils.ts` — `buildEffectiveBookings()`, `filterBookings()`, `sortBookings()`, `countByTab()`
- `shared/lib/avatar.ts` — `avatarColor()`, `getInitials()`
- `shared/lib/greeting.ts` — `getGreeting()`

### Phase 10.4–10.7: Hook extraction

Extracted 7 domain hooks from `page.tsx`:

- `use-booking-list.ts` — filter, sort, expand, optimistic overrides
- `use-booking-detail.ts` — service edit, add-on, product picker, notes
- `use-booking-payment.ts` — payment dialog, proof upload, settlement
- `use-booking-promo.ts` — promo input, apply, remove
- `use-booking-status.ts` — confirm, decline, delete, dialog state machines
- `use-walk-in-flow.ts` — walk-in form, barcode scanner, drawer
- `use-dashboard-ui.ts` — mobile flag, greeting, expanded row

Created `use-overview-controller.ts` to compose all hooks.

### Component extraction

Extracted from `page.tsx`:

- `OverviewHeader.tsx`
- `AddVisitDropdown.tsx`
- `OverviewBookingList.tsx`
- `OverviewDialogs.tsx`
- `BookingDetailPanel.tsx`
- `PaymentSection.tsx`, `PaymentStatusCard.tsx`, `PaymentInputCard.tsx`
- `WalkInDrawer.tsx` + sub-components
- `StatCardsRow.tsx`
- `BookingRow.tsx`, `BookingTableHeader.tsx`
- `dialogs/` — 5 dialog components
- `mobile/` — `MobileBookingList`, `MobileBookingCard`, `MobileDetailSheet`

**Result:** `page.tsx` reduced from 5,791 → 61 lines.

### Key commits (Step 10)

```
1899c9a  refactor(owner): step 10.4–10.7 overview page cleanup
193c64f  fix: restore OverviewHeader and AddVisitDropdown missing from rollback
```

---

## Step 11 V3 — Structural Debt Reduction

**Goal:** Reduce duplicated code and structural debt without changing any visual output.

### Batch 1: BookingTableHeader control button constants

Extracted `CTRL_BTN_BASE` constant for the shared 6-property style object duplicated across Refresh and Sort buttons.

```
bb1e98a  refactor(owner): v3 batch-1 extract ctrl button style constants
```

### Batch 2: PaymentStatusCard proof view button

Extracted `ProofViewButton` internal component to eliminate 2 identical `<button><svg/>label</button>` blocks for "Lihat bukti DP" and "Lihat bukti pelunasan".

```
8c8a115  refactor(owner): v3 batch-2 extract ProofViewButton component
```

### Batch 3: BookingRow grid style constant

Extracted `ROW_GRID_STYLE` constant (`display: grid`, `gridTemplateColumns: GRID`, `columnGap: 20`, `alignItems: center`) shared by `BookingRowColumnHeaders` and `BookingRow`.

```
8fc446e  refactor(owner): v3 batch-4 extract ROW_GRID_STYLE constant
```

### Batch 4: PickerSearchRow extraction

Extracted `PickerSearchRow` internal component shared by service picker and product picker (both previously 41 lines of identical JSX).

```
eb2232a  refactor(owner): v3 batch-6 extract PickerSearchRow component
```

### Batch 5: AddItemButton + PICKER_PANEL_CLASS

Extracted `AddItemButton` internal component (identical "Tambah layanan" and "Tambah add-on" buttons, 29 lines each → 1 component).
Extracted `PICKER_PANEL_CLASS` constant (70-char className used in both picker containers).

```
249614b  refactor(owner): consolidate final duplicated picker patterns
```

---

## Design System Enforcement

**Goal:** Replace hardcoded visual values with design tokens wherever an exact match exists.

### Tailwind token restoration

Restored 3 tokens lost in a prior rollback when the original Step 11 branch was abandoned:

- `bg-hover: '#F5F5F7'`
- `ts-t14: ['0.875rem', { lineHeight: '1.5' }]`
- `dropdown: '0 8px 32px rgba(0,0,0,0.14)'` (boxShadow)

```
ef8c61e  fix(owner): restore AddVisitDropdown and missing tokens post-rollback
```

### Shadow token enforcement

Replaced all inline `boxShadow` values with named tokens:

- `0 2px 8px rgba(0,0,0,0.06)` → `shadow-card` (StatCardsRow, PaymentStatusCard)
- `-8px 0 48px rgba(0,0,0,0.18)` → `shadow-drawer` (WalkInDrawer)
- `0 8px 32px rgba(0,0,0,0.14)` → `shadow-dropdown` (AddVisitDropdown, BookingDetailPanel)
- Service picker dropdown: `shadow-dropdown` added (previously inline only)

### Radius token enforcement

Replaced Tailwind default radius classes with design-system tokens:

- `rounded-xl` → `rounded-r12` (all overview files)
- `rounded-lg` → `rounded-r8`
- `rounded-full` → `rounded-rF`

Files affected: `BookingDetailPanel`, `BookingCodeSection`, `AddVisitFAB`, `BookingTableHeader`, `BarcodeScanner`, `ProofZoomDialog`.

### Color token migration

Replaced exact-match hardcoded colors with design tokens:

- `text-[#555]` × 8 → `text-tx-subtle` (BookingDetailPanel)
- `text-[#1a1a1a]` × 6 → `text-tx-body` (BookingDetailPanel, AddVisitFAB, BookingCodeSection)
- `bg-[#1a1a1a]` × 2 → `bg-tx-body` (AddVisitFAB, BookingCodeSection)
- `bg-[#fafaf8]` → `bg-bg-surface` (BookingDetailPanel, BookingCodeSection, BookingRow)
- `hover:bg-[#fafaf8]` → `hover:bg-bg-surface` (multiple files)
- `hover:bg-[#fef2f2]` / `hover:bg-red-50` → `hover:bg-st-cancelled-bg`
- `hover:text-[#ef4444]` → `hover:text-st-cancelled`
- `background: '#C7C7CC'` → `className="bg-tx-muted"` (clear-search button)
- `BoxShadow` inline styles migrated to token classes (see above)

Inline colors in ternary expressions and event handlers were intentionally left unchanged (they cannot be migrated without touching business logic).

```
e6d6d35  feat(owner): replace exact-match color values with design tokens
0362da8  feat(owner): enforce design system tokens and phosphor icons
```

---

## Icon Standardization

**Goal:** All dialog and drawer icons use Phosphor with `weight="duotone"`. WA brand icon is the only approved exception.

### Dialog icon migration

Replaced all inline SVG icon functions in dialog files with Phosphor:

| File                       | Replaced                           | With             |
| -------------------------- | ---------------------------------- | ---------------- |
| `ConfirmBookingDialog.tsx` | `CheckIcon()`, `ImageUploadIcon()` | `Check`, `Image` |
| `DeclineBookingDialog.tsx` | `XIcon()`                          | `X`              |
| `WANotificationDialog.tsx` | `CheckIcon()`                      | `Check`          |
| `DeleteBookingDialog.tsx`  | `TrashIcon()`                      | `Trash`          |
| `ProofZoomDialog.tsx`      | inline SVG close                   | `X`              |
| `DialogHeader.tsx`         | inline SVG close button            | `X`              |
| `WalkInDrawer.tsx`         | inline SVG close button            | `X`              |

WAIcon (WhatsApp logo SVG) was kept in `DeclineBookingDialog` and `WANotificationDialog` as an approved brand exception.

### BookingTableHeader migration

Replaced Heroicons with Phosphor:

- `MagnifyingGlassIcon` → `MagnifyingGlass`
- `XMarkIcon` → `X`
- `ArrowPathIcon` → `ArrowClockwise`

### BookingDetailPanel migration

Replaced Heroicons with Phosphor:

- `CheckIcon` → `Check` (Konfirmasi button)
- `MagnifyingGlassIcon` → `MagnifyingGlass` (proof zoom hover overlay)

```
94e8b10  feat(owner): standardize dialog icons with phosphor duotone
0362da8  feat(owner): enforce design system tokens and phosphor icons
```

---

## Simplification Pass

**Goal:** Remove redundant code identified by automated `/simplify` review.

### AddVisitDropdown

- Removed `@heroicons/react` dependency entirely → replaced `PlusIcon` with Phosphor `Plus`
- Extracted `openDrawerAndReset(type)` helper (eliminated 3 duplicate setter calls in both `openWalkIn` and `openBooking`)
- Removed dead `display: 'block'` from outer wrapper style prop; moved `position: relative` + `flexShrink: 0` to Tailwind className (now `className="relative hidden shrink-0 sm:block"`)

### BookingDetailPanel

- `AddItemButton` inline SVG `+` → Phosphor `Plus size={11} weight="duotone"` (added to existing import)
- `PickerSearchRow` inline SVG search → already-imported `MagnifyingGlass size={13} weight="duotone"`

### StatCardsRow

- Double `.filter().length` passes for `completedCount` and `cancelledCount` → single `for` loop (one O(n) pass instead of two)

```
80cf874  refactor(owner): simplify — phosphor icons, helpers, single-pass counts
```

---

## Known Remaining Technical Debt

### Not yet addressed (by design)

| Item                                                                | Reason Deferred                                                                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `AddVisitFAB` inline SVG icons                                      | FAB uses different visual scale (13px custom) than `AddVisitDropdown` (Phosphor 20px); combining requires design decision |
| `BookingDetailPanel` service/product picker inline SVG sort chevron | `BookingTableHeader` sort icon is bespoke dual-arrow; not a standard Phosphor icon                                        |
| `PaymentInputCard` inline SVGs                                      | Contained scope, low priority                                                                                             |
| `#f0f0ee`, `#e0e0e0`, `#444` hardcoded colors                       | No exact token equivalents; await Phase 12 token planning                                                                 |
| `shadow-[0_8px_24px_rgba(0,0,0,0.12)]` in picker panels             | Differs from `shadow-dropdown` (0.12 vs 0.14); needs `shadow-picker` token decision                                       |
| `MOCK_SERVICES`, `MOCK_PRODUCTS` in `BookingDetailPanel`            | Placeholder until Settings API is wired; filter runs on every render                                                      |
| `BookingStatusBadge` legacy component                               | Uses old token system (`bg-c-blue` etc.); not used by any overview component — should be deleted or rewritten             |

---

## Final State

After all refactor phases, the overview module has:

- `page.tsx`: 61 lines (was 5,791)
- 7 domain hooks, each owning a single concern
- 1 controller composing all hooks
- 25+ extracted components with clear responsibilities
- 5 shared dialog primitives reused across all dialogs
- Full design-system token compliance for all exact-match values
- Phosphor duotone as the sole icon standard (with 1 approved WA exception)
