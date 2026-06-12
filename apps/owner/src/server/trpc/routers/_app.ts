import { router } from '../trpc';
import { bookingsRouter } from './bookings';
import { businessHoursRouter } from './business-hours';
import { salonsRouter } from './salons';
import { servicesRouter } from './services';
import { settingsRouter } from './settings/_settings';
import { stylistSchedulesRouter } from './stylist-schedules';
import { stylistsRouter } from './stylists';

export const appRouter = router({
  // Existing routers — do not modify these namespaces
  salons: salonsRouter,
  services: servicesRouter,
  bookings: bookingsRouter,
  stylists: stylistsRouter,
  stylistSchedules: stylistSchedulesRouter,
  businessHours: businessHoursRouter,

  // Settings V2 persistence layer — all domain routers live under this namespace
  // Access: trpc.settings.<domain>.<procedure>()
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
