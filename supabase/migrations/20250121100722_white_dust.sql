/*
  # Add employees table and policies

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `department` (text)
      - `position` (text)
      - `status` (text)
      - `last_login` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on employees table
    - Add policies for CRUD operations
    - Add function and trigger for last_login updates
*/

-- Create employees table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text,
    department text,
    position text,
    status text DEFAULT 'active',
    last_login timestamptz,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Employees are viewable by authenticated users" ON employees;
  DROP POLICY IF EXISTS "Employees are insertable by authenticated users" ON employees;
  DROP POLICY IF EXISTS "Employees are updatable by authenticated users" ON employees;
  DROP POLICY IF EXISTS "Employees are deletable by authenticated users" ON employees;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new policies
CREATE POLICY "Employees are viewable by authenticated users"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employees are insertable by authenticated users"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Employees are updatable by authenticated users"
  ON employees FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Employees are deletable by authenticated users"
  ON employees FOR DELETE
  TO authenticated
  USING (true);

-- Function to update last_login
CREATE OR REPLACE FUNCTION public.handle_employee_login()
RETURNS trigger AS $$
BEGIN
  UPDATE employees
  SET last_login = now()
  WHERE user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_auth_login ON auth.sessions;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create trigger for last_login updates
CREATE TRIGGER on_auth_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_employee_login();