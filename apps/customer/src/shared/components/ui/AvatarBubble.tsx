"use client";

import { avatarColor, getInitials } from "@/shared/lib/avatar";
import { cn } from "@/shared/lib/cn";

export interface AvatarBubbleProps {
  name: string;
  /** sm=32px · md=40px · lg=48px (matches Owner staff/customer table rows) */
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Initials avatar — mirrors Owner app AvatarBubble.
 * Only legitimate usage of style={{ background }} — runtime-computed palette value.
 */
export function AvatarBubble({
  name,
  size = "md",
  className,
}: AvatarBubbleProps) {
  const { bg } = avatarColor(name);
  const initials = getInitials(name);
  const isTwoChar = initials.length > 1;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-r10 font-semibold text-tx-primary",
        size === "lg" ? "h-12 w-12" : size === "md" ? "h-10 w-10" : "h-8 w-8",
        isTwoChar
          ? size === "lg"
            ? "text-ts-fn"
            : size === "md"
              ? "text-ts-fn"
              : "text-ts-cap1"
          : size === "lg"
            ? "text-ts-body"
            : size === "md"
              ? "text-ts-body"
              : "text-ts-fn",
        className,
      )}
      style={{ background: bg }}
    >
      {initials}
    </div>
  );
}
