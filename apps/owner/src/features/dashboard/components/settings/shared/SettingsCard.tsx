'use client';

import React from 'react';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-[18px] font-semibold text-[#1a1a1a]">{title}</h2>
        {description && (
          <p className="text-[13px] text-[#999] mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
