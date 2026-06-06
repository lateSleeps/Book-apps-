/**
 * @responsibility
 * API communication layer for booking operations.
 * All HTTP/tRPC calls for bookings go through this service.
 *
 * @usedBy
 * use-booking-actions, use-walk-in-flow, use-payment
 *
 * @notes
 * tRPC mutations are initialized in hooks (React context required).
 * This file exports pure async functions for non-tRPC calls (e.g. file upload).
 * tRPC mutation wrappers are in the hooks that use them.
 */

/**
 * Uploads a payment proof image to Supabase storage.
 * Returns the public URL of the uploaded file.
 *
 * @param file - Image file to upload
 * @param bookingId - ID of the booking this proof belongs to
 * @returns Public URL string
 * @throws Error if upload fails
 */
export async function uploadPaymentProof(file: File, bookingId: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bookingId', bookingId);

  const res = await fetch('/api/upload-proof', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error((err as { error?: string }).error ?? 'Upload failed');
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}

/**
 * Builds a WhatsApp deep link URL for a given phone number and message.
 *
 * @param phone - Phone number (Indonesian format, e.g. "081234567890")
 * @param message - Pre-filled message text
 * @returns WhatsApp URL string
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = phone.replace(/^0/, '62').replace(/\D/g, '');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
