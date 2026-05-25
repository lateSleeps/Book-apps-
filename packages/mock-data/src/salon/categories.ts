import type { Category } from '@rara/types';

export const SALON_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Potong Rambut',
    description: 'Layanan potong rambut dengan berbagai gaya',
    icon: '✂️',
    color: '#FF6B6B',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'Coloring',
    description: 'Pewarnaan rambut profesional',
    icon: '🎨',
    color: '#4ECDC4',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-3',
    name: 'Perawatan Rambut',
    description: 'Spa rambut dan perawatan mendalam',
    icon: '💆‍♀️',
    color: '#45B7D1',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-4',
    name: 'Styling',
    description: 'Styling rambut untuk acara spesial',
    icon: '💇‍♀️',
    color: '#FFA07A',
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'cat-5',
    name: 'Perawatan Kulit Kepala',
    description: 'Treatment khusus untuk kesehatan kulit kepala',
    icon: '🧴',
    color: '#98D8C8',
    displayOrder: 5,
    isActive: true,
  },
];
