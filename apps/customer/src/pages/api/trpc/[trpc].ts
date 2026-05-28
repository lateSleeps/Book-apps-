import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/trpc/routers/_app";

export default createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
  onError: ({ error }) => {
    console.error("tRPC error:", error);
  },
});
