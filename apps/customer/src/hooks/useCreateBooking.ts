import { trpc } from "@/lib/trpc";

export function useCreateBooking() {
  const mutation = trpc.bookings.create.useMutation();

  return {
    createBooking: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error?.message,
    booking: mutation.data,
  };
}
