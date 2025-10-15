-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text,
    guest_session_id text,
    file_name text NOT NULL,
    file_path text NOT NULL,
    options jsonb NOT NULL,
    total_cost numeric(10, 2) NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Create index on guest_session_id for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_guest_session_id ON orders(guest_session_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT
    USING (auth.uid()::text = user_id OR guest_session_id IS NOT NULL);

-- Create policy to allow users to insert their own orders
CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR guest_session_id IS NOT NULL);

-- Create policy to allow admins to view all orders
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT
    USING (true);

-- Create policy to allow admins to update all orders
CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE
    USING (true);
