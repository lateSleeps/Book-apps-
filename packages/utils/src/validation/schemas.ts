import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Email tidak valid')
  .min(1, 'Email harus diisi');

/**
 * Password validation schema
 * Minimum 8 characters, at least one number and one uppercase letter
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[0-9]/, 'Password harus mengandung angka');

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(2, 'Nama minimal 2 karakter')
  .max(100, 'Nama maksimal 100 karakter');

/**
 * Phone number validation schema (Indonesian format)
 */
export const phoneSchema = z
  .string()
  .regex(
    /^(\+62|62|0)[0-9]{9,12}$/,
    'Nomor telepon tidak valid'
  );

/**
 * Price validation schema
 */
export const priceSchema = z
  .number()
  .positive('Harga harus lebih dari 0')
  .finite('Harga tidak valid');

/**
 * Duration validation schema (in minutes)
 */
export const durationSchema = z
  .number()
  .positive('Durasi harus lebih dari 0')
  .int();

/**
 * URL validation schema
 */
export const urlSchema = z
  .string()
  .url('URL tidak valid');

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password harus diisi'),
});

/**
 * Registration form schema
 */
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

/**
 * Profile update schema
 */
export const profileUpdateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
});

/**
 * Service creation schema
 */
export const serviceSchema = z.object({
  name: z.string().min(1, 'Nama layanan harus diisi'),
  categoryId: z.string().min(1, 'Kategori harus dipilih'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  duration: durationSchema,
  price: priceSchema,
  maxCapacity: z.number().positive().optional(),
});

/**
 * Booking creation schema
 */
export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Layanan harus dipilih'),
  stylistId: z.string().min(1, 'Stylist harus dipilih'),
  bookingDate: z.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu HH:mm'),
  notes: z.string().optional(),
});

/**
 * Category creation schema
 */
export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori harus diisi'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Warna harus format hex'),
});
