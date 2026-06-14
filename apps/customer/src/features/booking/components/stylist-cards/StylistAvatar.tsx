"use client";

import { avatarColor, getInitials } from "@/shared/lib/avatar";

interface StylistAvatarProps {
  name: string;
  grayscale?: boolean;
}

/**
 * Pixel-exact match of Owner app StaffDirectorySection avatar.
 * Uses inline styles for size/radius/typography so values are
 * never dependent on Tailwind token availability.
 *
 * Owner reference: apps/owner/src/features/dashboard/components/
 *   settings/components/team/sections/StaffDirectorySection.tsx:197
 */
export function StylistAvatar({ name, grayscale = false }: StylistAvatarProps) {
  const { bg } = avatarColor(name);
  const initials = getInitials(name);
  const isTwoChar = initials.length > 1;

  return (
    <div
      aria-hidden="true"
      style={{
        width: 48,
        height: 48,
        minWidth: 48,
        borderRadius: 10,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: isTwoChar ? 13 : 16,
        fontWeight: 600,
        color: "#1C1C1E",
        filter: grayscale ? "grayscale(1)" : undefined,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}
