"use client";

import { salonHeaderStyles as s } from "./SalonHeader.styles";

interface SalonHeaderProps {
  name: string;
  description?: string | null;
  onShare?: () => void;
}

export function SalonHeader({ name, description, onShare }: SalonHeaderProps) {
  const subtitle =
    description ?? "Pilih layanan dan waktu yang sesuai untuk kunjungan Anda.";

  return (
    <div className={s.root}>
      <div className={s.inner}>
        <div className={s.content}>
          <p className={s.eyebrow}>Booking</p>
          <h1 className={s.name}>{name}</h1>
          <p className={s.subtitle}>{subtitle}</p>
        </div>

        <div className={s.actions}>
          <a href="/check-booking" className={s.checkBtn}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            Cek Booking
          </a>
          {onShare && (
            <button
              onClick={onShare}
              aria-label="Bagikan"
              className={s.shareBtn}
            >
              <svg
                width="14"
                height="14"
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
          )}
        </div>
      </div>
    </div>
  );
}
