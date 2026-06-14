export const serviceCardStyles = {
  // Independent product card
  card: [
    "w-full rounded-[14px] px-[18px] pt-[16px] pb-[16px] text-left",
    "transition-all duration-200 active:scale-[0.985]",
  ].join(" "),

  cardDefault: [
    "bg-white border border-[#E5E5EA]",
    "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
  ].join(" "),

  cardSelected: [
    "bg-accent/[0.03] border border-accent/60",
    "shadow-[0_2px_10px_rgba(0,0,0,0.07)]",
  ].join(" "),

  // Top row
  topRow: "flex items-start justify-between gap-[12px]",
  name: "text-[17px] font-semibold text-tx-primary leading-snug flex-1",
  checkBadge: "flex-shrink-0 mt-[1px] transition-opacity duration-200",

  // Description
  description: "mt-[4px] text-[13px] text-tx-secondary leading-snug",

  // Bottom row
  bottomRow: "mt-[12px] flex items-center justify-between",
  duration: "text-[12px] font-medium text-tx-tertiary",
  priceWrapper: "flex items-baseline gap-[3px]",
  priceNote: "text-[11px] font-normal text-tx-tertiary",
  price: "text-[17px] font-semibold text-tx-primary leading-none",
} as const;
