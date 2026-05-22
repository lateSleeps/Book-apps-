import type { BookingStatus } from '../../types/dashboard.types';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const STATUS_CONFIG: Record<BookingStatus, { bg: string; color: string; label: string }> = {
  UPCOMING: { bg: 'bg-c-blue', color: 'text-[#1e5a8a]', label: 'Akan Datang' },
  CONFIRMED: { bg: 'bg-c-mint', color: 'text-[#1a6647]', label: 'Dikonfirmasi' },
  IN_PROGRESS: { bg: 'bg-c-yellow', color: 'text-[#8a6000]', label: 'Berlangsung' },
  COMPLETED: { bg: 'bg-accent-soft', color: 'text-accent-dark', label: 'Selesai' },
  CANCELLED: { bg: 'bg-c-peach', color: 'text-[#b03030]', label: 'Dibatalkan' },
  NO_SHOW: { bg: 'bg-[#f0f0ee]', color: 'text-label3', label: 'Tidak Hadir' },
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-[8px] py-[3px] rounded-rF text-[11px] font-semibold whitespace-nowrap ${config.bg} ${config.color}`}
    >
      {config.label}
    </span>
  );
}
