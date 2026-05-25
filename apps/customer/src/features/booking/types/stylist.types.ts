import type { Stylist, TimeSlot } from './booking.types';

/** Stylist with computed availability */
export interface StylistWithAvailability extends Stylist {
  isFullyBooked: boolean;
  availableSlots: TimeSlot[];
}

/** Accordion state for stylist cards */
export interface StylistAccordionState {
  openStylistId: string | null;
  toggle: (id: string) => void;
}
