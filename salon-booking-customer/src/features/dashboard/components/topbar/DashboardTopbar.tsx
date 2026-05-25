import type { ReactNode } from 'react';

interface DashboardTopbarProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function DashboardTopbar({ title, subtitle, children }: DashboardTopbarProps) {
  return (
    <div className="h-[64px] bg-surface border-b border-sep flex items-center px-s24 gap-s16 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-[18px] font-bold text-label leading-none">{title}</h1>
        {subtitle && <p className="text-[12px] text-label3 mt-[3px]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
