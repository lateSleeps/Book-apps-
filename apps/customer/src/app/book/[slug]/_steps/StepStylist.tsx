"use client";

import { useMemo } from "react";

import { useBookingStore, StylistCards, BottomCTA } from "@/features/booking";
import type { Stylist, TimeSlot } from "@/features/booking/types/booking.types";
import { useSalon, useStylists } from "@/hooks";
import {
  avatarColor,
  getInitials as avatarGetInitials,
} from "@/shared/lib/avatar";

const MOCK_SLOTS: TimeSlot[] = [
  { time: "09:00", session: "PAGI", available: true },
  { time: "10:00", session: "PAGI", available: true },
  { time: "11:00", session: "PAGI", available: true },
  { time: "13:00", session: "SIANG", available: true },
  { time: "14:00", session: "SIANG", available: true },
  { time: "15:00", session: "SORE", available: true },
  { time: "16:00", session: "SORE", available: true },
];

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
  const { bg } = avatarColor(name);
  return {
    id: raw.id,
    name,
    specialty:
      raw.role ?? raw.user?.role ?? raw.specialty ?? raw.title ?? "Stylist",
    avatarInitials:
      raw.avatar_initials ?? raw.initials ?? avatarGetInitials(name),
    avatarColor: raw.color ?? raw.avatar_color ?? bg,
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
      <div className="flex h-full items-center justify-center bg-bg-page">
        <div className="text-ts-fn text-label3">Memuat stylist…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-s20 bg-bg-page">
        <div className="text-ts-fn text-c-salmon text-center">{error}</div>
      </div>
    );
  }

  const canProceed = !!stylist && !!timeSlot;

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-bg-page">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* ── Page header — matches Service Detail exactly ── */}
        <div className="px-s20 pt-s20 pb-s4">
          <button
            onClick={onBack}
            aria-label="Kembali"
            className="mb-[16px] -ml-[4px] flex h-[44px] w-[44px] items-center justify-center rounded-full text-tx-secondary transition-all active:scale-95"
          >
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-bg-card hover:bg-sep transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
          </button>
          <h1 className="text-[28px] font-bold text-tx-primary leading-tight tracking-tight">
            Pilih stylist
          </h1>
          <p className="mt-[6px] text-[15px] text-tx-secondary leading-snug">
            Pilih stylist dan waktu yang sesuai.
          </p>
        </div>

        {/* ── Stylist list — white section card, mirrors form card ── */}
        <div className="px-s16 pt-s20 pb-s40">
          {stylists.length === 0 ? (
            <div className="py-s32 text-center text-ts-fn text-label3">
              Tidak ada stylist tersedia
            </div>
          ) : (
            <div className="bg-bg-card rounded-r20 shadow-card py-s12">
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
      </div>

      <BottomCTA
        label={
          !stylist
            ? "Pilih stylist dulu"
            : !timeSlot
              ? "Pilih waktu dulu"
              : "Lanjutkan →"
        }
        variant={canProceed ? "ready" : "default"}
        disabled={!canProceed}
        onClick={onNext}
      />
    </div>
  );
}
