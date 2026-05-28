"use client";

import { useMemo } from "react";
import {
  useBookingStore,
  StylistCards,
  StepHeader,
  BottomCTA,
} from "@/features/booking";
import type { Stylist, TimeSlot } from "@/features/booking/types/booking.types";
import { useSalon, useStylists } from "@/hooks";

const MOCK_SLOTS: TimeSlot[] = [
  { time: "09:00", session: "PAGI", available: true },
  { time: "10:00", session: "PAGI", available: true },
  { time: "11:00", session: "PAGI", available: true },
  { time: "13:00", session: "SIANG", available: true },
  { time: "14:00", session: "SIANG", available: true },
  { time: "15:00", session: "SORE", available: true },
  { time: "16:00", session: "SORE", available: true },
];

const AVATAR_COLORS = [
  "#f5c4ab",
  "#b8d6f0",
  "#a8e6d4",
  "#f5d98a",
  "#c8bef0",
  "#f0b8c8",
  "#b8f0d6",
  "#d6b8f0",
  "#f0d6b8",
  "#b8e6f0",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

type RawStylist = {
  id: string;
  name?: string;
  full_name?: string;
  role?: string;
  specialty?: string;
  title?: string;
  avatar_initials?: string;
  initials?: string;
  color?: string;
  avatar_color?: string;
  booked_slots?: string[];
  user?: { full_name?: string; role?: string };
};

function mapStylist(raw: RawStylist, idx: number): Stylist {
  const name =
    raw.name ?? raw.full_name ?? raw.user?.full_name ?? `Stylist ${idx + 1}`;
  return {
    id: raw.id,
    name,
    specialty:
      raw.role ?? raw.user?.role ?? raw.specialty ?? raw.title ?? "Stylist",
    avatarInitials: raw.avatar_initials ?? raw.initials ?? getInitials(name),
    avatarColor:
      raw.color ??
      raw.avatar_color ??
      AVATAR_COLORS[idx % AVATAR_COLORS.length],
    bookedSlots: raw.booked_slots ?? [],
  };
}

interface Props {
  slug: string;
  onNext: () => void;
  onBack: () => void;
}

export function StepStylist({ slug, onNext, onBack }: Props) {
  const { salonId, isLoading: salonLoading } = useSalon(slug);
  const {
    stylists: rawStylists,
    isLoading: stylistsLoading,
    error,
  } = useStylists(salonId ?? "");

  const { stylist, timeSlot, setStylist, setTimeSlot } = useBookingStore();

  const stylists: Stylist[] = useMemo(
    () => (rawStylists as RawStylist[]).map(mapStylist),
    [rawStylists],
  );

  if (salonLoading || stylistsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-label2">Loading stylists...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <StepHeader title="Pilih Stylist" onBack={onBack} />

        {stylists.length === 0 ? (
          <div className="py-16 text-center text-label3">
            Tidak ada stylist tersedia
          </div>
        ) : (
          <div className="py-s12 pb-32">
            <StylistCards
              stylists={stylists}
              selectedStylist={stylist}
              selectedTime={timeSlot}
              getSlotsForStylist={() => MOCK_SLOTS}
              onSelectStylist={setStylist}
              onSelectTime={setTimeSlot}
              onFullyBookedTap={() => {}}
            />
          </div>
        )}
      </div>

      <BottomCTA
        label={
          stylist && timeSlot
            ? "Lanjutkan →"
            : stylist
              ? "Pilih waktu dulu"
              : "Pilih stylist dulu"
        }
        variant={stylist && timeSlot ? "ready" : "default"}
        disabled={!stylist || !timeSlot}
        onClick={onNext}
      />
    </div>
  );
}
