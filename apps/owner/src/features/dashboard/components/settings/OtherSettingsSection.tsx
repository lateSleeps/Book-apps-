'use client';

import { SettingsCard } from './shared/SettingsCard';
import { FormField } from './shared/FormField';

export function OtherSettingsSection() {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Pengaturan Notifikasi"
        description="Atur preferensi notifikasi untuk salon kamu"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#f9f9f7] rounded-lg border border-[#e8e8e6]">
            <div>
              <p className="text-[13px] font-medium text-[#1a1a1a]">Email Notifikasi</p>
              <p className="text-[12px] text-[#999] mt-0.5">Terima notifikasi untuk booking baru via email</p>
            </div>
            <label className="relative inline-block w-12 h-7 bg-gray-300 rounded-full cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="peer absolute inset-0 rounded-full bg-[#16a34a] transition-all opacity-0 peer-checked:opacity-100"></div>
              <div className="peer absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#f9f9f7] rounded-lg border border-[#e8e8e6]">
            <div>
              <p className="text-[13px] font-medium text-[#1a1a1a]">WhatsApp Notifikasi</p>
              <p className="text-[12px] text-[#999] mt-0.5">Terima notifikasi untuk booking via WhatsApp</p>
            </div>
            <label className="relative inline-block w-12 h-7 bg-gray-300 rounded-full cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="peer absolute inset-0 rounded-full bg-[#16a34a] transition-all opacity-0 peer-checked:opacity-100"></div>
              <div className="peer absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow"></div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button className="px-6 py-2.5 rounded-lg font-medium text-[13px] bg-[#16a34a] text-white hover:bg-[#15923f] transition-all duration-200">
            Simpan Perubahan
          </button>
          <button className="px-6 py-2.5 rounded-lg font-medium text-[13px] bg-[#f0f0ee] text-[#666] hover:bg-[#e8e8e6] transition-all duration-200">
            Batal
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Pengaturan Jam Kerja"
        description="Atur jam operasional salon secara umum"
      >
        <div className="grid grid-cols-2 gap-6 mb-6">
          <FormField label="Jam Buka" required>
            <input
              type="time"
              defaultValue="08:00"
              className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            />
          </FormField>

          <FormField label="Jam Tutup" required>
            <input
              type="time"
              defaultValue="18:00"
              className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
            />
          </FormField>
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-2.5 rounded-lg font-medium text-[13px] bg-[#16a34a] text-white hover:bg-[#15923f] transition-all duration-200">
            Simpan Perubahan
          </button>
          <button className="px-6 py-2.5 rounded-lg font-medium text-[13px] bg-[#f0f0ee] text-[#666] hover:bg-[#e8e8e6] transition-all duration-200">
            Batal
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Zona Waktu"
        description="Pengaturan zona waktu untuk jadwal dan notifikasi"
      >
        <FormField label="Zona Waktu" required>
          <select className="w-full px-3 py-2 border border-[#ddd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent">
            <option>UTC+07:00 - Jakarta, Bangkok, Bangkok</option>
            <option>UTC+08:00 - Singapore, Hong Kong</option>
            <option>UTC+09:00 - Tokyo, Seoul</option>
          </select>
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
    </div>
  );
}
