'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
}

export function QRCodeDisplay({ value }: QRCodeDisplayProps) {
  return (
    <div className="flex justify-center">
      <div className="p-s16 bg-white rounded-r16 border border-sep shadow-sm">
        <QRCodeSVG
          value={value}
          size={280}
          bgColor="#ffffff"
          fgColor="#111110"
          level="M"
          includeMargin={false}
        />
      </div>
    </div>
  );
}
