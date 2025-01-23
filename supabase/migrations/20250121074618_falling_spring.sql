/*
  # Initial Schema Setup

  1. Tables
    - suppliers
      - id (uuid, primary key)
      - name (text)
      - contact_person (text)
      - email (text)
      - phone (text)
      - location (text)
      - status (text)
      - join_date (timestamptz)
      - user_id (uuid, foreign key)
      - created_at (timestamptz)
    
    - customers
      - id (uuid, primary key)
      - name (text)
      - contact_person (text)
      - email (text)
      - phone (text)
      - status (text)
      - created_at (timestamptz)
    
    - products
      - id (uuid, primary key)
      - name (text)
      - category (text)
      - price (numeric)
      - stock (numeric)
      - source_type (text)
      - process_date (timestamptz)
      - status (text)
      - supplier_id (uuid, foreign key)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  location text,
  status text DEFAULT 'active',
  join_date timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers are viewable by authenticated users"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Suppliers are insertable by authenticated users"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Suppliers are updatable by authenticated users"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Suppliers are deletable by authenticated users"
  ON suppliers FOR DELETE
  TO authenticated
  USING (true);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers are viewable by authenticated users"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers are insertable by authenticated users"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Customers are updatable by authenticated users"
  ON customers FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Customers are deletable by authenticated users"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  stock numeric DEFAULT 0,
  source_type text,
  process_date timestamptz,
  status text DEFAULT 'in_stock',
  supplier_id uuid REFERENCES suppliers(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by authenticated users"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Products are insertable by authenticated users"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Products are updatable by authenticated users"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Products are deletable by authenticated users"
  ON products FOR DELETE
  TO authenticated
  USING (true);