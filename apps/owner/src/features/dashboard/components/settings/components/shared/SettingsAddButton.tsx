// Standard add-action button for settings section headers.
// Card-style outline with embedded Plus icon to match the approved UI.
// Pass to SettingsSectionHeader's `action` slot or the ServicesAccordion header area.

import { Plus } from '@phosphor-icons/react';

interface SettingsAddButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function SettingsAddButton({ onClick, children }: SettingsAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-s8 rounded-r10 border border-bd-card bg-bg-card px-s12 py-s8 text-ts-fn font-medium text-tx-primary shadow-card transition-colors hover:bg-bg-hover"
    >
      <Plus size={13} weight="bold" />
      {children}
    </button>
  );
}
