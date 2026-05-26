/**
 * Test Supabase Connection
 *
 * Verifies that the Supabase client can connect and authenticate
 * Run with: node -r ts-node/register src/test-connection.ts
 */

import { createSupabaseClient, createSupabaseAdmin } from "./client";

async function testConnection() {
  console.log("\n🔍 Testing Supabase Connection...\n");

  try {
    // Test 1: Client connection
    console.log("1️⃣  Testing client connection...");
    const client = createSupabaseClient();

    // Try a simple query to test auth
    const { data: _data, error } = await client
      .from("users")
      .select("count", { count: "exact", head: true });

    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log("   ✅ Client connected! (table not created yet)\n");
      } else if (error.message.includes("JWT")) {
        console.log("   ❌ Authentication failed - check SUPABASE_ANON_KEY\n");
        return false;
      } else {
        console.log(`   ⚠️  Got error: ${error.message}\n`);
      }
    } else {
      console.log("   ✅ Client connected successfully!\n");
    }

    // Test 2: Admin connection
    console.log("2️⃣  Testing admin connection...");
    const admin = createSupabaseAdmin();

    const { data: _adminData, error: adminError } = await admin
      .from("users")
      .select("count", { count: "exact", head: true });

    if (adminError) {
      if (adminError.message.includes('relation "users" does not exist')) {
        console.log("   ✅ Admin connected! (table not created yet)\n");
      } else if (adminError.message.includes("JWT")) {
        console.log(
          "   ❌ Authentication failed - check SUPABASE_SERVICE_ROLE_KEY\n",
        );
        return false;
      } else {
        console.log(`   ⚠️  Got error: ${adminError.message}\n`);
      }
    } else {
      console.log("   ✅ Admin connected successfully!\n");
    }

    console.log("✅ All connections successful!\n");
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.log(`❌ Connection failed: ${error.message}\n`);
    } else {
      console.log(`❌ Connection failed: ${String(error)}\n`);
    }
    return false;
  }
}

// Run test
testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
