import { trpc } from "@/lib/trpc";

export function useSalon(slug: string) {
  const { data, isLoading, error } = trpc.salons.getBySlug.useQuery(
    { slug },
    { enabled: !!slug },
  );

  return {
    salon: data ?? null,
    salonId: data?.id ?? null,
    isLoading,
    error: error?.message ?? null,
  };
}
