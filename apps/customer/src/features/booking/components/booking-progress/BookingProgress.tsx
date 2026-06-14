"use client";

import { bookingProgressStyles as s } from "./BookingProgress.styles";
import { cn } from "@/shared/lib/cn";

type BookingStep =
  | "services"
  | "service-detail"
  | "stylist"
  | "confirm"
  | "contact"
  | "payment"
  | "ticket";

const STEPS = [
  { key: "services", label: "Layanan" },
  { key: "stylist", label: "Stylist" },
  { key: "confirm", label: "Jadwal" },
  { key: "contact", label: "Kontak" },
  { key: "payment", label: "Bayar" },
] as const;

function getActiveIndex(step: BookingStep): number {
  if (step === "services" || step === "service-detail") return 0;
  if (step === "stylist") return 1;
  if (step === "confirm") return 2;
  if (step === "contact") return 3;
  return 4;
}

interface BookingProgressProps {
  step: BookingStep;
}

export function BookingProgress({ step }: BookingProgressProps) {
  const activeIndex = getActiveIndex(step);
  const progress = ((activeIndex + 1) / STEPS.length) * 100;

  return (
    <div className={s.root}>
      <div className={s.inner}>
        {STEPS.map((st, i) => (
          <span
            key={st.key}
            className={cn(
              s.label,
              i < activeIndex && s.labelDone,
              i === activeIndex && s.labelActive,
            )}
          >
            {st.label}
          </span>
        ))}
      </div>
      <div className={s.track}>
        <div className={s.trackFill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
