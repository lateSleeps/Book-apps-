'use client';

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  return (
    <div className="h-[56px] bg-surface border-b border-sep flex items-center px-s16 gap-s16 flex-shrink-0 md:hidden">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-white tracking-tight">RB</span>
        </div>
        <span className="text-[13px] font-semibold text-[#1a1a1a] tracking-tight">Rara Beauty</span>
      </div>

      {/* Hamburger Menu */}
      <button
        onClick={onMenuOpen}
        className="p-2 hover:bg-white/60 rounded-lg transition-all duration-150 ml-auto"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 5h16M2 10h16M2 15h16" />
        </svg>
      </button>
    </div>
  );
}
