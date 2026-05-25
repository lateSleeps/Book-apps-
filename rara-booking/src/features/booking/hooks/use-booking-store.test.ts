import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookingStore } from './use-booking-store';
import type { Category, Service } from '../types/booking.types';

const mockCategory: Category = {
  id: 'cat-1',
  name: 'Potong Rambut',
  description: 'Potong rambut profesional',
  color: 'bg-c-peach',
  blobColor: '#f5c4ab',
  icon: '✂️',
};

const mockService: Service = {
  id: 'svc-1',
  categoryId: 'cat-1',
  name: 'Potong Pendek',
  description: 'Potong rambut pendek',
  price: 65000,
  duration: 30,
  serviceFlow: 'TREATMENT',
};

describe('useBookingStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useBookingStore());
    act(() => { result.current.reset(); });
  });

  it('initializes with step 1', () => {
    const { result } = renderHook(() => useBookingStore());
    expect(result.current.step).toBe(1);
  });

  it('setDate updates date', () => {
    const { result } = renderHook(() => useBookingStore());
    act(() => { result.current.setDate('2026-05-20'); });
    expect(result.current.date).toBe('2026-05-20');
  });

  it('setCategory clears service and stylist', () => {
    const { result } = renderHook(() => useBookingStore());
    act(() => {
      result.current.setService(mockService);
      result.current.setCategory(mockCategory);
    });
    expect(result.current.service).toBeNull();
  });

  it('addAddon increments quantity for existing addon', () => {
    const { result } = renderHook(() => useBookingStore());
    const product = { id: 'p1', name: 'Shampoo', description: '', price: 45000, imageEmoji: '🧴' };
    act(() => {
      result.current.setService(mockService);
      result.current.addAddon(product);
      result.current.addAddon(product);
    });
    expect(result.current.addons[0]?.quantity).toBe(2);
  });

  it('confirmBooking sets status to CONFIRMED and generates code', () => {
    const { result } = renderHook(() => useBookingStore());
    act(() => { result.current.confirmBooking(); });
    expect(result.current.bookingStatus).toBe('CONFIRMED');
    expect(result.current.bookingCode).toMatch(/^RB-\d{4}-\d{4}$/);
  });

  it('reset returns to initial state', () => {
    const { result } = renderHook(() => useBookingStore());
    act(() => {
      result.current.setDate('2026-05-20');
      result.current.reset();
    });
    expect(result.current.date).toBeNull();
    expect(result.current.step).toBe(1);
  });
});
