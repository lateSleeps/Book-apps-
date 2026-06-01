import { z } from "zod";

// ── Zod Schemas ────────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  color: z.string(), // Tailwind class: 'bg-c-peach'
  blobColor: z.string(), // Hex for blob shape
  icon: z.string(),
});

export const ServiceFlowSchema = z.enum([
  "STYLING_HAIR",
  "STYLING_COLOUR",
  "STYLING_NAIL",
  "TREATMENT",
]);

export const ServiceQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["chips", "photo"]),
  required: z.boolean(),
  options: z.array(z.string()),
});

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative(),
  duration: z.number().positive(),
  categoryId: z.string().optional(),
  serviceFlow: ServiceFlowSchema.optional(),
  price_type: z.enum(["fixed", "starting_from"]).optional().nullable(),
  requires_specialist: z.boolean().optional().nullable(),
  service_questions: z.array(ServiceQuestionSchema).optional().nullable(),
});

export const FormAnswersSchema = z.object({
  // Hair
  hairLength: z.string().optional(),
  hairCutStyle: z.string().optional(),
  // Colour
  currentColour: z.string().optional(),
  targetColour: z.string().optional(),
  hairCondition: z.string().optional(),
  // Nail
  nailLength: z.string().optional(),
  nailShape: z.string().optional(),
  // Shared
  notes: z.string().optional(),
});

export const StylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  specialty: z.string(),
  avatarInitials: z.string().max(2),
  avatarColor: z.string(),
  bookedSlots: z.array(z.string()),
});

export const TimeSlotSchema = z.object({
  time: z.string(),
  session: z.enum(["PAGI", "SIANG", "SORE"]),
  available: z.boolean(),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  imageEmoji: z.string(),
});

export const SelectedAddonSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().positive(),
});

export const BookingStatusSchema = z.enum(["DRAFT", "PENDING", "CONFIRMED"]);
export const PaymentTypeSchema = z.enum(["DEPOSIT", "FULL"]);

export const PromoCodeSchema = z.object({
  code: z.string(),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minPurchase: z.number().nonnegative().optional(),
  maxDiscount: z.number().nonnegative().optional(),
});

export const BookingStateSchema = z.object({
  step: z.number().min(1).max(9),
  date: z.string().nullable(),
  category: CategorySchema.nullable(),
  services: z.array(ServiceSchema),
  stylist: StylistSchema.nullable(),
  timeSlot: z.string().nullable(),
  addons: z.array(SelectedAddonSchema),
  paymentType: PaymentTypeSchema.nullable(),
  proofImageUrl: z.string().nullable(),
  bookingStatus: BookingStatusSchema,
  bookingCode: z.string().nullable(),
  pin: z.string().nullable(),
  formAnswers: FormAnswersSchema.nullable(),
  customerName: z.string().nullable(),
  customerPhone: z.string().nullable(),
  customerEmail: z.string().nullable(),
  promoCode: PromoCodeSchema.nullable(),
  discountAmount: z.number().nonnegative(),
});

// ── Inferred Types ─────────────────────────────────────────────────────────────

export type Category = z.infer<typeof CategorySchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type ServiceFlow = z.infer<typeof ServiceFlowSchema>;
export type FormAnswers = z.infer<typeof FormAnswersSchema>;
export type Stylist = z.infer<typeof StylistSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type SelectedAddon = z.infer<typeof SelectedAddonSchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type PaymentType = z.infer<typeof PaymentTypeSchema>;
export type PromoCode = z.infer<typeof PromoCodeSchema>;
export type BookingState = z.infer<typeof BookingStateSchema>;
