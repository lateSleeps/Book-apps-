import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const bookingId = formData.get('bookingId') as string | null;

  if (!file || !bookingId) {
    return NextResponse.json({ error: 'Missing file or bookingId' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `payment-proofs/${bookingId}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('bookings')
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from('bookings').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
