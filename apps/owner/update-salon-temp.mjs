import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const raraBeautyId = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

try {
  const { data, error } = await supabase
    .from('salons')
    .update({ slug: 'rara-beauty' })
    .eq('id', raraBeautyId)
    .select();

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✓ Updated salon:', JSON.stringify(data, null, 2));
  }
} catch (err) {
  console.error('Exception:', err);
}
