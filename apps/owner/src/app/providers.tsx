'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { TRPCProvider } from '@/lib/trpc-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TRPCProvider>
      <AuthProvider>{children}</AuthProvider>
    </TRPCProvider>
  );
}
