'use client';

import { useEffect, useState } from 'react';

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
    <div className="text-center py-s20">
      <p className="text-sm text-label2 mb-s8">Selesaikan pembayaran dalam</p>
      <p className="text-t28 font-bold text-accent">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </p>
    </div>
  );
}
