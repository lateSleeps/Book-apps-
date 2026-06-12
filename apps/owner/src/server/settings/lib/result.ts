/**
 * MutationResult<T> — standard return shape for all settings mutations.
 *
 * Why: tRPC throws on error by default. MutationResult lets callers receive
 * structured success/failure without try-catch at the call site, which
 * simplifies controller hooks and UI error handling.
 *
 * Usage in a router:
 *
 *   .mutation(async ({ input, ctx }) => {
 *     try {
 *       await myService.doSomething(ctx.salonId, input);
 *       return ok();
 *     } catch (err) {
 *       throw toTRPCError(err);  // let tRPC handle the HTTP status
 *     }
 *   })
 *
 * Usage when returning data:
 *
 *   return ok(createdItem);
 */

export type MutationResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Overload: ok() with no data
export function ok(): MutationResult<void>;
// Overload: ok(data) with generic data
export function ok<T>(data: T): MutationResult<T>;
export function ok<T>(data?: T): MutationResult<T | void> {
  return { success: true, data } as MutationResult<T | void>;
}

export function err(message: string): MutationResult<never> {
  return { success: false, error: message };
}
