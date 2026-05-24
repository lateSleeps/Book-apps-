'use client';

import { useSalonSettings } from '@/features/dashboard/hooks/use-salon-settings';
import { SettingsCard } from './shared/SettingsCard';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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
          <div className="space-y-3">
            {staff.map((member) => {
              const memberServices = services.filter(s => member.serviceIds.includes(s.id));

              return (
                <div
                  key={member.id}
                  className="p-4 bg-[#f9f9f7] border border-[#e8e8e6] rounded-lg hover:border-[#ddd] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-[12px] flex-shrink-0"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.initials}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[13px] font-semibold text-[#1a1a1a]">{member.name}</p>
                          {member.status === 'ACTIVE' && (
                            <span className="px-2 py-1 bg-green-100 rounded text-[11px] font-medium text-green-700 flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" />
                              Aktif
                            </span>
                          )}
                          {member.status === 'INACTIVE' && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-[11px] font-medium text-gray-700">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#999] mb-2">{getRoleLabel(member.role)}</p>

                        {/* Contact & Services */}
                        <div className="space-y-1 mb-2">
                          {member.phone && (
                            <p className="text-[12px] text-[#666]">📱 {member.phone}</p>
                          )}
                          {member.email && (
                            <p className="text-[12px] text-[#666]">📧 {member.email}</p>
                          )}
                          {memberServices.length > 0 && (
                            <div className="pt-1">
                              <p className="text-[11px] font-medium text-[#999] mb-1">Layanan:</p>
                              <div className="flex flex-wrap gap-1">
                                {memberServices.map((svc) => (
                                  <span
                                    key={svc.id}
                                    className="px-2 py-0.5 bg-[#e8f5e9] text-[#16a34a] rounded text-[11px]"
                                  >
                                    {svc.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-2">
                      <button className="p-2 hover:bg-white rounded-lg transition-colors">
                        <PencilIcon className="w-4 h-4 text-[#666]" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(member.id, member.name)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Availability Preview */}
                  <div className="pl-13 text-[11px] text-[#999] bg-white rounded p-2 mt-3">
                    <p className="font-medium mb-1">Jadwal Minggu Ini:</p>
                    <div className="grid grid-cols-7 gap-1">
                      {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => {
                        const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][idx] as keyof typeof member.availability;
                        const slots = member.availability[dayKey];
                        return (
                          <div key={day} className="text-center">
                            <p className="font-semibold">{day}</p>
                            <p className="text-[10px]">
                              {slots.length > 0 ? slots.length + ' slot' : '—'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>
    </div>
  );
}
