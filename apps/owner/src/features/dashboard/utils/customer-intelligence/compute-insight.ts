import type { CustomerSegment } from '../../constants/domain/customer-segment';

export type InsightType = 'DORMANT' | 'AT_RISK' | 'FIFTH_VISIT' | 'HIGH_SPENDER' | 'ALWAYS_ONLINE';

export interface CustomerInsight {
  type: InsightType;
  message: string;
}

interface InsightInput {
  segment: CustomerSegment;
  visitNumber: number;
  totalSpend: number;
  daysSinceLastVisit: number;
  totalVisitsAllBooking: boolean; // all customer visits are BOOKING type, and totalVisits >= 2
}

export function computeInsight({
  segment,
  visitNumber,
  totalSpend,
  daysSinceLastVisit,
  totalVisitsAllBooking,
}: InsightInput): CustomerInsight | null {
  // Priority: DORMANT > AT_RISK > 5th visit > high spender > always online
  if (segment === 'DORMANT') {
    return {
      type: 'DORMANT',
      message: `Pelanggan ini belum berkunjung selama ${daysSinceLastVisit} hari.`,
    };
  }

  if (segment === 'AT_RISK') {
    return {
      type: 'AT_RISK',
      message: `Perlu perhatian — belum berkunjung ${daysSinceLastVisit} hari.`,
    };
  }

  if (visitNumber === 5) {
    return {
      type: 'FIFTH_VISIT',
      message: 'Kunjungan ke-5 — pertimbangkan reward loyalitas.',
    };
  }

  if (totalSpend > 1_000_000) {
    return {
      type: 'HIGH_SPENDER',
      message: `Total belanja Rp ${totalSpend.toLocaleString('id-ID')} — pelanggan bernilai tinggi.`,
    };
  }

  if (totalVisitsAllBooking) {
    return {
      type: 'ALWAYS_ONLINE',
      message: 'Selalu booking online — kandidat notifikasi digital.',
    };
  }

  return null;
}
