'use client';

import type { ReactNode } from 'react';

// ── Primary Button ────────────────────────────────────────────────────────────

export type DialogPrimaryVariant = 'neutral' | 'danger' | 'success';

interface DialogPrimaryButtonProps {
  variant: DialogPrimaryVariant;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const PRIMARY_BG: Record<DialogPrimaryVariant, string> = {
  neutral: '#1C1C1E',
  danger: '#ef4444',
  success: '#16a34a',
};

const PRIMARY_BG_HOVER: Record<DialogPrimaryVariant, string> = {
  neutral: '#333333',
  danger: '#dc2626',
  success: '#15803d',
};

export function DialogPrimaryButton({
  variant,
  onClick,
  disabled = false,
  isLoading = false,
  fullWidth = false,
  children,
}: DialogPrimaryButtonProps) {
  const bg = disabled || isLoading ? '#F2F2F7' : PRIMARY_BG[variant];
  const textColor = disabled || isLoading ? '#C7C7CC' : '#ffffff';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        flex: fullWidth ? undefined : 1,
        width: fullWidth ? '100%' : undefined,
        height: 44,
        borderRadius: 10,
        border: 'none',
        background: bg,
        color: textColor,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'background 0.15s, opacity 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          (e.currentTarget as HTMLButtonElement).style.background = PRIMARY_BG_HOVER[variant];
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          (e.currentTarget as HTMLButtonElement).style.background = PRIMARY_BG[variant];
        }
      }}
    >
      {isLoading && (
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.4)',
            borderTopColor: '#fff',
            animation: 'spin 0.7s linear infinite',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </button>
  );
}

// ── Secondary Button ──────────────────────────────────────────────────────────

interface DialogSecondaryButtonProps {
  onClick: () => void;
  children: ReactNode;
  fullWidth?: boolean;
}

export function DialogSecondaryButton({
  onClick,
  children,
  fullWidth = false,
}: DialogSecondaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: fullWidth ? '100%' : 100,
        flexShrink: 0,
        height: 44,
        borderRadius: 10,
        border: '1px solid #E5E5EA',
        background: '#F2F2F7',
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'inherit',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = '#E5E5EA';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = '#F2F2F7';
      }}
    >
      {children}
    </button>
  );
}

// ── WA Link Button ────────────────────────────────────────────────────────────

interface DialogWAButtonProps {
  href: string;
  onClick?: () => void;
  children: ReactNode;
  fullWidth?: boolean;
}

export function DialogWAButton({
  href,
  onClick,
  children,
  fullWidth = false,
}: DialogWAButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      style={{
        width: fullWidth ? '100%' : undefined,
        flex: fullWidth ? undefined : 1,
        height: 44,
        borderRadius: 10,
        border: 'none',
        background: '#25d366',
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        textDecoration: 'none',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
      }}
    >
      {children}
    </a>
  );
}
