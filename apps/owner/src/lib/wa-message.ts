export type WaBookingData = {
  customerName: string;
  customerPhone: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  bookingCode: string;
};

export function buildWAMessage(data: WaBookingData): string {
  const phone = data.customerPhone.replace(/\D/g, '').replace(/^0/, '62');
  const message = encodeURIComponent(
    `Halo ${data.customerName}! 🌸

Booking kamu di *Rara Beauty Jakarta* telah *dikonfirmasi*! ✅

📋 *Detail Booking:*
- Layanan: ${data.serviceName}
- Tanggal: ${data.date}
- Waktu: ${data.timeSlot}
- Kode Booking: ${data.bookingCode}

⏰ Mohon datang *10 menit sebelum* sesi dimulai. Toleransi keterlambatan maksimal 15 menit — jika melebihi, DP tidak dapat dikembalikan.

🔍 Cek detail booking kamu di:
localhost:3002/check-booking

Sampai jumpa! 💖`
  );
  return `https://wa.me/${phone}?text=${message}`;
}
