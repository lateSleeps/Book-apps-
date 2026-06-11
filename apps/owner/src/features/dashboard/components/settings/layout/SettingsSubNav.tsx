'use client';

import {
  SegmentedControl,
  type SegmentedControlItem,
} from '@/shared/components/ui/segmented-control';

export type { SegmentedControlItem as SettingsSubNavItem };

interface SettingsSubNavProps {
  items: SegmentedControlItem[];
  activeId: string;
  onChange: (id: string) => void;
}

/**
 * Settings sub-nav tab strip.
 * Thin wrapper around SegmentedControl so settings code keeps its own import path.
 */
export function SettingsSubNav({ items, activeId, onChange }: SettingsSubNavProps) {
  return <SegmentedControl items={items} activeId={activeId} onChange={onChange} />;
}
