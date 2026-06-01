export const siteConfig = {
  name: "Rara Beauty Salon",
  description: "Book your salon appointment online — fast, easy, and secure.",
  slug: "rara-beauty-jakarta",
  address: "Jl. Sudirman No. 12, Jakarta",
  phone: "+62 812-3456-7890",
  openDays: [2, 3, 4, 5, 6, 7] as number[], // Tue–Sun (1=Mon=closed)
  openHours: { open: "09:00", close: "20:00" },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
