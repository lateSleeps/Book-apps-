import { router } from '../trpc';
import { salonsRouter } from './salons';

export const appRouter = router({
  salons: salonsRouter,
});

export type AppRouter = typeof appRouter;
