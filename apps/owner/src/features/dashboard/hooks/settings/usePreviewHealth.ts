'use client';

import { trpc } from '@/lib/trpc';
import type { BookingReadiness } from '@/server/settings/services/preview.service';

export interface PreviewHealthController {
  readiness: BookingReadiness | null;
  isLoading: boolean;
  refetch: () => void;
}

export function usePreviewHealth(): PreviewHealthController {
  const query = trpc.settings.preview.getReadiness.useQuery(undefined, {
    staleTime: 30 * 1000,
  });

  return {
    readiness: query.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
