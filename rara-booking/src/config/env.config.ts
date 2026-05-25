/** Environment configuration — all env vars validated here */
export const envConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  salonSlug: process.env.NEXT_PUBLIC_SALON_SLUG ?? 'rara-beauty',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const;
