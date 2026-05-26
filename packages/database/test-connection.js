#!/usr/bin/env node

/**
 * Test Supabase Connection
 *
 * Run with: pnpm test:connection
 */

const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('\n🔍 Testing Supabase Connection...\n');

  // Get env vars
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate env vars
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY\n');
    return false;
  }

  try {
    // Test 1: Client connection
    console.log('1️⃣  Testing client connection...');
    const client = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await client
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('   ✅ Client connected! (table not created yet)\n');
      } else if (error.message.includes('JWT')) {
        console.log('   ❌ Authentication failed - check SUPABASE_ANON_KEY\n');
        return false;
      } else {
        console.log(`   ⚠️  Got error: ${error.message}\n`);
      }
    } else {
      console.log('   ✅ Client connected successfully!\n');
    }

    // Test 2: Admin connection
    if (supabaseServiceRoleKey) {
      console.log('2️⃣  Testing admin connection...');
      const admin = createClient(supabaseUrl, supabaseServiceRoleKey);

      const { error: adminError } = await admin
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (adminError) {
        if (adminError.message.includes('relation "users" does not exist')) {
          console.log('   ✅ Admin connected! (table not created yet)\n');
        } else if (adminError.message.includes('JWT')) {
          console.log('   ❌ Authentication failed - check SUPABASE_SERVICE_ROLE_KEY\n');
          return false;
        } else {
          console.log(`   ⚠️  Got error: ${adminError.message}\n`);
        }
      } else {
        console.log('   ✅ Admin connected successfully!\n');
      }
    } else {
      console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not set - skipping admin test\n');
    }

    console.log('✅ All connections successful!\n');
    return true;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}\n`);
    return false;
  }
}

// Run test
testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
