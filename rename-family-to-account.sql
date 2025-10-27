-- Rename Family to Account/Tenant Concept
-- This migration updates the terminology from "Family" to "Account" for better clarity
-- while keeping the same underlying functionality

-- Note: We're keeping the table names as "families" and "family_members" for backward compatibility
-- but updating the UI terminology to use "Account" instead of "Family"

-- This is just a documentation/placeholder migration since the core functionality remains the same
-- The UI will be updated to use "Account" terminology instead of "Family"

-- If you want to actually rename the tables, uncomment the following lines:
-- ALTER TABLE families RENAME TO accounts;
-- ALTER TABLE family_members RENAME TO account_members;
-- ALTER TABLE families RENAME COLUMN owner_id TO account_owner_id;
-- ALTER TABLE family_members RENAME COLUMN family_id TO account_id;

-- Update any references in policies if tables are renamed
-- (This would be a major migration requiring careful planning)