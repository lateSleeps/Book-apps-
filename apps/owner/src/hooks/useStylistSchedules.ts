import { trpc } from '@/lib/trpc';

export function useStylistSchedules(stylistId: string) {
  const {
    data: schedules,
    isLoading,
    error,
  } = trpc.stylistSchedules.getByStylest.useQuery({ stylistId }, { enabled: !!stylistId });

  return {
    schedules: schedules || [],
    isLoading,
    error: error?.message,
  };
}
