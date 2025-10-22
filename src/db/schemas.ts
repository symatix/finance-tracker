import type { Database } from './supabase';
import type { TransactionType } from '../store';

// Re-export Supabase types for convenience
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type TransactionRow = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

// Legacy types for backward compatibility (mapped to Supabase types)
export interface CategoryDocument extends CategoryRow {
	type: TransactionType;
}
export interface TransactionDocument extends TransactionRow {
	type: TransactionType;
}

export type CreateCategoryInput = CategoryInsert;
export type CreateTransactionInput = TransactionInsert;
export type UpdateCategoryInput = CategoryUpdate;
export type UpdateTransactionInput = TransactionUpdate;
