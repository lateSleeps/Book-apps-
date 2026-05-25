'use client';
import {
  UserIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
  UserGroupIcon,
  GiftIcon,
  CogIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useHasPermission } from '@/features/auth/hooks/useAuth';
import { Permission } from '@/features/auth/types/permissions.types';

export type SettingsSection =
  | 'general'
  | 'profile'
  | 'services'
  | 'team'
  | 'addons'
  | 'users-roles'
  | 'other';

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

interface SettingsSectionConfig {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  requiredPermission?: Permission;
}

const sections: SettingsSectionConfig[] = [
  {
    id: 'general' as const,
    label: 'Informasi Umum',
    icon: UserIcon,
    description: 'Informasi dasar pemilik',
    requiredPermission: Permission.VIEW_SETTINGS,
  },
  {
    id: 'profile' as const,
    label: 'Profil Salon',
    icon: BuildingStorefrontIcon,
    description: 'Detail salon dan kontak',
    requiredPermission: Permission.EDIT_BUSINESS_INFO,
  },
  {
    id: 'services' as const,
    label: 'Layanan & Kategori',
    icon: SparklesIcon,
    description: 'Kelola layanan dan kategori',
    requiredPermission: Permission.MANAGE_SERVICES,
  },
  {
    id: 'team' as const,
    label: 'Tim & Jadwal',
    icon: UserGroupIcon,
    description: 'Kelola staff dan availability',
    requiredPermission: Permission.MANAGE_STAFF,
  },
  {
    id: 'addons' as const,
    label: 'Produk Add-On',
    icon: GiftIcon,
    description: 'Produk tambahan',
    requiredPermission: Permission.MANAGE_ADDONS,
  },
  {
    id: 'users-roles' as const,
    label: 'Pengguna & Peran',
    icon: ShieldCheckIcon,
    description: 'Kelola pengguna dan izin',
    requiredPermission: Permission.MANAGE_USERS,
  },
  {
    id: 'other' as const,
    label: 'Pengaturan Lainnya',
    icon: CogIcon,
    description: 'Pengaturan lanjutan',
    requiredPermission: Permission.VIEW_SETTINGS,
  },
];

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  // Call all permission hooks at top level
  const canViewSettings = useHasPermission(Permission.VIEW_SETTINGS);
  const canEditBusinessInfo = useHasPermission(Permission.EDIT_BUSINESS_INFO);
  const canManageServices = useHasPermission(Permission.MANAGE_SERVICES);
  const canManageStaff = useHasPermission(Permission.MANAGE_STAFF);
  const canManageAddons = useHasPermission(Permission.MANAGE_ADDONS);
  const canManageUsers = useHasPermission(Permission.MANAGE_USERS);

  // Build permission map for quick lookup
  const permissionMap: Record<SettingsSection, boolean> = {
    general: canViewSettings,
    profile: canEditBusinessInfo,
    services: canManageServices,
    team: canManageStaff,
    addons: canManageAddons,
    'users-roles': canManageUsers,
    other: canViewSettings,
  };

  // Filter sections based on permissions
  const visibleSections = sections.filter((section) => permissionMap[section.id]);

  return (
    <div className="w-72 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col max-h-[calc(100vh-200px)]">
      <div className="px-6 py-6 border-b border-[#f0f0ee]">
        <h2 className="text-[14px] font-semibold text-[#666] uppercase tracking-wider">
          Pengaturan
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 p-3">
          {visibleSections.map((section) => {
            const IconComponent = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-start gap-3 ${
                  isActive
                    ? 'bg-[#f5f5f3] border-l-4 border-[#16a34a]'
                    : 'hover:bg-[#fafaf8] border-l-4 border-transparent'
                }`}
              >
                <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isActive ? 'text-[#16a34a]' : 'text-[#999]'
                }`} />
                <div className="flex-1">
                  <div className={`text-[13px] font-medium ${
                    isActive ? 'text-[#1a1a1a]' : 'text-[#666]'
                  }`}>
                    {section.label}
                  </div>
                  <div className="text-[11px] text-[#aaa] mt-0.5">
                    {section.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
