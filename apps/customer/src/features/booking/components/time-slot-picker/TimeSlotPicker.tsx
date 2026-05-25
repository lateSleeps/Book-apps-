'use client';

import type { TimeSlot as TimeSlotType } from '../../types/booking.types';
import { TimeSlot } from './TimeSlot';
import { cn } from '@/shared/lib/cn';

export interface TimeSlotPickerProps {
  slots: TimeSlotType[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  className?: string;
}

type Session = 'PAGI' | 'SIANG' | 'SORE';
const SESSIONS: Session[] = ['PAGI', 'SIANG', 'SORE'];

/** Time slot picker grouped by session */
export function TimeSlotPicker({ slots, selectedTime, onSelect, className }: TimeSlotPickerProps) {
  const slotsBySession = SESSIONS.reduce<Record<Session, TimeSlotType[]>>(
    (acc, session) => {
      acc[session] = slots.filter((s) => s.session === session);
      return acc;
    },
    { PAGI: [], SIANG: [], SORE: [] }
  );

  return (
    <div className={cn('flex flex-col gap-s12 animate-up', className)}>
      {SESSIONS.map((session) => {
        const sessionSlots = slotsBySession[session];
        if (sessionSlots.length === 0) return null;
        return (
          <div key={session} className="flex flex-col gap-s8">
            <span className="text-t12 font-semibold uppercase tracking-[0.07em] text-label3">
              {session}
            </span>
            <div className="flex flex-wrap gap-s8">
              {sessionSlots.map((slot) => (
                <TimeSlot
                  key={slot.time}
                  slot={slot}
                  isSelected={selectedTime === slot.time}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
