export const salonHeroStyles = {
  root: "bg-bg-page",

  // Cover — always shown (image when available, subtle placeholder otherwise)
  cover: "relative h-[240px] overflow-hidden bg-[#E5E5EA]",
  coverImg: "w-full h-full object-cover object-center",
  coverOverlay: "",

  // Identity block — relative + z-10 so logo renders above cover
  // Generous bottom padding — breathes into the date section below
  identity: "relative z-10 px-s20 pb-s16",

  // Logo + actions row — logo overlaps cover, actions pinned to the right
  logoRow: "flex items-end justify-between -mt-s40 mb-s12",

  // Logo: large iOS app-icon square
  logoImg:
    "h-[80px] w-[80px] rounded-r20 border-[3px] border-bg-page object-cover shadow-button",
  logoFallback:
    "h-[80px] w-[80px] rounded-r20 border-[3px] border-bg-page bg-label shadow-button flex items-center justify-center",
  logoInitials: "text-ts-t2 font-bold text-surface tracking-tight",

  // Skeleton
  skeletonLogo:
    "h-[80px] w-[80px] rounded-r20 bg-sep animate-pulse border-[3px] border-bg-page",
  skeletonName: "h-[22px] w-[160px] rounded-r8 bg-sep animate-pulse",
  skeletonTagline: "h-[13px] w-[220px] rounded-r8 bg-sep animate-pulse mt-s8",

  // Action buttons — on the RIGHT of logo row, aligned to bottom
  actions: "flex items-center gap-s8 self-end translate-y-[8px]",

  // Share icon button — small round
  shareBtn:
    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-sep bg-surface text-label3 shadow-sm transition-all active:scale-95",

  // Cek Booking — prominent black pill, 14px font
  checkBtn:
    "flex h-9 items-center gap-[5px] rounded-rF bg-label px-s16 text-t14 font-semibold text-surface shadow-button transition-all active:scale-95",
  checkBtnIcon: "flex-shrink-0 opacity-80",

  // Text — below logo row
  name: "text-ts-t2 font-bold text-label leading-tight tracking-tight",
  tagline: "text-t14 text-label2 mt-s4 leading-snug",

  // Contact rows — email + WA, below tagline
  contactList: "flex flex-col gap-s4 mt-s8",
  contactRow: "flex items-center gap-[6px]",
  contactIcon: "text-label3 flex-shrink-0",
  contactText: "text-ts-fn text-label3",

  // Divider — dashed subtle, spacing-8 top margin
  divider: "mt-s8 border-t border-dashed border-sep",
} as const;
