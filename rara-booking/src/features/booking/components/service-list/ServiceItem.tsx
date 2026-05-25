'use client';

import type { Service } from '../../types/booking.types';
import { cn } from '@/shared/lib/cn';
import { formatRupiah, formatDuration } from '@/shared/lib/format';

export interface ServiceItemProps {
  service: Service;
  isSelected: boolean;
  onSelect: ((service: Service) => void) | undefined;
  isMultiSelect?: boolean;
}

/** Single service list item — supports single or multi-select mode */
export function ServiceItem({ service, isSelected, onSelect, isMultiSelect }: ServiceItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(service)}
      aria-pressed={isSelected}
      className={cn(
        'flex w-full items-start gap-s16 rounded-r20 border-2 p-s16',
        'text-left transition-all duration-140 active:scale-[0.98] bg-surface',
        isSelected
          ? 'border-accent shadow-[0_0_0_3px_rgba(74,155,127,0.1)]'
          : 'border-sep'
      )}
    >
      {isMultiSelect && (
        <div className={cn(
          'flex-shrink-0 w-6 h-6 rounded-[6px] border-2 flex items-center justify-center mt-[2px]',
          isSelected ? 'bg-accent border-accent' : 'border-label3'
        )}>
          {isSelected && (
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      )}
      <div className="flex flex-col gap-[2px] flex-1">
        <span
          className={cn(
            'text-t16 font-semibold',
            isSelected ? 'text-accent-dark' : 'text-label'
          )}
        >
          {service.name}
        </span>
        <span className="text-t14 text-label2">{service.description}</span>
        <span className="text-t12 text-label3">{formatDuration(service.duration)}</span>
      </div>
      <span
        className={cn(
          'shrink-0 text-t14 font-semibold',
          isSelected ? 'text-accent-dark' : 'text-label'
        )}
      >
        {formatRupiah(service.price)}
      </span>
    </button>
  );
}
