'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useDashboardData } from '@/features/dashboard/hooks/use-dashboard-data';
import { formatRupiah } from '@/shared/lib/format';
import type { AddOn } from '@/features/dashboard/types/dashboard.types';
import styles from './page.module.css';

const DAYS_ID   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const AVATAR_COLORS = [
  { bg: '#fde8ec', text: '#c4627a' },
  { bg: '#e0eeff', text: '#4a7fc4' },
  { bg: '#e0f5e9', text: '#4a9e6a' },
  { bg: '#ede8ff', text: '#7a62c4' },
  { bg: '#fff0e0', text: '#c48a4a' },
  { bg: '#e0f5f5', text: '#4a9e9e' },
  { bg: '#fef3c2', text: '#92600e' },
  { bg: '#fce7f3', text: '#be4a8c' },
];

function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx]!;
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
  UPCOMING:    '#a3a3a3',
  CONFIRMED:   '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  COMPLETED:   '#22c55e',
  CANCELLED:   '#ef4444',
  NO_SHOW:     '#a3a3a3',
};

const STATUS_LABEL: Record<string, string> = {
  UPCOMING:    'Menunggu',
  CONFIRMED:   'Terkonfirmasi',
  IN_PROGRESS: 'Berlangsung',
  COMPLETED:   'Selesai',
  CANCELLED:   'Dibatalkan',
  NO_SHOW:     'Tidak Hadir',
};

type VisitorTab = 'ALL' | 'BOOKING' | 'WALK_IN' | 'COMPLETED';

// ─── Mock data "from Settings" ───────────────────────────────────────────────
interface MockService { id: string; name: string; categoryName: string; price: number; duration: number; }
interface MockProduct { id: string; name: string; price: number; }

const MOCK_SERVICES: MockService[] = [
  { id: 'sv1',  name: 'Ladies Haircut',           categoryName: 'Hair',    price: 150000, duration: 30 },
  { id: 'sv2',  name: 'Ladies Haircut+Wash',       categoryName: 'Hair',    price: 180000, duration: 45 },
  { id: 'sv3',  name: 'Ladies Hair Wash+Blowdry',  categoryName: 'Hair',    price: 100000, duration: 30 },
  { id: 'sv4',  name: 'Keratin Treatment',          categoryName: 'Hair',    price: 500000, duration: 120 },
  { id: 'sv5',  name: 'Color Treatment',            categoryName: 'Colour',  price: 300000, duration: 75 },
  { id: 'sv6',  name: 'Balayage',                   categoryName: 'Colour',  price: 450000, duration: 90 },
  { id: 'sv7',  name: 'Facial Basic',               categoryName: 'Face',    price: 150000, duration: 60 },
  { id: 'sv8',  name: 'Eyelash Extension',          categoryName: 'Face',    price: 200000, duration: 90 },
  { id: 'sv9',  name: 'Gel Manicure',               categoryName: 'Nail',    price: 120000, duration: 45 },
  { id: 'sv10', name: 'Nail Art Basic',              categoryName: 'Nail',    price: 80000,  duration: 30 },
  { id: 'sv11', name: 'Stone Massage',               categoryName: 'Massage', price: 250000, duration: 60 },
  { id: 'sv12', name: 'Aromatherapy Massage',        categoryName: 'Massage', price: 200000, duration: 60 },
];

const MOCK_PRODUCTS: MockProduct[] = [
  { id: 'pr1', name: 'Hair Mask',          price: 50000 },
  { id: 'pr2', name: 'Scalp Treatment',    price: 75000 },
  { id: 'pr3', name: 'Deep Conditioning',  price: 60000 },
  { id: 'pr4', name: 'Nail Art',           price: 30000 },
  { id: 'pr5', name: 'Cuticle Treatment',  price: 25000 },
  { id: 'pr6', name: 'Paraffin Wax',       price: 35000 },
  { id: 'pr7', name: 'Collagen Mask',      price: 80000 },
  { id: 'pr8', name: 'Serum Treatment',    price: 45000 },
];

type ServiceData = { serviceName: string; price: number; categoryName: string; };

const PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number }> = {
  'DISKON10': { type: 'percent', value: 10 },
  'HEMAT50K': { type: 'fixed',   value: 50000 },
  'RARA20':   { type: 'percent', value: 20 },
  'MEMBER15': { type: 'percent', value: 15 },
};

export default function OverviewPage() {
  const { todayBookings, stats, stylists } = useDashboardData();
  const [greeting, setGreeting] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [visitorTab, setVisitorTab] = useState<VisitorTab>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [manualBookings, setManualBookings] = useState<import('@/features/dashboard/types/dashboard.types').DashboardBooking[]>([]);
  const [addOnsMap, setAddOnsMap] = useState<Record<string, AddOn[]>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [serviceMap, setServiceMap] = useState<Record<string, ServiceData>>({});
  const [additionalServicesMap, setAdditionalServicesMap] = useState<Record<string, ServiceData[]>>({});
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [showServicePicker, setShowServicePicker] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState<string | null>(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [promoInputMap, setPromoInputMap] = useState<Record<string, string>>({});
  const [promoMap, setPromoMap] = useState<Record<string, { discount: number; error: string; appliedCode: string }>>({});
  const [paymentAmountMap, setPaymentAmountMap] = useState<Record<string, string>>({});
  const [paymentMethodMap, setPaymentMethodMap] = useState<Record<string, 'CASH' | 'TRANSFER' | 'QRIS'>>({});
  const [bookingStatusMap, setBookingStatusMap] = useState<Record<string, import('@/features/dashboard/types/dashboard.types').BookingStatus>>({});
  const [confirmDialog, setConfirmDialog] = useState<{ bookingId: string; customerName: string; serviceName: string; amount: number; method: string; finalTotal: number } | null>(null);
  const [declineDialog, setDeclineDialog] = useState<{ bookingId: string; customerName: string; reason: string } | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [proofZoom, setProofZoom] = useState<string | null>(null);
  const [visitorSearch, setVisitorSearch] = useState('');
  const [addDrawer, setAddDrawer] = useState<'CLOSED' | 'WALK_IN' | 'BOOKING'>('CLOSED');
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({ name: '', phone: '', serviceId: '', stylistId: '' });
  const [bookingCodeInput, setBookingCodeInput] = useState('');
  const [drawerServiceSearch, setDrawerServiceSearch] = useState('');
  const [barcodeScannerActive, setBarcodeScannerActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [drawerServiceOpen, setDrawerServiceOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [lastActionTime, setLastActionTime] = useState<number>(0);

  useEffect(() => {
    setGreeting(getGreeting());
    const d = new Date();
    setDateLabel(`${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`);
  }, []);

  // Barcode scanner
  const startBarcodeScanner = async () => {
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
          if (canvasRef.current && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

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
      tracks.forEach(track => track.stop());
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
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
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
    const aMap: Record<string, AddOn[]> = {};
    const nMap: Record<string, string> = {};
    const sMap: Record<string, ServiceData> = {};
    todayBookings.forEach(b => {
      aMap[b.id] = b.addOns ? [...b.addOns] : [];
      nMap[b.id] = b.treatmentNotes ?? '';
      sMap[b.id] = { serviceName: b.serviceName, price: b.price, categoryName: b.categoryName };
    });
    setAddOnsMap(aMap);
    setNotesMap(nMap);
    setServiceMap(sMap);
  }, [todayBookings]);

  function toggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id);
    setShowProductPicker(null);
    setEditServiceId(null);
    setShowServicePicker(null);
    setServiceSearchQuery('');
    setProductSearchQuery('');
  }

  function removeAddOn(bookingId: string, idx: number) {
    setAddOnsMap(prev => ({
      ...prev,
      [bookingId]: prev[bookingId]?.filter((_, i) => i !== idx) ?? [],
    }));
  }

  function addProductToBooking(bookingId: string, product: MockProduct) {
    const newAo: AddOn = { id: `ao-${Date.now()}`, name: product.name, price: product.price };
    setAddOnsMap(prev => ({ ...prev, [bookingId]: [...(prev[bookingId] ?? []), newAo] }));
    setShowProductPicker(null);
  }

  function changeService(bookingId: string, svc: MockService) {
    setServiceMap(prev => ({ ...prev, [bookingId]: { serviceName: svc.name, price: svc.price, categoryName: svc.categoryName } }));
    setEditServiceId(null);
  }

  function addService(bookingId: string, svc: MockService) {
    const newSvc: ServiceData = { serviceName: svc.name, price: svc.price, categoryName: svc.categoryName };
    setAdditionalServicesMap(prev => ({ ...prev, [bookingId]: [...(prev[bookingId] ?? []), newSvc] }));
    setShowServicePicker(null);
  }

  function applyPromo(bookingId: string, subtotal: number) {
    const code = (promoInputMap[bookingId] ?? '').trim().toUpperCase();
    const promo = PROMO_CODES[code];
    if (!promo) {
      setPromoMap(p => ({ ...p, [bookingId]: { discount: 0, error: 'Kode promo tidak valid', appliedCode: '' } }));
      return;
    }
    const discount = promo.type === 'percent' ? Math.round(subtotal * promo.value / 100) : promo.value;
    setPromoMap(p => ({ ...p, [bookingId]: { discount, error: '', appliedCode: code } }));
  }

  function removePromo(bookingId: string) {
    setPromoMap(p => ({ ...p, [bookingId]: { discount: 0, error: '', appliedCode: '' } }));
    setPromoInputMap(p => ({ ...p, [bookingId]: '' }));
  }

  function removeAdditionalService(bookingId: string, idx: number) {
    setAdditionalServicesMap(prev => ({
      ...prev,
      [bookingId]: prev[bookingId]?.filter((_, i) => i !== idx) ?? [],
    }));
  }

  const effectiveBookings = useMemo(() => {
    return [...todayBookings, ...manualBookings]
      .map(b => ({ ...b, status: bookingStatusMap[b.id] ?? b.status }))
      .filter(b => !(b.visitorType === 'BOOKING' && b.paymentStatus === 'UNPAID'));
  }, [todayBookings, manualBookings, bookingStatusMap]);

  const filteredVisitors = useMemo(() => {
    let list = effectiveBookings;
    if (visitorTab === 'COMPLETED') list = list.filter(b => b.status === 'COMPLETED');
    else if (visitorTab === 'BOOKING') list = list.filter(b => b.visitorType === 'BOOKING' && b.paymentStatus !== 'UNPAID');
    else if (visitorTab !== 'ALL') list = list.filter(b => b.visitorType === visitorTab);
    if (visitorSearch.trim()) {
      const q = visitorSearch.toLowerCase();
      list = list.filter(b =>
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      const aIsNew = a.status === 'UPCOMING' ? 0 : 1;
      const bIsNew = b.status === 'UPCOMING' ? 0 : 1;
      if (aIsNew !== bIsNew) return aIsNew - bIsNew;
      const cmp = a.timeSlot.localeCompare(b.timeSlot);
      return sortOrder === 'ASC' ? cmp : -cmp;
    });
    return list;
  }, [effectiveBookings, visitorTab, visitorSearch, sortOrder]);

  const visitorCounts = useMemo(() => {
    return {
      ALL:       effectiveBookings.length,
      BOOKING:   effectiveBookings.filter(b => b.visitorType === 'BOOKING' && b.paymentStatus !== 'UNPAID').length,
      WALK_IN:   effectiveBookings.filter(b => b.visitorType === 'WALK_IN').length,
      COMPLETED: effectiveBookings.filter(b => b.status === 'COMPLETED').length,
    };
  }, [effectiveBookings]);

  const pendingConfirmCount = useMemo(() => {
    return effectiveBookings.filter(b => b.visitorType === 'BOOKING' && b.status === 'UPCOMING').length;
  }, [effectiveBookings]);



  return (
    <>
    <div className="flex flex-col flex-1 overflow-y-auto" style={{ backgroundColor: '#fafaf8' }}>
      <div className="w-full px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-10 flex flex-col gap-5 sm:gap-7 md:gap-10">

        {/* Greeting */}
        <div className="flex flex-col gap-0">
          <p className="text-[0.75rem] sm:text-[0.875rem] text-[#555]">{dateLabel}</p>
          <div className="flex justify-between items-center gap-4 sm:gap-4">
            <h1 className="text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] font-semibold text-[#1a1a1a] tracking-tight">{greeting || 'Halo'}, Rara ✦</h1>

            {/* Desktop button */}
            <div className="relative hidden sm:block flex-shrink-0">
            <button
              onClick={() => setAddDropdownOpen(o => !o)}
              className="flex items-center justify-start gap-2 h-10 px-4 bg-[#1a1a1a] text-white text-[0.875rem] font-medium rounded-xl hover:bg-[#333] transition-colors w-auto"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
              <span>Tambah Pelanggan</span>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${addDropdownOpen ? 'rotate-180' : ''}`}><path d="M4 6l4 4 4-4"/></svg>
            </button>
            {addDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30 sm:hidden" onClick={() => setAddDropdownOpen(false)} />
                <div className="absolute right-0 top-12 z-40 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-[#efefed] overflow-hidden w-full sm:w-[13rem] max-w-xs sm:max-w-none">
                  <button
                    onClick={() => { setAddDrawer('WALK_IN'); setAddDropdownOpen(false); setDrawerServiceOpen(false); setDrawerServiceSearch(''); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f8f8f6] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#f0f0ee] flex items-center justify-center shrink-0">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="2.5"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg>
                    </div>
                    <div>
                      <p className="text-[0.875rem] font-medium text-[#1a1a1a]">Walk-in</p>
                      <p className="text-[0.75rem] text-[#777]">Datang langsung</p>
                    </div>
                  </button>
                  <div className="h-px bg-[#f5f5f3] mx-4" />
                  <button
                    onClick={() => { setAddDrawer('BOOKING'); setAddDropdownOpen(false); setDrawerServiceOpen(false); setDrawerServiceSearch(''); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f8f8f6] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#f0f0ee] flex items-center justify-center shrink-0">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg>
                    </div>
                    <div>
                      <p className="text-[0.875rem] font-medium text-[#1a1a1a]">Booking Online</p>
                      <p className="text-[0.75rem] text-[#777]">Sudah punya kode booking</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
          </div>
        </div>
        {/* Stats row — Colorful cards with abstract shapes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Pendapatan - Grayscale */}
          <div className="relative overflow-hidden rounded-2xl px-3 py-3 sm:p-4 flex flex-col shadow backdrop-blur-sm" style={{ backgroundColor: '#F1F2F3' }}>
            {/* Abstract shapes - circles */}
            <svg className="absolute right-3 bottom-2 sm:right-4 sm:bottom-3 opacity-80 scale-85 sm:scale-100 origin-bottom-right" width="70" height="70" viewBox="0 0 70 70" fill="none">
              <circle cx="20" cy="20" r="12" fill="#054A57" opacity="0.6"/>
              <circle cx="50" cy="30" r="16" fill="#054A57" opacity="0.75"/>
              <circle cx="35" cy="55" r="14" fill="#054A57" opacity="0.85"/>
            </svg>
            <div className="relative z-10 flex items-start justify-between mb-[2rem] sm:mb-[3rem]">
              <p className="text-[0.75rem] sm:text-[0.85rem] text-[#737373] font-medium uppercase tracking-wide opacity-85">Pendapatan</p>
            </div>
            <p className="relative z-10 text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] font-bold text-[#2a2a2a] leading-none">
              <span className="sm:hidden">{formatCompactRupiah(stats.revenueToday)}</span>
              <span className="hidden sm:inline">{formatRupiah(stats.revenueToday)}</span>
            </p>
          </div>

          {/* Booking - Grayscale */}
          <div className="relative overflow-hidden rounded-2xl px-3 py-3 sm:p-4 flex flex-col shadow backdrop-blur-sm" style={{ backgroundColor: '#F1F2F3' }}>
            {/* Abstract shapes - squares */}
            <svg className="absolute right-3 bottom-2 sm:right-4 sm:bottom-3 opacity-80 scale-85 sm:scale-100 origin-bottom-right" width="70" height="70" viewBox="0 0 70 70" fill="none">
              <rect x="10" y="10" width="16" height="16" fill="#3A1F6B" opacity="0.6" rx="2"/>
              <rect x="35" y="20" width="24" height="24" fill="#3A1F6B" opacity="0.75" rx="2"/>
              <rect x="15" y="45" width="20" height="20" fill="#3A1F6B" opacity="0.85" rx="2"/>
            </svg>
            <div className="relative z-10 flex items-start justify-between mb-[2rem] sm:mb-[3rem]">
              <p className="text-[0.75rem] sm:text-[0.85rem] text-[#737373] font-medium uppercase tracking-wide opacity-85">Booking Hari Ini</p>
            </div>
            <p className="relative z-10 text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] font-bold text-[#2a2a2a] leading-none">{String(stats.bookingsToday)}</p>
          </div>

          {/* Rating - Grayscale */}
          <div className="relative overflow-hidden rounded-2xl px-3 py-3 sm:p-4 flex flex-col shadow backdrop-blur-sm" style={{ backgroundColor: '#F1F2F3' }}>
            {/* Smooth wavy lines */}
            <svg className="absolute right-3 bottom-2 sm:right-4 sm:bottom-3 opacity-80 scale-85 sm:scale-100 origin-bottom-right" width="70" height="70" viewBox="0 0 70 70" fill="none">
              {/* Wave 1 - smooth sine curve */}
              <path d="M10,25 Q20,15 30,25 T50,25 T70,25" stroke="#8B0E43" strokeWidth="2.5" opacity="0.65" strokeLinecap="round" fill="none"/>
              {/* Wave 2 - smooth sine curve */}
              <path d="M10,42 Q20,32 30,42 T50,42 T70,42" stroke="#8B0E43" strokeWidth="2.5" opacity="0.75" strokeLinecap="round" fill="none"/>
              {/* Wave 3 - smooth sine curve */}
              <path d="M10,60 Q20,50 30,60 T50,60 T70,60" stroke="#8B0E43" strokeWidth="2" opacity="0.85" strokeLinecap="round" fill="none"/>
            </svg>
            <div className="relative z-10 flex items-start justify-between mb-[2rem] sm:mb-[3rem]">
              <p className="text-[0.75rem] sm:text-[0.85rem] text-[#737373] font-medium uppercase tracking-wide opacity-85">Rating</p>
            </div>
            <p className="relative z-10 text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] font-bold text-[#2a2a2a] leading-none">{stats.avgRating}/5 ⭐</p>
          </div>

          {/* Penyelesaian - Grayscale */}
          <div className="relative overflow-hidden rounded-2xl px-3 py-3 sm:p-4 flex flex-col shadow backdrop-blur-sm" style={{ backgroundColor: '#F1F2F3' }}>
            {/* Zigzag lines */}
            <svg className="absolute right-3 bottom-2 sm:right-4 sm:bottom-3 opacity-80 scale-85 sm:scale-100 origin-bottom-right" width="70" height="70" viewBox="0 0 70 70" fill="none">
              {/* Zigzag line 1 - diagonal */}
              <polyline points="50,10 58,20 50,30 58,40" stroke="#737373" strokeWidth="2.5" opacity="0.65" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Zigzag line 2 - steeper */}
              <polyline points="20,25 30,35 20,45 30,55 20,65" stroke="#737373" strokeWidth="2.5" opacity="0.75" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Zigzag line 3 - shorter */}
              <polyline points="50,50 60,60 50,70" stroke="#737373" strokeWidth="2" opacity="0.85" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="relative z-10 flex items-start justify-between mb-[2rem] sm:mb-[3rem]">
              <p className="text-[0.75rem] sm:text-[0.85rem] text-[#737373] font-medium uppercase tracking-wide opacity-85">Penyelesaian</p>
            </div>
            <p className="relative z-10 text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] font-bold text-[#2a2a2a] leading-none">{stats.completionRate}%</p>
          </div>
        </div>

        {/* Visitor list */}
        <div>

          {/* Schedule */}
          <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 pt-5 pb-0 flex items-center justify-between gap-4 visitor-header-controls">
              <h2 className="text-[1rem] font-semibold text-[#1a1a1a] shrink-0 hide-on-mobile">Pengunjung Hari Ini</h2>
              <div className="flex items-center gap-2 ml-auto visitor-header-controls">
                {/* Sort button */}
                <button
                  onClick={() => setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC')}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#f5f5f3] hover:bg-[#ececea] transition-colors text-[0.8125rem] text-[#555] font-medium shrink-0 sort-button-mobile"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {sortOrder === 'ASC' ? (
                      <>
                        <path d="M4 3v10M4 13l-2.5-3M4 13l2.5-3"/>
                        <path d="M9 5h5M9 8h4M9 11h3" opacity="0.5"/>
                      </>
                    ) : (
                      <>
                        <path d="M4 13V3M4 3l-2.5 3M4 3l2.5 3"/>
                        <path d="M9 5h3M9 8h4M9 11h5" opacity="0.5"/>
                      </>
                    )}
                  </svg>
                  {sortOrder === 'ASC' ? 'Terlama' : 'Terbaru'}
                </button>
                {/* Search bar */}
                <div className="flex items-center gap-2 bg-[#f5f5f3] rounded-lg px-2 sm:px-3 h-7 sm:h-8 flex-1 sm:w-[14rem] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#ddd] transition-all search-bar-mobile">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
                  <input
                    type="text"
                    placeholder="Cari pelanggan..."
                    value={visitorSearch}
                    onChange={e => setVisitorSearch(e.target.value)}
                    className="flex-1 text-[0.75rem] sm:text-[0.8125rem] text-[#1a1a1a] placeholder:text-[#aaa] focus:outline-none bg-transparent"
                  />
                  {visitorSearch && (
                    <button onClick={() => setVisitorSearch('')} className="text-[#bbb] hover:text-[#777] transition-colors">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-3 sm:px-6 pt-2 sm:pt-3 pb-0 flex gap-0.5 sm:gap-1 overflow-x-auto sm:overflow-visible">
              {([
                { key: 'ALL',       label: 'Semua' },
                { key: 'BOOKING',   label: 'Booking' },
                { key: 'WALK_IN',   label: 'Datang Langsung' },
                { key: 'COMPLETED', label: 'Selesai' },
              ] as { key: VisitorTab; label: string }[]).map(({ key, label }) => {
                const active = visitorTab === key;
                const isCompleted = key === 'COMPLETED';
                const showBadge = key === 'BOOKING' && pendingConfirmCount > 0;
                return (
                  <div key={key} className="relative inline-flex flex-shrink-0">
                    <button
                      onClick={() => setVisitorTab(key)}
                      className={`h-7 sm:h-8 px-2.5 sm:px-3.5 rounded-lg text-[0.7rem] sm:text-[0.8125rem] font-medium transition-all whitespace-nowrap ${
                        active
                          ? isCompleted ? 'bg-[#16a34a] text-white' : 'bg-[#1a1a1a] text-white'
                          : 'text-[#777] hover:text-[#444] hover:bg-[#f5f5f3]'
                      }`}
                    >
                      {label}
                      <span className={`ml-1.5 text-[0.6875rem] ${active ? 'opacity-70' : 'text-[#aaa]'}`}>
                        {visitorCounts[key]}
                      </span>
                    </button>
                    {showBadge && (
                      <span className="animate-badge-shake pointer-events-none absolute -top-2 -right-1.5 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-[#f59e0b] text-white text-[0.625rem] font-bold shadow-sm ring-2 ring-white">
                        {pendingConfirmCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Completed list */}
            {visitorTab === 'COMPLETED' && (
              <div className="mt-2">
                {filteredVisitors.length === 0 ? (
                  <div className="px-4 sm:px-6 py-10 text-center">
                    <p className="text-[0.875rem] text-[#555]">Belum ada yang selesai hari ini</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f5f5f3]">
                    {filteredVisitors.map(b => (
                      <div key={b.id} className="px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center gap-2 sm:gap-4 text-sm sm:text-base">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[0.8125rem] font-semibold" style={{ backgroundColor: avatarColor(b.customerName).bg, color: avatarColor(b.customerName).text }}>
                          {b.customerName.charAt(0)}
                        </div>
                        {/* Name + service */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.9375rem] font-semibold text-[#1a1a1a] truncate">{b.customerName}</p>
                          <p className="text-[0.8125rem] text-[#555] truncate">{b.serviceName} · {b.stylistName}</p>
                        </div>
                        {/* Time */}
                        <span className="text-[0.875rem] text-[#777] tabular-nums shrink-0">{b.timeSlot}</span>
                        {/* Payment badge */}
                        <span className={`text-[0.75rem] font-medium px-2.5 py-1 rounded-full shrink-0 ${
                          b.paymentStatus === 'PAID'    ? 'bg-[#dcfce7] text-[#16a34a]'
                          : b.paymentStatus === 'DEPOSIT' ? 'bg-[#fef9c3] text-[#a16207]'
                          : 'bg-[#f5f5f5] text-[#777]'
                        }`}>
                          {b.paymentStatus === 'PAID' ? 'Lunas' : b.paymentStatus === 'DEPOSIT' ? 'Deposit' : 'Belum bayar'}
                        </span>
                        {/* Total */}
                        <p className="text-[0.9375rem] font-semibold text-[#1a1a1a] tabular-nums shrink-0">{formatRupiah(b.price)}</p>
                        {/* Check icon */}
                        <div className="w-6 h-6 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3 3 7-7"/></svg>
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
              {filteredVisitors.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-[0.875rem] text-[#555]">Tidak ada pengunjung</p>
                </div>
              ) : (
                filteredVisitors.map(b => {
                  const isExpanded = expandedId === b.id;
                  const addOns = addOnsMap[b.id] ?? [];
                  const notes = notesMap[b.id] ?? '';
                  const currentService = serviceMap[b.id] ?? { serviceName: b.serviceName, price: b.price, categoryName: b.categoryName };
                  const additionalServices = additionalServicesMap[b.id] ?? [];
                  const isTreatment = ['Face', 'Massage'].includes(currentService.categoryName) || additionalServices.some(s => ['Face','Massage'].includes(s.categoryName));
                  const totalPrice = currentService.price + additionalServices.reduce((s, sv) => s + sv.price, 0) + addOns.reduce((s, a) => s + a.price, 0);
                  const waLink = `https://wa.me/62${b.customerPhone.replace(/^0/, '')}`;
                  const promoData = promoMap[b.id];
                  const discount = promoData?.discount ?? 0;
                  const finalTotal = totalPrice - discount;
                  // Products not yet added (avoid duplicates)
                  const addedNames = new Set(addOns.map(a => a.name));
                  const availableProducts = MOCK_PRODUCTS.filter(p => !addedNames.has(p.name));
                  // Services not yet added (main + additional, avoid duplicates)
                  const usedServiceNames = new Set([currentService.serviceName, ...additionalServices.map(s => s.serviceName)]);
                  const availableServices = MOCK_SERVICES.filter(s => !usedServiceNames.has(s.name));

                  const statusMeta: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
                    UPCOMING: {
                      color: '#d97706', bg: '#fffbeb',
                      label: 'Perlu Konfirmasi',
                      icon: (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <circle cx="4" cy="4" r="3.5" stroke="white" strokeWidth="1.1"/>
                          <path d="M4 2v2.2l1.2.8" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ),
                    },
                    CONFIRMED: {
                      color: '#2563eb', bg: '#eff6ff',
                      label: 'Terkonfirmasi',
                      icon: (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4l1.8 1.8 3.2-3.2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ),
                    },
                    IN_PROGRESS: {
                      color: '#16a34a', bg: '#f0fdf4',
                      label: 'Berlangsung',
                      icon: (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M2.5 1.5l4 2.5-4 2.5V1.5z" fill="white"/>
                        </svg>
                      ),
                    },
                    COMPLETED: { color: '#9ca3af', bg: '#f9fafb', label: 'Selesai', icon: null },
                    CANCELLED: { color: '#ef4444', bg: '#fef2f2', label: 'Dibatalkan', icon: null },
                    NO_SHOW:   { color: '#9ca3af', bg: '#f9fafb', label: 'Tidak Hadir', icon: null },
                  };
                  const sm = statusMeta[b.status] ?? statusMeta.NO_SHOW;

                  return (
                    <div key={b.id} className="hidden md:block border-b border-[#f7f7f7] last:border-0">
                      {/* Collapsed row - Desktop */}
                      <div
                        onClick={() => toggleExpand(b.id)}
                        className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-[#fafaf8] transition-colors text-sm sm:text-base"
                      >
                        {/* Avatar with status icon overlay */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[0.8125rem] font-semibold" style={{ backgroundColor: avatarColor(b.customerName).bg, color: avatarColor(b.customerName).text }}>
                            {b.customerName.charAt(0)}
                          </div>
                          {(b.status === 'UPCOMING' || b.status === 'CONFIRMED') && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white" style={{ backgroundColor: sm.color }}>
                              {sm.icon}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.9375rem] font-medium text-[#1a1a1a] truncate">{b.customerName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[0.875rem] text-[#555] truncate">{b.serviceName}</p>
                            <span className="w-px h-3 bg-[#ddd] flex-shrink-0" />
                            <span className={`flex-shrink-0 flex items-center gap-1.5 text-[0.75rem] font-medium ${
                              b.paymentStatus === 'PAID'    ? 'text-[#16a34a]'
                              : b.paymentStatus === 'DEPOSIT' ? 'text-[#a16207]'
                              : 'text-[#dc2626]'
                            }`}>
                              {b.paymentStatus === 'PAID' ? (
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0">
                                  <circle cx="6.5" cy="6.5" r="6" fill="#16a34a"/>
                                  <path d="M3.5 6.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : b.paymentStatus === 'DEPOSIT' ? (
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0">
                                  <circle cx="6.5" cy="6.5" r="6" fill="#a16207"/>
                                  <path d="M6.5 3.5v3l2 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : (
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0">
                                  <circle cx="6.5" cy="6.5" r="6" fill="#dc2626"/>
                                  <path d="M4.5 4.5l4 4M8.5 4.5l-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              )}
                              {b.paymentStatus === 'PAID' ? 'Lunas' : b.paymentStatus === 'DEPOSIT' ? 'DP' : 'Belum bayar'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[0.875rem] text-[#777] tabular-nums flex-shrink-0">{b.timeSlot}</span>
                        {(b.status === 'UPCOMING' || b.status === 'CONFIRMED') && (
                          <span className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold border" style={{ backgroundColor: sm.bg, color: sm.color, borderColor: `${sm.color}30` }}>
                            {b.status === 'IN_PROGRESS' && (
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: sm.color }} />
                            )}
                            {sm.label}
                          </span>
                        )}
                        <span className={`text-[0.6875rem] font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${b.visitorType === 'WALK_IN' ? 'bg-[#fef3c2] text-[#92400e]' : 'bg-[#dbeafe] text-[#1e40af]'}`}>
                          {b.visitorType === 'WALK_IN' ? 'Walk-in' : 'Booking'}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <path d="M2.5 4.5l4.5 5 4.5-5"/>
                        </svg>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-3 sm:px-6 pb-5 bg-[#fafaf8] flex flex-col relative min-h-[23rem]" onClick={e => e.stopPropagation()}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px pt-4 border-t border-[#f0f0f0] expanded-details-mobile" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>

                            {/* Col 1: Kontak */}
                            <div className="pr-0 sm:pr-0 md:pr-6 flex flex-col gap-3 pb-3 sm:pb-3 md:pb-0 border-b sm:border-b md:border-b-0 md:border-r border-[#f0f0f0] md:border-l-0 expanded-col-separator">
                              <div>
                                <p className="text-[0.6875rem] text-[#555] uppercase tracking-wider mb-1">Nomor HP</p>
                                <p className="text-[0.875rem] font-medium text-[#1a1a1a] tabular-nums">{b.customerPhone}</p>
                              </div>
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="self-start flex items-center gap-1.5 h-8 px-3 rounded-xl text-[0.75rem] font-medium text-white transition-opacity hover:opacity-85"
                                style={{ backgroundColor: '#25d366' }}
                                onClick={e => e.stopPropagation()}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                Chat WA
                              </a>

                              {/* Bukti transfer + tombol konfirmasi — hanya untuk UPCOMING */}
                              {b.status === 'UPCOMING' && (
                                <div className="flex flex-col gap-2 mt-1" onClick={e => e.stopPropagation()}>
                                  <p className="text-[0.6875rem] text-[#555] uppercase tracking-wider font-semibold">Bukti Transfer</p>
                                  {/* Thumbnail bukti transfer */}
                                  <button
                                    onClick={() => setProofZoom(b.id)}
                                    className="relative w-full rounded-xl overflow-hidden border border-[#e8e8e6] hover:border-[#ccc] transition-colors group"
                                  >
                                    {/* Mock transfer receipt */}
                                    <div className="w-full h-[7rem] bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] flex flex-col items-center justify-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10l4-4 3 3 5-6"/></svg>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-[0.6875rem] font-bold text-[#1e40af]">BCA Transfer</p>
                                        <p className="text-[0.625rem] text-[#3b82f6]">Rp {b.price.toLocaleString('id-ID')}</p>
                                      </div>
                                    </div>
                                    {/* Zoom hint overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-1.5">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="7" cy="7" r="4"/><path d="M11 11l3 3"/><path d="M5.5 7h3M7 5.5v3"/></svg>
                                      </div>
                                    </div>
                                  </button>
                                  {/* Tombol konfirmasi & decline */}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        console.log('✅ Confirm button clicked');
                                        const timeSinceLastAction = Date.now() - lastActionTime;
                                        if (timeSinceLastAction < 200) {
                                          console.log('⏸️ Too soon, skipping');
                                          return;
                                        }
                                        console.log('✅ Setting CONFIRMED status');
                                        setBookingStatusMap(m => ({ ...m, [b.id]: 'CONFIRMED' }));
                                      }}
                                      className="flex-1 h-9 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[0.8125rem] font-semibold transition-colors flex items-center justify-center gap-1.5"
                                    >
                                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3 3 7-7"/></svg>
                                      Konfirmasi
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDeclineDialog({ bookingId: b.id, customerName: b.customerName, reason: '' });
                                        setDeclineReason('');
                                      }}
                                      className="flex-1 h-9 rounded-xl bg-[#f5f5f3] hover:bg-[#efefed] text-[#ef4444] text-[0.8125rem] font-semibold transition-colors flex items-center justify-center gap-1.5 border border-[#e0e0e0]"
                                    >
                                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
                                      Tolak
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Col 2: Layanan + Pembayaran */}
                            <div className="px-0 sm:px-3 md:px-6 pt-3 sm:pt-3 md:pt-0 md:border-l border-b sm:border-b md:border-b-0 border-[#f0f0f0] flex flex-col gap-3 pb-3 sm:pb-3 md:pb-0 expanded-col-separator">
                              <div>
                                <p className="text-[0.6875rem] text-[#555] uppercase tracking-wider mb-1.5">Layanan</p>
                                {editServiceId === b.id ? (
                                  <div className="relative z-20">
                                    <div className="absolute top-0 left-0 right-0 bg-white border border-[#e0e0e0] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                                      {/* Search */}
                                      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f0f0f0]">
                                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#bbb" strokeWidth="1.8" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
                                        <input
                                          autoFocus
                                          type="text"
                                          placeholder="Cari layanan..."
                                          value={serviceSearchQuery}
                                          onChange={e => setServiceSearchQuery(e.target.value)}
                                          className="flex-1 text-[0.8125rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none bg-transparent"
                                        />
                                        <button
                                          onClick={() => { setEditServiceId(null); setServiceSearchQuery(''); }}
                                          className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#ccc] hover:text-[#888] transition-colors"
                                        >
                                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg>
                                        </button>
                                      </div>
                                      {/* Results */}
                                      <div className="max-h-48 overflow-y-auto">
                                        {['Hair','Colour','Face','Nail','Massage'].map(cat => {
                                          const catServices = MOCK_SERVICES.filter(s =>
                                            s.categoryName === cat &&
                                            s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
                                          );
                                          if (!catServices.length) return null;
                                          return (
                                            <div key={cat}>
                                              {!serviceSearchQuery && <p className="px-3 pt-2.5 pb-1 text-[0.6875rem] font-semibold text-[#555] uppercase tracking-wider">{cat}</p>}
                                              {catServices.map(svc => (
                                                <button
                                                  key={svc.id}
                                                  onClick={() => { changeService(b.id, svc); setServiceSearchQuery(''); }}
                                                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#fafaf8] transition-colors border-b border-[#f9f9f9] last:border-0 ${currentService.serviceName === svc.name ? 'bg-[#f5f0ff]' : ''}`}
                                                >
                                                  <span className={`text-[0.8125rem] ${currentService.serviceName === svc.name ? 'font-semibold text-[#7a62c4]' : 'text-[#333]'}`}>{svc.name}</span>
                                                  <span className="text-[0.8125rem] text-[#555] ml-2 flex-shrink-0">{formatRupiah(svc.price)}</span>
                                                </button>
                                              ))}
                                            </div>
                                          );
                                        })}
                                        {MOCK_SERVICES.filter(s => s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).length === 0 && (
                                          <p className="px-3 py-3 text-[0.875rem] text-[#555]">Layanan tidak ditemukan</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    {/* Main service */}
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="text-[0.875rem] font-medium text-[#1a1a1a]">{currentService.serviceName}</p>
                                        <p className="text-[0.875rem] text-[#555] mt-0.5">oleh {b.stylistName} · {formatRupiah(currentService.price)}</p>
                                      </div>
                                      <button
                                        onClick={() => setEditServiceId(b.id)}
                                        className="w-8 h-8 rounded-full bg-[#f0f0ee] flex items-center justify-center text-[#999] hover:bg-[#e2e2df] hover:text-[#444] transition-colors flex-shrink-0 mt-0.5"
                                      >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M10 1.5l2.5 2.5-8 8H2v-2.5l8-8z"/>
                                        </svg>
                                      </button>
                                    </div>

                                    {/* Additional services */}
                                    {additionalServices.map((sv, idx) => (
                                      <div key={idx} className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0f0f0]">
                                        <div>
                                          <p className="text-[0.8125rem] font-medium text-[#1a1a1a]">{sv.serviceName}</p>
                                          <p className="text-[0.8125rem] text-[#555]">{formatRupiah(sv.price)}</p>
                                        </div>
                                        <button
                                          onClick={() => removeAdditionalService(b.id, idx)}
                                          className="w-6 h-6 rounded-full flex items-center justify-center text-[#ccc] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors flex-shrink-0"
                                        >
                                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg>
                                        </button>
                                      </div>
                                    ))}

                                    {/* Add service picker */}
                                    {showServicePicker === b.id ? (
                                      <div className="relative z-20 mt-2">
                                        <div className="absolute top-0 left-0 right-0 bg-white border border-[#e0e0e0] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                                          {/* Search */}
                                          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f0f0f0]">
                                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#bbb" strokeWidth="1.8" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
                                            <input
                                              autoFocus
                                              type="text"
                                              placeholder="Cari layanan..."
                                              value={serviceSearchQuery}
                                              onChange={e => setServiceSearchQuery(e.target.value)}
                                              className="flex-1 text-[0.8125rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none bg-transparent"
                                            />
                                            <button
                                              onClick={() => { setShowServicePicker(null); setServiceSearchQuery(''); }}
                                              className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#ccc] hover:text-[#888] transition-colors"
                                            >
                                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg>
                                            </button>
                                          </div>
                                          {/* Results */}
                                          <div className="max-h-44 overflow-y-auto">
                                            {availableServices.filter(s => s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).length === 0 ? (
                                              <p className="px-3 py-3 text-[0.875rem] text-[#555]">Layanan tidak ditemukan</p>
                                            ) : (
                                              ['Hair','Colour','Face','Nail','Massage'].map(cat => {
                                                const catSvcs = availableServices.filter(s =>
                                                  s.categoryName === cat &&
                                                  s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
                                                );
                                                if (!catSvcs.length) return null;
                                                return (
                                                  <div key={cat}>
                                                    {!serviceSearchQuery && <p className="px-3 pt-2.5 pb-1 text-[0.6875rem] font-semibold text-[#555] uppercase tracking-wider">{cat}</p>}
                                                    {catSvcs.map(svc => (
                                                      <button
                                                        key={svc.id}
                                                        onClick={() => { addService(b.id, svc); setServiceSearchQuery(''); }}
                                                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#fafaf8] transition-colors border-b border-[#f9f9f9] last:border-0"
                                                      >
                                                        <span className="text-[0.8125rem] text-[#333]">{svc.name}</span>
                                                        <span className="text-[0.8125rem] text-[#555] ml-2 flex-shrink-0">{formatRupiah(svc.price)}</span>
                                                      </button>
                                                    ))}
                                                  </div>
                                                );
                                              })
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setShowServicePicker(b.id)}
                                        className="mt-2.5 flex items-center gap-1.5 text-[0.75rem] font-medium text-[#555] bg-[#f0f0ee] hover:bg-[#e5e5e2] px-3 py-1.5 rounded-lg transition-colors"
                                      >
                                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
                                        Tambah layanan
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Col 3: Add-ons + Catatan Terapis */}
                            <div className="pl-0 sm:pl-3 md:pl-6 pt-3 sm:pt-3 md:pt-0 md:border-l border-[#f0f0f0] flex flex-col gap-3 expanded-col-separator">
                              <div>
                                <p className="text-[0.6875rem] text-[#555] uppercase tracking-wider mb-2">Product Add-on</p>
                                {addOns.length === 0 && (
                                  <p className="text-[0.875rem] text-[#777] mb-1">Belum ada add-on</p>
                                )}
                                {addOns.map((ao, i) => (
                                  <div key={ao.id} className="flex items-center justify-between py-1.5 border-b border-[#f5f5f5] last:border-0">
                                    <span className="text-[0.8125rem] text-[#555]">{ao.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[0.875rem] font-medium text-[#444]">{formatRupiah(ao.price)}</span>
                                      <button
                                        onClick={() => removeAddOn(b.id, i)}
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[#ccc] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
                                      >
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {/* Product picker */}
                                {showProductPicker === b.id ? (
                                  <div className="relative z-20 mt-2">
                                    <div className="absolute top-0 left-0 right-0 bg-white border border-[#e0e0e0] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                                      {/* Search */}
                                      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f0f0f0]">
                                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#bbb" strokeWidth="1.8" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
                                        <input
                                          autoFocus
                                          type="text"
                                          placeholder="Cari produk..."
                                          value={productSearchQuery}
                                          onChange={e => setProductSearchQuery(e.target.value)}
                                          className="flex-1 text-[0.8125rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none bg-transparent"
                                        />
                                        <button
                                          onClick={() => { setShowProductPicker(null); setProductSearchQuery(''); }}
                                          className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#ccc] hover:text-[#888] transition-colors"
                                        >
                                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg>
                                        </button>
                                      </div>
                                      {/* Results */}
                                      <div className="max-h-44 overflow-y-auto">
                                        {(() => {
                                          const filtered = availableProducts.filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()));
                                          if (filtered.length === 0) return <p className="px-3 py-3 text-[0.875rem] text-[#555]">{availableProducts.length === 0 ? 'Semua produk sudah ditambahkan' : 'Produk tidak ditemukan'}</p>;
                                          return filtered.map(prod => (
                                            <button
                                              key={prod.id}
                                              onClick={() => { addProductToBooking(b.id, prod); setProductSearchQuery(''); }}
                                              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#fafaf8] transition-colors border-b border-[#f9f9f9] last:border-0"
                                            >
                                              <span className="text-[0.8125rem] text-[#333]">{prod.name}</span>
                                              <span className="text-[0.8125rem] text-[#555]">{formatRupiah(prod.price)}</span>
                                            </button>
                                          ));
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowProductPicker(b.id)}
                                    className="mt-2.5 flex items-center gap-1.5 text-[0.75rem] font-medium text-[#555] bg-[#f0f0ee] hover:bg-[#e5e5e2] px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
                                    Tambah add-on
                                  </button>
                                )}
                              </div>

                              {isTreatment && (
                                <div>
                                  <p className="text-[0.6875rem] text-[#555] uppercase tracking-wider mb-1.5">Catatan Terapis</p>
                                  <textarea
                                    value={notes}
                                    onChange={e => setNotesMap(p => ({ ...p, [b.id]: e.target.value }))}
                                    placeholder="Kondisi kulit, alergi, preferensi..."
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-xl border border-[#e8e8e8] text-[0.8125rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#bbb] resize-none leading-relaxed"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Pembayaran + Promo — sticky bottom */}
                          <div className="mt-6 pt-3 border-t border-[#f0f0f0] flex flex-col gap-2.5">

                            {/* Row 1: Status + Input pembayaran baru — same grid as columns above */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 payment-section-mobile">

                              {/* Card: Status pembayaran — col 1 */}
                              <div className="bg-white rounded-xl border border-[#efefed] px-4 sm:px-5 py-4 sm:py-5 flex flex-col gap-4 col-span-1 sm:col-span-2 md:col-span-1 payment-status-card-mobile">
                                {/* Label + badge row */}
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[0.75rem] text-[#555] uppercase tracking-wider font-semibold">Status Pembayaran</p>
                                  <span className={`shrink-0 text-[0.75rem] font-semibold px-3 py-1 rounded-full ${
                                    b.paymentStatus === 'PAID'    ? 'bg-[#dcfce7] text-[#16a34a]'
                                    : b.paymentStatus === 'DEPOSIT' ? 'bg-[#fef9c3] text-[#a16207]'
                                    : 'bg-[#f5f5f5] text-[#777]'
                                  }`}>
                                    {b.paymentStatus === 'PAID' ? 'Lunas' : b.paymentStatus === 'DEPOSIT' ? 'Deposit' : 'Belum bayar'}
                                  </span>
                                </div>
                                {/* Progress section */}
                                {(() => {
                                  const paid = b.paymentStatus === 'PAID' ? finalTotal : b.paymentStatus === 'DEPOSIT' ? Math.round(b.price * 0.5) : 0;
                                  const pct  = finalTotal > 0 ? Math.round((paid / finalTotal) * 100) : 0;
                                  return (
                                    <div className="flex flex-col gap-3">
                                      {/* Bar */}
                                      <div className="h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-500 ${
                                            b.paymentStatus === 'PAID'    ? 'bg-[#16a34a]'
                                            : b.paymentStatus === 'DEPOSIT' ? 'bg-[#f59e0b]'
                                            : 'bg-[#e5e5e3]'
                                          }`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                      {/* Terbayar / sisa */}
                                      <div className="flex items-end justify-between">
                                        <div>
                                          <p className="text-[1rem] font-bold text-[#1a1a1a]">{formatRupiah(paid)}</p>
                                          <p className="text-[0.75rem] text-[#777] mt-0.5">terbayar · {pct}%</p>
                                        </div>
                                        {b.paymentStatus === 'DEPOSIT' && (
                                          <div className="text-right">
                                            <p className="text-[1rem] font-semibold text-[#444]">{formatRupiah(finalTotal - paid)}</p>
                                            <p className="text-[0.75rem] text-[#777] mt-0.5">sisa</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Card: Input pembayaran baru */}
                              <div className="col-span-1 sm:col-span-2 md:col-span-2 bg-white rounded-xl border border-[#efefed] px-3 sm:px-4 py-3 sm:py-3 flex flex-col gap-2.5 payment-input-card-mobile">
                                <p className="text-[0.6875rem] text-[#555] uppercase tracking-wider font-medium">Input Pembayaran</p>
                                {/* Method pills */}
                                <div className="flex items-center gap-2">
                                  {(['CASH', 'TRANSFER', 'QRIS'] as const).map(m => (
                                    <button
                                      key={m}
                                      onClick={() => setPaymentMethodMap(p => ({ ...p, [b.id]: m }))}
                                      className={`h-7 px-3 text-[0.75rem] rounded-lg border transition-colors ${
                                        (paymentMethodMap[b.id] ?? 'CASH') === m
                                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                                          : 'bg-white text-[#555] border-[#e8e8e8] hover:border-[#bbb]'
                                      }`}
                                    >
                                      {m === 'CASH' ? 'Cash' : m === 'TRANSFER' ? 'Transfer' : 'QRIS'}
                                    </button>
                                  ))}
                                </div>
                                {/* Nominal input */}
                                <div className="flex items-center gap-2 bg-[#f8f8f6] rounded-lg px-3 h-9 focus-within:ring-1 focus-within:ring-[#ddd] transition-all">
                                  <span className="text-[0.875rem] text-[#777] shrink-0">
                                    {(paymentMethodMap[b.id] ?? 'CASH') === 'CASH' ? 'Uang diterima  Rp' : 'Nominal  Rp'}
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={paymentAmountMap[b.id] ?? ''}
                                    onChange={e => setPaymentAmountMap(p => ({ ...p, [b.id]: e.target.value.replace(/\D/g, '') }))}
                                    className="flex-1 text-[0.875rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none bg-transparent font-medium"
                                  />
                                </div>
                                {/* Cash calculator */}
                                {(paymentMethodMap[b.id] ?? 'CASH') === 'CASH' && (() => {
                                  const received = parseInt(paymentAmountMap[b.id] ?? '0', 10);
                                  const kembalian = received - finalTotal;
                                  return (
                                    <div className="flex items-center gap-3 px-3 py-2 bg-[#f8f8f6] rounded-lg">
                                      <div className="flex-1">
                                        <p className="text-[0.6875rem] text-[#777] uppercase tracking-wide">Tagihan</p>
                                        <p className="text-[0.9375rem] font-semibold text-[#1a1a1a]">{formatRupiah(finalTotal)}</p>
                                      </div>
                                      <div className="w-px h-8 bg-[#ebebeb]" />
                                      <div className="flex-1 text-right">
                                        <p className="text-[0.6875rem] text-[#777] uppercase tracking-wide">Kembalian</p>
                                        <p className={`text-[0.9375rem] font-semibold ${
                                          !paymentAmountMap[b.id] ? 'text-[#ccc]'
                                          : kembalian >= 0 ? 'text-[#16a34a]' : 'text-[#ef4444]'
                                        }`}>
                                          {!paymentAmountMap[b.id] ? '—' : kembalian >= 0 ? formatRupiah(kembalian) : `−${formatRupiah(Math.abs(kembalian))}`}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })()}
                                {/* Method + Proses */}
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled={!paymentAmountMap[b.id]}
                                    onClick={() => setConfirmDialog({
                                      bookingId: b.id,
                                      customerName: b.customerName,
                                      serviceName: currentService.serviceName,
                                      amount: parseInt(paymentAmountMap[b.id] ?? '0', 10),
                                      method: paymentMethodMap[b.id] ?? 'CASH',
                                      finalTotal,
                                    })}
                                    className="ml-auto h-8 px-4 bg-[#16a34a] text-white text-[0.75rem] font-semibold rounded-lg hover:bg-[#15803d] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
                                  >
                                    Proses Pembayaran
                                  </button>
                                </div>
                              </div>

                            </div>

                            {/* Row 2: Promo + Total */}
                            <div className="flex flex-col sm:flex-col md:flex-row items-start sm:items-start md:items-center gap-3 pt-2 border-t border-[#f8f8f6]">
                              {/* Promo */}
                              <div className="flex-1 flex flex-col gap-0.5">
                                {promoData?.appliedCode ? (
                                  <div className="flex items-center gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-2 py-1">
                                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2 2 4-4"/></svg>
                                    <span className="text-[0.75rem] font-medium text-[#16a34a]">{promoData.appliedCode}</span>
                                    <span className="text-[0.6875rem] text-[#4ade80]">−{formatRupiah(discount)}</span>
                                    <button onClick={() => removePromo(b.id)} className="ml-auto text-[0.6875rem] text-[#16a34a] hover:text-[#15803d] font-medium">✕</button>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex items-center gap-1.5 bg-white border border-[#e8e8e8] rounded-lg px-2 h-7 focus-within:border-[#bbb] transition-colors w-[8rem]">
                                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#ccc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2.5l4 4-7 7-4-4 7-7z"/><circle cx="5.5" cy="10.5" r="1"/></svg>
                                        <input
                                          placeholder="Kode promo"
                                          value={promoInputMap[b.id] ?? ''}
                                          onChange={e => setPromoInputMap(p => ({ ...p, [b.id]: e.target.value.toUpperCase() }))}
                                          onKeyDown={e => { if (e.key === 'Enter') applyPromo(b.id, totalPrice); }}
                                          className="w-full text-[0.75rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none bg-transparent uppercase tracking-wider"
                                        />
                                      </div>
                                      <button
                                        onClick={() => applyPromo(b.id, totalPrice)}
                                        className="h-7 px-3 bg-[#1a1a1a] text-white text-[0.6875rem] font-medium rounded-lg hover:bg-[#333] transition-colors shrink-0"
                                      >
                                        Terapkan
                                      </button>
                                    </div>
                                    {promoData?.error && (
                                      <p className="text-[0.6875rem] text-[#ef4444]">{promoData.error}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                              {/* Total */}
                              <div className="text-right shrink-0">
                                {discount > 0 && (
                                  <p className="text-[0.75rem] text-[#bbb] line-through">{formatRupiah(totalPrice)}</p>
                                )}
                                <p className="text-[1rem] font-semibold text-[#1a1a1a]">{formatRupiah(finalTotal)}</p>
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Card Layout */}
                    <div key={b.id} className="block md:hidden bg-white rounded-xl border border-[#f0f0f0] p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => toggleExpand(b.id)}>
                      {/* Header row - Avatar + Name + Time */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {/* Avatar with status icon */}
                          <div className="relative flex-shrink-0">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold" style={{ backgroundColor: avatarColor(b.customerName).bg, color: avatarColor(b.customerName).text }}>
                              {b.customerName.charAt(0)}
                            </div>
                            {(b.status === 'UPCOMING' || b.status === 'CONFIRMED') && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ring-2 ring-white" style={{ backgroundColor: sm.color }}>
                                {sm.icon && <div style={{ transform: 'scale(0.9)' }}>{sm.icon}</div>}
                              </div>
                            )}
                          </div>
                          {/* Name + Service */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.875rem] font-semibold text-[#1a1a1a] truncate">{b.customerName}</p>
                            <p className="text-[0.75rem] text-[#777] truncate">{b.serviceName}</p>
                          </div>
                        </div>
                        {/* Time */}
                        <span className="text-[0.8125rem] font-medium text-[#777] flex-shrink-0 tabular-nums">{b.timeSlot}</span>
                      </div>

                      {/* Status + Payment + Price row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {(b.status === 'UPCOMING' || b.status === 'CONFIRMED') && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[0.625rem] font-semibold border" style={{ backgroundColor: sm.bg, color: sm.color, borderColor: `${sm.color}30` }}>
                            {b.status === 'IN_PROGRESS' && (
                              <span className="w-1 h-1 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: sm.color }} />
                            )}
                            {sm.label}
                          </span>
                        )}
                        <span className={`text-[0.625rem] font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                          b.paymentStatus === 'PAID'    ? 'bg-[#dcfce7] text-[#16a34a]'
                          : b.paymentStatus === 'DEPOSIT' ? 'bg-[#fef9c3] text-[#a16207]'
                          : 'bg-[#fee2e2] text-[#dc2626]'
                        }`}>
                          {b.paymentStatus === 'PAID' ? 'Lunas' : b.paymentStatus === 'DEPOSIT' ? 'DP' : 'Belum bayar'}
                        </span>
                        <span className={`text-[0.625rem] font-medium px-2 py-1 rounded-full ml-auto flex-shrink-0 ${b.visitorType === 'WALK_IN' ? 'bg-[#fef3c2] text-[#92400e]' : 'bg-[#dbeafe] text-[#1e40af]'}`}>
                          {b.visitorType === 'WALK_IN' ? 'Walk-in' : 'Booking'}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mt-3 pt-3 border-t border-[#f0f0f0] flex items-center justify-between">
                        <span className="text-[0.75rem] text-[#777]">Total</span>
                        <p className="text-[0.9375rem] font-bold text-[#1a1a1a] tabular-nums">{formatRupiah(totalPrice)}</p>
                      </div>

                      {/* Expanded detail - Mobile */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#f0f0f0] bg-[#fafaf8] -mx-4 -mb-4 px-4 py-4 rounded-b-xl" onClick={e => e.stopPropagation()}>
                          {/* Simplified detail for mobile */}
                          <div className="flex flex-col gap-4 text-[0.8125rem]">
                            {/* Contact */}
                            <div>
                              <p className="text-[0.65rem] text-[#777] uppercase tracking-wider font-semibold mb-1.5">Kontak</p>
                              <p className="text-[0.875rem] font-medium text-[#1a1a1a] mb-2">{b.customerPhone}</p>
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[0.7rem] font-medium text-white bg-[#25d366] hover:opacity-85 transition-opacity"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                Chat WA
                              </a>
                            </div>

                            {/* Service info */}
                            <div>
                              <p className="text-[0.65rem] text-[#777] uppercase tracking-wider font-semibold mb-1.5">Layanan</p>
                              <p className="font-medium text-[#1a1a1a]">{currentService.serviceName}</p>
                              <p className="text-[0.75rem] text-[#777] mt-0.5">oleh {b.stylistName}</p>
                            </div>

                            {/* Payment info */}
                            <div>
                              <p className="text-[0.65rem] text-[#777] uppercase tracking-wider font-semibold mb-1.5">Pembayaran</p>
                              <div className="space-y-1.5">
                                <div className="flex justify-between">
                                  <span className="text-[#777]">Subtotal</span>
                                  <span className="font-medium text-[#1a1a1a]">{formatRupiah(totalPrice)}</span>
                                </div>
                                {discount > 0 && (
                                  <div className="flex justify-between text-[#16a34a]">
                                    <span>Diskon</span>
                                    <span className="font-medium">-{formatRupiah(discount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between pt-1.5 border-t border-[#e8e8e6] font-semibold">
                                  <span>Total</span>
                                  <span>{formatRupiah(finalTotal)}</span>
                                </div>
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

        </div>

      </div>
    </div>

    {/* Confirmation Modal */}
    {confirmDialog && (() => {
      const d = confirmDialog;
      const kembalian = d.method === 'CASH' ? d.amount - d.finalTotal : null;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setConfirmDialog(null)} />
          {/* Card */}
          <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full sm:w-[22rem] max-w-[22rem] p-4 sm:p-6 flex flex-col gap-5">
            {/* Header */}
            <div>
              <p className="text-[0.6875rem] text-[#777] uppercase tracking-wider font-medium mb-1">Konfirmasi Pembayaran</p>
              <p className="text-[1.125rem] font-bold text-[#1a1a1a]">{d.customerName}</p>
            </div>
            {/* Detail rows */}
            <div className="flex flex-col gap-3 bg-[#f8f8f6] rounded-xl px-4 py-3.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[0.8125rem] text-[#777]">Tagihan</span>
                <span className="text-[0.9375rem] font-semibold text-[#1a1a1a]">{formatRupiah(d.finalTotal)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[0.8125rem] text-[#777]">Metode</span>
                <span className="text-[0.8125rem] font-medium text-[#1a1a1a]">{d.method}</span>
              </div>
              {d.method === 'CASH' && (
                <>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[0.8125rem] text-[#777]">Uang diterima</span>
                    <span className="text-[0.8125rem] font-medium text-[#1a1a1a]">{formatRupiah(d.amount)}</span>
                  </div>
                  <div className="h-px bg-[#ebebeb]" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-[0.8125rem] font-semibold text-[#1a1a1a]">Kembalian</span>
                    <span className={`text-[1rem] font-bold ${(kembalian ?? 0) >= 0 ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>
                      {(kembalian ?? 0) >= 0 ? formatRupiah(kembalian ?? 0) : `−${formatRupiah(Math.abs(kembalian ?? 0))}`}
                    </span>
                  </div>
                </>
              )}
            </div>
            {/* Actions */}
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 h-10 rounded-xl border border-[#e8e8e8] text-[0.875rem] font-medium text-[#555] hover:bg-[#f5f5f3] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!d.customerName || !d.serviceName) return;

                  const timeSinceLastAction = Date.now() - lastActionTime;
                  if (timeSinceLastAction < 200) return;

                  const customerName = d.customerName;
                  const serviceName = d.serviceName;
                  setBookingStatusMap(m => ({ ...m, [d.bookingId]: 'COMPLETED' }));
                  setExpandedId(null);
                  setConfirmDialog(null);
                }}
                className="flex-1 h-10 rounded-xl bg-[#16a34a] text-white text-[0.875rem] font-semibold hover:bg-[#15803d] transition-colors"
              >
                Ya, Proses ✓
              </button>
            </div>
          </div>
        </div>
      );
    })()}

    {/* Decline Dialog Modal */}
    {declineDialog && (() => {
      const d = declineDialog;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setDeclineDialog(null)} />
          {/* Card */}
          <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full sm:w-[22rem] max-w-[22rem] p-4 sm:p-6 flex flex-col gap-5">
            {/* Header with close button */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.6875rem] text-[#777] uppercase tracking-wider font-medium mb-2">Tolak Booking</p>
                <p className="text-[1.125rem] font-bold text-[#1a1a1a]">{d.customerName}</p>
              </div>
              <button
                onClick={() => setDeclineDialog(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#aaa] hover:bg-[#f5f5f3] hover:text-[#444] transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
              </button>
            </div>
            {/* Reason input */}
            <div className="flex flex-col gap-2">
              <label className="text-[0.8125rem] text-[#555] font-medium">Alasan Penolakan</label>
              <textarea
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e8e8] text-[0.8125rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#ef4444] focus:ring-1 focus:ring-[#fecaca] transition-colors resize-none"
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
                className="flex-1 h-10 rounded-xl border border-[#e8e8e8] text-[0.875rem] font-medium text-[#555] hover:bg-[#f5f5f3] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!declineReason.trim() || !d.customerName) {
                    return;
                  }
                  const customerName = d.customerName;
                  const bookingId = d.bookingId;

                  console.log('🚫 Decline button clicked for:', customerName);

                  // Record this action time
                  setLastActionTime(Date.now());

                  // Close all dialogs
                  setConfirmDialog(null);
                  setDeclineDialog(null);
                  setExpandedId(null);
                  setDeclineReason('');

                  // Update booking status
                  setBookingStatusMap(m => ({ ...m, [bookingId]: 'CANCELLED' }));
                }}
                disabled={!declineReason.trim()}
                className="flex-1 h-10 rounded-xl bg-[#ef4444] text-white text-[0.875rem] font-semibold hover:bg-[#dc2626] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ef4444]"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
                Ya, Tolak
              </button>
            </div>
          </div>
        </div>
      );
    })()}

    {/* Proof zoom modal */}
    {proofZoom && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setProofZoom(null)}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col items-center gap-4 w-full" onClick={e => e.stopPropagation()}>
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.4)] w-full sm:w-[22rem] max-w-[22rem]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
              <div>
                <p className="text-[0.75rem] text-[#777] uppercase tracking-wider font-semibold">Bukti Transfer</p>
                <p className="text-[0.9375rem] font-bold text-[#1a1a1a] mt-0.5">
                  {effectiveBookings.find(b => b.id === proofZoom)?.customerName}
                </p>
              </div>
              <button onClick={() => setProofZoom(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#aaa] hover:bg-[#f5f5f3] hover:text-[#444] transition-colors">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
              </button>
            </div>
            {/* Mock full receipt */}
            <div className="bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] px-6 py-8 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#2563eb] flex items-center justify-center shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="2"/></svg>
              </div>
              <div className="text-center">
                <p className="text-[0.75rem] text-[#3b82f6] font-medium uppercase tracking-wider">BCA — Transfer Berhasil</p>
                <p className="text-[1.75rem] font-bold text-[#1e3a8a] mt-1">
                  Rp {(effectiveBookings.find(b => b.id === proofZoom)?.price ?? 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="w-full bg-white/60 rounded-xl px-4 py-3 flex flex-col gap-2 text-[0.8125rem]">
                <div className="flex justify-between">
                  <span className="text-[#555]">Ke rekening</span>
                  <span className="font-semibold text-[#1a1a1a]">1234 5678 9012</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Atas nama</span>
                  <span className="font-semibold text-[#1a1a1a]">Rara Beauty</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Tanggal</span>
                  <span className="font-semibold text-[#1a1a1a]">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">No. referensi</span>
                  <span className="font-semibold text-[#1a1a1a]">TRF{Date.now().toString().slice(-8)}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-white/50 text-[0.75rem]">Klik di luar untuk menutup</p>
        </div>
      </div>
    )}

    {/* Left drawer — Add customer */}
    {addDrawer !== 'CLOSED' && (
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={() => setAddDrawer('CLOSED')} />
        {/* Drawer */}
        <div className="relative z-10 w-full sm:w-[32rem] h-full bg-white shadow-[-4px_0_32px_rgba(0,0,0,0.12)] flex flex-col">
          {/* Header */}
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-[#f0f0f0] flex items-center justify-between">
            <div>
              <p className="text-[0.6875rem] text-[#777] uppercase tracking-wider font-medium mb-0.5">Tambah Kunjungan</p>
              <h3 className="text-[1.0625rem] font-bold text-[#1a1a1a]">
                {addDrawer === 'WALK_IN' ? 'Walk-in' : 'Booking Online'}
              </h3>
            </div>
            <button onClick={() => setAddDrawer('CLOSED')} className="w-8 h-8 rounded-full flex items-center justify-center text-[#aaa] hover:bg-[#f5f5f3] hover:text-[#444] transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
            </button>
          </div>


          {/* Form content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">

            {addDrawer === 'WALK_IN' && (
              <>
                {/* Nama */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.75rem] font-semibold text-[#444] uppercase tracking-wider">Nama Pelanggan <span className="text-[#ef4444]">*</span></label>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={walkInForm.name}
                    onChange={e => setWalkInForm(f => ({ ...f, name: e.target.value }))}
                    className="h-10 px-3.5 rounded-xl border border-[#e8e8e8] text-[0.9375rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#bbb] transition-colors"
                  />
                </div>
                {/* Nomor HP */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.75rem] font-semibold text-[#444] uppercase tracking-wider">Nomor HP</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="08xxxxxxxxxx"
                    value={walkInForm.phone}
                    onChange={e => setWalkInForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                    className="h-10 px-3.5 rounded-xl border border-[#e8e8e8] text-[0.9375rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#bbb] transition-colors"
                  />
                </div>
                {/* Layanan — searchable */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.75rem] font-semibold text-[#444] uppercase tracking-wider">Layanan <span className="text-[#ef4444]">*</span></label>
                  <div className="relative">
                    {/* Trigger */}
                    <button
                      type="button"
                      onClick={() => setDrawerServiceOpen(o => !o)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[#e8e8e8] text-[0.9375rem] text-left focus:outline-none focus:border-[#bbb] transition-colors bg-white flex items-center justify-between"
                    >
                      <span className={walkInForm.serviceId ? 'text-[#1a1a1a]' : 'text-[#ccc]'}>
                        {walkInForm.serviceId
                          ? MOCK_SERVICES.find(s => s.id === walkInForm.serviceId)?.name
                          : 'Pilih layanan...'}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${drawerServiceOpen ? 'rotate-180' : ''}`}><path d="M4 6l4 4 4-4"/></svg>
                    </button>
                    {/* Dropdown */}
                    {drawerServiceOpen && (
                      <div className="absolute top-11 left-0 right-0 z-20 bg-white border border-[#e0e0e0] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden">
                        {/* Search */}
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f0f0f0]">
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#bbb" strokeWidth="1.8" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
                          <input
                            autoFocus
                            type="text"
                            placeholder="Cari layanan..."
                            value={drawerServiceSearch}
                            onChange={e => setDrawerServiceSearch(e.target.value)}
                            className="flex-1 text-[0.875rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none bg-transparent"
                          />
                          {drawerServiceSearch && (
                            <button onClick={() => setDrawerServiceSearch('')} className="text-[#ccc] hover:text-[#888]">
                              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
                            </button>
                          )}
                        </div>
                        {/* List */}
                        <div className="max-h-[14rem] overflow-y-auto">
                          {(() => {
                            const q = drawerServiceSearch.toLowerCase();
                            const filtered = MOCK_SERVICES.filter(s => !q || s.name.toLowerCase().includes(q) || s.categoryName.toLowerCase().includes(q));
                            if (filtered.length === 0) return <p className="px-3 py-3 text-[0.875rem] text-[#555]">Layanan tidak ditemukan</p>;
                            const grouped = filtered.reduce<Record<string, typeof MOCK_SERVICES>>((acc, s) => {
                              (acc[s.categoryName] = acc[s.categoryName] ?? []).push(s); return acc;
                            }, {});
                            return Object.entries(grouped).map(([cat, svcs]) => (
                              <div key={cat}>
                                {!drawerServiceSearch && <p className="px-3 pt-2.5 pb-1 text-[0.6875rem] font-semibold text-[#555] uppercase tracking-wider">{cat}</p>}
                                {svcs.map(s => (
                                  <button
                                    key={s.id}
                                    onClick={() => { setWalkInForm(f => ({ ...f, serviceId: s.id })); setDrawerServiceOpen(false); setDrawerServiceSearch(''); }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#f8f8f6] transition-colors ${walkInForm.serviceId === s.id ? 'bg-[#f8f8f6]' : ''}`}
                                  >
                                    <span className={`text-[0.875rem] ${walkInForm.serviceId === s.id ? 'font-semibold text-[#1a1a1a]' : 'text-[#333]'}`}>{s.name}</span>
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
                  <label className="text-[0.75rem] font-semibold text-[#444] uppercase tracking-wider">Stylist / Terapis <span className="text-[#ef4444]">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {stylists.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setWalkInForm(f => ({ ...f, stylistId: s.id }))}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors ${walkInForm.stylistId === s.id ? 'border-[#1a1a1a] bg-[#f8f8f6]' : 'border-[#e8e8e8] hover:border-[#bbb]'}`}
                      >
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[0.6875rem] font-bold" style={{ backgroundColor: s.color }}>
                          {s.initials}
                        </div>
                        <span className="text-[0.8125rem] font-medium text-[#1a1a1a] leading-tight">{s.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {addDrawer === 'BOOKING' && (
              <>
                {/* Kode booking */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.75rem] font-semibold text-[#444] uppercase tracking-wider">Kode Booking</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="RB-2025-XXX"
                      value={bookingCodeInput}
                      onChange={e => setBookingCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 h-10 px-3.5 rounded-xl border border-[#e8e8e8] text-[0.9375rem] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#bbb] transition-colors uppercase tracking-wider"
                    />
                    <button className="h-10 px-4 bg-[#1a1a1a] text-white text-[0.8125rem] font-medium rounded-xl hover:bg-[#333] transition-colors shrink-0">
                      Cari
                    </button>
                  </div>
                </div>

                {/* Scan barcode */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.75rem] font-semibold text-[#444] uppercase tracking-wider">Atau Scan Barcode</label>
                  <button
                    onClick={startBarcodeScanner}
                    className="flex flex-col items-center justify-center gap-3 h-32 rounded-xl border-2 border-dashed border-[#e0e0e0] text-[#aaa] hover:border-[#bbb] hover:text-[#777] hover:bg-[#fafaf8] transition-colors"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
                      <rect x="7" y="7" width="3" height="10" rx="0.5"/><rect x="14" y="7" width="3" height="10" rx="0.5"/>
                    </svg>
                    <span className="text-[0.8125rem] font-medium">Tap untuk scan barcode</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer CTA */}
          {addDrawer === 'WALK_IN' && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#f0f0f0]">
              <button
                disabled={!walkInForm.name || !walkInForm.serviceId || !walkInForm.stylistId}
                onClick={() => {
                  const svc = MOCK_SERVICES.find(s => s.id === walkInForm.serviceId);
                  const stylist = stylists.find(s => s.id === walkInForm.stylistId);
                  const now = new Date();
                  const timeSlot = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                  const newId = `manual-${Date.now()}`;
                  const newBooking: import('@/features/dashboard/types/dashboard.types').DashboardBooking = {
                    id: newId,
                    bookingCode: `RB-MANUAL-${Date.now()}`,
                    customerName: walkInForm.name,
                    customerPhone: walkInForm.phone || '',
                    serviceName: svc?.name ?? '',
                    categoryName: svc?.categoryName ?? '',
                    stylistName: stylist?.name ?? '',
                    stylistInitials: stylist?.initials ?? '',
                    stylistColor: stylist?.color ?? '#eee',
                    date: now.toISOString().slice(0, 10),
                    timeSlot,
                    duration: svc?.duration ?? 30,
                    price: svc?.price ?? 0,
                    status: 'CONFIRMED',
                    paymentStatus: 'UNPAID',
                    paymentType: null,
                    visitorType: addDrawer === 'BOOKING' ? 'BOOKING' : 'WALK_IN',
                    addOns: [],
                    treatmentNotes: '',
                  };
                  setManualBookings(prev => [...prev, newBooking]);
                  setAddOnsMap(prev => ({ ...prev, [newId]: [] }));
                  setNotesMap(prev => ({ ...prev, [newId]: '' }));
                  setServiceMap(prev => ({ ...prev, [newId]: { serviceName: svc?.name ?? '', price: svc?.price ?? 0, categoryName: svc?.categoryName ?? '' } }));
                  setAdditionalServicesMap(prev => ({ ...prev, [newId]: [] }));
                  const cName = walkInForm.name;
                  const svcName = svc?.name ?? '';
                  setWalkInForm({ name: '', phone: '', serviceId: '', stylistId: '' });
                  setAddDrawer('CLOSED');
                }}
                className="w-full h-11 rounded-xl bg-[#1a1a1a] text-white text-[0.9375rem] font-semibold hover:bg-[#333] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              >
                Tambahkan ke Daftar
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Barcode Scanner Modal */}
    {barcodeScannerActive && (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80">
        <div className="relative w-full max-w-md mx-4">
          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-xl bg-black aspect-video object-cover"
          />

          {/* Canvas for scanning (hidden) */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="hidden"
          />

          {/* Scanner overlay */}
          <div className="absolute inset-0 rounded-xl">
            {/* Scanning frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-40 border-2 border-[#3b82f6] rounded-lg" />
            </div>

            {/* Corner indicators */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#3b82f6]" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#3b82f6]" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#3b82f6]" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#3b82f6]" />
          </div>

          {/* Close button */}
          <button
            onClick={stopBarcodeScanner}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Scanning text */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <div className="bg-black/70 px-4 py-2 rounded-full text-white text-sm font-medium">
              📸 Arahkan ke barcode/QR code
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Mobile Floating Action Button */}
    <div className="sm:hidden fixed bottom-6 right-4 z-40">
      <button
        onClick={() => setAddDropdownOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-[#1a1a1a] text-white shadow-lg hover:bg-[#333] transition-all active:scale-95 flex items-center justify-center"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
      {addDropdownOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setAddDropdownOpen(false)} />
          <div className="absolute bottom-20 right-0 z-40 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-[#efefed] overflow-hidden w-[13rem]">
            <button
              onClick={() => { setAddDrawer('WALK_IN'); setAddDropdownOpen(false); setDrawerServiceOpen(false); setDrawerServiceSearch(''); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f8f8f6] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#f0f0ee] flex items-center justify-center shrink-0">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="2.5"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg>
              </div>
              <div>
                <p className="text-[0.875rem] font-medium text-[#1a1a1a]">Walk-in</p>
                <p className="text-[0.75rem] text-[#777]">Datang langsung</p>
              </div>
            </button>
            <div className="h-px bg-[#f5f5f3] mx-4" />
            <button
              onClick={() => { setAddDrawer('BOOKING'); setAddDropdownOpen(false); setDrawerServiceOpen(false); setDrawerServiceSearch(''); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f8f8f6] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#f0f0ee] flex items-center justify-center shrink-0">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg>
              </div>
              <div>
                <p className="text-[0.875rem] font-medium text-[#1a1a1a]">Booking Online</p>
                <p className="text-[0.75rem] text-[#777]">Sudah punya kode booking</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>

    </>
  );
}
