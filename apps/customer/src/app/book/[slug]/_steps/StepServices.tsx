"use client";

import { CaretRight, X } from "@phosphor-icons/react";
import {
  addDays,
  format,
  getDay,
  isBefore,
  isToday,
  startOfDay,
} from "date-fns";
import { useMemo, useState, useEffect, useCallback } from "react";
import { BottomCTA } from "@/features/booking/components/bottom-cta";
import { SalonHero } from "@/features/booking/components/salon-hero/SalonHero";
import { SelectedServicesIndicator } from "@/features/booking/components/selected-services-indicator";
import { ServiceCard } from "@/features/booking/components/service-card/ServiceCard";
import { Toast } from "@/features/booking/components/toast/Toast";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { useToast } from "@/features/booking/hooks/use-toast";
import type { Service } from "@/features/booking/types/booking.types";
import { useSalon, useServices } from "@/hooks";
import { InlineNotice } from "@/shared/components/ui/InlineNotice";
import { SegmentedControl } from "@/shared/components/ui/segmented-control/SegmentedControl";
import { cn } from "@/shared/lib/cn";
import { resolveIcon, resolveIconBySlug } from "@/shared/lib/resolveIcon";

// Indonesian short day labels Sun→Sat
const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// ── Color helpers — derive pastel backgrounds from owner-configured hex ──────
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
  return (
    "#" +
    [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)]
      .map((x) =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function lightenColor(hex: string): string {
  const [h, s] = hexToHsl(hex);
  return hslToHex(h, Math.min(1, s * 1.8), 0.94);
}

function saturateColor(hex: string): string {
  const [h, s] = hexToHsl(hex);
  return hslToHex(h, Math.min(1, s * 2.5), 0.78);
}

// ── Date strip builder ────────────────────────────────────────────────────────
function buildStrip() {
  const today = startOfDay(new Date());
  return Array.from({ length: 30 }, (_, i) => {
    const d = addDays(today, i);
    const dow = getDay(d);
    const isPast = isBefore(d, today);
    const isClosed = dow === 0;
    return {
      isoString: format(d, "yyyy-MM-dd"),
      dayNum: format(d, "d"),
      dayLabel: DAY_LABELS[dow] ?? "Sen",
      isToday: isToday(d),
      isPast,
      isClosed,
    };
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────
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
  price_type?: "fixed" | "starting_from";
  requires_specialist?: boolean;
  service_questions?: unknown[];
};

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  slug: string;
  onNext: (needsDetail: boolean) => void;
}

export function StepServices({ slug, onNext }: Props) {
  const {
    salon,
    salonId,
    isLoading: salonLoading,
    error: salonError,
  } = useSalon(slug);
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
  const [activeTab, setActiveTab] = useState("services");
  const [sheetCategoryId, setSheetCategoryId] = useState<string | null>(null);
  const [sheetOpenCount, setSheetOpenCount] = useState(0);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  useEffect(() => {
    setNoticeDismissed(false);
  }, [sheetOpenCount]);
  const { toast, hideToast } = useToast();

  const handleShare = useCallback(() => {
    if (navigator.share) {
      void navigator.share({
        title: salon?.name ?? "Booking",
        url: window.location.href,
      });
    } else {
      void navigator.clipboard.writeText(window.location.href);
    }
  }, [salon?.name]);

  // ── Group services by category ─────────────────────────────────────────────
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
        price_type: svc.price_type,
        requires_specialist: svc.requires_specialist,
        service_questions:
          svc.service_questions as Service["service_questions"],
      });
      setSheetCategoryId(null);
    }
  }

  const canProceed = !!date && selectedServices.length > 0;
  const isLoading = salonLoading || servicesLoading;

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-bg-page">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* ── Salon profile hero ────────────────────────── */}
        <SalonHero
          salon={salon}
          isLoading={salonLoading}
          onShare={handleShare}
        />

        {/* ── Date selection — unified with hero ───────── */}
        <div className="bg-bg-page px-s20 pt-s20 pb-s24">
          {/* Contextual label */}
          <p className="text-ts-cap1 font-semibold text-tx-secondary uppercase tracking-wider mb-s16">
            Pilih tanggal kunjungan
          </p>

          {/* Individual date pills — white cards on gray page */}
          <div className="flex gap-[6px]">
            {strip.slice(0, 7).map((day) => {
              const sel = date === day.isoString;
              const dis = day.isPast || day.isClosed;
              const today = day.isToday;
              return (
                <button
                  key={day.isoString}
                  disabled={dis}
                  onClick={() => {
                    if (!dis) setDate(day.isoString);
                  }}
                  className={cn(
                    "flex-1 flex flex-col items-center py-s12 rounded-r16 transition-all duration-150",
                    dis && "opacity-25 pointer-events-none",
                    sel
                      ? "bg-label"
                      : "bg-bg-card border border-bd-card shadow-tab",
                  )}
                >
                  <span className="text-t14 font-medium leading-none">
                    <span
                      className={cn(
                        sel
                          ? "text-surface"
                          : today
                            ? "text-accent"
                            : "text-tx-secondary",
                      )}
                    >
                      {day.dayLabel}
                    </span>
                  </span>
                  <span className="text-t18 font-bold leading-none mt-s8">
                    <span
                      className={cn(
                        sel
                          ? "text-surface"
                          : today
                            ? "text-accent"
                            : "text-tx-primary",
                      )}
                    >
                      {day.dayNum}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Category list — booking content begins here ── */}
        <div className="px-s16 pb-s24">
          <div className="bg-bg-card rounded-r20 shadow-card border border-bd-card overflow-hidden">
            {/* Tabs */}
            <div className="px-s12 pt-s16 pb-s8 border-b border-bd-row">
              <SegmentedControl
                items={[
                  { id: "services", label: "Layanan" },
                  { id: "paket", label: "Paket" },
                ]}
                activeId={activeTab}
                onChange={setActiveTab}
                fullWidth
              />
            </div>

            {/* Content */}
            {salonError ? (
              <div className="px-s20 py-16 text-center">
                <p className="text-ts-head font-semibold text-c-salmon mb-s8">
                  Salon tidak ditemukan
                </p>
                <p className="text-ts-fn text-label3">
                  Salon &quot;{slug}&quot; tidak tersedia.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col">
                {[1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    className="flex w-full items-stretch pl-s16 animate-pulse"
                  >
                    {/* Icon column */}
                    <div className="flex-shrink-0 flex items-center py-[22px] pr-[12px]">
                      <div className="h-[56px] w-[56px] rounded-r16 bg-bg-control" />
                    </div>
                    {/* Text column — border-b as inset divider */}
                    <div
                      className={cn(
                        "flex flex-1 items-center gap-s16 py-[22px] pr-s16",
                        i < 4 && "border-b border-bd-card",
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-[6px]">
                          <div className="h-[15px] w-[90px] bg-sep rounded-r8" />
                          <div className="h-[13px] w-[48px] bg-sep rounded-r8" />
                        </div>
                        <div className="h-[13px] w-[160px] bg-sep rounded-r8" />
                      </div>
                      <div className="h-[16px] w-[16px] bg-sep rounded-full opacity-40" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col">
                {groupEntries.map(
                  ({ category, services: catServices }, index) => {
                    const selectedInCat = catServices.find((svc) =>
                      selectedServices.some((sel) => sel.id === svc.id),
                    );
                    const CategoryIcon = resolveIconBySlug(
                      category.icon,
                      category.slug,
                    );
                    const preview = catServices
                      .slice(0, 2)
                      .map((s) => s.name)
                      .join(" • ");
                    const isLast = index === groupEntries.length - 1;

                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSheetCategoryId(category.id);
                          setSheetOpenCount((n) => n + 1);
                        }}
                        className={cn(
                          "flex w-full items-stretch pl-s16 text-left",
                          "transition-all duration-200 hover:bg-black/[0.015] active:scale-[0.995]",
                          selectedInCat && "bg-accent/5",
                        )}
                      >
                        {/* Icon column — centered, own padding */}
                        <div className="flex-shrink-0 flex items-center py-[22px] pr-[12px]">
                          <div
                            className="flex h-[56px] w-[56px] items-center justify-center rounded-r16"
                            style={{
                              background: lightenColor(
                                category.color ?? "#e8e7e3",
                              ),
                            }}
                          >
                            <CategoryIcon
                              size={26}
                              weight="duotone"
                              className="text-tx-primary"
                            />
                          </div>
                        </div>

                        {/* Text + chevron column — border-b IS the divider */}
                        <div
                          className={cn(
                            "flex flex-1 min-w-0 items-center gap-s16 py-[22px] pr-s16",
                            !isLast && "border-b border-bd-card",
                          )}
                        >
                          {/* Text block */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-[8px]">
                              <p className="text-[17px] font-semibold text-tx-primary leading-tight truncate">
                                {category.name}
                              </p>
                              {!selectedInCat && (
                                <span className="text-[13px] font-medium text-tx-secondary flex-shrink-0">
                                  {catServices.length} layanan
                                </span>
                              )}
                            </div>
                            <p
                              className={cn(
                                "text-[14px] font-normal mt-[4px] leading-snug truncate",
                                selectedInCat
                                  ? "text-accent"
                                  : "text-tx-secondary",
                              )}
                            >
                              {selectedInCat ? selectedInCat.name : preview}
                            </p>
                          </div>

                          {/* Chevron */}
                          <CaretRight
                            size={18}
                            weight="duotone"
                            className={cn(
                              "flex-shrink-0 opacity-50",
                              selectedInCat
                                ? "text-accent"
                                : "text-tx-tertiary",
                            )}
                          />
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast ─────────────────────────────────────── */}
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
              ? "Pilih layanan dulu"
              : "Lanjutkan →"
        }
        variant={canProceed ? "ready" : "default"}
        disabled={!canProceed}
        onClick={() => {
          const needsDetail = selectedServices.some(
            (service) => service.price_type === "starting_from",
          );
          onNext(needsDetail);
        }}
      />

      {/* ── Bottom Sheet ──────────────────────────────── */}
      {sheetCategoryId && sheetGroup && (
        <>
          <div
            className="absolute inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-fadeIn"
            onClick={() => setSheetCategoryId(null)}
          />

          <div
            className="absolute bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[28px] bg-bg-card animate-sheetUp"
            style={{ maxHeight: "82%" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-s12 pb-s4 flex-shrink-0">
              <div className="h-[4px] w-[36px] rounded-full bg-bd-card" />
            </div>

            {/* Sheet header */}
            <div className="flex items-center gap-s16 px-s20 pt-s12 pb-s16 flex-shrink-0">
              {(() => {
                const SheetIcon = resolveIconBySlug(
                  sheetGroup.category.icon,
                  sheetGroup.category.slug,
                );
                return (
                  <div
                    className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-r16"
                    style={{
                      background: lightenColor(
                        sheetGroup.category.color ?? "#e8e7e3",
                      ),
                    }}
                  >
                    <SheetIcon
                      size={22}
                      weight="duotone"
                      className="text-tx-primary"
                    />
                  </div>
                );
              })()}
              <div className="flex-1 min-w-0">
                <h2 className="text-ts-t3 font-semibold text-label leading-tight">
                  {sheetGroup.category.name}
                </h2>
                <p className="text-ts-fn text-tx-secondary mt-[2px]">
                  {sheetServices.length} layanan tersedia
                </p>
              </div>
              <button
                onClick={() => setSheetCategoryId(null)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-bg-control border border-bd-card text-tx-secondary hover:bg-label hover:text-white transition-all duration-200"
                aria-label="Tutup"
              >
                <X size={16} weight="duotone" />
              </button>
            </div>

            <div className="h-px bg-bd-card mx-s20 flex-shrink-0" />

            {/* Services inside sheet */}
            <div className="flex-1 overflow-y-auto px-s16 pt-s12 pb-s24">
              {["hair", "colour-treatment", "nail"].includes(
                sheetGroup.category.slug ?? "",
              ) &&
                !noticeDismissed && (
                  <InlineNotice
                    variant="info"
                    title="Harga Estimasi"
                    description="Harga akhir ditentukan setelah konsultasi."
                    onDismiss={() => setNoticeDismissed(true)}
                    className="mb-s16"
                  />
                )}

              {/* Product picker — independent cards */}
              <div className="flex flex-col gap-[12px]">
                {sheetServices.map((svc: RawService) => (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    isSelected={selectedServices.some(
                      (sel) => sel.id === svc.id,
                    )}
                    onSelect={() => handleServiceSelect(svc)}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
