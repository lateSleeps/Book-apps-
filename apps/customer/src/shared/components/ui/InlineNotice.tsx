"use client";

/**
 * InlineNotice — design-system informational banner
 *
 * Visual source of truth: "Harga Estimasi" notice in StepServices.tsx
 *
 * Variants:
 *   info    — soft blue (iOS system blue tint)
 *   success — soft green (accent tint)
 *   warning — soft yellow (c-yellow tint)
 *
 * Usage:
 *   <InlineNotice variant="info" title="Harga Estimasi" description="..." onDismiss={() => …} />
 */

import {
  Info,
  CheckCircle,
  Warning,
  X,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "info" | "success" | "warning";

interface VariantConfig {
  containerBg: string;
  iconWrapStyle: React.CSSProperties;
  iconColorClass: string;
  Icon: PhosphorIcon;
}

// Blue uses inline style because there is no iOS-blue design token.
// All spacing, radius, and typography use design tokens.
const VARIANTS: Record<Variant, VariantConfig> = {
  info: {
    containerBg: "", // inline style below
    iconWrapStyle: { background: "rgba(0,122,255,0.10)" },
    iconColorClass: "text-[#007AFF]",
    Icon: Info,
  },
  success: {
    containerBg: "bg-c-mint",
    iconWrapStyle: {},
    iconColorClass: "text-accent",
    Icon: CheckCircle,
  },
  warning: {
    containerBg: "bg-c-yellow",
    iconWrapStyle: {},
    iconColorClass: "text-label2",
    Icon: Warning,
  },
};

interface InlineNoticeProps {
  variant?: Variant;
  title: string;
  description?: string;
  onDismiss?: () => void;
  className?: string;
}

export function InlineNotice({
  variant = "info",
  title,
  description,
  onDismiss,
  className,
}: InlineNoticeProps) {
  const { containerBg, iconWrapStyle, iconColorClass, Icon } =
    VARIANTS[variant];

  return (
    <div
      className={cn(
        "flex items-center gap-s12 px-s16 py-s12 rounded-r16",
        containerBg,
        className,
      )}
      style={
        variant === "info" ? { background: "rgba(0,122,255,0.06)" } : undefined
      }
    >
      {/* Icon container */}
      <div
        className={cn(
          "flex h-s32 w-s32 flex-shrink-0 items-center justify-center rounded-full",
          variant !== "info" && "bg-bg-control",
        )}
        style={iconWrapStyle}
      >
        <Icon size={18} weight="duotone" className={iconColorClass} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-t14 font-semibold text-label leading-tight">
          {title}
        </p>
        {description && (
          <p className="text-ts-cap1 text-label2 leading-snug mt-[1px]">
            {description}
          </p>
        )}
      </div>

      {/* Optional dismiss */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Tutup"
          className="flex-shrink-0 flex h-s32 w-s32 items-center justify-center rounded-full text-label3 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={16} weight="duotone" />
        </button>
      )}
    </div>
  );
}
