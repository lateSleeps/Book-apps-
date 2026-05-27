"use client";

import { useState } from "react";
import {
  useServices,
  useStylists,
  useBusinessHours,
  useCreateBooking,
} from "@/hooks";

interface BookingFormProps {
  salonId: string;
  salonName: string;
}

export function BookingForm({ salonId, salonName }: BookingFormProps) {
  const { services, isLoading: servicesLoading } = useServices(salonId);
  const { stylists, isLoading: stylistsLoading } = useStylists(salonId);
  const { hours, isLoading: hoursLoading } = useBusinessHours(salonId);
  const {
    createBooking,
    isLoading: bookingLoading,
    booking,
    error,
  } = useCreateBooking();

  const [formData, setFormData] = useState({
    serviceId: "",
    stylistId: "",
    bookingDate: "",
    startTime: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedService = services.find((s) => s.id === formData.serviceId);
    if (!selectedService) return;

    const endTime = new Date(`2000-01-01 ${formData.startTime}`);
    endTime.setMinutes(endTime.getMinutes() + selectedService.duration);
    const endTimeStr = endTime.toTimeString().slice(0, 5);

    createBooking({
      salonId,
      serviceId: formData.serviceId,
      stylistId: formData.stylistId,
      bookingDate: formData.bookingDate,
      startTime: formData.startTime,
      endTime: endTimeStr,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      notes: formData.notes,
    });
  };

  // Success screen
  if (booking) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-green-900">
          ✅ Booking Confirmed!
        </h2>
        <p className="mt-2 text-green-700">
          Your booking has been created successfully
        </p>
        <div className="mt-4 rounded bg-white p-4">
          <p className="font-mono text-lg font-bold text-green-600">
            Confirmation Code: {booking.confirmation_code}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            A confirmation will be sent to {formData.customerEmail}
          </p>
        </div>
      </div>
    );
  }

  const isLoading =
    servicesLoading || stylistsLoading || hoursLoading || bookingLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border p-6">
      <h2 className="text-2xl font-bold">Book at {salonName}</h2>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error}
        </div>
      )}

      {/* Service Selection */}
      <div>
        <label className="block text-sm font-medium">Service *</label>
        <select
          value={formData.serviceId}
          onChange={(e) =>
            setFormData({ ...formData, serviceId: e.target.value })
          }
          className="mt-1 w-full rounded border p-2"
          required
          disabled={isLoading}
        >
          <option value="">Select a service...</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - Rp{(service.price / 1000).toFixed(0)}k (
              {service.duration}min)
            </option>
          ))}
        </select>
      </div>

      {/* Stylist Selection */}
      <div>
        <label className="block text-sm font-medium">Stylist *</label>
        <select
          value={formData.stylistId}
          onChange={(e) =>
            setFormData({ ...formData, stylistId: e.target.value })
          }
          className="mt-1 w-full rounded border p-2"
          required
          disabled={isLoading}
        >
          <option value="">Select a stylist...</option>
          {stylists.map((stylist) => (
            <option key={stylist.id} value={stylist.id}>
              {stylist.user?.full_name || "Unknown"}
            </option>
          ))}
        </select>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Booking Date *</label>
          <input
            type="date"
            value={formData.bookingDate}
            onChange={(e) =>
              setFormData({ ...formData, bookingDate: e.target.value })
            }
            className="mt-1 w-full rounded border p-2"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Start Time *</label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
            className="mt-1 w-full rounded border p-2"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Customer Info */}
      <div>
        <label className="block text-sm font-medium">Full Name *</label>
        <input
          type="text"
          value={formData.customerName}
          onChange={(e) =>
            setFormData({ ...formData, customerName: e.target.value })
          }
          className="mt-1 w-full rounded border p-2"
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Phone *</label>
          <input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) =>
              setFormData({ ...formData, customerPhone: e.target.value })
            }
            className="mt-1 w-full rounded border p-2"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email *</label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) =>
              setFormData({ ...formData, customerEmail: e.target.value })
            }
            className="mt-1 w-full rounded border p-2"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1 w-full rounded border p-2"
          rows={3}
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {bookingLoading ? "Booking..." : "Confirm Booking"}
      </button>
    </form>
  );
}
