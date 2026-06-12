// booking-app.types.ts
// Canonical source of truth for Booking App domain.
// All controller, component, and tRPC code must import from this file.
// No duplicate type definitions allowed elsewhere.

export type PaymentMethod = 'qris' | 'transfer' | 'cash';

export type ConfirmationMode = 'auto' | 'manual';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isActive: boolean;
}

export type AuditAction =
  | 'qris_uploaded'
  | 'qris_replaced'
  | 'qris_removed'
  | 'bank_account_added'
  | 'bank_account_edited'
  | 'bank_account_removed'
  | 'payment_method_changed';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actor: string; // user ID
  actorRole: 'OWNER';
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
  paymentMethods: ['qris', 'transfer'],
  qrisImageUrl: null,
  bankAccounts: [],
  confirmationMode: 'auto',
  salonPolicy: null,
};
