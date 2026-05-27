const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mezitgxxjbujitpanmnr.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function getSalonId() {
  const { data, error } = await supabase
    .from('salons')
    .select('id, name')
    .limit(1)

  if (error) {
    console.error('Error:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('Salon ID:', data[0].id)
    console.log('Salon Name:', data[0].name)
  }
}

getSalonId()
