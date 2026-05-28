// Components
export { BookingSummary } from "./components/booking-summary";
export { BottomCTA } from "./components/bottom-cta";
export { CalendarView } from "./components/calendar-view";
export { CategoryGrid } from "./components/category-grid";
export { DigitalTicket } from "./components/digital-ticket";
export { NavigationButtons } from "./components/navigation-buttons";
export { PaymentOptions } from "./components/payment-options";
export { ProductUpsell } from "./components/product-upsell";
export { PromoCodeInput } from "./components/promo-code-input";
export { SelectedServicesIndicator } from "./components/selected-services-indicator";
export { ServiceList } from "./components/service-list";
export { StepHeader } from "./components/step-header";
export { StepIndicator } from "./components/step-indicator";
export { StylistCards } from "./components/stylist-cards";
export { TimeSlotPicker } from "./components/time-slot-picker";

// Hooks
export { useBookingStore } from "./hooks/use-booking-store";
export { useMockData } from "./hooks/use-mock-data";
export { useToast } from "./hooks/use-toast";
export { useSlotTimer } from "./hooks/use-slot-timer";
export { useStepValidation } from "./hooks/use-step-validation";

// Types
export type * from "./types/booking.types";
export type * from "./types/payment.types";
export type * from "./types/service.types";
export type * from "./types/stylist.types";

// Lib
export * from "./lib/date-utils";
export * from "./lib/price-calculator";
export * from "./lib/validation";
