'use client';

import {
  SquaresFour,
  FileText,
  Clock,
  Users,
  Package,
  ChartBar,
  TrendUp,
  Question,
  Gear,
  SignOut,
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCurrentUser, useHasPermission } from '@/features/auth/hooks/useAuth';
import { Permission } from '@/features/auth/types/permissions.types';
import { getRoleColor, getRoleDisplayName } from '@/features/auth/utils/role-permissions';

const SETTINGS_PERMISSION = Permission.VIEW_SETTINGS;

const NAV_GROUPS = [
  {
    title: 'UTAMA',
    items: [
      { label: 'Dashboard', path: '/dashboard/overview', Icon: SquaresFour },
      { label: 'Riwayat Transaksi', path: '/dashboard/bookings', Icon: FileText },
      { label: 'Jadwal', path: '/dashboard/schedule', Icon: Clock },
    ],
  },
  {
    title: 'MANAJEMEN',
    items: [
      { label: 'Pelanggan', path: '/dashboard/clients', Icon: Users },
      { label: 'Produk Add-on', path: '/dashboard/addons', Icon: Package },
      { label: 'Rekap', path: '/dashboard/recap', Icon: ChartBar },
      { label: 'Aktivitas', path: '/dashboard/activity', Icon: TrendUp },
    ],
  },
  {
    title: 'PENGATURAN',
    items: [{ label: 'Bantuan', path: '/dashboard/help', Icon: Question }],
  },
];

function NavItem({
  label,
  path,
  Icon,
  active,
  collapsed,
}: {
  label: string;
  path: string;
  Icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={path}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        margin: '1px 8px 1px 8px',
        borderRadius: 10,
        background: active || hovered ? '#F2F2F7' : 'transparent',
        color: active ? '#1C1C1E' : '#3C3C43',
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        textDecoration: 'none',
        transition: 'background 0.15s ease',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
    >
      <Icon
        size={20}
        weight="duotone"
        color={active ? '#1C1C1E' : '#8E8E93'}
        style={{ flexShrink: 0 }}
      />
      {!collapsed && label}
    </Link>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const canViewSettings = useHasPermission(SETTINGS_PERMISSION);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [settingsHovered, setSettingsHovered] = useState(false);

  const w = collapsed ? 80 : 260;
  const settingsActive = pathname.startsWith('/dashboard/settings');

  return (
    <aside
      style={{
        width: w,
        minWidth: w,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E5EA',
        borderRadius: '0 20px 20px 0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
      className="hidden md:flex"
    >
      {/* Brand */}
      <div
        style={{
          padding: '20px 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: '#1C1C1E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{ fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}
            >
              RB
            </span>
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#1C1C1E',
                  margin: 0,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                Rara Beauty
              </p>
              <p style={{ fontSize: 12, color: '#8E8E93', margin: 0, whiteSpace: 'nowrap' }}>
                Salon • Pro
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: '#F2F2F7',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {collapsed ? (
            <CaretRight size={12} weight="bold" color="#8E8E93" />
          ) : (
            <CaretLeft size={12} weight="bold" color="#8E8E93" />
          )}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <MagnifyingGlass
              size={16}
              weight="duotone"
              color="#8E8E93"
              style={{ position: 'absolute', left: 10, pointerEvents: 'none' }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              style={{
                width: '100%',
                height: 36,
                borderRadius: 10,
                background: '#F2F2F7',
                border: 'none',
                outline: 'none',
                padding: '8px 36px 8px 34px',
                fontSize: 13,
                color: '#1C1C1E',
                boxSizing: 'border-box',
              }}
            />
            <span
              style={{
                position: 'absolute',
                right: 10,
                fontSize: 11,
                color: '#8E8E93',
                background: '#E5E5EA',
                borderRadius: 4,
                padding: '2px 5px',
                pointerEvents: 'none',
              }}
            >
              ⌘F
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.title}>
            {group.items.map(({ label, path, Icon }) => (
              <NavItem
                key={path}
                label={label}
                path={path}
                Icon={Icon}
                active={pathname.startsWith(path)}
                collapsed={collapsed}
              />
            ))}
            {gi === NAV_GROUPS.length - 1 && canViewSettings && (
              <Link
                href="/dashboard/settings"
                title={collapsed ? 'Pengaturan' : undefined}
                onMouseEnter={() => setSettingsHovered(true)}
                onMouseLeave={() => setSettingsHovered(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  margin: '1px 8px',
                  borderRadius: 10,
                  background: settingsActive || settingsHovered ? '#F2F2F7' : 'transparent',
                  color: settingsActive ? '#1C1C1E' : '#3C3C43',
                  fontWeight: settingsActive ? 600 : 400,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <Gear
                  size={20}
                  weight="duotone"
                  color={settingsActive ? '#1C1C1E' : '#8E8E93'}
                  style={{ flexShrink: 0 }}
                />
                {!collapsed && 'Pengaturan'}
              </Link>
            )}
            {gi < NAV_GROUPS.length - 1 && (
              <div style={{ height: 1, background: '#F2F2F7', margin: '8px 16px' }} />
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {currentUser && (
        <div
          style={{
            padding: collapsed ? '12px 8px' : '16px',
            borderTop: '1px solid #F2F2F7',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: getRoleColor(currentUser.role),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}
            >
              {currentUser.avatar || currentUser.name?.charAt(0) || '?'}
            </div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#1C1C1E',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentUser.name}
                  </p>
                  <p style={{ fontSize: 12, color: '#8E8E93', margin: 0 }}>
                    {getRoleDisplayName(currentUser.role)}
                  </p>
                </div>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <SignOut size={18} weight="duotone" color="#8E8E93" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
