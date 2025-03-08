-- Add Auth0 specific columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS auth0_id text UNIQUE,
ADD COLUMN IF NOT EXISTS picture text,
ADD COLUMN IF NOT EXISTS full_name text;

-- Create index on auth0_id
CREATE INDEX IF NOT EXISTS profiles_auth0_id_idx ON public.profiles(auth0_id);

-- Create function to get Auth0 ID from JWT claims
CREATE OR REPLACE FUNCTION public.get_auth0_id() RETURNS text AS $$
BEGIN
  -- Extract Auth0 ID from current user's JWT claims
  RETURN current_setting('request.jwt.claims', true)::json->>'sub';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies to work with Auth0
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (
  auth0_id = get_auth0_id()
  OR
  role = 'admin'
);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (
  auth0_id = get_auth0_id()
  OR
  role = 'admin'
);

-- Grant necessary permissions
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure authenticated users can use the function
GRANT EXECUTE ON FUNCTION public.get_auth0_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth0_id() TO service_role;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email); 