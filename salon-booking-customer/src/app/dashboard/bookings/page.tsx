'use client';

import { useState, useMemo } from 'react';
import { useDashboardData } from '@/features/dashboard/hooks/use-dashboard-data';
import { formatRupiah } from '@/shared/lib/format';
import type { BookingStatus, DashboardBooking, PaymentStatus } from '@/features/dashboard/types/dashboard.types';

type StatusFilter = 'ALL' | BookingStatus;

const STATUS_COLOR: Record<string, string> = {
  UPCOMING:    '#a3a3a3',
  CONFIRMED:   '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  COMPLETED:   '#22c55e',
  CANCELLED:   '#ef4444',
  NO_SHOW:     '#a3a3a3',
};

const STATUS_LABEL: Record<string, string> = {
  UPCOMING:    'Menunggu',
  CONFIRMED:   'Terkonfirmasi',
  IN_PROGRESS: 'Berlangsung',
  COMPLETED:   'Selesai',
  CANCELLED:   'Dibatalkan',
  NO_SHOW:     'Tidak Hadir',
};

const PAYMENT_COLOR: Record<PaymentStatus, string> = {
  UNPAID:  '#a3a3a3',
  DEPOSIT: '#f59e0b',
  PAID:    '#22c55e',
};

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  UNPAID:  'Belum bayar',
  DEPOSIT: 'Deposit',
  PAID:    'Lunas',
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL',         label: 'Semua' },
  { key: 'CONFIRMED',   label: 'Terkonfirmasi' },
  { key: 'IN_PROGRESS', label: 'Berlangsung' },
  { key: 'COMPLETED',   label: 'Selesai' },
  { key: 'CANCELLED',   label: 'Dibatalkan' },
];

function DetailPanel({ booking, onClose }: { booking: DashboardBooking; onClose: () => void }) {
  return (
    <div className="w-[280px] flex-shrink-0 border-l border-[#ebebeb] flex flex-col overflow-y-auto" style={{ backgroundColor: '#fafaf8' }}>
      <div className="flex items-center justify-between px-5 py-5">
        <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Detail</h3>
        <button onClick={onClose} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[#f0f0ee] transition-colors">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round">
            <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 flex flex-col gap-6 pb-6">
        {/* Customer */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#efefed] flex items-center justify-center text-[15px] font-semibold text-[#888] flex-shrink-0">
            {booking.customerName.charAt(0)}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#1a1a1a] leading-tight">{booking.customerName}</p>
            <p className="text-[12px] text-[#aaa] mt-0.5">{booking.customerPhone}</p>
          </div>
        </div>

        {/* Code */}
        <div className="bg-white rounded-xl px-4 py-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-[10px] text-[#bbb] uppercase tracking-widest mb-1">Kode Booking</p>
          <p className="text-[15px] font-mono font-semibold text-[#1a1a1a]">{booking.bookingCode}</p>
        </div>

        {/* Status pills */}
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[booking.status] ?? '#d4d4d4' }} />
            <span className="text-[#555]">{STATUS_LABEL[booking.status] ?? booking.status}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PAYMENT_COLOR[booking.paymentStatus] }} />
            <span className="text-[#555]">{PAYMENT_LABEL[booking.paymentStatus]}</span>
          </span>
        </div>

        {/* Info rows */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          {[
            { label: 'Layanan',  value: booking.serviceName },
            { label: 'Stylist',  value: booking.stylistName },
            { label: 'Tanggal',  value: booking.date },
            { label: 'Waktu',    value: `${booking.timeSlot} · ${booking.duration} mnt` },
            { label: 'Harga',    value: formatRupiah(booking.price) },
            ...(booking.notes ? [{ label: 'Catatan', value: booking.notes }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-[#f5f5f5] last:border-0">
              <span className="text-[11px] text-[#bbb]">{label}</span>
              <span className="text-[12px] font-medium text-[#1a1a1a] text-right ml-4 max-w-[140px] truncate">{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button className="h-9 w-full rounded-xl bg-[#1a1a1a] text-white text-[12px] font-medium hover:bg-[#333] transition-colors">
            Konfirmasi
          </button>
          <button className="h-9 w-full rounded-xl bg-white border border-[#ebebeb] text-[#555] text-[12px] font-medium hover:bg-[#f5f5f3] transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            Tandai Selesai
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { allBookings } = useDashboardData();
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DashboardBooking | null>(null);

  const filtered = useMemo(() => {
    let list = filter === 'ALL' ? allBookings : allBookings.filter(b => b.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.customerName.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        b.bookingCode.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allBookings, filter, search]);

  const counts = useMemo(() => {
    const r: Record<string, number> = { ALL: allBookings.length };
    allBookings.forEach(b => { r[b.status] = (r[b.status] ?? 0) + 1; });
    return r;
  }, [allBookings]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: '#fafaf8' }}>

      {/* Header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[28px] font-semibold text-[#1a1a1a] tracking-tight">Bookings</h1>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="5.5" cy="5.5" r="4" /><path d="M11 11L8.5 8.5" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari booking..."
              className="w-52 h-9 pl-8 pr-4 rounded-xl border border-[#e8e8e8] text-[13px] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#bbb] transition-colors bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`h-8 px-4 rounded-lg text-[12px] font-medium transition-all ${
                  active
                    ? 'bg-[#1a1a1a] text-white'
                    : 'text-[#999] hover:text-[#555] hover:bg-white'
                }`}
              >
                {label}
                {counts[key] != null && (
                  <span className={`ml-1.5 text-[11px] ${active ? 'opacity-60' : 'text-[#ccc]'}`}>
                    {counts[key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table + Detail */}
      <div className="flex flex-1 overflow-hidden mt-4 px-8 pb-8 gap-4">
        <div className="flex-1 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-[#f2f2f2]">
                  {['Pelanggan','Layanan','Stylist','Waktu','Harga','Pembayaran','Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#bbb] uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr
                    key={b.id}
                    onClick={() => setSelected(p => p?.id === b.id ? null : b)}
                    className={`border-b border-[#f7f7f7] last:border-0 cursor-pointer transition-colors ${
                      selected?.id === b.id ? 'bg-[#f9f9f7]' : 'hover:bg-[#fafaf8]'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-medium text-[#1a1a1a]">{b.customerName}</p>
                      <p className="text-[11px] text-[#bbb] mt-0.5">{b.customerPhone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] text-[#555]">{b.serviceName}</p>
                      <p className="text-[11px] text-[#bbb] mt-0.5">{b.categoryName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                          style={{ backgroundColor: b.stylistColor + '25', color: b.stylistColor }}>
                          {b.stylistInitials}
                        </div>
                        <span className="text-[13px] text-[#888]">{b.stylistName.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[12px] text-[#555]">{b.date}</p>
                      <p className="text-[11px] text-[#bbb] mt-0.5">{b.timeSlot} · {b.duration}mnt</p>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-medium text-[#1a1a1a] whitespace-nowrap">
                      {formatRupiah(b.price)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#888]">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PAYMENT_COLOR[b.paymentStatus] }} />
                        {PAYMENT_LABEL[b.paymentStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#888]">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLOR[b.status] ?? '#d4d4d4' }} />
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-[13px] text-[#bbb]">Tidak ada hasil</p>
                {search && (
                  <button onClick={() => setSearch('')} className="mt-2 text-[12px] text-[#999] hover:text-[#1a1a1a] transition-colors">
                    Hapus pencarian
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <DetailPanel booking={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}
