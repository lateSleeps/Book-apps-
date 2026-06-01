"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type BookingResult = {
  id: string;
  confirmationCode: string;
  status: string;
  bookingDate: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  paymentStatus: string;
  serviceName: string;
  stylistName: string;
  pin: string;
};

function TicketView({ booking }: { booking: BookingResult }) {
  const qrValue = `rara-beauty:${booking.confirmationCode}:${booking.pin}`;
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Rara Beauty Jakarta
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {formatDate(booking.bookingDate)}
        </p>
      </div>
      <div className="border-t border-dashed border-gray-300 mx-6" />
      <div className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
              Layanan
            </p>
            <p className="text-sm font-bold text-gray-900">
              {booking.serviceName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
              Stylist
            </p>
            <p className="text-sm font-bold text-gray-900">
              {booking.stylistName}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
              Tanggal
            </p>
            <p className="text-sm font-bold text-gray-900">
              {formatDate(booking.bookingDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
              Waktu
            </p>
            <p className="text-sm font-bold text-gray-900">
              {booking.startTime}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-dashed border-gray-300 mx-6" />
      <div className="px-6 py-6 flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <QRCodeSVG
            value={qrValue}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={false}
          />
        </div>
        <p className="text-xs text-gray-500 text-center">
          Tunjukkan QR code ini saat check-in
        </p>
      </div>
    </div>
  );
}

function CancelledView({ booking }: { booking: BookingResult }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-6 text-center">
      <span className="text-5xl">😔</span>
      <div>
        <p className="font-bold text-lg text-[#ef4444]">Booking Ditolak</p>
        <p className="text-[13px] text-[#b91c1c] mt-1 leading-snug">
          Maaf, stylist {booking.stylistName} sudah memiliki booking lain pada
          jam tersebut.
        </p>
      </div>
      <div className="w-full rounded-xl bg-white border border-[#fecaca] p-4 text-left flex flex-col gap-2">
        {[
          { label: "Nama", value: booking.customerName },
          { label: "Layanan", value: booking.serviceName },
          { label: "Tanggal", value: formatDate(booking.bookingDate) },
          { label: "Waktu", value: booking.startTime },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-[13px]">
            <span className="text-gray-400">{label}</span>
            <span className="font-medium text-gray-700">{value}</span>
          </div>
        ))}
      </div>
      <a
        href="/book/rara-beauty-jakarta"
        className="w-full rounded-xl bg-[#ef4444] py-3 text-center text-[14px] font-semibold text-white transition-all hover:bg-[#dc2626] active:scale-[0.98]"
      >
        Booking Ulang →
      </a>
    </div>
  );
}

function PendingView({ booking }: { booking: BookingResult }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-6 text-center">
      <span className="text-5xl">⏳</span>
      <div>
        <p className="font-bold text-lg text-[#d97706]">Menunggu Konfirmasi</p>
        <p className="text-[13px] text-[#92400e] mt-1 leading-snug">
          Booking kamu sedang ditinjau salon. Akan dikonfirmasi dalam maksimal 1
          jam.
        </p>
      </div>
      <div className="w-full rounded-xl bg-white border border-[#fde68a] p-4 text-left flex flex-col gap-2">
        {[
          { label: "Nama", value: booking.customerName },
          { label: "Layanan", value: booking.serviceName },
          { label: "Stylist", value: booking.stylistName },
          { label: "Tanggal", value: formatDate(booking.bookingDate) },
          { label: "Waktu", value: booking.startTime },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-[13px]">
            <span className="text-gray-400">{label}</span>
            <span className="font-medium text-gray-700">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CheckBookingPage() {
  const [phone, setPhone] = useState("");
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const utils = trpc.useUtils();

  async function handleCheck() {
    if (loading) return;
    setLoading(true);
    setSearched(false);
    setResult(null);
    try {
      const data = await utils.bookings.getByCode.fetch({
        customerPhone: phone.trim(),
      });
      setResult(data as BookingResult | null);
    } catch (e) {
      setResult(null);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  async function handleDownloadTicket() {
    if (!result || isDownloading) return;
    setIsDownloading(true);
    try {
      const QRCodeLib = await import("qrcode");
      const width = 800;
      const height = 1000;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas error");

      ctx.fillStyle = "#f5f3f0";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(40, 60, width - 80, height - 120);

      let y = 140;
      ctx.font = "bold 36px sans-serif";
      ctx.fillStyle = "#111110";
      ctx.textAlign = "left";
      ctx.fillText("Rara Beauty Jakarta", 80, y);
      y += 50;

      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#999999";
      ctx.fillText(formatDate(result.bookingDate), 80, y);
      y += 60;

      ctx.strokeStyle = "#e5e5e5";
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(width - 80, y);
      ctx.stroke();
      ctx.setLineDash([]);
      y += 50;

      const drawRow = (l1: string, v1: string, l2: string, v2: string) => {
        const col2 = width / 2 + 20;
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "#999999";
        ctx.textAlign = "left";
        ctx.fillText(l1.toUpperCase(), 80, y);
        ctx.fillText(l2.toUpperCase(), col2, y);
        ctx.font = "bold 18px sans-serif";
        ctx.fillStyle = "#111110";
        ctx.fillText(v1, 80, y + 28);
        ctx.fillText(v2, col2, y + 28);
        y += 70;
      };

      drawRow("Layanan", result.serviceName, "Stylist", result.stylistName);
      drawRow(
        "Tanggal",
        formatDate(result.bookingDate),
        "Waktu",
        result.startTime,
      );

      ctx.strokeStyle = "#e5e5e5";
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(width - 80, y);
      ctx.stroke();
      ctx.setLineDash([]);
      y += 50;

      const qrSize = 200;
      const qrCanvas = await QRCodeLib.toCanvas(
        `rara-beauty:${result.confirmationCode}:${result.pin}`,
        { width: qrSize, margin: 0 },
      );
      ctx.drawImage(qrCanvas, (width - qrSize) / 2, y);
      y += qrSize + 30;

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#999999";
      ctx.textAlign = "center";
      ctx.fillText("Tunjukkan QR code ini saat check-in", width / 2, y);

      await new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve();
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `tiket-${result.confirmationCode}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 100);
          resolve();
        }, "image/png");
      });
      setShowFarewell(true);
    } catch (e) {
      alert("Gagal mengunduh tiket. Coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  }

  const isConfirmed =
    result && (result.status === "CONFIRMED" || result.status === "confirmed");
  const isCancelled =
    result && (result.status === "CANCELLED" || result.status === "cancelled");

  return (
    <div className="min-h-screen w-full flex items-start justify-center md:pt-10 md:px-4">
      <div
        className={[
          "relative w-full max-w-[480px] bg-bg",
          "flex flex-col",
          "h-screen md:h-[calc(100vh-40px)]",
          "md:rounded-t-[28px] md:overflow-hidden",
          "md:shadow-[0_12px_48px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.06)]",
          "md:ring-1 md:ring-black/[0.06]",
        ].join(" ")}
      >
        <div className="flex-none px-5 pt-8 pb-5 border-b border-sep bg-bg">
          <a
            href="/book/rara-beauty-jakarta"
            className="mb-4 flex h-[40px] w-[40px] items-center justify-center rounded-full border border-sep bg-surface text-label2 transition-all hover:bg-sep active:scale-95"
            aria-label="Kembali"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </a>
          <h1 className="text-[28px] font-bold text-label leading-tight">
            Cek booking kamu
          </h1>
          <p className="mt-[6px] text-[14px] text-label2">
            Masukkan nomor WhatsApp kamu.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto bg-bg">
          <div className="flex flex-col gap-5 px-5 pt-6 pb-8">
            <div className="flex flex-col gap-2">
              <p className="text-[14px] font-medium text-label2">
                Nomor WhatsApp
              </p>
              <div
                className={[
                  "rounded-2xl bg-surface border overflow-hidden transition-all",
                  phoneFocused
                    ? "border-label ring-2 ring-label/10"
                    : "border-sep",
                ].join(" ")}
              >
                <div className="flex items-center">
                  <div className="flex items-center px-4 py-[14px] border-r border-black/10">
                    <span className="text-[15px] font-medium text-label2 select-none">
                      +62
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    placeholder="812 3456 7890"
                    inputMode="numeric"
                    className="flex-1 px-4 py-[14px] text-[15px] text-label placeholder:text-label3 outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {searched && !result && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-sep bg-surface p-6 text-center">
                <span className="text-4xl">🔍</span>
                <div>
                  <p className="font-bold text-label">
                    Booking tidak ditemukan
                  </p>
                  <p className="text-[13px] text-label2 mt-1">
                    Pastikan nomor WhatsApp sudah benar.
                  </p>
                </div>
              </div>
            )}

            {result && isConfirmed && <TicketView booking={result} />}
            {result && isCancelled && <CancelledView booking={result} />}
            {result && !isConfirmed && !isCancelled && (
              <PendingView booking={result} />
            )}

            <p className="text-center text-[12px] text-label3">
              Belum booking?{" "}
              <a
                href="/book/rara-beauty-jakarta"
                className="font-semibold text-label underline"
              >
                Booking sekarang
              </a>
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 px-5 pb-8 pt-3 border-t border-sep bg-bg flex flex-col gap-3">
          {isConfirmed && (
            <button
              onClick={handleDownloadTicket}
              disabled={isDownloading}
              className="w-full rounded-[18px] bg-[#16a34a] py-[16px] text-[15px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {isDownloading ? "Menyimpan..." : "⬇ Simpan Tiket"}
            </button>
          )}
          <button
            onClick={handleCheck}
            disabled={loading}
            className="w-full rounded-[18px] bg-[#1a1a1a] py-[16px] text-[15px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? "Mengecek status..." : "Cek Status Booking →"}
          </button>
        </div>

        {showFarewell && (
          <>
            <div
              className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[3px]"
              onClick={() => setShowFarewell(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[32px] bg-white px-6 pt-8 pb-10">
              <div className="text-center mb-6">
                <div className="text-[72px] mb-4">🙏🏼</div>
                <h2 className="text-[28px] font-bold text-gray-900 leading-tight mb-3">
                  Tiket berhasil disimpan!
                </h2>
                <p className="text-gray-500 text-[14px] leading-relaxed">
                  Kedatangan tepat waktu sangat kami apresiasi. Sampai jumpa!
                </p>
              </div>
              <button
                onClick={() => setShowFarewell(false)}
                className="w-full rounded-[14px] bg-gray-900 text-white py-[14px] text-[16px] font-semibold transition-all active:scale-[0.98]"
              >
                Tutup
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
