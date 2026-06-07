/**
 * @responsibility
 * KPI stat cards row for Riwayat Kunjungan.
 * Displays 4 KPI cards: Total Kunjungan, Total Pendapatan,
 * Booking vs Walk-in, dan Avg Nilai Kunjungan.
 *
 * @usedBy
 * app/dashboard/bookings/page.tsx
 *
 * @notes
 * - Presentation only — no local state.
 * - Values respond to period filter (passed from parent).
 * - Card structure adapted from StatCardsRow (Overview).
 */

'use client';

import { CalendarCheck, PersonSimpleWalk, Receipt, TrendUp } from '@phosphor-icons/react';
import type { HistoryStats } from '../../types/history.types';
import { formatCompactRupiah } from '@/shared/lib/format';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, sub, icon }: StatCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-r20 border border-bd-card bg-bg-card p-s20 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-s12 flex items-start justify-between">
        <p className="m-0 text-ts-cap2 font-semibold uppercase tracking-[0.07em] text-tx-secondary">
          {title}
        </p>
        {icon}
      </div>
      <div>
        <p className="m-0 text-[2.25rem] font-bold leading-none text-tx-primary">{value}</p>
        {sub && <p className="mt-s4 text-ts-cap1 text-tx-secondary">{sub}</p>}
      </div>
    </div>
  );
}

type HistoryStatsRowProps = HistoryStats;

export function HistoryStatsRow({
  totalVisits,
  totalRevenue,
  walkInCount,
  bookingCount,
  avgTicket,
}: HistoryStatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-s12 lg:grid-cols-4">
      {/* Total Kunjungan */}
      <StatCard
        title="Total Kunjungan"
        value={totalVisits}
        icon={<CalendarCheck size={26} weight="duotone" className="text-ac-ios-blue" />}
      />

      {/* Total Pendapatan */}
      <StatCard
        title="Total Pendapatan"
        value={`Rp ${formatCompactRupiah(totalRevenue)}`}
        icon={<TrendUp size={26} weight="duotone" className="text-ac-ios-green" />}
      />

      {/* Booking vs Walk-in */}
      <StatCard
        title="Booking vs Walk-in"
        value={
          <span className="text-[2.25rem] font-bold">
            <span className="text-vt-booking-text">{bookingCount}</span>
            <span className="font-medium text-tx-muted"> / </span>
            <span className="text-vt-walkin-text">{walkInCount}</span>
          </span>
        }
        sub="Online · Walk-in"
        icon={<PersonSimpleWalk size={26} weight="duotone" className="text-tx-subtle" />}
      />

      {/* Avg Nilai Kunjungan */}
      <StatCard
        title="Avg Nilai Kunjungan"
        value={`Rp ${formatCompactRupiah(avgTicket)}`}
        sub="per kunjungan"
        icon={<Receipt size={26} weight="duotone" className="text-ac-ios-blue" />}
      />
    </div>
  );
}
