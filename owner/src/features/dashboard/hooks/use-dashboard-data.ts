import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import type { DashboardBooking, DashboardStats, DashboardStylist } from '../types/dashboard.types';

export function useDashboardData() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const stylists: DashboardStylist[] = [
    { id: 's1', name: 'Dewi Rahayu', initials: 'DR', color: '#c8ede2' },
    { id: 's2', name: 'Fajar Santoso', initials: 'FS', color: '#ddedf8' },
    { id: 's3', name: 'Rina Kusuma', initials: 'RK', color: '#eddde9' },
    { id: 's4', name: 'Budi Pratama', initials: 'BP', color: '#fef3c2' },
  ];

  const todayBookings: DashboardBooking[] = useMemo(() => [
    {
      id: 'b1', bookingCode: 'RB-2025-001', date: today, timeSlot: '09:00',
      stylistName: 'Dewi Rahayu', stylistInitials: 'DR', stylistColor: '#c8ede2',
      customerName: 'Siti Rahayu', customerPhone: '081234567890',
      serviceName: 'Ladies Haircut+Wash', categoryName: 'Hair',
      price: 180000, duration: 45, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL', visitorType: 'BOOKING',
      addOns: [{ id: 'ao1', name: 'Hair Mask', price: 50000 }],
    },
    {
      id: 'b2', bookingCode: 'RB-2025-002', date: today, timeSlot: '09:00',
      stylistName: 'Fajar Santoso', stylistInitials: 'FS', stylistColor: '#ddedf8',
      customerName: 'Budi Santoso', customerPhone: '082345678901',
      serviceName: 'Color Treatment', categoryName: 'Colour',
      price: 300000, duration: 75, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL', visitorType: 'WALK_IN',
    },
    {
      id: 'b3', bookingCode: 'RB-2025-003', date: today, timeSlot: '10:30',
      stylistName: 'Rina Kusuma', stylistInitials: 'RK', stylistColor: '#eddde9',
      customerName: 'Dewi Lestari', customerPhone: '083456789012',
      serviceName: 'Facial Basic', categoryName: 'Face',
      price: 150000, duration: 60, status: 'COMPLETED', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT', visitorType: 'BOOKING',
      treatmentNotes: 'Kulit sensitif, hindari produk beralkohol',
    },
    {
      id: 'b4', bookingCode: 'RB-2025-004', date: today, timeSlot: '10:30',
      stylistName: 'Budi Pratama', stylistInitials: 'BP', stylistColor: '#fef3c2',
      customerName: 'Anisa Putri', customerPhone: '084567890123',
      serviceName: 'Gel Manicure', categoryName: 'Nail',
      price: 120000, duration: 45, status: 'IN_PROGRESS', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT', visitorType: 'WALK_IN',
      addOns: [{ id: 'ao2', name: 'Nail Art', price: 30000 }, { id: 'ao3', name: 'Cuticle Treatment', price: 25000 }],
    },
    {
      id: 'b5', bookingCode: 'RB-2025-005', date: today, timeSlot: '12:00',
      stylistName: 'Dewi Rahayu', stylistInitials: 'DR', stylistColor: '#c8ede2',
      customerName: 'Maya Indah', customerPhone: '085678901234',
      serviceName: 'Balayage', categoryName: 'Colour',
      price: 450000, duration: 90, status: 'CONFIRMED', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT', visitorType: 'BOOKING',
    },
    {
      id: 'b6', bookingCode: 'RB-2025-006', date: today, timeSlot: '12:00',
      stylistName: 'Fajar Santoso', stylistInitials: 'FS', stylistColor: '#ddedf8',
      customerName: 'Rizky Fadli', customerPhone: '086789012345',
      serviceName: 'Keratin Treatment', categoryName: 'Hair',
      price: 500000, duration: 120, status: 'CONFIRMED', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT', visitorType: 'BOOKING',
    },
    {
      id: 'b7', bookingCode: 'RB-2025-007', date: today, timeSlot: '14:00',
      stylistName: 'Rina Kusuma', stylistInitials: 'RK', stylistColor: '#eddde9',
      customerName: 'Hana Wijaya', customerPhone: '087890123456',
      serviceName: 'Stone Massage', categoryName: 'Massage',
      price: 250000, duration: 60, status: 'CONFIRMED', paymentStatus: 'UNPAID', paymentType: null, visitorType: 'WALK_IN',
      treatmentNotes: '',
    },
    {
      id: 'b8', bookingCode: 'RB-2025-008', date: today, timeSlot: '14:00',
      stylistName: 'Budi Pratama', stylistInitials: 'BP', stylistColor: '#fef3c2',
      customerName: 'Citra Dewi', customerPhone: '088901234567',
      serviceName: 'Eyelash Extension', categoryName: 'Face',
      price: 200000, duration: 90, status: 'UPCOMING', paymentStatus: 'UNPAID', paymentType: null, visitorType: 'BOOKING',
    },
    {
      id: 'b9', bookingCode: 'RB-2025-009', date: today, timeSlot: '16:00',
      stylistName: 'Dewi Rahayu', stylistInitials: 'DR', stylistColor: '#c8ede2',
      customerName: 'Tari Susanti', customerPhone: '089012345678',
      serviceName: 'Ladies Hair Wash+Blowdry', categoryName: 'Hair',
      price: 100000, duration: 30, status: 'UPCOMING', paymentStatus: 'UNPAID', paymentType: null, visitorType: 'BOOKING',
    },
    {
      id: 'b10', bookingCode: 'RB-2025-010', date: today, timeSlot: '16:00',
      stylistName: 'Fajar Santoso', stylistInitials: 'FS', stylistColor: '#ddedf8',
      customerName: 'Eka Permata', customerPhone: '081123456789',
      serviceName: 'Nail Art Basic', categoryName: 'Nail',
      price: 80000, duration: 30, status: 'CANCELLED', paymentStatus: 'UNPAID', paymentType: null, visitorType: 'WALK_IN',
    },
    {
      id: 'b11', bookingCode: 'RB-2025-011', date: today, timeSlot: '08:00',
      stylistName: 'Dewi Rahayu', stylistInitials: 'DR', stylistColor: '#c8ede2',
      customerName: 'Laila Fitriani', customerPhone: '081311111111',
      serviceName: 'Balayage', categoryName: 'Colour',
      price: 450000, duration: 90, status: 'UPCOMING', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT', visitorType: 'BOOKING',
    },
    {
      id: 'b12', bookingCode: 'RB-2025-012', date: today, timeSlot: '08:30',
      stylistName: 'Rina Kusuma', stylistInitials: 'RK', stylistColor: '#eddde9',
      customerName: 'Nabila Zahra', customerPhone: '081322222222',
      serviceName: 'Eyelash Extension', categoryName: 'Face',
      price: 200000, duration: 90, status: 'UPCOMING', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT', visitorType: 'BOOKING',
    },
    {
      id: 'b13', bookingCode: 'RB-2025-013', date: today, timeSlot: '11:00',
      stylistName: 'Budi Pratama', stylistInitials: 'BP', stylistColor: '#fef3c2',
      customerName: 'Rahma Aulia', customerPhone: '081333333333',
      serviceName: 'Keratin Treatment', categoryName: 'Hair',
      price: 500000, duration: 120, status: 'UPCOMING', paymentStatus: 'PAID', paymentType: 'FULL', visitorType: 'BOOKING',
    },
    {
      id: 'b14', bookingCode: 'RB-2025-014', date: today, timeSlot: '11:30',
      stylistName: 'Fajar Santoso', stylistInitials: 'FS', stylistColor: '#ddedf8',
      customerName: 'Sinta Maharani', customerPhone: '081344444444',
      serviceName: 'Facial Basic', categoryName: 'Face',
      price: 150000, duration: 60, status: 'UPCOMING', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT', visitorType: 'BOOKING',
    },
    {
      id: 'b15', bookingCode: 'RB-2025-015', date: today, timeSlot: '13:00',
      stylistName: 'Dewi Rahayu', stylistInitials: 'DR', stylistColor: '#c8ede2',
      customerName: 'Putri Ramadhani', customerPhone: '081355555555',
      serviceName: 'Gel Manicure', categoryName: 'Nail',
      price: 120000, duration: 45, status: 'UPCOMING', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT', visitorType: 'BOOKING',
    },
    {
      id: 'b16', bookingCode: 'RB-2025-016', date: today, timeSlot: '13:30',
      stylistName: 'Rina Kusuma', stylistInitials: 'RK', stylistColor: '#eddde9',
      customerName: 'Dinda Kusuma', customerPhone: '081366666666',
      serviceName: 'Ladies Haircut+Wash', categoryName: 'Hair',
      price: 180000, duration: 45, status: 'UPCOMING', paymentStatus: 'PAID', paymentType: 'FULL', visitorType: 'BOOKING',
    },
    {
      id: 'b17', bookingCode: 'RB-2025-017', date: today, timeSlot: '15:00',
      stylistName: 'Budi Pratama', stylistInitials: 'BP', stylistColor: '#fef3c2',
      customerName: 'Wulan Sari', customerPhone: '081377777777',
      serviceName: 'Stone Massage', categoryName: 'Massage',
      price: 250000, duration: 60, status: 'UPCOMING', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT', visitorType: 'BOOKING',
    },
    {
      id: 'b18', bookingCode: 'RB-2025-018', date: today, timeSlot: '15:30',
      stylistName: 'Fajar Santoso', stylistInitials: 'FS', stylistColor: '#ddedf8',
      customerName: 'Mega Pratiwi', customerPhone: '081388888888',
      serviceName: 'Color Treatment', categoryName: 'Colour',
      price: 300000, duration: 75, status: 'UPCOMING', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT', visitorType: 'BOOKING',
    },
  ], [today]);

  const pastBookings: DashboardBooking[] = useMemo(() => (([
    {
      id: 'p1', bookingCode: 'RB-2025-011', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), timeSlot: '09:00',
      stylistName: 'Dewi Rahayu', stylistInitials: 'DR', stylistColor: '#c8ede2',
      customerName: 'Nadia Putri', customerPhone: '081200000001',
      serviceName: 'Ladies Haircut', categoryName: 'Hair',
      price: 180000, duration: 45, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL',
    },
    {
      id: 'p2', bookingCode: 'RB-2025-012', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), timeSlot: '10:30',
      stylistName: 'Fajar Santoso', stylistInitials: 'FS', stylistColor: '#ddedf8',
      customerName: 'Sari Wulandari', customerPhone: '081200000002',
      serviceName: 'Color Treatment', categoryName: 'Colour',
      price: 300000, duration: 75, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL',
    },
    {
      id: 'p3', bookingCode: 'RB-2025-013', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), timeSlot: '12:00',
      stylistName: 'Rina Kusuma', stylistInitials: 'RK', stylistColor: '#eddde9',
      customerName: 'Fitri Handayani', customerPhone: '081200000003',
      serviceName: 'Facial Basic', categoryName: 'Face',
      price: 150000, duration: 60, status: 'COMPLETED', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT',
    },
    {
      id: 'p4', bookingCode: 'RB-2025-014', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), timeSlot: '14:00',
      stylistName: 'Budi Pratama', stylistInitials: 'BP', stylistColor: '#fef3c2',
      customerName: 'Yuni Kartika', customerPhone: '081200000004',
      serviceName: 'Gel Manicure', categoryName: 'Nail',
      price: 120000, duration: 45, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL',
    },
    {
      id: 'p5', bookingCode: 'RB-2025-015', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), timeSlot: '09:00',
      stylistName: 'Dewi Rahayu', stylistInitials: 'DR', stylistColor: '#c8ede2',
      customerName: 'Ratna Dewi', customerPhone: '081200000005',
      serviceName: 'Balayage', categoryName: 'Colour',
      price: 450000, duration: 90, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL',
    },
    {
      id: 'p6', bookingCode: 'RB-2025-016', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), timeSlot: '10:30',
      stylistName: 'Fajar Santoso', stylistInitials: 'FS', stylistColor: '#ddedf8',
      customerName: 'Ahmad Fauzi', customerPhone: '081200000006',
      serviceName: 'Stone Massage', categoryName: 'Massage',
      price: 250000, duration: 60, status: 'CANCELLED', paymentStatus: 'UNPAID', paymentType: null,
    },
    {
      id: 'p7', bookingCode: 'RB-2025-017', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), timeSlot: '12:00',
      stylistName: 'Rina Kusuma', stylistInitials: 'RK', stylistColor: '#eddde9',
      customerName: 'Intan Kusuma', customerPhone: '081200000007',
      serviceName: 'Keratin Treatment', categoryName: 'Hair',
      price: 500000, duration: 120, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL',
    },
    {
      id: 'p8', bookingCode: 'RB-2025-018', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), timeSlot: '09:00',
      stylistName: 'Dewi Rahayu', stylistInitials: 'DR', stylistColor: '#c8ede2',
      customerName: 'Linda Sari', customerPhone: '081200000008',
      serviceName: 'Eyelash Extension', categoryName: 'Face',
      price: 200000, duration: 90, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL',
    },
    {
      id: 'p9', bookingCode: 'RB-2025-019', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), timeSlot: '10:30',
      stylistName: 'Budi Pratama', stylistInitials: 'BP', stylistColor: '#fef3c2',
      customerName: 'Mega Wati', customerPhone: '081200000009',
      serviceName: 'Ladies Haircut', categoryName: 'Hair',
      price: 180000, duration: 45, status: 'COMPLETED', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT',
    },
    {
      id: 'p10', bookingCode: 'RB-2025-020', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), timeSlot: '12:00',
      stylistName: 'Fajar Santoso', stylistInitials: 'FS', stylistColor: '#ddedf8',
      customerName: 'Putri Ayu', customerPhone: '081200000010',
      serviceName: 'Nail Art Basic', categoryName: 'Nail',
      price: 80000, duration: 30, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL',
    },
    {
      id: 'p11', bookingCode: 'RB-2025-021', date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), timeSlot: '09:00',
      stylistName: 'Rina Kusuma', stylistInitials: 'RK', stylistColor: '#eddde9',
      customerName: 'Winda Sari', customerPhone: '081200000011',
      serviceName: 'Color Treatment', categoryName: 'Colour',
      price: 300000, duration: 75, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL',
    },
    {
      id: 'p12', bookingCode: 'RB-2025-022', date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), timeSlot: '14:00',
      stylistName: 'Dewi Rahayu', stylistInitials: 'DR', stylistColor: '#c8ede2',
      customerName: 'Zara Amelia', customerPhone: '081200000012',
      serviceName: 'Stone Massage', categoryName: 'Massage',
      price: 250000, duration: 60, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL',
    },
    {
      id: 'p13', bookingCode: 'RB-2025-023', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), timeSlot: '10:30',
      stylistName: 'Fajar Santoso', stylistInitials: 'FS', stylistColor: '#ddedf8',
      customerName: 'Hani Pratiwi', customerPhone: '081200000013',
      serviceName: 'Facial Basic', categoryName: 'Face',
      price: 150000, duration: 60, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL',
    },
    {
      id: 'p14', bookingCode: 'RB-2025-024', date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), timeSlot: '09:00',
      stylistName: 'Budi Pratama', stylistInitials: 'BP', stylistColor: '#fef3c2',
      customerName: 'Indah Permata', customerPhone: '081200000014',
      serviceName: 'Gel Manicure', categoryName: 'Nail',
      price: 120000, duration: 45, status: 'COMPLETED', paymentStatus: 'DEPOSIT', paymentType: 'DEPOSIT',
    },
    {
      id: 'p15', bookingCode: 'RB-2025-025', date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), timeSlot: '12:00',
      stylistName: 'Rina Kusuma', stylistInitials: 'RK', stylistColor: '#eddde9',
      customerName: 'Ayu Lestari', customerPhone: '081200000015',
      serviceName: 'Balayage', categoryName: 'Colour',
      price: 450000, duration: 90, status: 'COMPLETED', paymentStatus: 'PAID', paymentType: 'FULL',
    },
  ] as Omit<DashboardBooking, 'visitorType'>[]).map(b => ({ ...b, visitorType: 'BOOKING' as const }))), []);

  const stats: DashboardStats = useMemo(() => ({
    revenueToday: 750000,
    revenueDelta: 18,
    bookingsToday: 10,
    bookingsDelta: 2,
    avgRating: 4.8,
    completionRate: 33,
    activeStylists: 4,
    totalStylists: 4,
  }), [todayBookings]);

  const allBookings = useMemo(() => [...todayBookings, ...pastBookings], [todayBookings, pastBookings]);

  return { todayBookings, allBookings, stats, stylists };
}
