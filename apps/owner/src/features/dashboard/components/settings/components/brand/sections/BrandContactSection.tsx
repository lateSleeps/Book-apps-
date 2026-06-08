import {
  SettingsFormGrid,
  SettingsFieldGroup,
  SettingsInput,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsSection,
  SettingsSectionHeader,
  SettingsContentCard,
} from '@/features/dashboard/components/settings/layout';
import type { BrandContact } from '@/features/dashboard/components/settings/types/brand.types';

interface BrandContactSectionProps {
  contact: BrandContact;
  onChange: (patch: Partial<BrandContact>) => void;
}

export function BrandContactSection({ contact, onChange }: BrandContactSectionProps) {
  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Kontak"
        description="Nomor telepon dan email yang dapat dihubungi pelanggan."
      />
      <SettingsContentCard>
        <SettingsFormGrid cols={2}>
          <SettingsFieldGroup
            label="Nomor Telepon"
            required
            htmlFor="brand-phone"
            hint="Digunakan untuk konfirmasi booking."
          >
            <SettingsInput
              id="brand-phone"
              type="tel"
              value={contact.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+62 812-3456-7890"
            />
          </SettingsFieldGroup>

          <SettingsFieldGroup
            label="WhatsApp"
            htmlFor="brand-wa"
            hint="Nomor tanpa + atau spasi. Contoh: 6281234567890"
          >
            <SettingsInput
              id="brand-wa"
              type="tel"
              value={contact.whatsapp}
              onChange={(e) => onChange({ whatsapp: e.target.value })}
              placeholder="6281234567890"
            />
          </SettingsFieldGroup>

          <SettingsFieldGroup label="Email" htmlFor="brand-email">
            <SettingsInput
              id="brand-email"
              type="email"
              value={contact.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="salon@example.com"
            />
          </SettingsFieldGroup>

          <SettingsFieldGroup label="Website" htmlFor="brand-website">
            <SettingsInput
              id="brand-website"
              type="url"
              value={contact.website}
              onChange={(e) => onChange({ website: e.target.value })}
              placeholder="https://rarabeauty.com"
            />
          </SettingsFieldGroup>
        </SettingsFormGrid>
      </SettingsContentCard>
    </SettingsSection>
  );
}
