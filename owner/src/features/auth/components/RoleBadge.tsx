'use client';

/**
 * Role Badge Component
 * Displays user role with color coding and styling
 */

import React from 'react';
import { getRoleDisplayName, getRoleColor, getRoleBackgroundColor } from '../utils/role-permissions';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'pill' | 'text';
  className?: string;
}

export function RoleBadge({
  role,
  size = 'md',
  variant = 'badge',
  className = '',
}: RoleBadgeProps) {
  const displayName = getRoleDisplayName(role);
  const color = getRoleColor(role);
  const bgColor = getRoleBackgroundColor(role);

  const sizeClasses = {
    sm: 'px-2 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-[12px]',
    lg: 'px-4 py-2 text-[13px]',
  };

  if (variant === 'text') {
    return (
      <span style={{ color }} className={`font-medium ${className}`}>
        {displayName}
      </span>
    );
  }

  if (variant === 'pill') {
    return (
      <span
        style={{ backgroundColor: bgColor, color, borderColor: color }}
        className={`inline-flex items-center rounded-full font-medium border ${sizeClasses[size]} ${className}`}
      >
        {displayName}
      </span>
    );
  }

  // Default badge variant
  return (
    <span
      style={{ backgroundColor: bgColor, color }}
      className={`inline-flex items-center rounded font-medium ${sizeClasses[size]} ${className}`}
    >
      {displayName}
    </span>
  );
}

/**
 * Role Badge with Icon
 * Displays role with a visual indicator
 */
interface RoleBadgeWithIconProps extends RoleBadgeProps {
  icon?: React.ReactNode;
}

export function RoleBadgeWithIcon({
  role,
  icon,
  size = 'md',
  className = '',
}: RoleBadgeWithIconProps) {
  const displayName = getRoleDisplayName(role);
  const color = getRoleColor(role);
  const bgColor = getRoleBackgroundColor(role);

  const roleIcons: Record<string, string> = {
    OWNER: '👑',
    MANAGER: '💼',
    STYLIST: '✨',
    STAFF: '🎨',
  };

  const roleIcon = icon || roleIcons[role] || '👤';

  const sizeClasses = {
    sm: 'gap-1.5',
    md: 'gap-2',
    lg: 'gap-2.5',
  };

  return (
    <span
      style={{ backgroundColor: bgColor, color }}
      className={`inline-flex items-center rounded px-3 py-1.5 text-[12px] font-medium ${sizeClasses[size]} ${className}`}
    >
      <span className="text-sm">{roleIcon}</span>
      {displayName}
    </span>
  );
}
