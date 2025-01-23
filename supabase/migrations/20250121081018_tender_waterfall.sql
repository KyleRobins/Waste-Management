-- Drop existing policies
DROP POLICY IF EXISTS "Suppliers are viewable by everyone" ON suppliers;
DROP POLICY IF EXISTS "Suppliers are insertable by authenticated users" ON suppliers;
DROP POLICY IF EXISTS "Suppliers are updatable by authenticated users" ON suppliers;
DROP POLICY IF EXISTS "Suppliers are deletable by authenticated users" ON suppliers;

DROP POLICY IF EXISTS "Customers are viewable by everyone" ON customers;
DROP POLICY IF EXISTS "Customers are insertable by authenticated users" ON customers;
DROP POLICY IF EXISTS "Customers are updatable by authenticated users" ON customers;
DROP POLICY IF EXISTS "Customers are deletable by authenticated users" ON customers;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON products;

-- Create new, more permissive policies for testing
CREATE POLICY "Enable all operations for all users" ON suppliers
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);