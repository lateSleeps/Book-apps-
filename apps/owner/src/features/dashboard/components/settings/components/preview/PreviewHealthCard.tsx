'use client';

import { CheckCircle, Warning, XCircle } from '@phosphor-icons/react';
import { SettingsContentCard } from '../../layout';
import type { BookingReadiness, ReadinessStatus } from '@/server/settings/services/preview.service';
import { cn } from '@/shared/lib/cn';

// ── Label map ─────────────────────────────────────────────────────────────────

const CHECK_LABELS: Record<keyof BookingReadiness['checks'], string> = {
  services: 'Layanan aktif',
  staff: 'Staff aktif',
  operational: 'Jam operasional',
  booking: 'Metode pembayaran',
  branding: 'Nama salon',
  slug: 'URL booking',
};

const CHECK_FAIL_HINTS: Record<keyof BookingReadiness['checks'], string> = {
  services: 'Tambah minimal 1 layanan aktif di Pengaturan → Layanan.',
  staff: 'Tambah minimal 1 staff aktif di Pengaturan → Tim.',
  operational: 'Atur jam buka di Pengaturan → Operasional.',
  booking: 'Aktifkan minimal 1 metode pembayaran di Pengaturan → Booking App.',
  branding: 'Isi nama salon di Pengaturan → Brand & Profil.',
  slug: 'Hubungi admin untuk mengatur URL booking.',
};

// ── Status icon ───────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: ReadinessStatus }) {
  if (status === 'pass')
    return <CheckCircle size={16} weight="fill" className="shrink-0 text-green-500" />;
  if (status === 'warn')
    return <Warning size={16} weight="fill" className="shrink-0 text-yellow-500" />;
  return <XCircle size={16} weight="fill" className="shrink-0 text-red-500" />;
}

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const isPerfect = score === 100;
  const isOk = score >= 80;
  const isWarn = score >= 50;

  const label = isPerfect
    ? 'Siap menerima booking'
    : isOk
      ? 'Hampir siap'
      : isWarn
        ? 'Perlu perhatian'
        : 'Belum siap';

  const color =
    isPerfect || isOk
      ? 'bg-green-50 text-green-700 border-green-200'
      : isWarn
        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
        : 'bg-red-50 text-red-700 border-red-200';

  return (
    <div
      className={cn(
        'px-s10 inline-flex items-center gap-s6 rounded-r20 border py-s4 text-ts-fn font-semibold',
        color
      )}
    >
      <span className="tabular-nums">{score}%</span>
      <span>{label}</span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PreviewHealthCardProps {
  readiness: BookingReadiness | null;
  isLoading: boolean;
}

export function PreviewHealthCard({ readiness, isLoading }: PreviewHealthCardProps) {
  return (
    <div className="flex flex-col gap-s12">
      {/* Header */}
      <div>
        <p className="text-ts-sub font-semibold text-tx-primary">Booking Health</p>
        <p className="mt-s2 text-ts-fn text-tx-muted">Checklist sebelum menerima booking.</p>
      </div>

      <SettingsContentCard padding="tight">
        {isLoading ? (
          <div className="gap-s10 flex flex-col">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 animate-pulse rounded-r6 bg-bg-hover" />
            ))}
          </div>
        ) : readiness ? (
          <div className="flex flex-col gap-s12">
            {/* Score badge */}
            <ScoreBadge score={readiness.score} />

            <div className="h-px bg-bd-row" />

            {/* Check list */}
            <ul className="flex flex-col gap-s8">
              {(Object.keys(readiness.checks) as Array<keyof BookingReadiness['checks']>).map(
                (key) => {
                  const status = readiness.checks[key];
                  return (
                    <li key={key}>
                      <div className="flex items-center gap-s8">
                        <StatusIcon status={status} />
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
                        <p className="text-ts-cap ml-[24px] mt-s2 text-tx-muted">
                          {CHECK_FAIL_HINTS[key]}
                        </p>
                      )}
                    </li>
                  );
                }
              )}
            </ul>
          </div>
        ) : (
          <p className="text-ts-fn text-tx-muted">Gagal memuat data kesiapan.</p>
        )}
      </SettingsContentCard>
    </div>
  );
}
