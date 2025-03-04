// This script creates a demo admin user in the Supabase database
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

// Demo admin user details - using the provided email
const ADMIN_EMAIL = 'robinsmutuma44@gmail.com';
const ADMIN_PASSWORD = 'Admin123!';

async function createDemoAdmin() {
  try {
    console.log('Creating admin user...');
    
    // First check if the user already exists in auth
    try {
      const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
      
      if (getUserError) {
        console.log('Unable to check existing users. Will attempt to create new user anyway.');
      } else {
        const existingUser = users?.find(user => user.email === ADMIN_EMAIL);
        if (existingUser) {
          console.log('Admin user already exists in auth system');
          console.log('Email:', ADMIN_EMAIL);
          console.log('Password:', ADMIN_PASSWORD);
          console.log('Role: admin');
          return;
        }
      }
    } catch (error) {
      console.log('Unable to check existing users. Will attempt to create new user anyway.');
    }
    
    // Try direct signup method first (more likely to work)
    try {
      console.log('Attempting to create user via signup...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: { role: 'admin' }
        }
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      if (!signUpData.user) {
        throw new Error('Failed to create user');
      }
      
      console.log('User created via signup.');
      
      // Create profile record
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signUpData.user.id,
            email: ADMIN_EMAIL,
            role: 'admin',
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          console.log('User was created but profile creation failed.');
        } else {
          console.log('Profile created successfully');
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
      }
      
      console.log('Success! Admin user created:');
      console.log('Email:', ADMIN_EMAIL);
      console.log('Password:', ADMIN_PASSWORD);
      console.log('Role: admin');
      
      return;
    } catch (signUpError) {
      console.error('Signup method failed:', signUpError);
      console.log('Trying admin API method...');
    }
    
    // If signup fails, try admin API
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'admin' }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Failed to create user');
      }
      
      console.log('Auth user created successfully via admin API');
      
      // Create profile record
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: ADMIN_EMAIL,
            role: 'admin',
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          console.log('User was created but profile creation failed.');
        } else {
          console.log('Profile created successfully');
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
      }
      
      console.log('Success! Admin user created:');
      console.log('Email:', ADMIN_EMAIL);
      console.log('Password:', ADMIN_PASSWORD);
      console.log('Role: admin');
      
      return;
    } catch (adminError) {
      console.error('Admin API method failed:', adminError);
      throw new Error('Both signup and admin API methods failed to create user');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    
    // Provide more helpful error messages
    if (error.message?.includes('duplicate key')) {
      console.log('A user with this email already exists. Try using a different email or logging in with the existing account.');
    } else if (error.message?.includes('invalid email')) {
      console.log('The email format is invalid. Please use a valid email format.');
    } else if (error.message?.includes('weak password')) {
      console.log('The password is too weak. Please use a stronger password with at least 6 characters.');
    }
  }
}

createDemoAdmin();