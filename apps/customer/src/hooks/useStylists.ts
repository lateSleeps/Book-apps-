import { trpc } from "@/lib/trpc";

export function useStylists(salonId: string) {
  const {
    data: stylists,
    isLoading,
    error,
  } = trpc.stylists.getBySalon.useQuery({ salonId }, { enabled: !!salonId });

  return {
    stylists: stylists || [],
    isLoading,
    error: error?.message,
  };
}
