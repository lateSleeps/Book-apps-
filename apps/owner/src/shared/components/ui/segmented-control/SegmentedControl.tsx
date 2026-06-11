'use client';

import { cn } from '@/shared/lib/cn';

export interface SegmentedControlItem {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  items: SegmentedControlItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Segmented control — shared primitive.
 *
 * SOURCE OF TRUTH: matches the tab strip in BookingTableHeader (Dashboard).
 * Use this component wherever a pill-style tab switcher is needed:
 *   - Dashboard filter tabs (BookingTableHeader)
 *   - Settings sub-nav (SettingsSubNav)
 *   - Any future segmented tab strip
 *
 * Tokens:
 *   Container: bg-bg-control p-s4 gap-s2 rounded-r12
 *   Button:    px-s14 py-s6 rounded-r10 text-ts-fn
 *   Active:    bg-bg-card font-semibold text-tx-primary shadow-tab
 *   Inactive:  font-normal text-tx-secondary hover:text-tx-primary
 */
export function SegmentedControl({ items, activeId, onChange, className }: SegmentedControlProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex max-w-full gap-s2 overflow-x-auto rounded-r12 bg-bg-control p-s4',
        className
      )}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-r10 px-s14 py-s6 text-ts-fn transition-colors',
              active
                ? 'bg-bg-card font-semibold text-tx-primary shadow-tab'
                : 'font-normal text-tx-secondary hover:text-tx-primary'
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
