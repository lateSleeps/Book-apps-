'use client';

import type { Service } from '../../types/booking.types';
import { ServiceItem } from './ServiceItem';

export interface ServiceListProps {
  services: Service[];
  selectedService?: Service | null;
  selectedServices?: Service[];
  onSelect?: (service: Service) => void;
  onToggle?: (service: Service) => void;
  isMultiSelect?: boolean;
}

/** Vertical list of services for a category — supports single or multi-select */
export function ServiceList({
  services,
  selectedService,
  selectedServices = [],
  onSelect,
  onToggle,
  isMultiSelect = false
}: ServiceListProps) {
  return (
    <div className="flex flex-col gap-s8 px-s20 py-s20">
      {services.map((svc) => (
        <ServiceItem
          key={svc.id}
          service={svc}
          isSelected={isMultiSelect ? selectedServices.some((s) => s.id === svc.id) : selectedService?.id === svc.id}
          onSelect={isMultiSelect ? onToggle : onSelect}
          isMultiSelect={isMultiSelect}
        />
      ))}
    </div>
  );
}
