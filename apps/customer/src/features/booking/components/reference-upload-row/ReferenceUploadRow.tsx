"use client";

import { cn } from "@/shared/lib/cn";

export type ReferenceUploadRowProps = {
  onClick: () => void;
};

export function ReferenceUploadRow({ onClick }: ReferenceUploadRowProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-[12px]",
        "rounded-r16 border border-bd-card bg-bg-card",
        "px-[14px] py-[10px]",
        "transition-all active:scale-[0.99]",
      )}
    >
      <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-bg-control">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-tx-muted"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      <div className="flex-1 text-left">
        <p className="text-[13px] font-medium text-tx-primary leading-tight">
          Tambah foto referensi
        </p>
        <p className="text-[11px] text-tx-muted mt-[1px]">
          JPG atau PNG · Maks 5 MB
        </p>
      </div>
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0 text-tx-muted opacity-40"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
