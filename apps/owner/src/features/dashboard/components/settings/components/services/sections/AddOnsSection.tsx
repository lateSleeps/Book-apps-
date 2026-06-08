'use client';

import { ShoppingBag } from '@phosphor-icons/react';
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
import type { AddOnProduct } from '@/features/dashboard/components/settings/types/services.types';
import type { ServicesController } from '@/features/dashboard/hooks/settings/useServicesController';

interface AddOnsSectionProps {
  addons: AddOnProduct[];
  onToggleActive: ServicesController['updateAddon'];
  onAdd: () => void;
}

export function AddOnsSection({ addons, onToggleActive, onAdd }: AddOnsSectionProps) {
  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Produk Add-on"
        description="Produk tambahan yang ditawarkan kepada pelanggan saat booking. Upload foto produk untuk tampil di customer app."
        action={<SettingsAddButton onClick={onAdd}>+ Tambah Produk</SettingsAddButton>}
      />

      <SettingsContentCard padding="none">
        {addons.length === 0 ? (
          <SettingsEmptyState
            icon={<ShoppingBag size={24} weight="duotone" />}
            title="Belum ada produk add-on"
            description="Tambah produk pelengkap yang bisa dipesan bersamaan dengan layanan."
          />
        ) : (
          <div className="divide-y divide-bd-row">
            {addons.map((addon) => (
              <SettingsListCard
                key={addon.id}
                className="rounded-none border-0 shadow-none"
                imageUrl={addon.imageUrl ?? undefined}
                imageFallback={addon.imageEmoji}
                title={addon.name}
                description={addon.description}
                badges={[
                  {
                    label: new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    }).format(addon.price),
                    variant: 'default',
                  },
                  {
                    label: addon.isActive ? 'Aktif' : 'Nonaktif',
                    variant: addon.isActive ? 'success' : 'default',
                  },
                  ...(addon.imageUrl
                    ? []
                    : [{ label: 'Belum ada foto', variant: 'warning' as const }]),
                ]}
                actions={
                  <button
                    type="button"
                    onClick={() => onToggleActive(addon.id, { isActive: !addon.isActive })}
                    className="rounded-r8 border border-bd-card px-s8 py-s4 text-ts-cap2 text-tx-control transition-colors hover:bg-bg-hover"
                  >
                    {addon.isActive ? 'Nonaktifkan' : 'Aktifkan'}
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
