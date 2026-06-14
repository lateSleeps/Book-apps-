"use client";

import { CaretDown, CaretUp, X } from "@phosphor-icons/react";
import { useState } from "react";

import type { Service } from "../../types/booking.types";
import { cn } from "@/shared/lib/cn";
import { formatRupiah } from "@/shared/lib/format";

interface SelectedServicesIndicatorProps {
  services: Service[];
  totalPrice: number;
  onRemoveService: (serviceId: string) => void;
}

export function SelectedServicesIndicator({
  services,
  totalPrice,
  onRemoveService,
}: SelectedServicesIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!services || services.length === 0) return null;

  const firstService = services[0];

  return (
    <div className="px-s16 mb-s12">
      {!isExpanded ? (
        /* ── Collapsed — Apple Wallet compact summary pill ── */
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "w-full flex items-center justify-between gap-s12",
            "px-s16 py-s12 rounded-r16 bg-surface border border-sep",
            "transition-all active:scale-[0.98] shadow-sm text-left",
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-label leading-tight truncate">
              {firstService?.name}
              {services.length > 1 && (
                <span className="text-label3 font-normal">
                  {" "}
                  +{services.length - 1} lainnya
                </span>
              )}
            </p>
            <p className="text-[13px] text-label3 mt-[3px]">
              {formatRupiah(totalPrice)}
            </p>
          </div>
          <CaretDown
            size={14}
            weight="duotone"
            className="flex-shrink-0 text-label3"
          />
        </button>
      ) : (
        /* ── Expanded — Apple Store checkout summary ── */
        <div className="rounded-[20px] bg-surface border border-sep overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between px-s20 pt-s20 pb-s4">
            <div>
              <p className="text-[17px] font-semibold text-label leading-tight">
                Layanan Dipilih
              </p>
              <p className="text-[13px] text-label3 mt-[3px]">
                {services.length} layanan
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              aria-label="Tutup"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-sep text-label3 hover:bg-label hover:text-surface transition-all mt-[2px]"
            >
              <CaretUp size={14} weight="duotone" />
            </button>
          </div>

          {/* Service rows — no dividers between, breathing room only */}
          <div className="px-s20 pt-s16 pb-s4 flex flex-col gap-[18px]">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="flex items-start justify-between gap-s12"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-medium text-label leading-snug">
                    {svc.name}
                  </p>
                  <p className="text-[13px] text-label3 mt-[3px]">
                    {svc.duration} menit · {formatRupiah(svc.price)}
                  </p>
                </div>
                {/* Remove — subtle text action, never dominant */}
                <button
                  onClick={() => onRemoveService(svc.id)}
                  aria-label={`Hapus ${svc.name}`}
                  className="flex-shrink-0 flex items-center gap-[4px] text-[13px] text-label3 hover:text-c-salmon transition-colors mt-[2px]"
                >
                  <X size={12} weight="duotone" />
                  <span>Hapus</span>
                </button>
              </div>
            ))}
          </div>

          {/* Single divider before total */}
          <div className="mx-s20 mt-s16 h-px bg-sep" />

          {/* Total */}
          <div className="px-s20 pt-s16 pb-s20 flex items-end justify-between">
            <p className="text-[14px] text-label3 leading-none">
              Estimasi Total
            </p>
            <p className="text-[26px] font-semibold text-label leading-none">
              {formatRupiah(totalPrice)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
