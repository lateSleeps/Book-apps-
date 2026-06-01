const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const SALON_ID = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

async function seedBookings() {
  try {
    console.log('=== SEED DATA DENGAN SERVICE ROLE ===\n');

    // Get existing services
    let { data: services, error: e1 } = await supabase
      .from('services')
      .select('id, duration')
      .eq('salon_id', SALON_ID);

    console.log(`💇 Services: ${services?.length || 0}`);

    if (!services || services.length === 0) {
      // Create services if not exist
      console.log('📝 Membuat services...');
      const { data: newServices, error: serviceError } = await supabase
        .from('services')
        .insert([
          { salon_id: SALON_ID, name: 'Ladies Haircut', price: 150000, duration: 30 },
          { salon_id: SALON_ID, name: 'Ladies Haircut+Wash', price: 180000, duration: 45 },
          { salon_id: SALON_ID, name: 'Hair Wash+Blowdry', price: 100000, duration: 30 },
          { salon_id: SALON_ID, name: 'Keratin Treatment', price: 500000, duration: 120 },
          { salon_id: SALON_ID, name: 'Color Treatment', price: 300000, duration: 75 },
          { salon_id: SALON_ID, name: 'Balayage', price: 450000, duration: 90 },
        ])
        .select();

      if (serviceError) {
        console.error('❌ Error creating services:', serviceError);
        return;
      }
      services = newServices;
      console.log(`  ✅ ${newServices.length} services created`);
    }

    // Get existing stylists
    let { data: stylists, error: e2 } = await supabase
      .from('stylists')
      .select('id')
      .eq('salon_id', SALON_ID);

    console.log(`👩‍💼 Stylists: ${stylists?.length || 0}\n`);

    if (!stylists || stylists.length === 0) {
      // Create users first
      console.log('👥 Membuat users/stylists...');
      const { data: newUsers, error: userError } = await supabase
        .from('users')
        .insert([
          { full_name: 'Dewi Rahayu', email: 'dewi@rarabeauty.com' },
          { full_name: 'Fajar Santoso', email: 'fajar@rarabeauty.com' },
          { full_name: 'Rina Kusuma', email: 'rina@rarabeauty.com' },
        ])
        .select();

      if (userError) {
        console.error('❌ Error creating users:', userError);
        return;
      }

      // Create stylists
      const { data: newStylists, error: stylistError } = await supabase
        .from('stylists')
        .insert(
          newUsers.map(u => ({
            salon_id: SALON_ID,
            user_id: u.id,
          }))
        )
        .select();

      if (stylistError) {
        console.error('❌ Error creating stylists:', stylistError);
        return;
      }
      stylists = newStylists;
      console.log(`  ✅ ${newStylists.length} stylists created\n`);
    }

    // Delete existing bookings
    console.log('🧹 Menghapus booking lama...');
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('salon_id', SALON_ID);

    if (deleteError) {
      console.error('❌ Error delete:', deleteError);
      return;
    }
    console.log('  ✅ Booking lama dihapus\n');

    // Create bookings
    console.log('📅 Membuat 10 booking baru...\n');

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

    const PAYMENT_STATUSES = ['paid', 'deposit', 'unpaid'];
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

    const newBookings = [];
    for (let i = 0; i < 10; i++) {
      const service = services[i % services.length];
      const stylist = stylists[i % stylists.length];
      const customer = CUSTOMERS[i];
      const startTime = generateTimeSlot(i);
      const endTime = generateEndTime(startTime, service.duration);
      const bookingDate = generateBookingDate(i);
      const paymentStatus = PAYMENT_STATUSES[Math.floor(i / 3)];

      const bookingData = {
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
      };
      // Don't set payment_status - let it use default
      newBookings.push(bookingData);
    }

    const { data: createdBookings, error: insertError } = await supabase
      .from('bookings')
      .insert(newBookings)
      .select();

    if (insertError) {
      console.error('❌ Error insert booking:', insertError);
      return;
    }

    console.log(`✅ Berhasil membuat ${createdBookings.length} booking!\n`);
    console.log('═══════════════════════════════════════════════════════════');
    createdBookings.forEach((b, i) => {
      console.log(`${i + 1}. ${b.customer_name}`);
      console.log(`   📅 ${b.booking_date} | ${b.start_time}-${b.end_time}`);
      console.log(`   💰 Payment: ${b.payment_status}`);
      console.log(`   📸 Bukti Transfer: ${b.payment_proof_url.replace('https://via.placeholder.com/', '')}`);
      console.log();
    });
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n✨ Selesai! 10 booking baru dengan bukti transfer sudah dibuat.\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

seedBookings();
