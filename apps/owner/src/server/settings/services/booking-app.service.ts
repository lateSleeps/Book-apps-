import { ServiceError } from '../lib/errors';
import * as bookingAppRepo from '../repositories/booking-app.repository';
import type {
  BankAccount,
  BookingAppSettings,
  ConfirmationMode,
  PaymentMethod,
} from '@/features/dashboard/components/settings/types/booking-app.types';

// ── Validation ────────────────────────────────────────────────────────────────

function validatePaymentMethods(methods: PaymentMethod[]): void {
  if (methods.length === 0)
    throw new ServiceError(
      'Minimal satu metode pembayaran harus aktif.',
      'PAYMENT_METHODS_EMPTY',
      'paymentMethods'
    );
}

function validateSalonPolicy(policy: string | null): void {
  if (policy !== null && policy.length > 500)
    throw new ServiceError(
      'Kebijakan salon maksimal 500 karakter.',
      'SALON_POLICY_TOO_LONG',
      'salonPolicy'
    );
}

// ── Domain ────────────────────────────────────────────────────────────────────

export async function getBookingAppSettings(salonId: string): Promise<BookingAppSettings> {
  return bookingAppRepo.getBookingAppSettings(salonId);
}

// ── salons column mutations ───────────────────────────────────────────────────

export async function setPaymentMethods(salonId: string, methods: PaymentMethod[]): Promise<void> {
  validatePaymentMethods(methods);
  return bookingAppRepo.setPaymentMethods(salonId, methods);
}

/**
 * Persist a QRIS image URL.
 * Only null (explicit removal) or https:// URLs are written.
 * Blob URLs from the file picker are rejected — real upload deferred to Sprint 4.
 */
export async function setQrisImageUrl(salonId: string, url: string | null): Promise<void> {
  if (url !== null && !url.startsWith('https://'))
    throw new ServiceError('QRIS URL harus diawali https://.', 'QRIS_URL_INVALID', 'qrisImageUrl');
  return bookingAppRepo.setQrisImageUrl(salonId, url);
}

export async function setConfirmationMode(salonId: string, mode: ConfirmationMode): Promise<void> {
  return bookingAppRepo.setConfirmationMode(salonId, mode);
}

export async function setSalonPolicy(salonId: string, policy: string | null): Promise<void> {
  const trimmed = policy?.trim() ?? null;
  const value = trimmed === '' ? null : trimmed;
  validateSalonPolicy(value);
  return bookingAppRepo.setSalonPolicy(salonId, value);
}

// ── bank_accounts mutations ───────────────────────────────────────────────────

export async function addBankAccount(
  salonId: string,
  data: Omit<BankAccount, 'id'>,
  sortOrder: number
): Promise<BankAccount> {
  if (!data.bankName.trim())
    throw new ServiceError('Nama bank tidak boleh kosong.', 'BANK_NAME_EMPTY', 'bankName');
  if (!data.accountNumber.trim())
    throw new ServiceError(
      'Nomor rekening tidak boleh kosong.',
      'ACCOUNT_NUMBER_EMPTY',
      'accountNumber'
    );
  if (!data.accountHolderName.trim())
    throw new ServiceError(
      'Nama pemilik rekening tidak boleh kosong.',
      'ACCOUNT_HOLDER_EMPTY',
      'accountHolderName'
    );
  return bookingAppRepo.addBankAccount(salonId, data, sortOrder);
}

export async function updateBankAccount(
  salonId: string,
  id: string,
  patch: Partial<Omit<BankAccount, 'id'>>
): Promise<void> {
  if (patch.bankName !== undefined && !patch.bankName.trim())
    throw new ServiceError('Nama bank tidak boleh kosong.', 'BANK_NAME_EMPTY', 'bankName');
  if (patch.accountNumber !== undefined && !patch.accountNumber.trim())
    throw new ServiceError(
      'Nomor rekening tidak boleh kosong.',
      'ACCOUNT_NUMBER_EMPTY',
      'accountNumber'
    );
  if (patch.accountHolderName !== undefined && !patch.accountHolderName.trim())
    throw new ServiceError(
      'Nama pemilik rekening tidak boleh kosong.',
      'ACCOUNT_HOLDER_EMPTY',
      'accountHolderName'
    );
  return bookingAppRepo.updateBankAccount(salonId, id, patch);
}

export async function removeBankAccount(salonId: string, id: string): Promise<void> {
  return bookingAppRepo.removeBankAccount(salonId, id);
}
