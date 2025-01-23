/*
  # Add Employees Table

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
    - Add policies for admin users to manage employees
    - Add policies for employees to view their own records
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
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
CREATE POLICY "Employees are viewable by admin users"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Employees are insertable by admin users"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Employees are updatable by admin users"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Employees are deletable by admin users"
  ON employees
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Allow employees to view their own records
CREATE POLICY "Employees can view their own record"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow employees to update their own basic information
CREATE POLICY "Employees can update their own basic information"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

-- Trigger to update last_login on auth.users
CREATE TRIGGER on_auth_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_employee_login();