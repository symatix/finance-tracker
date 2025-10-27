-- Collaboration Migration v3 - Complete Fix for Circular Dependencies
-- Run this SQL in your Supabase SQL Editor to fully resolve all recursion issues

-- Drop all problematic policies that cause circular dependencies
DROP POLICY IF EXISTS "Users can view families they belong to" ON families;
DROP POLICY IF EXISTS "Family owners can manage their families" ON families;
DROP POLICY IF EXISTS "Users can view family memberships" ON family_members;
DROP POLICY IF EXISTS "Family owners and admins can manage members" ON family_members;

-- Recreate family policies without circular dependencies
CREATE POLICY "Users can view families they belong to" ON families
    FOR SELECT USING (
        auth.role() = 'authenticated' AND owner_id = auth.uid()
    );

CREATE POLICY "Family owners can manage their families" ON families
    FOR ALL USING (
        auth.role() = 'authenticated' AND owner_id = auth.uid()
    );

-- Recreate family members policies without circular dependencies
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

-- Drop the trigger if it exists (to avoid errors on re-run)
DROP TRIGGER IF EXISTS trigger_add_family_owner ON families;

CREATE TRIGGER trigger_add_family_owner
    AFTER INSERT ON families
    FOR EACH ROW EXECUTE FUNCTION add_family_owner_to_members();

-- Ensure existing family owners are added to family_members table
INSERT INTO family_members (family_id, user_id, role)
SELECT id, owner_id, 'owner'
FROM families
WHERE NOT EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.family_id = families.id AND fm.user_id = families.owner_id
);