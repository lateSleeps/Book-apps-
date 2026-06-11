'use client';

import { Package } from '@phosphor-icons/react';
import {
  SettingsEmptyState,
  EntityActionMenu,
  SettingsAddButton,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsSection,
  SettingsSectionHeader,
} from '@/features/dashboard/components/settings/layout';
import type {
  ServiceBundle,
  ServiceItem,
} from '@/features/dashboard/components/settings/types/services.types';
import { formatPrice } from '@/shared/lib/format';

interface BundlesSectionProps {
  bundles: ServiceBundle[];
  services: ServiceItem[];
  onAdd: () => void;
  onEdit: (bundle: ServiceBundle) => void;
  onDelete: (bundle: ServiceBundle) => void;
}

export function BundlesSection({
  bundles,
  services,
  onAdd,
  onEdit,
  onDelete,
}: BundlesSectionProps) {
  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]));

  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Paket Bundle"
        description="Gabungkan beberapa layanan dengan harga spesial."
        action={
          <SettingsAddButton onClick={onAdd} disabled={services.length === 0}>
            Buat Paket
          </SettingsAddButton>
        }
      />

      {bundles.length === 0 ? (
        <div className="rounded-r16 border border-bd-card bg-bg-card shadow-card">
          <SettingsEmptyState
            icon={<Package size={24} weight="duotone" />}
            title="Belum ada paket bundle"
            description={
              services.length === 0
                ? 'Tambahkan layanan terlebih dahulu sebelum membuat paket bundle.'
                : 'Buat paket untuk menawarkan kombinasi layanan dengan harga lebih hemat.'
            }
            action={
              services.length > 0 ? (
                <SettingsAddButton onClick={onAdd}>Buat Paket</SettingsAddButton>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-s12 md:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => {
            const originalPrice = bundle.serviceIds.reduce(
              (sum, id) => sum + (serviceMap[id]?.price ?? 0),
              0
            );
            const savings = originalPrice - bundle.bundlePrice;
            const includedNames = bundle.serviceIds
              .map((id) => serviceMap[id]?.name)
              .filter(Boolean)
              .join(', ');

            return (
              <div
                key={bundle.id}
                className="flex flex-col overflow-hidden rounded-r16 border border-bd-card bg-bg-card shadow-card transition-shadow hover:shadow-dropdown"
              >
                {bundle.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bundle.imageUrl}
                    alt={bundle.name}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-bg-control">
                    <Package size={40} weight="duotone" className="text-tx-muted" />
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-s12 p-s16">
                  <div className="flex items-center justify-end">
                    <EntityActionMenu
                      actions={[
                        { label: 'Edit Bundle', onClick: () => onEdit(bundle) },
                        {
                          label: 'Hapus Permanen',
                          variant: 'danger',
                          onClick: () => onDelete(bundle),
                        },
                      ]}
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-s4">
                    <p className="m-0 text-ts-fn font-semibold text-tx-primary">{bundle.name}</p>
                    {includedNames && (
                      <p className="m-0 line-clamp-2 text-ts-cap1 text-tx-secondary">
                        {includedNames}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-s4 border-t border-bd-row pt-s12">
                    <div className="flex items-center gap-s8">
                      <p className="m-0 text-ts-fn font-bold text-tx-primary">
                        {formatPrice(bundle.bundlePrice)}
                      </p>
                      {originalPrice > 0 && (
                        <p className="m-0 text-ts-cap1 text-tx-muted line-through">
                          {formatPrice(originalPrice)}
                        </p>
                      )}
                    </div>
                    {savings > 0 && (
                      <span className="w-fit rounded-rF bg-st-in-progress-bg px-s8 py-0.5 text-ts-cap2 font-medium text-st-in-progress">
                        Hemat {formatPrice(savings)}
                      </span>
                    )}
                    <span className="w-fit rounded-rF bg-st-confirmed-bg px-s8 py-0.5 text-ts-cap2 font-medium text-st-confirmed">
                      {bundle.serviceIds.length} layanan
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SettingsSection>
  );
}
