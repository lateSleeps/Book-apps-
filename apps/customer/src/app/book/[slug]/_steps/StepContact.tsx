"use client";

import { useState, useMemo, useCallback } from "react";
import { BottomCTA } from "@/features/booking/components/bottom-cta";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { useMockData } from "@/features/booking/hooks/use-mock-data";
import { cn } from "@/shared/lib/cn";
import { formatRupiah } from "@/shared/lib/format";

function InputCard({
  children,
  focused,
}: {
  children: React.ReactNode;
  focused: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-r16 bg-surface border overflow-hidden transition-all",
        focused ? "border-label ring-2 ring-label/10" : "border-sep",
      )}
    >
      {children}
    </div>
  );
}

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
    setContact(name.trim(), phone.trim());
    setShowAddons(true);
  }

  const previewProducts = useMemo(() => products.slice(0, 4), [products]);

  const getQuantity = useCallback(
    (productId: string) =>
      addons.find((a) => a.id === productId)?.quantity ?? 0,
    [addons],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Hero */}
      <div
        className="relative flex-shrink-0"
        style={{ height: "30%", backgroundColor: "#E8705A" }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 390 300"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <circle cx="320" cy="40" r="120" fill="#F4856B" fillOpacity="0.5" />
          <circle cx="60" cy="260" r="100" fill="#D4604A" fillOpacity="0.4" />
          <path
            d="M100 280 C90 240 85 200 95 170 C98 158 108 152 118 158 L130 165 C136 142 150 138 158 148 L162 155 C168 134 182 132 188 144 L192 154 C198 136 212 136 216 150 L218 200 C218 220 210 255 200 280Z"
            fill="#FDDCB0"
          />
          <path
            d="M290 280 C300 240 305 200 295 170 C292 158 282 152 272 158 L260 165 C254 142 240 138 232 148 L228 155 C222 134 208 132 202 144 L198 154 C196 136 184 136 182 150 L180 200 C180 220 188 255 198 280Z"
            fill="#FDDCB0"
          />
          <rect
            x="128"
            y="80"
            width="134"
            height="148"
            rx="8"
            fill="white"
            fillOpacity="0.95"
          />
          <rect x="136" y="88" width="118" height="104" rx="4" fill="#c8ede2" />
          <g
            transform="translate(195, 140)"
            stroke="#3a7a62"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <circle
              cx="0"
              cy="0"
              r="28"
              strokeWidth="3"
              fill="white"
              fillOpacity="0.7"
            />
            <circle cx="-10" cy="-6" r="3.5" fill="#3a7a62" stroke="none" />
            <circle cx="10" cy="-6" r="3.5" fill="#3a7a62" stroke="none" />
            <path d="M-12 10 C-6 18 6 18 12 10" strokeWidth="3" />
          </g>
          <rect x="148" y="204" width="94" height="8" rx="4" fill="#e0e0e0" />
          <rect x="162" y="218" width="66" height="6" rx="3" fill="#ececec" />
          <g fill="white" fillOpacity="0.8">
            <path d="M320 110 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
            <path d="M68 120 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
            <path d="M340 200 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z" />
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-bg relative z-10">
        <div className="flex flex-col gap-s20 px-s20 pt-s32 pb-s32">
          <div>
            <p className="text-[13px] font-semibold text-label3 mb-[6px]">
              Hampir selesai! 🙏
            </p>
            <h1 className="text-[26px] font-bold text-label leading-tight">
              Maaf, perlu data
              <br />
              dirimu dulu.
            </h1>
            <p className="text-[14px] text-label2 mt-[8px] leading-snug">
              Kami butuh ini buat ngabarin kamu sebelum sesi dimulai.
            </p>
          </div>

          <div className="flex flex-col gap-s8 mt-s12">
            <p className="text-[14px] font-medium text-label2">Nama lengkap</p>
            <InputCard focused={nameFocused}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                placeholder="Contoh: Siti Rahayu"
                autoComplete="name"
                className="w-full px-s16 py-[14px] text-[15px] text-label placeholder:text-label3 outline-none bg-transparent"
              />
            </InputCard>
          </div>

          <div className="flex flex-col gap-s8">
            <p className="text-[14px] font-medium text-label2">
              Nomor WhatsApp
            </p>
            <InputCard focused={phoneFocused}>
              <div className="flex items-center">
                <div className="flex items-center px-s16 py-[14px] border-r border-black/10">
                  <span className="text-[15px] font-medium text-label2 select-none">
                    +62
                  </span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  placeholder="812 3456 7890"
                  autoComplete="tel"
                  inputMode="numeric"
                  className="flex-1 px-s16 py-[14px] text-[15px] text-label placeholder:text-label3 outline-none bg-transparent"
                />
              </div>
            </InputCard>
            <p className="text-[12px] text-label3">
              Konfirmasi booking dikirim ke nomor ini.
            </p>
          </div>
        </div>
      </div>

      <BottomCTA
        label={canProceed ? "Selesaikan Booking →" : "Lengkapi data dulu"}
        variant={canProceed ? "ready" : "default"}
        disabled={!canProceed}
        onClick={handleContinue}
      />

      {/* Addon bottom sheet */}
      {showAddons && (
        <>
          <div
            className="absolute inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-fadeIn"
            onClick={() => setShowAddons(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[28px] bg-bg animate-sheetUp"
            style={{ maxHeight: "80%" }}
          >
            <div className="flex justify-center pt-s12 pb-s4 flex-shrink-0">
              <div className="h-[4px] w-[36px] rounded-full bg-sep" />
            </div>

            <div className="px-s20 pt-s8 pb-s16 flex-shrink-0">
              <h2 className="text-[20px] font-bold text-label">
                Mau tambah produk?
              </h2>
              <p className="text-[13px] text-label2 mt-[4px]">
                Pilih perawatan tambahan buat hasil yang lebih maksimal.
              </p>
            </div>

            <div className="h-px bg-sep mx-s20 flex-shrink-0" />

            <div className="flex-1 overflow-y-auto px-s20 pt-s12 pb-s4">
              <div className="flex flex-col gap-s8">
                {previewProducts.map((product) => {
                  const qty = getQuantity(product.id);
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-s12 p-s16 bg-white rounded-r16 border border-sep"
                    >
                      <div className="text-3xl w-12 h-12 flex items-center justify-center bg-bg rounded-r12 flex-shrink-0">
                        {product.imageEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-label">
                          {product.name}
                        </p>
                        <p className="text-[12px] text-label2 mt-[2px]">
                          {product.description}
                        </p>
                        <p className="text-[13px] font-bold text-accent mt-[4px]">
                          {formatRupiah(product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-s8 flex-shrink-0">
                        <button
                          onClick={() => removeAddon(product.id)}
                          disabled={qty === 0}
                          className={cn(
                            "w-8 h-8 rounded-full border text-[16px] font-bold flex items-center justify-center transition-colors",
                            qty === 0
                              ? "border-sep text-label3 cursor-not-allowed"
                              : "border-accent text-accent hover:bg-accent-soft",
                          )}
                        >
                          −
                        </button>
                        <span className="text-[14px] font-semibold text-label w-4 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => addAddon(product)}
                          className="w-8 h-8 rounded-full bg-accent text-white text-[16px] font-bold flex items-center justify-center hover:bg-accent-dark transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-s20 py-s16 flex flex-col gap-s8 flex-shrink-0">
              <button
                onClick={onNext}
                className="w-full rounded-rF bg-label py-[16px] text-[15px] font-semibold text-white transition-all active:scale-[0.98]"
              >
                Lanjut ke Pembayaran →
              </button>
              <button
                onClick={onNext}
                className="w-full py-[12px] text-[14px] font-medium text-label3 hover:text-label2 transition-colors"
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
