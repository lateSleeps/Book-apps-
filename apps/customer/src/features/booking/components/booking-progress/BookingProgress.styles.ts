export const bookingProgressStyles = {
  root: "bg-surface border-b border-sep flex-shrink-0",
  inner: "flex items-center justify-between px-s20 pt-s12 pb-s8",
  label: "text-ts-cap2 font-medium text-label3 transition-all duration-200",
  labelDone: "text-accent",
  labelActive: "text-label font-semibold",
  track: "h-px bg-sep",
  trackFill: "h-full bg-label transition-all duration-500 ease-out",
} as const;
