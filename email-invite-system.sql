-- Email Invite System Migration
-- Adds invitation functionality for email-based invites

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

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Policies for invitations
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

-- Function to generate secure invite tokens
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
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

    -- Check if user email matches invitation
    IF NOT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = p_user_id
        AND email = v_invitation.email
    ) THEN
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_family_id ON invitations(family_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);