"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
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

/** Map tRPC stylist row → Stylist shape expected by StylistCard */
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

export default function StylistPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const { salonId, isLoading: salonLoading } = useSalon(slug);
  const {
    stylists: rawStylists,
    isLoading: stylistsLoading,
    error,
  } = useStylists(salonId ?? "");

  const { services, stylist, timeSlot, setStylist, setTimeSlot } =
    useBookingStore();

  // Debug — remove once confirmed
  console.log("[stylist-page] rawStylists:", rawStylists);

  const stylists: Stylist[] = useMemo(
    () => (rawStylists as RawStylist[]).map(mapStylist),
    [rawStylists],
  );

  useEffect(() => {
    if (!services || services.length === 0) {
      router.push(`/book/${slug}/steps/services`);
    }
  }, [services, router, slug]);

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
        <StepHeader title="Pilih Stylist" />

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
        onClick={() => router.push(`/book/${slug}/steps/time`)}
      />
    </div>
  );
}
