import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon: ReactNode;
  iconBg: string;
}

export function StatCard({ label, value, delta, deltaLabel = '%', icon, iconBg }: StatCardProps) {
  const isPositive = delta !== undefined && delta >= 0;
  const isNegative = delta !== undefined && delta < 0;

  return (
    <div className="bg-surface rounded-r20 border border-sep p-s20 flex flex-col gap-s12">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-r12 flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center px-[8px] py-[3px] rounded-rF text-[11px] font-semibold',
              isPositive && 'bg-[#d8f3ec] text-[#1a6647]',
              isNegative && 'bg-[#fde8dc] text-[#b03030]'
            )}
          >
            {isPositive ? '+' : ''}{delta}{deltaLabel}
          </span>
        )}
      </div>
      <div>
        <div className="text-[26px] font-bold text-label leading-none">{value}</div>
        <div className="text-[12px] text-label3 mt-[5px]">{label}</div>
      </div>
    </div>
  );
}
