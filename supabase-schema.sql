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

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    subcategory TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    user_id UUID, -- For future multi-user support
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create list_items table
CREATE TABLE IF NOT EXISTS list_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    estimated_price DECIMAL(10,2),
    checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense', 'Savings')),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    subcategory TEXT,
    note TEXT,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_due_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    user_id UUID, -- For future multi-user support
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_category_id ON shopping_lists(category_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_status ON shopping_lists(status);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_checked ON list_items(checked);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_due_date ON recurring_transactions(next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_is_active ON recurring_transactions(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
-- For now, allow all operations (you may want to restrict this based on user_id in the future)
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on shopping_lists" ON shopping_lists FOR ALL USING (true);
CREATE POLICY "Allow all operations on list_items" ON list_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on recurring_transactions" ON recurring_transactions FOR ALL USING (true);

-- Function to calculate next due date based on frequency
CREATE OR REPLACE FUNCTION calculate_next_due_date(input_date DATE, frequency TEXT)
RETURNS DATE AS $$
BEGIN
    CASE frequency
        WHEN 'daily' THEN
            RETURN input_date + INTERVAL '1 day';
        WHEN 'weekly' THEN
            RETURN input_date + INTERVAL '1 week';
        WHEN 'monthly' THEN
            RETURN input_date + INTERVAL '1 month';
        WHEN 'yearly' THEN
            RETURN input_date + INTERVAL '1 year';
        ELSE
            RAISE EXCEPTION 'Invalid frequency: %', frequency;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically process due recurring transactions
CREATE OR REPLACE FUNCTION process_recurring_transactions()
RETURNS TABLE(processed_count INTEGER, created_transactions INTEGER) AS $$
DECLARE
    rec RECORD;
    next_due DATE;
    should_deactivate BOOLEAN;
    processed_counter INTEGER := 0;
    transaction_counter INTEGER := 0;
BEGIN
    -- Process each due recurring transaction
    FOR rec IN
        SELECT * FROM recurring_transactions
        WHERE is_active = true
        AND next_due_date <= CURRENT_DATE
        ORDER BY next_due_date ASC
    LOOP
        -- Calculate next due date
        next_due := calculate_next_due_date(rec.next_due_date, rec.frequency);

        -- Check if we've reached the end date
        should_deactivate := (rec.end_date IS NOT NULL AND next_due > rec.end_date);

        -- Create the actual transaction
        INSERT INTO transactions (
            amount,
            type,
            category_id,
            subcategory,
            note,
            date,
            user_id
        ) VALUES (
            rec.amount,
            rec.type,
            rec.category_id,
            rec.subcategory,
            COALESCE(rec.note, rec.name || ' (Recurring)'),
            rec.next_due_date,
            rec.user_id
        );

        -- Update the recurring transaction
        UPDATE recurring_transactions
        SET
            next_due_date = next_due,
            is_active = NOT should_deactivate,
            updated_at = NOW()
        WHERE id = rec.id;

        -- Increment counters
        processed_counter := processed_counter + 1;
        transaction_counter := transaction_counter + 1;

    END LOOP;

    -- Return summary
    RETURN QUERY SELECT processed_counter, transaction_counter;
END;
$$ LANGUAGE plpgsql;

-- Usage: Call this function daily to process due recurring transactions
-- SELECT * FROM process_recurring_transactions();
--
-- To set up automatic processing with Supabase Edge Functions:
-- 1. Create an Edge Function that calls this function
-- 2. Set up a cron schedule to run it daily
-- Example Edge Function code:
-- export async function processRecurring() {
--   const { data, error } = await supabase.rpc('process_recurring_transactions');
--   if (error) console.error('Error processing recurring transactions:', error);
--   else console.log(`Processed ${data[0].processed_count} recurring transactions`);
-- }

-- Insert some sample data
-- INSERT INTO categories (name, type, subcategories) VALUES
--     ('Salary', 'Income', '{}'),
--     ('Freelance', 'Income', '{}'),
--     ('Food & Dining', 'Expense', '{"Groceries", "Restaurants", "Coffee"}'),
--     ('Transportation', 'Expense', '{"Gas", "Public Transport", "Car Maintenance"}'),
--     ('Entertainment', 'Expense', '{"Movies", "Games", "Subscriptions"}'),
--     ('Savings', 'Savings', '{"Emergency Fund", "Vacation", "Investment"}')
-- ON CONFLICT DO NOTHING;