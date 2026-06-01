'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser, useHasPermission } from '@/features/auth/hooks/useAuth';
import { Permission } from '@/features/auth/types/permissions.types';
import { getRoleColor, getRoleDisplayName } from '@/features/auth/utils/role-permissions';
import { cn } from '@/shared/lib/cn';

// For Settings permission check only
const SETTINGS_PERMISSION = Permission.VIEW_SETTINGS;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  requiredPermission?: Permission;
}

const NAV: NavItem[] = [
  {
    label: 'Overview',
    path: '/dashboard/overview',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="5" height="5" rx="1" />
        <rect x="9" y="2" width="5" height="5" rx="1" />
        <rect x="2" y="9" width="5" height="5" rx="1" />
        <rect x="9" y="9" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Pemesanan',
    path: '/dashboard/bookings',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1.5" y="3" width="13" height="10.5" rx="1.5" />
        <path d="M11 2v2M5 2v2M1.5 7h13" />
      </svg>
    ),
  },
  {
    label: 'Jadwal',
    path: '/dashboard/schedule',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 5v3.5l2.5 1.5" />
      </svg>
    ),
  },
  {
    label: 'Klien',
    path: '/dashboard/clients',
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="6" cy="5" r="2.5" />
        <path d="M1.5 14a4.5 4.5 0 019 0" />
        <path d="M11.5 4a2.5 2.5 0 010 2.5M14 14a4.5 4.5 0 00-2.5-4" />
      </svg>
    ),
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const canViewSettings = useHasPermission(Permission.VIEW_SETTINGS);

  // All items visible for owner (permissions applied at feature level, not menu level)
  const visibleNavItems = NAV;

  return (
    <aside
      className="hidden h-full flex-shrink-0 flex-col border-r border-[#ebebeb] md:flex md:w-[280px]"
      style={{ backgroundColor: '#fafaf8' }}
    >
      {/* Brand */}
      <div className="px-6 pb-6 pt-7">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a]">
            <span className="text-[11px] font-bold tracking-tight text-white">RB</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[#1a1a1a]">
            Rara Beauty
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-4">
        {visibleNavItems.map(({ label, path, icon }) => {
          const active = pathname.startsWith(path);

          return (
            <Link
              key={path}
              href={path}
              className={cn(
                'flex items-center gap-3.5 rounded-xl px-4 py-3 text-[15px] transition-all duration-150',
                active
                  ? 'bg-white font-medium text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-[#888] hover:bg-white/60 hover:text-[#1a1a1a]'
              )}
            >
              <span className={active ? 'text-[#1a1a1a]' : 'text-[#bbb]'}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom - Settings */}
      {useHasPermission(SETTINGS_PERMISSION) && (
        <div className="flex flex-col gap-1 px-4 pb-4">
          {(() => {
            const active = pathname.startsWith('/dashboard/settings');

            return (
              <Link
                href="/dashboard/settings"
                className={cn(
                  'flex items-center gap-3.5 rounded-xl px-4 py-3 text-[15px] transition-all duration-150',
                  active
                    ? 'bg-white font-medium text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                    : 'text-[#888] hover:bg-white/60 hover:text-[#1a1a1a]'
                )}
              >
                <span className={active ? 'text-[#1a1a1a]' : 'text-[#bbb]'}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="8" cy="8" r="2.5" />
                    <path d="M8 1.5v1M8 13.5v1M14.5 8h-1M2.5 8h-1M12.4 3.6l-.7.7M4.3 11.7l-.7.7M12.4 12.4l-.7-.7M4.3 4.3l-.7-.7" />
                  </svg>
                </span>
                Pengaturan
              </Link>
            );
          })()}
        </div>
      )}

      {/* User */}
      {currentUser && (
        <div className="border-t border-[#ebebeb] px-4 pb-5 pt-2">
          <button className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-150 hover:bg-white/60">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: getRoleColor(currentUser.role) }}
            >
              {currentUser.avatar || '👤'}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-[14px] font-medium leading-none text-[#1a1a1a]">
                {currentUser.name}
              </p>
              <p className="mt-0.5 truncate text-[12px] text-[#aaa]">
                {getRoleDisplayName(currentUser.role)}
              </p>
            </div>
          </button>
        </div>
      )}
    </aside>
  );
}
