-- Reset and fix all permissions
-- This migration will properly set up all necessary permissions and roles

-- First, ensure schemas exist
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS public;

-- Drop existing tables to ensure clean slate for profiles
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;

-- Recreate profiles table with proper structure
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'customer',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'employee', 'customer', 'supplier'))
);

-- Create employees table
CREATE TABLE public.employees (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can insert profiles" ON public.profiles;

-- Create proper policies
CREATE POLICY "Anyone can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Grant proper permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon, service_role;
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, anon, service_role;

-- Grant permissions on profiles table
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO anon, authenticated;

-- Grant permissions on employees table
GRANT ALL ON public.employees TO postgres, service_role;
GRANT SELECT, UPDATE ON public.employees TO authenticated;

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role text;
    _user_count integer;
BEGIN
    -- Log the start of the function
    RAISE LOG 'handle_new_user starting for user %', NEW.id;
    
    -- Check if this is the first user
    SELECT COUNT(*) INTO _user_count FROM profiles;
    
    -- Determine role
    IF _user_count = 0 THEN
        _role := 'admin';
        RAISE LOG 'First user detected, setting role to admin for user %', NEW.id;
    ELSE
        _role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
        RAISE LOG 'Determined role as: % for user %', _role, NEW.id;
    END IF;
    
    -- Insert into profiles with explicit error handling
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
            role = CASE 
                WHEN _user_count = 0 THEN 'admin'
                ELSE COALESCE(EXCLUDED.role, profiles.role)
            END,
            updated_at = NOW();
            
        RAISE LOG 'Successfully inserted/updated profile for user % with role %', NEW.id, _role;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        -- Don't raise exception, just log the error
        -- This prevents the trigger from failing completely
    END;

    -- If role is employee, create employee record
    IF _role = 'employee' THEN
        BEGIN
            INSERT INTO public.employees (id, email, created_at, updated_at)
            VALUES (
                NEW.id,
                NEW.email,
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO NOTHING;
            
            RAISE LOG 'Successfully created employee record for user %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Error creating employee record for user %: %', NEW.id, SQLERRM;
            -- Don't raise exception, just log the error
        END;
    END IF;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, authenticated, anon, service_role;

-- Ensure sequences are owned by the tables
ALTER SEQUENCE IF EXISTS profiles_id_seq OWNED BY profiles.id;
ALTER SEQUENCE IF EXISTS employees_id_seq OWNED BY employees.id;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon, service_role; 