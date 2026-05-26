import { router } from "../trpc";
import { servicesRouter } from "./services";

export const appRouter = router({
  services: servicesRouter,
});

export type AppRouter = typeof appRouter;
