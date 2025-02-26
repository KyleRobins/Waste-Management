/*
  # Add Organizations Support

  1. New Tables
    - `organizations`
      - Basic organization info
      - Branding settings
      - Module configurations
    - `organization_users`
      - Links users to organizations
      - Handles role assignments within org context

  2. Security
    - Enable RLS
    - Add policies for org access
    - Add policies for user-org relationships
*/

-- Create organizations table
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  domain text,
  logo_url text,
  primary_color text DEFAULT '#16a34a',
  secondary_color text DEFAULT '#22c55e',
  modules jsonb DEFAULT '{"waste_management": true, "recycling": true, "reporting": true}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create organization_users junction table
CREATE TABLE organization_users (
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Organizations are viewable by their members"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Organizations are creatable by authenticated users"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Organizations are updatable by admin members"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create policies for organization_users
CREATE POLICY "Organization users are viewable by organization members"
  ON organization_users FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization users are manageable by admin members"
  ON organization_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_id = organization_users.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add organization_id to existing tables
ALTER TABLE suppliers ADD COLUMN organization_id uuid REFERENCES organizations(id);
ALTER TABLE customers ADD COLUMN organization_id uuid REFERENCES organizations(id);
ALTER TABLE employees ADD COLUMN organization_id uuid REFERENCES organizations(id);
ALTER TABLE products ADD COLUMN organization_id uuid REFERENCES organizations(id);
ALTER TABLE waste_records ADD COLUMN organization_id uuid REFERENCES organizations(id);
ALTER TABLE messages ADD COLUMN organization_id uuid REFERENCES organizations(id);
ALTER TABLE payments ADD COLUMN organization_id uuid REFERENCES organizations(id);

-- Update RLS policies to include organization context
CREATE POLICY "Records are viewable by organization members"
  ON suppliers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_id = suppliers.organization_id
      AND user_id = auth.uid()
    )
  );

-- Repeat similar policies for other tables...

-- Function to handle organization creation after user registration
CREATE OR REPLACE FUNCTION handle_new_organization()
RETURNS trigger AS $$
BEGIN
  INSERT INTO organization_users (organization_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic organization_users entry
CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_organization();