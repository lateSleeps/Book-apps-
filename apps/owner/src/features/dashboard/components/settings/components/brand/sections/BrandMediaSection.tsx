import {
  SettingsFormGrid,
  SettingsUploadField,
} from '@/features/dashboard/components/settings/components/shared';
import {
  SettingsSection,
  SettingsSectionHeader,
  SettingsContentCard,
} from '@/features/dashboard/components/settings/layout';
import type { BrandMedia } from '@/features/dashboard/components/settings/types/brand.types';

interface BrandMediaSectionProps {
  media: BrandMedia;
  setLogo: (file: File, previewUrl: string) => void;
  removeLogo: () => void;
  setCoverImage: (file: File, previewUrl: string) => void;
  removeCoverImage: () => void;
}

export function BrandMediaSection({
  media,
  setLogo,
  removeLogo,
  setCoverImage,
  removeCoverImage,
}: BrandMediaSectionProps) {
  return (
    <SettingsSection>
      <SettingsSectionHeader
        title="Logo & Foto Cover"
        description="Aset visual utama yang ditampilkan di halaman booking."
      />
      <SettingsContentCard>
        <SettingsFormGrid cols={2}>
          <SettingsUploadField
            variant="logo"
            value={media.logoUrl}
            onChange={setLogo}
            onRemove={removeLogo}
          />
          <SettingsUploadField
            variant="cover"
            value={media.coverImageUrl}
            onChange={setCoverImage}
            onRemove={removeCoverImage}
          />
        </SettingsFormGrid>
      </SettingsContentCard>
    </SettingsSection>
  );
}
