import { supabase } from '@rara/database';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { id, slug } = await request.json();

  if (!id || !slug) {
    return NextResponse.json({ error: 'id and slug required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('salons').update({ slug }).eq('id', id).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
