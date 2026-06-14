"use client";

import {
  EnvelopeSimple,
  ShareNetwork,
  Ticket,
  WhatsappLogo,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useState } from "react";

import { salonHeroStyles as s } from "./SalonHero.styles";

// Static fallback cover used when the salon hasn't uploaded a cover image yet
const STATIC_COVER = "/images/salon-cover.jpg";

export interface SalonData {
  name: string;
  description?: string | null;
  tagline?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface SalonHeroProps {
  salon: SalonData | null;
  isLoading: boolean;
  onShare: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export function SalonHero({ salon, isLoading, onShare }: SalonHeroProps) {
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const name = salon?.name ?? "";
  const tagline =
    salon?.tagline ||
    salon?.description ||
    "Pilih layanan dan waktu yang sesuai untuk kunjungan Anda.";

  const hasCover = !!salon?.cover_image_url && !coverError;
  const hasLogo = !!salon?.logo_url && !logoError;

  const handleShare = useCallback(() => {
    onShare();
  }, [onShare]);

  return (
    <div className={s.root}>
      {/* ── Cover ── */}
      <div className={s.cover}>
        {hasCover ? (
          <img
            src={salon!.cover_image_url!}
            alt={name}
            className={s.coverImg}
            onError={() => setCoverError(true)}
          />
        ) : (
          <Image
            src={STATIC_COVER}
            alt="Salon cover"
            fill
            className={s.coverImg}
            priority
            quality={85}
          />
        )}
        <div className={s.coverOverlay} />
      </div>

      {/* ── Identity block ── */}
      <div className={s.identity}>
        {/* Row: logo (left, overlapping cover) + actions (right) */}
        <div className={s.logoRow}>
          {/* Logo — large square iOS app-icon style */}
          {isLoading ? (
            <div className={s.skeletonLogo} />
          ) : hasLogo ? (
            <img
              src={salon!.logo_url!}
              alt={name}
              className={s.logoImg}
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className={s.logoFallback}>
              <span className={s.logoInitials}>
                {name ? getInitials(name) : "S"}
              </span>
            </div>
          )}

          {/* Actions — share + Cek Booking */}
          <div className={s.actions}>
            <button
              onClick={handleShare}
              aria-label="Bagikan"
              className={s.shareBtn}
            >
              <ShareNetwork size={20} weight="duotone" />
            </button>
            <a href="/check-booking" className={s.checkBtn}>
              <Ticket size={20} weight="duotone" className={s.checkBtnIcon} />
              Cek Booking
            </a>
          </div>
        </div>

        {/* Name + tagline + contact info */}
        {isLoading ? (
          <>
            <div className={s.skeletonName} />
            <div className={s.skeletonTagline} />
          </>
        ) : (
          <>
            <h1 className={s.name}>{name}</h1>
            <p className={s.tagline}>{tagline}</p>

            <div className={s.contactList}>
              {salon?.email && (
                <div className={s.contactRow}>
                  <EnvelopeSimple
                    size={20}
                    weight="duotone"
                    className={s.contactIcon}
                  />
                  <span className={s.contactText}>{salon.email}</span>
                </div>
              )}
              {salon?.phone && (
                <div className={s.contactRow}>
                  <WhatsappLogo
                    size={20}
                    weight="duotone"
                    className={s.contactIcon}
                  />
                  <span className={s.contactText}>{salon.phone}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
