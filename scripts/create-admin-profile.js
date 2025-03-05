// This script creates a profile for the admin user directly using SQL
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminFullName = process.env.ADMIN_FULL_NAME || "System Administrator";
const adminPhone = process.env.ADMIN_PHONE || "";

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

if (!adminEmail || !adminPassword) {
  console.error("Missing admin credentials in environment variables");
  console.error("Please ensure ADMIN_EMAIL and ADMIN_PASSWORD are set");
  process.exit(1);
}

console.log("Using admin email:", adminEmail);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminProfile() {
  try {
    console.log("Starting admin profile creation process...");

    // First, check and delete existing user if necessary
    console.log("Checking for existing user...");
    const { data: existingUsers, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      throw listError;
    }

    const existingUser = existingUsers?.users?.find(
      (u) => u.email === adminEmail
    );

    if (existingUser) {
      console.log("Found existing user, deleting...");
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        existingUser.id
      );
      if (deleteError) {
        console.error("Error deleting existing user:", deleteError);
        throw deleteError;
      }
      console.log("Existing user deleted successfully");
    }

    // Wait a moment to ensure deletion is processed
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create new user
    console.log("Creating new admin user...");
    const { data: authData, error: createError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: adminFullName,
          phone: adminPhone,
        },
        role: "admin",
      });

    if (createError) {
      console.error("Error creating user:", createError);
      throw createError;
    }

    if (!authData.user) {
      throw new Error("No user data returned from creation");
    }

    const userId = authData.user.id;
    console.log("User created successfully with ID:", userId);

    // Delete existing profile if exists
    console.log("Cleaning up existing profile...");
    const { error: deleteProfileError } = await supabase
      .from("profiles")
      .delete()
      .eq("email", adminEmail);

    if (deleteProfileError) {
      console.log(
        "Note: No existing profile found or error deleting:",
        deleteProfileError
      );
    }

    // Create new profile
    console.log("Creating admin profile...");
    const now = new Date().toISOString();
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      email: adminEmail,
      role: "admin",
      full_name: adminFullName,
      phone: adminPhone,
      created_at: now,
      updated_at: now,
    });

    if (insertError) {
      console.error("Error creating profile:", insertError);
      throw insertError;
    }

    console.log(`
    Admin user created successfully!
    
    NEXT STEPS:
    1. Go to Supabase Dashboard > Authentication > Users
    2. Verify the admin user exists
    3. Try logging in at your application with:
       Email: ${adminEmail}
       Password: ${adminPassword}
    
    If you cannot log in:
    1. Go to Authentication > Users
    2. Find your admin user
    3. Click "Reset Password"
    4. Use the reset password link to set a new password
    
    Make sure these settings are correct in Supabase:
    1. Authentication > Providers:
       - Email auth is enabled
       - "Confirm email" is set to "Optional"
    
    2. Database > Policies (for profiles table):
       - RLS is enabled
       - Policies allow proper access
    
    3. SQL to fix permissions if needed:
       ALTER USER authenticated WITH SUPERUSER;
       GRANT USAGE ON SCHEMA public TO authenticated;
       GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
    `);

    process.exit(0);
  } catch (error) {
    console.error("Error in admin profile creation:", error);
    process.exit(1);
  }
}

createAdminProfile();
