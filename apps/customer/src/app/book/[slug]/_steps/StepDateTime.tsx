"use client";

import {
  format,
  addDays,
  isToday,
  isBefore,
  startOfDay,
  getDay,
} from "date-fns";
import { useMemo } from "react";

import { BottomCTA } from "@/features/booking/components/bottom-cta";
import { StepHeader } from "@/features/booking/components/step-header";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { cn } from "@/shared/lib/cn";

const DAY_LABELS = ["M", "S", "S", "R", "K", "J", "S"];

const TIME_SLOTS = [
  { time: "09:00", session: "PAGI" },
  { time: "10:00", session: "PAGI" },
  { time: "11:00", session: "PAGI" },
  { time: "13:00", session: "SIANG" },
  { time: "14:00", session: "SIANG" },
  { time: "15:00", session: "SORE" },
  { time: "16:00", session: "SORE" },
  { time: "17:00", session: "SORE" },
];

function buildStrip() {
  const today = startOfDay(new Date());
  return Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i);
    const dow = getDay(date);
    const isPast = isBefore(date, today);
    const isClosed = dow === 0;
    return {
      isoString: format(date, "yyyy-MM-dd"),
      dayNum: format(date, "dd"),
      dayLabel: DAY_LABELS[dow] ?? "S",
      isToday: isToday(date),
      isPast,
      isClosed,
    };
  });
}

const SESSION_LABELS: Record<string, string> = {
  PAGI: "Pagi",
  SIANG: "Siang",
  SORE: "Sore",
};

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepDateTime({ onNext, onBack }: Props) {
  const { date, setDate, timeSlot, setTimeSlot } = useBookingStore();
  const strip = useMemo(() => buildStrip(), []);

  const canProceed = !!date && !!timeSlot && timeSlot.length > 0;

  const groupedSlots = useMemo(() => {
    const groups: Record<string, string[]> = {};
    TIME_SLOTS.forEach(({ time, session }) => {
      if (!groups[session]) groups[session] = [];
      groups[session].push(time);
    });
    return groups;
  }, []);

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <StepHeader
          title="Pilih Tanggal & Waktu"
          subtitle="Kapan kamu ingin datang?"
          onBack={onBack}
        />

        {/* Calendar strip */}
        <div className="px-s16 pt-s16 pb-s8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {strip.map((day) => {
              const isSelected = date === day.isoString;
              const disabled = day.isPast || day.isClosed;

              return (
                <button
                  key={day.isoString}
                  onClick={() => {
                    if (!disabled) {
                      setDate(day.isoString);
                      setTimeSlot("");
                    }
                  }}
                  disabled={disabled}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center gap-[6px] w-[56px] py-s8",
                    disabled && "opacity-30 cursor-not-allowed",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[24px] w-[24px] items-center justify-center rounded-full text-[12px] font-semibold transition-all",
                      day.isToday ? "text-white" : "text-label3",
                    )}
                    style={
                      day.isToday ? { backgroundColor: "#111110" } : undefined
                    }
                  >
                    {day.dayLabel}
                  </span>

                  <div
                    className={cn(
                      "flex flex-col items-center gap-[16px] px-[6px] pt-[6px] pb-[8px] rounded-r24 transition-all duration-150",
                      isSelected && "bg-sep",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-[40px] w-[40px] items-center justify-center rounded-full text-[20px] font-semibold transition-all",
                        isSelected ? "bg-accent text-white" : "text-label",
                      )}
                    >
                      {day.dayNum}
                    </span>
                    <span
                      className={cn(
                        "h-[5px] w-[5px] rounded-full transition-all duration-200",
                        isSelected && "bg-accent",
                      )}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-sep mx-s20 mb-s4" />

        {/* Time slots */}
        {date ? (
          <div className="px-s16 pt-s12 pb-32 flex flex-col gap-s20">
            {Object.entries(groupedSlots).map(([session, times]) => (
              <div key={session}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-label3 mb-s8 px-s4">
                  {SESSION_LABELS[session] ?? session}
                </p>
                <div className="flex flex-wrap gap-s8">
                  {times.map((time) => {
                    const isSelected = timeSlot === time;
                    return (
                      <button
                        key={time}
                        onClick={() => setTimeSlot(time)}
                        className={cn(
                          "rounded-r12 px-s16 py-s12 text-[15px] font-semibold transition-all duration-150 active:scale-95",
                          isSelected
                            ? "bg-accent text-white shadow-sm"
                            : "bg-surface border border-sep text-label hover:bg-sep",
                        )}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center py-16">
            <p className="text-[14px] text-label3">
              Pilih tanggal untuk melihat slot waktu
            </p>
          </div>
        )}
      </div>

      <BottomCTA
        label={
          !date
            ? "Pilih tanggal dulu"
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
