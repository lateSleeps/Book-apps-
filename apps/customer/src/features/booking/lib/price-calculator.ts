import type { SelectedAddon } from '../types/booking.types';
import { DEPOSIT_AMOUNT } from '../constants/booking.constants';

/**
 * Calculates total booking price including service and addons.
 */
export function calculateTotalPrice(servicePrice: number, addons: SelectedAddon[]): number {
  const addonTotal = addons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0);
  return servicePrice + addonTotal;
}

/**
 * Returns the fixed deposit amount.
 */
export function calculateDepositAmount(): number {
  return DEPOSIT_AMOUNT;
}

/**
 * Returns the amount due based on payment type.
 */
export function calculateAmountDue(
  totalPrice: number,
  paymentType: 'DEPOSIT' | 'FULL'
): number {
  return paymentType === 'DEPOSIT' ? DEPOSIT_AMOUNT : totalPrice;
}
