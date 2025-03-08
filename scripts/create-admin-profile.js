// This script creates a profile for the admin user directly using SQL
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Admin user email
const ADMIN_EMAIL = 'robinsmutuma44@gmail.com';

async function createAdminProfile() {
  try {
    console.log('Looking up admin user...');
    
    // First get the user ID from auth
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) {
      console.error('Error listing users:', getUserError);
      
      // Try alternative approach - get session for the admin
      console.log('Trying to sign in as admin to get user ID...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: 'Admin123!'
      });
      
      if (signInError) {
        console.error('Error signing in:', signInError);
        throw new Error('Could not get admin user ID');
      }
      
      const userId = signInData.user.id;
      
      // Create profile using direct SQL
      console.log('Creating admin profile using SQL function...');
      const { error: fnError } = await supabase.rpc('insert_admin_profile', {
        user_id: userId,
        user_email: ADMIN_EMAIL
      });
      
      if (fnError) {
        console.error('Error creating profile with function:', fnError);
        
        // Try direct insert as fallback
        console.log('Trying direct insert...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: ADMIN_EMAIL,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Error with direct insert:', insertError);
          throw new Error('Failed to create admin profile');
        }
      }
      
      console.log('Admin profile created successfully!');
      return;
    }
    
    // Find the admin user
    const adminUser = users.find(user => user.email === ADMIN_EMAIL);
    
    if (!adminUser) {
      console.error('Admin user not found in auth system');
      throw new Error('Admin user not found');
    }
    
    console.log('Found admin user with ID:', adminUser.id);
    
    // Create profile using direct SQL
    console.log('Creating admin profile using SQL function...');
    const { error: fnError } = await supabase.rpc('insert_admin_profile', {
      user_id: adminUser.id,
      user_email: ADMIN_EMAIL
    });
    
    if (fnError) {
      console.error('Error creating profile with function:', fnError);
      
      // Try direct insert as fallback
      console.log('Trying direct insert...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: adminUser.id,
          email: ADMIN_EMAIL,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error with direct insert:', insertError);
        throw new Error('Failed to create admin profile');
      }
    }
    
    console.log('Admin profile created successfully!');
    
  } catch (error) {
    console.error('Error creating admin profile:', error);
  }
}

createAdminProfile();