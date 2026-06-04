/**
 * @responsibility
 * Mobile detail sheet: backdrop overlay + slide-in panel + sticky header.
 * Wraps MobileDetailContent and MobileDetailPayment.
 *
 * @usedBy
 * app/dashboard/overview/page.tsx
 *
 * @notes
 * - Owns the sheet container/backdrop — not the content.
 * - children = MobileDetailContent + MobileDetailPayment
 */

'use client';

interface MobileDetailSheetProps {
  customerName: string;
  serviceName: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileDetailSheet({
  customerName,
  serviceName,
  onClose,
  children,
}: MobileDetailSheetProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 transition-opacity" onClick={onClose} />

      {/* Slide-in panel */}
      <div className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-sm overflow-y-auto bg-white shadow-drawer transition-transform duration-300 md:hidden">
        <div className="flex h-full flex-col">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-bd-detail bg-white px-4 py-4">
            <div className="min-w-0">
              <p className="truncate text-ts-fn font-semibold text-tx-primary">{customerName}</p>
              <p className="truncate text-ts-cap1 text-tx-secondary">{serviceName}</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-r8 transition-colors hover:bg-bg-surface"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
}
