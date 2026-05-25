'use client';

import { useMemo } from 'react';
import { useDashboardData } from '@/features/dashboard/hooks/use-dashboard-data';
import { BookingStatusBadge } from '../booking-status-badge/BookingStatusBadge';
import { formatRupiah } from '@/shared/lib/format';

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 1v10M1 6h10" />
    </svg>
  );
}

export function TodayPanel() {
  const { todayBookings } = useDashboardData();

  const now = new Date();
  const todayLabel = `${DAYS_ID[now.getDay()]}, ${now.getDate()} ${MONTHS_ID[now.getMonth()]}`;

  const stats = useMemo(() => {
    const active = todayBookings.filter((b) => b.status !== 'CANCELLED');
    const completed = active.filter((b) => b.status === 'COMPLETED').length;
    const inProgress = active.filter((b) => b.status === 'IN_PROGRESS').length;
    const revenue = active
      .filter((b) => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.price, 0);
    return { total: active.length, completed, inProgress, revenue };
  }, [todayBookings]);

  return (
    <aside className="w-[248px] flex-shrink-0 flex flex-col h-full bg-surface border-r border-sep">

      {/* ── Header ── */}
      <div className="px-[14px] pt-[14px] pb-[12px] border-b border-sep">
        <div className="flex items-center justify-between mb-[10px]">
          <span className="text-[10px] font-semibold text-label3 uppercase tracking-wider">Jadwal Hari Ini</span>
          <span className="text-[10px] text-label3">{todayLabel}</span>
        </div>

        <div className="flex items-end gap-[6px]">
          <span className="text-[30px] font-bold text-label leading-none tabular-nums">{stats.total}</span>
          <span className="text-[11px] text-label3 mb-[4px]">booking aktif</span>
        </div>

        <div className="flex gap-[5px] mt-[8px] flex-wrap">
          <span className="px-[7px] py-[2px] rounded-[4px] text-[10px] font-medium bg-c-mint text-[#1a6647]">
            {stats.completed} selesai
          </span>
          {stats.inProgress > 0 && (
            <span className="px-[7px] py-[2px] rounded-[4px] text-[10px] font-medium bg-c-yellow text-[#8a6000]">
              {stats.inProgress} berlangsung
            </span>
          )}
        </div>
      </div>

      {/* ── Booking list ── */}
      <div className="flex-1 overflow-y-auto">
        {todayBookings.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[12px] text-label3 text-center px-4">Tidak ada booking hari ini</p>
          </div>
        ) : (
          <div className="divide-y divide-sep">
            {todayBookings.map((booking) => (
              <div
                key={booking.id}
                className="px-[14px] py-[10px] hover:bg-bg transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-[8px]">
                  <span className="text-[11px] font-medium text-label3 w-[36px] flex-shrink-0 pt-[2px] tabular-nums">
                    {booking.timeSlot}
                  </span>
                  <div
                    className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-[2px]"
                    style={{ backgroundColor: booking.stylistColor, color: '#111110' }}
                  >
                    {booking.stylistInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-label truncate leading-tight">
                      {booking.customerName}
                    </div>
                    <div className="text-[10px] text-label3 truncate mt-[1px]">
                      {booking.serviceName}
                    </div>
                    <div className="flex items-center justify-between mt-[5px]">
                      <BookingStatusBadge status={booking.status} />
                      <span className="text-[10px] font-semibold text-label">
                        {formatRupiah(booking.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <div className="p-[10px] border-t border-sep">
        <div className="flex items-center justify-between px-[2px] mb-[8px]">
          <span className="text-[10px] text-label3">Total lunas hari ini</span>
          <span className="text-[11px] font-semibold text-label">{formatRupiah(stats.revenue)}</span>
        </div>
        <button className="w-full h-[36px] rounded-r8 bg-accent text-white text-[12px] font-semibold flex items-center justify-center gap-[6px] hover:opacity-90 transition-opacity">
          <PlusIcon />
          Tambah Booking
        </button>
      </div>
    </aside>
  );
}
