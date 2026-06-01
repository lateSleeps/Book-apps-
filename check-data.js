const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkData() {
  try {
    // Check salons
    const { data: salons, error: e1 } = await supabase.from('salons').select('id, name').limit(5);
    console.log('🏢 Salons:', salons?.length || 0);
    if (salons?.length) {
      salons.forEach(s => console.log(`  - ${s.id} | ${s.name}`));
    }

    // Check services
    const { data: services, error: e2 } = await supabase.from('services').select('id, name, salon_id').limit(5);
    console.log('\n💇 Services:', services?.length || 0);
    if (services?.length) {
      services.forEach(s => console.log(`  - ${s.id} | ${s.name} | salon: ${s.salon_id}`));
    }

    // Check stylists
    const { data: stylists, error: e3 } = await supabase.from('stylists').select('id, salon_id').limit(5);
    console.log('\n👩‍💼 Stylists:', stylists?.length || 0);
    if (stylists?.length) {
      stylists.forEach(s => console.log(`  - ${s.id} | salon: ${s.salon_id}`));
    }

    // Check bookings
    const { data: bookings, error: e4 } = await supabase.from('bookings').select('id, customer_name').limit(5);
    console.log('\n📅 Bookings:', bookings?.length || 0);
    if (bookings?.length) {
      bookings.forEach(b => console.log(`  - ${b.id} | ${b.customer_name}`));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkData();
