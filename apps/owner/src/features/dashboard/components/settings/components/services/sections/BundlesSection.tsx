'use client';

import { Package } from '@phosphor-icons/react';
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
import type {
  ServiceBundle,
  ServiceItem,
} from '@/features/dashboard/components/settings/types/services.types';
import type { ServicesController } from '@/features/dashboard/hooks/settings/useServicesController';

interface BundlesSectionProps {
  bundles: ServiceBundle[];
  services: ServiceItem[];
  onToggleActive: ServicesController['updateBundle'];
  onAdd: () => void;
}

export function BundlesSection({ bundles, services, onToggleActive, onAdd }: BundlesSectionProps) {
  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s.name]));

  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Paket Bundle"
        description="Gabungkan beberapa layanan dengan harga spesial. Catalog only — tidak ada logika booking di sini."
        action={<SettingsAddButton onClick={onAdd}>+ Buat Paket</SettingsAddButton>}
      />

      <SettingsContentCard padding="none">
        {bundles.length === 0 ? (
          <SettingsEmptyState
            icon={<Package size={24} weight="duotone" />}
            title="Belum ada paket bundle"
            description="Buat paket untuk menawarkan kombinasi layanan dengan harga lebih hemat."
          />
        ) : (
          <div className="divide-y divide-bd-row">
            {bundles.map((bundle) => {
              const includedNames = bundle.serviceIds
                .map((id) => serviceMap[id])
                .filter(Boolean)
                .join(', ');

              return (
                <SettingsListCard
                  key={bundle.id}
                  className="rounded-none border-0 shadow-none"
                  imageFallback="📦"
                  title={bundle.name}
                  description={includedNames || bundle.description}
                  badges={[
                    {
                      label: new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      }).format(bundle.bundlePrice),
                      variant: 'default',
                    },
                    { label: `${bundle.serviceIds.length} layanan`, variant: 'info' },
                    {
                      label: bundle.isActive ? 'Aktif' : 'Nonaktif',
                      variant: bundle.isActive ? 'success' : 'default',
                    },
                  ]}
                  actions={
                    <button
                      type="button"
                      onClick={() => onToggleActive(bundle.id, { isActive: !bundle.isActive })}
                      className="rounded-r8 border border-bd-card px-s8 py-s4 text-ts-cap2 text-tx-control transition-colors hover:bg-bg-hover"
                    >
                      {bundle.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  }
                />
              );
            })}
          </div>
        )}
      </SettingsContentCard>
    </SettingsSection>
  );
}
