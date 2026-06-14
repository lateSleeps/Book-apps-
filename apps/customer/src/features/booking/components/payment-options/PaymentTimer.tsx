"use client";

import { useEffect, useState } from "react";

export function PaymentTimer() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="pb-s8">
      <p className="text-ts-hero font-black text-label tracking-tight leading-none">
        {String(minutes).padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </p>
      <p className="text-ts-fn text-label2 mt-s8 leading-snug">
        Waktu tersisa untuk menyelesaikan pembayaran
      </p>
    </div>
  );
}
