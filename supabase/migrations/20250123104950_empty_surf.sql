/*
  # Add employees table

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text, nullable)
      - `department` (text)
      - `position` (text)
      - `status` (text)
      - `last_login` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
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

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create trigger for last_login updates
CREATE TRIGGER on_auth_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_employee_login();