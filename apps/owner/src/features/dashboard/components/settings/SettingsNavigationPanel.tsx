'use client';

import {
  Storefront,
  Scissors,
  ShoppingBag,
  Users,
  Clock,
  CalendarCheck,
  UserGear,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useHasPermission } from '@/features/auth/hooks/useAuth';
import { Permission } from '@/features/auth/types/permissions.types';
import { cn } from '@/shared/lib/cn';

interface NavItem {
  id: string;
  label: string;
  path: string;
  Icon: Icon;
  permission: Permission;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Salon',
    items: [
      {
        id: 'brand',
        label: 'Brand & Profil',
        path: '/dashboard/settings/brand',
        Icon: Storefront,
        permission: Permission.EDIT_BUSINESS_INFO,
      },
      {
        id: 'layanan',
        label: 'Layanan',
        path: '/dashboard/settings/layanan',
        Icon: Scissors,
        permission: Permission.MANAGE_SERVICES,
      },
      {
        id: 'produk-paket',
        label: 'Produk & Paket',
        path: '/dashboard/settings/produk-paket',
        Icon: ShoppingBag,
        permission: Permission.MANAGE_ADDONS,
      },
    ],
  },
  {
    label: 'Tim & Operasional',
    items: [
      {
        id: 'tim',
        label: 'Tim',
        path: '/dashboard/settings/tim',
        Icon: Users,
        permission: Permission.MANAGE_STAFF,
      },
      {
        id: 'pengguna',
        label: 'Pengguna & Akses',
        path: '/dashboard/settings/pengguna',
        Icon: UserGear,
        permission: Permission.MANAGE_USERS,
      },
      {
        id: 'operasional',
        label: 'Operasional',
        path: '/dashboard/settings/operasional',
        Icon: Clock,
        permission: Permission.MANAGE_WORKING_HOURS,
      },
    ],
  },
  {
    label: 'Aplikasi',
    items: [
      {
        id: 'booking',
        label: 'Booking App',
        path: '/dashboard/settings/booking',
        Icon: CalendarCheck,
        permission: Permission.EDIT_BUSINESS_INFO,
      },
    ],
  },
];

export function SettingsNavigationPanel() {
  const pathname = usePathname();
  const { isLoading } = useAuth();

  const canEditBusiness = useHasPermission(Permission.EDIT_BUSINESS_INFO);
  const canManageServices = useHasPermission(Permission.MANAGE_SERVICES);
  const canManageAddons = useHasPermission(Permission.MANAGE_ADDONS);
  const canManageStaff = useHasPermission(Permission.MANAGE_STAFF);
  const canManageHours = useHasPermission(Permission.MANAGE_WORKING_HOURS);
  const canManageUsers = useHasPermission(Permission.MANAGE_USERS);

  const permMap: Partial<Record<Permission, boolean>> = {
    [Permission.EDIT_BUSINESS_INFO]: canEditBusiness,
    [Permission.MANAGE_SERVICES]: canManageServices,
    [Permission.MANAGE_ADDONS]: canManageAddons,
    [Permission.MANAGE_STAFF]: canManageStaff,
    [Permission.MANAGE_WORKING_HOURS]: canManageHours,
    [Permission.MANAGE_USERS]: canManageUsers,
  };

  function isActive(path: string) {
    if (!pathname) return false;
    return pathname === path || pathname.startsWith(path + '/');
  }

  // Flat list for mobile — groups not shown
  // During auth loading, show all items (isLoading = true). After load, filter by real permissions.
  const allItems = NAV_GROUPS.flatMap((g) => g.items).filter(
    (item) => isLoading || permMap[item.permission] !== false
  );

  return (
    <>
      {/* Mobile: horizontal scroll bar */}
      <nav
        aria-label="Settings navigation"
        className="flex shrink-0 flex-row gap-s4 overflow-x-auto border-b border-bd-row bg-bg-card px-s8 py-s8 md:hidden"
      >
        {allItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              href={item.path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex shrink-0 items-center gap-s8 rounded-r10 px-s12 py-s8 text-ts-fn font-medium transition-colors',
                active
                  ? 'bg-bg-hover text-tx-primary'
                  : 'text-tx-secondary hover:bg-bg-hover hover:text-tx-primary'
              )}
            >
              <item.Icon size={16} weight={active ? 'duotone' : 'regular'} className="shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop: vertical sidebar matching DashboardSidebar style */}
      <nav
        aria-label="Settings navigation"
        className="ml-s24 mt-s24 hidden w-64 shrink-0 flex-col self-start rounded-r16 border border-bd-card bg-bg-card p-s12 shadow-card md:flex"
      >
        {NAV_GROUPS.map((group, groupIdx) => {
          const visibleItems = group.items.filter(
            (item) => isLoading || permMap[item.permission] !== false
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              {/* Divider between groups */}
              {groupIdx > 0 && <div className="my-s8 h-px bg-bd-row" />}

              {/* Group label */}
              <p className="m-0 pb-s4 pt-s8 text-ts-cap2 font-semibold uppercase tracking-widest text-tx-muted">
                {group.label}
              </p>

              {/* Items */}
              {visibleItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'my-[1px] flex items-center gap-s12 rounded-r10 px-s8 py-s8 text-ts-sub transition-colors',
                      active
                        ? 'bg-bg-hover font-semibold text-tx-primary'
                        : 'font-normal text-tx-secondary hover:bg-bg-hover hover:text-tx-primary'
                    )}
                  >
                    <item.Icon
                      size={22}
                      weight={active ? 'duotone' : 'regular'}
                      className={cn('shrink-0', active ? 'text-tx-primary' : 'text-tx-muted')}
                    />
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </>
  );
}
