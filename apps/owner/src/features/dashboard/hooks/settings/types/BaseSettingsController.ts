/**
 * BaseSettingsController — for domains with a single save target.
 *
 * Applies to: Brand, Layanan, Tim, Pengguna.
 * These domains have one save action per page. All state is dirty-tracked
 * against a single saved snapshot and committed in one mutation.
 *
 * Does NOT apply to: Operasional, Booking App.
 * Those domains have multiple independently-saveable sections (business hours,
 * booking policy, closing dates). They use the section-scoped pattern:
 *   ctrl.<section>.data
 *   ctrl.<section>.isSaving
 *   ctrl.<section>.save(...)
 *
 * When migrating a mock controller to tRPC:
 *   isDirty  — compare draft against query data, derived — no useState needed
 *   isSaving — use useMutation().isLoading — no useState needed
 *   handleSave — call mutateAsync, let the caller handle errors
 *   handleReset — reset draft state to the current query data
 */
export interface BaseSettingsController {
  isDirty: boolean;
  isSaving: boolean;
  handleSave: () => void;
  handleReset: () => void;
}
