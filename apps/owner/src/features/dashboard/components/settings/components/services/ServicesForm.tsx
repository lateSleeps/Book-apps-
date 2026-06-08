'use client';

import { AddOnsSection } from './sections/AddOnsSection';
import { BundlesSection } from './sections/BundlesSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { ConsultationQuestionsSection } from './sections/ConsultationQuestionsSection';
import { ServicesListSection } from './sections/ServicesListSection';
import type { ServicesController } from '@/features/dashboard/hooks/settings/useServicesController';

interface ServicesFormProps {
  ctrl: ServicesController;
}

export function ServicesForm({ ctrl }: ServicesFormProps) {
  const { domain } = ctrl;

  // TODO: open create/edit dialogs or sub-routes
  function handleStub(action: string) {
    console.log(`[ServicesForm] stub action: ${action}`);
  }

  // Returns a fragment, not a wrapper. Section rhythm is owned by
  // SettingsPageShell (gap-s32) — identical source to the Brand domain.
  return (
    <>
      <CategoriesSection
        categories={domain.categories}
        onToggleActive={ctrl.updateCategory}
        onAdd={() => handleStub('add-category')}
      />
      <ServicesListSection
        services={domain.services}
        categories={domain.categories}
        onArchive={ctrl.archiveService}
        onAdd={() => handleStub('add-service')}
      />
      <ConsultationQuestionsSection
        services={domain.services}
        onAddQuestion={(serviceId) => handleStub(`add-question:${serviceId}`)}
      />
      <BundlesSection
        bundles={domain.bundles}
        services={domain.services}
        onToggleActive={ctrl.updateBundle}
        onAdd={() => handleStub('add-bundle')}
      />
      <AddOnsSection
        addons={domain.addons}
        onToggleActive={ctrl.updateAddon}
        onAdd={() => handleStub('add-addon')}
      />
    </>
  );
}
