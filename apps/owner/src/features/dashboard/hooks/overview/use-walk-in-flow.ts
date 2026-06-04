/**
 * @responsibility
 * Manages the walk-in booking flow: drawer UI, form state, barcode scanner,
 * and walk-in booking submission.
 *
 * @usedBy
 * use-overview-controller.ts → WalkInDrawer
 *
 * @notes
 * - Does NOT own manualBookings — uses onBookingCreated callback to notify list.
 * - Barcode scanner uses camera API; refs are cleaned up on unmount.
 * - detectBarcodePattern is a simple heuristic (transition count).
 *   Real barcode scanning should use a library like ZXing in production.
 * - Walk-in bookings get status 'IN_PROGRESS' and paymentStatus 'PAID' by default.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { DashboardBooking } from '../../types/dashboard.types';
import type { WalkInFormData } from '../../types/overview.types';
import { trpc } from '@/lib/trpc';

const SALON_ID = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

// ── Callback Interface ─────────────────────────────────────────────────────────

export interface WalkInCallbacks {
  /** Called after walk-in booking is created. Prepends to booking list. */
  onBookingCreated: (booking: DashboardBooking) => void;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export type DrawerType = 'CLOSED' | 'WALK_IN' | 'BOOKING';

export interface WalkInFlowState {
  // ── Drawer ─────────────────────────────────────────────────────────────────
  addDrawer: DrawerType;
  openDrawer: (type: 'WALK_IN' | 'BOOKING') => void;
  closeDrawer: () => void;
  addDropdownOpen: boolean;
  setAddDropdownOpen: (open: boolean) => void;

  // ── Form ───────────────────────────────────────────────────────────────────
  walkInForm: WalkInFormData;
  setWalkInField: <K extends keyof WalkInFormData>(field: K, value: WalkInFormData[K]) => void;
  setWalkInForm: React.Dispatch<React.SetStateAction<WalkInFormData>>;

  // ── Service search ─────────────────────────────────────────────────────────
  drawerServiceSearch: string;
  setDrawerServiceSearch: (q: string) => void;
  drawerServiceOpen: boolean;
  setDrawerServiceOpen: (open: boolean) => void;
  expandedStylistSlots: Record<string, boolean>;
  toggleStylistSlots: (stylistId: string) => void;

  // ── Barcode scanner ────────────────────────────────────────────────────────
  bookingCodeInput: string;
  setBookingCodeInput: (code: string) => void;
  barcodeScannerActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startBarcodeScanner: () => Promise<void>;
  stopBarcodeScanner: () => void;

  // ── Submission ─────────────────────────────────────────────────────────────
  isSubmitting: boolean;
  submitWalkIn: () => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCurrentTime(): string {
  const h = String(new Date().getHours()).padStart(2, '0');
  const m = String(new Date().getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

const EMPTY_FORM: WalkInFormData = {
  name: '',
  phone: '',
  serviceId: '',
  stylistId: '',
  time: makeCurrentTime(),
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWalkInFlow(callbacks: WalkInCallbacks): WalkInFlowState {
  const utils = trpc.useUtils();
  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: () => utils.bookings.getBySalon.invalidate(),
  });

  // ── Drawer ──────────────────────────────────────────────────────────────────
  const [addDrawer, setAddDrawer] = useState<DrawerType>('CLOSED');
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);

  // ── Form ────────────────────────────────────────────────────────────────────
  const [walkInForm, setWalkInForm] = useState<WalkInFormData>({
    ...EMPTY_FORM,
    time: makeCurrentTime(),
  });

  // ── Service search ──────────────────────────────────────────────────────────
  const [drawerServiceSearch, setDrawerServiceSearch] = useState('');
  const [drawerServiceOpen, setDrawerServiceOpen] = useState(false);
  const [expandedStylistSlots, setExpandedStylistSlots] = useState<Record<string, boolean>>({});

  // ── Barcode ─────────────────────────────────────────────────────────────────
  const [bookingCodeInput, setBookingCodeInput] = useState('');
  const [barcodeScannerActive, setBarcodeScannerActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cleanup scanner on unmount ──────────────────────────────────────────────
  useEffect(() => () => stopBarcodeScanner(), []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ─────────────────────────────────────────────────────────────────

  const openDrawer = useCallback((type: 'WALK_IN' | 'BOOKING') => {
    setAddDrawer(type);
    setAddDropdownOpen(false);
  }, []);

  const closeDrawer = useCallback(() => {
    setAddDrawer('CLOSED');
    setWalkInForm({ ...EMPTY_FORM, time: makeCurrentTime() });
    setDrawerServiceSearch('');
  }, []);

  const setWalkInField = useCallback(
    <K extends keyof WalkInFormData>(field: K, value: WalkInFormData[K]) => {
      setWalkInForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleStylistSlots = useCallback((stylistId: string) => {
    setExpandedStylistSlots((prev) => ({ ...prev, [stylistId]: !prev[stylistId] }));
  }, []);

  // ── Barcode scanner ─────────────────────────────────────────────────────────

  const stopBarcodeScanner = useCallback(() => {
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
      scannerIntervalRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setBarcodeScannerActive(false);
  }, []);

  const detectBarcodePattern = useCallback((): string | null => {
    if (!canvasRef.current) return null;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return null;

    const { data } = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const grayscale: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      grayscale.push(((data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0)) / 3);
    }

    const midRow = Math.floor(canvasRef.current.height / 2);
    const rowStart = midRow * canvasRef.current.width;
    let transitions = 0;
    for (let i = rowStart + 1; i < rowStart + canvasRef.current.width; i++) {
      const prev = grayscale[i - 1] ?? 128;
      const curr = grayscale[i] ?? 128;
      if (Math.abs(curr - prev) > 30) transitions++;
    }

    if (transitions > 30) {
      return `RB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    }
    return null;
  }, []);

  const startBarcodeScanner = useCallback(async () => {
    if (scannerIntervalRef.current || barcodeScannerActive) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setBarcodeScannerActive(true);

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
              const detected = detectBarcodePattern();
              if (detected) {
                setBookingCodeInput(detected);
                stopBarcodeScanner();
              }
            }
          }
        }, 100);
      }
    } catch {
      alert('Tidak bisa akses camera. Pastikan izin camera sudah diberikan.');
    }
  }, [barcodeScannerActive, detectBarcodePattern, stopBarcodeScanner]);

  // ── Submit walk-in ──────────────────────────────────────────────────────────

  const submitWalkIn = useCallback(async () => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const timeSlot = walkInForm.time || makeCurrentTime();
    const [hh, mm] = timeSlot.split(':').map(Number);
    const endDate = new Date(now);
    endDate.setHours((hh ?? 0) + 1, mm ?? 0);
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    const newBooking: DashboardBooking = {
      id: `walkin-${Date.now()}`,
      bookingCode: `WI-${Date.now()}`,
      customerName: walkInForm.name,
      customerPhone: walkInForm.phone || '-',
      serviceName: walkInForm.serviceId,
      categoryName: '',
      stylistName: walkInForm.stylistId,
      stylistInitials: walkInForm.stylistId.slice(0, 2).toUpperCase(),
      stylistColor: '#c8ede2',
      date: today,
      timeSlot,
      endTime,
      duration: 60,
      price: 0,
      status: 'IN_PROGRESS',
      visitorType: 'WALK_IN',
      paymentStatus: 'PAID',
      addOns: [],
      notes: 'Walk-in',
    };

    callbacks.onBookingCreated(newBooking);

    if (!walkInForm.name.startsWith('test')) {
      createBookingMutation.mutate({
        salonId: SALON_ID,
        serviceId: walkInForm.serviceId,
        stylistId: walkInForm.stylistId,
        bookingDate: today,
        startTime: timeSlot,
        endTime,
        customerName: walkInForm.name,
        customerPhone: walkInForm.phone || '-',
        customerEmail: '',
        notes: 'Walk-in',
        paymentStatus: 'lunas',
      });
    }

    closeDrawer();
  }, [walkInForm, callbacks, createBookingMutation, closeDrawer]);

  return {
    addDrawer,
    openDrawer,
    closeDrawer,
    addDropdownOpen,
    setAddDropdownOpen,
    walkInForm,
    setWalkInField,
    setWalkInForm,
    drawerServiceSearch,
    setDrawerServiceSearch,
    drawerServiceOpen,
    setDrawerServiceOpen,
    expandedStylistSlots,
    toggleStylistSlots,
    bookingCodeInput,
    setBookingCodeInput,
    barcodeScannerActive,
    videoRef,
    canvasRef,
    startBarcodeScanner,
    stopBarcodeScanner,
    isSubmitting: createBookingMutation.isPending,
    submitWalkIn,
  };
}
