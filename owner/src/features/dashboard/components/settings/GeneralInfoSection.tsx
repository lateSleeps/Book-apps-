'use client';

import { useSalonSettings } from '@/features/dashboard/hooks/use-salon-settings';
import { SettingsCard } from './shared/SettingsCard';
import { FormField } from './shared/FormField';

export function GeneralInfoSection() {
  const { settings, loading, error } = useSalonSettings();

  if (error) {
    return (
      <SettingsCard title="Informasi Umum" description="Detail dasar pemilik salon">
        <div className="text-red-600 text-[13px] p-4 bg-red-50 rounded-lg">
          <p>Error: {error}</p>
        </div>
      </SettingsCard>
    );
  }

  if (loading || !settings) {
    return (
      <SettingsCard title="Informasi Umum" description="Detail dasar pemilik salon">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
        </div>
      </SettingsCard>
    );
  }

  const { profile } = settings;

  return (
    <SettingsCard
      title="Informasi Umum"
      description="Detail dasar pemilik salon"
    >
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Nama Pemilik" required>
          <input
            type="text"
            defaultValue={profile.name}
            className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            placeholder="Nama pemilik salon"
          />
        </FormField>

        <FormField label="Email" required>
          <input
            type="email"
            defaultValue={profile.email}
            className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            placeholder="Email pemilik"
          />
        </FormField>

        <FormField label="Nomor Telepon" required>
          <input
            type="tel"
            defaultValue={profile.phone}
            className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            placeholder="Nomor telepon"
          />
        </FormField>

        <FormField label="Kota" required>
          <input
            type="text"
            defaultValue={profile.city}
            className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            placeholder="Kota salon"
          />
        </FormField>
      </div>

      <FormField label="Alamat Lengkap" required>
        <textarea
          defaultValue={profile.address}
          rows={3}
          className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent resize-none"
          placeholder="Alamat lengkap salon"
        />
      </FormField>

      <div className="flex gap-3 pt-4">
        <button className="px-6 py-2.5 rounded-lg font-medium text-[13px] bg-[#16a34a] text-white hover:bg-[#15923f] transition-all duration-200">
          Simpan Perubahan
        </button>
        <button className="px-6 py-2.5 rounded-lg font-medium text-[13px] bg-[#f0f0ee] text-[#666] hover:bg-[#e8e8e6] transition-all duration-200">
          Batal
        </button>
      </div>
    </SettingsCard>
  );
}
