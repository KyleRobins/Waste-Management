/*
  # Fix Tables and Permissions

  1. Changes
     - Create missing tables (employees, etc.)
     - Fix auth.users permissions
     - Add proper transaction handling
*/

-- Create necessary tables if they don't exist
CREATE TABLE IF NOT EXISTS public.employees (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    department text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on employees table
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Employees can view own record"
    ON public.employees FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Employees can update own record"
    ON public.employees FOR UPDATE
    USING (auth.uid() = id);

-- Grant proper permissions on auth schema
GRANT USAGE ON SCHEMA auth TO service_role, postgres, authenticated;
GRANT SELECT ON auth.users TO service_role, postgres, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO service_role;

-- Ensure service_role has proper permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant specific permissions to authenticated users
GRANT SELECT, UPDATE ON public.employees TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Update the handle_new_user function to handle transactions better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role text;
BEGIN
    -- Get the role with proper error handling
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    
    -- Start a new transaction
    BEGIN
        -- Insert into profiles
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

        -- If role is employee, create employee record
        IF _role = 'employee' THEN
            INSERT INTO public.employees (id, email, created_at, updated_at)
            VALUES (
                NEW.id,
                NEW.email,
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO NOTHING;
        END IF;

        -- Log success
        RAISE LOG 'Successfully created/updated user records for %', NEW.id;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the transaction
        RAISE LOG 'Error in handle_new_user for user % : %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$;

-- Recreate triggers
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Verify and fix auth.users permissions
DO $$
BEGIN
    -- Ensure auth schema exists
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA IF NOT EXISTS auth;
    END IF;

    -- Grant usage on auth schema
    GRANT USAGE ON SCHEMA auth TO authenticated, anon, service_role;
    
    -- Grant select on auth.users
    GRANT SELECT ON auth.users TO authenticated, service_role;
    
    -- Grant execute on auth functions
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated, service_role;
END
$$; 