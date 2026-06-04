/**
 * @responsibility
 * Renders the 4 KPI stat cards at the top of the overview page:
 * Pendapatan Hari Ini, Booking Hari Ini, Selesai, Pembatalan.
 *
 * @usedBy
 * app/dashboard/overview/page.tsx
 *
 * @notes
 * - Presentation only — no local state, no side effects.
 * - Revenue card has a distinct gradient style (blue gradient + doodle).
 * - Count cards use white background with accent icon.
 */

'use client';

import { CheckCircle, XCircle, Users, TrendUp } from '@phosphor-icons/react';
import type { DashboardStats } from '../../types/dashboard.types';
import type { DashboardBooking } from '../../types/dashboard.types';
import { formatCompactRupiah } from '@/shared/lib/format';

interface StatCardsRowProps {
  stats: DashboardStats;
  allBookings: DashboardBooking[];
}

interface CountCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function CountCard({ title, value, icon }: CountCardProps) {
  return (
    <div
      className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E5EA',
        borderRadius: '1.25rem',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: '#8E8E93',
            margin: 0,
          }}
        >
          {title}
        </p>
        {icon}
      </div>
      <p
        style={{ fontSize: '2.25rem', fontWeight: 700, color: '#1C1C1E', lineHeight: 1, margin: 0 }}
      >
        {value}
      </p>
    </div>
  );
}

export function StatCardsRow({ stats, allBookings }: StatCardsRowProps) {
  const completedCount = allBookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = allBookings.filter((b) => b.status === 'CANCELLED').length;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
        gap: '1rem',
        alignItems: 'stretch',
      }}
    >
      {/* Pendapatan — gradient card */}
      <div
        className="relative overflow-hidden transition-all duration-200 hover:-translate-y-1"
        style={{
          background: 'linear-gradient(145deg, #0071E3 0%, #3A9BFF 100%)',
          boxShadow: '0 8px 28px rgba(0,113,227,0.38)',
          borderRadius: '1.25rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '9rem',
        }}
      >
        {/* Background doodle */}
        <svg
          style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '55%' }}
          viewBox="0 0 200 160"
          fill="none"
          preserveAspectRatio="xMaxYMid meet"
        >
          <circle cx="160" cy="40" r="55" fill="white" opacity="0.10" />
          <circle cx="185" cy="110" r="38" fill="white" opacity="0.08" />
          <circle
            cx="145"
            cy="30"
            r="18"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.18"
            fill="none"
            strokeDasharray="4 3"
          />
          <circle
            cx="175"
            cy="125"
            r="12"
            stroke="white"
            strokeWidth="1.2"
            opacity="0.15"
            fill="none"
            strokeDasharray="3 3"
          />
          <path
            d="M80 90 Q100 75 120 90 Q140 105 160 90 Q180 75 200 90"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.20"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M95 110 Q115 95 135 110 Q155 125 175 110"
            stroke="white"
            strokeWidth="1"
            opacity="0.12"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="100" cy="30" r="2.5" fill="white" opacity="0.30" />
          <circle cx="190" cy="55" r="2" fill="white" opacity="0.25" />
          <circle cx="130" cy="140" r="2" fill="white" opacity="0.20" />
          <circle cx="165" cy="70" r="1.5" fill="white" opacity="0.22" />
          <line
            x1="108"
            y1="55"
            x2="108"
            y2="65"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.22"
            strokeLinecap="round"
          />
          <line
            x1="103"
            y1="60"
            x2="113"
            y2="60"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.22"
            strokeLinecap="round"
          />
          <line
            x1="185"
            y1="80"
            x2="185"
            y2="88"
            stroke="white"
            strokeWidth="1.2"
            opacity="0.18"
            strokeLinecap="round"
          />
          <line
            x1="181"
            y1="84"
            x2="189"
            y2="84"
            stroke="white"
            strokeWidth="1.2"
            opacity="0.18"
            strokeLinecap="round"
          />
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.75)',
                margin: 0,
              }}
            >
              Pendapatan Hari Ini
            </p>
            <TrendUp size={22} weight="duotone" color="rgba(255,255,255,0.85)" />
          </div>
          <p
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1,
              margin: '0 0 0.25rem',
            }}
          >
            Rp {formatCompactRupiah(stats.revenueToday)}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            {stats.revenueDelta === 0
              ? 'Belum ada data pembanding kemarin.'
              : `${stats.revenueDelta > 0 ? '+' : ''}${stats.revenueDelta}% dari kemarin`}
          </p>
        </div>
      </div>

      {/* Booking Hari Ini */}
      <CountCard
        title="Booking Hari Ini"
        value={stats.bookingsToday}
        icon={<Users size={26} weight="duotone" color="#007AFF" />}
      />

      {/* Selesai */}
      <CountCard
        title="Selesai"
        value={completedCount}
        icon={<CheckCircle size={26} weight="duotone" color="#34C759" />}
      />

      {/* Pembatalan */}
      <div
        className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E5EA',
          borderRadius: '1.25rem',
          padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
          }}
        >
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: '#8E8E93',
              margin: 0,
            }}
          >
            Pembatalan
          </p>
          <XCircle size={26} weight="duotone" color="#FF3B30" />
        </div>
        <p
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: '#FF3B30',
            lineHeight: 1,
            margin: 0,
          }}
        >
          {cancelledCount}
        </p>
      </div>
    </div>
  );
}
