const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const SALON_ID = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

// Get user ID for stylists (need to create users first)
async function getOrCreateUser(fullName, email) {
  try {
    // Try to find existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return existingUser.id;
    }

    // Create new user if doesn't exist
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        full_name: fullName,
        email: email,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return newUser.id;
  } catch (err) {
    console.error('Error in getOrCreateUser:', err.message);
    return null;
  }
}

async function seedComplete() {
  try {
    console.log('=== SEED DATA LENGKAP ===\n');

    // Step 1: Create Users/Stylists
    console.log('👥 Membuat data stylist...');
    const stylistNames = [
      { name: 'Dewi Rahayu', email: 'dewi@rarabeauty.com' },
      { name: 'Fajar Santoso', email: 'fajar@rarabeauty.com' },
      { name: 'Rina Kusuma', email: 'rina@rarabeauty.com' },
    ];

    const stylistIds = [];
    for (const stylist of stylistNames) {
      const userId = await getOrCreateUser(stylist.name, stylist.email);
      if (userId) {
        // Create stylist record
        const { data, error } = await supabase
          .from('stylists')
          .insert({
            salon_id: SALON_ID,
            user_id: userId,
          })
          .select()
          .single();

        if (error) {
          console.log(`⚠️  Stylist ${stylist.name} mungkin sudah ada`);
        } else {
          stylistIds.push(data.id);
          console.log(`  ✅ ${stylist.name}`);
        }
      }
    }

    // If stylists already exist, fetch them
    if (stylistIds.length === 0) {
      const { data } = await supabase
        .from('stylists')
        .select('id')
        .eq('salon_id', SALON_ID);
      stylistIds.push(...data.map(s => s.id));
      console.log(`  ✅ ${data.length} stylists sudah ada`);
    }

    // Step 2: Create Services
    console.log('\n💇 Membuat data layanan...');
    const services = [
      { name: 'Ladies Haircut', price: 150000, duration: 30 },
      { name: 'Ladies Haircut+Wash', price: 180000, duration: 45 },
      { name: 'Hair Wash+Blowdry', price: 100000, duration: 30 },
      { name: 'Keratin Treatment', price: 500000, duration: 120 },
      { name: 'Color Treatment', price: 300000, duration: 75 },
      { name: 'Balayage', price: 450000, duration: 90 },
    ];

    const serviceIds = [];
    for (const service of services) {
      const { data, error } = await supabase
        .from('services')
        .insert({
          salon_id: SALON_ID,
          name: service.name,
          price: service.price,
          duration: service.duration,
          category_id: '8e9b7d4c-6f5a-11ed-81ce-0242ac130003', // Default category
        })
        .select()
        .single();

      if (error) {
        console.log(`⚠️  ${service.name} mungkin sudah ada`);
      } else {
        serviceIds.push(data.id);
        console.log(`  ✅ ${service.name}`);
      }
    }

    if (serviceIds.length === 0) {
      const { data } = await supabase
        .from('services')
        .select('id')
        .eq('salon_id', SALON_ID);
      serviceIds.push(...data.map(s => s.id));
      console.log(`  ✅ ${data.length} services sudah ada`);
    }

    // Step 3: Delete existing bookings
    console.log('\n🧹 Menghapus booking lama...');
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('salon_id', SALON_ID);

    if (deleteError) {
      console.error('❌ Error delete:', deleteError);
      return;
    }
    console.log('  ✅ Booking lama dihapus');

    // Step 4: Create bookings
    console.log('\n📅 Membuat 10 booking baru...\n');

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

    const newBookings = [];
    for (let i = 0; i < 10; i++) {
      const serviceId = serviceIds[i % serviceIds.length];
      const stylistId = stylistIds[i % stylistIds.length];

      // Get service duration
      const { data: serviceData } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single();

      const duration = serviceData?.duration || 30;
      const customer = CUSTOMERS[i];
      const startTime = generateTimeSlot(i);
      const endTime = generateEndTime(startTime, duration);
      const bookingDate = generateBookingDate(i);
      const paymentStatus = PAYMENT_STATUSES[Math.floor(i / 3)];

      newBookings.push({
        salon_id: SALON_ID,
        service_id: serviceId,
        stylist_id: stylistId,
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
      });
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
      console.log(`   💰 ${b.payment_status} | 📸 ${b.payment_proof_url}`);
      console.log();
    });
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n✨ Selesai! Database sudah siap dengan data sampel.\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

seedComplete();
