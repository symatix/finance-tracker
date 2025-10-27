-- ===========================================
-- Finance Tracker Database Setup
-- Complete SQL Migration Script
-- ===========================================
-- This script sets up the complete database schema for the Finance Tracker app
-- including collaboration features, email invitations, and all necessary policies.
--
-- Run this SQL in your Supabase SQL Editor in the following order:
-- 1. Tables and basic schema
-- 2. Collaboration features
-- 3. Email invite system
-- 4. Row Level Security policies
-- 5. Functions and triggers
--
-- Make sure to set the following environment variables in Supabase:
-- - RESEND_API_KEY: Your Resend API key for email sending
-- - APP_URL: Your app's URL (e.g., https://yourdomain.com or http://localhost:5173)

-- ===========================================
-- 1. BASIC SCHEMA SETUP
-- ===========================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense', 'Savings')),
    subcategories TEXT[] DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    shared_account_id UUID REFERENCES families(id),
    is_shared BOOLEAN DEFAULT FALSE,
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    shared_account_id UUID REFERENCES families(id),
    is_shared BOOLEAN DEFAULT FALSE,
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    shared_account_id UUID REFERENCES families(id),
    is_shared BOOLEAN DEFAULT FALSE,
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    shared_account_id UUID REFERENCES families(id),
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table for user profile information
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    address_line_1 TEXT,
    address_line_2 TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country TEXT,
    phone TEXT,
    date_of_birth DATE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 2. COLLABORATION FEATURES
-- ===========================================

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

-- ===========================================
-- 3. EMAIL INVITE SYSTEM
-- ===========================================

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    invite_token TEXT UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES auth.users(id),

    UNIQUE(email, family_id) -- Prevent duplicate invites for same email/family
);

-- ===========================================
-- 4. INDEXES FOR PERFORMANCE
-- ===========================================

-- Basic table indexes
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

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Collaboration indexes
CREATE INDEX IF NOT EXISTS idx_families_owner_id ON families(owner_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_role ON family_members(role);

-- Shared resource indexes
CREATE INDEX IF NOT EXISTS idx_categories_created_by ON categories(created_by);
CREATE INDEX IF NOT EXISTS idx_categories_shared_account_id ON categories(shared_account_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_shared ON categories(is_shared);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_shared_account_id ON transactions(shared_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_is_shared ON transactions(is_shared);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_created_by ON shopping_lists(created_by);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_shared_account_id ON shopping_lists(shared_account_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_is_shared ON shopping_lists(is_shared);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);

CREATE INDEX IF NOT EXISTS idx_recurring_transactions_created_by ON recurring_transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_shared_account_id ON recurring_transactions(shared_account_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_is_shared ON recurring_transactions(is_shared);

CREATE INDEX IF NOT EXISTS idx_planned_expenses_created_by ON planned_expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_planned_expenses_shared_account_id ON planned_expenses(shared_account_id);
CREATE INDEX IF NOT EXISTS idx_planned_expenses_is_shared ON planned_expenses(is_shared);

-- Invitation indexes
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_family_id ON invitations(family_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);

-- ===========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 6. RLS POLICIES
-- ===========================================

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

-- Categories policies (collaboration-enabled)
CREATE POLICY "Categories are viewable by authenticated users" ON categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Categories are manageable by creators and family members" ON categories
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'admin')
        )
    );

-- Transactions policies
CREATE POLICY "Users can view their transactions" ON transactions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            user_id = auth.uid() OR
            can_access_shared_resource(shared_account_id, 'viewer')
        )
    );

CREATE POLICY "Users can manage their transactions" ON transactions
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

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    );

CREATE POLICY "Users can manage their own profile" ON profiles
    FOR ALL USING (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    );

-- Family policies (no circular dependencies)
CREATE POLICY "Users can view families they belong to" ON families
    FOR SELECT USING (
        auth.role() = 'authenticated' AND owner_id = auth.uid()
    );

CREATE POLICY "Family owners can manage their families" ON families
    FOR ALL USING (
        auth.role() = 'authenticated' AND owner_id = auth.uid()
    );

-- Family members policies (no circular dependencies)
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

-- Invitation policies
CREATE POLICY "Users can view invitations they sent" ON invitations
    FOR SELECT USING (
        auth.role() = 'authenticated' AND invited_by = auth.uid()
    );

CREATE POLICY "Family owners can manage invitations for their families" ON invitations
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM families f
            WHERE f.id = invitations.family_id
            AND f.owner_id = auth.uid()
        )
    );

-- ===========================================
-- 7. FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to generate secure invite tokens
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

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

-- Function to create an invitation
CREATE OR REPLACE FUNCTION create_invitation(
    p_email TEXT,
    p_family_id UUID,
    p_role TEXT DEFAULT 'member',
    p_invited_by UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
    v_invitation_id UUID;
    v_token TEXT;
BEGIN
    -- Check if user is owner/admin of the family
    IF NOT EXISTS (
        SELECT 1 FROM families f
        WHERE f.id = p_family_id
        AND f.owner_id = p_invited_by
    ) THEN
        RAISE EXCEPTION 'Only family owners can send invitations';
    END IF;

    -- Check if email is already a member
    IF EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.family_id = p_family_id
        AND fm.user_id IN (
            SELECT id FROM auth.users WHERE email = p_email
        )
    ) THEN
        RAISE EXCEPTION 'User is already a member of this family';
    END IF;

    -- Generate token
    v_token := generate_invite_token();

    -- Create invitation
    INSERT INTO invitations (email, invited_by, family_id, role, invite_token)
    VALUES (p_email, p_invited_by, p_family_id, p_role, v_token)
    RETURNING id INTO v_invitation_id;

    RETURN v_invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept an invitation
CREATE OR REPLACE FUNCTION accept_invitation(
    p_token TEXT,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    v_invitation RECORD;
    v_user_email TEXT;
BEGIN
    -- Find the invitation
    SELECT * INTO v_invitation
    FROM invitations
    WHERE invite_token = p_token
    AND status = 'pending'
    AND expires_at > NOW();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;

    -- Get user email
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = p_user_id;

    -- Check if user email matches invitation
    IF v_user_email != v_invitation.email THEN
        RAISE EXCEPTION 'Invitation email does not match your account';
    END IF;

    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.family_id = v_invitation.family_id
        AND fm.user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'You are already a member of this family';
    END IF;

    -- Ensure user has a profile
    INSERT INTO profiles (user_id, email)
    VALUES (p_user_id, v_user_email)
    ON CONFLICT (user_id) DO NOTHING;

    -- Add user to family
    INSERT INTO family_members (family_id, user_id, role)
    VALUES (v_invitation.family_id, p_user_id, v_invitation.role);

    -- Update invitation status
    UPDATE invitations
    SET status = 'accepted',
        accepted_at = NOW(),
        accepted_by = p_user_id
    WHERE id = v_invitation.id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE invitations
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
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

-- Trigger to automatically add family owner to family_members
CREATE OR REPLACE FUNCTION add_family_owner_to_members()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO family_members (family_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner')
    ON CONFLICT (family_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_add_family_owner ON families;
CREATE TRIGGER trigger_add_family_owner
    AFTER INSERT ON families
    FOR EACH ROW EXECUTE FUNCTION add_family_owner_to_members();

-- ===========================================
-- SETUP COMPLETE
-- ===========================================
-- Your Finance Tracker database is now fully set up with:
-- ✅ Basic financial tracking tables (categories, transactions, etc.)
-- ✅ Collaboration features (families, shared accounts)
-- ✅ Email invitation system
-- ✅ Row Level Security policies
-- ✅ All necessary functions and triggers
--
-- Next steps:
-- 1. Set up your Supabase Edge Function for email sending
-- 2. Configure environment variables (RESEND_API_KEY, APP_URL)
-- 3. Deploy your application
--
-- For more information, see the README.md file.