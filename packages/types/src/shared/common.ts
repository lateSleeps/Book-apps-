import { z } from 'zod';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  statusCode: z.number(),
  details: z.record(z.any()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: ApiErrorSchema.optional(),
  timestamp: z.string(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
};

export const PaginationSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(1),
  total: z.number().min(0),
  totalPages: z.number().min(0),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: PaginationSchema,
  error: ApiErrorSchema.optional(),
  timestamp: z.string(),
});

export type PaginatedResponse<T = any> = {
  success: boolean;
  data: T[];
  pagination: Pagination;
  error?: ApiError;
  timestamp: string;
};
