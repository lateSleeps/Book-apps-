'use client';

import { useSalonSettings } from '@/features/dashboard/hooks/use-salon-settings';
import { SettingsCard } from './shared/SettingsCard';
import { FormField } from './shared/FormField';

export function ProfileSection() {
  const { settings, loading } = useSalonSettings();

  if (loading || !settings) {
    return (
      <SettingsCard title="Profil Salon">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
          <div className="h-10 bg-[#f0f0ee] rounded"></div>
        </div>
      </SettingsCard>
    );
  }

  const { profile } = settings;

  return (
    <SettingsCard
      title="Profil Salon"
      description="Informasi detail dan identitas salon"
    >
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Nama Salon" required>
          <input
            type="text"
            defaultValue={profile.name}
            className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            placeholder="Nama salon"
          />
        </FormField>

        <FormField label="Tahun Berdiri" hint="Kapan salon dibuka">
          <input
            type="number"
            defaultValue={profile.establishedYear}
            className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            placeholder="Contoh: 2020"
          />
        </FormField>

        <FormField label="Nomor Rekening Bank">
          <input
            type="text"
            defaultValue={profile.bankAccount || ''}
            className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            placeholder="Nomor rekening untuk pembayaran"
          />
        </FormField>

        <FormField label="Nomor Identitas Pajak (NPWP)">
          <input
            type="text"
            defaultValue={profile.taxId || ''}
            className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            placeholder="NPWP (opsional)"
          />
        </FormField>
      </div>

      <FormField label="Alamat Salon" required>
        <textarea
          defaultValue={profile.address}
          rows={3}
          className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent resize-none"
          placeholder="Alamat lengkap salon"
        />
      </FormField>

      <div className="bg-[#f9f9f7] border border-[#e8e8e6] rounded-lg p-4 mt-6">
        <p className="text-[12px] text-[#666]">
          <span className="font-medium">Catatan:</span> Data bank dan NPWP digunakan untuk pengaturan pembayaran. Pastikan data akurat untuk transaksi yang lancar.
        </p>
      </div>

      <div className="flex gap-3 pt-6">
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
