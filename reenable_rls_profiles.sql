ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    );

CREATE POLICY "Users can manage their own profile" ON profiles
    FOR ALL USING (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    );
