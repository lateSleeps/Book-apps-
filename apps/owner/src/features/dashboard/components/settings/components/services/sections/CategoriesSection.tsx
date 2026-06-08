'use client';

import { Tag } from '@phosphor-icons/react';
import {
  SettingsListCard,
  SettingsEmptyState,
  SettingsAddButton,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsSection,
  SettingsSectionHeader,
  SettingsContentCard,
} from '@/features/dashboard/components/settings/layout';
import type { ServiceCategory } from '@/features/dashboard/components/settings/types/services.types';
import type { ServicesController } from '@/features/dashboard/hooks/settings/useServicesController';

interface CategoriesSectionProps {
  categories: ServiceCategory[];
  onToggleActive: ServicesController['updateCategory'];
  onAdd: () => void;
}

export function CategoriesSection({ categories, onToggleActive, onAdd }: CategoriesSectionProps) {
  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Kategori"
        description="Kategori layanan yang tampil di halaman booking pelanggan."
        action={<SettingsAddButton onClick={onAdd}>+ Tambah Kategori</SettingsAddButton>}
      />

      <SettingsContentCard padding="none">
        {categories.length === 0 ? (
          <SettingsEmptyState
            icon={<Tag size={24} weight="duotone" />}
            title="Belum ada kategori"
            description="Tambah kategori untuk mengelompokkan layanan salon."
          />
        ) : (
          <div className="divide-y divide-bd-row">
            {categories.map((cat) => (
              <SettingsListCard
                key={cat.id}
                className="rounded-none border-0 shadow-none"
                /* blobColor is user data, not a design token — safe for inline style */
                imageFallback={cat.icon}
                title={cat.name}
                description={cat.description}
                badges={[
                  {
                    label: cat.isActive ? 'Aktif' : 'Nonaktif',
                    variant: cat.isActive ? 'success' : 'default',
                  },
                ]}
                actions={
                  <button
                    type="button"
                    onClick={() => onToggleActive(cat.id, { isActive: !cat.isActive })}
                    className="rounded-r8 border border-bd-card px-s8 py-s4 text-ts-cap2 text-tx-control transition-colors hover:bg-bg-hover"
                  >
                    {cat.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                }
              />
            ))}
          </div>
        )}
      </SettingsContentCard>
    </SettingsSection>
  );
}
