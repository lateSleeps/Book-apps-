/**
 * Calculate end time given a start time and duration in minutes
 * @param timeSlot - Start time in HH:MM format (e.g., "14:30")
 * @param durationMinutes - Duration in minutes
 * @returns End time in HH:MM format (e.g., "15:00")
 */
export function calculateEndTime(
  timeSlot: string,
  durationMinutes: number,
): string {
  const [hours, minutes] = timeSlot.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  return `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
}
