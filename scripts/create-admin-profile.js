// This script creates a profile for the admin user directly using SQL
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

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
    console.log("Creating admin profile...");

    // First, check if user exists in auth
    console.log("Checking if user exists...");
    const { data: existingUsers, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      throw listError;
    }

    const existingUser = existingUsers.users.find(
      (user) => user.email === adminEmail
    );
    let userId;

    if (existingUser) {
      console.log("User already exists in auth system");
      userId = existingUser.id;

      // Update existing user with superuser privileges
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          app_metadata: {
            is_superuser: true,
            can_create_role: true,
            can_create_db: true,
            can_bypass_rls: true,
            can_initiate_replication: true,
          },
          user_metadata: {
            role: "admin",
          },
        }
      );

      if (updateError) {
        console.error("Error updating user privileges:", updateError);
        throw updateError;
      }
    } else {
      // Create new user if doesn't exist
      console.log("Creating new user with email:", adminEmail);
      const { data: authData, error: signUpError } =
        await supabase.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          app_metadata: {
            is_superuser: true,
            can_create_role: true,
            can_create_db: true,
            can_bypass_rls: true,
            can_initiate_replication: true,
          },
          user_metadata: {
            role: "admin",
          },
        });

      if (signUpError) {
        console.error("Error creating user:", signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error("No user data returned from signup");
      }

      userId = authData.user.id;
      console.log("User created successfully with ID:", userId);
    }

    // Check if profile exists
    console.log("Checking if profile exists...");
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.error("Error checking profile:", profileCheckError);
      throw profileCheckError;
    }

    const now = new Date().toISOString();

    if (existingProfile) {
      console.log("Profile already exists, updating role to admin...");
      // Update existing profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role: "admin",
          updated_at: now,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw updateError;
      }
    } else {
      console.log("Creating new admin profile...");
      // Create new profile with all required fields
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        email: adminEmail,
        role: "admin",
        created_at: now,
        updated_at: now,
      });

      if (insertError) {
        console.error("Error creating profile:", insertError);
        throw insertError;
      }
    }

    // Grant additional database permissions
    console.log("Granting superuser privileges...");

    // Note: These SQL operations might require direct database access
    // You may need to perform these operations in the Supabase dashboard
    console.log(`
    Please ensure the following permissions are granted in the Supabase dashboard:
    1. User can login
    2. User can create roles
    3. User can create databases
    4. User bypasses every row level security policy
    5. User is a Superuser
    6. User can initiate streaming replication and backup
    `);

    console.log("Admin profile setup completed successfully!");
    console.log("You can now log in with:");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin profile:", error);
    process.exit(1);
  }
}

createAdminProfile();
