'use client';

import { MapPin, Phone } from '@phosphor-icons/react';

/**
 * Minimal data contract for the booking page preview.
 * Does NOT depend on BrandProfile or any domain-specific type.
 * Consumers map their own domain state to this interface.
 */
export interface BookingPagePreviewData {
  salonName: string;
  tagline: string;
  description: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  phone: string;
  city: string;
}

interface BookingPagePreviewProps {
  data: BookingPagePreviewData;
}

/**
 * Lightweight live preview of the customer booking page header.
 * Renders synchronously from props — no API calls, no async.
 * Reusable by: Brand domain, Booking App domain, Theme Editor.
 */
export function BookingPagePreview({ data }: BookingPagePreviewProps) {
  return (
    <div className="flex flex-col overflow-hidden text-left">
      {/* Cover image */}
      <div className="relative h-28 w-full bg-bg-control">
        {data.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-ts-cap2 text-tx-muted">Foto cover belum diupload</p>
          </div>
        )}

        {/* Logo overlapping cover */}
        <div className="absolute -bottom-7 left-s16">
          <div className="h-14 w-14 overflow-hidden rounded-r16 border-2 border-bg-card bg-bg-control shadow-card">
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-ts-body font-bold text-tx-muted">
                  {data.salonName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Salon info */}
      <div className="px-s16 pb-s16 pt-s32">
        <h3 className="text-ts-sub font-bold text-tx-primary">{data.salonName || 'Nama Salon'}</h3>

        {data.tagline && <p className="mt-s4 text-ts-cap1 text-tx-secondary">{data.tagline}</p>}

        {data.description && (
          <p className="mt-s8 line-clamp-2 text-ts-cap1 text-tx-subtle">{data.description}</p>
        )}

        {/* Contact chips */}
        <div className="mt-s12 flex flex-wrap gap-s8">
          {data.phone && (
            <div className="flex items-center gap-s4 rounded-rF bg-bg-control px-s8 py-s4">
              <Phone size={11} weight="fill" className="text-tx-secondary" />
              <span className="text-ts-cap2 text-tx-subtle">{data.phone}</span>
            </div>
          )}
          {data.city && (
            <div className="flex items-center gap-s4 rounded-rF bg-bg-control px-s8 py-s4">
              <MapPin size={11} weight="fill" className="text-tx-secondary" />
              <span className="text-ts-cap2 text-tx-subtle">{data.city}</span>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          disabled
          aria-hidden="true"
          className="mt-s16 w-full cursor-default rounded-r12 bg-ac-primary py-s12 text-ts-fn font-semibold text-white opacity-90"
        >
          Booking Sekarang
        </button>

        <p className="mt-s8 text-center text-ts-cap2 text-tx-muted">
          Pratinjau — tampilan aktual dapat berbeda
        </p>
      </div>
    </div>
  );
}
