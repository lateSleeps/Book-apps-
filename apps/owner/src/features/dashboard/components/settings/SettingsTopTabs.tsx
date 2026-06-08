'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHasPermission } from '@/features/auth/hooks/useAuth';
import { Permission } from '@/features/auth/types/permissions.types';
import { cn } from '@/shared/lib/cn';

interface TabConfig {
  id: string;
  label: string;
  path: string;
  permission: Permission;
}

const TABS: TabConfig[] = [
  {
    id: 'brand',
    label: 'Brand & Profil',
    path: '/dashboard/settings/brand',
    permission: Permission.EDIT_BUSINESS_INFO,
  },
  {
    id: 'layanan',
    label: 'Layanan',
    path: '/dashboard/settings/layanan',
    permission: Permission.MANAGE_SERVICES,
  },
  { id: 'tim', label: 'Tim', path: '/dashboard/settings/tim', permission: Permission.MANAGE_STAFF },
  {
    id: 'operasional',
    label: 'Operasional',
    path: '/dashboard/settings/operasional',
    permission: Permission.EDIT_BUSINESS_INFO,
  },
  {
    id: 'booking',
    label: 'Booking App',
    path: '/dashboard/settings/booking',
    permission: Permission.EDIT_BUSINESS_INFO,
  },
  {
    id: 'pengguna',
    label: 'Pengguna & Akses',
    path: '/dashboard/settings/pengguna',
    permission: Permission.MANAGE_USERS,
  },
];

export function SettingsTopTabs() {
  const pathname = usePathname();

  const canEditBusinessInfo = useHasPermission(Permission.EDIT_BUSINESS_INFO);
  const canManageServices = useHasPermission(Permission.MANAGE_SERVICES);
  const canManageStaff = useHasPermission(Permission.MANAGE_STAFF);
  const canManageUsers = useHasPermission(Permission.MANAGE_USERS);

  const permissionMap: Partial<Record<Permission, boolean>> = {
    [Permission.EDIT_BUSINESS_INFO]: canEditBusinessInfo,
    [Permission.MANAGE_SERVICES]: canManageServices,
    [Permission.MANAGE_STAFF]: canManageStaff,
    [Permission.MANAGE_USERS]: canManageUsers,
  };

  function isActive(path: string): boolean {
    if (!pathname) return false;
    return pathname === path || pathname.startsWith(path + '/');
  }

  const visibleTabs = TABS.filter((t) => permissionMap[t.permission] !== false);

  return (
    <nav className="shrink-0 border-b border-bd-row bg-bg-page" aria-label="Settings navigation">
      <div className="flex items-end overflow-x-auto px-s16 md:px-s24">
        {visibleTabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={cn(
                '-mb-px shrink-0 whitespace-nowrap border-b-2 px-s12 py-s12 text-ts-fn font-medium transition-colors',
                active
                  ? 'border-tx-primary text-tx-primary'
                  : 'border-transparent text-tx-secondary hover:text-tx-primary'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
