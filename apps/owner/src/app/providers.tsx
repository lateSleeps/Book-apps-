'use client';

import { ReactNode } from 'react';
import { TRPCProvider } from '@/lib/trpc-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
