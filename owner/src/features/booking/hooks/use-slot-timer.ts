'use client';

import { useEffect, useRef, useState } from 'react';

import { SLOT_RESERVATION_SECONDS } from '../constants/booking.constants';
import { formatCountdown } from '@/shared/lib/format';

interface UseSlotTimerOptions {
  onExpire: () => void;
  autoStart?: boolean;
}

interface UseSlotTimerReturn {
  secondsLeft: number;
  isExpired: boolean;
  isWarning: boolean; // < 60s remaining
  start: () => void;
  reset: () => void;
  formattedTime: string;
}

/**
 * Countdown timer for slot reservation (5 minutes).
 * Calls onExpire when timer reaches 0.
 */
export function useSlotTimer({ onExpire, autoStart = true }: UseSlotTimerOptions): UseSlotTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState(SLOT_RESERVATION_SECONDS);
  const [isRunning, setIsRunning] = useState(autoStart);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formattedTime = formatCountdown(secondsLeft);

  return {
    secondsLeft,
    isExpired: secondsLeft === 0,
    isWarning: secondsLeft < 60 && secondsLeft > 0,
    start: () => { setSecondsLeft(SLOT_RESERVATION_SECONDS); setIsRunning(true); },
    reset: () => { setSecondsLeft(SLOT_RESERVATION_SECONDS); setIsRunning(false); },
    formattedTime,
  };
}
