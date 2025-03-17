-- Drop existing function and triggers to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Ensure proper schema permissions first
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO postgres, authenticated, service_role;

-- Grant necessary permissions on auth.users
GRANT SELECT ON auth.users TO postgres, authenticated, service_role;

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

    RETURN NEW;
END;
$$;

-- Recreate triggers with proper error handling
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE FUNCTION public.handle_new_user();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, authenticated, service_role;

-- Ensure proper RLS policies exist
DROP POLICY IF EXISTS "Anyone can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Anyone can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Grant proper permissions on profiles table
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO anon, authenticated;

-- Ensure sequences are accessible
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon, service_role; 