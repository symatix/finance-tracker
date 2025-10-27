-- Supabase Database Schema for Budget App
-- Run this SQL in your Supabase SQL Editor

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense', 'Savings')),
    subcategories TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    shared_account_id UUID REFERENCES families(id),
    is_shared BOOLEAN DEFAULT FALSE,
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

-- Create planned_expenses table
CREATE TABLE IF NOT EXISTS planned_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    subcategory TEXT,
    note TEXT,
    due_date DATE NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')),
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
CREATE INDEX IF NOT EXISTS idx_planned_expenses_user_id ON planned_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_expenses_due_date ON planned_expenses(due_date);
CREATE INDEX IF NOT EXISTS idx_planned_expenses_status ON planned_expenses(status);
CREATE INDEX IF NOT EXISTS idx_planned_expenses_priority ON planned_expenses(priority);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_expenses ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for collaboration tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Update existing RLS policies to support collaboration
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;
DROP POLICY IF EXISTS "Allow all operations on transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all operations on shopping_lists" ON shopping_lists;
DROP POLICY IF EXISTS "Allow all operations on list_items" ON list_items;
DROP POLICY IF EXISTS "Allow all operations on recurring_transactions" ON recurring_transactions;
DROP POLICY IF EXISTS "Allow all operations on planned_expenses" ON planned_expenses;

-- Categories policies (collaboration-enabled)
-- Categories can be viewed by all authenticated users (for consistency)
-- But management is restricted to creators and family members
CREATE POLICY "Categories are viewable by authenticated users v2" ON categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Categories are manageable by creators and family members v2" ON categories
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'admin')
        )
    );

-- Helper function to check if user can access a shared resource
CREATE OR REPLACE FUNCTION can_access_shared_resource(shared_account_id UUID, required_role TEXT DEFAULT 'viewer')
RETURNS BOOLEAN AS $$
BEGIN
    -- If not shared, only creator can access
    IF shared_account_id IS NULL THEN
        RETURN true; -- Will be checked by user_id in individual policies
    END IF;

    -- Check if user is a member of the family with appropriate role
    RETURN EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.family_id = shared_account_id
        AND fm.user_id = auth.uid()
        AND (
            fm.role = 'owner' OR
            fm.role = 'admin' OR
            (fm.role = 'member' AND required_role IN ('viewer', 'member')) OR
            (fm.role = 'viewer' AND required_role = 'viewer')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'viewer')
        )
    );

CREATE POLICY "Users can manage their own transactions" ON transactions
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'member')
        )
    );

-- Shopping lists policies
CREATE POLICY "Users can view accessible shopping lists" ON shopping_lists
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'viewer')
        )
    );

CREATE POLICY "Users can manage accessible shopping lists" ON shopping_lists
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'member')
        )
    );

-- List items policies (inherit from shopping lists)
CREATE POLICY "Users can manage list items in accessible lists" ON list_items
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM shopping_lists sl
            WHERE sl.id = list_items.list_id
            AND (
                sl.user_id = auth.uid() OR
                can_access_shared_resource(sl.shared_account_id, 'member')
            )
        )
    );

-- Recurring transactions policies
CREATE POLICY "Users can view their recurring transactions" ON recurring_transactions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'viewer')
        )
    );

CREATE POLICY "Users can manage their recurring transactions" ON recurring_transactions
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'member')
        )
    );

-- Planned expenses policies
CREATE POLICY "Users can view their planned expenses" ON planned_expenses
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'viewer')
        )
    );

CREATE POLICY "Users can manage their planned expenses" ON planned_expenses
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'member')
        )
    );

-- Family policies (fixed - no circular dependencies)
CREATE POLICY "Users can view families they belong to" ON families
    FOR SELECT USING (
        auth.role() = 'authenticated' AND owner_id = auth.uid()
    );

CREATE POLICY "Family owners can manage their families" ON families
    FOR ALL USING (
        auth.role() = 'authenticated' AND owner_id = auth.uid()
    );

-- Family members policies (fixed - no circular dependencies)
CREATE POLICY "Users can view family memberships" ON family_members
    FOR SELECT USING (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    );

CREATE POLICY "Family owners can manage members" ON family_members
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            -- Family owner can manage all members
            EXISTS (
                SELECT 1 FROM families f
                WHERE f.id = family_members.family_id
                AND f.owner_id = auth.uid()
            ) OR
            -- Users can manage their own membership
            family_members.user_id = auth.uid()
        )
    );

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

        -- Create the actual transaction with collaboration fields
        INSERT INTO transactions (
            amount,
            type,
            category_id,
            subcategory,
            note,
            date,
            user_id,
            created_by,
            shared_account_id,
            is_shared
        ) VALUES (
            rec.amount,
            rec.type,
            rec.category_id,
            rec.subcategory,
            COALESCE(rec.note, rec.name || ' (Recurring)'),
            rec.next_due_date,
            rec.user_id,
            rec.created_by,
            rec.shared_account_id,
            rec.is_shared
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

-- Create families table for shared accounts/households
CREATE TABLE IF NOT EXISTS families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

-- Add collaboration fields to existing tables
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS shared_account_id UUID REFERENCES families(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

ALTER TABLE shopping_lists ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE shopping_lists ADD COLUMN IF NOT EXISTS shared_account_id UUID REFERENCES families(id);
ALTER TABLE shopping_lists ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS shared_account_id UUID REFERENCES families(id);
ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

ALTER TABLE planned_expenses ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE planned_expenses ADD COLUMN IF NOT EXISTS shared_account_id UUID REFERENCES families(id);
ALTER TABLE planned_expenses ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

-- Create indexes for collaboration features
CREATE INDEX IF NOT EXISTS idx_families_owner_id ON families(owner_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_role ON family_members(role);

CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_shared_account_id ON transactions(shared_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_is_shared ON transactions(is_shared);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_created_by ON shopping_lists(created_by);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_shared_account_id ON shopping_lists(shared_account_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_is_shared ON shopping_lists(is_shared);

CREATE INDEX IF NOT EXISTS idx_recurring_transactions_created_by ON recurring_transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_shared_account_id ON recurring_transactions(shared_account_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_is_shared ON recurring_transactions(is_shared);

CREATE INDEX IF NOT EXISTS idx_planned_expenses_created_by ON planned_expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_planned_expenses_shared_account_id ON planned_expenses(shared_account_id);
CREATE INDEX IF NOT EXISTS idx_planned_expenses_is_shared ON planned_expenses(is_shared);

-- Create trigger to automatically add family owner to family_members
CREATE OR REPLACE FUNCTION add_family_owner_to_members()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO family_members (family_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner')
    ON CONFLICT (family_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_add_family_owner
    AFTER INSERT ON families
    FOR EACH ROW EXECUTE FUNCTION add_family_owner_to_members();