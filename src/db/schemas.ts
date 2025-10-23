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
