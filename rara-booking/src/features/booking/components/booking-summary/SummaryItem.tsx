'use client';

import { cn } from '@/shared/lib/cn';

interface SummaryItemProps {
  label: string;
  value: string;
  className?: string;
}

export function SummaryItem({ label, value, className }: SummaryItemProps) {
  return (
    <div className={cn('flex justify-between items-start py-s12 border-b border-sep last:border-0', className)}>
      <span className="text-t14 text-label2">{label}</span>
      <span className="text-t14 font-semibold text-label text-right max-w-[60%]">{value}</span>
    </div>
  );
}
