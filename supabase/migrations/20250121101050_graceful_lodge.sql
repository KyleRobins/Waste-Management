/*
  # Fix database schema and policies

  1. Changes
    - Safely create missing tables if they don't exist
    - Add missing columns and constraints
    - Update policies to ensure proper access control
    - Fix any duplicate or conflicting definitions

  2. Security
    - Ensure RLS is enabled on all tables
    - Add appropriate policies for CRUD operations
*/

-- Safely create or update tables
DO $$ BEGIN
  -- Create waste_records table if it doesn't exist
  CREATE TABLE IF NOT EXISTS waste_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date timestamptz DEFAULT now(),
    type text NOT NULL,
    quantity text NOT NULL,
    location text,
    status text DEFAULT 'pending',
    supplier_id uuid REFERENCES suppliers(id),
    user_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
  );

  -- Create messages table if it doesn't exist
  CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject text NOT NULL,
    content text NOT NULL,
    recipient_id uuid REFERENCES auth.users(id),
    sender_id uuid REFERENCES auth.users(id),
    status text DEFAULT 'unread',
    created_at timestamptz DEFAULT now()
  );

  -- Create payments table if it doesn't exist
  CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    amount numeric NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'pending',
    customer_id uuid REFERENCES customers(id),
    supplier_id uuid REFERENCES suppliers(id),
    created_at timestamptz DEFAULT now()
  );

EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS on all tables
DO $$ BEGIN
  ALTER TABLE IF EXISTS waste_records ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create or update policies for waste_records
DO $$ BEGIN
  DROP POLICY IF EXISTS "Waste records are viewable by authenticated users" ON waste_records;
  DROP POLICY IF EXISTS "Waste records are insertable by authenticated users" ON waste_records;
  DROP POLICY IF EXISTS "Waste records are updatable by authenticated users" ON waste_records;
  DROP POLICY IF EXISTS "Waste records are deletable by authenticated users" ON waste_records;

  CREATE POLICY "Waste records are viewable by authenticated users"
    ON waste_records FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Waste records are insertable by authenticated users"
    ON waste_records FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Waste records are updatable by authenticated users"
    ON waste_records FOR UPDATE
    TO authenticated
    USING (true);

  CREATE POLICY "Waste records are deletable by authenticated users"
    ON waste_records FOR DELETE
    TO authenticated
    USING (true);
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Create or update policies for messages
DO $$ BEGIN
  DROP POLICY IF EXISTS "Messages are viewable by recipient or sender" ON messages;
  DROP POLICY IF EXISTS "Messages are insertable by authenticated users" ON messages;
  DROP POLICY IF EXISTS "Messages are updatable by recipient" ON messages;
  DROP POLICY IF EXISTS "Messages are deletable by recipient or sender" ON messages;

  CREATE POLICY "Messages are viewable by recipient or sender"
    ON messages FOR SELECT
    TO authenticated
    USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

  CREATE POLICY "Messages are insertable by authenticated users"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

  CREATE POLICY "Messages are updatable by recipient"
    ON messages FOR UPDATE
    TO authenticated
    USING (auth.uid() = recipient_id);

  CREATE POLICY "Messages are deletable by recipient or sender"
    ON messages FOR DELETE
    TO authenticated
    USING (auth.uid() = recipient_id OR auth.uid() = sender_id);
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Create or update policies for payments
DO $$ BEGIN
  DROP POLICY IF EXISTS "Payments are viewable by authenticated users" ON payments;
  DROP POLICY IF EXISTS "Payments are insertable by authenticated users" ON payments;
  DROP POLICY IF EXISTS "Payments are updatable by authenticated users" ON payments;
  DROP POLICY IF EXISTS "Payments are deletable by authenticated users" ON payments;

  CREATE POLICY "Payments are viewable by authenticated users"
    ON payments FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Payments are insertable by authenticated users"
    ON payments FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Payments are updatable by authenticated users"
    ON payments FOR UPDATE
    TO authenticated
    USING (true);

  CREATE POLICY "Payments are deletable by authenticated users"
    ON payments FOR DELETE
    TO authenticated
    USING (true);
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;