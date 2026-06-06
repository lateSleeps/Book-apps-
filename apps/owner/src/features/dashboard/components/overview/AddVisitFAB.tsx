'use client';

interface AddVisitFABProps {
  addDropdownOpen: boolean;
  setAddDropdownOpen: (open: boolean) => void;
  isMobile: boolean;
  onOpenWalkIn: () => void;
  onOpenBooking: () => void;
}

export function AddVisitFAB({
  addDropdownOpen,
  setAddDropdownOpen,
  isMobile,
  onOpenWalkIn,
  onOpenBooking,
}: AddVisitFABProps) {
  return (
    <div className="fixed bottom-6 right-4 z-40 sm:hidden">
      <button
        onClick={() => setAddDropdownOpen(!addDropdownOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-rF bg-tx-body text-white shadow-lg transition-all hover:bg-[#333] active:scale-95"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {addDropdownOpen && isMobile && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setAddDropdownOpen(false)} />
          <div className="absolute bottom-20 right-0 z-40 w-[13rem] overflow-hidden rounded-r12 border border-[#efefed] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <button
              onClick={onOpenWalkIn}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8f8f6]"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-r8 bg-[#f0f0ee]">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#555"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="5" r="2.5" />
                  <path d="M3 14c0-3 2-5 5-5s5 2 5 5" />
                </svg>
              </div>
              <div>
                <p className="text-[0.875rem] font-medium text-tx-body">Walk-in</p>
                <p className="text-[0.75rem] text-gray-500">Datang langsung</p>
              </div>
            </button>
            <div className="mx-4 h-px bg-[#f5f5f3]" />
            <button
              onClick={onOpenBooking}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8f8f6]"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-r8 bg-[#f0f0ee]">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#555"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="12" height="10" rx="1.5" />
                  <path d="M5 7h6M5 10h4" />
                </svg>
              </div>
              <div>
                <p className="text-[0.875rem] font-medium text-tx-body">Booking Online</p>
                <p className="text-[0.75rem] text-gray-500">Sudah punya kode booking</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
