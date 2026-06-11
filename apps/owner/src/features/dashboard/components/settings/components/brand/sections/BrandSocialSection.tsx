import {
  SettingsFormGrid,
  SettingsFieldGroup,
  SettingsInput,
} from '@/features/dashboard/components/settings/components/shared';
import { SettingsPanelSection } from '@/features/dashboard/components/settings/layout';
import type { BrandSocial } from '@/features/dashboard/components/settings/types/brand.types';

interface BrandSocialSectionProps {
  social: BrandSocial;
  onChange: (patch: Partial<BrandSocial>) => void;
}

export function BrandSocialSection({ social, onChange }: BrandSocialSectionProps) {
  return (
    <SettingsPanelSection
      title="Media Sosial"
      description="Link profil yang ditampilkan di halaman booking pelanggan."
    >
      <SettingsFormGrid cols={2}>
        <SettingsFieldGroup label="Instagram" htmlFor="brand-ig" hint="Masukkan username saja.">
          <SettingsInput
            id="brand-ig"
            type="text"
            prefix="instagram.com/"
            value={social.instagram}
            onChange={(e) => onChange({ instagram: e.target.value })}
            placeholder="rarabeauty"
          />
        </SettingsFieldGroup>

        <SettingsFieldGroup label="TikTok" htmlFor="brand-tt" hint="Username tanpa @">
          <SettingsInput
            id="brand-tt"
            type="text"
            prefix="tiktok.com/@"
            value={social.tiktok}
            onChange={(e) => onChange({ tiktok: e.target.value })}
            placeholder="rarabeauty"
          />
        </SettingsFieldGroup>

        <SettingsFieldGroup
          label="Facebook"
          htmlFor="brand-fb"
          hint="Username atau halaman Facebook"
        >
          <SettingsInput
            id="brand-fb"
            type="text"
            value={social.facebook}
            onChange={(e) => onChange({ facebook: e.target.value })}
            placeholder="rarabeautysalon"
          />
        </SettingsFieldGroup>
      </SettingsFormGrid>
    </SettingsPanelSection>
  );
}
