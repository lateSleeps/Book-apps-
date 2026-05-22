'use client';

import { useState } from 'react';

import type { Stylist, TimeSlot } from '../../types/booking.types';
import { TimeSlotPicker } from '../time-slot-picker/TimeSlotPicker';
import { cn } from '@/shared/lib/cn';

export interface StylistCardProps {
  stylist: Stylist;
  slots: TimeSlot[];
  isSelected: boolean;
  selectedTime: string | null;
  onSelect: (stylist: Stylist) => void;
  onSelectTime: (time: string) => void;
  onFullyBookedTap: () => void;
}

const PREVIEW_COUNT = 3;

export function StylistCard({
  stylist,
  slots,
  isSelected,
  selectedTime,
  onSelect,
  onSelectTime,
  onFullyBookedTap,
}: StylistCardProps) {
  const [showAll, setShowAll] = useState(false);

  const availableSlots = slots.filter((s) => s.available);
  const isFullyBooked = availableSlots.length === 0;
  const previewSlots = availableSlots.slice(0, PREVIEW_COUNT);
  const remainingCount = availableSlots.length - PREVIEW_COUNT;

  function handleChipTap(time: string) {
    if (!isSelected) onSelect(stylist);
    onSelectTime(time);
  }

  function handleCardTap() {
    if (isFullyBooked) {
      onFullyBookedTap();
      return;
    }
    if (!isSelected) onSelect(stylist);
  }

  return (
    <div
      className={cn(
        'rounded-r20 border-[1.5px] bg-surface transition-colors duration-200',
        isSelected && !isFullyBooked ? 'border-accent' : 'border-sep',
        isFullyBooked && 'opacity-50'
      )}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={handleCardTap}
        disabled={isFullyBooked}
        aria-label={`${stylist.name}${isFullyBooked ? ' — penuh' : ''}`}
        className="flex w-full items-center gap-s12 px-s16 py-[14px]"
      >
        {/* Avatar */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-rF text-t12 font-bold text-label',
            isFullyBooked && 'grayscale'
          )}
          style={{ backgroundColor: stylist.avatarColor }}
          aria-hidden="true"
        >
          {stylist.avatarInitials}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col items-start gap-[2px]">
          <span className="text-[15px] font-semibold text-label">{stylist.name}</span>
          <span className="text-[12px] text-label3">
            {stylist.specialty}
            {isFullyBooked && ' · Penuh'}
          </span>
        </div>

        {/* Slot count badge */}
        {!isFullyBooked && (
          <span className="text-[12px] font-medium text-label3">
            {availableSlots.length} slot
          </span>
        )}
      </button>

      {/* Inline slot chips */}
      {!isFullyBooked && (
        <div className="px-s16 pb-s16 -mt-[4px]">
          <div className="flex flex-wrap gap-[8px]">
            {previewSlots.map((slot) => {
              const isChipSelected = isSelected && selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => handleChipTap(slot.time)}
                  className={cn(
                    'rounded-rF px-s16 py-[8px] text-[14px] font-semibold transition-all duration-150 active:scale-[0.96]',
                    isChipSelected
                      ? 'bg-label text-white'
                      : 'bg-[#f0f0ee] text-label2 hover:bg-sep'
                  )}
                >
                  {slot.time}
                </button>
              );
            })}

            {/* Show more */}
            {!showAll && remainingCount > 0 && (
              <button
                type="button"
                onClick={() => { if (!isSelected) onSelect(stylist); setShowAll(true); }}
                className="rounded-rF border border-sep px-s16 py-[8px] text-[14px] font-medium text-label3 hover:border-label3 transition-colors"
              >
                +{remainingCount} lainnya
              </button>
            )}
          </div>

          {/* Full picker when expanded */}
          {showAll && (
            <div className="mt-s16 border-t border-sep pt-s12 animate-up">
              <TimeSlotPicker slots={slots} selectedTime={selectedTime} onSelect={(t) => handleChipTap(t)} />
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="mt-s12 text-[13px] font-medium text-label3 hover:text-label2 transition-colors"
              >
                Sembunyikan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
