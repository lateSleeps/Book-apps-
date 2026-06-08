// Brand & Profil — source of truth for the Customer Booking App.
// DB column mapping: docs/settings-v2/brand-database-contract.md

export interface BrandIdentity {
  salonName: string;
  tagline: string;
  description: string;
}

export interface BrandMedia {
  logoUrl: string | null;
  coverImageUrl: string | null;
}

export interface BrandContact {
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
}

export interface BrandSocial {
  instagram: string;
  tiktok: string;
  facebook: string;
}

export interface BrandLocation {
  address: string;
  city: string;
  mapsUrl: string;
}

export interface BrandProfile {
  identity: BrandIdentity;
  media: BrandMedia;
  contact: BrandContact;
  social: BrandSocial;
  location: BrandLocation;
}
