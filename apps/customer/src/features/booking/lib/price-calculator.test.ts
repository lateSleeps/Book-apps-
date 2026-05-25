import { describe, it, expect } from 'vitest';
import { calculateTotalPrice, calculateDepositAmount, calculateAmountDue } from './price-calculator';
import type { SelectedAddon } from '../types/booking.types';

describe('calculateTotalPrice', () => {
  it('returns service price when no addons', () => {
    expect(calculateTotalPrice(65000, [])).toBe(65000);
  });

  it('adds addon prices to service price', () => {
    const addons: SelectedAddon[] = [
      { id: 'p1', name: 'Shampoo', price: 45000, quantity: 1 },
      { id: 'p2', name: 'Mask', price: 75000, quantity: 2 },
    ];
    expect(calculateTotalPrice(65000, addons)).toBe(65000 + 45000 + 75000 * 2);
  });
});

describe('calculateDepositAmount', () => {
  it('returns 20000', () => {
    expect(calculateDepositAmount()).toBe(20000);
  });
});

describe('calculateAmountDue', () => {
  it('returns deposit amount for DEPOSIT type', () => {
    expect(calculateAmountDue(100000, 'DEPOSIT')).toBe(20000);
  });

  it('returns total price for FULL type', () => {
    expect(calculateAmountDue(100000, 'FULL')).toBe(100000);
  });
});
