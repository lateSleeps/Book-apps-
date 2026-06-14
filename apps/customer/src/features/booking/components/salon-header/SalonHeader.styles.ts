export const salonHeaderStyles = {
  root: "px-s20 pt-s20 pb-s16 bg-surface border-b border-sep flex-shrink-0",
  inner: "flex items-start justify-between gap-s12",
  content: "flex-1 min-w-0",
  eyebrow:
    "text-ts-cap2 font-medium uppercase tracking-[0.12em] text-label3 mb-s4",
  name: "text-ts-t1 font-bold text-label leading-[1.05] tracking-tight",
  subtitle: "text-ts-fn text-label3 mt-s8 leading-snug",
  actions: "flex items-center gap-s8 flex-shrink-0 mt-s4",
  checkBtn:
    "flex h-8 items-center gap-[5px] rounded-rF border border-sep bg-bg px-s12 text-ts-cap2 font-medium text-label2 transition-all hover:bg-sep active:scale-95",
  shareBtn:
    "flex h-8 w-8 items-center justify-center rounded-rF border border-sep bg-bg text-label3 transition-all hover:bg-sep active:scale-95",
} as const;
