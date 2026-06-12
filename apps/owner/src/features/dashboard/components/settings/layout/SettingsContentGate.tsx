'use client';

import type { ReactNode } from 'react';
import { SETTINGS_SECTION_GAP } from '../constants/layout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/lib/cn';

function SettingsLoadingSkeleton() {
  return (
    <div className={cn('flex w-full flex-col', SETTINGS_SECTION_GAP)}>
      {[80, 120, 64].map((h) => (
        <div
          key={h}
          className="animate-pulse rounded-r16 border border-bd-card bg-bg-card shadow-card"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

export function SettingsContentGate({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();
  if (isLoading) return <SettingsLoadingSkeleton />;
  return <>{children}</>;
}
