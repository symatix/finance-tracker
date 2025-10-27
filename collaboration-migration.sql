-- Migration Script for Collaboration Features
-- Run this SQL in your Supabase SQL Editor to enable family collaboration features

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

-- Add collaboration fields to categories for family-shared categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS shared_account_id UUID REFERENCES families(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

-- Enable Row Level Security for collaboration tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Update existing RLS policies to support collaboration
-- Drop existing policies that conflict
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;
DROP POLICY IF EXISTS "Allow all operations on transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all operations on shopping_lists" ON shopping_lists;
DROP POLICY IF EXISTS "Allow all operations on list_items" ON list_items;
DROP POLICY IF EXISTS "Allow all operations on recurring_transactions" ON recurring_transactions;
DROP POLICY IF EXISTS "Allow all operations on planned_expenses" ON planned_expenses;

-- Drop specific collaboration policies if they exist
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view accessible shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can manage accessible shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can manage list items in accessible lists" ON list_items;
DROP POLICY IF EXISTS "Users can view their recurring transactions" ON recurring_transactions;
DROP POLICY IF EXISTS "Users can manage their recurring transactions" ON recurring_transactions;
DROP POLICY IF EXISTS "Users can view their planned expenses" ON planned_expenses;
DROP POLICY IF EXISTS "Users can manage their planned expenses" ON planned_expenses;
DROP POLICY IF EXISTS "Users can view families they belong to" ON families;
DROP POLICY IF EXISTS "Family owners can manage their families" ON families;
DROP POLICY IF EXISTS "Users can view family memberships" ON family_members;
DROP POLICY IF EXISTS "Family owners and admins can manage members" ON family_members;

-- Drop v2 policies if they exist (from previous runs)
DROP POLICY IF EXISTS "Users can view transactions v2" ON transactions;
DROP POLICY IF EXISTS "Users can manage transactions v2" ON transactions;
DROP POLICY IF EXISTS "Users can view shopping lists v2" ON shopping_lists;
DROP POLICY IF EXISTS "Users can manage shopping lists v2" ON shopping_lists;
DROP POLICY IF EXISTS "Users can manage list items v2" ON list_items;
DROP POLICY IF EXISTS "Users can view recurring transactions v2" ON recurring_transactions;
DROP POLICY IF EXISTS "Users can manage recurring transactions v2" ON recurring_transactions;
DROP POLICY IF EXISTS "Users can view planned expenses v2" ON planned_expenses;
DROP POLICY IF EXISTS "Users can manage planned expenses v2" ON planned_expenses;
DROP POLICY IF EXISTS "Categories are viewable by all authenticated users" ON categories;
DROP POLICY IF EXISTS "Categories are manageable by authenticated users" ON categories;
DROP POLICY IF EXISTS "Categories are viewable by authenticated users v2" ON categories;
DROP POLICY IF EXISTS "Categories are manageable by creators and family members v2" ON categories;

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

-- Transactions policies (collaboration-enabled)
CREATE POLICY "Users can view transactions v2" ON transactions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'viewer')
        )
    );

CREATE POLICY "Users can manage transactions v2" ON transactions
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'member')
        )
    );

-- Shopping lists policies (collaboration-enabled)
CREATE POLICY "Users can view shopping lists v2" ON shopping_lists
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'viewer')
        )
    );

CREATE POLICY "Users can manage shopping lists v2" ON shopping_lists
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'member')
        )
    );

-- List items policies (inherit from shopping lists) (collaboration-enabled)
CREATE POLICY "Users can manage list items v2" ON list_items
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

-- Recurring transactions policies (collaboration-enabled)
CREATE POLICY "Users can view recurring transactions v2" ON recurring_transactions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'viewer')
        )
    );

CREATE POLICY "Users can manage recurring transactions v2" ON recurring_transactions
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'member')
        )
    );

-- Planned expenses policies (collaboration-enabled)
CREATE POLICY "Users can view planned expenses v2" ON planned_expenses
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'viewer')
        )
    );

CREATE POLICY "Users can manage planned expenses v2" ON planned_expenses
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'member')
        )
    );

-- Family policies
CREATE POLICY "Users can view families they belong to" ON families
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM family_members fm
            WHERE fm.family_id = families.id
            AND fm.user_id = auth.uid()
        )
    );

CREATE POLICY "Family owners can manage their families" ON families
    FOR ALL USING (
        auth.role() = 'authenticated' AND owner_id = auth.uid()
    );

-- Family members policies
CREATE POLICY "Users can view family memberships" ON family_members
    FOR SELECT USING (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    );

CREATE POLICY "Family owners and admins can manage members" ON family_members
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        (
            -- Check if user is owner/admin of this family by checking their role
            EXISTS (
                SELECT 1 FROM family_members fm
                WHERE fm.family_id = family_members.family_id
                AND fm.user_id = auth.uid()
                AND fm.role IN ('owner', 'admin')
            )
        )
    );

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
CREATE INDEX IF NOT EXISTS idx_families_owner_id ON families(owner_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_role ON family_members(role);

CREATE INDEX IF NOT EXISTS idx_categories_created_by ON categories(created_by);
CREATE INDEX IF NOT EXISTS idx_categories_shared_account_id ON categories(shared_account_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_shared ON categories(is_shared);

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

-- Update the process_recurring_transactions function to include collaboration fields
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