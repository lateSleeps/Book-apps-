"use client";

import { CheckCircle } from "@phosphor-icons/react";

import { serviceCardStyles as s } from "./ServiceCard.styles";
import { cn } from "@/shared/lib/cn";
import { formatRupiah } from "@/shared/lib/format";

export interface ServiceCardService {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  price_type?: "fixed" | "starting_from";
}

interface ServiceCardProps {
  service: ServiceCardService;
  isSelected: boolean;
  onSelect: () => void;
}

export function ServiceCard({
  service,
  isSelected,
  onSelect,
}: ServiceCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(s.card, isSelected ? s.cardSelected : s.cardDefault)}
    >
      {/* Top: service name + selection indicator */}
      <div className={s.topRow}>
        <p className={s.name}>{service.name}</p>
        <CheckCircle
          size={22}
          weight={isSelected ? "fill" : "regular"}
          className={cn(
            s.checkBadge,
            isSelected
              ? "opacity-100 text-accent"
              : "opacity-0 text-tx-tertiary",
          )}
        />
      </div>

      {/* Description — wraps naturally, never clipped */}
      {service.description && (
        <p className={s.description}>{service.description}</p>
      )}

      {/* Bottom: duration left, price right */}
      <div className={s.bottomRow}>
        <span className={s.duration}>{service.duration} menit</span>
        <div className={s.priceWrapper}>
          {service.price_type === "starting_from" && (
            <span className={s.priceNote}>mulai</span>
          )}
          <span className={s.price}>{formatRupiah(service.price)}</span>
        </div>
      </div>
    </button>
  );
}
