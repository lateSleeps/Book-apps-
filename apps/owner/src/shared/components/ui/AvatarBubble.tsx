'use client';

import { avatarColor, getInitials } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/cn';

export interface AvatarBubbleProps {
  name: string;
  size?: 'sm' | 'md';
}

/**
 * Initials avatar using avatarColor() + getInitials() from shared/lib/avatar.
 * Only legitimate usage of style={{ background }} — runtime-computed palette value.
 */
export function AvatarBubble({ name, size = 'md' }: AvatarBubbleProps) {
  const { bg } = avatarColor(name);
  const initials = getInitials(name);
  const isTwoChar = initials.length > 1;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-r10 font-semibold text-tx-primary',
        size === 'md' ? 'h-10 w-10' : 'h-8 w-8',
        isTwoChar
          ? size === 'md'
            ? 'text-ts-fn'
            : 'text-ts-cap1'
          : size === 'md'
            ? 'text-ts-body'
            : 'text-ts-fn'
      )}
      style={{ background: bg }}
    >
      {initials}
    </div>
  );
}
