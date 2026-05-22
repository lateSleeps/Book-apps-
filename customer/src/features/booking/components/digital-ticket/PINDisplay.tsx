'use client';

interface PINDisplayProps {
  pin: string;
}

export function PINDisplay({ pin }: PINDisplayProps) {
  const digits = pin.split('');

  return (
    <div className="flex flex-col items-center mt-s16">
      <p className="text-t12 text-label2 mb-s8">PIN Masuk Salon</p>
      <div className="flex gap-s8">
        {digits.map((digit, index) => (
          <div
            key={index}
            className="w-12 h-14 bg-accent-soft border border-accent/30 rounded-r12 flex items-center justify-center"
          >
            <span className="text-t28 font-black text-accent">{digit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
