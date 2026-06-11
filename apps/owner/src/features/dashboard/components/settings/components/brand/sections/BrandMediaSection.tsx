import {
  SettingsFormGrid,
  SettingsUploadField,
} from '@/features/dashboard/components/settings/components/shared';
import { SettingsPanelSection } from '@/features/dashboard/components/settings/layout';
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
    <SettingsPanelSection
      title="Logo & Foto Cover"
      description="Aset visual utama yang ditampilkan di halaman booking."
    >
      {/* grid-cols-2 items-stretch: cover (right) sets row height via aspect-[16/6];
          logo (left) mirrors that height as a square via h-full aspect-square */}
      <SettingsFormGrid cols={2} className="items-stretch">
        <SettingsUploadField
          variant="logo"
          fillHeight
          zoneClassName="w-full h-full"
          value={media.logoUrl}
          onChange={setLogo}
          onRemove={removeLogo}
          className="w-full"
        />
        <SettingsUploadField
          variant="cover"
          value={media.coverImageUrl}
          onChange={setCoverImage}
          onRemove={removeCoverImage}
        />
      </SettingsFormGrid>
    </SettingsPanelSection>
  );
}
