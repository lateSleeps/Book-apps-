import { router } from "../trpc";
import { bookingsRouter } from "./bookings";
import { businessHoursRouter } from "./business-hours";
import { servicesRouter } from "./services";
import { stylistsRouter } from "./stylists";

export const appRouter = router({
  services: servicesRouter,
  stylists: stylistsRouter,
  businessHours: businessHoursRouter,
  bookings: bookingsRouter,
});

export type AppRouter = typeof appRouter;
