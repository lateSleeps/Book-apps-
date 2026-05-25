import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlotTimer } from './use-slot-timer';

describe('useSlotTimer', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('starts at 300 seconds', () => {
    const { result } = renderHook(() => useSlotTimer({ onExpire: vi.fn(), autoStart: false }));
    expect(result.current.secondsLeft).toBe(300);
  });

  it('counts down when running', () => {
    const { result } = renderHook(() => useSlotTimer({ onExpire: vi.fn(), autoStart: true }));
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.secondsLeft).toBe(297);
  });

  it('calls onExpire when timer reaches 0', () => {
    const onExpire = vi.fn();
    renderHook(() => useSlotTimer({ onExpire, autoStart: true }));
    act(() => { vi.advanceTimersByTime(300_000); });
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it('isWarning is true when < 60s left', () => {
    const { result } = renderHook(() => useSlotTimer({ onExpire: vi.fn(), autoStart: true }));
    act(() => { vi.advanceTimersByTime(241_000); });
    expect(result.current.isWarning).toBe(true);
  });

  it('formattedTime shows 05:00 at start', () => {
    const { result } = renderHook(() => useSlotTimer({ onExpire: vi.fn(), autoStart: false }));
    expect(result.current.formattedTime).toBe('05:00');
  });
});
