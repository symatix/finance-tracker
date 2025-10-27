-- Migration: Add email to profiles table and update accept_invitation function
-- Run this script against your Supabase database to apply the changes

-- ===========================================
-- MIGRATION: Add email column to profiles table
-- ===========================================

-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- ===========================================
-- MIGRATION: Update accept_invitation function
-- ===========================================

-- Function to accept an invitation (updated to create profiles automatically)
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

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================
-- Changes applied:
-- ✅ Added email column to profiles table
-- ✅ Updated accept_invitation function to auto-create profiles
--
-- You can now delete this migration script.