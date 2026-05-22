'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { useDashboardData } from '@/features/dashboard/hooks/use-dashboard-data';
import { formatRupiah } from '@/shared/lib/format';

const DAY_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS_ID  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const HOURS      = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00–19:00
const HOUR_H     = 60; // px per hour

function parseHour(slot: string): number {
  const p = slot.split(':').map(Number);
  return (p[0] ?? 0) + (p[1] ?? 0) / 60;
}

// Lighten a hex color to use as block background
function hexAlpha(hex: string, a: number) {
  // returns hex + 2-digit alpha
  const alpha = Math.round(a * 255).toString(16).padStart(2, '0');
  return `${hex}${alpha}`;
}

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const { allBookings, stylists } = useDashboardData();

  useEffect(() => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 })); // Sun start like Notion
  }, []);

  const weekDays = useMemo(() => {
    if (!weekStart) return [];
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const bookingsByDate = useMemo(() => {
    const map: Record<string, typeof allBookings> = {};
    allBookings.forEach(b => { (map[b.date] ??= []).push(b); });
    return map;
  }, [allBookings]);

  if (!weekStart || weekDays.length === 0) return null;

  const first = weekDays[0]!;
  const last  = weekDays[6]!;
  const monthLabel = first.getMonth() === last.getMonth()
    ? `${MONTHS_ID[first.getMonth()]} ${first.getFullYear()}`
    : `${MONTHS_ID[first.getMonth()]} – ${MONTHS_ID[last.getMonth()]} ${last.getFullYear()}`;

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: '#fafaf8' }}>

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-6 h-[56px] border-b border-[#ebebeb] bg-white/60 backdrop-blur-sm">
        {/* Nav arrows + Today */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekStart(p => p ? subWeeks(p, 1) : p)}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#f0f0f0] text-[#6b6b6b] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3L5 7l4 4" />
            </svg>
          </button>
          <button
            onClick={() => setWeekStart(p => p ? addWeeks(p, 1) : p)}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#f0f0f0] text-[#6b6b6b] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3l4 4-4 4" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}
          className="h-7 px-3 rounded-md border border-[#e8e8e8] text-[12px] text-[#6b6b6b] hover:bg-[#f0f0f0] transition-colors"
        >
          Today
        </button>

        {/* Month label */}
        <h2 className="text-[14px] font-semibold text-[#191919] ml-1">{monthLabel}</h2>

        <div className="flex-1" />

        {/* View pill */}
        <div className="flex items-center gap-1 border border-[#e8e8e8] rounded-md px-2 h-7">
          <span className="text-[12px] text-[#6b6b6b]">Week</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#9b9b9b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 3.5l2.5 3 2.5-3" />
          </svg>
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div className="flex-1 overflow-auto">
        <div className="flex" style={{ minWidth: `${7 * 130 + 52}px` }}>

          {/* Time gutter */}
          <div className="flex-shrink-0 w-[52px]">
            {/* Corner spacer — matches day header height */}
            <div className="h-[52px] border-b border-r border-[#e8e8e8]" />
            {/* Hour labels */}
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="relative border-b border-r border-[#f2f2f2]"
                style={{ height: HOUR_H }}
              >
                {/* Don't show label for last row to avoid overflow */}
                {i < HOURS.length - 1 && (
                  <span className="absolute -top-[9px] right-2 text-[10px] text-[#c4c4c4] tabular-nums select-none whitespace-nowrap">
                    {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map(day => {
            const dateStr   = format(day, 'yyyy-MM-dd');
            const isToday   = dateStr === todayStr;
            const dayBooks  = bookingsByDate[dateStr] ?? [];

            return (
              <div key={dateStr} className="flex-1 flex flex-col border-r border-[#e8e8e8] last:border-r-0">

                {/* Day header */}
                <div className={`flex-shrink-0 h-[52px] border-b border-[#e8e8e8] flex flex-col items-center justify-center gap-0.5 ${isToday ? '' : ''}`}>
                  <span className="text-[10px] font-medium text-[#9b9b9b] uppercase tracking-widest">
                    {DAY_SHORT[day.getDay()]}
                  </span>
                  <span
                    className={`w-[28px] h-[28px] flex items-center justify-center rounded-full text-[14px] font-semibold leading-none ${
                      isToday
                        ? 'bg-[#eb5757] text-white'
                        : 'text-[#191919]'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                {/* Hour cells + events */}
                <div className="flex-1 relative">
                  {/* Grid lines */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-b border-[#f2f2f2]"
                      style={{ top: (h - 7) * HOUR_H, height: HOUR_H }}
                    />
                  ))}

                  {/* Half-hour dashed lines */}
                  {HOURS.slice(0, -1).map(h => (
                    <div
                      key={`half-${h}`}
                      className="absolute left-0 right-0 border-b border-dashed border-[#f5f5f5]"
                      style={{ top: (h - 7) * HOUR_H + HOUR_H / 2, height: 0 }}
                    />
                  ))}

                  {/* Events */}
                  {dayBooks.map(b => {
                    const startH  = parseHour(b.timeSlot);
                    const topPx   = Math.max((startH - 7) * HOUR_H + 1, 0);
                    const heightPx = Math.max((b.duration / 60) * HOUR_H - 2, 20);
                    const stylist  = stylists.find(s => s.initials === b.stylistInitials);
                    const color    = stylist?.color ?? '#9b9b9b';

                    return (
                      <div
                        key={b.id}
                        className="absolute left-[2px] right-[2px] rounded-[4px] px-2 py-[3px] overflow-hidden cursor-pointer group"
                        style={{
                          top:             topPx,
                          height:          heightPx,
                          backgroundColor: hexAlpha(color, 0.18),
                          borderLeft:      `3px solid ${color}`,
                          opacity:         b.status === 'CANCELLED' ? 0.4 : 1,
                        }}
                        title={`${b.customerName} · ${b.serviceName} · ${b.timeSlot}`}
                      >
                        <p className="text-[11px] font-semibold leading-tight truncate" style={{ color }}>
                          {b.customerName}
                        </p>
                        {heightPx > 32 && (
                          <p className="text-[10px] leading-tight truncate mt-0.5" style={{ color, opacity: 0.8 }}>
                            {b.timeSlot} · {b.duration}m
                          </p>
                        )}
                        {heightPx > 48 && (
                          <p className="text-[10px] leading-tight truncate" style={{ color, opacity: 0.7 }}>
                            {b.serviceName}
                          </p>
                        )}
                        {heightPx > 64 && (
                          <p className="text-[10px] leading-tight truncate" style={{ color, opacity: 0.6 }}>
                            {formatRupiah(b.price)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
