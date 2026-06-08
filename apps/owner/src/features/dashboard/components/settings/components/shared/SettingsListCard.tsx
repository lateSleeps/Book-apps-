import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// ── Badge ─────────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-bg-control text-tx-subtle',
  success: 'bg-st-in-progress-bg text-st-in-progress',
  warning: 'bg-st-upcoming-bg text-st-upcoming',
  danger: 'bg-st-cancelled-bg text-st-cancelled',
  info: 'bg-st-confirmed-bg text-st-confirmed',
};

interface BadgeConfig {
  label: string;
  variant?: BadgeVariant;
}

// ── SettingsListCard ──────────────────────────────────────────────────────────

interface SettingsListCardProps {
  title: string;
  description?: string;
  /** URL or data-url for image thumbnail */
  imageUrl?: string;
  /** Fallback shown when no imageUrl — emoji or initials */
  imageFallback?: string;
  badges?: BadgeConfig[];
  /** Action buttons / icon buttons rendered on the right */
  actions?: ReactNode;
  /** Additional row classes */
  className?: string;
  /** Full row is clickable */
  onClick?: () => void;
}

export function SettingsListCard({
  title,
  description,
  imageUrl,
  imageFallback,
  badges,
  actions,
  className,
  onClick,
}: SettingsListCardProps) {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
      className={cn(
        'flex items-center gap-s12 rounded-r12 border border-bd-card bg-bg-card px-s16 py-s12 shadow-card',
        isClickable && 'cursor-pointer transition-colors hover:bg-bg-hover',
        className
      )}
    >
      {/* Thumbnail */}
      {(imageUrl || imageFallback) && (
        <div className="shrink-0">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={title} className="h-10 w-10 rounded-r10 object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-r10 bg-bg-control text-ts-body">
              {imageFallback}
            </div>
          )}
        </div>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-ts-fn font-medium text-tx-primary">{title}</p>
        {description && (
          <p className="mt-s4 truncate text-ts-cap1 text-tx-secondary">{description}</p>
        )}
        {badges && badges.length > 0 && (
          <div className="mt-s4 flex flex-wrap gap-s4">
            {badges.map((b) => (
              <span
                key={b.label}
                className={cn(
                  'inline-flex items-center rounded-rF px-s8 py-0.5 text-ts-cap2 font-medium',
                  BADGE_STYLES[b.variant ?? 'default']
                )}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  );
}
