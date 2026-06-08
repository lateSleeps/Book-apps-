'use client';

import { BrandContactSection } from './sections/BrandContactSection';
import { BrandIdentitySection } from './sections/BrandIdentitySection';
import { BrandLocationSection } from './sections/BrandLocationSection';
import { BrandMediaSection } from './sections/BrandMediaSection';
import { BrandSocialSection } from './sections/BrandSocialSection';
import type { BrandProfileController } from '@/features/dashboard/hooks/settings/useBrandProfileController';

interface BrandFormProps {
  ctrl: BrandProfileController;
}

// Returns a fragment, not a wrapper. Section rhythm is owned by
// SettingsPageShell (gap-s32) so every domain shares one spacing source.
export function BrandForm({ ctrl }: BrandFormProps) {
  const { profile } = ctrl;

  return (
    <>
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
    </>
  );
}
