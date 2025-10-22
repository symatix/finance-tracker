-- Supabase Database Schema for Budget App
-- Run this SQL in your Supabase SQL Editor

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense', 'Savings')),
    subcategories TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense', 'Savings')),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    subcategory TEXT,
    note TEXT,
    date DATE NOT NULL,
    user_id UUID, -- For future multi-user support
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
-- For now, allow all operations (you may want to restrict this based on user_id in the future)
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true);

-- Insert some sample data
INSERT INTO categories (name, type, subcategories) VALUES
    ('Salary', 'Income', '{}'),
    ('Freelance', 'Income', '{}'),
    ('Food & Dining', 'Expense', '{"Groceries", "Restaurants", "Coffee"}'),
    ('Transportation', 'Expense', '{"Gas", "Public Transport", "Car Maintenance"}'),
    ('Entertainment', 'Expense', '{"Movies", "Games", "Subscriptions"}'),
    ('Savings', 'Savings', '{"Emergency Fund", "Vacation", "Investment"}')
ON CONFLICT DO NOTHING;