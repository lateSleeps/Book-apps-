"use client";

import { cn } from "@/shared/lib/cn";

export interface SegmentedControlItem {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  items: SegmentedControlItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  /** When true, each tab occupies equal width (50/50 for 2 items, etc.) */
  fullWidth?: boolean;
}

/**
 * SegmentedControl — Customer App
 *
 * Tokens are 1:1 with Owner App (BookingTableHeader / SegmentedControl):
 *   Container : bg-bg-control  p-[4px]  gap-[2px]  rounded-[12px]
 *   Active    : bg-bg-card  font-semibold  text-tx-primary  shadow-tab  rounded-[10px]
 *   Inactive  : font-normal  text-tx-secondary
 *   Font      : text-ts-fn (13px)
 *   Touch pad : px-[14px] py-[6px]
 */
export function SegmentedControl({
  items,
  activeId,
  onChange,
  className,
  fullWidth = false,
}: SegmentedControlProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "gap-[2px] overflow-x-auto rounded-[12px] bg-bg-control p-[4px]",
        fullWidth ? "flex w-full" : "inline-flex max-w-full",
        className,
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
              "whitespace-nowrap rounded-[10px] px-[14px] py-[6px] text-ts-fn transition-all duration-150 text-center",
              fullWidth ? "flex-1" : "shrink-0",
              active
                ? "bg-bg-card font-semibold text-tx-primary shadow-tab"
                : "font-normal text-tx-secondary",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
