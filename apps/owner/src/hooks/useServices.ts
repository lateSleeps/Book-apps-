import { trpc } from '@/lib/trpc';

export function useServices(salonId: string) {
  const {
    data: services,
    isLoading,
    error,
  } = trpc.services.getBySalon.useQuery({ salonId }, { enabled: !!salonId });

  return {
    services: services || [],
    isLoading,
    error: error?.message,
  };
}
