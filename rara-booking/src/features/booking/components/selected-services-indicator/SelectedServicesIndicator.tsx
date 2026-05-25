'use client';

import { useState } from 'react';
import type { Service } from '../../types/booking.types';

interface SelectedServicesIndicatorProps {
  services: Service[];
  totalPrice: number;
  onRemoveService: (serviceId: string) => void;
}

/** Compact badge showing selected services count - expands to show details */
export function SelectedServicesIndicator({
  services,
  onRemoveService,
}: SelectedServicesIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (services.length === 0) return null;

  return (
    <div className="px-s20 mb-s16">
      {!isExpanded ? (
        /* Compact badge */
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between gap-s12 px-s16 py-s12 rounded-r16 bg-accent border-2 border-accent text-white font-semibold text-[14px] transition-all active:scale-[0.98] shadow-[0_4px_12px_rgba(74,155,127,0.2)]"
        >
          <div className="flex items-center gap-s8">
            <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span>{services.length} Layanan Dipilih</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      ) : (
        /* Expanded card */
        <div className="rounded-r16 bg-white border-2 border-accent overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-accent px-s16 py-s12 flex items-center justify-between">
            <span className="text-white font-semibold text-[14px]">{services.length} Layanan Dipilih</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex h-[20px] w-[20px] items-center justify-center rounded hover:bg-white/20 transition-colors"
              aria-label="Tutup"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Service list */}
          <div className="px-s16 py-s12 space-y-s8">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="flex items-center justify-between gap-s8 p-s12 rounded-r12 bg-accent/5 border border-accent/20"
              >
                <span className="text-[13px] font-semibold text-label flex-1">{svc.name}</span>
                <button
                  onClick={() => onRemoveService(svc.id)}
                  aria-label={`Hapus ${svc.name}`}
                  className="flex-shrink-0 flex h-[18px] w-[18px] items-center justify-center hover:bg-red-100 rounded transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E8705A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
