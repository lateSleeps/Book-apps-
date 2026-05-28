import { router } from "../trpc";
import { bookingsRouter } from "./bookings";
import { businessHoursRouter } from "./business-hours";
import { salonsRouter } from "./salons";
import { servicesRouter } from "./services";
import { stylistsRouter } from "./stylists";

export const appRouter = router({
  salons: salonsRouter,
  services: servicesRouter,
  stylists: stylistsRouter,
  businessHours: businessHoursRouter,
  bookings: bookingsRouter,
});

export type AppRouter = typeof appRouter;
