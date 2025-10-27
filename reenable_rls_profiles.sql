-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create proper policies with WITH CHECK for INSERT
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    );

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    );

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    ) WITH CHECK (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    );

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    );
