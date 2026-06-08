import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface SettingsEmptyStateProps {
  /** Phosphor icon element. Pass icon with size and weight already set. */
  icon: ReactNode;
  title: string;
  description?: string;
  /** Primary action button — pass a full <button> element */
  action?: ReactNode;
  className?: string;
}

export function SettingsEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: SettingsEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-s16 py-s48 text-center',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-r20 bg-bg-control text-tx-secondary">
        {icon}
      </div>

      <div className="flex flex-col gap-s4">
        <p className="text-ts-sub font-semibold text-tx-primary">{title}</p>
        {description && <p className="max-w-xs text-ts-fn text-tx-secondary">{description}</p>}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
