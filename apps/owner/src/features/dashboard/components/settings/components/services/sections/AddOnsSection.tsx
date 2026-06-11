'use client';

import { ShoppingBag } from '@phosphor-icons/react';
import {
  SettingsEmptyState,
  EntityActionMenu,
  SettingsAddButton,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsSection,
  SettingsSectionHeader,
} from '@/features/dashboard/components/settings/layout';
import type { AddOnProduct } from '@/features/dashboard/components/settings/types/services.types';
import { formatPrice } from '@/shared/lib/format';

interface AddOnsSectionProps {
  addons: AddOnProduct[];
  onAdd: () => void;
  onEdit: (addon: AddOnProduct) => void;
  onDelete: (addon: AddOnProduct) => void;
}

export function AddOnsSection({ addons, onAdd, onEdit, onDelete }: AddOnsSectionProps) {
  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Produk Add-on"
        description="Produk tambahan yang ditawarkan kepada pelanggan saat booking."
        action={<SettingsAddButton onClick={onAdd}>Tambah Produk</SettingsAddButton>}
      />

      {addons.length === 0 ? (
        <div className="rounded-r16 border border-bd-card bg-bg-card shadow-card">
          <SettingsEmptyState
            icon={<ShoppingBag size={24} weight="duotone" />}
            title="Belum ada produk add-on"
            description="Tambah produk pelengkap yang bisa dipesan bersamaan dengan layanan."
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-s12 md:grid-cols-3 lg:grid-cols-4">
          {addons.map((addon) => (
            <div
              key={addon.id}
              className="flex flex-col gap-s12 rounded-r16 border border-bd-card bg-bg-card p-s16 shadow-card transition-shadow hover:shadow-dropdown"
            >
              <div className="flex items-center justify-end">
                <EntityActionMenu
                  actions={[
                    { label: 'Edit Produk', onClick: () => onEdit(addon) },
                    { label: 'Hapus Permanen', variant: 'danger', onClick: () => onDelete(addon) },
                  ]}
                />
              </div>

              <div className="flex justify-center">
                {addon.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={addon.imageUrl}
                    alt={addon.name}
                    className="h-16 w-16 rounded-r12 object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-r12 bg-bg-control">
                    <ShoppingBag size={24} weight="duotone" className="text-tx-muted" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-s4">
                <p className="m-0 text-ts-body font-semibold text-tx-primary">{addon.name}</p>
                {addon.description && (
                  <p className="m-0 line-clamp-2 text-ts-fn text-tx-secondary">
                    {addon.description}
                  </p>
                )}
              </div>

              <div className="border-t border-bd-row pt-s12">
                <p className="m-0 text-ts-fn font-bold text-tx-primary">
                  {formatPrice(addon.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </SettingsSection>
  );
}
