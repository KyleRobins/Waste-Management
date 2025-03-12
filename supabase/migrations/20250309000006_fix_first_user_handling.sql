-- Drop existing trigger function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create improved handle_new_user function with first user handling
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
                WHEN _user_count = 0 THEN 'admin'  -- Force admin for first user even on update
                ELSE COALESCE(EXCLUDED.role, profiles.role)
            END,
            updated_at = NOW();
            
        RAISE LOG 'Successfully inserted/updated profile for user % with role %', NEW.id, _role;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
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
            RAISE EXCEPTION 'Failed to create employee record: %', SQLERRM;
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

-- Add constraint to profiles table to ensure role is valid
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check,
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'employee', 'customer', 'supplier')); 