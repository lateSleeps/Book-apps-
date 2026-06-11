import {
  SettingsFormGrid,
  SettingsFieldGroup,
  SettingsInput,
  SettingsTextarea,
} from '@/features/dashboard/components/settings/components/shared';
import { SettingsPanelSection } from '@/features/dashboard/components/settings/layout';
import type { BrandIdentity } from '@/features/dashboard/components/settings/types/brand.types';

interface BrandIdentitySectionProps {
  identity: BrandIdentity;
  onChange: (patch: Partial<BrandIdentity>) => void;
}

export function BrandIdentitySection({ identity, onChange }: BrandIdentitySectionProps) {
  return (
    <SettingsPanelSection
      title="Identitas Salon"
      description="Nama dan deskripsi yang ditampilkan di halaman booking pelanggan."
    >
      <SettingsFormGrid cols={2}>
        <SettingsFieldGroup label="Nama Salon" required htmlFor="brand-name">
          <SettingsInput
            id="brand-name"
            type="text"
            value={identity.salonName}
            onChange={(e) => onChange({ salonName: e.target.value })}
            placeholder="Contoh: Rara Beauty Salon"
          />
        </SettingsFieldGroup>

        <SettingsFieldGroup
          label="Tagline"
          htmlFor="brand-tagline"
          hint="Kalimat pendek yang muncul di bawah nama salon."
        >
          <SettingsInput
            id="brand-tagline"
            type="text"
            value={identity.tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
            placeholder="Contoh: Kecantikan yang memancarkan kepercayaan diri"
          />
        </SettingsFieldGroup>

        <SettingsFieldGroup
          label="Deskripsi"
          htmlFor="brand-desc"
          fullWidth
          hint="Muncul di halaman utama booking dan meta SEO."
        >
          <SettingsTextarea
            id="brand-desc"
            rows={3}
            value={identity.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Ceritakan tentang salon Anda..."
          />
        </SettingsFieldGroup>
      </SettingsFormGrid>
    </SettingsPanelSection>
  );
}
