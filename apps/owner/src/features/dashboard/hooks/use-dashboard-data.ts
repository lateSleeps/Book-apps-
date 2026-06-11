'use client';

import { format } from 'date-fns';
import { useMemo } from 'react';
import type { DashboardBooking, DashboardStats, DashboardStylist } from '../types/dashboard.types';
import { trpc } from '@/lib/trpc';

const SALON_ID = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

export function useDashboardData() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const {
    data: rawBookings = [],
    isLoading: isLoadingBookings,
    error: bookingsError,
    refetch,
  } = trpc.bookings.getBySalon.useQuery({ salonId: SALON_ID }, { enabled: !!SALON_ID });

  console.log('[useDashboardData] rawBookings count:', rawBookings.length);
  console.log('[useDashboardData] isLoadingBookings:', isLoadingBookings);
  if (bookingsError) console.log('[useDashboardData] error:', bookingsError.message);

  // Explicitly map fields — guarantees paymentProofUrl is set from either key casing
  const bookingsData: DashboardBooking[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (rawBookings as any[]).map((b) => ({
      ...b,
      paymentProofUrl: b.paymentProofUrl ?? b.payment_proof_url ?? null,
    }));
  }, [rawBookings]);

  const stylists: DashboardStylist[] = [
    { id: 's1', name: 'Dewi Rahayu', initials: 'DR', color: '#c8ede2' },
    { id: 's2', name: 'Fajar Santoso', initials: 'FS', color: '#ddedf8' },
    { id: 's3', name: 'Rina Kusuma', initials: 'RK', color: '#eddde9' },
    { id: 's4', name: 'Budi Pratama', initials: 'BP', color: '#fef3c2' },
  ];

  const todayBookings: DashboardBooking[] = useMemo(() => {
    return bookingsData.filter((b) => b.date === today);
  }, [bookingsData, today]);

  const upcomingBookings: DashboardBooking[] = useMemo(() => {
    return bookingsData.filter((b) => b.date >= today);
  }, [bookingsData, today]);

  const stats: DashboardStats = useMemo(
    () => ({
      revenueToday: bookingsData.reduce((sum, b) => sum + (b.price || 0), 0),
      revenueDelta: 0,
      bookingsToday: upcomingBookings.length,
      bookingsDelta: 0,
      avgRating: 4.8,
      completionRate: Math.round(
        (upcomingBookings.filter((b) => b.status === 'COMPLETED').length /
          (upcomingBookings.length || 1)) *
          100
      ),
      activeStylists: 4,
      totalStylists: 4,
    }),
    [bookingsData, upcomingBookings]
  );

  const allBookings: DashboardBooking[] = useMemo(() => {
    console.log('[useDashboardData] allBookings:', bookingsData.length, 'items');
    if (bookingsData.length > 0) {
      console.log(
        '[useDashboardData] first allBookings paymentProofUrl:',
        bookingsData[0]?.paymentProofUrl
      );
    }
    return bookingsData;
  }, [bookingsData]);

  return {
    todayBookings,
    upcomingBookings,
    allBookings,
    stats,
    stylists,
    isLoading: isLoadingBookings,
    refetch,
  };
}
