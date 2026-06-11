// Title + optional description for a settings section.
// Rendered as the first child of SettingsSection, before any cards.
//
// action — optional trailing slot (e.g. an "+ Add" button).
//          When present, the header becomes a space-between row.
//          Use SettingsAddButton for the standard primary action.

import type { ReactNode } from 'react';

interface SettingsSectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SettingsSectionHeader({ title, description, action }: SettingsSectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-s16">
      <div className="flex min-w-0 flex-col gap-s4">
        <h2 className="m-0 text-ts-t3 font-bold text-tx-primary">{title}</h2>
        {description && <p className="m-0 text-ts-fn text-tx-secondary">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
