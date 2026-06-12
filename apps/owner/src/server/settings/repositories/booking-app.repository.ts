import { db } from '../../db';
import { handleDbError } from '../lib/errors';
import type {
  BankAccount,
  BookingAppSettings,
  ConfirmationMode,
  PaymentMethod,
} from '@/features/dashboard/components/settings/types/booking-app.types';

// ── DB row shapes ─────────────────────────────────────────────────────────────

interface SalonBookingRow {
  payment_methods: string[];
  qris_image_url: string | null;
  confirmation_mode: string;
  salon_policy: string | null;
}

interface BankAccountRow {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  is_active: boolean;
  // sort_order read by DB ORDER BY — not exposed in BankAccount TS interface
}

// ── Column lists ──────────────────────────────────────────────────────────────

const BOOKING_SALON_COLUMNS = [
  'payment_methods',
  'qris_image_url',
  'confirmation_mode',
  'salon_policy',
].join(', ');

const BANK_ACCOUNT_COLUMNS = [
  'id',
  'bank_name',
  'account_number',
  'account_holder_name',
  'is_active',
].join(', ');

// ── Mappers ───────────────────────────────────────────────────────────────────

function rowToSettings(salonRow: SalonBookingRow, bankRows: BankAccountRow[]): BookingAppSettings {
  return {
    paymentMethods: (salonRow.payment_methods ?? ['qris', 'transfer']) as PaymentMethod[],
    qrisImageUrl: salonRow.qris_image_url ?? null,
    bankAccounts: bankRows.map(rowToBankAccount),
    confirmationMode: (salonRow.confirmation_mode ?? 'auto') as ConfirmationMode,
    salonPolicy: salonRow.salon_policy ?? null,
  };
}

function rowToBankAccount(row: BankAccountRow): BankAccount {
  return {
    id: row.id,
    bankName: row.bank_name,
    accountNumber: row.account_number,
    accountHolderName: row.account_holder_name,
    isActive: row.is_active,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetch all Booking App settings for a salon.
 * Two selects in parallel: salons (booking columns) + bank_accounts.
 */
export async function getBookingAppSettings(salonId: string): Promise<BookingAppSettings> {
  const [salonResult, bankResult] = await Promise.all([
    db.from('salons').select(BOOKING_SALON_COLUMNS).eq('id', salonId).single(),
    db
      .from('bank_accounts')
      .select(`${BANK_ACCOUNT_COLUMNS}, sort_order`)
      .eq('salon_id', salonId)
      .order('sort_order', { ascending: true }),
  ]);

  if (salonResult.error) {
    if (salonResult.error.code === 'PGRST116') {
      // Salon row missing — return safe defaults
      return {
        paymentMethods: ['qris', 'transfer'],
        qrisImageUrl: null,
        bankAccounts: [],
        confirmationMode: 'auto',
        salonPolicy: null,
      };
    }
    throw handleDbError(salonResult.error);
  }

  if (bankResult.error) throw handleDbError(bankResult.error);

  return rowToSettings(
    salonResult.data as unknown as SalonBookingRow,
    (bankResult.data as unknown as BankAccountRow[]) ?? []
  );
}

// ── salons column mutations ───────────────────────────────────────────────────

export async function setPaymentMethods(salonId: string, methods: PaymentMethod[]): Promise<void> {
  const { error } = await db.from('salons').update({ payment_methods: methods }).eq('id', salonId);

  if (error) throw handleDbError(error);
}

/**
 * Persist a QRIS image URL.
 * Accepts null (explicit removal) or an https:// URL.
 * Blob / data: URLs must be stripped before calling this — see controller.
 */
export async function setQrisImageUrl(salonId: string, url: string | null): Promise<void> {
  const { error } = await db.from('salons').update({ qris_image_url: url }).eq('id', salonId);

  if (error) throw handleDbError(error);
}

export async function setConfirmationMode(salonId: string, mode: ConfirmationMode): Promise<void> {
  const { error } = await db.from('salons').update({ confirmation_mode: mode }).eq('id', salonId);

  if (error) throw handleDbError(error);
}

export async function setSalonPolicy(salonId: string, policy: string | null): Promise<void> {
  const { error } = await db.from('salons').update({ salon_policy: policy }).eq('id', salonId);

  if (error) throw handleDbError(error);
}

// ── bank_accounts mutations ───────────────────────────────────────────────────

export async function addBankAccount(
  salonId: string,
  data: Omit<BankAccount, 'id'>,
  sortOrder: number
): Promise<BankAccount> {
  const { data: row, error } = await db
    .from('bank_accounts')
    .insert({
      salon_id: salonId,
      bank_name: data.bankName,
      account_number: data.accountNumber,
      account_holder_name: data.accountHolderName,
      is_active: data.isActive,
      sort_order: sortOrder,
    })
    .select(BANK_ACCOUNT_COLUMNS)
    .single();

  if (error) throw handleDbError(error);
  return rowToBankAccount(row as unknown as BankAccountRow);
}

export async function updateBankAccount(
  salonId: string,
  id: string,
  patch: Partial<Omit<BankAccount, 'id'>>
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (patch.bankName !== undefined) update.bank_name = patch.bankName;
  if (patch.accountNumber !== undefined) update.account_number = patch.accountNumber;
  if (patch.accountHolderName !== undefined) update.account_holder_name = patch.accountHolderName;
  if (patch.isActive !== undefined) update.is_active = patch.isActive;

  if (Object.keys(update).length === 0) return;

  update.updated_at = new Date().toISOString();

  const { error } = await db
    .from('bank_accounts')
    .update(update)
    .eq('id', id)
    .eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

export async function removeBankAccount(salonId: string, id: string): Promise<void> {
  const { error } = await db.from('bank_accounts').delete().eq('id', id).eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}
