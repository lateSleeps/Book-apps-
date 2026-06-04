/**
 * @responsibility
 * Fullscreen camera overlay for scanning booking barcodes/QR codes.
 * Shown only on mobile when barcode scanner is active.
 *
 * @usedBy
 * app/dashboard/overview/page.tsx
 *
 * @notes
 * - Presentation only — no local state.
 * - videoRef and canvasRef are managed by use-walk-in-flow.
 * - Corner indicator SVG creates a scanning frame visual.
 */

'use client';

interface BarcodeScannerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onClose: () => void;
}

export function BarcodeScanner({ videoRef, canvasRef, onClose }: BarcodeScannerProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 md:hidden">
      <div className="relative mx-4 w-full max-w-md">
        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="aspect-video w-full rounded-r16 bg-black object-cover"
        />

        {/* Hidden canvas for frame analysis */}
        <canvas ref={canvasRef} width={1280} height={720} className="hidden" />

        {/* Scanning overlay */}
        <div className="absolute inset-0 rounded-r16">
          {/* Scanning frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-64 rounded-r8 border-2 border-ac-primary" />
          </div>
          {/* Corner indicators */}
          <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-ac-primary" />
          <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-ac-primary" />
          <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-ac-primary" />
          <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-ac-primary" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Hint text */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <div className="rounded-rF bg-black/70 px-4 py-2 text-ts-fn font-medium text-white">
            📸 Arahkan ke barcode/QR code
          </div>
        </div>
      </div>
    </div>
  );
}
