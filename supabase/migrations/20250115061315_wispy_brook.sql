/*
  # Initial Schema Setup for Waste Management System

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - role (text)
      - phone (text)
      - location (text)
      - created_at (timestamp)
      
    - waste_records
      - id (uuid, primary key)
      - date (timestamp)
      - type (text)
      - quantity (text)
      - location (text)
      - status (text)
      - supplier_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - created_at (timestamp)
      
    - suppliers
      - id (uuid, primary key)
      - name (text)
      - contact_person (text)
      - email (text)
      - phone (text)
      - location (text)
      - status (text)
      - join_date (timestamp)
      - user_id (uuid, foreign key)
      - created_at (timestamp)
      
    - products
      - id (uuid, primary key)
      - name (text)
      - category (text)
      - price (numeric)
      - stock (numeric)
      - source_type (text)
      - process_date (timestamp)
      - status (text)
      - supplier_id (uuid, foreign key)
      - created_at (timestamp)
      
    - customers
      - id (uuid, primary key)
      - name (text)
      - contact_person (text)
      - email (text)
      - phone (text)
      - status (text)
      - created_at (timestamp)
      
    - messages
      - id (uuid, primary key)
      - subject (text)
      - content (text)
      - recipient_id (uuid, foreign key)
      - sender_id (uuid, foreign key)
      - status (text)
      - created_at (timestamp)
      
    - payments
      - id (uuid, primary key)
      - amount (numeric)
      - type (text)
      - status (text)
      - customer_id (uuid, foreign key)
      - supplier_id (uuid, foreign key)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  phone text,
  location text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Suppliers table
CREATE TABLE suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  location text,
  status text DEFAULT 'active',
  join_date timestamptz DEFAULT now(),
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers are viewable by authenticated users"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (true);

-- Waste Records table
CREATE TABLE waste_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  date timestamptz DEFAULT now(),
  type text NOT NULL,
  quantity text NOT NULL,
  location text,
  status text DEFAULT 'pending',
  supplier_id uuid REFERENCES suppliers(id),
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waste_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Waste records are viewable by authenticated users"
  ON waste_records
  FOR SELECT
  TO authenticated
  USING (true);

-- Products table
CREATE TABLE products (
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
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Customers table
CREATE TABLE customers (
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
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject text NOT NULL,
  content text NOT NULL,
  recipient_id uuid REFERENCES users(id),
  sender_id uuid REFERENCES users(id),
  status text DEFAULT 'unread',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

-- Payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount numeric NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'pending',
  customer_id uuid REFERENCES customers(id),
  supplier_id uuid REFERENCES suppliers(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments are viewable by authenticated users"
  ON payments
  FOR SELECT
  TO authenticated
  USING (true);