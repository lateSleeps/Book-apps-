'use client';

export default function ClientsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto" style={{ backgroundColor: '#fafaf8' }}>
      <div className="max-w-4xl mx-auto w-full px-8 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold text-[#1a1a1a] tracking-tight">Klien</h1>
          <p className="text-[13px] text-[#aaa] mt-1">Manajemen data pelanggan</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f5f3] flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="6" r="3.5" />
              <path d="M1.5 19a6.5 6.5 0 0113 0" />
              <path d="M15.5 4a3.5 3.5 0 010 3.5M19.5 19a6.5 6.5 0 00-3.5-5.8" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-[#1a1a1a]">Segera hadir</p>
          <p className="text-[13px] text-[#bbb] mt-1">Fitur manajemen klien sedang dalam pengembangan</p>
        </div>
      </div>
    </div>
  );
}
