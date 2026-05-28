"use client";

import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  useBookingStore,
  SelectedServicesIndicator,
  StepHeader,
  BottomCTA,
} from "@/features/booking";
import { useSalon, useServices } from "@/hooks";
import { cn } from "@/shared/lib/cn";
import { formatRupiah } from "@/shared/lib/format";

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
};

const PALETTE = [
  { color: "bg-c-peach", blobColor: "#f5c4ab", icon: "✂️" },
  { color: "bg-c-blue", blobColor: "#b8d6f0", icon: "🎨" },
  { color: "bg-c-mint", blobColor: "#a8e6d4", icon: "💆" },
  { color: "bg-c-yellow", blobColor: "#f5d98a", icon: "🪷" },
  { color: "bg-c-lilac", blobColor: "#c8bef0", icon: "💅" },
];

function guessIcon(name: string, fallback: string): string {
  const n = name.toLowerCase();
  if (n.includes("hair") || n.includes("rambut")) return "✂️";
  if (n.includes("colour") || n.includes("color") || n.includes("warna"))
    return "🎨";
  if (n.includes("face") || n.includes("lash") || n.includes("wajah"))
    return "💆";
  if (n.includes("massage") || n.includes("pijat")) return "🪷";
  if (n.includes("nail") || n.includes("kuku")) return "💅";
  return fallback;
}

export default function ServicesPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const {
    salonId,
    isLoading: salonLoading,
    error: salonError,
  } = useSalon(slug);
  const {
    services,
    isLoading: servicesLoading,
    error: servicesError,
  } = useServices(salonId ?? "");
  const {
    services: selectedServices,
    addService,
    removeService,
  } = useBookingStore();

  const grouped = useMemo(() => {
    if (!services) return {};
    return services.reduce(
      (acc, service: RawService) => {
        const cat = service.category;
        if (!cat) return acc;
        if (!acc[cat.id]) acc[cat.id] = { category: cat, services: [] };
        acc[cat.id].services.push(service);
        return acc;
      },
      {} as Record<string, { category: RawCategory; services: RawService[] }>,
    );
  }, [services]);

  const handleToggle = (svc: RawService) => {
    if (selectedServices.some((s: RawService) => s.id === svc.id)) {
      removeService(svc.id);
    } else {
      addService(svc);
      setActiveCategory(null);
    }
  };

  const activeGroup = activeCategory ? grouped[activeCategory] : null;
  const sheetServices = activeGroup?.services ?? [];
  const sheetPalette = activeCategory
    ? PALETTE[Object.keys(grouped).indexOf(activeCategory) % PALETTE.length]
    : PALETTE[0];

  if (salonLoading || servicesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-label2">Loading...</div>
      </div>
    );
  }

  if (salonError || servicesError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">{salonError || servicesError}</div>
      </div>
    );
  }

  const groupEntries = Object.values(grouped);

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <StepHeader title="Pilih Layanan" step={1} />

        {groupEntries.length === 0 ? (
          <div className="py-16 text-center text-label3">
            Tidak ada layanan tersedia
          </div>
        ) : (
          <div className="flex flex-col gap-s12 px-s16 pt-s12 pb-32">
            {groupEntries.map(({ category, services: catServices }, i) => {
              const palette = PALETTE[i % PALETTE.length];
              const icon =
                category.icon ?? guessIcon(category.name, palette.icon);
              const selectedInCat = catServices.find((s: RawService) =>
                selectedServices.some((sel: RawService) => sel.id === s.id),
              );

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "relative w-full overflow-hidden rounded-r24 px-s20 pt-s20 pb-s24 text-left transition-all duration-150 active:scale-[0.98]",
                    palette.color,
                  )}
                >
                  {/* Big blob top-right */}
                  <div
                    className="pointer-events-none absolute right-[-32px] top-[-32px] h-40 w-40 rounded-[45%_55%_60%_40%/50%_40%_60%_50%] opacity-60"
                    style={{ background: palette.blobColor }}
                  />
                  {/* Icon circle */}
                  <div
                    className="pointer-events-none absolute right-[16px] top-[28px] flex h-[64px] w-[64px] items-center justify-center rounded-full text-3xl"
                    style={{ background: palette.blobColor }}
                  >
                    {icon}
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

      <SelectedServicesIndicator
        services={selectedServices}
        totalPrice={selectedServices.reduce(
          (sum: number, s: RawService) => sum + (s.price ?? 0),
          0,
        )}
        onRemoveService={removeService}
      />
      <BottomCTA
        onClick={() => {
          const firstService = selectedServices[0] as RawService | undefined;
          const needsDetail = firstService?.requires_specialist === true;
          router.push(
            needsDetail
              ? `/book/${slug}/steps/service-detail`
              : `/book/${slug}/steps/stylist`,
          );
        }}
        disabled={selectedServices.length === 0}
      />

      {/* Bottom sheet */}
      {activeCategory && activeGroup && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-fadeIn"
            onClick={() => setActiveCategory(null)}
          />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[28px] bg-bg animate-sheetUp"
            style={{ maxHeight: "82%" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-s12 pb-s4 flex-shrink-0">
              <div className="h-[4px] w-[36px] rounded-full bg-sep" />
            </div>

            {/* Sheet header */}
            <div className="flex items-center gap-s12 px-s20 pt-s8 pb-s16 flex-shrink-0">
              <div
                className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-r12 text-xl"
                style={{ background: sheetPalette.blobColor }}
              >
                {activeGroup.category.icon ??
                  guessIcon(activeGroup.category.name, sheetPalette.icon)}
              </div>
              <div className="flex-1">
                <h2 className="text-[20px] font-bold text-label leading-tight">
                  {activeGroup.category.name}
                </h2>
                <p className="text-[13px] text-label3">
                  {sheetServices.length} layanan tersedia
                </p>
              </div>
              <button
                onClick={() => setActiveCategory(null)}
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

            {/* Service list */}
            <div className="flex-1 overflow-y-auto px-s16 pt-s12 pb-s24">
              <div className="flex flex-col gap-s8">
                {sheetServices.map((svc: RawService) => {
                  const isSelected = selectedServices.some(
                    (sel: RawService) => sel.id === svc.id,
                  );
                  return (
                    <button
                      key={svc.id}
                      onClick={() => handleToggle(svc)}
                      className={cn(
                        "w-full rounded-r20 bg-white p-s20 text-left shadow-sm transition-all duration-150 active:scale-[0.98]",
                        isSelected && "ring-2 ring-accent",
                      )}
                    >
                      {/* Name + checkbox */}
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
                                  borderColor: sheetPalette.blobColor,
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

                      {/* Description */}
                      {svc.description && (
                        <p className="mt-[4px] text-[14px] text-label2 leading-snug">
                          {svc.description}
                        </p>
                      )}

                      {/* Price */}
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
