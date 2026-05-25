import type {
  SalonSettings,
  SalonProfile,
  ServiceCategory,
  Service,
  StaffMember,
  AddOnProduct,
} from '@/features/dashboard/types/settings.types';

const mockProfile: SalonProfile = {
  id: 'salon-001',
  name: 'Rara Beauty',
  email: 'info@rarabeauty.com',
  phone: '+62812-3456-7890',
  address: 'Jl. Merdeka No. 123',
  city: 'Jakarta',
  bankAccount: '1234567890',
  taxId: '12.345.678.9-012.000',
  establishedYear: 2018,
};

const mockCategories: ServiceCategory[] = [
  {
    id: 'cat-001',
    name: 'Hair',
    icon: '✂️',
    description: 'Hair cutting and styling services',
  },
  {
    id: 'cat-002',
    name: 'Nails',
    icon: '💅',
    description: 'Manicure and pedicure services',
  },
  {
    id: 'cat-003',
    name: 'Facial',
    icon: '✨',
    description: 'Face treatment and skincare',
  },
  {
    id: 'cat-004',
    name: 'Spa & Massage',
    icon: '💆',
    description: 'Massage and spa services',
  },
];

const mockServices: Service[] = [
  // Hair Services
  {
    id: 'svc-001',
    name: 'Ladies Haircut + Wash',
    categoryId: 'cat-001',
    price: 85000,
    duration: 60,
    description: 'Professional haircut with washing and styling',
    isActive: true,
  },
  {
    id: 'svc-002',
    name: 'Men Haircut',
    categoryId: 'cat-001',
    price: 50000,
    duration: 30,
    description: 'Classic men haircut',
    isActive: true,
  },
  {
    id: 'svc-003',
    name: 'Balayage',
    categoryId: 'cat-001',
    price: 450000,
    duration: 180,
    description: 'Hand-painted hair coloring technique',
    isActive: true,
  },
  {
    id: 'svc-004',
    name: 'Color Treatment',
    categoryId: 'cat-001',
    price: 300000,
    duration: 120,
    description: 'Hair coloring service',
    isActive: true,
  },
  {
    id: 'svc-005',
    name: 'Keratin Treatment',
    categoryId: 'cat-001',
    price: 400000,
    duration: 150,
    description: 'Smoothing treatment for hair',
    isActive: true,
  },
  // Nails Services
  {
    id: 'svc-006',
    name: 'Gel Manicure',
    categoryId: 'cat-002',
    price: 150000,
    duration: 60,
    description: 'Long-lasting gel nail polish',
    isActive: true,
  },
  {
    id: 'svc-007',
    name: 'Gel Pedicure',
    categoryId: 'cat-002',
    price: 150000,
    duration: 60,
    description: 'Gel polish for toenails',
    isActive: true,
  },
  {
    id: 'svc-008',
    name: 'Eyelash Extension',
    categoryId: 'cat-002',
    price: 200000,
    duration: 90,
    description: 'Professional eyelash extensions',
    isActive: true,
  },
  // Facial Services
  {
    id: 'svc-009',
    name: 'Facial Basic',
    categoryId: 'cat-003',
    price: 150000,
    duration: 60,
    description: 'Basic facial treatment with cleansing and moisturizing',
    isActive: true,
  },
  {
    id: 'svc-010',
    name: 'Facial Premium',
    categoryId: 'cat-003',
    price: 300000,
    duration: 90,
    description: 'Premium facial with special treatments',
    isActive: true,
  },
  // Spa Services
  {
    id: 'svc-011',
    name: 'Stone Massage',
    categoryId: 'cat-004',
    price: 250000,
    duration: 60,
    description: 'Relaxing massage with hot stones',
    isActive: true,
  },
];

const mockStaff: StaffMember[] = [
  {
    id: 'staff-001',
    name: 'Luna Sari',
    role: 'STYLIST',
    phone: '081234567890',
    email: 'luna@rara.com',
    joinDate: '2020-03-15',
    status: 'ACTIVE',
    color: '#e0eeff',
    initials: 'LS',
    serviceIds: ['svc-001', 'svc-003', 'svc-004', 'svc-005'],
    availability: {
      monday: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '18:00' },
      ],
      tuesday: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '18:00' },
      ],
      wednesday: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '18:00' },
      ],
      thursday: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '18:00' },
      ],
      friday: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '18:00' },
      ],
      saturday: [
        { start: '10:00', end: '13:00' },
        { start: '14:00', end: '19:00' },
      ],
      sunday: [],
    },
    recurringBreaks: [
      {
        id: 'break-001',
        name: 'Lunch',
        startTime: '12:00',
        endTime: '13:00',
        daysOfWeek: [1, 2, 3, 4, 5, 6],
      },
    ],
    holidaysOff: [],
  },
  {
    id: 'staff-002',
    name: 'Maya Indah',
    role: 'NAIL_ARTIST',
    phone: '081234567891',
    email: 'maya@rara.com',
    joinDate: '2021-06-10',
    status: 'ACTIVE',
    color: '#fde8ec',
    initials: 'MI',
    serviceIds: ['svc-006', 'svc-007', 'svc-008'],
    availability: {
      monday: [
        { start: '10:00', end: '13:00' },
        { start: '14:00', end: '19:00' },
      ],
      tuesday: [
        { start: '10:00', end: '13:00' },
        { start: '14:00', end: '19:00' },
      ],
      wednesday: [
        { start: '10:00', end: '13:00' },
        { start: '14:00', end: '19:00' },
      ],
      thursday: [
        { start: '10:00', end: '13:00' },
        { start: '14:00', end: '19:00' },
      ],
      friday: [
        { start: '10:00', end: '13:00' },
        { start: '14:00', end: '19:00' },
      ],
      saturday: [
        { start: '11:00', end: '14:00' },
        { start: '15:00', end: '20:00' },
      ],
      sunday: [],
    },
    recurringBreaks: [
      {
        id: 'break-002',
        name: 'Lunch',
        startTime: '13:00',
        endTime: '14:00',
        daysOfWeek: [1, 2, 3, 4, 5, 6],
      },
    ],
    holidaysOff: [],
  },
  {
    id: 'staff-003',
    name: 'Dina Kusuma',
    role: 'THERAPIST',
    phone: '081234567892',
    email: 'dina@rara.com',
    joinDate: '2022-01-20',
    status: 'ACTIVE',
    color: '#e0f5e9',
    initials: 'DK',
    serviceIds: ['svc-009', 'svc-010', 'svc-011'],
    availability: {
      monday: [
        { start: '08:00', end: '12:00' },
        { start: '13:00', end: '17:00' },
      ],
      tuesday: [
        { start: '08:00', end: '12:00' },
        { start: '13:00', end: '17:00' },
      ],
      wednesday: [
        { start: '08:00', end: '12:00' },
        { start: '13:00', end: '17:00' },
      ],
      thursday: [
        { start: '08:00', end: '12:00' },
        { start: '13:00', end: '17:00' },
      ],
      friday: [
        { start: '08:00', end: '12:00' },
        { start: '13:00', end: '17:00' },
      ],
      saturday: [
        { start: '09:00', end: '13:00' },
        { start: '14:00', end: '18:00' },
      ],
      sunday: [],
    },
    recurringBreaks: [
      {
        id: 'break-003',
        name: 'Lunch',
        startTime: '12:00',
        endTime: '13:00',
        daysOfWeek: [1, 2, 3, 4, 5, 6],
      },
    ],
    holidaysOff: [],
  },
];

const mockAddOns: AddOnProduct[] = [
  {
    id: 'addon-001',
    name: 'Premium Treatment Serum',
    price: 50000,
    description: 'Special serum for enhanced hair treatment',
    category: 'Hair',
    isActive: true,
  },
  {
    id: 'addon-002',
    name: 'Hair Mask Treatment',
    price: 30000,
    description: 'Intensive hair mask after service',
    category: 'Hair',
    isActive: true,
  },
  {
    id: 'addon-003',
    name: 'Nail Art Design',
    price: 50000,
    description: 'Custom nail art design',
    category: 'Nails',
    isActive: true,
  },
  {
    id: 'addon-004',
    name: 'Gel Removal',
    price: 25000,
    description: 'Safe removal of gel nails',
    category: 'Nails',
    isActive: true,
  },
  {
    id: 'addon-005',
    name: 'Face Mask Upgrade',
    price: 40000,
    description: 'Premium face mask treatment',
    category: 'Facial',
    isActive: true,
  },
];

export const mockSalonSettings: SalonSettings = {
  profile: mockProfile,
  serviceCategories: mockCategories,
  services: mockServices,
  staff: mockStaff,
  addOns: mockAddOns,
};
