// Standard primary action button for a settings section header.
// Pass to SettingsSectionHeader's `action` slot so every list domain
// (Categories, Services, Bundles, Add-ons) gets the same add affordance.

import type { ReactNode } from 'react';

interface SettingsAddButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export function SettingsAddButton({ onClick, children }: SettingsAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-r10 bg-ac-primary px-s12 py-s8 text-ts-cap1 font-medium text-white transition-opacity hover:opacity-90"
    >
      {children}
    </button>
  );
}
