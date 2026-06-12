# Booking App — Implementation Plan

**Tanggal:** 2026-06-12
**Status:** Locked. Implementation dapat dimulai langsung.
**Sumber:** `BOOKING_APP_IA_V3.md` + `BOOKING_APP_COMPONENT_REVIEW.md`

---

## 1. Files to Create

### 1.1 Type Contract

```
apps/owner/src/features/dashboard/components/settings/types/booking-app.types.ts
```

Pola dari: `operational.types.ts` (struktur, komentar, export pattern identik).

Isi:

```typescript
// booking-app.types.ts
// Canonical source of truth for Booking App domain.
// All controller, component, and tRPC code must import from this file.
// No duplicate type definitions allowed elsewhere.

export type PaymentMethod = "qris" | "transfer" | "cash";

export type ConfirmationMode = "auto" | "manual";

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isActive: boolean;
}

export type AuditAction =
  | "qris_uploaded"
  | "qris_replaced"
  | "qris_removed"
  | "bank_account_added"
  | "bank_account_edited"
  | "bank_account_removed"
  | "payment_method_changed";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actor: string; // user ID
  actorRole: "OWNER";
  timestamp: string; // ISO string
  metadata?: Record<string, string>;
}

export interface BookingAppSettings {
  paymentMethods: PaymentMethod[];
  qrisImageUrl: string | null;
  bankAccounts: BankAccount[];
  confirmationMode: ConfirmationMode;
  salonPolicy: string | null; // plain text, max 500 chars
}

export const DEFAULT_BOOKING_APP_SETTINGS: BookingAppSettings = {
  paymentMethods: ["qris", "transfer"],
  qrisImageUrl: null,
  bankAccounts: [],
  confirmationMode: "auto",
  salonPolicy: null,
};
```

---

### 1.2 Domain Controller

```
apps/owner/src/features/dashboard/hooks/settings/useBookingAppController.ts
```

Pola dari: `useOperationalController.ts` (useState, useCallback, interface export).

```typescript
export interface BookingAppController {
  settings: BookingAppSettings;
  auditLog: AuditLogEntry[];
  // Payment methods
  setPaymentMethod: (method: PaymentMethod, active: boolean) => void;
  // QRIS — OWNER only. Caller must verify role before invoking.
  setQrisImageUrl: (url: string | null, actorId: string) => void;
  // Bank accounts — OWNER only.
  addBankAccount: (account: Omit<BankAccount, "id">, actorId: string) => void;
  updateBankAccount: (
    id: string,
    patch: Partial<Omit<BankAccount, "id">>,
    actorId: string,
  ) => void;
  removeBankAccount: (id: string, actorId: string) => void;
  // Confirmation + policy — OWNER or ADMIN.
  setConfirmationMode: (mode: ConfirmationMode) => void;
  setSalonPolicy: (text: string | null) => void;
}
```

Mock seed: seeded dari `DEFAULT_BOOKING_APP_SETTINGS`.
`auditLog`: `useState<AuditLogEntry[]>([])` — in-memory, tidak persistent.
`actorId`: diambil dari mock current user (pola `CURRENT_USER_ID = 'owner-001'` dari `usePenggunaController.ts`).

Permission enforcement dalam controller:

- `setQrisImageUrl`, `addBankAccount`, `updateBankAccount`, `removeBankAccount` — tidak menerima non-OWNER call. Jika Phase 1 tidak ada real auth, `actorId` selalu 'owner-001' dan role check selalu lolos. Check tetap ditulis untuk Phase 2 compatibility.
- `setConfirmationMode`, `setSalonPolicy` — tidak ada permission check di Phase 1.

---

### 1.3 Page Client

```
apps/owner/src/features/dashboard/components/settings/components/booking-app/BookingAppPageClient.tsx
```

Pola dari: `OperationalPageClient.tsx` (SheetState union, inline sheets, inline sections).

`SheetState`:

```typescript
type SheetState =
  | { kind: "qris-upload" }
  | { kind: "qris-replace-confirm" }
  | { kind: "add-bank" }
  | { kind: "edit-bank"; id: string }
  | { kind: "confirmation" }
  | { kind: "policy" }
  | null;
```

Draft state:

```typescript
// Bank account drafts
const [draftBankName, setDraftBankName] = useState("");
const [draftAccountNumber, setDraftAccountNumber] = useState("");
const [draftAccountHolder, setDraftAccountHolder] = useState("");

// Policy draft
const [draftPolicy, setDraftPolicy] = useState("");

// QRIS preview (before save)
const [qrisPreviewUrl, setQrisPreviewUrl] = useState<string | null>(null);
const [qrisPendingFile, setQrisPendingFile] = useState<File | null>(null);
```

Sections dibangun inline — tidak ada sub-komponen terpisah. Pola identik dengan cara `OperationalPageClient` membangun policy rows.

---

### 1.4 ToggleSwitch

```
apps/owner/src/shared/components/ui/toggle-switch/ToggleSwitch.tsx
apps/owner/src/shared/components/ui/toggle-switch/index.ts
```

Pola dari: `segmented-control/` (folder dengan `index.ts` barrel export).

Interface:

```typescript
export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
  id?: string;
  className?: string;
}
```

Visual contract (untuk implementor):

- Track: `w-s40 h-s20 rounded-full` — gunakan token terdekat atau `w-10 h-5`
- Track ON: `bg-tx-primary`
- Track OFF: `bg-bd-card border border-bd-row`
- Thumb: `w-4 h-4 rounded-full bg-bg-card shadow-sm`
- Thumb translate ON: `translate-x-5`, OFF: `translate-x-0.5`
- Transition: `transition-all duration-150 ease-in-out`
- Disabled: `opacity-50 cursor-not-allowed pointer-events-none`
- Accessibility: `role="switch"` + `aria-checked={checked}` pada elemen utama

`index.ts`:

```typescript
export { ToggleSwitch } from "./ToggleSwitch";
export type { ToggleSwitchProps } from "./ToggleSwitch";
```

---

## 2. Files to Modify

### 2.1 SettingsUploadField — Tambah variant 'qris'

```
apps/owner/src/features/dashboard/components/settings/components/shared/SettingsUploadField.tsx
```

**Perubahan 1** — `UploadVariant` type (line 7):

```typescript
// Sebelum
export type UploadVariant = "logo" | "cover" | "avatar" | "addon";

// Sesudah
export type UploadVariant = "logo" | "cover" | "avatar" | "addon" | "qris";
```

**Perubahan 2** — `VARIANT_CONFIG` object, tambah entry `qris`:

```typescript
qris: {
  label: 'Foto QRIS',
  aspectClass: 'aspect-square',
  maxBytes: 5_242_880,   // 5MB
  hint: 'PNG atau JPG, maks 5MB. Pastikan kode QR terlihat jelas dan tidak buram.',
},
```

Tidak ada perubahan lain. Total: 2 edit, ~6 baris.

---

### 2.2 booking/page.tsx — Wire ke BookingAppPageClient

```
apps/owner/src/app/dashboard/settings/booking/page.tsx
```

```typescript
// Sesudah (replace seluruh isi)
import { BookingAppPageClient } from '@/features/dashboard/components/settings/components/booking-app/BookingAppPageClient';

export default function BookingPage() {
  return <BookingAppPageClient />;
}
```

---

## 3. New Shared Primitives

| File                | Path                                                 | Scope                                       |
| ------------------- | ---------------------------------------------------- | ------------------------------------------- |
| `ToggleSwitch.tsx`  | `apps/owner/src/shared/components/ui/toggle-switch/` | Seluruh owner app (bukan settings-only)     |
| `index.ts` (barrel) | `apps/owner/src/shared/components/ui/toggle-switch/` | Export `ToggleSwitch` + `ToggleSwitchProps` |

`ToggleSwitch` ditempatkan di `shared/components/ui/` karena akan dibutuhkan di luar Settings V2: Tim (staff active toggle), Layanan (service active toggle), Phase 2 promo (promo active toggle).

---

## 4. Existing Components to Reuse (Tanpa Perubahan)

| Komponen                | Import dari                  | Digunakan untuk                                  |
| ----------------------- | ---------------------------- | ------------------------------------------------ |
| `SettingsPageShell`     | `settings/layout`            | Wrapper halaman                                  |
| `SettingsSection`       | `settings/layout`            | Wrapper tiap section                             |
| `SettingsSectionHeader` | `settings/layout`            | Header Section A, B, C                           |
| `SettingsContentCard`   | `settings/layout`            | Card tiap section                                |
| `SettingsSideSheet`     | `settings/layout`            | Semua 4 sheet (qris, bank, confirmation, policy) |
| `SettingsFieldGroup`    | `settings/components/shared` | Wrapper label+input di dalam sheet               |
| `SettingsInput`         | `settings/components/shared` | Account number, account holder name              |
| `SettingsSelect`        | `settings/components/shared` | Bank name picker di sheet                        |
| `SettingsTextarea`      | `settings/components/shared` | salonPolicy textarea                             |
| `SettingsUploadField`   | `settings/components/shared` | Upload QRIS (variant `'qris'` — setelah extend)  |
| `SettingsAddButton`     | `settings/components/shared` | "Tambah Rekening" di Section A                   |
| `SettingsEmptyState`    | `settings/components/shared` | Empty state saat `bankAccounts` kosong           |
| `EntityActionMenu`      | `settings/components/shared` | Edit/hapus per bank account row                  |
| `ConfirmDialog`         | `settings/components/shared` | Konfirmasi ganti/hapus QRIS                      |

---

## 5. Controller Structure

```typescript
// useBookingAppController.ts

"use client";

import { useCallback, useState } from "react";
import type {
  AuditLogEntry,
  BankAccount,
  BookingAppSettings,
  ConfirmationMode,
  PaymentMethod,
} from "@/features/dashboard/components/settings/types/booking-app.types";
import { DEFAULT_BOOKING_APP_SETTINGS } from "@/features/dashboard/components/settings/types/booking-app.types";

const CURRENT_USER_ID = "owner-001"; // mock — Phase 2: dari Supabase auth session

export interface BookingAppController {
  settings: BookingAppSettings;
  auditLog: AuditLogEntry[];
  setPaymentMethod: (method: PaymentMethod, active: boolean) => void;
  setQrisImageUrl: (url: string | null, actorId: string) => void;
  addBankAccount: (account: Omit<BankAccount, "id">, actorId: string) => void;
  updateBankAccount: (
    id: string,
    patch: Partial<Omit<BankAccount, "id">>,
    actorId: string,
  ) => void;
  removeBankAccount: (id: string, actorId: string) => void;
  setConfirmationMode: (mode: ConfirmationMode) => void;
  setSalonPolicy: (text: string | null) => void;
}

export function useBookingAppController(): BookingAppController {
  const [settings, setSettings] = useState<BookingAppSettings>(
    DEFAULT_BOOKING_APP_SETTINGS,
  );
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  // helpers: appendAudit(action, actorId, metadata?)
  // setPaymentMethod: toggle method in/out of array, append audit
  // setQrisImageUrl: set url, determine action ('uploaded'|'replaced'|'removed'), append audit
  // addBankAccount: crypto.randomUUID() for id, append to array, append audit
  // updateBankAccount: map over array, patch matched id, append audit
  // removeBankAccount: filter out id, append audit
  // setConfirmationMode: direct set
  // setSalonPolicy: trim + null if empty string

  // ... (implementor fills in)

  return {
    settings,
    auditLog,
    setPaymentMethod,
    setQrisImageUrl,
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    setConfirmationMode,
    setSalonPolicy,
  };
}
```

---

## 6. Type Structure

```
booking-app.types.ts
  ├── PaymentMethod            'qris' | 'transfer' | 'cash'
  ├── ConfirmationMode         'auto' | 'manual'
  ├── BankAccount              { id, bankName, accountNumber, accountHolderName, isActive }
  ├── AuditAction              union of 6 string literals
  ├── AuditLogEntry            { id, action, actor, actorRole, timestamp, metadata? }
  ├── BookingAppSettings       { paymentMethods, qrisImageUrl, bankAccounts,
  │                              confirmationMode, salonPolicy }
  └── DEFAULT_BOOKING_APP_SETTINGS
```

Semua import di `BookingAppPageClient.tsx` dan `useBookingAppController.ts` harus bersumber dari file ini. Tidak ada type yang didefinisikan ulang di file lain.

---

## 7. Mock Data Ownership

| Data                       | Owner                        | Value                                          |
| -------------------------- | ---------------------------- | ---------------------------------------------- |
| `paymentMethods` default   | `booking-app.types.ts`       | `['qris', 'transfer']`                         |
| `qrisImageUrl` default     | `booking-app.types.ts`       | `null`                                         |
| `bankAccounts` default     | `booking-app.types.ts`       | `[]`                                           |
| `confirmationMode` default | `booking-app.types.ts`       | `'auto'`                                       |
| `salonPolicy` default      | `booking-app.types.ts`       | `null`                                         |
| Current user ID mock       | `useBookingAppController.ts` | `'owner-001'`                                  |
| Current user role mock     | `useBookingAppController.ts` | `'OWNER'` (hardcoded Phase 1)                  |
| QRIS confirmation timeout  | `useBookingAppController.ts` | Hardcoded 60 menit (tidak dikonfigurasi owner) |
| Slot reservation timeout   | `useBookingAppController.ts` | Tidak ada — bukan domain ini                   |

Tidak ada file mock data terpisah. Semua seed berasal dari `DEFAULT_BOOKING_APP_SETTINGS` dan konstanta lokal di controller.

---

## 8. Phase 2 Exclusions

Field dan fitur berikut **tidak diimplementasikan** dan **tidak ada placeholder UI** untuk mereka:

| Item                                     | Alasan                                                            |
| ---------------------------------------- | ----------------------------------------------------------------- |
| QRIS upload nyata ke Supabase Storage    | Butuh bucket `qris-images` + signed URL generation + RLS          |
| Audit log ke database                    | Butuh tabel `audit_logs` di Supabase                              |
| RLS-level permission QRIS/bank           | Phase 1: controller-level check cukup                             |
| Payment gateway (Midtrans/Xendit/Duitku) | Tidak ada di V1. Tidak ada toggle, tidak ada field.               |
| Promo codes                              | Butuh `validatePromoCode(salonId, code)` di customer app          |
| Deposit configuration                    | Dipindah ke domain Layanan (per-service) — bukan domain ini       |
| `confirmationTimeout` (durasi)           | Hardcoded 60 menit — expose hanya jika ada demand nyata           |
| `reservationTimeoutSeconds`              | Hardcoded 300s di customer app — bukan setting owner              |
| `bookingCodePrefix`                      | Hardcoded 'BK' di customer app — bukan setting owner              |
| `salonPolicy` sebagai required checkbox  | Phase 1: collapsible display di StepConfirm. Checkbox di Phase 2. |
| Per-service deposit config               | Domain Layanan, sprint terpisah                                   |

---

## Urutan Implementasi

1. **`booking-app.types.ts`** — tidak ada dependency
2. **`ToggleSwitch.tsx`** + `index.ts` — tidak ada dependency
3. **`SettingsUploadField.tsx`** extend — tidak ada dependency baru
4. **`useBookingAppController.ts`** — depends on types (step 1)
5. **`BookingAppPageClient.tsx`** — depends on types (1), controller (4), ToggleSwitch (2), semua shared components
6. **`booking/page.tsx`** update — depends on BookingAppPageClient (5)

---

## Checklist Sebelum Mulai Kode

- [ ] `booking-app.types.ts` dibuat, tsc clean
- [ ] `ToggleSwitch.tsx` dibuat, di-export dari `toggle-switch/index.ts`
- [ ] `SettingsUploadField.tsx` diextend dengan variant `'qris'`, tsc clean
- [ ] `useBookingAppController.ts` dibuat, interface `BookingAppController` exported
- [ ] `BookingAppPageClient.tsx` dibuat
- [ ] `booking/page.tsx` diwire ke `BookingAppPageClient`
- [ ] `tsc --noEmit` — 0 errors
- [ ] Halaman `/dashboard/settings/booking` render tanpa error di browser

Tidak ada file lain yang dibuat. Tidak ada exception dari daftar ini.
