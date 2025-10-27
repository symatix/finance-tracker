import type { Database } from './supabase';
import type { TransactionType } from '../store';

// Re-export Supabase types for convenience
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type TransactionRow = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export type ShoppingListRow = Database['public']['Tables']['shopping_lists']['Row'];
export type ShoppingListInsert = Database['public']['Tables']['shopping_lists']['Insert'];
export type ShoppingListUpdate = Database['public']['Tables']['shopping_lists']['Update'];

export type ListItemRow = Database['public']['Tables']['list_items']['Row'];
export type ListItemInsert = Database['public']['Tables']['list_items']['Insert'];
export type ListItemUpdate = Database['public']['Tables']['list_items']['Update'];

export type RecurringTransactionRow = Database['public']['Tables']['recurring_transactions']['Row'];
export type RecurringTransactionInsert = Database['public']['Tables']['recurring_transactions']['Insert'];
export type RecurringTransactionUpdate = Database['public']['Tables']['recurring_transactions']['Update'];

// Planned Expense types (defined manually until Supabase types are regenerated)
export interface PlannedExpenseRow {
	id: string;
	name: string;
	amount: number;
	category_id: string;
	subcategory: string | null;
	note: string | null;
	due_date: string;
	priority: 'low' | 'medium' | 'high' | 'urgent';
	status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
	user_id: string | null;
	created_at: string;
	updated_at: string;
}

export interface PlannedExpenseInsert {
	id?: string;
	name: string;
	amount: number;
	category_id: string;
	subcategory?: string | null;
	note?: string | null;
	due_date: string;
	priority?: 'low' | 'medium' | 'high' | 'urgent';
	status?: 'planned' | 'confirmed' | 'completed' | 'cancelled';
	user_id?: string | null;
	created_by?: string;
	shared_account_id?: string | null;
	is_shared?: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface PlannedExpenseUpdate {
	name?: string;
	amount?: number;
	category_id?: string;
	subcategory?: string | null;
	note?: string | null;
	due_date?: string;
	priority?: 'low' | 'medium' | 'high' | 'urgent';
	status?: 'planned' | 'confirmed' | 'completed' | 'cancelled';
	updated_at?: string;
}

// Legacy types for backward compatibility (mapped to Supabase types)
export interface CategoryDocument extends CategoryRow {
	type: TransactionType;
}
export interface TransactionDocument extends TransactionRow {
	type: TransactionType;
}

export type ShoppingListDocument = ShoppingListRow;
export type ListItemDocument = ListItemRow;

export type CreateCategoryInput = CategoryInsert;
export type CreateTransactionInput = TransactionInsert;
export type UpdateCategoryInput = CategoryUpdate;
export type UpdateTransactionInput = TransactionUpdate;

export type CreateShoppingListInput = ShoppingListInsert;
export type UpdateShoppingListInput = ShoppingListUpdate;
export type CreateListItemInput = ListItemInsert;
export type UpdateListItemInput = ListItemUpdate;

export type RecurringTransactionDocument = RecurringTransactionRow;
export type CreateRecurringTransactionInput = RecurringTransactionInsert;
export type UpdateRecurringTransactionInput = RecurringTransactionUpdate;

export type PlannedExpenseDocument = PlannedExpenseRow;
export type CreatePlannedExpenseInput = PlannedExpenseInsert;
export type UpdatePlannedExpenseInput = PlannedExpenseUpdate;

// Profile types (defined manually until Supabase types are regenerated)
export interface ProfileRow {
	id: string;
	user_id: string;
	email: string;
	first_name: string | null;
	last_name: string | null;
	display_name: string | null;
	address_line_1: string | null;
	address_line_2: string | null;
	city: string | null;
	state_province: string | null;
	postal_code: string | null;
	country: string | null;
	phone: string | null;
	date_of_birth: string | null;
	avatar_url: string | null;
	bio: string | null;
	created_at: string;
	updated_at: string;
}

export interface ProfileInsert {
	id?: string;
	user_id: string;
	email?: string | null;
	first_name?: string | null;
	last_name?: string | null;
	display_name?: string | null;
	address_line_1?: string | null;
	address_line_2?: string | null;
	city?: string | null;
	state_province?: string | null;
	postal_code?: string | null;
	country?: string | null;
	phone?: string | null;
	date_of_birth?: string | null;
	avatar_url?: string | null;
	bio?: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface ProfileUpdate {
	id?: string;
	first_name?: string | null;
	last_name?: string | null;
	display_name?: string | null;
	address_line_1?: string | null;
	address_line_2?: string | null;
	city?: string | null;
	state_province?: string | null;
	postal_code?: string | null;
	country?: string | null;
	phone?: string | null;
	date_of_birth?: string | null;
	avatar_url?: string | null;
	bio?: string | null;
	updated_at?: string;
}

export type ProfileDocument = ProfileRow;
export type CreateProfileInput = ProfileInsert;
export type UpdateProfileInput = ProfileUpdate;

// Family and Collaboration types (defined manually until Supabase types are regenerated)
export interface FamilyRow {
	id: string;
	name: string;
	description: string | null;
	owner_id: string;
	created_at: string;
	updated_at: string;
}

export interface FamilyInsert {
	id?: string;
	name: string;
	description?: string | null;
	owner_id: string;
	created_at?: string;
	updated_at?: string;
}

export interface FamilyUpdate {
	name?: string;
	description?: string | null;
	updated_at?: string;
}

export interface FamilyMemberRow {
	id: string;
	family_id: string;
	user_id: string;
	role: 'owner' | 'admin' | 'member' | 'viewer';
	joined_at: string;
}

export interface FamilyMemberInsert {
	id?: string;
	family_id: string;
	user_id: string;
	role?: 'owner' | 'admin' | 'member' | 'viewer';
	joined_at?: string;
}

export interface FamilyMemberUpdate {
	role?: 'owner' | 'admin' | 'member' | 'viewer';
}

export type FamilyDocument = FamilyRow;
export type CreateFamilyInput = FamilyInsert;
export type UpdateFamilyInput = FamilyUpdate;

export type FamilyMemberDocument = FamilyMemberRow;
export type CreateFamilyMemberInput = FamilyMemberInsert;
export type UpdateFamilyMemberInput = FamilyMemberUpdate;

// Invitation types
export interface InvitationRow {
	id: string;
	email: string;
	invited_by: string;
	family_id: string;
	role: 'owner' | 'admin' | 'member' | 'viewer';
	status: 'pending' | 'accepted' | 'expired' | 'cancelled';
	invite_token: string | null;
	expires_at: string;
	created_at: string;
	accepted_at: string | null;
	accepted_by: string | null;
}

export interface InvitationInsert {
	id?: string;
	email: string;
	invited_by: string;
	family_id: string;
	role?: 'owner' | 'admin' | 'member' | 'viewer';
	status?: 'pending' | 'accepted' | 'expired' | 'cancelled';
	invite_token?: string | null;
	expires_at?: string;
	created_at?: string;
	accepted_at?: string | null;
	accepted_by?: string | null;
}

export interface InvitationUpdate {
	status?: 'pending' | 'accepted' | 'expired' | 'cancelled';
	accepted_at?: string | null;
	accepted_by?: string | null;
}

export type InvitationDocument = InvitationRow;
export type CreateInvitationInput = InvitationInsert;
export type UpdateInvitationInput = InvitationUpdate;
