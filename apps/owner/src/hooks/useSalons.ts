import { trpc } from '@/lib/trpc';

export function useSalons() {
  const { data: salons, isLoading, error } = trpc.salons.getAll.useQuery();

  return {
    salons: salons || [],
    isLoading,
    error: error?.message,
  };
}
