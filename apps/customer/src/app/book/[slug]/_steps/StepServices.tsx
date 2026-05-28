"use client";

import {
  format,
  addDays,
  isToday,
  isBefore,
  startOfDay,
  getDay,
} from "date-fns";
import { useState, useMemo } from "react";

import { BottomCTA } from "@/features/booking/components/bottom-cta";
import { SelectedServicesIndicator } from "@/features/booking/components/selected-services-indicator";
import { Toast } from "@/features/booking/components/toast/Toast";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { useToast } from "@/features/booking/hooks/use-toast";
import { useSalon, useServices } from "@/hooks";
import { cn } from "@/shared/lib/cn";
import { formatRupiah } from "@/shared/lib/format";

const DAY_LABELS = ["M", "S", "S", "R", "K", "J", "S"];

type RawCategory = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
};
type RawService = {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: RawCategory;
  requires_specialist?: boolean;
  service_questions?: unknown[];
};

function hexToHsl(hex: string): [number, number, number] {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return (
    "#" +
    [r, g, b]
      .map((x) =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function saturateColor(hex: string): string {
  const [h, s] = hexToHsl(hex);
  return hslToHex(h, Math.min(1, s * 2.5), 0.78);
}

function lightenColor(hex: string): string {
  const [h, s] = hexToHsl(hex);
  return hslToHex(h, Math.min(1, s * 2.5), 0.92);
}

function buildStrip() {
  const today = startOfDay(new Date());
  return Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i - 3);
    const dow = getDay(date);
    const isPast = isBefore(date, today);
    const isClosed = dow === 0;
    const isFull =
      !isPast && !isClosed && !isToday(date) && [3, 7, 12, 18].includes(i);
    return {
      date,
      isoString: format(date, "yyyy-MM-dd"),
      dayNum: format(date, "dd"),
      dayLabel: DAY_LABELS[dow] ?? "S",
      isToday: isToday(date),
      isPast,
      isClosed,
      isFull,
    };
  });
}

interface Props {
  slug: string;
  onNext: (needsDetail: boolean) => void;
}

export function StepServices({ slug, onNext }: Props) {
  const { salonId, salon, isLoading: salonLoading } = useSalon(slug);
  const { services, isLoading: servicesLoading } = useServices(salonId ?? "");

  const {
    date,
    setDate,
    services: selectedServices,
    addService,
    removeService,
    totalPrice,
  } = useBookingStore();

  const strip = useMemo(() => buildStrip(), []);
  const [sheetCategoryId, setSheetCategoryId] = useState<string | null>(null);
  const [sheetOpenCount, setSheetOpenCount] = useState(0);
  const { toast, hideToast } = useToast();

  const grouped = useMemo(() => {
    if (!services) return {};
    return services.reduce(
      (
        acc: Record<string, { category: RawCategory; services: RawService[] }>,
        service: RawService,
      ) => {
        const cat = service.category;
        if (!cat) return acc;
        if (!acc[cat.id]) acc[cat.id] = { category: cat, services: [] };
        acc[cat.id].services.push(service);
        return acc;
      },
      {} as Record<string, { category: RawCategory; services: RawService[] }>,
    );
  }, [services]);

  const groupEntries = useMemo(
    () =>
      Object.values(grouped) as Array<{
        category: RawCategory;
        services: RawService[];
      }>,
    [grouped],
  );

  const sheetGroup = sheetCategoryId ? grouped[sheetCategoryId] : null;
  const sheetServices = sheetGroup?.services ?? [];
  const sheetColor = sheetGroup?.category?.color
    ? saturateColor(sheetGroup.category.color)
    : "#E4E5E7";

  const canProceed = !!date && selectedServices.length > 0;

  function handleServiceSelect(svc: RawService) {
    const isSelected = selectedServices.some((s) => s.id === svc.id);
    if (isSelected) {
      removeService(svc.id);
    } else {
      addService({
        id: svc.id,
        name: svc.name,
        description: svc.description,
        price: svc.price,
        duration: svc.duration,
        requires_specialist: svc.requires_specialist,
        service_questions:
          svc.service_questions as import("@/features/booking/types/booking.types").Service["service_questions"],
      });
      setSheetCategoryId(null);
    }
  }

  function handleShare() {
    if (navigator.share) {
      void navigator.share({
        title: salon?.name ?? "Rara Beauty",
        url: window.location.href,
      });
    } else {
      void navigator.clipboard.writeText(window.location.href);
    }
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 11
      ? "Selamat pagi"
      : hour < 15
        ? "Selamat siang"
        : hour < 18
          ? "Selamat sore"
          : "Selamat malam";

  const isLoading = salonLoading || servicesLoading;

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="px-s20 pt-s48 pb-s20">
          <p className="text-ts-cap1 font-semibold uppercase tracking-widest text-label3 mb-s8">
            {salon?.name ?? "Rara Beauty"}
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-ts-hero font-bold text-label leading-none">
              {greeting}.
            </h1>
            <button
              onClick={handleShare}
              aria-label="Bagikan"
              className="flex h-9 w-9 items-center justify-center rounded-rF border border-sep bg-surface text-label2 transition-all hover:bg-sep active:scale-95"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="px-s16 pt-s4 pb-s12">
          <div className="flex overflow-x-auto scrollbar-hide">
            {strip.map((day) => {
              const isSelected = date === day.isoString;
              const disabled = day.isPast || day.isClosed || day.isFull;

              return (
                <button
                  key={day.isoString}
                  onClick={() => {
                    if (!disabled) setDate(day.isoString);
                  }}
                  disabled={disabled}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center gap-[6px] w-[56px] py-s8",
                    (day.isPast || day.isClosed) &&
                      "opacity-30 cursor-not-allowed",
                    day.isFull && "cursor-not-allowed",
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
                        isSelected && canProceed && "bg-accent",
                      )}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-sep mx-s20 mb-s4" />

        {/* Category cards */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="text-label2">Loading...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-s12 px-s16 pt-s12 pb-32">
            {groupEntries.map(({ category, services: catServices }) => {
              const selectedInCat = catServices.find((s) =>
                selectedServices.some((sel) => sel.id === s.id),
              );

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSheetCategoryId(category.id);
                    setSheetOpenCount((n) => n + 1);
                  }}
                  className="relative w-full overflow-hidden rounded-r24 px-s20 pt-s20 pb-s24 text-left transition-all duration-150 active:scale-[0.98]"
                  style={{ backgroundColor: "#F1F2F3" }}
                >
                  <div
                    className="pointer-events-none absolute right-[-32px] top-[-32px] h-40 w-40 rounded-[45%_55%_60%_40%/50%_40%_60%_50%] opacity-60"
                    style={{
                      background: category.color
                        ? saturateColor(category.color)
                        : "#E4E5E7",
                    }}
                  />
                  <div
                    className="pointer-events-none absolute right-[16px] top-[28px] flex h-[64px] w-[64px] items-center justify-center rounded-full text-3xl"
                    style={{
                      background: category.color
                        ? lightenColor(category.color)
                        : "#F0F0F0",
                    }}
                  >
                    {category.icon ?? "✨"}
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-s8">
                      <div>
                        <p className="text-[18px] font-bold text-label leading-tight">
                          {category.name}
                        </p>
                        {category.description && (
                          <p className="text-[13px] mt-[3px] text-label">
                            {category.description}
                          </p>
                        )}
                      </div>
                      {selectedInCat && (
                        <div className="flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center rounded-full bg-accent mt-[2px]">
                          <svg
                            width="11"
                            height="11"
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
                    </div>

                    <div className="mt-s16 flex flex-col gap-[2px]">
                      {selectedInCat && (
                        <span className="text-[13px] font-semibold text-accent">
                          ✓ {selectedInCat.name}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-label">
                        {catServices.length} layanan tersedia
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-[88px] left-s16 right-s16 z-50 animate-up shadow-button rounded-r16 overflow-hidden">
          <Toast
            title="Tidak Tersedia"
            description={toast}
            variant="warning"
            onClose={() => hideToast()}
          />
        </div>
      )}

      <SelectedServicesIndicator
        services={selectedServices}
        totalPrice={totalPrice}
        onRemoveService={removeService}
      />

      <BottomCTA
        label={
          !date
            ? "Pilih tanggal dulu"
            : selectedServices.length === 0
              ? "Pilih layanan"
              : "Lanjutkan →"
        }
        variant={canProceed ? "ready" : "default"}
        disabled={!canProceed}
        onClick={() => {
          const firstService = selectedServices[0];
          console.log("[StepServices] onNext — firstService:", firstService);
          onNext(firstService?.requires_specialist === true);
        }}
      />

      {/* Bottom Sheet */}
      {sheetCategoryId && sheetGroup && (
        <>
          <div
            className="absolute inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-fadeIn"
            onClick={() => setSheetCategoryId(null)}
          />

          <div
            className="absolute bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[28px] bg-bg animate-sheetUp"
            style={{ maxHeight: "82%" }}
          >
            <div className="flex justify-center pt-s12 pb-s4 flex-shrink-0">
              <div className="h-[4px] w-[36px] rounded-full bg-sep" />
            </div>

            <div className="flex items-center gap-s12 px-s20 pt-s8 pb-s16 flex-shrink-0">
              <div
                className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-r12 text-xl"
                style={{ background: sheetColor, filter: "brightness(0.88)" }}
              >
                {sheetGroup.category.icon ?? "✨"}
              </div>
              <div className="flex-1">
                <h2 className="text-[20px] font-bold text-label leading-tight">
                  {sheetGroup.category.name}
                </h2>
                <p className="text-[13px] text-label3">
                  {sheetServices.length} layanan tersedia
                </p>
              </div>
              <button
                onClick={() => setSheetCategoryId(null)}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-sep text-label2 hover:bg-label hover:text-white transition-all"
                aria-label="Tutup"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="h-px bg-sep mx-s20 flex-shrink-0" />

            <div className="flex-1 overflow-y-auto px-s16 pt-s12 pb-s24">
              {["hair", "colour-treatment", "nail"].includes(
                sheetGroup.category.slug ?? "",
              ) && (
                <Toast
                  key={sheetOpenCount}
                  title="Estimasi Harga"
                  description="Harga akhir menyesuaikan kondisi & produk. Cukup bayar DP dulu."
                  variant="warning"
                  shake
                />
              )}
              <div className="flex flex-col gap-s8">
                {sheetServices.map((svc: RawService) => {
                  const isSelected = selectedServices.some(
                    (sel) => sel.id === svc.id,
                  );
                  return (
                    <button
                      key={svc.id}
                      onClick={() => handleServiceSelect(svc)}
                      className={cn(
                        "w-full rounded-r20 bg-white p-s20 text-left shadow-sm transition-all duration-150 active:scale-[0.98]",
                        isSelected && "ring-2 ring-accent",
                      )}
                    >
                      <div className="flex items-start justify-between gap-s12">
                        <p className="text-[17px] font-bold text-label leading-snug">
                          {svc.name}
                        </p>
                        <div
                          className="flex-shrink-0 mt-[2px] flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 transition-all duration-150"
                          style={
                            isSelected
                              ? {
                                  borderColor: "#4a9b7f",
                                  backgroundColor: "#4a9b7f",
                                }
                              : {
                                  borderColor: sheetColor,
                                  filter: "brightness(0.7)",
                                }
                          }
                        >
                          {isSelected && (
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
                          )}
                        </div>
                      </div>

                      {svc.description && (
                        <p className="mt-[4px] text-[14px] text-label2 leading-snug">
                          {svc.description}
                        </p>
                      )}

                      <div className="mt-s16">
                        <p className="text-[11px] text-label3 font-medium">
                          Mulai dari
                        </p>
                        <p className="text-[14px] font-bold text-label mt-[2px]">
                          {formatRupiah(svc.price)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
