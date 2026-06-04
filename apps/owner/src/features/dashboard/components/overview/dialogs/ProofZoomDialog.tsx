/**
 * @responsibility
 * Fullscreen image zoom dialog for viewing payment proof photos.
 * Handles both DP proof and settlement (pelunasan) proof.
 *
 * @usedBy
 * app/dashboard/overview/page.tsx (via controller)
 *
 * @notes
 * - Presentation only — no local state.
 * - url comes from booking.paymentProofUrl (DP) or settlementProofUrl.
 */

'use client';

interface ProofZoomDialogProps {
  url: string;
  label: string;
  onClose: () => void;
}

export function ProofZoomDialog({ url, label, onClose }: ProofZoomDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-full max-w-2xl flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-ts-fn font-semibold text-white">{label}</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
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

        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={label} className="max-h-[80vh] w-full rounded-r16 object-contain" />
      </div>
    </div>
  );
}
