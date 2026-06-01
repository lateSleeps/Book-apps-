import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';

export function useSalons() {
  const { data: salons, isLoading, error } = trpc.salons.getAll.useQuery();

  return useMemo(
    () => ({
      salons: salons || [],
      isLoading,
      error: error?.message,
    }),
    [salons, isLoading, error?.message]
  );
}
