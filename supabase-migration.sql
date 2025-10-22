-- Migration to add user_id columns to existing tables
-- Run this BEFORE applying the RLS policies

-- Add user_id column to categories table
ALTER TABLE categories
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to transactions table
ALTER TABLE transactions
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Optional: If you have existing data, you might want to set a default user_id
-- for existing records. Replace 'your-user-uuid-here' with an actual user ID:
-- UPDATE categories SET user_id = 'your-user-uuid-here' WHERE user_id IS NULL;
-- UPDATE transactions SET user_id = 'your-user-uuid-here' WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting defaults (if you have existing data)
-- ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;