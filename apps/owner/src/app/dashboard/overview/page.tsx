'use client';

import {
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  CheckCircleIcon,
  UserIcon,
  CogIcon,
} from '@heroicons/react/24/solid';
import {
  CaretDown,
  Trash,
  Users,
  CheckCircle,
  XCircle,
  TrendUp,
  PersonSimpleWalk,
  CalendarCheck,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useMemo, useState, useEffect, useRef } from 'react';
import { SkeletonRow } from '@/components/SkeletonLoader';
import { useDashboardData } from '@/features/dashboard/hooks/use-dashboard-data';
import type { AddOn } from '@/features/dashboard/types/dashboard.types';
import { useServices } from '@/hooks/useServices';
import { useStylists } from '@/hooks/useStylists';
import { trpc } from '@/lib/trpc';
import { buildWAMessage } from '@/lib/wa-message';
import type { WaBookingData } from '@/lib/wa-message';
import { formatRupiah } from '@/shared/lib/format';

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const AVATAR_BG_COLORS = [
  '#D1FAE5', // mint green
  '#DBEAFE', // soft blue
  '#FEF3C7', // soft amber
  '#FECACA', // soft coral
  '#E9D5FF', // soft lavender
  '#FFEDD5', // soft peach
  '#CCFBF1', // soft teal
  '#FEE2E2', // soft rose
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bg = AVATAR_BG_COLORS[Math.abs(hash) % AVATAR_BG_COLORS.length]!;
  return { bg, text: '#1C1C1E' };
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return (words[0]?.[0] ?? '').toUpperCase();
  return ((words[0]?.[0] ?? '') + (words[words.length - 1]?.[0] ?? '')).toUpperCase();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function formatCompactRupiah(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'K';
  }
  return value.toString();
}

const STATUS_DOT: Record<string, string> = {
  UPCOMING: '#a3a3a3',
  CONFIRMED: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
  NO_SHOW: '#a3a3a3',
};

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'Menunggu',
  CONFIRMED: 'Terkonfirmasi',
  IN_PROGRESS: 'Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  NO_SHOW: 'Tidak Hadir',
};

type VisitorTab = 'ALL' | 'BOOKING' | 'WALK_IN' | 'COMPLETED';

// ─── Mock data "from Settings" ───────────────────────────────────────────────
interface MockService {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  duration: number;
}
interface MockProduct {
  id: string;
  name: string;
  price: number;
}

const MOCK_SERVICES: MockService[] = [
  { id: 'sv1', name: 'Ladies Haircut', categoryName: 'Hair', price: 150000, duration: 30 },
  { id: 'sv2', name: 'Ladies Haircut+Wash', categoryName: 'Hair', price: 180000, duration: 45 },
  {
    id: 'sv3',
    name: 'Ladies Hair Wash+Blowdry',
    categoryName: 'Hair',
    price: 100000,
    duration: 30,
  },
  { id: 'sv4', name: 'Keratin Treatment', categoryName: 'Hair', price: 500000, duration: 120 },
  { id: 'sv5', name: 'Color Treatment', categoryName: 'Colour', price: 300000, duration: 75 },
  { id: 'sv6', name: 'Balayage', categoryName: 'Colour', price: 450000, duration: 90 },
  { id: 'sv7', name: 'Facial Basic', categoryName: 'Face', price: 150000, duration: 60 },
  { id: 'sv8', name: 'Eyelash Extension', categoryName: 'Face', price: 200000, duration: 90 },
  { id: 'sv9', name: 'Gel Manicure', categoryName: 'Nail', price: 120000, duration: 45 },
  { id: 'sv10', name: 'Nail Art Basic', categoryName: 'Nail', price: 80000, duration: 30 },
  { id: 'sv11', name: 'Stone Massage', categoryName: 'Massage', price: 250000, duration: 60 },
  {
    id: 'sv12',
    name: 'Aromatherapy Massage',
    categoryName: 'Massage',
    price: 200000,
    duration: 60,
  },
];

const MOCK_PRODUCTS: MockProduct[] = [
  { id: 'pr1', name: 'Hair Mask', price: 50000 },
  { id: 'pr2', name: 'Scalp Treatment', price: 75000 },
  { id: 'pr3', name: 'Deep Conditioning', price: 60000 },
  { id: 'pr4', name: 'Nail Art', price: 30000 },
  { id: 'pr5', name: 'Cuticle Treatment', price: 25000 },
  { id: 'pr6', name: 'Paraffin Wax', price: 35000 },
  { id: 'pr7', name: 'Collagen Mask', price: 80000 },
  { id: 'pr8', name: 'Serum Treatment', price: 45000 },
];

type ServiceData = { serviceName: string; price: number; categoryName: string };

const PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number }> = {
  DISKON10: { type: 'percent', value: 10 },
  HEMAT50K: { type: 'fixed', value: 50000 },
  RARA20: { type: 'percent', value: 20 },
  MEMBER15: { type: 'percent', value: 15 },
};

const SALON_ID = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyService = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStylist = any;

export default function OverviewPage() {
  const { upcomingBookings, allBookings, stats, stylists } = useDashboardData();
  const { services: realServices } = useServices(SALON_ID);
  const { stylists: realStylists } = useStylists(SALON_ID);
  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      utils.bookings.getBySalon.invalidate();
    },
  });
  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: () => {
      utils.bookings.getBySalon.invalidate();
    },
  });
  const processPaymentMutation = trpc.bookings.processPayment.useMutation({
    onSuccess: (_data, variables) => {
      setPaymentStatusMap((m) => ({ ...m, [variables.bookingId]: 'PAID' }));
      setBookingStatusMap((m) => ({ ...m, [variables.bookingId]: 'COMPLETED' }));
      utils.bookings.getBySalon.invalidate();
    },
  });
  const [greeting, setGreeting] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [visitorTab, setVisitorTab] = useState<VisitorTab>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [loadingBookingId, setLoadingBookingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    bookingId: string;
    customerName: string;
  } | null>(null);
  const [manualBookings, setManualBookings] = useState<
    import('@/features/dashboard/types/dashboard.types').DashboardBooking[]
  >([
    {
      id: 'dummy-1',
      bookingCode: 'BK-D001',
      customerName: 'Siti Rahayu',
      customerPhone: '081234561001',
      serviceName: 'Haircut & Blow Dry',
      categoryName: 'Hair',
      stylistName: 'Maya Putri',
      stylistInitials: 'MP',
      stylistColor: '#FF6B9D',
      date: new Date().toISOString().slice(0, 10),
      timeSlot: '09:00:00',
      endTime: '10:00:00',
      duration: 60,
      price: 85000,
      status: 'CONFIRMED',
      visitorType: 'BOOKING',
      paymentStatus: 'DEPOSIT',
      addOns: [],
      notes: '',
    },
    {
      id: 'dummy-2',
      bookingCode: 'BK-D002',
      customerName: 'Dewi Kusuma',
      customerPhone: '081234561002',
      serviceName: 'Make Up Natural',
      categoryName: 'Make Up',
      stylistName: 'Maya Putri',
      stylistInitials: 'MP',
      stylistColor: '#FF6B9D',
      date: new Date().toISOString().slice(0, 10),
      timeSlot: '10:00:00',
      endTime: '11:00:00',
      duration: 60,
      price: 200000,
      status: 'UPCOMING',
      visitorType: 'BOOKING',
      paymentStatus: 'DEPOSIT',
      addOns: [],
      notes: '',
    },
    {
      id: 'dummy-3',
      bookingCode: 'WI-D003',
      customerName: 'Rina Marlina',
      customerPhone: '081234561003',
      serviceName: 'Creambath',
      categoryName: 'Hair',
      stylistName: 'Maya Putri',
      stylistInitials: 'MP',
      stylistColor: '#FF6B9D',
      date: new Date().toISOString().slice(0, 10),
      timeSlot: '11:00:00',
      endTime: '12:00:00',
      duration: 60,
      price: 120000,
      status: 'IN_PROGRESS',
      visitorType: 'WALK_IN',
      paymentStatus: 'UNPAID',
      addOns: [],
      notes: 'Walk-in',
    },
    {
      id: 'dummy-4',
      bookingCode: 'WI-D004',
      customerName: 'Aulia Putri',
      customerPhone: '081234561004',
      serviceName: 'Facial Basic',
      categoryName: 'Face',
      stylistName: 'Maya Putri',
      stylistInitials: 'MP',
      stylistColor: '#FF6B9D',
      date: new Date().toISOString().slice(0, 10),
      timeSlot: '13:00:00',
      endTime: '14:00:00',
      duration: 60,
      price: 150000,
      status: 'CONFIRMED',
      visitorType: 'WALK_IN',
      paymentStatus: 'UNPAID',
      addOns: [],
      notes: 'Walk-in',
    },
    {
      id: 'dummy-5',
      bookingCode: 'BK-D005',
      customerName: 'Nisa Amalia',
      customerPhone: '081234561005',
      serviceName: 'Keratin Treatment',
      categoryName: 'Hair',
      stylistName: 'Maya Putri',
      stylistInitials: 'MP',
      stylistColor: '#FF6B9D',
      date: new Date().toISOString().slice(0, 10),
      timeSlot: '14:00:00',
      endTime: '16:00:00',
      duration: 120,
      price: 350000,
      status: 'COMPLETED',
      visitorType: 'BOOKING',
      paymentStatus: 'PAID',
      addOns: [],
      notes: '',
    },
    {
      id: 'dummy-6',
      bookingCode: 'BK-D006',
      customerName: 'Mega Wulandari',
      customerPhone: '081234561006',
      serviceName: 'Nail Art',
      categoryName: 'Nail',
      stylistName: 'Maya Putri',
      stylistInitials: 'MP',
      stylistColor: '#FF6B9D',
      date: new Date().toISOString().slice(0, 10),
      timeSlot: '15:00:00',
      endTime: '16:00:00',
      duration: 60,
      price: 95000,
      status: 'UPCOMING',
      visitorType: 'BOOKING',
      paymentStatus: 'DEPOSIT',
      addOns: [],
      notes: '',
    },
    {
      id: 'dummy-7',
      bookingCode: 'WI-D007',
      customerName: 'Fitri Handayani',
      customerPhone: '081234561007',
      serviceName: 'Body Massage',
      categoryName: 'Massage',
      stylistName: 'Maya Putri',
      stylistInitials: 'MP',
      stylistColor: '#FF6B9D',
      date: new Date().toISOString().slice(0, 10),
      timeSlot: '16:00:00',
      endTime: '17:00:00',
      duration: 60,
      price: 180000,
      status: 'CONFIRMED',
      visitorType: 'WALK_IN',
      paymentStatus: 'UNPAID',
      addOns: [],
      notes: 'Walk-in',
    },
  ]);
  const [addOnsMap, setAddOnsMap] = useState<Record<string, AddOn[]>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [serviceMap, setServiceMap] = useState<Record<string, ServiceData>>({});
  const [additionalServicesMap, setAdditionalServicesMap] = useState<Record<string, ServiceData[]>>(
    {}
  );
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [showServicePicker, setShowServicePicker] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState<string | null>(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [promoInputMap, setPromoInputMap] = useState<Record<string, string>>({});
  const [promoMap, setPromoMap] = useState<
    Record<string, { discount: number; error: string; appliedCode: string }>
  >({});
  const [paymentAmountMap, setPaymentAmountMap] = useState<Record<string, string>>({});
  const [paymentMethodMap, setPaymentMethodMap] = useState<
    Record<string, 'CASH' | 'TRANSFER' | 'QRIS'>
  >({});
  const [bookingStatusMap, setBookingStatusMap] = useState<
    Record<string, import('@/features/dashboard/types/dashboard.types').BookingStatus>
  >({});
  const [paymentStatusMap, setPaymentStatusMap] = useState<
    Record<string, 'PAID' | 'DEPOSIT' | 'UNPAID'>
  >({});
  const [confirmDialog, setConfirmDialog] = useState<{
    bookingId: string;
    customerName: string;
    serviceName: string;
    amount: number;
    method: string;
    finalTotal: number;
  } | null>(null);
  const [declineDialog, setDeclineDialog] = useState<{
    bookingId: string;
    customerName: string;
    reason: string;
  } | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [paymentError, setPaymentError] = useState<{ bookingId: string; message: string } | null>(
    null
  );
  const [proofZoom, setProofZoom] = useState<string | null>(null);
  const [pelunasanProofMap, setPelunasanProofMap] = useState<
    Record<string, { file: File; preview: string } | null>
  >({});
  const [uploadingProof, setUploadingProof] = useState(false);
  const [visitorSearch, setVisitorSearch] = useState('');
  const [mobileSelectedId, setMobileSelectedId] = useState<string | null>(null);
  const [addDrawer, setAddDrawer] = useState<'CLOSED' | 'WALK_IN' | 'BOOKING'>('CLOSED');
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    name: '',
    phone: '',
    serviceId: '',
    stylistId: '',
  });
  const [bookingCodeInput, setBookingCodeInput] = useState('');
  const [drawerServiceSearch, setDrawerServiceSearch] = useState('');
  const [barcodeScannerActive, setBarcodeScannerActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [drawerServiceOpen, setDrawerServiceOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [lastActionTime, setLastActionTime] = useState<number>(0);
  const [showWANotif, setShowWANotif] = useState(false);
  const [waBookingData, setWaBookingData] = useState<WaBookingData | null>(null);

  useEffect(() => {
    setGreeting(getGreeting());
    const d = new Date();
    setDateLabel(
      `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
    );

    // Check if mobile on mount and on resize
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Barcode scanner
  const startBarcodeScanner = async () => {
    // Guard: prevent multiple simultaneous scanners
    if (scannerIntervalRef.current || barcodeScannerActive) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setBarcodeScannerActive(true);

        // Start scanning loop
        scannerIntervalRef.current = setInterval(() => {
          if (
            canvasRef.current &&
            videoRef.current &&
            videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
          ) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.drawImage(
                videoRef.current,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
              );

              // Simple barcode detection
              const detected = detectBarcodePattern();
              if (detected) {
                setBookingCodeInput(detected);
                stopBarcodeScanner();
              }
            }
          }
        }, 100);
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      alert('Tidak bisa akses camera. Pastikan izin camera sudah diberikan.');
    }
  };

  const stopBarcodeScanner = () => {
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
      scannerIntervalRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setBarcodeScannerActive(false);
  };

  const detectBarcodePattern = (): string | null => {
    if (!canvasRef.current) return null;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const data = imageData.data;

    // Convert to grayscale
    const grayscale: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const gray = (r + g + b) / 3;
      grayscale.push(gray > 127 ? 1 : 0);
    }

    // Scan middle rows for barcode patterns
    const width = imageData.width;
    const height = imageData.height;
    const scanStartY = Math.floor(height * 0.35);
    const scanEndY = Math.floor(height * 0.65);
    const scanStartX = Math.floor(width * 0.1);
    const scanEndX = Math.floor(width * 0.9);

    for (let y = scanStartY; y < scanEndY; y++) {
      let transitionCount = 0;
      const rowStart = y * width;

      for (let x = scanStartX + 1; x < scanEndX; x++) {
        if (grayscale[rowStart + x] !== grayscale[rowStart + x - 1]) {
          transitionCount++;
        }
      }

      // Barcode typically has many transitions
      if (transitionCount > 30) {
        return `RB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      }
    }

    return null;
  };

  // Cleanup barcode scanner on unmount
  useEffect(() => {
    return () => {
      stopBarcodeScanner();
    };
  }, []);

  useEffect(() => {
    if (!upcomingBookings || upcomingBookings.length === 0) return;

    const aMap: Record<string, AddOn[]> = {};
    const nMap: Record<string, string> = {};
    const sMap: Record<string, ServiceData> = {};
    upcomingBookings.forEach((b) => {
      aMap[b.id] = b.addOns ? [...b.addOns] : [];
      nMap[b.id] = b.treatmentNotes ?? '';
      sMap[b.id] = { serviceName: b.serviceName, price: b.price, categoryName: b.categoryName };
    });
    setAddOnsMap(aMap);
    setNotesMap(nMap);
    setServiceMap(sMap);
  }, [upcomingBookings]);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
    setShowProductPicker(null);
    setEditServiceId(null);
    setShowServicePicker(null);
    setServiceSearchQuery('');
    setProductSearchQuery('');
  }

  function removeAddOn(bookingId: string, idx: number) {
    setAddOnsMap((prev) => ({
      ...prev,
      [bookingId]: prev[bookingId]?.filter((_, i) => i !== idx) ?? [],
    }));
  }

  function addProductToBooking(bookingId: string, product: MockProduct) {
    const newAo: AddOn = { id: `ao-${Date.now()}`, name: product.name, price: product.price };
    setAddOnsMap((prev) => ({ ...prev, [bookingId]: [...(prev[bookingId] ?? []), newAo] }));
    setShowProductPicker(null);
  }

  function changeService(bookingId: string, svc: MockService) {
    setServiceMap((prev) => ({
      ...prev,
      [bookingId]: { serviceName: svc.name, price: svc.price, categoryName: svc.categoryName },
    }));
    setEditServiceId(null);
  }

  function addService(bookingId: string, svc: MockService) {
    const newSvc: ServiceData = {
      serviceName: svc.name,
      price: svc.price,
      categoryName: svc.categoryName,
    };
    setAdditionalServicesMap((prev) => ({
      ...prev,
      [bookingId]: [...(prev[bookingId] ?? []), newSvc],
    }));
    setShowServicePicker(null);
  }

  function applyPromo(bookingId: string, subtotal: number) {
    const code = (promoInputMap[bookingId] ?? '').trim().toUpperCase();
    const promo = PROMO_CODES[code];
    if (!promo) {
      setPromoMap((p) => ({
        ...p,
        [bookingId]: { discount: 0, error: 'Kode promo tidak valid', appliedCode: '' },
      }));
      return;
    }
    const discount =
      promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;
    setPromoMap((p) => ({ ...p, [bookingId]: { discount, error: '', appliedCode: code } }));
  }

  function removePromo(bookingId: string) {
    setPromoMap((p) => ({ ...p, [bookingId]: { discount: 0, error: '', appliedCode: '' } }));
    setPromoInputMap((p) => ({ ...p, [bookingId]: '' }));
  }

  function removeAdditionalService(bookingId: string, idx: number) {
    setAdditionalServicesMap((prev) => ({
      ...prev,
      [bookingId]: prev[bookingId]?.filter((_, i) => i !== idx) ?? [],
    }));
  }

  const effectiveBookings = useMemo(
    () =>
      [...upcomingBookings, ...manualBookings]
        .map((b) => ({
          ...b,
          status: bookingStatusMap[b.id] ?? b.status,
          paymentStatus: paymentStatusMap[b.id] ?? b.paymentStatus,
        }))
        .filter(
          (b) =>
            !(b.visitorType === 'BOOKING' && b.paymentStatus === 'UNPAID') && !deletedIds.has(b.id)
        ),
    [upcomingBookings, manualBookings, bookingStatusMap, paymentStatusMap, deletedIds]
  );

  const filteredVisitors = useMemo(() => {
    let list = effectiveBookings;
    if (visitorTab === 'COMPLETED') list = list.filter((b) => b.status === 'COMPLETED');
    else if (visitorTab === 'BOOKING')
      list = list.filter((b) => b.visitorType === 'BOOKING' && b.paymentStatus !== 'UNPAID');
    else if (visitorTab !== 'ALL') list = list.filter((b) => b.visitorType === visitorTab);
    if (visitorSearch.trim()) {
      const q = visitorSearch.toLowerCase();
      list = list.filter(
        (b) => b.customerName.toLowerCase().includes(q) || b.customerPhone.includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      const aTime = a.createdAt ?? '';
      const bTime = b.createdAt ?? '';
      const cmp = bTime.localeCompare(aTime);
      return sortOrder === 'DESC' ? cmp : -cmp;
    });
    return list;
  }, [effectiveBookings, visitorTab, visitorSearch, sortOrder]);

  const visitorCounts = useMemo(
    () => ({
      ALL: effectiveBookings.length,
      BOOKING: effectiveBookings.filter(
        (b) => b.visitorType === 'BOOKING' && b.paymentStatus !== 'UNPAID'
      ).length,
      WALK_IN: effectiveBookings.filter((b) => b.visitorType === 'WALK_IN').length,
      COMPLETED: effectiveBookings.filter((b) => b.status === 'COMPLETED').length,
    }),
    [effectiveBookings]
  );

  const pendingConfirmCount = useMemo(
    () =>
      effectiveBookings.filter(
        (b) =>
          b.visitorType === 'BOOKING' &&
          (b.status === 'UPCOMING' || b.status === 'pending' || b.status === 'PENDING')
      ).length,
    [effectiveBookings]
  );

  return (
    <>
      <style suppressHydrationWarning>{`
      /* ═══════════════════════════════════════════════════════════════════ */
      /* ADDITIVE RESPONSIVE DESIGN - Mobile & Tablet Optimizations         */
      /* ═══════════════════════════════════════════════════════════════════ */

      /* TABLET: 768px - 1023px ─────────────────────────────────────────── */
      @media (max-width: 1023px) {
        /* Payment grid — better spacing on tablet */
        .payment-grid-tablet {
          gap: 2.5rem !important;
        }
      }

      /* MOBILE: up to 767px ────────────────────────────────────────────── */
      @media (max-width: 767px) {
        /* Expanded details — stack to single column on mobile */
        .expanded-details-mobile {
          grid-template-columns: 1fr !important;
        }

        /* Remove column separators on mobile */
        .expanded-col-separator {
          border-right: none !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }

        /* Padding cleanup on mobile — make more compact */
        .expanded-details-mobile > div > div {
          padding-bottom: 1rem !important;
          padding-right: 0 !important;
          padding-left: 0 !important;
        }

        /* Visitor row badges — better wrapping on mobile */
        .visitor-row-badges {
          flex-wrap: wrap !important;
          gap: 0.5rem !important;
        }

        /* Visitor row — reduce font sizes for mobile */
        .visitor-name-mobile {
          font-size: 0.8125rem !important;
        }

        .visitor-service-mobile {
          font-size: 0.75rem !important;
        }

        /* Tabs bar — better mobile spacing */
        .visitor-tabs-mobile {
          gap: 0.25rem !important;
        }

        /* Search bar — full width on mobile */
        .search-bar-mobile {
          flex: 1 !important;
          width: auto !important;
        }

        /* Sort + Search — stack on mobile */
        .visitor-header-controls {
          flex-direction: column !important;
          gap: 0.5rem !important;
        }

        .sort-button-mobile {
          width: 100% !important;
        }

        /* Payment input section — full width layout on mobile */
        .payment-section-mobile {
          grid-template-columns: 1fr !important;
        }

        /* Card col-span reset for mobile */
        .payment-status-card-mobile {
          col-span: 1 !important;
        }

        .payment-input-card-mobile {
          col-span: 1 !important;
        }

        /* Button groups — better mobile sizing */
        .button-group-mobile {
          gap: 0.5rem !important;
        }

        .button-group-mobile button {
          font-size: 0.75rem !important;
          padding: 0.5rem 0.75rem !important;
          height: auto !important;
        }

        /* Greeting section — adjust on mobile */
        .greeting-section-mobile {
          flex-direction: column !important;
          align-items: flex-start !important;
        }

        .greeting-text-mobile h1 {
          font-size: 1.125rem !important;
        }

        /* Collapse some text on mobile */
        .hide-on-mobile {
          display: none !important;
        }

        /* Make dropdowns more touch-friendly */
        .dropdown-item-mobile {
          padding: 0.75rem !important;
        }
      }
    `}</style>
      <div className="flex flex-1 flex-col overflow-y-auto" style={{ backgroundColor: '#F2F2F7' }}>
        <div className="flex w-full flex-col gap-5 px-4 py-5 sm:gap-7 sm:px-6 sm:py-7 md:gap-10 md:px-8 md:py-10">
          {/* Greeting */}
          <div className="flex flex-col gap-0">
            <div className="flex items-center justify-between gap-4 sm:gap-4">
              <h1 className="text-[1.25rem] font-semibold tracking-tight text-[#1C1C1E] sm:text-[1.5rem] md:text-[1.75rem]">
                {greeting || 'Halo'}, Rara ✦
              </h1>

              {/* Desktop button */}
              <div className="relative hidden flex-shrink-0 sm:block">
                <button
                  onClick={() => setAddDropdownOpen((o) => !o)}
                  className="flex h-10 w-auto items-center justify-start gap-2 rounded-xl bg-[#1a1a1a] px-4 text-[0.875rem] font-medium text-white transition-colors hover:bg-[#333]"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>Tambah Pelanggan</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${addDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>
                {addDropdownOpen && isMobile && (
                  <div className="fixed inset-0 z-30" onClick={() => setAddDropdownOpen(false)} />
                )}
                {addDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      zIndex: 40,
                      width: 220,
                      background: 'white',
                      borderRadius: 14,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                      overflow: 'hidden',
                      padding: 6,
                    }}
                  >
                    <button
                      onClick={() => {
                        setAddDrawer('WALK_IN');
                        setAddDropdownOpen(false);
                        setDrawerServiceOpen(false);
                        setDrawerServiceSearch('');
                      }}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F7')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <PersonSimpleWalk
                        size={20}
                        weight="duotone"
                        color="#1C1C1E"
                        style={{ flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1C1E', margin: 0 }}>
                          Walk-in
                        </p>
                        <p style={{ fontSize: 12, color: '#8E8E93', margin: 0 }}>Datang langsung</p>
                      </div>
                    </button>
                    <div style={{ height: 1, background: '#F2F2F7', margin: '2px 10px' }} />
                    <button
                      onClick={() => {
                        setAddDrawer('BOOKING');
                        setAddDropdownOpen(false);
                        setDrawerServiceOpen(false);
                        setDrawerServiceSearch('');
                      }}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F7')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <CalendarCheck
                        size={20}
                        weight="duotone"
                        color="#1C1C1E"
                        style={{ flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1C1E', margin: 0 }}>
                          Booking Online
                        </p>
                        <p style={{ fontSize: 12, color: '#8E8E93', margin: 0 }}>
                          Sudah punya kode booking
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Stats — 4 cards satu baris */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
              gap: 16,
              alignItems: 'stretch',
            }}
          >
            {/* Pendapatan */}
            <div
              className="relative overflow-hidden transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(145deg, #0071E3 0%, #3A9BFF 100%)',
                boxShadow: '0 8px 28px rgba(0,113,227,0.38)',
                borderRadius: 20,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Doodle — right side only */}
              <svg
                style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '55%' }}
                viewBox="0 0 200 160"
                fill="none"
                preserveAspectRatio="xMaxYMid meet"
              >
                {/* Big soft circle */}
                <circle cx="160" cy="40" r="55" fill="white" opacity="0.10" />
                <circle cx="185" cy="110" r="38" fill="white" opacity="0.08" />
                {/* Doodle rings */}
                <circle
                  cx="145"
                  cy="30"
                  r="18"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.18"
                  fill="none"
                  strokeDasharray="4 3"
                />
                <circle
                  cx="175"
                  cy="125"
                  r="12"
                  stroke="white"
                  strokeWidth="1.2"
                  opacity="0.15"
                  fill="none"
                  strokeDasharray="3 3"
                />
                {/* Wavy line */}
                <path
                  d="M80 90 Q100 75 120 90 Q140 105 160 90 Q180 75 200 90"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.20"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M95 110 Q115 95 135 110 Q155 125 175 110"
                  stroke="white"
                  strokeWidth="1"
                  opacity="0.12"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Small sparkle dots */}
                <circle cx="100" cy="30" r="2.5" fill="white" opacity="0.30" />
                <circle cx="190" cy="55" r="2" fill="white" opacity="0.25" />
                <circle cx="130" cy="140" r="2" fill="white" opacity="0.20" />
                <circle cx="165" cy="70" r="1.5" fill="white" opacity="0.22" />
                {/* Plus / cross doodle */}
                <line
                  x1="108"
                  y1="55"
                  x2="108"
                  y2="65"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.22"
                  strokeLinecap="round"
                />
                <line
                  x1="103"
                  y1="60"
                  x2="113"
                  y2="60"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.22"
                  strokeLinecap="round"
                />
                <line
                  x1="185"
                  y1="80"
                  x2="185"
                  y2="88"
                  stroke="white"
                  strokeWidth="1.2"
                  opacity="0.18"
                  strokeLinecap="round"
                />
                <line
                  x1="181"
                  y1="84"
                  x2="189"
                  y2="84"
                  stroke="white"
                  strokeWidth="1.2"
                  opacity="0.18"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.75)',
                      margin: 0,
                    }}
                  >
                    Pendapatan Hari Ini
                  </p>
                  <TrendUp size={26} weight="duotone" color="white" style={{ opacity: 0.85 }} />
                </div>
                <p style={{ lineHeight: 1, margin: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                    Rp{' '}
                  </span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>
                    <span className="sm:hidden">{formatCompactRupiah(stats.revenueToday)}</span>
                    <span className="hidden sm:inline">
                      {stats.revenueToday.toLocaleString('id-ID')}
                    </span>
                  </span>
                </p>
              </div>
              <p
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.88)',
                  margin: '12px 0 0',
                }}
              >
                Belum ada data pembanding kemarin.
              </p>
            </div>

            {/* Booking */}
            <div
              className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5EA',
                borderRadius: 20,
                padding: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: '#8E8E93',
                    margin: 0,
                  }}
                >
                  Booking Hari Ini
                </p>
                <Users size={26} weight="duotone" color="#007AFF" />
              </div>
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: '#1C1C1E',
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {String(stats.bookingsToday)}
              </p>
            </div>

            {/* Selesai */}
            <div
              className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5EA',
                borderRadius: 20,
                padding: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: '#8E8E93',
                    margin: 0,
                  }}
                >
                  Selesai
                </p>
                <CheckCircle size={26} weight="duotone" color="#34C759" />
              </div>
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: '#1C1C1E',
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {allBookings.filter((b) => b.status === 'COMPLETED').length}
              </p>
            </div>

            {/* Pembatalan */}
            <div
              className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5EA',
                borderRadius: 20,
                padding: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: '#8E8E93',
                    margin: 0,
                  }}
                >
                  Pembatalan
                </p>
                <XCircle size={26} weight="duotone" color="#FF3B30" />
              </div>
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: '#FF3B30',
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {allBookings.filter((b) => b.status === 'CANCELLED').length}
              </p>
            </div>
          </div>

          {/* Visitor list */}
          <div>
            {/* Schedule — Desktop view */}
            <div
              className="hidden flex-col overflow-hidden md:flex"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderRadius: 16,
                padding: '0 0 4px',
              }}
            >
              {/* Header — tabs + controls satu baris */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px 8px',
                }}
              >
                {/* Tabs — Segmented Control */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    borderRadius: 12,
                    padding: 4,
                    backgroundColor: '#F2F2F7',
                  }}
                >
                  {(
                    [
                      { key: 'ALL', label: 'Semua' },
                      { key: 'BOOKING', label: 'Booking' },
                      { key: 'WALK_IN', label: 'Datang Langsung' },
                      { key: 'COMPLETED', label: 'Selesai' },
                    ] as { key: VisitorTab; label: string }[]
                  ).map(({ key, label }) => {
                    const active = visitorTab === key;
                    const showBadge = key === 'BOOKING' && pendingConfirmCount > 0;
                    return (
                      <div key={key} style={{ position: 'relative' }}>
                        <button
                          onClick={() => setVisitorTab(key)}
                          style={{
                            whiteSpace: 'nowrap',
                            padding: '6px 14px',
                            borderRadius: 10,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: active ? 600 : 400,
                            transition: 'all 0.15s',
                            backgroundColor: active ? '#FFFFFF' : 'transparent',
                            color: active ? '#1C1C1E' : '#8E8E93',
                            boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                          }}
                        >
                          {label}
                          <span
                            style={{
                              marginLeft: 5,
                              fontSize: 11,
                              color: active ? '#8E8E93' : '#C7C7CC',
                            }}
                          >
                            {visitorCounts[key]}
                          </span>
                        </button>
                        {showBadge && (
                          <span className="animate-badge-shake pointer-events-none absolute -right-1.5 -top-2 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[0.625rem] font-bold text-white shadow-sm ring-2 ring-white">
                            {pendingConfirmCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Controls — sort + search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      height: 32,
                      padding: '0 12px',
                      borderRadius: 8,
                      background: '#F2F2F7',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#3C3C43',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {sortOrder === 'ASC' ? (
                        <>
                          <path d="M4 3v10M4 13l-2.5-3M4 13l2.5-3" />
                          <path d="M9 5h5M9 8h4M9 11h3" opacity="0.5" />
                        </>
                      ) : (
                        <>
                          <path d="M4 13V3M4 3l-2.5 3M4 3l2.5 3" />
                          <path d="M9 5h3M9 8h4M9 11h5" opacity="0.5" />
                        </>
                      )}
                    </svg>
                    {sortOrder === 'DESC' ? 'Terbaru' : 'Terlama'}
                  </button>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      height: 32,
                      padding: '0 10px',
                      borderRadius: 8,
                      background: '#F2F2F7',
                      width: 160,
                    }}
                  >
                    <MagnifyingGlassIcon
                      style={{ width: 13, height: 13, color: '#8E8E93', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      placeholder="Cari pelanggan..."
                      value={visitorSearch}
                      onChange={(e) => setVisitorSearch(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        fontSize: 12,
                        color: '#1C1C1E',
                      }}
                    />
                    {visitorSearch && (
                      <button
                        onClick={() => setVisitorSearch('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                        }}
                      >
                        <XMarkIcon style={{ width: 12, height: 12, color: '#8E8E93' }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Completed list */}
              {visitorTab === 'COMPLETED' && (
                <div className="mt-2">
                  {filteredVisitors.length === 0 ? (
                    <div className="px-4 py-10 text-center sm:px-6">
                      <p className="text-[0.875rem] text-[#555]">Belum ada yang selesai hari ini</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#f5f5f3]">
                      {filteredVisitors.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm sm:gap-4 sm:px-6 sm:py-3.5 sm:text-base"
                        >
                          {/* Avatar */}
                          <div
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-[0.8125rem] font-semibold"
                            style={{
                              backgroundColor: avatarColor(b.customerName).bg,
                              color: avatarColor(b.customerName).text,
                              borderRadius: 8,
                            }}
                          >
                            {getInitials(b.customerName)}
                          </div>
                          {/* Name + service */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[0.9375rem] font-semibold text-[#1a1a1a]">
                              {b.customerName}
                            </p>
                            <p className="truncate text-[0.8125rem] text-[#555]">
                              {b.serviceName} · {b.stylistName}
                            </p>
                          </div>
                          {/* Time */}
                          <span className="shrink-0 text-[0.875rem] tabular-nums text-gray-500">
                            {b.timeSlot}
                          </span>
                          {/* Payment badge */}
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[0.75rem] font-medium ${
                              b.paymentStatus === 'PAID'
                                ? 'bg-[#dcfce7] text-[#16a34a]'
                                : b.paymentStatus === 'DEPOSIT'
                                  ? 'bg-[#fef9c3] text-[#a16207]'
                                  : 'bg-[#f5f5f5] text-gray-500'
                            }`}
                          >
                            {b.paymentStatus === 'PAID'
                              ? 'Lunas'
                              : b.paymentStatus === 'DEPOSIT'
                                ? 'Deposit'
                                : 'Belum bayar'}
                          </span>
                          {/* Total */}
                          <p className="shrink-0 text-[0.9375rem] font-semibold tabular-nums text-[#1a1a1a]">
                            {formatRupiah(b.price)}
                          </p>
                          {/* Check icon */}
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                            <CheckIcon className="h-3 w-3 text-[#16a34a]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Active visitor list */}
              {visitorTab !== 'COMPLETED' && (
                <div className="mt-2">
                  {/* Table Header */}
                  {filteredVisitors.length > 0 && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 2fr 1.5fr 1fr 1.2fr',
                        padding: '10px 20px',
                        alignItems: 'center',
                        background: '#F7F7F8',
                        borderRadius: '12px 12px 0 0',
                      }}
                    >
                      {['Pelanggan', 'Status', 'Layanan', 'Stylist', 'Waktu', 'Tipe'].map(
                        (h, i) => (
                          <span
                            key={h}
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: '#8A8A8E',
                              display: 'flex',
                              alignItems: 'center',
                              position: 'relative',
                            }}
                          >
                            {i > 0 && (
                              <span
                                style={{
                                  position: 'absolute',
                                  left: -10,
                                  color: '#D1D1D6',
                                  fontWeight: 300,
                                  fontSize: 14,
                                  lineHeight: 1,
                                  userSelect: 'none',
                                }}
                              >
                                |
                              </span>
                            )}
                            {h}
                          </span>
                        )
                      )}
                    </div>
                  )}
                  {filteredVisitors.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <p className="text-[0.875rem] text-[#555]">Tidak ada pengunjung</p>
                    </div>
                  ) : (
                    filteredVisitors.map((b) => {
                      const isExpanded = expandedId === b.id;
                      const addOns = addOnsMap[b.id] ?? [];
                      const notes = notesMap[b.id] ?? '';
                      const currentService = serviceMap[b.id] ?? {
                        serviceName: b.serviceName,
                        price: b.price,
                        categoryName: b.categoryName,
                      };
                      const additionalServices = additionalServicesMap[b.id] ?? [];
                      const isTreatment =
                        ['Face', 'Massage'].includes(currentService.categoryName) ||
                        additionalServices.some((s) =>
                          ['Face', 'Massage'].includes(s.categoryName)
                        );
                      const totalPrice =
                        currentService.price +
                        additionalServices.reduce((s, sv) => s + sv.price, 0) +
                        addOns.reduce((s, a) => s + a.price, 0);
                      const waLink = `https://wa.me/62${b.customerPhone.replace(/^0/, '')}`;
                      const promoData = promoMap[b.id];
                      const discount = promoData?.discount ?? 0;
                      const finalTotal = totalPrice - discount;
                      // Products not yet added (avoid duplicates)
                      const addedNames = new Set(addOns.map((a) => a.name));
                      const availableProducts = MOCK_PRODUCTS.filter(
                        (p) => !addedNames.has(p.name)
                      );
                      // Services not yet added (main + additional, avoid duplicates)
                      const usedServiceNames = new Set([
                        currentService.serviceName,
                        ...additionalServices.map((s) => s.serviceName),
                      ]);
                      const availableServices = MOCK_SERVICES.filter(
                        (s) => !usedServiceNames.has(s.name)
                      );

                      const statusMeta: Record<
                        | 'UPCOMING'
                        | 'CONFIRMED'
                        | 'IN_PROGRESS'
                        | 'COMPLETED'
                        | 'CANCELLED'
                        | 'NO_SHOW',
                        { color: string; bg: string; label: string; icon: React.ReactNode }
                      > = {
                        UPCOMING: {
                          color: '#d97706',
                          bg: '#fffbeb',
                          label: 'Perlu Konfirmasi',
                          icon: (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <circle cx="4" cy="4" r="3.5" stroke="white" strokeWidth="1.1" />
                              <path
                                d="M4 2v2.2l1.2.8"
                                stroke="white"
                                strokeWidth="1.1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ),
                        },
                        pending: {
                          color: '#d97706',
                          bg: '#fffbeb',
                          label: 'Perlu Konfirmasi',
                          icon: (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <circle cx="4" cy="4" r="3.5" stroke="white" strokeWidth="1.1" />
                              <path
                                d="M4 2v2.2l1.2.8"
                                stroke="white"
                                strokeWidth="1.1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ),
                        },
                        PENDING: {
                          color: '#d97706',
                          bg: '#fffbeb',
                          label: 'Perlu Konfirmasi',
                          icon: (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <circle cx="4" cy="4" r="3.5" stroke="white" strokeWidth="1.1" />
                              <path
                                d="M4 2v2.2l1.2.8"
                                stroke="white"
                                strokeWidth="1.1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ),
                        },
                        CONFIRMED: {
                          color: '#2563eb',
                          bg: '#eff6ff',
                          label: 'Terkonfirmasi',
                          icon: (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path
                                d="M1.5 4l1.8 1.8 3.2-3.2"
                                stroke="white"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ),
                        },
                        IN_PROGRESS: {
                          color: '#16a34a',
                          bg: '#f0fdf4',
                          label: 'Berlangsung',
                          icon: (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M2.5 1.5l4 2.5-4 2.5V1.5z" fill="white" />
                            </svg>
                          ),
                        },
                        COMPLETED: {
                          color: '#9ca3af',
                          bg: '#f9fafb',
                          label: 'Selesai',
                          icon: null,
                        },
                        CANCELLED: {
                          color: '#ef4444',
                          bg: '#fef2f2',
                          label: 'Dibatalkan',
                          icon: null,
                        },
                        NO_SHOW: {
                          color: '#9ca3af',
                          bg: '#f9fafb',
                          label: 'Tidak Hadir',
                          icon: null,
                        },
                      };
                      const sm = statusMeta[b.status] ?? statusMeta.NO_SHOW;

                      if (loadingBookingId === b.id) {
                        return (
                          <div
                            key={b.id}
                            style={{
                              borderBottom: '1px solid #F2F2F7',
                              opacity: 0.4,
                              transition: 'opacity 0.3s',
                            }}
                          >
                            <SkeletonRow />
                          </div>
                        );
                      }

                      return (
                        <div
                          key={b.id}
                          style={{ borderBottom: '1px solid #EFEFEF' }}
                          className="last:border-0"
                        >
                          {/* Collapsed row — grid layout */}
                          <div
                            onClick={() => toggleExpand(b.id)}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 1fr 2fr 1.5fr 1fr 1.2fr',
                              padding: '14px 20px',
                              alignItems: 'center',
                              cursor: 'pointer',
                              transition: 'background 0.12s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F7F7F8')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            {/* PELANGGAN */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                minWidth: 0,
                              }}
                            >
                              <div
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 10,
                                  backgroundColor: avatarColor(b.customerName).bg,
                                  color: '#1C1C1E',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: getInitials(b.customerName).length > 1 ? 13 : 16,
                                  fontWeight: 600,
                                  flexShrink: 0,
                                }}
                              >
                                {getInitials(b.customerName)}
                              </div>
                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: 500,
                                  color: '#1C1C1E',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {b.customerName}
                              </span>
                            </div>
                            {/* STATUS (payment) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  backgroundColor:
                                    b.paymentStatus === 'PAID'
                                      ? '#34C759'
                                      : b.paymentStatus === 'DEPOSIT'
                                        ? '#FF9500'
                                        : '#8E8E93',
                                }}
                              />
                              <span
                                style={{
                                  fontSize: 13,
                                  color:
                                    b.paymentStatus === 'PAID'
                                      ? '#34C759'
                                      : b.paymentStatus === 'DEPOSIT'
                                        ? '#FF9500'
                                        : '#8E8E93',
                                }}
                              >
                                {b.paymentStatus === 'PAID'
                                  ? 'Lunas'
                                  : b.paymentStatus === 'DEPOSIT'
                                    ? 'DP'
                                    : 'Belum Bayar'}
                              </span>
                            </div>
                            {/* LAYANAN */}
                            <span
                              style={{
                                fontSize: 14,
                                color: '#3C3C43',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {b.serviceName}
                            </span>
                            {/* STYLIST */}
                            <span
                              style={{
                                fontSize: 14,
                                color: '#3C3C43',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {b.stylistName}
                            </span>
                            {/* WAKTU */}
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1E' }}>
                              {b.timeSlot}
                            </span>
                            {/* TIPE + trailing */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '4px 12px',
                                  borderRadius: 20,
                                  fontSize: 12,
                                  fontWeight: 500,
                                  backgroundColor:
                                    b.visitorType === 'WALK_IN' ? '#FFF3CD' : '#E3F2FD',
                                  color: b.visitorType === 'WALK_IN' ? '#856404' : '#1565C0',
                                  whiteSpace: 'nowrap',
                                  border: 'none',
                                }}
                              >
                                <span
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor:
                                      b.visitorType === 'WALK_IN' ? '#856404' : '#1565C0',
                                    flexShrink: 0,
                                  }}
                                />
                                {b.visitorType === 'WALK_IN' ? 'Walk-in' : 'Booking'}
                              </span>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 12,
                                  marginLeft: 'auto',
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({
                                      bookingId: b.id,
                                      customerName: b.customerName,
                                    });
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px 6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderRadius: 6,
                                  }}
                                  title="Hapus dari list"
                                >
                                  <Trash size={16} weight="duotone" color="#FF3B30" />
                                </button>
                                <CaretDown
                                  size={14}
                                  weight="duotone"
                                  color="#8E8E93"
                                  style={{
                                    flexShrink: 0,
                                    transform: isExpanded ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.15s',
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Expanded detail */}
                          {isExpanded && (
                            <div
                              className="relative flex min-h-[23rem] flex-col bg-[#fafaf8] px-3 pb-5 sm:px-6"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div
                                className="expanded-details-mobile grid grid-cols-1 gap-px border-t border-[#f0f0f0] pt-4 sm:grid-cols-2 md:grid-cols-3"
                                style={{
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                }}
                              >
                                {/* Col 1: Kontak */}
                                <div className="expanded-col-separator flex flex-col gap-3 border-b border-[#f0f0f0] pb-3 pr-0 sm:border-b sm:pb-3 sm:pr-0 md:border-b-0 md:border-l-0 md:border-r md:pb-0 md:pr-6">
                                  <div>
                                    <p
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        color: '#8E8E93',
                                        margin: '0 0 4px 0',
                                      }}
                                    >
                                      Nomor HP
                                    </p>
                                    <p className="text-[0.875rem] font-medium tabular-nums text-[#1a1a1a]">
                                      {b.customerPhone}
                                    </p>
                                  </div>
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'flex',
                                      height: 36,
                                      alignItems: 'center',
                                      gap: 6,
                                      alignSelf: 'flex-start',
                                      borderRadius: 10,
                                      padding: '0 14px',
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: 'white',
                                      backgroundColor: '#25d366',
                                      textDecoration: 'none',
                                      transition: 'opacity 0.15s',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <svg
                                      width="13"
                                      height="13"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Chat WA
                                  </a>

                                  {/* Bukti pembayaran — hanya untuk booking reguler (bukan walk-in) */}
                                  {b.visitorType !== 'WALK_IN' &&
                                    (b.status === 'UPCOMING' ||
                                      b.status === 'CONFIRMED' ||
                                      b.status === 'pending' ||
                                      b.status === 'PENDING' ||
                                      b.status === 'COMPLETED' ||
                                      b.status === 'completed' ||
                                      b.status === 'IN_PROGRESS') && (
                                      <div
                                        className="mt-1 flex flex-col gap-2"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <p
                                          style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            color: '#8E8E93',
                                            margin: 0,
                                          }}
                                        >
                                          Bukti Pembayaran
                                        </p>
                                        {/* Thumbnail bukti pembayaran — dari database */}
                                        {b.paymentProofUrl ? (
                                          <button
                                            onClick={() => setProofZoom(b.id)}
                                            className="group relative w-full overflow-hidden rounded-xl border border-[#e8e8e6] transition-colors hover:border-[#ccc]"
                                          >
                                            <img
                                              src={b.paymentProofUrl}
                                              alt="Bukti pembayaran"
                                              className="h-[7rem] w-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/10">
                                              <div className="rounded-full bg-black/50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                <MagnifyingGlassIcon className="h-3 w-3 text-white" />
                                              </div>
                                            </div>
                                          </button>
                                        ) : (
                                          <div className="flex h-[7rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#e0e0e0] bg-[#fafafa]">
                                            <svg
                                              width="20"
                                              height="20"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="#ccc"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            >
                                              <rect x="3" y="3" width="18" height="18" rx="2" />
                                              <circle cx="8.5" cy="8.5" r="1.5" />
                                              <path d="M21 15l-5-5L5 21" />
                                            </svg>
                                            <p className="text-[0.6875rem] text-gray-400">
                                              Belum ada bukti pembayaran
                                            </p>
                                          </div>
                                        )}

                                        {/* Tombol konfirmasi & decline — hanya saat UPCOMING */}
                                        {(b.status === 'UPCOMING' ||
                                          b.status === 'pending' ||
                                          b.status === 'PENDING') && (
                                          <div className="flex gap-2">
                                            <button
                                              onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const id = b.id;
                                                setBookingStatusMap((m) => ({
                                                  ...m,
                                                  [id]: 'CONFIRMED',
                                                }));
                                                setExpandedId(id);
                                                await updateStatusMutation.mutateAsync({
                                                  bookingId: id,
                                                  status: 'CONFIRMED',
                                                });
                                                setWaBookingData({
                                                  customerName: b.customerName,
                                                  customerPhone: b.customerPhone,
                                                  serviceName: b.serviceName,
                                                  date: b.date,
                                                  timeSlot: b.timeSlot,
                                                  bookingCode: b.bookingCode,
                                                });
                                                setShowWANotif(true);
                                              }}
                                              style={{
                                                display: 'flex',
                                                height: 36,
                                                flex: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 6,
                                                borderRadius: 10,
                                                background: '#2563eb',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: 'white',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s',
                                              }}
                                            >
                                              <CheckIcon className="h-3.5 w-3.5 text-white" />
                                              Konfirmasi
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setDeclineDialog({
                                                  bookingId: b.id,
                                                  customerName: b.customerName,
                                                  reason: '',
                                                });
                                                setDeclineReason('');
                                              }}
                                              style={{
                                                display: 'flex',
                                                height: 36,
                                                flex: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 6,
                                                borderRadius: 10,
                                                background: '#F9F9FB',
                                                border: '1px solid #E5E5EA',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s',
                                              }}
                                            >
                                              <svg
                                                width="13"
                                                height="13"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              >
                                                <path d="M3 3l10 10M13 3L3 13" />
                                              </svg>
                                              Tolak
                                            </button>
                                          </div>
                                        )}

                                        {/* Status confirmed — tampil di bawah gambar */}
                                        {b.status === 'CONFIRMED' && (
                                          <div
                                            style={{
                                              display: 'flex',
                                              height: 36,
                                              width: '100%',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: 6,
                                              borderRadius: 10,
                                              background: '#2563eb',
                                              fontSize: 13,
                                              fontWeight: 600,
                                              color: 'white',
                                            }}
                                          >
                                            <svg
                                              width="14"
                                              height="14"
                                              viewBox="0 0 16 16"
                                              fill="none"
                                              stroke="white"
                                              strokeWidth="2.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            >
                                              <path d="M3 8l3 3 7-7" />
                                            </svg>
                                            Terkonfirmasi
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>

                                {/* Col 2: Layanan + Pembayaran */}
                                <div className="expanded-col-separator flex flex-col gap-3 border-b border-[#f0f0f0] px-0 pb-3 pt-3 sm:border-b sm:px-3 sm:pb-3 sm:pt-3 md:border-b-0 md:border-l md:px-6 md:pb-0 md:pt-0">
                                  <div>
                                    <p
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        color: '#8E8E93',
                                        margin: '0 0 6px 0',
                                      }}
                                    >
                                      Layanan
                                    </p>
                                    {editServiceId === b.id ? (
                                      <div style={{ position: 'relative', zIndex: 20 }}>
                                        <div
                                          style={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            top: 0,
                                            background: 'white',
                                            borderRadius: 14,
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                                            overflow: 'hidden',
                                          }}
                                        >
                                          {/* Search bar */}
                                          <div
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 8,
                                              padding: '10px 12px',
                                              background: '#F2F2F7',
                                              margin: 8,
                                              borderRadius: 10,
                                            }}
                                          >
                                            <svg
                                              width="13"
                                              height="13"
                                              viewBox="0 0 16 16"
                                              fill="none"
                                              stroke="#8E8E93"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                            >
                                              <circle cx="7" cy="7" r="5" />
                                              <path d="M11 11l3 3" />
                                            </svg>
                                            <input
                                              autoFocus
                                              type="text"
                                              placeholder="Cari layanan..."
                                              value={serviceSearchQuery}
                                              onChange={(e) =>
                                                setServiceSearchQuery(e.target.value)
                                              }
                                              style={{
                                                flex: 1,
                                                background: 'transparent',
                                                border: 'none',
                                                outline: 'none',
                                                fontSize: 13,
                                                color: '#1C1C1E',
                                              }}
                                            />
                                            {serviceSearchQuery && (
                                              <button
                                                onClick={() => setServiceSearchQuery('')}
                                                style={{
                                                  background: '#C7C7CC',
                                                  border: 'none',
                                                  borderRadius: '50%',
                                                  width: 16,
                                                  height: 16,
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  cursor: 'pointer',
                                                  flexShrink: 0,
                                                  padding: 0,
                                                }}
                                              >
                                                <svg
                                                  width="8"
                                                  height="8"
                                                  viewBox="0 0 10 10"
                                                  fill="none"
                                                  stroke="white"
                                                  strokeWidth="2.5"
                                                  strokeLinecap="round"
                                                >
                                                  <path d="M2 2l6 6M8 2l-6 6" />
                                                </svg>
                                              </button>
                                            )}
                                          </div>
                                          {/* Results */}
                                          <div
                                            style={{
                                              maxHeight: 240,
                                              overflowY: 'auto',
                                              paddingBottom: 8,
                                            }}
                                          >
                                            {['Hair', 'Colour', 'Face', 'Nail', 'Massage'].map(
                                              (cat) => {
                                                const catServices = MOCK_SERVICES.filter(
                                                  (s) =>
                                                    s.categoryName === cat &&
                                                    s.name
                                                      .toLowerCase()
                                                      .includes(serviceSearchQuery.toLowerCase())
                                                );
                                                if (!catServices.length) return null;
                                                return (
                                                  <div key={cat}>
                                                    {!serviceSearchQuery && (
                                                      <p
                                                        style={{
                                                          fontSize: 11,
                                                          fontWeight: 600,
                                                          textTransform: 'uppercase',
                                                          letterSpacing: '0.08em',
                                                          color: '#8E8E93',
                                                          padding: '10px 16px 4px',
                                                          margin: 0,
                                                        }}
                                                      >
                                                        {cat}
                                                      </p>
                                                    )}
                                                    {catServices.map((svc) => {
                                                      const isActive =
                                                        currentService.serviceName === svc.name;
                                                      return (
                                                        <button
                                                          key={svc.id}
                                                          onClick={() => {
                                                            changeService(b.id, svc);
                                                            setServiceSearchQuery('');
                                                          }}
                                                          style={{
                                                            display: 'flex',
                                                            width: '100%',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '10px 16px',
                                                            border: 'none',
                                                            background: isActive
                                                              ? '#F0F4FF'
                                                              : 'transparent',
                                                            cursor: 'pointer',
                                                            textAlign: 'left',
                                                            transition: 'background 0.1s',
                                                          }}
                                                          onMouseEnter={(e) => {
                                                            if (!isActive)
                                                              e.currentTarget.style.background =
                                                                '#F5F5F7';
                                                          }}
                                                          onMouseLeave={(e) => {
                                                            if (!isActive)
                                                              e.currentTarget.style.background =
                                                                'transparent';
                                                          }}
                                                        >
                                                          <span
                                                            style={{
                                                              fontSize: 14,
                                                              fontWeight: isActive ? 600 : 400,
                                                              color: isActive
                                                                ? '#2563eb'
                                                                : '#1C1C1E',
                                                            }}
                                                          >
                                                            {svc.name}
                                                          </span>
                                                          <span
                                                            style={{
                                                              fontSize: 13,
                                                              color: '#8E8E93',
                                                              flexShrink: 0,
                                                              marginLeft: 12,
                                                            }}
                                                          >
                                                            {formatRupiah(svc.price)}
                                                          </span>
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                );
                                              }
                                            )}
                                            {MOCK_SERVICES.filter((s) =>
                                              s.name
                                                .toLowerCase()
                                                .includes(serviceSearchQuery.toLowerCase())
                                            ).length === 0 && (
                                              <p
                                                style={{
                                                  fontSize: 13,
                                                  color: '#8E8E93',
                                                  padding: '12px 16px',
                                                  margin: 0,
                                                }}
                                              >
                                                Layanan tidak ditemukan
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        {/* Main service */}
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <p className="text-[0.875rem] font-medium text-[#1a1a1a]">
                                              {currentService.serviceName}
                                            </p>
                                            <p className="mt-0.5 text-[0.875rem] text-[#555]">
                                              oleh {b.stylistName} ·{' '}
                                              {formatRupiah(currentService.price)}
                                            </p>
                                          </div>
                                          <button
                                            onClick={() => setEditServiceId(b.id)}
                                            className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#f0f0ee] text-gray-500 transition-colors hover:bg-[#e2e2df] hover:text-[#444]"
                                          >
                                            <svg
                                              width="14"
                                              height="14"
                                              viewBox="0 0 14 14"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="1.6"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            >
                                              <path d="M10 1.5l2.5 2.5-8 8H2v-2.5l8-8z" />
                                            </svg>
                                          </button>
                                        </div>

                                        {/* Additional services */}
                                        {additionalServices.map((sv, idx) => (
                                          <div
                                            key={idx}
                                            className="mt-2 flex items-center justify-between border-t border-[#f0f0f0] pt-2"
                                          >
                                            <div>
                                              <p className="text-[0.8125rem] font-medium text-[#1a1a1a]">
                                                {sv.serviceName}
                                              </p>
                                              <p className="text-[0.8125rem] text-[#555]">
                                                {formatRupiah(sv.price)}
                                              </p>
                                            </div>
                                            <button
                                              onClick={() => removeAdditionalService(b.id, idx)}
                                              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[#ccc] transition-colors hover:bg-[#fef2f2] hover:text-[#ef4444]"
                                            >
                                              <svg
                                                width="10"
                                                height="10"
                                                viewBox="0 0 10 10"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                              >
                                                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
                                              </svg>
                                            </button>
                                          </div>
                                        ))}

                                        {/* Add service picker */}
                                        {showServicePicker === b.id ? (
                                          <div className="relative z-20 mt-2">
                                            <div className="absolute left-0 right-0 top-0 overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                                              {/* Search */}
                                              <div className="flex items-center gap-2 border-b border-[#f0f0f0] px-3 py-2">
                                                <svg
                                                  width="13"
                                                  height="13"
                                                  viewBox="0 0 16 16"
                                                  fill="none"
                                                  stroke="#bbb"
                                                  strokeWidth="1.8"
                                                  strokeLinecap="round"
                                                >
                                                  <circle cx="7" cy="7" r="5" />
                                                  <path d="M11 11l3 3" />
                                                </svg>
                                                <input
                                                  autoFocus
                                                  type="text"
                                                  placeholder="Cari layanan..."
                                                  value={serviceSearchQuery}
                                                  onChange={(e) =>
                                                    setServiceSearchQuery(e.target.value)
                                                  }
                                                  className="flex-1 bg-transparent text-[0.8125rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none"
                                                />
                                                <button
                                                  onClick={() => {
                                                    setShowServicePicker(null);
                                                    setServiceSearchQuery('');
                                                  }}
                                                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[#ccc] transition-colors hover:text-[#888]"
                                                >
                                                  <svg
                                                    width="10"
                                                    height="10"
                                                    viewBox="0 0 10 10"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                  >
                                                    <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
                                                  </svg>
                                                </button>
                                              </div>
                                              {/* Results */}
                                              <div className="max-h-44 overflow-y-auto">
                                                {availableServices.filter((s) =>
                                                  s.name
                                                    .toLowerCase()
                                                    .includes(serviceSearchQuery.toLowerCase())
                                                ).length === 0 ? (
                                                  <p className="px-3 py-3 text-[0.875rem] text-[#555]">
                                                    Layanan tidak ditemukan
                                                  </p>
                                                ) : (
                                                  ['Hair', 'Colour', 'Face', 'Nail', 'Massage'].map(
                                                    (cat) => {
                                                      const catSvcs = availableServices.filter(
                                                        (s) =>
                                                          s.categoryName === cat &&
                                                          s.name
                                                            .toLowerCase()
                                                            .includes(
                                                              serviceSearchQuery.toLowerCase()
                                                            )
                                                      );
                                                      if (!catSvcs.length) return null;
                                                      return (
                                                        <div key={cat}>
                                                          {!serviceSearchQuery && (
                                                            <p className="px-3 pb-1 pt-2.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[#555]">
                                                              {cat}
                                                            </p>
                                                          )}
                                                          {catSvcs.map((svc) => (
                                                            <button
                                                              key={svc.id}
                                                              onClick={() => {
                                                                addService(b.id, svc);
                                                                setServiceSearchQuery('');
                                                              }}
                                                              className="flex w-full items-center justify-between border-b border-[#f9f9f9] px-3 py-2 text-left transition-colors last:border-0 hover:bg-[#fafaf8]"
                                                            >
                                                              <span className="text-[0.8125rem] text-[#333]">
                                                                {svc.name}
                                                              </span>
                                                              <span className="ml-2 flex-shrink-0 text-[0.8125rem] text-[#555]">
                                                                {formatRupiah(svc.price)}
                                                              </span>
                                                            </button>
                                                          ))}
                                                        </div>
                                                      );
                                                    }
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => setShowServicePicker(b.id)}
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              cursor: 'pointer',
                                              padding: 0,
                                              fontSize: 13,
                                              fontWeight: 500,
                                              color: '#007AFF',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 4,
                                              marginTop: 8,
                                            }}
                                          >
                                            <svg
                                              width="11"
                                              height="11"
                                              viewBox="0 0 12 12"
                                              fill="none"
                                              stroke="#007AFF"
                                              strokeWidth="2.5"
                                              strokeLinecap="round"
                                            >
                                              <path d="M6 1v10M1 6h10" />
                                            </svg>
                                            Tambah layanan
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Col 3: Add-ons + Catatan Terapis */}
                                <div className="expanded-col-separator flex flex-col gap-3 border-[#f0f0f0] pl-0 pt-3 sm:pl-3 sm:pt-3 md:border-l md:pl-6 md:pt-0">
                                  <div>
                                    <p
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        color: '#8E8E93',
                                        margin: '0 0 6px 0',
                                      }}
                                    >
                                      Product Add-on
                                    </p>
                                    {addOns.length === 0 && (
                                      <p className="mb-1 text-[0.875rem] text-gray-500">
                                        Belum ada add-on
                                      </p>
                                    )}
                                    {addOns.map((ao, i) => (
                                      <div
                                        key={ao.id}
                                        className="flex items-center justify-between border-b border-[#f5f5f5] py-1.5 last:border-0"
                                      >
                                        <span className="text-[0.8125rem] text-[#555]">
                                          {ao.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[0.875rem] font-medium text-[#444]">
                                            {formatRupiah(ao.price)}
                                          </span>
                                          <button
                                            onClick={() => removeAddOn(b.id, i)}
                                            className="flex h-5 w-5 items-center justify-center rounded-full text-[#ccc] transition-colors hover:bg-[#fef2f2] hover:text-[#ef4444]"
                                          >
                                            <svg
                                              width="10"
                                              height="10"
                                              viewBox="0 0 10 10"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="1.8"
                                              strokeLinecap="round"
                                            >
                                              <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    ))}

                                    {/* Product picker */}
                                    {showProductPicker === b.id ? (
                                      <div className="relative z-20 mt-2">
                                        <div className="absolute left-0 right-0 top-0 overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                                          {/* Search */}
                                          <div className="flex items-center gap-2 border-b border-[#f0f0f0] px-3 py-2">
                                            <svg
                                              width="13"
                                              height="13"
                                              viewBox="0 0 16 16"
                                              fill="none"
                                              stroke="#bbb"
                                              strokeWidth="1.8"
                                              strokeLinecap="round"
                                            >
                                              <circle cx="7" cy="7" r="5" />
                                              <path d="M11 11l3 3" />
                                            </svg>
                                            <input
                                              autoFocus
                                              type="text"
                                              placeholder="Cari produk..."
                                              value={productSearchQuery}
                                              onChange={(e) =>
                                                setProductSearchQuery(e.target.value)
                                              }
                                              className="flex-1 bg-transparent text-[0.8125rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none"
                                            />
                                            <button
                                              onClick={() => {
                                                setShowProductPicker(null);
                                                setProductSearchQuery('');
                                              }}
                                              className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[#ccc] transition-colors hover:text-[#888]"
                                            >
                                              <svg
                                                width="10"
                                                height="10"
                                                viewBox="0 0 10 10"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                              >
                                                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
                                              </svg>
                                            </button>
                                          </div>
                                          {/* Results */}
                                          <div className="max-h-44 overflow-y-auto">
                                            {(() => {
                                              const filtered = availableProducts.filter((p) =>
                                                p.name
                                                  .toLowerCase()
                                                  .includes(productSearchQuery.toLowerCase())
                                              );
                                              if (filtered.length === 0)
                                                return (
                                                  <p className="px-3 py-3 text-[0.875rem] text-[#555]">
                                                    {availableProducts.length === 0
                                                      ? 'Semua produk sudah ditambahkan'
                                                      : 'Produk tidak ditemukan'}
                                                  </p>
                                                );
                                              return filtered.map((prod) => (
                                                <button
                                                  key={prod.id}
                                                  onClick={() => {
                                                    addProductToBooking(b.id, prod);
                                                    setProductSearchQuery('');
                                                  }}
                                                  className="flex w-full items-center justify-between border-b border-[#f9f9f9] px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-[#fafaf8]"
                                                >
                                                  <span className="text-[0.8125rem] text-[#333]">
                                                    {prod.name}
                                                  </span>
                                                  <span className="text-[0.8125rem] text-[#555]">
                                                    {formatRupiah(prod.price)}
                                                  </span>
                                                </button>
                                              ));
                                            })()}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setShowProductPicker(b.id)}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          padding: 0,
                                          fontSize: 13,
                                          fontWeight: 500,
                                          color: '#007AFF',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 4,
                                          marginTop: 8,
                                        }}
                                      >
                                        <svg
                                          width="11"
                                          height="11"
                                          viewBox="0 0 12 12"
                                          fill="none"
                                          stroke="#007AFF"
                                          strokeWidth="2.5"
                                          strokeLinecap="round"
                                        >
                                          <path d="M6 1v10M1 6h10" />
                                        </svg>
                                        Tambah add-on
                                      </button>
                                    )}
                                  </div>

                                  {isTreatment && (
                                    <div>
                                      <p
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 600,
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.05em',
                                          color: '#8E8E93',
                                          margin: '0 0 6px 0',
                                        }}
                                      >
                                        Catatan Terapis
                                      </p>
                                      <textarea
                                        value={notes}
                                        onChange={(e) =>
                                          setNotesMap((p) => ({ ...p, [b.id]: e.target.value }))
                                        }
                                        placeholder="Kondisi kulit, alergi, preferensi..."
                                        rows={3}
                                        className="w-full resize-none border px-3 py-2 text-[0.8125rem] leading-relaxed text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none"
                                        style={{
                                          borderRadius: 10,
                                          borderColor: '#E5E5EA',
                                          outline: 'none',
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Pembayaran */}
                              <div className="mt-6 border-t border-[#f0f0f0] pt-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                  {/* Card: Status pembayaran — col 1 */}
                                  <div
                                    style={{
                                      borderRadius: 12,
                                      background: 'white',
                                      padding: 16,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 12,
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 600,
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.05em',
                                          color: '#8E8E93',
                                          margin: 0,
                                        }}
                                      >
                                        Status Pembayaran
                                      </p>
                                      <span
                                        style={{
                                          borderRadius: 9999,
                                          padding: '4px 12px',
                                          fontSize: 12,
                                          fontWeight: 600,
                                          background:
                                            b.paymentStatus === 'PAID'
                                              ? '#DCFCE7'
                                              : b.paymentStatus === 'DEPOSIT'
                                                ? '#FEF9C3'
                                                : '#F5F5F5',
                                          color:
                                            b.paymentStatus === 'PAID'
                                              ? '#16a34a'
                                              : b.paymentStatus === 'DEPOSIT'
                                                ? '#a16207'
                                                : '#8E8E93',
                                        }}
                                      >
                                        {b.paymentStatus === 'PAID'
                                          ? 'Lunas'
                                          : b.paymentStatus === 'DEPOSIT'
                                            ? 'Deposit'
                                            : 'Belum bayar'}
                                      </span>
                                    </div>
                                    {(() => {
                                      const paid =
                                        b.paymentStatus === 'PAID'
                                          ? finalTotal
                                          : b.paymentStatus === 'DEPOSIT'
                                            ? Math.round(b.price * 0.5)
                                            : 0;
                                      const pct =
                                        finalTotal > 0 ? Math.round((paid / finalTotal) * 100) : 0;
                                      return (
                                        <div
                                          style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8,
                                          }}
                                        >
                                          <div
                                            style={{
                                              height: 6,
                                              borderRadius: 9999,
                                              background: '#F2F2F7',
                                              overflow: 'hidden',
                                            }}
                                          >
                                            <div
                                              style={{
                                                height: '100%',
                                                borderRadius: 9999,
                                                width: `${pct}%`,
                                                transition: 'width 0.5s',
                                                background:
                                                  b.paymentStatus === 'PAID'
                                                    ? '#34C759'
                                                    : b.paymentStatus === 'DEPOSIT'
                                                      ? '#FF9500'
                                                      : '#E5E5EA',
                                              }}
                                            />
                                          </div>
                                          <div
                                            style={{
                                              display: 'flex',
                                              justifyContent: 'space-between',
                                              alignItems: 'flex-end',
                                            }}
                                          >
                                            <div>
                                              <p
                                                style={{
                                                  fontSize: 18,
                                                  fontWeight: 700,
                                                  color: '#1C1C1E',
                                                  margin: 0,
                                                  lineHeight: 1,
                                                }}
                                              >
                                                {formatRupiah(paid)}
                                              </p>
                                              <p
                                                style={{
                                                  fontSize: 12,
                                                  color: '#8E8E93',
                                                  marginTop: 2,
                                                }}
                                              >
                                                terbayar · {pct}%
                                              </p>
                                            </div>
                                            {b.paymentStatus === 'DEPOSIT' && (
                                              <div style={{ textAlign: 'right' }}>
                                                <p
                                                  style={{
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                    color: '#3C3C43',
                                                    margin: 0,
                                                  }}
                                                >
                                                  {formatRupiah(finalTotal - paid)}
                                                </p>
                                                <p
                                                  style={{
                                                    fontSize: 12,
                                                    color: '#8E8E93',
                                                    marginTop: 2,
                                                  }}
                                                >
                                                  sisa
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                    {/* Kode Promo — inside Status Pembayaran */}
                                    <div
                                      style={{
                                        borderTop: '1px solid #F2F2F7',
                                        paddingTop: 12,
                                        marginTop: 'auto',
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 600,
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.05em',
                                          color: '#8E8E93',
                                          marginBottom: 8,
                                        }}
                                      >
                                        Kode Promo
                                      </p>
                                      {promoData?.appliedCode ? (
                                        <div
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            borderRadius: 10,
                                            border: '1px solid #BBF7D0',
                                            background: '#F0FDF4',
                                            padding: '8px 12px',
                                          }}
                                        >
                                          <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            stroke="#16a34a"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <circle cx="8" cy="8" r="6.5" />
                                            <path d="M5 8l2 2 4-4" />
                                          </svg>
                                          <span
                                            style={{
                                              fontSize: 13,
                                              fontWeight: 500,
                                              color: '#16a34a',
                                            }}
                                          >
                                            {promoData.appliedCode}
                                          </span>
                                          <span style={{ fontSize: 12, color: '#4ade80' }}>
                                            −{formatRupiah(discount)}
                                          </span>
                                          <button
                                            onClick={() => removePromo(b.id)}
                                            style={{
                                              marginLeft: 'auto',
                                              background: 'none',
                                              border: 'none',
                                              cursor: 'pointer',
                                              fontSize: 12,
                                              color: '#16a34a',
                                            }}
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ) : (
                                        <div>
                                          <div style={{ display: 'flex', gap: 8 }}>
                                            <div
                                              style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                height: 36,
                                                borderRadius: 10,
                                                border: '1px solid #E5E5EA',
                                                background: '#F9F9FB',
                                                padding: '0 12px',
                                              }}
                                            >
                                              <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                                stroke="#C7C7CC"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              >
                                                <path d="M9.5 2.5l4 4-7 7-4-4 7-7z" />
                                                <circle cx="5.5" cy="10.5" r="1" />
                                              </svg>
                                              <input
                                                placeholder="Kode promo"
                                                value={promoInputMap[b.id] ?? ''}
                                                onChange={(e) =>
                                                  setPromoInputMap((p) => ({
                                                    ...p,
                                                    [b.id]: e.target.value.toUpperCase(),
                                                  }))
                                                }
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter')
                                                    applyPromo(b.id, totalPrice);
                                                }}
                                                style={{
                                                  flex: 1,
                                                  background: 'none',
                                                  border: 'none',
                                                  outline: 'none',
                                                  fontSize: 13,
                                                  textTransform: 'uppercase',
                                                  color: '#1C1C1E',
                                                }}
                                              />
                                            </div>
                                            <button
                                              onClick={() => applyPromo(b.id, totalPrice)}
                                              style={{
                                                height: 40,
                                                borderRadius: 10,
                                                background: '#1C1C1E',
                                                color: 'white',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0 16px',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                flexShrink: 0,
                                              }}
                                            >
                                              Terapkan
                                            </button>
                                          </div>
                                          {promoData?.error && (
                                            <p
                                              style={{
                                                fontSize: 11,
                                                color: '#ef4444',
                                                marginTop: 4,
                                              }}
                                            >
                                              {promoData.error}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Card: Input pembayaran — col 2-3 */}
                                  <div
                                    className="md:col-span-2"
                                    style={{
                                      borderRadius: 12,
                                      background: 'white',
                                      padding: 16,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 12,
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        color: '#8E8E93',
                                        margin: 0,
                                      }}
                                    >
                                      {b.paymentStatus === 'PAID'
                                        ? 'Pembayaran Selesai'
                                        : 'Input Pembayaran'}
                                    </p>
                                    {b.paymentStatus === 'PAID' ? (
                                      <>
                                        {/* Status lunas */}
                                        <div
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            background: '#F0FDF4',
                                            borderRadius: 10,
                                            padding: '10px 14px',
                                          }}
                                        >
                                          <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            stroke="#16a34a"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M3 8l3 3 7-7" />
                                          </svg>
                                          <span
                                            style={{
                                              fontSize: 13,
                                              fontWeight: 600,
                                              color: '#16a34a',
                                            }}
                                          >
                                            Lunas · {formatRupiah(finalTotal)}
                                          </span>
                                        </div>
                                        {/* Bukti pelunasan — button kecil */}
                                        {b.settlementProofUrl ? (
                                          <button
                                            onClick={() => setProofZoom(`settlement_${b.id}`)}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 6,
                                              alignSelf: 'flex-start',
                                              height: 36,
                                              borderRadius: 10,
                                              border: '1px solid #E5E5EA',
                                              background: 'transparent',
                                              padding: '0 14px',
                                              fontSize: 13,
                                              fontWeight: 500,
                                              color: '#1C1C1E',
                                              cursor: 'pointer',
                                            }}
                                          >
                                            <svg
                                              width="14"
                                              height="14"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            >
                                              <rect x="3" y="3" width="18" height="18" rx="2" />
                                              <circle cx="8.5" cy="8.5" r="1.5" />
                                              <path d="M21 15l-5-5L5 21" />
                                            </svg>
                                            Lihat Bukti Pelunasan
                                          </button>
                                        ) : (
                                          <span style={{ fontSize: 12, color: '#8E8E93' }}>
                                            Belum ada bukti pelunasan
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {/* Method tabs — matches top filter tabs */}
                                        <div
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            borderRadius: 12,
                                            padding: 4,
                                            backgroundColor: '#F2F2F7',
                                            alignSelf: 'flex-start',
                                          }}
                                        >
                                          {(['CASH', 'TRANSFER', 'QRIS'] as const).map((m) => {
                                            const active = (paymentMethodMap[b.id] ?? 'CASH') === m;
                                            return (
                                              <button
                                                key={m}
                                                onClick={() =>
                                                  setPaymentMethodMap((p) => ({ ...p, [b.id]: m }))
                                                }
                                                style={{
                                                  whiteSpace: 'nowrap',
                                                  padding: '6px 14px',
                                                  borderRadius: 10,
                                                  border: 'none',
                                                  cursor: 'pointer',
                                                  fontSize: 13,
                                                  fontWeight: active ? 600 : 400,
                                                  transition: 'all 0.15s',
                                                  backgroundColor: active
                                                    ? '#FFFFFF'
                                                    : 'transparent',
                                                  color: active ? '#1C1C1E' : '#8E8E93',
                                                  boxShadow: active
                                                    ? '0 1px 4px rgba(0,0,0,0.1)'
                                                    : 'none',
                                                }}
                                              >
                                                {m === 'CASH'
                                                  ? 'Cash'
                                                  : m === 'TRANSFER'
                                                    ? 'Transfer'
                                                    : 'QRIS'}
                                              </button>
                                            );
                                          })}
                                        </div>
                                        {/* Nominal input — hanya untuk CASH */}
                                        {(paymentMethodMap[b.id] ?? 'CASH') === 'CASH' && (
                                          <div
                                            style={{
                                              display: 'flex',
                                              height: 36,
                                              alignItems: 'center',
                                              gap: 8,
                                              borderRadius: 10,
                                              border: '1px solid #E5E5EA',
                                              background: '#F9F9FB',
                                              padding: '0 12px',
                                            }}
                                          >
                                            <span
                                              style={{
                                                flexShrink: 0,
                                                fontSize: 13,
                                                color: '#8E8E93',
                                              }}
                                            >
                                              Uang diterima Rp
                                            </span>
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              placeholder="0"
                                              value={paymentAmountMap[b.id] ?? ''}
                                              onChange={(e) =>
                                                setPaymentAmountMap((p) => ({
                                                  ...p,
                                                  [b.id]: e.target.value.replace(/\D/g, ''),
                                                }))
                                              }
                                              style={{
                                                flex: 1,
                                                background: 'transparent',
                                                border: 'none',
                                                outline: 'none',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                color: '#1C1C1E',
                                              }}
                                            />
                                          </div>
                                        )}
                                        {/* Total Tagihan + Kembalian */}
                                        {(() => {
                                          const method = paymentMethodMap[b.id] ?? 'CASH';
                                          const raw =
                                            parseInt(paymentAmountMap[b.id] ?? '0', 10) || 0;
                                          const kembalian = raw - finalTotal;
                                          const showKembalian = method === 'CASH' && raw > 0;
                                          return (
                                            <>
                                              <div
                                                style={{
                                                  display: 'flex',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                  padding: '8px 12px',
                                                  background: '#F9F9FB',
                                                  borderRadius: 10,
                                                  border: '1px solid #E5E5EA',
                                                }}
                                              >
                                                <span style={{ fontSize: 13, color: '#6B6B6B' }}>
                                                  Total Tagihan
                                                </span>
                                                <span
                                                  style={{
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    color: '#1C1C1E',
                                                  }}
                                                >
                                                  {formatRupiah(finalTotal)}
                                                </span>
                                              </div>
                                              {showKembalian && (
                                                <div
                                                  style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '8px 12px',
                                                    background:
                                                      kembalian >= 0 ? '#F0FDF4' : '#FFF1F0',
                                                    borderRadius: 10,
                                                    border: `1px solid ${kembalian >= 0 ? '#BBF7D0' : '#FECACA'}`,
                                                  }}
                                                >
                                                  <span
                                                    style={{
                                                      fontSize: 13,
                                                      color: kembalian >= 0 ? '#16a34a' : '#ef4444',
                                                    }}
                                                  >
                                                    {kembalian >= 0 ? 'Kembalian' : 'Kurang'}
                                                  </span>
                                                  <span
                                                    style={{
                                                      fontSize: 14,
                                                      fontWeight: 700,
                                                      color: kembalian >= 0 ? '#16a34a' : '#ef4444',
                                                    }}
                                                  >
                                                    {formatRupiah(Math.abs(kembalian))}
                                                  </span>
                                                </div>
                                              )}
                                            </>
                                          );
                                        })()}
                                        {/* Error + Proses Pembayaran */}
                                        <div
                                          style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 6,
                                            marginTop: 12,
                                          }}
                                        >
                                          {paymentError?.bookingId === b.id && (
                                            <p style={{ fontSize: 11, color: '#ef4444' }}>
                                              {paymentError.message}
                                            </p>
                                          )}
                                          <div
                                            style={{
                                              display: 'flex',
                                              gap: 8,
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                            }}
                                          >
                                            {/* Bukti Pelunasan — hanya untuk TRANSFER / QRIS */}
                                            {(paymentMethodMap[b.id] ?? 'CASH') !== 'CASH' ? (
                                              <label
                                                style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 6,
                                                  height: 40,
                                                  borderRadius: 10,
                                                  border: '1px solid #E5E5EA',
                                                  background: 'transparent',
                                                  padding: '0 14px',
                                                  fontSize: 13,
                                                  fontWeight: 500,
                                                  color: pelunasanProofMap[b.id]
                                                    ? '#16a34a'
                                                    : '#8E8E93',
                                                  cursor: 'pointer',
                                                  flexShrink: 0,
                                                  whiteSpace: 'nowrap',
                                                }}
                                              >
                                                <svg
                                                  width="14"
                                                  height="14"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                >
                                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                                  <path d="M21 15l-5-5L5 21" />
                                                </svg>
                                                {pelunasanProofMap[b.id]
                                                  ? 'Bukti Dipilih ✓'
                                                  : 'Bukti Pelunasan'}
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  capture="environment"
                                                  style={{ display: 'none' }}
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const preview = URL.createObjectURL(file);
                                                    setPelunasanProofMap((p) => ({
                                                      ...p,
                                                      [b.id]: { file, preview },
                                                    }));
                                                  }}
                                                />
                                              </label>
                                            ) : (
                                              <div />
                                            )}
                                            <button
                                              disabled={
                                                b.paymentStatus === 'PAID' ||
                                                processPaymentMutation.isPending
                                              }
                                              onClick={() => {
                                                setPaymentError(null);
                                                const method = paymentMethodMap[b.id] ?? 'CASH';
                                                const rawAmount = paymentAmountMap[b.id] ?? '';
                                                const amountReceived =
                                                  method !== 'CASH'
                                                    ? finalTotal
                                                    : parseInt(rawAmount, 10);
                                                if (method === 'CASH' && !rawAmount) {
                                                  setPaymentError({
                                                    bookingId: b.id,
                                                    message: 'Masukkan jumlah uang diterima',
                                                  });
                                                  return;
                                                }
                                                if (
                                                  method === 'CASH' &&
                                                  amountReceived < finalTotal
                                                ) {
                                                  setPaymentError({
                                                    bookingId: b.id,
                                                    message: 'Uang tidak cukup',
                                                  });
                                                  return;
                                                }
                                                setConfirmDialog({
                                                  bookingId: b.id,
                                                  customerName: b.customerName,
                                                  serviceName: currentService.serviceName,
                                                  amount: amountReceived,
                                                  method,
                                                  finalTotal,
                                                });
                                              }}
                                              style={{
                                                height: 40,
                                                borderRadius: 10,
                                                border: 'none',
                                                background: '#34C759',
                                                color: 'white',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                cursor: processPaymentMutation.isPending
                                                  ? 'not-allowed'
                                                  : 'pointer',
                                                opacity: processPaymentMutation.isPending ? 0.6 : 1,
                                                transition: 'opacity 0.15s',
                                                padding: '0 24px',
                                                alignSelf: 'flex-end',
                                              }}
                                            >
                                              {processPaymentMutation.isPending
                                                ? 'Memproses...'
                                                : 'Proses Pembayaran'}
                                            </button>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="flex flex-col gap-3 md:hidden">
              {/* Tabs for mobile */}
              <div className="flex gap-1 overflow-x-auto pb-2">
                {(
                  [
                    { key: 'ALL', label: 'Semua' },
                    { key: 'BOOKING', label: 'Booking' },
                    { key: 'WALK_IN', label: 'Datang Langsung' },
                    { key: 'COMPLETED', label: 'Selesai' },
                  ] as { key: VisitorTab; label: string }[]
                ).map(({ key, label }) => {
                  const active = visitorTab === key;
                  const isCompleted = key === 'COMPLETED';
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setVisitorTab(key);
                        setMobileSelectedId(null);
                      }}
                      className={`h-7 flex-shrink-0 whitespace-nowrap rounded-lg px-2.5 text-[0.7rem] font-medium transition-all ${
                        active
                          ? isCompleted
                            ? 'bg-[#16a34a] text-white'
                            : 'bg-[#1a1a1a] text-white'
                          : 'text-gray-500 hover:bg-[#f5f5f3] hover:text-[#444]'
                      }`}
                    >
                      {label} <span className="ml-1 text-[0.625rem]">{visitorCounts[key]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col gap-2">
                {filteredVisitors.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-[0.875rem] text-[#555]">Tidak ada pengunjung</p>
                  </div>
                ) : (
                  filteredVisitors.map((b) => {
                    const sm = {
                      UPCOMING: { color: '#d97706', bg: '#fffbeb', label: 'Perlu Konfirmasi' },
                      CONFIRMED: { color: '#2563eb', bg: '#eff6ff', label: 'Terkonfirmasi' },
                      IN_PROGRESS: { color: '#16a34a', bg: '#f0fdf4', label: 'Berlangsung' },
                      COMPLETED: { color: '#9ca3af', bg: '#f9fafb', label: 'Selesai' },
                      CANCELLED: { color: '#ef4444', bg: '#fef2f2', label: 'Dibatalkan' },
                      NO_SHOW: { color: '#9ca3af', bg: '#f9fafb', label: 'Tidak Hadir' },
                    }[b.status] ?? { color: '#9ca3af', bg: '#f9fafb', label: 'Tidak Hadir' };

                    return (
                      <button
                        key={b.id}
                        onClick={() => setMobileSelectedId(b.id)}
                        className="rounded-2xl border border-[#e8e8e6] bg-white p-3.5 text-left transition-all hover:shadow-md active:bg-[#fafaf8]"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div
                              className="flex h-10 w-10 items-center justify-center text-[0.8125rem] font-semibold"
                              style={{
                                backgroundColor: avatarColor(b.customerName).bg,
                                color: avatarColor(b.customerName).text,
                                borderRadius: 8,
                              }}
                            >
                              {getInitials(b.customerName)}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-baseline gap-1.5">
                              <p className="truncate text-[0.875rem] font-semibold text-[#1a1a1a]">
                                {b.customerName}
                              </p>
                              <span className="flex-shrink-0 text-[0.65rem] text-gray-500">
                                {b.timeSlot}
                              </span>
                            </div>
                            <p className="mb-2 truncate text-[0.75rem] text-[#555]">
                              {b.serviceName}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className="flex flex-shrink-0 items-center gap-1 text-[0.65rem] font-medium"
                                style={{
                                  color:
                                    b.paymentStatus === 'PAID'
                                      ? '#16a34a'
                                      : b.paymentStatus === 'DEPOSIT'
                                        ? '#a16207'
                                        : '#dc2626',
                                }}
                              >
                                {b.paymentStatus === 'PAID' ? (
                                  <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                                    <circle cx="6.5" cy="6.5" r="6" fill="currentColor" />
                                    <path
                                      d="M3.5 6.5l2 2 4-4"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : b.paymentStatus === 'DEPOSIT' ? (
                                  <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                                    <circle cx="6.5" cy="6.5" r="6" fill="currentColor" />
                                    <path
                                      d="M6.5 3.5v3l2 1.5"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : (
                                  <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                                    <circle cx="6.5" cy="6.5" r="6" fill="currentColor" />
                                    <path
                                      d="M4.5 4.5l4 4M8.5 4.5l-4 4"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                )}
                                {b.paymentStatus === 'PAID'
                                  ? 'Lunas'
                                  : b.paymentStatus === 'DEPOSIT'
                                    ? 'DP'
                                    : 'Belum bayar'}
                              </span>
                              <span
                                className="flex-shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
                                style={{ backgroundColor: sm.bg, color: sm.color }}
                              >
                                {sm.label}
                              </span>
                            </div>
                          </div>

                          {/* Chevron */}
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            stroke="#ccc"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            className="mt-1 flex-shrink-0"
                          >
                            <path d="M5.5 3l4.5 4-4.5 4" />
                          </svg>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Right-side Detail Panel */}
        {mobileSelectedId && isMobile && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/20 transition-opacity"
              onClick={() => setMobileSelectedId(null)}
            />

            {/* Panel */}
            <div className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-sm overflow-y-auto bg-white shadow-2xl transition-transform duration-300 md:hidden">
              {(() => {
                const b = filteredVisitors.find((v) => v.id === mobileSelectedId);
                if (!b) return null;

                const sm = {
                  UPCOMING: { color: '#d97706', bg: '#fffbeb', label: 'Perlu Konfirmasi' },
                  CONFIRMED: { color: '#2563eb', bg: '#eff6ff', label: 'Terkonfirmasi' },
                  IN_PROGRESS: { color: '#16a34a', bg: '#f0fdf4', label: 'Berlangsung' },
                  COMPLETED: { color: '#9ca3af', bg: '#f9fafb', label: 'Selesai' },
                  CANCELLED: { color: '#ef4444', bg: '#fef2f2', label: 'Dibatalkan' },
                  NO_SHOW: { color: '#9ca3af', bg: '#f9fafb', label: 'Tidak Hadir' },
                }[b.status] ?? { color: '#9ca3af', bg: '#f9fafb', label: 'Tidak Hadir' };

                const addOns = addOnsMap[b.id] ?? [];
                const notes = notesMap[b.id] ?? '';
                const currentService = serviceMap[b.id] ?? {
                  serviceName: b.serviceName,
                  price: b.price,
                  categoryName: b.categoryName,
                };
                const additionalServices = additionalServicesMap[b.id] ?? [];
                const totalPrice =
                  currentService.price +
                  additionalServices.reduce((s, sv) => s + sv.price, 0) +
                  addOns.reduce((s, a) => s + a.price, 0);
                const waLink = `https://wa.me/62${b.customerPhone.replace(/^0/, '')}`;
                const promoData = promoMap[b.id];
                const discount = promoData?.discount ?? 0;
                const finalTotal = totalPrice - discount;

                return (
                  <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#f0f0f0] bg-white px-4 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-[0.875rem] font-semibold text-[#1a1a1a]">
                          {b.customerName}
                        </p>
                        <p className="truncate text-[0.75rem] text-[#555]">{b.serviceName}</p>
                      </div>
                      <button
                        onClick={() => setMobileSelectedId(null)}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[#f5f5f3]"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M3 3l10 10M13 3L3 13" />
                        </svg>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                      {/* Info Grid */}
                      <div className="space-y-3 border-b border-[#f0f0f0] pb-3">
                        <div>
                          <p className="mb-1 text-[0.6875rem] uppercase tracking-wider text-[#555]">
                            Waktu
                          </p>
                          <p className="text-[0.875rem] font-medium text-[#1a1a1a]">{b.timeSlot}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-[0.6875rem] uppercase tracking-wider text-[#555]">
                            Nomor HP
                          </p>
                          <p className="text-[0.875rem] font-medium tabular-nums text-[#1a1a1a]">
                            {b.customerPhone}
                          </p>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-center text-[0.75rem] font-medium text-white transition-opacity hover:opacity-85"
                            style={{ backgroundColor: '#25d366' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Chat WA
                          </a>
                        </div>
                      </div>

                      {/* Service Info */}
                      <div className="space-y-3 border-b border-[#f0f0f0] pb-3">
                        <p className="text-[0.6875rem] uppercase tracking-wider text-[#555]">
                          Layanan
                        </p>
                        <div>
                          <p className="text-[0.875rem] font-medium text-[#1a1a1a]">
                            {currentService.serviceName}
                          </p>
                          <p className="text-[0.75rem] text-gray-500">
                            {formatRupiah(currentService.price)}
                          </p>
                        </div>
                        {additionalServices.length > 0 && (
                          <div>
                            <p className="mb-2 text-[0.75rem] font-medium text-[#555]">
                              Layanan Tambahan:
                            </p>
                            <div className="space-y-1">
                              {additionalServices.map((svc, idx) => (
                                <div key={idx} className="flex justify-between text-[0.75rem]">
                                  <span className="text-[#555]">{svc.serviceName}</span>
                                  <span className="font-medium text-[#1a1a1a]">
                                    {formatRupiah(svc.price)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Info */}
                      <div className="space-y-3 border-b border-[#f0f0f0] pb-3">
                        <p className="text-[0.6875rem] uppercase tracking-wider text-[#555]">
                          Pembayaran
                        </p>
                        <div className="space-y-2 rounded-lg bg-[#f9f9f7] p-3">
                          <div className="flex justify-between text-[0.75rem]">
                            <span className="text-[#555]">Total Harga</span>
                            <span className="font-medium text-[#1a1a1a]">
                              {formatRupiah(totalPrice)}
                            </span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-[0.75rem]">
                              <span className="text-[#16a34a]">Diskon</span>
                              <span className="font-medium text-[#16a34a]">
                                −{formatRupiah(discount)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-[#e8e8e6] pt-2 text-[0.875rem]">
                            <span className="font-medium text-[#1a1a1a]">Total Bayar</span>
                            <span className="font-bold text-[#1a1a1a]">
                              {formatRupiah(finalTotal)}
                            </span>
                          </div>
                          <div className="mt-2 flex justify-between border-t border-[#e8e8e6] pt-2 text-[0.75rem]">
                            <span className="text-[#555]">Status</span>
                            <span
                              className="rounded-full px-2 py-0.5 font-medium"
                              style={{ backgroundColor: sm.bg, color: sm.color }}
                            >
                              {sm.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {notes && (
                        <div className="pb-3">
                          <p className="mb-2 text-[0.6875rem] uppercase tracking-wider text-[#555]">
                            Catatan
                          </p>
                          <p className="rounded-lg bg-[#fafaf8] p-3 text-[0.875rem] text-[#1a1a1a]">
                            {notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmDialog &&
        (() => {
          const d = confirmDialog;
          const kembalian = d.method === 'CASH' ? d.amount - d.finalTotal : null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                onClick={() => setConfirmDialog(null)}
              />
              {/* Card */}
              <div className="relative flex w-full max-w-[22rem] flex-col gap-5 rounded-2xl bg-white p-4 shadow-[0_24px_64px_rgba(0,0,0,0.18)] sm:w-[22rem] sm:p-6">
                {/* Header */}
                <div>
                  <p className="mb-1 text-[0.6875rem] font-medium uppercase tracking-wider text-gray-500">
                    Konfirmasi Pembayaran
                  </p>
                  <p className="text-[1.125rem] font-bold text-[#1a1a1a]">{d.customerName}</p>
                </div>
                {/* Detail rows */}
                <div className="flex flex-col gap-3 rounded-xl bg-[#f8f8f6] px-4 py-3.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[0.8125rem] text-gray-500">Tagihan</span>
                    <span className="text-[0.9375rem] font-semibold text-[#1a1a1a]">
                      {formatRupiah(d.finalTotal)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[0.8125rem] text-gray-500">Metode</span>
                    <span className="text-[0.8125rem] font-medium text-[#1a1a1a]">{d.method}</span>
                  </div>
                  {d.method === 'CASH' && (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[0.8125rem] text-gray-500">Uang diterima</span>
                        <span className="text-[0.8125rem] font-medium text-[#1a1a1a]">
                          {formatRupiah(d.amount)}
                        </span>
                      </div>
                      <div className="h-px bg-[#ebebeb]" />
                      <div className="flex items-baseline justify-between">
                        <span className="text-[0.8125rem] font-semibold text-[#1a1a1a]">
                          Kembalian
                        </span>
                        <span
                          className={`text-[1rem] font-bold ${(kembalian ?? 0) >= 0 ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}
                        >
                          {(kembalian ?? 0) >= 0
                            ? formatRupiah(kembalian ?? 0)
                            : `−${formatRupiah(Math.abs(kembalian ?? 0))}`}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {/* Bukti Transfer — preview untuk TRANSFER/QRIS */}
                {(d.method === 'TRANSFER' || d.method === 'QRIS') && (
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#8E8E93',
                        margin: '0 0 8px 0',
                      }}
                    >
                      Bukti Transfer
                    </p>
                    {pelunasanProofMap[d.bookingId]?.preview ? (
                      <div style={{ position: 'relative' }}>
                        <img
                          src={pelunasanProofMap[d.bookingId]!.preview}
                          alt="Bukti"
                          style={{
                            width: '100%',
                            height: 140,
                            objectFit: 'cover',
                            borderRadius: 10,
                            border: '1px solid #E5E5EA',
                          }}
                        />
                        <label
                          style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: 8,
                            padding: '4px 10px',
                            fontSize: 11,
                            color: 'white',
                            cursor: 'pointer',
                          }}
                        >
                          Ganti
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const preview = URL.createObjectURL(file);
                              setPelunasanProofMap((p) => ({
                                ...p,
                                [d.bookingId]: { file, preview },
                              }));
                            }}
                          />
                        </label>
                      </div>
                    ) : (
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          height: 100,
                          borderRadius: 10,
                          border: '2px dashed #E5E5EA',
                          background: '#F9F9FB',
                          cursor: 'pointer',
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#8E8E93"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span style={{ fontSize: 12, color: '#8E8E93' }}>
                          Ambil foto / pilih dari galeri
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const preview = URL.createObjectURL(file);
                            setPelunasanProofMap((p) => ({
                              ...p,
                              [d.bookingId]: { file, preview },
                            }));
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
                {/* Actions */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="h-10 flex-1 rounded-xl border border-[#e8e8e8] text-[0.875rem] font-medium text-[#555] transition-colors hover:bg-[#f5f5f3]"
                  >
                    Batal
                  </button>
                  <button
                    disabled={processPaymentMutation.isPending || uploadingProof}
                    onClick={async () => {
                      const method = d.method.toLowerCase() as 'cash' | 'transfer' | 'qris';
                      try {
                        let proofUrl: string | undefined;
                        const proof = pelunasanProofMap[d.bookingId];
                        if (proof && method !== 'cash') {
                          setUploadingProof(true);
                          const form = new FormData();
                          form.append('file', proof.file);
                          form.append('bookingId', d.bookingId);
                          const res = await fetch('/api/upload-proof', {
                            method: 'POST',
                            body: form,
                          });
                          const json = await res.json();
                          proofUrl = json.url;
                          setUploadingProof(false);
                        }
                        await processPaymentMutation.mutateAsync({
                          bookingId: d.bookingId,
                          paymentMethod: method,
                          amountReceived: d.amount,
                          servicePrice: d.finalTotal,
                          paymentProofUrl: proofUrl,
                        });
                        setConfirmDialog(null);
                        setPelunasanProofMap((p) => ({ ...p, [d.bookingId]: null }));
                      } catch (e) {
                        setUploadingProof(false);
                        console.error('processPayment error:', e);
                      }
                    }}
                    className="h-10 flex-1 rounded-xl bg-[#16a34a] text-[0.875rem] font-semibold text-white transition-colors hover:bg-[#15803d] disabled:opacity-50"
                  >
                    {uploadingProof
                      ? 'Mengupload...'
                      : processPaymentMutation.isPending
                        ? 'Memproses...'
                        : 'Ya, Proses ✓'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Decline Dialog Modal */}
      {declineDialog &&
        (() => {
          const d = declineDialog;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:hidden">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                onClick={() => setDeclineDialog(null)}
              />
              {/* Card */}
              <div className="relative flex w-full max-w-[22rem] flex-col gap-5 rounded-2xl bg-white p-4 shadow-[0_24px_64px_rgba(0,0,0,0.18)] sm:w-[22rem] sm:p-6">
                {/* Header with close button */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wider text-gray-500">
                      Tolak Booking
                    </p>
                    <p className="text-[1.125rem] font-bold text-[#1a1a1a]">{d.customerName}</p>
                  </div>
                  <button
                    onClick={() => setDeclineDialog(null)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-[#f5f5f3] hover:text-[#444]"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M3 3l10 10M13 3L3 13" />
                    </svg>
                  </button>
                </div>
                {/* Reason input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[0.8125rem] font-medium text-[#555]">
                    Alasan Penolakan
                  </label>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full resize-none rounded-xl border border-[#e8e8e8] px-3.5 py-2.5 text-[0.8125rem] text-[#1a1a1a] transition-colors placeholder:text-[#ccc] focus:border-[#ef4444] focus:outline-none focus:ring-1 focus:ring-[#fecaca]"
                    rows={3}
                  />
                </div>
                {/* Actions */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      setDeclineDialog(null);
                      setDeclineReason('');
                    }}
                    className="h-10 flex-1 rounded-xl border border-[#e8e8e8] text-[0.875rem] font-medium text-[#555] transition-colors hover:bg-[#f5f5f3]"
                  >
                    Batal
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!d.customerName) return;
                      const bookingId = d.bookingId;
                      const stylistName =
                        allBookings.find((b) => b.id === bookingId)?.stylistName ?? 'Stylist';
                      setLastActionTime(Date.now());
                      setConfirmDialog(null);
                      setDeclineDialog(null);
                      setDeclineReason('');
                      setBookingStatusMap((m) => ({ ...m, [bookingId]: 'CANCELLED' }));
                      setExpandedId(bookingId);
                      await updateStatusMutation.mutateAsync({
                        bookingId,
                        status: 'CANCELLED',
                        cancellationReason: `Maaf, stylist ${stylistName} sudah memiliki booking lain pada jam tersebut.`,
                      });
                    }}
                    disabled={!declineReason.trim()}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#ef4444] text-[0.875rem] font-semibold text-white transition-colors hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#ef4444]"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l10 10M13 3L3 13" />
                    </svg>
                    Ya, Tolak
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Proof zoom modal */}
      {proofZoom &&
        (() => {
          const isSettlement = proofZoom.startsWith('settlement_');
          const bookingId = isSettlement ? proofZoom.replace('settlement_', '') : proofZoom;
          const booking =
            allBookings.find((b) => b.id === bookingId) ??
            manualBookings.find((b) => b.id === bookingId);
          const proofUrl = isSettlement ? booking?.settlementProofUrl : booking?.paymentProofUrl;
          const title = isSettlement ? 'Bukti Pelunasan' : 'Bukti Pembayaran (DP)';
          return (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
              onClick={() => setProofZoom(null)}
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
              <div
                className="relative z-10 flex w-full flex-col items-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full max-w-[22rem] overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.4)] sm:w-[22rem]">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#f0f0f0] px-5 py-4">
                    <div>
                      <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-gray-500">
                        {title}
                      </p>
                      <p className="mt-0.5 text-[0.9375rem] font-bold text-[#1a1a1a]">
                        {booking?.customerName}
                      </p>
                    </div>
                    <button
                      onClick={() => setProofZoom(null)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-[#f5f5f3] hover:text-[#444]"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M3 3l10 10M13 3L3 13" />
                      </svg>
                    </button>
                  </div>
                  {/* Image display */}
                  {proofUrl ? (
                    <div className="flex items-center justify-center bg-[#f5f5f5] p-4">
                      <img
                        src={proofUrl}
                        alt="Bukti pembayaran"
                        className="max-h-[60vh] max-w-full rounded-lg object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] px-6 py-8">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2563eb] shadow-lg">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-[0.75rem] font-medium uppercase tracking-wider text-[#3b82f6]">
                          Transfer Berhasil
                        </p>
                        <p className="mt-1 text-[1.75rem] font-bold text-[#1e3a8a]">
                          Rp {(booking?.price ?? 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[0.75rem] text-white/50">Klik di luar untuk menutup</p>
              </div>
            </div>
          );
        })()}

      {/* Left drawer — Add customer */}
      {addDrawer !== 'CLOSED' && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={() => setAddDrawer('CLOSED')}
          />
          {/* Drawer */}
          <div className="relative z-10 flex h-full w-full flex-col bg-white shadow-[-4px_0_32px_rgba(0,0,0,0.12)] sm:w-[32rem]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-4 pb-4 pt-4 sm:px-6 sm:pt-6">
              <div>
                <p className="mb-0.5 text-[0.6875rem] font-medium uppercase tracking-wider text-gray-500">
                  Tambah Kunjungan
                </p>
                <h3 className="text-[1.0625rem] font-bold text-[#1a1a1a]">
                  {addDrawer === 'WALK_IN' ? 'Walk-in' : 'Booking Online'}
                </h3>
              </div>
              <button
                onClick={() => setAddDrawer('CLOSED')}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-[#f5f5f3] hover:text-[#444]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>

            {/* Form content */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              {addDrawer === 'WALK_IN' && (
                <>
                  {/* Nama */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#444]">
                      Nama Pelanggan <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={walkInForm.name}
                      onChange={(e) => setWalkInForm((f) => ({ ...f, name: e.target.value }))}
                      className="h-10 rounded-xl border border-[#e8e8e8] px-3.5 text-[0.9375rem] text-[#1a1a1a] transition-colors placeholder:text-[#ccc] focus:border-[#bbb] focus:outline-none"
                    />
                  </div>
                  {/* Nomor HP */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#444]">
                      Nomor HP
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="08xxxxxxxxxx"
                      value={walkInForm.phone}
                      onChange={(e) =>
                        setWalkInForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))
                      }
                      className="h-10 rounded-xl border border-[#e8e8e8] px-3.5 text-[0.9375rem] text-[#1a1a1a] transition-colors placeholder:text-[#ccc] focus:border-[#bbb] focus:outline-none"
                    />
                  </div>
                  {/* Layanan — searchable */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#444]">
                      Layanan <span className="text-[#ef4444]">*</span>
                    </label>
                    <div className="relative">
                      {/* Trigger */}
                      <button
                        type="button"
                        onClick={() => setDrawerServiceOpen((o) => !o)}
                        className="flex h-10 w-full items-center justify-between rounded-xl border border-[#e8e8e8] bg-white px-3.5 text-left text-[0.9375rem] transition-colors focus:border-[#bbb] focus:outline-none"
                      >
                        <span className={walkInForm.serviceId ? 'text-[#1a1a1a]' : 'text-[#ccc]'}>
                          {walkInForm.serviceId
                            ? (realServices as AnyService[]).find(
                                (s: AnyService) => s.id === walkInForm.serviceId
                              )?.name
                            : 'Pilih layanan...'}
                        </span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="#aaa"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          className={`transition-transform ${drawerServiceOpen ? 'rotate-180' : ''}`}
                        >
                          <path d="M4 6l4 4 4-4" />
                        </svg>
                      </button>
                      {/* Dropdown */}
                      {drawerServiceOpen && (
                        <div className="absolute left-0 right-0 top-11 z-20 overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
                          {/* Search */}
                          <div className="flex items-center gap-2 border-b border-[#f0f0f0] px-3 py-2">
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="#bbb"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            >
                              <circle cx="7" cy="7" r="5" />
                              <path d="M11 11l3 3" />
                            </svg>
                            <input
                              autoFocus
                              type="text"
                              placeholder="Cari layanan..."
                              value={drawerServiceSearch}
                              onChange={(e) => setDrawerServiceSearch(e.target.value)}
                              className="flex-1 bg-transparent text-[0.875rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none"
                            />
                            {drawerServiceSearch && (
                              <button
                                onClick={() => setDrawerServiceSearch('')}
                                className="text-[#ccc] hover:text-[#888]"
                              >
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                >
                                  <path d="M3 3l10 10M13 3L3 13" />
                                </svg>
                              </button>
                            )}
                          </div>
                          {/* List */}
                          <div className="max-h-[14rem] overflow-y-auto">
                            {(() => {
                              const q = drawerServiceSearch.toLowerCase();
                              const filtered = (realServices as AnyService[]).filter(
                                (s: AnyService) =>
                                  !q ||
                                  s.name.toLowerCase().includes(q) ||
                                  (s.categoryName ?? s.category?.name ?? '')
                                    .toLowerCase()
                                    .includes(q)
                              );
                              if (filtered.length === 0)
                                return (
                                  <p className="px-3 py-3 text-[0.875rem] text-[#555]">
                                    Layanan tidak ditemukan
                                  </p>
                                );
                              const grouped = filtered.reduce<Record<string, AnyService[]>>(
                                (acc, s) => {
                                  const cat = s.categoryName ?? s.category?.name ?? 'Lainnya';
                                  (acc[cat] = acc[cat] ?? []).push(s);
                                  return acc;
                                },
                                {}
                              );
                              return Object.entries(grouped).map(([cat, svcs]) => (
                                <div key={cat}>
                                  {!drawerServiceSearch && (
                                    <p className="px-3 pb-1 pt-2.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[#555]">
                                      {cat}
                                    </p>
                                  )}
                                  {svcs.map((s) => (
                                    <button
                                      key={s.id}
                                      onClick={() => {
                                        setWalkInForm((f) => ({ ...f, serviceId: s.id }));
                                        setDrawerServiceOpen(false);
                                        setDrawerServiceSearch('');
                                      }}
                                      className={`flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-[#f8f8f6] ${walkInForm.serviceId === s.id ? 'bg-[#f8f8f6]' : ''}`}
                                    >
                                      <span
                                        className={`text-[0.875rem] ${walkInForm.serviceId === s.id ? 'font-semibold text-[#1a1a1a]' : 'text-[#333]'}`}
                                      >
                                        {s.name}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Stylist */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#444]">
                      Stylist / Terapis <span className="text-[#ef4444]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(realStylists as AnyStylist[]).map((s: AnyService) => {
                        const name = s.user?.full_name ?? s.name ?? 'Stylist';
                        const initials = name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2);
                        return (
                          <button
                            key={s.id}
                            onClick={() => setWalkInForm((f) => ({ ...f, stylistId: s.id }))}
                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${walkInForm.stylistId === s.id ? 'border-[#1a1a1a] bg-[#f8f8f6]' : 'border-[#e8e8e8] hover:border-[#bbb]'}`}
                          >
                            <div
                              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold"
                              style={{ backgroundColor: '#c8ede2' }}
                            >
                              {initials}
                            </div>
                            <span className="text-[0.8125rem] font-medium leading-tight text-[#1a1a1a]">
                              {name.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {addDrawer === 'BOOKING' && (
                <>
                  {/* Kode booking */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#444]">
                      Kode Booking
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="RB-2025-XXX"
                        value={bookingCodeInput}
                        onChange={(e) => setBookingCodeInput(e.target.value.toUpperCase())}
                        className="h-10 flex-1 rounded-xl border border-[#e8e8e8] px-3.5 text-[0.9375rem] uppercase tracking-wider text-[#1a1a1a] transition-colors placeholder:text-[#ccc] focus:border-[#bbb] focus:outline-none"
                      />
                      <button className="h-10 shrink-0 rounded-xl bg-[#1a1a1a] px-4 text-[0.8125rem] font-medium text-white transition-colors hover:bg-[#333]">
                        Cari
                      </button>
                    </div>
                  </div>

                  {/* Scan barcode */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#444]">
                      Atau Scan Barcode
                    </label>
                    <button
                      onClick={startBarcodeScanner}
                      className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#e0e0e0] text-gray-400 transition-colors hover:border-[#bbb] hover:bg-[#fafaf8] hover:text-gray-500"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                        <rect x="7" y="7" width="3" height="10" rx="0.5" />
                        <rect x="14" y="7" width="3" height="10" rx="0.5" />
                      </svg>
                      <span className="text-[0.8125rem] font-medium">Tap untuk scan barcode</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer CTA */}
            {addDrawer === 'WALK_IN' && (
              <div className="border-t border-[#f0f0f0] px-4 py-3 sm:px-6 sm:py-4">
                <button
                  disabled={!walkInForm.name || !walkInForm.serviceId || !walkInForm.stylistId}
                  onClick={async () => {
                    const svc = (realServices as AnyService[]).find(
                      (s: AnyService) => s.id === walkInForm.serviceId
                    );
                    const stylist = (realStylists as AnyStylist[]).find(
                      (s: AnyService) => s.id === walkInForm.stylistId
                    );
                    if (!svc || !stylist) return;

                    const now = new Date();
                    const timeSlot = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    const totalMin = now.getHours() * 60 + now.getMinutes() + (svc.duration || 60);
                    const endTime = `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;

                    try {
                      await createBookingMutation.mutateAsync({
                        salonId: SALON_ID,
                        serviceId: svc.id,
                        stylistId: stylist.id,
                        bookingDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
                        startTime: timeSlot,
                        endTime,
                        customerName: walkInForm.name,
                        customerPhone: walkInForm.phone || '-',
                        customerEmail: '',
                        notes: 'Walk-in',
                        paymentStatus: 'lunas',
                      });
                    } catch (e) {
                      console.error('Failed to create walk-in booking:', e);
                    }

                    setWalkInForm({ name: '', phone: '', serviceId: '', stylistId: '' });
                    setAddDrawer('CLOSED');
                  }}
                  className="h-11 w-full rounded-xl bg-[#1a1a1a] text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Tambahkan ke Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {barcodeScannerActive && isMobile && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 md:hidden">
          <div className="relative mx-4 w-full max-w-md">
            {/* Video feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="aspect-video w-full rounded-xl bg-black object-cover"
            />

            {/* Canvas for scanning (hidden) */}
            <canvas ref={canvasRef} width={1280} height={720} className="hidden" />

            {/* Scanner overlay */}
            <div className="absolute inset-0 rounded-xl">
              {/* Scanning frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-64 rounded-lg border-2 border-[#3b82f6]" />
              </div>

              {/* Corner indicators */}
              <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-[#3b82f6]" />
              <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-[#3b82f6]" />
              <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-[#3b82f6]" />
              <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-[#3b82f6]" />
            </div>

            {/* Close button */}
            <button
              onClick={stopBarcodeScanner}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Scanning text */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">
                📸 Arahkan ke barcode/QR code
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-4 z-40 sm:hidden">
        <button
          onClick={() => setAddDropdownOpen((o) => !o)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a1a] text-white shadow-lg transition-all hover:bg-[#333] active:scale-95"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        {addDropdownOpen && isMobile && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setAddDropdownOpen(false)} />
            <div className="absolute bottom-20 right-0 z-40 w-[13rem] overflow-hidden rounded-xl border border-[#efefed] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <button
                onClick={() => {
                  setAddDrawer('WALK_IN');
                  setAddDropdownOpen(false);
                  setDrawerServiceOpen(false);
                  setDrawerServiceSearch('');
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8f8f6]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0f0ee]">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#555"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="8" cy="5" r="2.5" />
                    <path d="M3 14c0-3 2-5 5-5s5 2 5 5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[0.875rem] font-medium text-[#1a1a1a]">Walk-in</p>
                  <p className="text-[0.75rem] text-gray-500">Datang langsung</p>
                </div>
              </button>
              <div className="mx-4 h-px bg-[#f5f5f3]" />
              <button
                onClick={() => {
                  setAddDrawer('BOOKING');
                  setAddDropdownOpen(false);
                  setDrawerServiceOpen(false);
                  setDrawerServiceSearch('');
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8f8f6]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0f0ee]">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#555"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="12" height="10" rx="1.5" />
                    <path d="M5 7h6M5 10h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-[0.875rem] font-medium text-[#1a1a1a]">Booking Online</p>
                  <p className="text-[0.75rem] text-gray-500">Sudah punya kode booking</p>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(2px)',
            }}
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            style={{
              position: 'relative',
              width: 340,
              borderRadius: 16,
              background: '#FFFFFF',
              padding: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Trash size={20} weight="duotone" color="#FF3B30" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E', margin: 0 }}>
                  Hapus dari List?
                </p>
                <p style={{ fontSize: 13, color: '#8E8E93', margin: 0, marginTop: 2 }}>
                  {deleteConfirm.customerName}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#3C3C43', margin: 0, lineHeight: 1.5 }}>
              Booking ini akan dihapus dari tampilan list. Data tetap tersimpan di sistem.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 9999,
                  border: '1px solid #E5E5EA',
                  background: '#F2F2F7',
                  color: '#3C3C43',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const { bookingId } = deleteConfirm;
                  // Close dialog + set skeleton in same render flush
                  setDeleteConfirm(null);
                  setLoadingBookingId(bookingId);
                  if (expandedId === bookingId) setExpandedId(null);
                  // After delay, move to deletedIds and clear skeleton
                  window.setTimeout(() => {
                    setDeletedIds((prev) => {
                      const s = new Set(prev);
                      s.add(bookingId);
                      return s;
                    });
                    setLoadingBookingId(null);
                  }, 800);
                }}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 9999,
                  border: 'none',
                  background: '#FF3B30',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showWANotif && waBookingData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
          <div className="mx-4 flex max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8l3 3 7-7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Booking dikonfirmasi!</p>
                <p className="mt-0.5 text-xs text-[#6b7280]">
                  Beritahu {waBookingData.customerName} via WhatsApp?
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3">
              <p className="mb-1.5 text-xs font-medium text-[#166534]">Preview pesan:</p>
              <p className="whitespace-pre-line text-xs leading-relaxed text-[#166534]">{`Halo ${waBookingData.customerName}! 🌸

Booking kamu di *Rara Beauty Jakarta* telah *dikonfirmasi*! ✅

📋 ${waBookingData.serviceName} · ${waBookingData.date} · ${waBookingData.timeSlot}

⏰ Mohon datang 10 menit sebelum sesi. Toleransi max 15 menit.

🔍 Cek booking: localhost:3002/check-booking`}</p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={buildWAMessage(waBookingData)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowWANotif(false)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: '#25d366' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Kirim via WhatsApp
              </a>
              <button
                onClick={() => setShowWANotif(false)}
                className="h-10 w-full rounded-xl border border-[#e5e7eb] text-sm font-medium text-[#6b7280] transition-colors hover:bg-[#f9fafb]"
              >
                Lewati
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
