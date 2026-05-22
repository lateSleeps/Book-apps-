'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/cn';

const NAV = [
  {
    label: 'Overview', path: '/dashboard/overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
        <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Bookings', path: '/dashboard/bookings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="3" width="13" height="10.5" rx="1.5" /><path d="M11 2v2M5 2v2M1.5 7h13" />
      </svg>
    ),
  },
  {
    label: 'Jadwal', path: '/dashboard/schedule',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6.5" /><path d="M8 5v3.5l2.5 1.5" />
      </svg>
    ),
  },
  {
    label: 'Klien', path: '/dashboard/clients',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="5" r="2.5" /><path d="M1.5 14a4.5 4.5 0 019 0" />
        <path d="M11.5 4a2.5 2.5 0 010 2.5M14 14a4.5 4.5 0 00-2.5-4" />
      </svg>
    ),
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-[280px] flex-shrink-0 flex-col h-full border-r border-[#ebebeb]" style={{ backgroundColor: '#fafaf8' }}>

      {/* Brand */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-white tracking-tight">RB</span>
          </div>
          <span className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">Rara Beauty</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 flex flex-col gap-1">
        {NAV.map(({ label, path, icon }) => {
          const active = pathname.startsWith(path);
          return (
            <Link
              key={path}
              href={path}
              className={cn(
                'flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] transition-all duration-150',
                active
                  ? 'bg-white text-[#1a1a1a] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-[#888] hover:text-[#1a1a1a] hover:bg-white/60'
              )}
            >
              <span className={active ? 'text-[#1a1a1a]' : 'text-[#bbb]'}>
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 pb-4 flex flex-col gap-1">
        {(() => {
          const active = pathname.startsWith('/dashboard/settings');
          return (
            <Link
              href="/dashboard/settings"
              className={cn(
                'flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] transition-all duration-150',
                active ? 'bg-white text-[#1a1a1a] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'text-[#888] hover:text-[#1a1a1a] hover:bg-white/60'
              )}
            >
              <span className={active ? 'text-[#1a1a1a]' : 'text-[#bbb]'}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="2.5" />
                  <path d="M8 1.5v1M8 13.5v1M14.5 8h-1M2.5 8h-1M12.4 3.6l-.7.7M4.3 11.7l-.7.7M12.4 12.4l-.7-.7M4.3 4.3l-.7-.7" />
                </svg>
              </span>
              Pengaturan
            </Link>
          );
        })()}
      </div>

      {/* User */}
      <div className="px-4 pb-5 pt-2 border-t border-[#ebebeb]">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 transition-all duration-150 group">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            RB
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[14px] font-medium text-[#1a1a1a] truncate leading-none">Rara Beauty</p>
            <p className="text-[12px] text-[#aaa] truncate mt-0.5">owner</p>
          </div>
        </button>
      </div>

    </aside>
  );
}
