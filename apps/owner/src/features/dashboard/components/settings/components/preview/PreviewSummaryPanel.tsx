'use client';

import {
  ArrowClockwise,
  ArrowSquareOut,
  CheckCircle,
  Copy,
  Warning,
  XCircle,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { SettingsPanel } from '../../layout';
import type { BookingReadiness, ReadinessStatus } from '@/server/settings/services/preview.service';
import { cn } from '@/shared/lib/cn';

// ── Check icons ───────────────────────────────────────────────────────────────

function CheckIcon({ status }: { status: ReadinessStatus }) {
  if (status === 'pass')
    return <CheckCircle size={15} weight="fill" className="shrink-0 text-green-500" />;
  if (status === 'warn')
    return <Warning size={15} weight="fill" className="shrink-0 text-yellow-500" />;
  return <XCircle size={15} weight="fill" className="shrink-0 text-red-500" />;
}

// ── Label maps ────────────────────────────────────────────────────────────────

const CHECK_LABELS: Record<keyof BookingReadiness['checks'], string> = {
  services: 'Layanan aktif',
  staff: 'Staff aktif',
  operational: 'Jam operasional',
  booking: 'Metode pembayaran',
  branding: 'Nama salon',
  slug: 'URL booking',
};

const CHECK_HINTS: Record<keyof BookingReadiness['checks'], string> = {
  services: 'Tambah minimal 1 layanan aktif di Layanan.',
  staff: 'Tambah minimal 1 staff aktif di Tim.',
  operational: 'Atur jam buka di Operasional.',
  booking: 'Aktifkan metode pembayaran di Booking App.',
  branding: 'Isi nama salon di Brand & Profil.',
  slug: 'Hubungi admin untuk mengatur URL booking.',
};

// ── Status helpers ────────────────────────────────────────────────────────────

function statusLabel(score: number): string {
  if (score === 100) return 'Siap menerima booking';
  if (score >= 80) return 'Hampir siap';
  if (score >= 50) return 'Perlu perhatian';
  return 'Belum siap';
}

function statusColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

function StatusDot({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return <span className={cn('h-2 w-2 shrink-0 rounded-full', color)} />;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PreviewSummaryPanelProps {
  slug: string | null;
  readiness: BookingReadiness | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function PreviewSummaryPanel({
  slug,
  readiness,
  isLoading,
  onRefresh,
}: PreviewSummaryPanelProps) {
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

  return (
    <SettingsPanel>
      {/* Section 1 — Booking health status */}
      <div className="px-s20 py-s16">
        <div className="mb-s12 flex items-center gap-s8">
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-bd-card border-t-tx-muted" />
          ) : readiness ? (
            <StatusDot score={readiness.score} />
          ) : (
            <span className="h-2 w-2 shrink-0 rounded-full bg-bd-card" />
          )}
          <p
            className={cn(
              'text-ts-fn font-semibold',
              readiness ? statusColor(readiness.score) : 'text-tx-muted'
            )}
          >
            {isLoading
              ? 'Memeriksa kesiapan...'
              : readiness
                ? statusLabel(readiness.score)
                : 'Tidak dapat memuat status'}
          </p>
        </div>

        {/* Inline checklist — always visible */}
        {readiness && (
          <ul className="flex flex-col gap-s6">
            {(Object.keys(readiness.checks) as Array<keyof BookingReadiness['checks']>).map(
              (key) => {
                const status = readiness.checks[key];
                return (
                  <li key={key} className="flex flex-col gap-s2">
                    <div className="flex items-center gap-s8">
                      <CheckIcon status={status} />
                      <span
                        className={cn(
                          'text-ts-fn',
                          status === 'pass' ? 'text-tx-primary' : 'text-tx-secondary'
                        )}
                      >
                        {CHECK_LABELS[key]}
                      </span>
                    </div>
                    {status !== 'pass' && (
                      <p className="ml-s24 text-ts-cap1 text-tx-muted">{CHECK_HINTS[key]}</p>
                    )}
                  </li>
                );
              }
            )}
          </ul>
        )}

        {isLoading && (
          <div className="flex flex-col gap-s6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-5 animate-pulse rounded-r6 bg-bg-hover" />
            ))}
          </div>
        )}
      </div>

      {/* Section 2 — Link booking */}
      <div className="px-s20 py-s16">
        <p className="mb-s8 text-ts-cap2 font-semibold uppercase tracking-widest text-tx-muted">
          Link Booking
        </p>
        <p className="mb-s12 truncate text-ts-fn text-tx-secondary">
          {bookingUrl ?? (
            <span className="italic text-tx-muted">Slug belum diatur di Brand &amp; Profil</span>
          )}
        </p>
        <div className="flex items-center gap-s6">
          <button
            onClick={handleCopy}
            disabled={!bookingUrl}
            className="flex items-center gap-s8 rounded-r10 border border-bd-card bg-bg-card px-s12 py-s8 text-ts-fn font-medium text-tx-primary shadow-card transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy size={13} />
            {copied ? 'Disalin!' : 'Salin'}
          </button>
          <a
            href={bookingUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => !bookingUrl && e.preventDefault()}
            className={cn(
              'flex items-center gap-s8 rounded-r10 border border-bd-card bg-bg-card px-s12 py-s8 text-ts-fn font-medium text-tx-primary shadow-card transition-colors hover:bg-bg-hover',
              !bookingUrl && 'cursor-not-allowed opacity-40'
            )}
          >
            <ArrowSquareOut size={13} />
            Buka
          </a>
        </div>
      </div>

      {/* Section 3 — Refresh preview */}
      <div className="px-s20 py-s16">
        <button
          onClick={onRefresh}
          className="flex w-full items-center justify-center gap-s8 rounded-r10 border border-bd-card bg-bg-card px-s12 py-s8 text-ts-fn font-medium text-tx-secondary shadow-card transition-colors hover:bg-bg-hover"
        >
          <ArrowClockwise size={14} />
          Refresh Preview
        </button>
      </div>
    </SettingsPanel>
  );
}
