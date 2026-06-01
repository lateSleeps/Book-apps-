'use client';

import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SettingsCard } from './shared/SettingsCard';
import { trpc } from '@/lib/trpc';

const SALON_ID = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

type RawStylist = {
  id: string;
  user_id: string;
  salon_id: string;
  bio?: string | null;
  specialties?: string[] | null;
  is_active: boolean;
  sort_order?: number | null;
  created_at: string;
  user?: {
    id: string;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
  } | null;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  '#f5c4ab',
  '#b8d6f0',
  '#a8e6d4',
  '#f5d98a',
  '#c8bef0',
  '#f0b8c8',
  '#b8f0d6',
  '#d6b8f0',
];

export function TeamSection() {
  const {
    data: rawStylists,
    isLoading,
    error,
  } = trpc.stylists.getBySalon.useQuery({ salonId: SALON_ID });

  if (error) {
    return (
      <SettingsCard
        title="Tim & Jadwal"
        description="Kelola staff, jadwal, dan availability mereka"
      >
        <div className="rounded-lg bg-red-50 p-4 text-[13px] text-red-600">
          <p>Error: {error.message}</p>
        </div>
      </SettingsCard>
    );
  }

  if (isLoading) {
    return (
      <SettingsCard
        title="Tim & Jadwal"
        description="Kelola staff, jadwal, dan availability mereka"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-10 rounded bg-[#f0f0ee]"></div>
          <div className="h-10 rounded bg-[#f0f0ee]"></div>
          <div className="h-10 rounded bg-[#f0f0ee]"></div>
        </div>
      </SettingsCard>
    );
  }

  const stylists = (rawStylists ?? []) as RawStylist[];

  return (
    <div className="space-y-6">
      <SettingsCard title="Tim Salon" description="Kelola staff, jadwal, dan availability mereka">
        <div className="mb-6">
          <button className="flex items-center gap-2 rounded-lg bg-[#16a34a] px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-[#15923f]">
            <PlusIcon className="h-4 w-4" />
            Tambah Staff
          </button>
        </div>

        {stylists.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">Belum ada staff terdaftar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e8e8e6] bg-[#f9f9f7]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Peran
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Kontak
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Spesialisasi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {stylists.map((stylist, idx) => {
                  const name = stylist.user?.full_name ?? `Stylist ${idx + 1}`;
                  const initials = getInitials(name);
                  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const specialties = stylist.specialties ?? [];

                  return (
                    <tr
                      key={stylist.id}
                      className="border-b border-[#e8e8e6] transition-colors hover:bg-[#f9f9f7]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold text-white"
                            style={{ backgroundColor: color }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-[#1a1a1a]">{name}</p>
                            {stylist.bio && (
                              <p className="line-clamp-1 text-xs text-gray-500">{stylist.bio}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-[#666]">
                        {stylist.user?.role ?? 'Stylist'}
                      </td>
                      <td className="px-4 py-3 text-[#666]">
                        <div className="space-y-0.5">
                          {stylist.user?.phone && (
                            <p className="text-[12px]">{stylist.user.phone}</p>
                          )}
                          {stylist.user?.email && (
                            <p className="text-[12px]">{stylist.user.email}</p>
                          )}
                          {!stylist.user?.phone && !stylist.user?.email && (
                            <span className="text-gray-500">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {specialties.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {specialties.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="rounded bg-[#e8f5e9] px-2 py-0.5 text-[11px] text-[#16a34a]"
                              >
                                {s}
                              </span>
                            ))}
                            {specialties.length > 3 && (
                              <span className="rounded bg-[#f0f0ee] px-2 py-0.5 text-[11px] text-[#666]">
                                +{specialties.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {stylist.is_active ? (
                          <span className="rounded bg-green-100 px-2 py-1 text-[11px] font-medium text-green-700">
                            Aktif
                          </span>
                        ) : (
                          <span className="rounded bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded-lg p-2 transition-colors hover:bg-white"
                            title="Edit staff"
                          >
                            <PencilIcon className="h-4 w-4 text-[#666]" />
                          </button>
                          <button
                            className="rounded-lg p-2 transition-colors hover:bg-white"
                            title="Hapus staff"
                          >
                            <TrashIcon className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-[#e8e8e6] bg-[#f9f9f7] p-4">
          <p className="text-[12px] text-[#666]">
            <span className="font-medium">Info:</span> Klik icon edit untuk mengatur jadwal dan
            availability. Setiap staff dapat mempunyai jadwal kerja yang berbeda sesuai dengan
            keahlian dan ketersediaan mereka.
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}
