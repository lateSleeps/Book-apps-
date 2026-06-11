'use client';

import { BrandContactSection } from './sections/BrandContactSection';
import { BrandIdentitySection } from './sections/BrandIdentitySection';
import { BrandLocationSection } from './sections/BrandLocationSection';
import { BrandMediaSection } from './sections/BrandMediaSection';
import { BrandSocialSection } from './sections/BrandSocialSection';
import { SettingsPanel } from '@/features/dashboard/components/settings/layout';
import type { BrandProfileController } from '@/features/dashboard/hooks/settings/useBrandProfileController';

interface BrandFormProps {
  ctrl: BrandProfileController;
}

// All sections live in one white SettingsPanel, separated by hairline
// dividers (Riwayat-style grouped list). Single scroll, no sub-tabs.
export function BrandForm({ ctrl }: BrandFormProps) {
  const { profile } = ctrl;

  return (
    <SettingsPanel>
      <BrandIdentitySection identity={profile.identity} onChange={ctrl.setIdentity} />
      <BrandMediaSection
        media={profile.media}
        setLogo={ctrl.setLogo}
        removeLogo={ctrl.removeLogo}
        setCoverImage={ctrl.setCoverImage}
        removeCoverImage={ctrl.removeCoverImage}
      />
      <BrandContactSection contact={profile.contact} onChange={ctrl.setContact} />
      <BrandSocialSection social={profile.social} onChange={ctrl.setSocial} />
      <BrandLocationSection location={profile.location} onChange={ctrl.setLocation} />
    </SettingsPanel>
  );
}
