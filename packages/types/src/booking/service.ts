import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  color: z.string(),
  displayOrder: z.number(),
  isActive: z.boolean().default(true)
});

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string(),
  description: z.string(),
  duration: z.number(), // in minutes
  price: z.number(),
  isActive: z.boolean().default(true),
  maxCapacity: z.number().optional(),
  displayOrder: z.number()
});

export type Category = z.infer<typeof CategorySchema>;
export type Service = z.infer<typeof ServiceSchema>;

export interface ServiceWithCategory extends Service {
  category: Category;
}
