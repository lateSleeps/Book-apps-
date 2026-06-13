'use client';

import { ArrowSquareOut, Copy } from '@phosphor-icons/react';
import { useState } from 'react';
import { SettingsContentCard } from '../../layout';

interface PublicLinkCardProps {
  slug: string | null;
}

export function PublicLinkCard({ slug }: PublicLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const customerOrigin = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL ?? '';
  const bookingUrl = slug ? `${customerOrigin}/book/${slug}` : null;

  function handleCopy() {
    if (!bookingUrl) return;
    void navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleOpen() {
    if (!bookingUrl) return;
    window.open(bookingUrl, '_blank');
  }

  return (
    <SettingsContentCard padding="tight">
      <div className="flex items-center gap-s12">
        {/* Label */}
        <div className="min-w-0 flex-1">
          <p className="text-ts-fn font-semibold text-tx-primary">Link Booking Publik</p>
          <p className="mt-s2 truncate text-ts-fn text-tx-secondary">
            {bookingUrl ?? (
              <span className="italic text-tx-muted">Slug belum diatur di Brand &amp; Profil</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-s6">
          <button
            onClick={handleCopy}
            disabled={!bookingUrl}
            className="px-s10 text-ts-cap flex items-center gap-s6 rounded-r8 border border-bd-card bg-bg-card py-s6 font-medium text-tx-primary transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy size={13} />
            {copied ? 'Disalin!' : 'Salin'}
          </button>
          <button
            onClick={handleOpen}
            disabled={!bookingUrl}
            className="px-s10 text-ts-cap flex items-center gap-s6 rounded-r8 border border-bd-card bg-bg-card py-s6 font-medium text-tx-primary transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowSquareOut size={13} />
            Buka
          </button>
        </div>
      </div>
    </SettingsContentCard>
  );
}
