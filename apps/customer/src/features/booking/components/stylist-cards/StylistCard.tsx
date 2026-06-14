"use client";

import { useState } from "react";

import type { Stylist, TimeSlot } from "../../types/booking.types";
import { StylistAvatar } from "./StylistAvatar";
import { cn } from "@/shared/lib/cn";

export interface StylistCardProps {
  stylist: Stylist;
  slots: TimeSlot[];
  isSelected: boolean;
  selectedTime: string | null;
  onSelect: (stylist: Stylist) => void;
  onSelectTime: (time: string) => void;
  onFullyBookedTap: () => void;
  isLast?: boolean;
}

const PREVIEW_COUNT = 4;

export function StylistCard({
  stylist,
  slots,
  isSelected,
  selectedTime,
  onSelect,
  onSelectTime,
  onFullyBookedTap,
  isLast = false,
}: StylistCardProps) {
  const [showAll, setShowAll] = useState(false);

  const availableSlots = slots.filter((s) => s.available);
  const isFullyBooked = availableSlots.length === 0;
  const visibleSlots = showAll
    ? availableSlots
    : availableSlots.slice(0, PREVIEW_COUNT);
  const hiddenCount = availableSlots.length - PREVIEW_COUNT;

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
        "transition-all duration-200",
        isSelected && !isFullyBooked
          ? "bg-bd-row shadow-[inset_0_0_0_1.5px_#E5E5EA]"
          : "bg-transparent",
        isFullyBooked && "opacity-50",
      )}
    >
      {/* ── Stylist identity row ── */}
      <button
        type="button"
        onClick={handleCardTap}
        disabled={isFullyBooked}
        aria-label={`${stylist.name}${isFullyBooked ? " — penuh" : ""}`}
        className="flex w-full items-center gap-s12 px-s20 pt-[14px] pb-[10px]"
      >
        <StylistAvatar name={stylist.name} grayscale={isFullyBooked} />

        {/* Name + specialty */}
        <div className="flex flex-1 flex-col items-start gap-[2px]">
          <span className="text-[15px] font-semibold text-label leading-tight">
            {stylist.name}
          </span>
          <span className="text-[12px] text-label3 leading-none">
            {isFullyBooked ? `${stylist.specialty} · Penuh` : stylist.specialty}
          </span>
        </div>

        {/* Right indicator */}
        {!isFullyBooked && !isSelected && (
          <span className="text-[12px] font-medium text-label3 flex-shrink-0">
            Tersedia
          </span>
        )}
        {isSelected && (
          <div className="flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-accent">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </button>

      {/* ── Time slots ── */}
      {!isFullyBooked && (
        <div className="px-s20 pb-[14px]">
          <div className="flex flex-wrap gap-[6px]">
            {visibleSlots.map((slot) => {
              const isChipSelected = isSelected && selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => handleChipTap(slot.time)}
                  className={cn(
                    "rounded-rF px-[11px] py-[6px] text-[13px] font-medium",
                    "transition-all duration-150 active:scale-[0.96]",
                    isChipSelected
                      ? "bg-tx-primary text-bg-card shadow-sm"
                      : "bg-bg-page border border-bd-card text-tx-secondary",
                  )}
                >
                  {slot.time}
                </button>
              );
            })}

            {!showAll && hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (!isSelected) onSelect(stylist);
                  setShowAll(true);
                }}
                className="rounded-rF px-[11px] py-[6px] text-[13px] font-medium text-label3 border border-sep transition-colors hover:border-label3"
              >
                +{hiddenCount} lainnya
              </button>
            )}

            {showAll && hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="rounded-rF px-[11px] py-[6px] text-[13px] font-medium text-label3 border border-sep transition-colors hover:border-label3"
              >
                Sembunyikan
              </button>
            )}
          </div>
        </div>
      )}

      {/* Inset row divider — hidden on last item */}
      {!isLast && <div className="mx-s20 h-px bg-sep" />}
    </div>
  );
}
