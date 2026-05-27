import { router } from '../trpc';
import { bookingsRouter } from './bookings';
import { businessHoursRouter } from './business-hours';
import { salonsRouter } from './salons';
import { servicesRouter } from './services';
import { stylistSchedulesRouter } from './stylist-schedules';
import { stylistsRouter } from './stylists';

export const appRouter = router({
  salons: salonsRouter,
  services: servicesRouter,
  bookings: bookingsRouter,
  stylists: stylistsRouter,
  stylistSchedules: stylistSchedulesRouter,
  businessHours: businessHoursRouter,
});

export type AppRouter = typeof appRouter;
