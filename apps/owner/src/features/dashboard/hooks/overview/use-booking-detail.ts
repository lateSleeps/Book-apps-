/**
 * @responsibility
 * Manages per-booking detail state: add-ons, service edits, notes,
 * and picker UI state (which dropdown is open, search queries).
 *
 * @usedBy
 * use-overview-controller.ts → BookingDetailPanel
 *
 * @notes
 * - Receives `expandedId` as a primitive data dependency (not a hook).
 *   Reacts to row collapse to reset picker state. Does NOT own expandedId.
 * - Initialized from upcomingBookings when API data arrives.
 * - serviceMap and additionalServicesMap hold optimistic local edits
 *   that will be persisted when a save mutation is called (future feature).
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AddOn } from '../../types/dashboard.types';
import type { MockProduct, MockService, ServiceData } from '../../types/overview.types';
import { useDashboardData } from '../use-dashboard-data';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BookingDetailState {
  // ── Add-ons ────────────────────────────────────────────────────────────────
  addOnsMap: Record<string, AddOn[]>;
  removeAddOn: (bookingId: string, idx: number) => void;
  addProduct: (bookingId: string, product: MockProduct) => void;

  // ── Services ───────────────────────────────────────────────────────────────
  serviceMap: Record<string, ServiceData>;
  additionalServicesMap: Record<string, ServiceData[]>;
  changeService: (bookingId: string, svc: MockService) => void;
  addService: (bookingId: string, svc: MockService) => void;
  removeAdditionalService: (bookingId: string, idx: number) => void;

  // ── Notes ──────────────────────────────────────────────────────────────────
  notesMap: Record<string, string>;
  setNote: (bookingId: string, note: string) => void;

  // ── Picker UI state ────────────────────────────────────────────────────────
  editServiceId: string | null;
  setEditServiceId: (id: string | null) => void;
  showServicePicker: string | null;
  setShowServicePicker: (id: string | null) => void;
  showProductPicker: string | null;
  setShowProductPicker: (id: string | null) => void;
  serviceSearchQuery: string;
  setServiceSearchQuery: (q: string) => void;
  productSearchQuery: string;
  setProductSearchQuery: (q: string) => void;

  /** Clears all picker UI state — called when row collapses */
  resetPickerState: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBookingDetail(expandedId: string | null): BookingDetailState {
  const { upcomingBookings } = useDashboardData();

  // ── Data maps ───────────────────────────────────────────────────────────────
  const [addOnsMap, setAddOnsMap] = useState<Record<string, AddOn[]>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [serviceMap, setServiceMap] = useState<Record<string, ServiceData>>({});
  const [additionalServicesMap, setAdditionalServicesMap] = useState<Record<string, ServiceData[]>>(
    {}
  );

  // ── Picker UI state ─────────────────────────────────────────────────────────
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [showServicePicker, setShowServicePicker] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState<string | null>(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // ── Initialize from API data ────────────────────────────────────────────────
  // Syncs add-ons, notes, and service data when upcomingBookings updates.
  useEffect(() => {
    if (!upcomingBookings?.length) return;

    const aMap: Record<string, AddOn[]> = {};
    const nMap: Record<string, string> = {};
    const sMap: Record<string, ServiceData> = {};

    upcomingBookings.forEach((b) => {
      aMap[b.id] = b.addOns ? [...b.addOns] : [];
      nMap[b.id] = b.notes ?? '';
      sMap[b.id] = { serviceName: b.serviceName, price: b.price, categoryName: b.categoryName };
    });

    setAddOnsMap(aMap);
    setNotesMap(nMap);
    setServiceMap(sMap);
  }, [upcomingBookings]);

  // ── Reset picker state when row collapses ───────────────────────────────────
  // expandedId is the single source of truth (owned by use-booking-list).
  // This hook reacts to it without owning or mirroring it.
  useEffect(() => {
    if (!expandedId) {
      resetPickerState();
    }
  }, [expandedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ─────────────────────────────────────────────────────────────────

  const resetPickerState = useCallback(() => {
    setEditServiceId(null);
    setShowServicePicker(null);
    setShowProductPicker(null);
    setServiceSearchQuery('');
    setProductSearchQuery('');
  }, []);

  const removeAddOn = useCallback((bookingId: string, idx: number) => {
    setAddOnsMap((prev) => ({
      ...prev,
      [bookingId]: prev[bookingId]?.filter((_, i) => i !== idx) ?? [],
    }));
  }, []);

  const addProduct = useCallback((bookingId: string, product: MockProduct) => {
    const newAddon: AddOn = { id: `ao-${Date.now()}`, name: product.name, price: product.price };
    setAddOnsMap((prev) => ({ ...prev, [bookingId]: [...(prev[bookingId] ?? []), newAddon] }));
    setShowProductPicker(null);
  }, []);

  const changeService = useCallback((bookingId: string, svc: MockService) => {
    setServiceMap((prev) => ({
      ...prev,
      [bookingId]: { serviceName: svc.name, price: svc.price, categoryName: svc.categoryName },
    }));
    setEditServiceId(null);
  }, []);

  const addService = useCallback((bookingId: string, svc: MockService) => {
    const newService: ServiceData = {
      serviceName: svc.name,
      price: svc.price,
      categoryName: svc.categoryName,
    };
    setAdditionalServicesMap((prev) => ({
      ...prev,
      [bookingId]: [...(prev[bookingId] ?? []), newService],
    }));
    setShowServicePicker(null);
  }, []);

  const removeAdditionalService = useCallback((bookingId: string, idx: number) => {
    setAdditionalServicesMap((prev) => ({
      ...prev,
      [bookingId]: prev[bookingId]?.filter((_, i) => i !== idx) ?? [],
    }));
  }, []);

  const setNote = useCallback((bookingId: string, note: string) => {
    setNotesMap((prev) => ({ ...prev, [bookingId]: note }));
  }, []);

  return {
    addOnsMap,
    removeAddOn,
    addProduct,
    serviceMap,
    additionalServicesMap,
    changeService,
    addService,
    removeAdditionalService,
    notesMap,
    setNote,
    editServiceId,
    setEditServiceId,
    showServicePicker,
    setShowServicePicker,
    showProductPicker,
    setShowProductPicker,
    serviceSearchQuery,
    setServiceSearchQuery,
    productSearchQuery,
    setProductSearchQuery,
    resetPickerState,
  };
}
