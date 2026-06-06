'use client';

import { useCurrentUser } from '@/features/auth/hooks/useAuth';
import { OverviewBookingList } from '@/features/dashboard/components/overview/OverviewBookingList';
import { OverviewDialogs } from '@/features/dashboard/components/overview/OverviewDialogs';
import { OverviewHeader } from '@/features/dashboard/components/overview/OverviewHeader';
import { StatCardsRow } from '@/features/dashboard/components/overview/StatCardsRow';
import { WalkInDrawer } from '@/features/dashboard/components/overview/WalkInDrawer';
import { useOverviewController } from '@/features/dashboard/controller/use-overview-controller';

export default function OverviewPage() {
  const {
    list,
    status,
    detail,
    promo,
    payment,
    walkIn,
    ui,
    stats,
    isRefreshing,
    refreshData,
    realServices,
    realStylists,
    bookingStatusMap,
  } = useOverviewController();

  const currentUser = useCurrentUser();
  const userName = currentUser?.name?.split(' ')[0] ?? 'Owner';

  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-auto" style={{ backgroundColor: '#F2F2F7' }}>
        <div className="flex w-full flex-col gap-5 px-4 py-5 sm:gap-7 sm:px-6 sm:py-7 md:gap-10 md:px-8 md:py-10">
          <OverviewHeader
            greeting={ui.greeting}
            userName={userName}
            isMobile={ui.isMobile}
            walkIn={walkIn}
          />

          <StatCardsRow stats={stats} allBookings={list.allBookings} />

          <OverviewBookingList
            list={list}
            detail={detail}
            payment={payment}
            status={status}
            promo={promo}
            ui={ui}
            isRefreshing={isRefreshing}
            refreshData={refreshData}
          />
        </div>
      </div>

      <WalkInDrawer
        {...walkIn}
        isMobile={ui.isMobile}
        realServices={realServices ?? []}
        realStylists={realStylists ?? []}
        effectiveBookings={list.allBookings}
        bookingStatusMap={bookingStatusMap}
      />

      <OverviewDialogs payment={payment} status={status} />
    </>
  );
}
