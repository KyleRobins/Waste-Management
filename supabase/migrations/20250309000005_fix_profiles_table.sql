-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    role text DEFAULT 'customer',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Grant permissions
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_profiles_email;
-- Create index
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Manually insert profile for existing user if missing
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'role', 'customer'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing trigger function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Update trigger function to ensure better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role text;
BEGIN
    -- Log the start of the function
    RAISE LOG 'handle_new_user starting for user %', NEW.id;
    
    -- Get the role with proper error handling
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    RAISE LOG 'Determined role as: %', _role;
    
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
            role = COALESCE(EXCLUDED.role, profiles.role),
            updated_at = NOW();
            
        RAISE LOG 'Successfully inserted/updated profile for user %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        -- Continue execution despite error
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
            -- Continue execution despite error
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