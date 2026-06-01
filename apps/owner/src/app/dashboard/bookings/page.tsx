'use client';

import { useState, useMemo } from 'react';
import { useDashboardData } from '@/features/dashboard/hooks/use-dashboard-data';
import type { BookingStatus, DashboardBooking } from '@/features/dashboard/types/dashboard.types';
import { trpc } from '@/lib/trpc';
import { buildWAMessage } from '@/lib/wa-message';
import type { WaBookingData } from '@/lib/wa-message';
import { formatRupiah } from '@/shared/lib/format';

type StatusFilter = 'ALL' | BookingStatus;

const STATUS_COLOR: Record<string, string> = {
  UPCOMING: '#a3a3a3',
  CONFIRMED: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
  NO_SHOW: '#a3a3a3',
};

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'Menunggu',
  CONFIRMED: 'Terkonfirmasi',
  IN_PROGRESS: 'Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  NO_SHOW: 'Tidak Hadir',
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Semua' },
  { key: 'CONFIRMED', label: 'Terkonfirmasi' },
  { key: 'COMPLETED', label: 'Selesai' },
  { key: 'CANCELLED', label: 'Dibatalkan' },
];

function DetailPanel({
  booking,
  onClose,
  onUpdate,
}: {
  booking: DashboardBooking;
  onClose: () => void;
  onUpdate: (newStatus: BookingStatus) => Promise<void>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showWANotif, setShowWANotif] = useState(false);
  const [waBookingData, setWaBookingData] = useState<WaBookingData | null>(null);

  const handleStatusChange = async (newStatus: BookingStatus) => {
    setIsUpdating(true);
    try {
      await onUpdate(newStatus);
      if (newStatus === 'CANCELLED') {
        setShowCancelConfirm(false);
      }
      if (newStatus === 'CONFIRMED') {
        setWaBookingData({
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          serviceName: booking.serviceName,
          date: booking.date,
          timeSlot: booking.timeSlot,
          bookingCode: booking.bookingCode,
        });
        setShowWANotif(true);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Format time to HH:MM (remove seconds and timezone info)
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-';
    // Handle ISO format (HH:MM:SS) or just HH:MM
    return timeStr.slice(0, 5);
  };

  // Format time range: 10:00 - 10:30 (30 mnt)
  const formatTimeRange = (startTime: string, endTime: string, duration: number) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)} (${duration} mnt)`;
  };

  return (
    <div
      className="flex w-[320px] flex-shrink-0 flex-col overflow-y-auto border-l border-[#ebebeb]"
      style={{ backgroundColor: '#fafaf8' }}
    >
      <div className="flex flex-shrink-0 items-center justify-between px-5 py-5">
        <h3 className="text-sm font-semibold text-gray-900">Detail Pemesanan</h3>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-[#f0f0ee]"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            stroke="#999"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-6">
        {/* Booking Code */}
        <div className="rounded-xl bg-white px-4 py-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-[#6b7280]">
            Kode Booking
          </p>
          <p className="font-mono text-lg font-bold text-[#111827]">{booking.bookingCode}</p>
        </div>

        {/* Status */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: STATUS_COLOR[booking.status] ?? '#d4d4d4' }}
            />
            <span className="text-[#374151]">{STATUS_LABEL[booking.status] ?? booking.status}</span>
          </span>
        </div>

        {/* Customer Info Section */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[#374151]">Pelanggan</h4>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#efefed] text-base font-semibold text-[#6b7280]">
              {booking.customerName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-[#111827]">{booking.customerName}</p>
              <p className="mt-0.5 text-sm text-[#6b7280]">{booking.customerPhone}</p>
            </div>
          </div>
          {booking.customerEmail && (
            <p className="break-all text-sm text-[#6b7280]">{booking.customerEmail}</p>
          )}
        </div>

        {/* Service Info Section */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[#374151]">Layanan</h4>
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {[
              { label: 'Nama Layanan', value: booking.serviceName },
              { label: 'Kategori', value: booking.categoryName },
              { label: 'Durasi', value: `${booking.duration} menit` },
              {
                label: 'Harga',
                value: booking.paymentStatus
                  ? `${formatRupiah(booking.price)} · ${booking.paymentStatus === 'dp' ? '🟡 DP' : '🟢 Lunas'}`
                  : formatRupiah(booking.price),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-[#f3f4f6] px-4 py-3 last:border-0"
              >
                <span className="text-sm text-[#6b7280]">{label}</span>
                <span className="ml-4 text-right text-sm font-medium text-[#111827]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stylist & Schedule Section */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[#374151]">Jadwal & Terapis</h4>
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {[
              { label: 'Terapis', value: booking.stylistName },
              { label: 'Tanggal', value: booking.date },
              {
                label: 'Waktu',
                value: formatTimeRange(booking.timeSlot, booking.endTime, booking.duration),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 border-b border-[#f3f4f6] px-4 py-3 last:border-0"
              >
                <span className="flex-shrink-0 text-sm text-[#6b7280]">{label}</span>
                <span className="text-right text-sm font-medium text-[#111827]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Code Section */}
        {booking.promoCode && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#374151]">Kode Promo</h4>
            <div className="rounded-xl bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-sm font-semibold text-[#111827]">{booking.promoCode}</p>
            </div>
          </div>
        )}

        {/* Form Answers Section */}
        {booking.notes && booking.serviceQuestions && booking.serviceQuestions.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#374151]">Jawaban Pertanyaan</h4>
            <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              {(() => {
                const answerMap = new Map<string, string>();
                booking.notes.split('\n').forEach((line) => {
                  const colonIndex = line.indexOf(':');
                  if (colonIndex > -1) {
                    const id = line.substring(0, colonIndex).trim();
                    const answer = line.substring(colonIndex + 1).trim();
                    if (id && answer) {
                      answerMap.set(id, answer);
                    }
                  }
                });

                return booking.serviceQuestions
                  .map((question) => {
                    const answer = answerMap.get(question.id);
                    if (!answer) return null;

                    const isImage = answer.startsWith('http://') || answer.startsWith('https://');

                    return (
                      <div key={question.id} className="border-b border-[#f3f4f6] last:border-0">
                        <div className="px-4 py-3">
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                            {question.question}
                          </p>
                          {isImage ? (
                            <a
                              href={answer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 block overflow-hidden rounded-lg transition-opacity hover:opacity-90"
                            >
                              <img
                                src={answer}
                                alt={question.question}
                                className="h-auto max-h-48 w-full object-cover"
                              />
                            </a>
                          ) : (
                            <p className="text-sm text-[#374151]">{answer}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                  .filter(Boolean);
              })()}
            </div>
          </div>
        )}

        {/* Add-ons Section */}
        {booking.addOns && booking.addOns.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#374151]">Add-on</h4>
            <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              {booking.addOns.map((addon, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-[#f3f4f6] px-4 py-3 last:border-0"
                >
                  <span className="text-sm text-[#374151]">
                    {addon.name}{' '}
                    {addon.quantity && addon.quantity > 1 ? `(x${addon.quantity})` : ''}
                  </span>
                  <span className="text-sm font-medium text-[#111827]">
                    {addon.price ? formatRupiah(addon.price * (addon.quantity || 1)) : '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Proof Section */}
        {booking.paymentProofUrl && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#374151]">Bukti Pembayaran</h4>
            <a
              href={booking.paymentProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            >
              <img
                src={booking.paymentProofUrl}
                alt="Payment proof"
                className="h-auto max-h-64 w-full object-cover"
              />
            </a>
            <p className="mt-1.5 text-xs text-[#9ca3af]">Klik untuk membuka ukuran penuh</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-shrink-0 flex-col gap-2">
          {booking.status === 'CONFIRMED' ||
          booking.status === 'confirmed' ||
          booking.status === 'COMPLETED' ||
          booking.status === 'completed' ? (
            <div className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-sm font-semibold text-white">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8l3 3 7-7" />
              </svg>
              Terkonfirmasi
            </div>
          ) : booking.status === 'CANCELLED' || booking.status === 'cancelled' ? (
            <div className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#ef4444] text-sm font-semibold text-white">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
              Ditolak
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange('CONFIRMED')}
                disabled={isUpdating}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1a1a1a] text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8l3 3 7-7" />
                </svg>
                {isUpdating ? 'Memperbarui...' : 'Konfirmasi'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isUpdating}
                className="h-10 flex-1 rounded-xl border border-[#fca5a5] bg-white text-sm font-medium text-[#dc2626] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tolak
              </button>
            </div>
          )}
        </div>

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center rounded-xl bg-black/30">
            <div className="mx-4 max-w-sm rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <h3 className="mb-2 text-base font-semibold text-[#111827]">Tolak Pemesanan?</h3>
              <p className="mb-6 text-sm text-[#6b7280]">
                Apakah Anda yakin ingin menolak pemesanan ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isUpdating}
                  className="h-10 flex-1 rounded-xl border border-[#d1d5db] bg-white text-sm font-medium text-[#374151] transition-colors hover:bg-[#f9fafb] disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleStatusChange('CANCELLED')}
                  disabled={isUpdating}
                  className="h-10 flex-1 rounded-xl bg-[#dc2626] text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-50"
                >
                  {isUpdating ? 'Memperbarui...' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showWANotif && waBookingData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="mx-4 flex max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8l3 3 7-7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Booking dikonfirmasi!</p>
                  <p className="mt-0.5 text-xs text-[#6b7280]">
                    Beritahu {waBookingData.customerName} via WhatsApp?
                  </p>
                </div>
              </div>

              {/* Preview pesan */}
              <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3">
                <p className="mb-1.5 text-xs font-medium text-[#166534]">Preview pesan:</p>
                <p className="whitespace-pre-line text-xs leading-relaxed text-[#166534]">{`Halo ${waBookingData.customerName}! 🌸

Booking kamu di *Rara Beauty Jakarta* telah *dikonfirmasi*! ✅

📋 Detail: ${waBookingData.serviceName} · ${waBookingData.date} · ${waBookingData.timeSlot}

⏰ Mohon datang 10 menit sebelum sesi. Toleransi max 15 menit.

🔍 Cek booking: localhost:3002/check-booking`}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <a
                  href={buildWAMessage(waBookingData)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowWANotif(false)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#25d366' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Kirim via WhatsApp
                </a>
                <button
                  onClick={() => setShowWANotif(false)}
                  className="h-10 w-full rounded-xl border border-[#e5e7eb] text-sm font-medium text-[#6b7280] transition-colors hover:bg-[#f9fafb]"
                >
                  Lewati
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { allBookings } = useDashboardData();

  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selected, setSelected] = useState<DashboardBooking | null>(null);
  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: (data) => {
      if (selected && data) {
        setSelected({ ...selected, status: data.status as BookingStatus });
      }
      utils.bookings.getBySalon.invalidate();
    },
  });

  const filtered = useMemo(() => {
    let list = filter === 'ALL' ? allBookings : allBookings.filter((b) => b.status === filter);
    if (dateMode === 'single' && dateFrom) {
      list = list.filter((b) => b.date === dateFrom);
    }
    if (dateMode === 'range') {
      if (dateFrom) list = list.filter((b) => b.date >= dateFrom);
      if (dateTo) list = list.filter((b) => b.date <= dateTo);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.serviceName.toLowerCase().includes(q) ||
          b.bookingCode.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      const aTime = a.createdAt ?? '';
      const bTime = b.createdAt ?? '';
      return bTime.localeCompare(aTime); // DESC — created terbaru di atas
    });
    return list;
  }, [allBookings, filter, search, dateFrom, dateTo, dateMode]);

  const counts = useMemo(() => {
    const r: Record<string, number> = { ALL: allBookings.length };
    allBookings.forEach((b) => {
      r[b.status] = (r[b.status] ?? 0) + 1;
    });
    return r;
  }, [allBookings]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: '#fafaf8' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-8 pb-0 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#1a1a1a]">Pemesanan</h1>
          <div className="flex items-center gap-2">
            {/* Date filter */}
            <div className="flex items-center gap-2">
              {/* Mode toggle */}
              <div className="flex h-9 items-center overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <button
                  onClick={() => {
                    setDateMode('single');
                    setDateTo('');
                  }}
                  className={`h-full px-3 text-xs font-medium transition-colors ${dateMode === 'single' ? 'bg-[#1a1a1a] text-white' : 'text-gray-500 hover:bg-[#f5f5f3]'}`}
                >
                  Tanggal
                </button>
                <button
                  onClick={() => setDateMode('range')}
                  className={`h-full px-3 text-xs font-medium transition-colors ${dateMode === 'range' ? 'bg-[#1a1a1a] text-white' : 'text-gray-500 hover:bg-[#f5f5f3]'}`}
                >
                  Rentang
                </button>
              </div>

              {/* Single date */}
              {dateMode === 'single' && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 cursor-pointer rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors focus:border-[#bbb] focus:outline-none"
                  />
                  {dateFrom && (
                    <button
                      onClick={() => setDateFrom('')}
                      className="h-9 rounded-xl border border-[#e8e8e8] bg-white px-3 text-xs text-gray-500 transition-colors hover:bg-[#f5f5f3]"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}

              {/* Date range */}
              {dateMode === 'range' && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 cursor-pointer rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors focus:border-[#bbb] focus:outline-none"
                  />
                  <span className="text-sm text-gray-400">—</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom}
                    className="h-9 cursor-pointer rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors focus:border-[#bbb] focus:outline-none"
                  />
                  {(dateFrom || dateTo) && (
                    <button
                      onClick={() => {
                        setDateFrom('');
                        setDateTo('');
                      }}
                      className="h-9 rounded-xl border border-[#e8e8e8] bg-white px-3 text-xs text-gray-500 transition-colors hover:bg-[#f5f5f3]"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                stroke="#ccc"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <circle cx="5.5" cy="5.5" r="4" />
                <path d="M11 11L8.5 8.5" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari booking..."
                className="h-9 w-52 rounded-xl border border-[#e8e8e8] bg-white pl-8 pr-4 text-sm text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors placeholder:text-gray-400 focus:border-[#bbb] focus:outline-none"
              />
            </div>
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
                className={`h-8 rounded-lg px-4 text-[0.8125rem] font-medium transition-all ${
                  active
                    ? 'bg-[#1a1a1a] text-white'
                    : 'text-gray-500 hover:bg-white hover:text-[#555]'
                }`}
              >
                {label}
                {counts[key] != null && (
                  <span
                    className={`ml-1.5 text-[0.6875rem] ${active ? 'opacity-60' : 'text-[#ccc]'}`}
                  >
                    {counts[key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table + Detail */}
      <div className="mt-4 flex flex-1 gap-4 overflow-hidden px-8 pb-8">
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-[#f2f2f2]">
                  {['Pelanggan', 'Layanan', 'Stylist', 'Waktu', 'Harga', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7280]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelected((p) => (p?.id === b.id ? null : b))}
                    className={`cursor-pointer border-b border-[#f7f7f7] transition-colors last:border-0 ${
                      selected?.id === b.id ? 'bg-[#f9f9f7]' : 'hover:bg-[#fafaf8]'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#111827]">{b.customerName}</p>
                      <p className="mt-0.5 text-xs text-[#6b7280]">{b.customerPhone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-[#374151]">{b.serviceName}</p>
                      <p className="mt-0.5 text-xs text-[#6b7280]">{b.categoryName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: b.stylistColor + '25', color: b.stylistColor }}
                        >
                          {b.stylistInitials}
                        </div>
                        <span className="text-sm text-[#374151]">
                          {b.stylistName.split(' ')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-[#374151]">{b.date}</p>
                      <p className="mt-0.5 text-xs text-[#6b7280]">
                        {b.timeSlot} · {b.duration}mnt
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-[#111827]">
                      {formatRupiah(b.price)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#374151]">
                        <span
                          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: STATUS_COLOR[b.status] ?? '#d4d4d4' }}
                        />
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-sm text-gray-500">Tidak ada hasil</p>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="mt-2 text-xs text-gray-500 transition-colors hover:text-gray-900"
                  >
                    Hapus pencarian
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <DetailPanel
            booking={selected}
            onClose={() => setSelected(null)}
            onUpdate={async (newStatus: BookingStatus) => {
              await updateStatusMutation.mutateAsync({
                bookingId: selected.id,
                status: newStatus,
                cancellationReason:
                  newStatus === 'CANCELLED'
                    ? `Maaf, stylist ${selected.stylistName} sudah memiliki booking lain pada jam tersebut.`
                    : undefined,
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
