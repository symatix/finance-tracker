-- Collaboration Migration v2 - Fix Circular Dependency
-- Run this SQL in your Supabase SQL Editor to fix the infinite recursion issue

-- Drop the problematic policies that cause circular dependencies
DROP POLICY IF EXISTS "Family owners and admins can manage members" ON family_members;

-- Recreate the family members policy without circular dependency
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