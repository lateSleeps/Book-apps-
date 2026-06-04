# Component Inventory — Firalink Owner Dashboard

> Status: ✅ Sudah ada | 🔨 Perlu dibuat | ⚠️ Ada tapi perlu refactor

---

## Atoms

| Komponen               | Status               | File                                                                                 |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| Button                 | ✅ Sudah ada         | `shared/components/ui/button/Button.tsx`                                             |
| Input                  | ✅ Sudah ada         | `shared/components/ui/input/Input.tsx`                                               |
| Card                   | ✅ Sudah ada         | `shared/components/ui/card/Card.tsx`                                                 |
| ErrorMessage           | ✅ Sudah ada         | `shared/components/ui/error-message/`                                                |
| Skeleton / SkeletonRow | ✅ Sudah ada         | `components/SkeletonLoader.tsx`                                                      |
| `<Eyebrow>`            | 🔨 Perlu dibuat      | `shared/components/ui/eyebrow/Eyebrow.tsx`                                           |
| `<Avatar>`             | 🔨 Perlu dibuat      | `shared/components/ui/avatar/Avatar.tsx`                                             |
| `<BookingStatusBadge>` | ⚠️ Ada di fitur lain | `features/dashboard/components/booking-status-badge/BookingStatusBadge.tsx` → review |
| `<PaymentStatusBadge>` | 🔨 Perlu dibuat      | `shared/components/ui/badge/PaymentStatusBadge.tsx`                                  |
| `<VisitorTypeBadge>`   | 🔨 Perlu dibuat      | `shared/components/ui/badge/VisitorTypeBadge.tsx`                                    |
| `<NotifDot>`           | 🔨 Perlu dibuat      | `shared/components/ui/badge/NotifDot.tsx`                                            |
| `<SkeletonButtonPair>` | 🔨 Perlu dibuat      | `components/SkeletonLoader.tsx` (tambahkan)                                          |

---

## Molecules

| Komponen                  | Status                                | File Target                                                        |
| ------------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `<StatCard>`              | ⚠️ Ada di overview, perlu extract     | `features/dashboard/components/overview/StatCard.tsx`              |
| `<SegmentedTabs>`         | ⚠️ Inline di overview                 | `features/dashboard/components/overview/SegmentedTabs.tsx`         |
| `<SearchBar>`             | ⚠️ Inline di overview                 | `shared/components/ui/search/SearchBar.tsx`                        |
| `<BookingRowCollapsed>`   | ⚠️ Inline di overview (sangat besar)  | `features/dashboard/components/overview/BookingRowCollapsed.tsx`   |
| `<PaymentMethodSelector>` | ⚠️ Inline di overview                 | `features/dashboard/components/overview/PaymentMethodSelector.tsx` |
| `<ProofImageUpload>`      | ⚠️ Inline di overview                 | `features/dashboard/components/overview/ProofImageUpload.tsx`      |
| `<ServicePicker>`         | ⚠️ Inline di overview (search + list) | `features/dashboard/components/overview/ServicePicker.tsx`         |

---

## Organisms

| Komponen                | Status                | File Target                                                      |
| ----------------------- | --------------------- | ---------------------------------------------------------------- |
| `<StatCardsRow>`        | ⚠️ Inline di overview | `features/dashboard/components/overview/StatCardsRow.tsx`        |
| `<BookingTableHeader>`  | ⚠️ Inline di overview | `features/dashboard/components/overview/BookingTableHeader.tsx`  |
| `<BookingTable>`        | ⚠️ Inline di overview | `features/dashboard/components/overview/BookingTable.tsx`        |
| `<BookingDetailPanel>`  | ⚠️ Inline di overview | `features/dashboard/components/overview/BookingDetailPanel.tsx`  |
| `<PaymentSection>`      | ⚠️ Inline di overview | `features/dashboard/components/overview/PaymentSection.tsx`      |
| `<WalkInDrawer>`        | ⚠️ Inline di overview | `features/dashboard/components/overview/WalkInDrawer.tsx`        |
| `<ConfirmationDialogs>` | ⚠️ Inline di overview | `features/dashboard/components/overview/ConfirmationDialogs.tsx` |
| `<WANotifDialog>`       | ⚠️ Inline di overview | `features/dashboard/components/overview/WANotifDialog.tsx`       |
| `<ProofZoomDialog>`     | ⚠️ Inline di overview | `features/dashboard/components/overview/ProofZoomDialog.tsx`     |
| `<MobileDetailPanel>`   | ⚠️ Inline di overview | `features/dashboard/components/overview/MobileDetailPanel.tsx`   |

---

## Hooks

| Hook                | Status               | File Target                                                |
| ------------------- | -------------------- | ---------------------------------------------------------- |
| `useDashboardData`  | ✅ Sudah ada + bagus | `features/dashboard/hooks/use-dashboard-data.ts`           |
| `useSalonSettings`  | ✅ Sudah ada         | `features/dashboard/hooks/use-salon-settings.ts`           |
| `useBookingList`    | 🔨 Perlu dibuat      | `features/dashboard/hooks/overview/use-booking-list.ts`    |
| `useBookingActions` | 🔨 Perlu dibuat      | `features/dashboard/hooks/overview/use-booking-actions.ts` |
| `useWalkInFlow`     | 🔨 Perlu dibuat      | `features/dashboard/hooks/overview/use-walk-in-flow.ts`    |

---

## Shared Lib

| Fungsi                | Status                  | File Target                        |
| --------------------- | ----------------------- | ---------------------------------- |
| `formatRupiah`        | ✅ Sudah ada            | `shared/lib/format.ts`             |
| `formatCompactRupiah` | ⚠️ Duplikat di overview | Pindah ke `shared/lib/format.ts`   |
| `avatarColor`         | ⚠️ Inline di overview   | Pindah ke `shared/lib/avatar.ts`   |
| `getInitials`         | ⚠️ Inline di overview   | Pindah ke `shared/lib/avatar.ts`   |
| `getGreeting`         | ⚠️ Inline di overview   | Pindah ke `shared/lib/greeting.ts` |
| Token constants       | 🔨 Perlu dibuat         | `shared/lib/tokens.ts`             |

---

## Mock / Dev Data (perlu dipindah dari page ke packages)

| Data             | Status         | Target                                     |
| ---------------- | -------------- | ------------------------------------------ |
| `DUMMY_BOOKINGS` | ⚠️ Di overview | `packages/mock-data/src/bookings/dummy.ts` |
| `MOCK_SERVICES`  | ⚠️ Di overview | `packages/mock-data/src/bookings/dummy.ts` |
| `MOCK_PRODUCTS`  | ⚠️ Di overview | `packages/mock-data/src/bookings/dummy.ts` |
| `PROMO_CODES`    | ⚠️ Di overview | `packages/mock-data/src/bookings/dummy.ts` |
