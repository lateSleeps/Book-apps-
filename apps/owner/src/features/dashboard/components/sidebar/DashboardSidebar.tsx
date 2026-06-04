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
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCurrentUser, useHasPermission } from '@/features/auth/hooks/useAuth';
import { Permission } from '@/features/auth/types/permissions.types';
import { getRoleColor, getRoleDisplayName } from '@/features/auth/utils/role-permissions';

const SETTINGS_PERMISSION = Permission.VIEW_SETTINGS;

const NAV_MAIN = [
  { label: 'Dashboard', path: '/dashboard/overview', Icon: SquaresFour },
  { label: 'Riwayat Transaksi', path: '/dashboard/bookings', Icon: FileText },
  { label: 'Jadwal', path: '/dashboard/schedule', Icon: Clock },
];

const NAV_MANAGEMENT = [
  { label: 'Pelanggan', path: '/dashboard/clients', Icon: Users },
  { label: 'Produk Add-on', path: '/dashboard/addons', Icon: Package },
  { label: 'Rekap', path: '/dashboard/recap', Icon: ChartBar },
  { label: 'Aktivitas', path: '/dashboard/activity', Icon: TrendUp },
];

const rbLogo = (
  <div
    style={{
      width: 48,
      height: 48,
      borderRadius: 14,
      background: '#1C1C1E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <span style={{ fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>
      RB
    </span>
  </div>
);

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
    <a
      href={path}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        margin: '1px 12px',
        borderRadius: 10,
        background: active || hovered ? '#F2F2F7' : 'transparent',
        color: active ? '#1C1C1E' : '#3C3C43',
        fontWeight: active ? 600 : 400,
        fontSize: 15,
        textDecoration: 'none',
        transition: 'background 0.15s ease',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
    >
      <Icon
        size={22}
        weight="duotone"
        color={active ? '#1C1C1E' : '#8E8E93'}
        style={{ flexShrink: 0 }}
      />
      {!collapsed && (
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
    </a>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const canViewSettings = useHasPermission(SETTINGS_PERMISSION);
  const [collapsed, setCollapsed] = useState(false);

  const w = collapsed ? 80 : 300;

  return (
    <>
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
          position: 'relative',
        }}
        className="hidden md:flex"
      >
        {/* Header */}
        <div style={{ padding: '12px 12px 0', flexShrink: 0 }}>
          {collapsed ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              {rbLogo}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 12,
                background: '#F9F9FB',
                border: '1px solid #E5E5EA',
              }}
            >
              {rbLogo}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1C1C1E',
                    margin: 0,
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Rara Beauty
                </p>
                <p style={{ fontSize: 11, color: '#8E8E93', margin: 0 }}>Salon • Pro</p>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        {!collapsed && (
          <div style={{ padding: '10px 12px', flexShrink: 0 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MagnifyingGlass
                size={15}
                weight="duotone"
                color="#8E8E93"
                style={{ position: 'absolute', left: 12, pointerEvents: 'none' }}
              />
              <input
                placeholder="Search"
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: 10,
                  background: '#F2F2F7',
                  border: '1px solid #E5E5EA',
                  outline: 'none',
                  padding: '0 36px 0 34px',
                  fontSize: 15,
                  fontWeight: 400,
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
                  background: '#F0F0F3',
                  borderRadius: 4,
                  padding: '2px 6px',
                  pointerEvents: 'none',
                }}
              >
                ⌘F
              </span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 4,
          }}
        >
          {/* NAVIGASI UTAMA */}
          <div>
            {!collapsed && (
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#8E8E93',
                  padding: '8px 24px 4px',
                  margin: 0,
                }}
              >
                Navigasi Utama
              </p>
            )}
            {NAV_MAIN.map(({ label, path, Icon }) => (
              <NavItem
                key={path}
                label={label}
                path={path}
                Icon={Icon}
                active={pathname.startsWith(path)}
                collapsed={collapsed}
              />
            ))}
          </div>

          <div style={{ height: 1, background: '#F0F0F3', margin: '10px 12px' }} />

          {/* MANAJEMEN */}
          <div>
            {!collapsed && (
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#8E8E93',
                  padding: '4px 24px 4px',
                  margin: 0,
                }}
              >
                Manajemen
              </p>
            )}
            {NAV_MANAGEMENT.map(({ label, path, Icon }) => (
              <NavItem
                key={path}
                label={label}
                path={path}
                Icon={Icon}
                active={pathname.startsWith(path)}
                collapsed={collapsed}
              />
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* PENGATURAN */}
          <div style={{ paddingBottom: 8 }}>
            <div style={{ height: 1, background: '#F0F0F3', margin: '0 12px 10px' }} />
            {!collapsed && (
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#8E8E93',
                  padding: '4px 24px 4px',
                  margin: 0,
                }}
              >
                Pengaturan
              </p>
            )}
            <NavItem
              label="Bantuan"
              path="/dashboard/help"
              Icon={Question}
              active={pathname.startsWith('/dashboard/help')}
              collapsed={collapsed}
            />
            {canViewSettings && (
              <NavItem
                label="Pengaturan"
                path="/dashboard/settings"
                Icon={Gear}
                active={pathname.startsWith('/dashboard/settings')}
                collapsed={collapsed}
              />
            )}
          </div>
        </nav>

        {/* Footer */}
        {currentUser && (
          <div
            style={{
              padding: collapsed ? '12px 8px' : '12px',
              borderTop: '1px solid #E5E5EA',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: getRoleColor(currentUser.role),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
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
                    <p style={{ fontSize: 11, color: '#8E8E93', margin: 0 }}>
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
                    <SignOut size={16} weight="duotone" color="#8E8E93" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Floating chevron — pinned to right edge of sidebar */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          position: 'fixed',
          top: 48,
          left: w - 14,
          zIndex: 40,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '1px solid #E5E5EA',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'left 0.2s ease',
        }}
        className="hidden md:flex"
      >
        {collapsed ? (
          <CaretRight size={12} weight="bold" color="#8E8E93" />
        ) : (
          <CaretLeft size={12} weight="bold" color="#8E8E93" />
        )}
      </button>
    </>
  );
}
