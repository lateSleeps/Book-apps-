'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BottomCTA } from '@/features/booking/components/bottom-cta';
import { DigitalTicket } from '@/features/booking/components/digital-ticket';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { ErrorAlert } from '@/features/booking/components/error-alert';
import { LoadingState } from '@/features/booking/components/loading-state';

interface PageProps {
  params: { slug: string };
}

export default function TicketPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { bookingStatus, reset, bookingCode, pin, date, timeSlot } = useBookingStore();
  const [showFarewell, setShowFarewell] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Display values for canvas
  const displayCode = bookingCode || 'RB-0522-7228';
  const displayPin = pin || '7228';
  const displayDate = date || '2026-05-23';
  const displayTimeSlot = timeSlot || '12:00';
  const formattedDate = displayDate ? new Date(displayDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-';

  useEffect(() => {
    // Allow testing - commented out for dev
    // if (bookingStatus !== 'CONFIRMED') {
    //   router.replace(`/book/${slug}`);
    // }
  }, [bookingStatus, slug, router]);

  async function downloadTicket() {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      console.log('📸 Starting canvas-based ticket generation...');

      // Validate browser support
      if (typeof document === 'undefined') {
        throw new Error('Browser tidak mendukung unduhan file');
      }

      // Create canvas directly
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas tidak dapat diinisialisasi');
      }

      // Set canvas size
      const width = 400 * 2;
      const height = 600 * 2;
      canvas.width = width;
      canvas.height = height;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Helper function to draw text
      const drawText = (text: string, x: number, y: number, fontSize: number, fontWeight: string = 'normal', align: string = 'left') => {
        ctx.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = align as CanvasTextAlign;
        ctx.fillText(text, x, y);
      };

      let yPos = 60;

      // Title
      drawText('🎉', width / 2, yPos, 80, 'normal', 'center');
      yPos += 100;

      drawText('Terima kasih!', width / 2, yPos, 40, 'bold', 'center');
      yPos += 50;

      // QR section title
      ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.fillStyle = '#999999';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code', width / 2, yPos);
      yPos += 60;

      // Draw QR code placeholder
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      const qrSize = 120;
      ctx.strokeRect((width - qrSize) / 2, yPos, qrSize, qrSize);
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect((width - qrSize) / 2, yPos, qrSize, qrSize);
      yPos += qrSize + 40;

      // PIN label
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.fillStyle = '#999999';
      ctx.textAlign = 'center';
      ctx.fillText('atau PIN', width / 2, yPos);
      yPos += 40;

      // PIN code - large
      drawText(displayPin, width / 2, yPos, 56, 'bold', 'center');
      yPos += 80;

      // Divider
      ctx.strokeStyle = '#eeeeee';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, yPos);
      ctx.lineTo(width - 40, yPos);
      ctx.stroke();
      yPos += 40;

      // Booking info
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.fillStyle = '#999999';
      ctx.textAlign = 'left';
      ctx.fillText('BOOKING ID', 40, yPos);
      yPos += 28;

      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.fillStyle = '#000000';
      ctx.fillText(displayCode, 40, yPos);
      yPos += 50;

      // Date & Time
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.fillStyle = '#999999';
      ctx.fillText('TANGGAL & WAKTU', 40, yPos);
      yPos += 28;

      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.fillStyle = '#000000';
      ctx.fillText(`${formattedDate} · ${displayTimeSlot}`, 40, yPos);

      console.log('✅ Canvas rendered successfully');

      // Download with error handling
      return new Promise<boolean>((resolve) => {
        canvas.toBlob((blob) => {
          try {
            if (!blob) {
              throw new Error('Gagal membuat file. Coba lagi.');
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket-${bookingCode || 'booking'}.png`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(url), 100);

            console.log('📥 Download initiated:', link.download);
            setIsDownloading(false);
            resolve(true);
          } catch (err) {
            const error = err instanceof Error ? err.message : 'Gagal mengunduh tiket';
            setDownloadError(error);
            setIsDownloading(false);
            resolve(false);
          }
        }, 'image/png');
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal membuat tiket. Coba lagi.';
      console.error('❌ Download failed:', error);
      setDownloadError(message);
      setIsDownloading(false);
      return false;
    }
  }

  async function handleDone() {
    try {
      // Try to download
      const success = await downloadTicket();

      // Only show farewell after successful download
      if (success) {
        setTimeout(() => {
          setShowFarewell(true);
        }, 1000);
      }
      // If failed, error is already displayed in downloadError state
    } catch (error) {
      console.error('Error in handleDone:', error);
      // Error is handled in downloadTicket() and set to downloadError state
    }
  }

  function handleFarewellClose() {
    reset();
    router.push('/');
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-ticket">
      {downloadError && (
        <ErrorAlert
          message={downloadError}
          onDismiss={() => setDownloadError(null)}
          actionLabel="Coba Lagi"
          onAction={async () => {
            setDownloadError(null);
            await downloadTicket();
          }}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="px-s20 pt-s32 pb-s32" ref={ticketRef}>
          <DigitalTicket />
        </div>
      </div>

      <BottomCTA
        label={isDownloading ? 'Mengunduh...' : 'Selesai'}
        variant={isDownloading ? 'default' : 'ready'}
        disabled={isDownloading}
        onClick={handleDone}
      />

      {/* Farewell popup */}
      {showFarewell && (
        <>
          <div
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[3px] animate-fadeIn"
            onClick={handleFarewellClose}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[32px] bg-white px-s24 pt-s32 pb-[max(env(safe-area-inset-bottom),32px)] animate-sheetUp overflow-hidden relative">

            {/* Decorative doodles - top left */}
            <svg className="absolute top-0 left-0 w-[160px] h-[170px]" viewBox="0 0 130 140" style={{pointerEvents: 'none'}}>
              {/* Yellow flower-like circles */}
              <circle cx="20" cy="25" r="6" fill="#FBBF24" opacity="0.7" />
              <circle cx="30" cy="20" r="5" fill="#FBBF24" opacity="0.6" />
              <circle cx="25" cy="35" r="5" fill="#FBBF24" opacity="0.6" />
              <circle cx="35" cy="30" r="4" fill="#FBBF24" opacity="0.5" />

              {/* Pink/red wavy line */}
              <path d="M 50 50 Q 60 45 70 50 T 90 50" stroke="#EC4899" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />

              {/* Green circles cluster */}
              <circle cx="15" cy="80" r="5" fill="#4ADE80" opacity="0.6" />
              <circle cx="25" cy="85" r="4" fill="#4ADE80" opacity="0.5" />
              <circle cx="20" cy="95" r="4.5" fill="#4ADE80" opacity="0.5" />
              <circle cx="35" cy="90" r="3.5" fill="#4ADE80" opacity="0.4" />

              {/* Purple dot */}
              <circle cx="70" cy="110" r="3" fill="#A78BFA" opacity="0.6" />
            </svg>

            {/* Decorative doodles - top right */}
            <svg className="absolute top-0 right-0 w-[130px] h-[130px]" viewBox="0 0 100 100" style={{pointerEvents: 'none'}}>
              {/* Orange circles */}
              <circle cx="80" cy="15" r="7" fill="#FB923C" opacity="0.6" />
              <circle cx="60" cy="20" r="5" fill="#FB923C" opacity="0.5" />

              {/* Blue dots */}
              <circle cx="85" cy="50" r="4" fill="#60A5FA" opacity="0.5" />
              <circle cx="70" cy="55" r="3" fill="#60A5FA" opacity="0.4" />
            </svg>

            {/* Decorative doodles - bottom right */}
            <svg className="absolute bottom-0 right-0 w-[120px] h-[130px]" viewBox="0 0 120 130" style={{pointerEvents: 'none'}}>
              {/* Blue wavy lines */}
              <path d="M 20 40 Q 30 30 40 40 T 60 40 T 80 40 T 100 40" stroke="#60A5FA" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
              <path d="M 20 70 Q 30 60 40 70 T 60 70 T 80 70 T 100 70" stroke="#60A5FA" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.3" />

              {/* Orange accent circles */}
              <circle cx="15" cy="100" r="8" fill="#FB923C" opacity="0.5" />
              <circle cx="90" cy="110" r="6" fill="#FB923C" opacity="0.4" />
              <circle cx="55" cy="120" r="5" fill="#FB923C" opacity="0.4" />
            </svg>

            {/* Decorative doodles - bottom left */}
            <svg className="absolute bottom-0 left-0 w-[100px] h-[110px]" viewBox="0 0 100 110" style={{pointerEvents: 'none'}}>
              {/* Pink circles */}
              <circle cx="20" cy="20" r="5" fill="#F472B6" opacity="0.5" />

              {/* Green wavy line */}
              <path d="M 30 50 Q 40 45 50 50 T 70 50" stroke="#4ADE80" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />

              {/* Yellow dots */}
              <circle cx="15" cy="80" r="3.5" fill="#FBBF24" opacity="0.5" />
              <circle cx="70" cy="90" r="4" fill="#FBBF24" opacity="0.4" />
            </svg>

            {/* Header */}
            <div className="text-center mb-[24px] relative z-10">

              <div className="text-[72px] mb-[16px]">
                🙏🏼
              </div>
              <h2 className="text-[32px] font-bold text-gray-900 leading-tight mb-[16px]">
                Terima kasih atas reservasinya.
              </h2>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                Kedatangan tepat waktu sangat kami apresiasi, keterlambatan 15 menit masih bisa ditoleransi. Perubahan jadwal maksimal H-1 dan 2 kali. Pembatalan sepihak membuat DP tidak dapat di-refund.
              </p>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleFarewellClose}
              className="mt-[28px] w-full rounded-[12px] bg-gray-900 text-white py-[14px] px-[16px] text-[16px] font-semibold transition-all active:scale-[0.98] shadow-lg hover:bg-gray-800 relative z-10"
            >
              Tutup
            </button>

          </div>
        </>
      )}
    </div>
  );
}
