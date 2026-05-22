'use client';

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto" style={{ backgroundColor: '#fafaf8' }}>
      <div className="max-w-4xl mx-auto w-full px-8 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold text-[#1a1a1a] tracking-tight">Pengaturan</h1>
          <p className="text-[13px] text-[#aaa] mt-1">Konfigurasi salon kamu</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f5f3] flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="3" />
              <path d="M11 2v1.5M11 18.5V20M20 11h-1.5M3.5 11H2M17.2 4.8l-1.1 1.1M5.9 16.1l-1.1 1.1M17.2 17.2l-1.1-1.1M5.9 5.9L4.8 4.8" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-[#1a1a1a]">Segera hadir</p>
          <p className="text-[13px] text-[#bbb] mt-1">Fitur pengaturan sedang dalam pengembangan</p>
        </div>
      </div>
    </div>
  );
}
