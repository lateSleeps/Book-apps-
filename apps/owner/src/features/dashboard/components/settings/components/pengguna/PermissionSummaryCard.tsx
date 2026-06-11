import { Check, X } from '@phosphor-icons/react';
import type { AccessRole } from '@/features/auth/types/auth.types';

// ── Capability data ───────────────────────────────────────────────────────────

type CapabilityDetail = string | null; // null = not allowed

interface CapabilityGroup {
  label: string;
  detail: Record<AccessRole, CapabilityDetail>;
}

const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    label: 'Pemesanan',
    detail: {
      OWNER: 'Buat, edit, batalkan & kelola pembayaran',
      ADMIN: 'Buat, edit, batalkan & kelola pembayaran',
      STAFF: 'Lihat & kelola pemesanan sendiri',
    },
  },
  {
    label: 'Jadwal',
    detail: {
      OWNER: 'Kelola jadwal semua staf',
      ADMIN: 'Kelola jadwal semua staf',
      STAFF: 'Edit jadwal sendiri',
    },
  },
  {
    label: 'Klien',
    detail: {
      OWNER: 'Lihat, buat, edit & hapus data klien',
      ADMIN: 'Lihat, buat, edit & hapus data klien',
      STAFF: 'Lihat riwayat klien',
    },
  },
  {
    label: 'Pengaturan Salon',
    detail: {
      OWNER: 'Ubah info bisnis, layanan & tim',
      ADMIN: 'Ubah info bisnis, layanan & tim',
      STAFF: null,
    },
  },
  {
    label: 'Pengguna & Akses',
    detail: {
      OWNER: 'Kelola akun & peran',
      ADMIN: null,
      STAFF: null,
    },
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface PermissionSummaryCardProps {
  role: AccessRole;
}

export function PermissionSummaryCard({ role }: PermissionSummaryCardProps) {
  return (
    <div className="overflow-hidden rounded-r12 border border-bd-card bg-bg-card">
      {CAPABILITY_GROUPS.map((group, i) => {
        const detail = group.detail[role];
        const allowed = detail !== null;
        return (
          <div
            key={group.label}
            className={`flex items-start gap-s12 px-s14 py-s12 ${
              i < CAPABILITY_GROUPS.length - 1 ? 'border-b border-bd-row' : ''
            }`}
          >
            {/* Icon */}
            <div
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-rF ${
                allowed ? 'bg-st-in-progress-bg text-st-in-progress' : 'bg-bg-control text-tx-muted'
              }`}
            >
              {allowed ? <Check size={11} weight="bold" /> : <X size={11} weight="bold" />}
            </div>

            {/* Text */}
            <div className="flex min-w-0 flex-1 flex-col gap-s2">
              <span
                className={`text-ts-fn font-medium ${allowed ? 'text-tx-primary' : 'text-tx-muted'}`}
              >
                {group.label}
              </span>
              {detail && <span className="text-ts-cap1 text-tx-secondary">{detail}</span>}
              {!allowed && <span className="text-ts-cap1 text-tx-muted">Tidak ada akses</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
