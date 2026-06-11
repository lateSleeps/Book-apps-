import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/trpc/routers/_app';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();
