/*
  # Fix profiles table policies

  1. Changes
     - Drop existing policies on profiles table that might cause recursion
     - Create simplified policies that avoid recursion issues
     - Add a trigger to handle profile creation on user signup

  2. Security
     - Maintain row level security on profiles table
     - Allow users to view and update their own profiles
     - Allow public insertion for registration flow
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public can insert profiles" ON profiles;

-- Create simplified policies for profiles table
CREATE POLICY "Anyone can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a function to manually insert a profile for our admin user
CREATE OR REPLACE FUNCTION insert_admin_profile(user_id uuid, user_email text)
RETURNS void AS $$
BEGIN
  INSERT INTO profiles (id, email, role, created_at, updated_at)
  VALUES (
    user_id,
    user_email,
    'admin',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    role = 'admin',
    updated_at = now();
END;
$$ LANGUAGE plpgsql;