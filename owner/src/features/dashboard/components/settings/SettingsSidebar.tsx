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

const sections = [
  {
    id: 'general' as const,
    label: 'Informasi Umum',
    icon: UserIcon,
    description: 'Informasi dasar pemilik',
  },
  {
    id: 'profile' as const,
    label: 'Profil Salon',
    icon: BuildingStorefrontIcon,
    description: 'Detail salon dan kontak',
  },
  {
    id: 'services' as const,
    label: 'Layanan & Kategori',
    icon: SparklesIcon,
    description: 'Kelola layanan dan kategori',
  },
  {
    id: 'team' as const,
    label: 'Tim & Jadwal',
    icon: UserGroupIcon,
    description: 'Kelola staff dan availability',
  },
  {
    id: 'addons' as const,
    label: 'Produk Add-On',
    icon: GiftIcon,
    description: 'Produk tambahan',
  },
  {
    id: 'users-roles' as const,
    label: 'Pengguna & Peran',
    icon: ShieldCheckIcon,
    description: 'Kelola pengguna dan izin',
  },
  {
    id: 'other' as const,
    label: 'Pengaturan Lainnya',
    icon: CogIcon,
    description: 'Pengaturan lanjutan',
  },
];

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  return (
    <div className="w-72 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col max-h-[calc(100vh-200px)]">
      <div className="px-6 py-6 border-b border-[#f0f0ee]">
        <h2 className="text-[14px] font-semibold text-[#666] uppercase tracking-wider">
          Pengaturan
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 p-3">
          {sections.map((section) => {
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
