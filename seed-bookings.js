const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const SALON_ID = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

const CUSTOMERS = [
  { name: 'Siti Nurhaliza', phone: '081234567890', email: 'siti@email.com' },
  { name: 'Budi Santoso', phone: '081234567891', email: 'budi@email.com' },
  { name: 'Ani Wijaya', phone: '081234567892', email: 'ani@email.com' },
  { name: 'Raka Pratama', phone: '081234567893', email: 'raka@email.com' },
  { name: 'Lisa Manobal', phone: '081234567894', email: 'lisa@email.com' },
  { name: 'Joko Anwar', phone: '081234567895', email: 'joko@email.com' },
  { name: 'Putri Maharani', phone: '081234567896', email: 'putri@email.com' },
  { name: 'Bambang Irawan', phone: '081234567897', email: 'bambang@email.com' },
  { name: 'Citra Dewi', phone: '081234567898', email: 'citra@email.com' },
  { name: 'Eka Supriatna', phone: '081234567899', email: 'eka@email.com' },
];

const PAYMENT_STATUSES = ['PAID', 'DEPOSIT', 'UNPAID'];
const BOOKING_STATUSES = ['UPCOMING', 'CONFIRMED', 'COMPLETED'];

function generateBookingDate(index) {
  const today = new Date();
  const daysOffset = Math.floor(index / 2);
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

function generateTimeSlot(index) {
  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  return times[index % times.length];
}

function generateEndTime(startTime, duration) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

function generateConfirmationCode() {
  return 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

async function seedBookings() {
  try {
    console.log('📦 Mengambil data services dan stylists...');

    // Get services
    const { data: services, error: serviceError } = await supabase
      .from('services')
      .select('id, duration')
      .eq('salon_id', SALON_ID)
      .limit(10);

    if (serviceError || !services || services.length === 0) {
      console.error('❌ Error atau tidak ada services:', serviceError);
      return;
    }

    // Get stylists
    const { data: stylists, error: stylistError } = await supabase
      .from('stylists')
      .select('id')
      .eq('salon_id', SALON_ID)
      .limit(10);

    if (stylistError || !stylists || stylists.length === 0) {
      console.error('❌ Error atau tidak ada stylists:', stylistError);
      return;
    }

    console.log(`✅ Found ${services.length} services dan ${stylists.length} stylists\n`);

    console.log('🧹 Menghapus semua booking lama untuk salon:', SALON_ID);
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('salon_id', SALON_ID);

    if (deleteError) {
      console.error('❌ Error saat menghapus booking:', deleteError);
      return;
    }

    console.log('✅ Booking lama berhasil dihapus');

    // Generate new bookings with real IDs
    const newBookings = [];
    for (let i = 0; i < 10; i++) {
      const service = services[i % services.length];
      const stylist = stylists[i % stylists.length];
      const customer = CUSTOMERS[i];
      const startTime = generateTimeSlot(i);
      const endTime = generateEndTime(startTime, service.duration);
      const bookingDate = generateBookingDate(i);
      const paymentStatus = PAYMENT_STATUSES[Math.floor(i / 3)];

      newBookings.push({
        salon_id: SALON_ID,
        service_id: service.id,
        stylist_id: stylist.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        confirmation_code: generateConfirmationCode(),
        status: BOOKING_STATUSES[i % BOOKING_STATUSES.length],
        notes: '',
        payment_proof_url: `https://via.placeholder.com/300x400?text=Bukti+Transfer+${i + 1}`,
        payment_status: paymentStatus,
        promo_code: null,
        addons: null,
      });
    }

    console.log('\n📝 Membuat 10 booking baru...');
    const { data: createdBookings, error: insertError } = await supabase
      .from('bookings')
      .insert(newBookings)
      .select();

    if (insertError) {
      console.error('❌ Error saat insert booking:', insertError);
      return;
    }

    console.log(`✅ Berhasil membuat ${createdBookings.length} booking baru!\n`);
    console.log('📋 Booking yang dibuat:\n');
    createdBookings.forEach((b, i) => {
      const service = services.find(s => s.id === b.service_id);
      console.log(`${i + 1}. ${b.customer_name}`);
      console.log(`   📅 Tanggal: ${b.booking_date} ${b.start_time}-${b.end_time}`);
      console.log(`   💰 Status: ${b.payment_status}`);
      console.log(`   📸 Bukti: ${b.payment_proof_url}\n`);
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

seedBookings();
