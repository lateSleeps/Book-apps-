import { router } from '../../trpc';
import { bookingAppRouter } from './booking-app';
import { brandRouter } from './brand';
import { operationalRouter } from './operational';
import { penggunaRouter } from './pengguna';
import { previewRouter } from './preview';
import { produkPaketRouter } from './produkpaket';
import { servicesRouter } from './services';
import { teamRouter } from './team';

/**
 * Settings namespace router.
 * Access via: trpc.settings.<domain>.<procedure>()
 *
 * Sprint 1.1: operational (business_hours)
 * Sprint 1.2: brand (salons — text fields + media URLs)
 * Sprint 1.3: services (categories + services)
 * Sprint 2.1: bookingApp (payment methods, bank accounts, confirmation, salon policy)
 * Sprint 3.1: team (staff, assignments, schedules, leaves)
 * Sprint 3.2: produkPaket (add-on products, service bundles)
 * Sprint 4:   pengguna (salon users, invitations, roles)
 */
export const settingsRouter = router({
  brand: brandRouter,
  operational: operationalRouter,
  services: servicesRouter,
  bookingApp: bookingAppRouter,
  team: teamRouter,
  produkPaket: produkPaketRouter,
  pengguna: penggunaRouter,
  preview: previewRouter,
});
