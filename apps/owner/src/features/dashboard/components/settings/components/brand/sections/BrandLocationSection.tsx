import {
  SettingsFormGrid,
  SettingsFieldGroup,
  SettingsInput,
  SettingsTextarea,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsSection,
  SettingsSectionHeader,
  SettingsContentCard,
} from '@/features/dashboard/components/settings/layout';
import type { BrandLocation } from '@/features/dashboard/components/settings/types/brand.types';

interface BrandLocationSectionProps {
  location: BrandLocation;
  onChange: (patch: Partial<BrandLocation>) => void;
}

export function BrandLocationSection({ location, onChange }: BrandLocationSectionProps) {
  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Lokasi"
        description="Alamat salon yang ditampilkan di halaman booking."
      />
      <SettingsContentCard>
        <SettingsFormGrid cols={2}>
          <SettingsFieldGroup label="Alamat" required htmlFor="brand-address" fullWidth>
            <SettingsTextarea
              id="brand-address"
              rows={2}
              value={location.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Jl. Sudirman No. 12, Jakarta Pusat"
            />
          </SettingsFieldGroup>

          <SettingsFieldGroup label="Kota" htmlFor="brand-city">
            <SettingsInput
              id="brand-city"
              type="text"
              value={location.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Jakarta"
            />
          </SettingsFieldGroup>

          <SettingsFieldGroup
            label="Google Maps URL"
            htmlFor="brand-maps"
            hint="Link embed atau share dari Google Maps"
          >
            <SettingsInput
              id="brand-maps"
              type="url"
              value={location.mapsUrl}
              onChange={(e) => onChange({ mapsUrl: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
          </SettingsFieldGroup>
        </SettingsFormGrid>
      </SettingsContentCard>
    </SettingsSection>
  );
}
