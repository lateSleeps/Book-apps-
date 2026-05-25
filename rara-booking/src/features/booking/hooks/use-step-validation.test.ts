import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepValidation } from './use-step-validation';
import { useBookingStore } from './use-booking-store';

describe('useStepValidation', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useBookingStore());
    act(() => { result.current.reset(); });
  });

  it('step1Valid is false when no date selected', () => {
    const { result } = renderHook(() => useStepValidation());
    expect(result.current.step1Valid).toBe(false);
  });

  it('step1Valid is true when date selected', () => {
    const store = renderHook(() => useBookingStore());
    act(() => { store.result.current.setDate('2026-05-20'); });
    const { result } = renderHook(() => useStepValidation());
    expect(result.current.step1Valid).toBe(true);
  });

  it('canAccessStep9 is false when status is DRAFT', () => {
    const { result } = renderHook(() => useStepValidation());
    expect(result.current.canAccessStep9).toBe(false);
  });
});
