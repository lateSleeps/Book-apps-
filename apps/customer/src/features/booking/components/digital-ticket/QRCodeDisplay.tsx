"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  value: string;
}

export function QRCodeDisplay({ value }: QRCodeDisplayProps) {
  return (
    <div className="flex justify-center">
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <QRCodeSVG
          value={value}
          size={220}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
          includeMargin={false}
        />
      </div>
    </div>
  );
}
