'use client';

import { useSalonSettings } from '@/features/dashboard/hooks/use-salon-settings';
import { SettingsCard } from './shared/SettingsCard';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export function TeamSection() {
  const { settings, loading, error, deleteStaffMember } = useSalonSettings();

  if (error) {
    return (
      <SettingsCard title="Tim & Jadwal" description="Kelola staff, jadwal, dan availability mereka">
        <div className="text-red-600 text-[13px] p-4 bg-red-50 rounded-lg">
          <p>Error: {error}</p>
        </div>
      </SettingsCard>
    );
  }

  if (loading || !settings) {
    return (
      <SettingsCard title="Tim & Jadwal" description="Kelola staff, jadwal, dan availability mereka">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
        </div>
      </SettingsCard>
    );
  }

  const { staff, services } = settings;

  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`Hapus staff ${name}? Jadwal dan availability mereka akan dihapus.`)) {
      deleteStaffMember(id);
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      STYLIST: 'Stylist',
      THERAPIST: 'Terapis',
      BARBER: 'Barber',
      NAIL_ARTIST: 'Nail Artist',
      MASSAGE_THERAPIST: 'Massage Therapist',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Tim Salon"
        description="Kelola staff, jadwal, dan availability mereka"
      >
        <div className="mb-6">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] bg-[#16a34a] text-white hover:bg-[#15923f] transition-all duration-200">
            <PlusIcon className="w-4 h-4" />
            Tambah Staff
          </button>
        </div>

        {staff.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[13px] text-[#999]">Belum ada staff terdaftar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#e8e8e6] bg-[#f9f9f7]">
                  <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Nama</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Peran</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Kontak</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Layanan</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#1a1a1a]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => {
                  const memberServices = services.filter(s => member.serviceIds.includes(s.id));

                  return (
                    <tr
                      key={member.id}
                      className="border-b border-[#e8e8e6] hover:bg-[#f9f9f7] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-[11px] flex-shrink-0"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.initials}
                          </div>
                          <span className="font-medium text-[#1a1a1a]">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#666]">
                        {getRoleLabel(member.role)}
                      </td>
                      <td className="px-4 py-3 text-[#666]">
                        <div className="space-y-0.5">
                          {member.phone && (
                            <p className="text-[12px]">{member.phone}</p>
                          )}
                          {member.email && (
                            <p className="text-[12px]">{member.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {memberServices.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {memberServices.slice(0, 2).map((svc) => (
                              <span
                                key={svc.id}
                                className="px-2 py-0.5 bg-[#e8f5e9] text-[#16a34a] rounded text-[11px]"
                                title={svc.name}
                              >
                                {svc.name.length > 12 ? svc.name.substring(0, 12) + '...' : svc.name}
                              </span>
                            ))}
                            {memberServices.length > 2 && (
                              <span className="px-2 py-0.5 bg-[#f0f0ee] text-[#666] rounded text-[11px]">
                                +{memberServices.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#999]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {member.status === 'ACTIVE' ? (
                          <span className="px-2 py-1 bg-green-100 rounded text-[11px] font-medium text-green-700">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 rounded text-[11px] font-medium text-gray-700">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                            title="Edit staff"
                          >
                            <PencilIcon className="w-4 h-4 text-[#666]" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(member.id, member.name)}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                            title="Hapus staff"
                          >
                            <TrashIcon className="w-4 h-4 text-red-500" />
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

        <div className="bg-[#f9f9f7] border border-[#e8e8e6] rounded-lg p-4 mt-6">
          <p className="text-[12px] text-[#666]">
            <span className="font-medium">Info:</span> Klik icon edit untuk mengatur jadwal dan availability. Setiap staff dapat mempunyai jadwal kerja yang berbeda sesuai dengan keahlian dan ketersediaan mereka.
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}
