import { toTRPCError } from '../../../settings/lib/errors';
import { getBookingReadiness } from '../../../settings/services/preview.service';
import { protectedProcedure, router } from '../../trpc';

export const previewRouter = router({
  getReadiness: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getBookingReadiness(ctx.salonId);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),
});
