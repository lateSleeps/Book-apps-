# Refactor Plan: overview/page.tsx (5.791 baris → ~100 baris)

## Prinsip

- Satu PR per langkah — behavior IDENTIK, tidak ada perubahan UI/logic
- Setiap file baru harus TypeScript strict, tidak ada `any`
- Gunakan token Tailwind yang sudah ada (label, label2, sep, s8, r12, dll)
- Tidak ada inline `style={{}}` di komponen baru

---

## Step 1 — Pindahkan data hardcode ke packages (½ hari)

### Buat: `packages/mock-data/src/bookings/dummy.ts`

```
DUMMY_BOOKINGS  → pindah dari overview/page.tsx
MOCK_SERVICES   → pindah dari overview/page.tsx
MOCK_PRODUCTS   → pindah dari overview/page.tsx
PROMO_CODES     → pindah dari overview/page.tsx
```

### Buat: `packages/mock-data/src/bookings/index.ts`

Re-export semua dari dummy.ts

### Update: `packages/mock-data/src/index.ts`

Tambah export bookings

---

## Step 2 — Pindahkan utility functions ke shared lib (½ hari)

### Buat: `apps/owner/src/shared/lib/avatar.ts`

```ts
export function avatarColor(name: string): { bg: string; text: string };
export function getInitials(name: string): string;
export const AVATAR_BG_COLORS: string[];
```

### Buat: `apps/owner/src/shared/lib/greeting.ts`

```ts
export function getGreeting(): string;
export const DAYS_ID: string[];
export const MONTHS_ID: string[];
```

### Update: `apps/owner/src/shared/lib/format.ts` (sudah ada)

Tambahkan `formatCompactRupiah` (sekarang duplikat di page)

---

## Step 3 — Extract hooks (1 hari)

### Buat: `features/dashboard/hooks/overview/use-booking-list.ts`

State yang dipindah:

- visitorTab, visitorSearch, sortOrder
- expandedId, frozenOrder
- effectiveBookings, filteredVisitors (useMemo)
- visitorCounts, pendingConfirmCount (useMemo)
- manualBookings, bookingStatusMap, paymentStatusMap, deletedIds

Return:

```ts
{
  filteredVisitors, visitorCounts, pendingConfirmCount,
  visitorTab, setVisitorTab,
  visitorSearch, setVisitorSearch,
  sortOrder, setSortOrder,
  expandedId, toggleExpand,
  // dll
}
```

### Buat: `features/dashboard/hooks/overview/use-booking-actions.ts`

State yang dipindah:

- addOnsMap, notesMap, serviceMap, additionalServicesMap
- editServiceId, showServicePicker, showProductPicker
- serviceSearchQuery, productSearchQuery
- promoInputMap, promoMap
- paymentAmountMap, paymentMethodMap
- paymentError, pelunasanProofMap, uploadingProof
- confirmDialog, declineDialog, declineReason
- showWANotif, waBookingData, confirmingId
- loadingBookingId, deleteConfirm

Fungsi yang dipindah:

- removeAddOn, addProductToBooking, changeService, addService
- applyPromo, removePromo, removeAdditionalService
- toggleExpand (partial)

### Buat: `features/dashboard/hooks/overview/use-walk-in-flow.ts`

State yang dipindah:

- addDrawer, addDropdownOpen
- walkInForm, expandedStylistSlots
- bookingCodeInput, drawerServiceSearch, drawerServiceOpen
- barcodeScannerActive (+ refs: videoRef, canvasRef, scannerIntervalRef)
- isMobile

Fungsi:

- startBarcodeScanner, stopBarcodeScanner, detectBarcodePattern

---

## Step 4 — Extract komponen JSX (2 hari)

### Buat: `features/dashboard/components/overview/StatCards.tsx`

- 4 stat cards: Pendapatan, Booking, Selesai, Pembatalan
- Props: `stats: DashboardStats`
- Tidak ada state

### Buat: `features/dashboard/components/overview/BookingTableHeader.tsx`

- Tab filter (Semua/Booking/Walk-in/Selesai) + badge count
- Search input
- Sort button
- Add button + dropdown
- Props dari use-booking-list

### Buat: `features/dashboard/components/overview/BookingRow.tsx`

- Satu baris booking (avatar, nama, status, layanan, stylist, waktu, tipe)
- Expand toggle
- Props: `booking`, `isExpanded`, `onToggle`

### Buat: `features/dashboard/components/overview/BookingDetailPanel.tsx`

- Panel detail saat row di-expand
- Nomor HP, Chat WA
- Bukti pembayaran
- Layanan + add service
- Product add-on
- Konfirmasi/Tolak buttons (+ skeleton)
- Payment section
- Props dari use-booking-actions

### Buat: `features/dashboard/components/overview/PaymentSection.tsx`

- Status pembayaran (progress bar)
- Input pembayaran (Cash/Transfer/QRIS)
- Bukti pelunasan upload
- Tombol selesai
- Dipecah dari BookingDetailPanel karena kompleks

### Buat: `features/dashboard/components/overview/WalkInDrawer.tsx`

- Drawer + form walk-in
- Barcode scanner
- Dipindah dari page (sekarang ~600 baris di page)
- Props dari use-walk-in-flow

### Buat: `features/dashboard/components/overview/ConfirmationDialogs.tsx`

- Dialog konfirmasi payment
- Dialog decline/tolak
- Dialog delete
- Props dari use-booking-actions

### Buat: `features/dashboard/components/overview/WANotifDialog.tsx`

- Popup WA setelah konfirmasi
- Props: showWANotif, waBookingData, onClose

### Buat: `features/dashboard/components/overview/ProofZoomDialog.tsx`

- Modal zoom bukti pembayaran
- Props: proofZoom, onClose

---

## Step 5 — Hasil akhir overview/page.tsx (~80 baris)

```tsx
"use client";

import { StatCards } from "@/features/dashboard/components/overview/StatCards";
import { BookingTableHeader } from "@/features/dashboard/components/overview/BookingTableHeader";
import { BookingRow } from "@/features/dashboard/components/overview/BookingRow";
import { BookingDetailPanel } from "@/features/dashboard/components/overview/BookingDetailPanel";
import { WalkInDrawer } from "@/features/dashboard/components/overview/WalkInDrawer";
import { ConfirmationDialogs } from "@/features/dashboard/components/overview/ConfirmationDialogs";
import { WANotifDialog } from "@/features/dashboard/components/overview/WANotifDialog";
import { ProofZoomDialog } from "@/features/dashboard/components/overview/ProofZoomDialog";
import { useBookingList } from "@/features/dashboard/hooks/overview/use-booking-list";
import { useBookingActions } from "@/features/dashboard/hooks/overview/use-booking-actions";
import { useWalkInFlow } from "@/features/dashboard/hooks/overview/use-walk-in-flow";
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard-data";

export default function OverviewPage() {
  const data = useDashboardData();
  const list = useBookingList(data);
  const actions = useBookingActions(data);
  const walkIn = useWalkInFlow();

  return (
    <>
      <StatCards stats={data.stats} />

      <div className="...">
        <BookingTableHeader list={list} walkIn={walkIn} />

        {list.filteredVisitors.map((b) => (
          <BookingRow
            key={b.id}
            booking={b}
            isExpanded={list.expandedId === b.id}
            onToggle={() => list.toggleExpand(b.id)}
          >
            <BookingDetailPanel booking={b} actions={actions} />
          </BookingRow>
        ))}
      </div>

      <WalkInDrawer {...walkIn} />
      <ConfirmationDialogs {...actions} />
      <WANotifDialog {...actions} />
      <ProofZoomDialog {...actions} />
    </>
  );
}
```

---

## Urutan PR

| PR    | Isi                                      | Estimasi |
| ----- | ---------------------------------------- | -------- |
| PR-1  | Step 1: Mock data ke packages            | ½ hari   |
| PR-2  | Step 2: Utility functions ke shared/lib  | ½ hari   |
| PR-3  | Step 3a: use-booking-list hook           | ½ hari   |
| PR-4  | Step 3b: use-booking-actions hook        | ½ hari   |
| PR-5  | Step 3c: use-walk-in-flow hook           | ½ hari   |
| PR-6  | Step 4a: StatCards + BookingTableHeader  | ½ hari   |
| PR-7  | Step 4b: BookingRow + BookingDetailPanel | ½ hari   |
| PR-8  | Step 4c: PaymentSection                  | ½ hari   |
| PR-9  | Step 4d: WalkInDrawer                    | ½ hari   |
| PR-10 | Step 4e: Semua dialogs                   | ½ hari   |
| PR-11 | Step 5: overview/page.tsx compose        | ½ hari   |

**Total estimasi: 5–6 hari kerja**

---

## Aturan selama refactor

1. Jalankan `pnpm type-check` setelah setiap step
2. Cek visual di browser — behavior harus identik
3. Jangan optimasi/ubah logic selama refactor — fokus PINDAHKAN saja
4. Setiap komponen: hapus inline style → ganti Tailwind tokens yang ada
