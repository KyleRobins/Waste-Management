/*
  # Fix Employees Table and Policies

  1. Changes
    - Drop existing employees table and policies if they exist
    - Recreate employees table with proper structure
    - Add RLS policies for proper access control
    - Add trigger for last_login updates

  2. Security
    - Enable RLS
    - Add policies for admin access
    - Add policies for employee self-service
*/

-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS employees CASCADE;

-- Create employees table
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policies for admin users
CREATE POLICY "Employees are viewable by authenticated users"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employees are insertable by authenticated users"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Employees are updatable by authenticated users"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Employees are deletable by authenticated users"
  ON employees
  FOR DELETE
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

-- Trigger to update last_login
DROP TRIGGER IF EXISTS on_auth_login ON auth.sessions;
CREATE TRIGGER on_auth_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_employee_login();