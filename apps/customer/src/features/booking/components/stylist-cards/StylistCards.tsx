"use client";

import type { Stylist, TimeSlot } from "../../types/booking.types";
import { StylistCard } from "./StylistCard";

export interface StylistCardsProps {
  stylists: Stylist[];
  selectedStylist: Stylist | null;
  selectedTime: string | null;
  getSlotsForStylist: (stylistId: string) => TimeSlot[];
  onSelectStylist: (stylist: Stylist) => void;
  onSelectTime: (time: string) => void;
  onFullyBookedTap: (stylistName: string) => void;
}

/** List of stylist rows — no outer padding, parent container provides it */
export function StylistCards({
  stylists,
  selectedStylist,
  selectedTime,
  getSlotsForStylist,
  onSelectStylist,
  onSelectTime,
  onFullyBookedTap,
}: StylistCardsProps) {
  return (
    <div className="flex flex-col">
      {stylists.map((stylist, index) => (
        <StylistCard
          key={stylist.id}
          stylist={stylist}
          slots={getSlotsForStylist(stylist.id)}
          isSelected={selectedStylist?.id === stylist.id}
          selectedTime={
            selectedStylist?.id === stylist.id ? selectedTime : null
          }
          onSelect={onSelectStylist}
          onSelectTime={onSelectTime}
          onFullyBookedTap={() => onFullyBookedTap(stylist.name)}
          isLast={index === stylists.length - 1}
        />
      ))}
    </div>
  );
}
