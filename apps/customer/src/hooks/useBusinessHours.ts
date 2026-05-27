import { trpc } from "@/lib/trpc";

export function useBusinessHours(salonId: string) {
  const {
    data: hours,
    isLoading,
    error,
  } = trpc.businessHours.getBySalon.useQuery(
    { salonId },
    { enabled: !!salonId },
  );

  return {
    hours: hours || [],
    isLoading,
    error: error?.message,
  };
}
