/*
  # Fix Auth Verification

  1. Changes
     - Add detailed logging for debugging
     - Fix search_path security issue
     - Grant proper permissions to auth schema
     - Enhance error handling in trigger
*/

-- Drop existing function and recreate with better logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
BEGIN
  -- Log the incoming data for debugging
  RAISE LOG 'handle_new_user() called with new user data: %', to_jsonb(NEW);
  
  -- Get the role with proper error handling
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  RAISE LOG 'Determined role: %', _role;

  -- Insert with better error handling
  BEGIN
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      _role,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      role = COALESCE(EXCLUDED.role, profiles.role),
      updated_at = NOW();
    
    RAISE LOG 'Successfully created/updated profile for user: %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'Error in handle_new_user for user % : %', NEW.id, SQLERRM;
      RETURN NEW;
  END;

  RETURN NEW;
END;
$$;

-- Ensure proper schema permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, service_role;

-- Grant permissions on auth schema objects
GRANT SELECT ON auth.users TO postgres, authenticated, service_role;
GRANT SELECT ON auth.refresh_tokens TO service_role;

-- Grant permissions on public schema objects
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Grant specific permissions to authenticated users
GRANT INSERT, SELECT, UPDATE ON public.profiles TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant minimal permissions to anonymous users
GRANT INSERT, SELECT ON public.profiles TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Recreate triggers with proper error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can insert profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert profile"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Add function to verify user permissions
CREATE OR REPLACE FUNCTION check_user_permissions(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE LOG 'Checking permissions for user: %', user_id;
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  );
END;
$$; 