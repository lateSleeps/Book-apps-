"use client";

interface BottomCTAProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export function BottomCTA({ label, disabled, onClick }: BottomCTAProps) {
  return (
    <div className="flex-none w-full border-t border-sep bg-white/95 backdrop-blur-sm px-s16 pb-[max(env(safe-area-inset-bottom),24px)] pt-s16">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex w-full items-center justify-center min-h-[50px] px-6 text-t16 font-semibold rounded-rF transition-all duration-150 ${
          disabled
            ? "bg-sep text-label3 cursor-not-allowed"
            : "bg-label text-white shadow-button hover:bg-label/90 active:scale-[0.98] active:shadow-none"
        }`}
      >
        {label}
      </button>
    </div>
  );
}
