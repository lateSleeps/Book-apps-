"use client";

import { Minus, Plus } from "@phosphor-icons/react";
import { useState, useMemo, useCallback } from "react";
import { BottomCTA } from "@/features/booking/components/bottom-cta";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { useMockData } from "@/features/booking/hooks/use-mock-data";
import { cn } from "@/shared/lib/cn";
import { formatRupiah } from "@/shared/lib/format";

interface Props {
  onNext: () => void;
}

export function StepContact({ onNext }: Props) {
  const {
    customerName,
    customerPhone,
    setContact,
    addons,
    addAddon,
    removeAddon,
  } = useBookingStore();
  const { products } = useMockData();

  const [name, setName] = useState(customerName ?? "");
  const [phone, setPhone] = useState(customerPhone ?? "");
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [showAddons, setShowAddons] = useState(false);

  const canProceed = name.trim().length >= 2 && phone.trim().length >= 8;

  function handleContinue() {
    setContact(name.trim(), phone.trim(), "");
    setShowAddons(true);
  }

  const previewProducts = useMemo(() => products.slice(0, 10), [products]);

  const getQuantity = useCallback(
    (productId: string) =>
      addons.find((a) => a.id === productId)?.quantity ?? 0,
    [addons],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Banner — Owner app blue gradient, centered composition ── */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          height: "16%",
          background: "linear-gradient(145deg, #0071E3 0%, #3A9BFF 100%)",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 390 200"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Depth — large background circles, centered */}
          <circle cx="195" cy="100" r="140" fill="white" opacity="0.06" />
          <circle cx="195" cy="100" r="90" fill="white" opacity="0.06" />

          {/* Off-center depth blobs for dimension */}
          <circle cx="320" cy="40" r="80" fill="white" opacity="0.07" />
          <circle cx="70" cy="165" r="60" fill="white" opacity="0.05" />

          {/* Dashed stroke rings around center */}
          <circle
            cx="195"
            cy="100"
            r="62"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.18"
            fill="none"
            strokeDasharray="4 3"
          />
          <circle
            cx="195"
            cy="100"
            r="42"
            stroke="white"
            strokeWidth="1"
            opacity="0.12"
            fill="none"
            strokeDasharray="3 4"
          />

          {/* Central hero element — soft glow + symbol */}
          <circle cx="195" cy="100" r="26" fill="white" opacity="0.15" />
          <circle cx="195" cy="100" r="18" fill="white" opacity="0.20" />
          {/* Confirmation mark */}
          <path
            d="M186 100 L192.5 107 L205 93"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.90"
          />

          {/* Wavy decorative paths */}
          <path
            d="M0 150 Q50 132 100 150 Q150 168 200 150 Q250 132 300 150 Q350 168 390 150"
            stroke="white"
            strokeWidth="1.2"
            opacity="0.14"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0 170 Q60 154 120 170 Q180 186 240 170 Q300 154 390 170"
            stroke="white"
            strokeWidth="0.8"
            opacity="0.09"
            fill="none"
            strokeLinecap="round"
          />

          {/* Floating dot particles */}
          <circle cx="60" cy="45" r="2.5" fill="white" opacity="0.28" />
          <circle cx="330" cy="155" r="2" fill="white" opacity="0.22" />
          <circle cx="310" cy="60" r="2" fill="white" opacity="0.20" />
          <circle cx="80" cy="145" r="1.5" fill="white" opacity="0.18" />
          <circle cx="355" cy="95" r="1.5" fill="white" opacity="0.20" />
        </svg>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto bg-bg-page">
        <div className="px-s20 pt-s20 pb-s8">
          <p className="text-[12px] font-semibold text-label2 tracking-widest uppercase mb-[4px]">
            Satu langkah lagi
          </p>
          <h1 className="text-[26px] font-bold text-label leading-snug tracking-tight">
            Lengkapi data kontak
          </h1>
          <p className="text-[14px] text-label2 mt-[6px] leading-snug">
            Kami perlu data ini agar stylist dapat menghubungimu jika
            diperlukan.
          </p>
        </div>

        {/* ── Grouped form — iOS Settings style ── */}
        <div className="px-s16 pt-s16 pb-s24">
          <div className="bg-bg-card rounded-r20 shadow-card overflow-hidden">
            {/* Nama */}
            <div className="flex items-center gap-s12 px-s20 py-[14px]">
              <span
                className={cn(
                  "text-[14px] w-[96px] flex-shrink-0 transition-colors",
                  nameFocused ? "text-label font-medium" : "text-label2",
                )}
              >
                Nama
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                placeholder="Siti Rahayu"
                autoComplete="name"
                className="flex-1 text-[15px] text-label placeholder:text-label3 outline-none bg-transparent"
              />
            </div>

            <div className="ml-[calc(1rem+96px+0.75rem)] mr-s20 h-px bg-sep" />

            {/* WhatsApp */}
            <div className="flex items-center gap-s12 px-s20 py-[14px]">
              <span
                className={cn(
                  "text-[14px] w-[96px] flex-shrink-0 transition-colors",
                  phoneFocused ? "text-label font-medium" : "text-label2",
                )}
              >
                WhatsApp
              </span>
              <div className="flex items-center flex-1 gap-[8px]">
                <span className="text-[15px] text-label2 select-none">+62</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  placeholder="812 3456 7890"
                  autoComplete="tel"
                  inputMode="numeric"
                  className="flex-1 text-[15px] text-label placeholder:text-label3 outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          <p className="text-[13px] text-label mt-[10px] px-s4">
            Konfirmasi booking akan dikirim ke nomor ini.
          </p>
        </div>
      </div>

      <BottomCTA
        label={canProceed ? "Selesaikan Booking →" : "Lengkapi data dulu"}
        variant={canProceed ? "ready" : "default"}
        disabled={!canProceed}
        onClick={handleContinue}
      />

      {/* ── Addon bottom sheet ── */}
      {showAddons && (
        <>
          <div
            className="absolute inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-fadeIn"
            onClick={() => setShowAddons(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[28px] bg-bg-page animate-sheetUp"
            style={{ maxHeight: "84%" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-s12 pb-s4 flex-shrink-0">
              <div className="h-[4px] w-[36px] rounded-full bg-sep" />
            </div>

            {/* Header */}
            <div className="px-s20 pt-s20 pb-s20 flex-shrink-0">
              <h2 className="text-ts-t2 font-bold text-label leading-tight">
                Ada yang ingin ditambahkan?
              </h2>
              <p className="text-ts-fn text-label2 mt-s8 leading-snug">
                Produk berikut kami pilih khusus untuk melengkapi layananmu hari
                ini.
              </p>
            </div>

            {/* 2-column product grid */}
            <div className="flex-1 overflow-y-auto px-s16 pb-s4">
              <div className="grid grid-cols-2 gap-s16">
                {previewProducts.map((product) => {
                  const qty = getQuantity(product.id);
                  const initial = product.name.charAt(0).toUpperCase();
                  return (
                    <div
                      key={product.id}
                      className="bg-bg-card rounded-r20 p-s16 flex flex-col"
                    >
                      {/* Product image area — 4:3 landscape, less dominant than square */}
                      <div className="aspect-[4/3] w-full rounded-r12 bg-bg-control flex items-center justify-center mb-s12 flex-shrink-0">
                        <span className="text-[32px] font-bold text-label3 leading-none">
                          {initial}
                        </span>
                      </div>

                      {/* Product info — Name → Price → Description */}
                      <p className="text-ts-sub font-bold text-label leading-tight">
                        {product.name}
                      </p>
                      <p className="text-ts-fn font-semibold text-label mt-[4px]">
                        {formatRupiah(product.price)}
                      </p>
                      <p className="text-ts-cap1 text-label2 mt-[4px] leading-snug line-clamp-2 flex-1">
                        {product.description}
                      </p>

                      {/* Quantity control */}
                      <div className="mt-s12">
                        {qty === 0 ? (
                          /* Add button — full width pill */
                          <button
                            onClick={() => addAddon(product)}
                            aria-label={`Tambah ${product.name}`}
                            className="w-full rounded-rF bg-bg-control border border-sep py-[8px] flex items-center justify-center gap-[6px] transition-all active:scale-[0.97]"
                          >
                            <Plus
                              size={12}
                              weight="bold"
                              className="text-label"
                            />
                            <span className="text-[13px] font-semibold text-label">
                              Tambah
                            </span>
                          </button>
                        ) : (
                          /* Stepper — minus / count / plus */
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => removeAddon(product.id)}
                              aria-label={`Kurangi ${product.name}`}
                              className="w-[28px] h-[28px] rounded-full bg-bg-control flex items-center justify-center transition-colors active:bg-sep"
                            >
                              <Minus
                                size={12}
                                weight="bold"
                                className="text-label2"
                              />
                            </button>
                            <span className="text-[14px] font-semibold text-label min-w-[20px] text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => addAddon(product)}
                              aria-label={`Tambah ${product.name}`}
                              className="w-[28px] h-[28px] rounded-full bg-label flex items-center justify-center transition-colors active:bg-label2"
                            >
                              <Plus
                                size={12}
                                weight="bold"
                                className="text-white"
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTAs */}
            <div className="px-s16 pt-s12 pb-s20 flex flex-col gap-s4 flex-shrink-0">
              <button
                onClick={onNext}
                className="w-full rounded-rF bg-label py-[16px] text-[15px] font-semibold text-white transition-all active:scale-[0.98]"
              >
                Lanjut ke Pembayaran →
              </button>
              <button
                onClick={onNext}
                className="w-full py-[10px] text-[14px] text-label3 transition-colors active:text-label2"
              >
                Lewati, tidak perlu
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
