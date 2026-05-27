import { trpc } from '@/lib/trpc';

export function useBookings(salonId: string) {
  const {
    data: bookings,
    isLoading,
    error,
    refetch,
  } = trpc.bookings.getBySalon.useQuery({ salonId }, { enabled: !!salonId });

  return {
    bookings: bookings || [],
    isLoading,
    error: error?.message,
    refetch,
  };
}
