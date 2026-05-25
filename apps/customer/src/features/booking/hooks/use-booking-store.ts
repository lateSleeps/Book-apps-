'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type {
  BookingState,
  BookingStatus,
  Category,
  FormAnswers,
  PaymentType,
  Product,
  SelectedAddon,
  Service,
  Stylist,
} from '../types/booking.types';
import { BOOKING_CODE_PREFIX, DEPOSIT_AMOUNT, STORAGE_KEY } from '../constants/booking.constants';
import { calculateTotalPrice } from '../lib/price-calculator';
import { logger } from '@/shared/lib/logger';

// ── Store Interface ──────────────────────────────────────────────────────────

interface BookingStore extends BookingState {
  // Computed (derived)
  totalPrice: number;
  depositAmount: number;
  totalDuration: number;

  // Error & Loading states
  isLoading: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setValidationError: (field: string, error: string) => void;
  clearValidationError: (field: string) => void;
  clearAllErrors: () => void;

  // Step navigation
  setStep: (step: number) => void;
  goNext: () => void;
  goBack: () => void;

  // Setters
  setDate: (date: string) => void;
  setCategory: (category: Category) => void;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  setStylist: (stylist: Stylist) => void;
  setTimeSlot: (slot: string) => void;
  clearTimeSlot: () => void;
  addAddon: (product: Product) => void;
  removeAddon: (id: string) => void;
  setPaymentType: (type: PaymentType) => void;
  setProofImage: (url: string | null) => void;
  setFormAnswers: (answers: FormAnswers) => void;
  setContact: (name: string, phone: string) => void;
  setPromoCode: (code: string, discount: number) => void;
  removePromoCode: () => void;

  // Booking actions
  confirmBooking: () => void;
  completeBooking: () => void;
  reset: () => void;
}

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: BookingState = {
  step: 1,
  date: null,
  category: null,
  services: [],
  stylist: null,
  timeSlot: null,
  addons: [],
  paymentType: null,
  proofImageUrl: null,
  bookingStatus: 'DRAFT',
  bookingCode: null,
  pin: null,
  formAnswers: null,
  customerName: null,
  customerPhone: null,
  promoCode: null,
  discountAmount: 0,
};

// ── Error/Loading State ───────────────────────────────────────────────────────

interface ErrorLoadingState {
  isLoading: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
}

// ── Code/PIN Generator ────────────────────────────────────────────────────────

function generateBookingCode(): { bookingCode: string; pin: string } {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return {
    bookingCode: `${BOOKING_CODE_PREFIX}-${month}${day}-${rand}`,
    pin: rand,
  };
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useBookingStore = create<BookingStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        totalPrice: 0,
        depositAmount: DEPOSIT_AMOUNT,
        totalDuration: 0,
        isLoading: false,
        error: null,
        validationErrors: {},

        // Error & Loading handlers
        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
        setError: (error) => set({ error }, false, 'setError'),
        setValidationError: (field, error) =>
          set((state) => ({
            validationErrors: { ...state.validationErrors, [field]: error },
          }), false, 'setValidationError'),
        clearValidationError: (field) =>
          set((state) => {
            const errors = { ...state.validationErrors };
            delete errors[field];
            return { validationErrors: errors };
          }, false, 'clearValidationError'),
        clearAllErrors: () => set({ error: null, validationErrors: {} }, false, 'clearAllErrors'),

        setStep: (step) => set({ step }, false, 'setStep'),
        goNext: () => set((s) => ({ step: Math.min(s.step + 1, 9) }), false, 'goNext'),
        goBack: () => set((s) => ({ step: Math.max(s.step - 1, 1) }), false, 'goBack'),

        setDate: (date) => set({ date }, false, 'setDate'),

        setCategory: (category) =>
          set({ category, services: [], stylist: null, timeSlot: null }, false, 'setCategory'),

        addService: (service) => {
          const services = get().services;
          const alreadyAdded = services.find((s) => s.id === service.id);
          if (alreadyAdded) return; // Don't add duplicates

          const updatedServices = [...services, service];
          const totalServicePrice = updatedServices.reduce((sum, s) => sum + s.price, 0);
          const totalDuration = updatedServices.reduce((sum, s) => sum + s.duration, 0);
          const totalPrice = calculateTotalPrice(totalServicePrice, get().addons);

          logger.log('service added', { id: service.id, name: service.name, totalServices: updatedServices.length });
          set({ services: updatedServices, totalPrice, totalDuration }, false, 'addService');
        },

        removeService: (serviceId) => {
          const services = get().services.filter((s) => s.id !== serviceId);
          const totalServicePrice = services.reduce((sum, s) => sum + s.price, 0);
          const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
          const totalPrice = calculateTotalPrice(totalServicePrice, get().addons);

          logger.log('service removed', { id: serviceId, totalServices: services.length });
          set({ services, totalPrice, totalDuration }, false, 'removeService');
        },

        setStylist: (stylist) => {
          logger.log('stylist selected', { id: stylist.id, name: stylist.name });
          set({ stylist, timeSlot: null }, false, 'setStylist');
        },

        setTimeSlot: (slot) => {
          logger.log('time slot selected', slot);
          set({ timeSlot: slot }, false, 'setTimeSlot');
        },
        clearTimeSlot: () => set({ timeSlot: null }, false, 'clearTimeSlot'),

        addAddon: (product) => {
          const existing = get().addons.find((a) => a.id === product.id);
          const addons: SelectedAddon[] = existing
            ? get().addons.map((a) =>
                a.id === product.id ? { ...a, quantity: a.quantity + 1 } : a
              )
            : [
                ...get().addons,
                { id: product.id, name: product.name, price: product.price, quantity: 1 },
              ];
          const services = get().services;
          const totalServicePrice = services.reduce((sum, s) => sum + s.price, 0);
          const totalPrice = calculateTotalPrice(totalServicePrice, addons);
          set({ addons, totalPrice }, false, 'addAddon');
        },

        removeAddon: (id) => {
          const existing = get().addons.find((a) => a.id === id);
          if (!existing) return;
          const addons: SelectedAddon[] =
            existing.quantity <= 1
              ? get().addons.filter((a) => a.id !== id)
              : get().addons.map((a) =>
                  a.id === id ? { ...a, quantity: a.quantity - 1 } : a
                );
          const services = get().services;
          const totalServicePrice = services.reduce((sum, s) => sum + s.price, 0);
          const totalPrice = calculateTotalPrice(totalServicePrice, addons);
          set({ addons, totalPrice }, false, 'removeAddon');
        },

        setPaymentType: (type) => set({ paymentType: type }, false, 'setPaymentType'),

        setProofImage: (url) => set({ proofImageUrl: url }, false, 'setProofImage'),

        setFormAnswers: (answers) => set({ formAnswers: answers }, false, 'setFormAnswers'),

        setContact: (name, phone) => set({ customerName: name, customerPhone: phone }, false, 'setContact'),

        confirmBooking: () => {
          const { bookingCode, pin } = generateBookingCode();
          const status: BookingStatus = 'CONFIRMED';
          logger.log('booking confirmed', { bookingCode, status });
          set({ bookingCode, pin, bookingStatus: status }, false, 'confirmBooking');
        },

        completeBooking: () => {
          logger.log('booking completed');
          set({ bookingStatus: 'CONFIRMED' }, false, 'completeBooking');
        },

        setPromoCode: (code: string, discount: number) => {
          const totalServicePrice = get().services.reduce((sum, s) => sum + s.price, 0);
          const addonPrice = get().addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
          const subtotal = totalServicePrice + addonPrice;
          const finalDiscount = Math.min(discount, subtotal);
          const newTotalPrice = subtotal - finalDiscount;
          logger.log('promo code applied', { code, discount: finalDiscount });
          set({ promoCode: { code, type: 'PERCENT', value: discount }, discountAmount: finalDiscount, totalPrice: newTotalPrice }, false, 'setPromoCode');
        },

        removePromoCode: () => {
          const totalServicePrice = get().services.reduce((sum, s) => sum + s.price, 0);
          const addonPrice = get().addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
          const totalPrice = totalServicePrice + addonPrice;
          logger.log('promo code removed');
          set({ promoCode: null, discountAmount: 0, totalPrice }, false, 'removePromoCode');
        },

        reset: () => {
          logger.log('booking reset');
          set({ ...initialState, totalPrice: 0, depositAmount: DEPOSIT_AMOUNT, totalDuration: 0, promoCode: null, discountAmount: 0 }, false, 'reset');
        },
      }),
      {
        name: STORAGE_KEY,
        partialize: (state) => ({
          ...state,
          // Reset selection fields on each visit so user must re-pick
          date: null,
          services: [],
          timeSlot: null,
          // Cannot serialize File objects / object URLs
          proofImageUrl: null,
        }),
      }
    ),
    { name: 'BookingStore' }
  )
);
