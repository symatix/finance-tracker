import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Database {
	public: {
		Tables: {
			categories: {
				Row: {
					id: string;
					name: string;
					type: 'Income' | 'Expense' | 'Savings';
					subcategories: string[];
					user_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					type: 'Income' | 'Expense' | 'Savings';
					subcategories?: string[];
					user_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					type?: 'Income' | 'Expense' | 'Savings';
					subcategories?: string[];
					user_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			transactions: {
				Row: {
					id: string;
					amount: number;
					type: 'Income' | 'Expense' | 'Savings';
					category_id: string;
					subcategory: string | null;
					note: string;
					date: string;
					user_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					amount: number;
					type: 'Income' | 'Expense' | 'Savings';
					category_id: string;
					subcategory?: string | null;
					note: string;
					date: string;
					user_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					amount?: number;
					type?: 'Income' | 'Expense' | 'Savings';
					category_id?: string;
					subcategory?: string | null;
					note?: string;
					date?: string;
					user_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			shopping_lists: {
				Row: {
					id: string;
					name: string;
					category_id: string;
					subcategory: string | null;
					status: 'active' | 'completed';
					user_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					category_id: string;
					subcategory?: string | null;
					status?: 'active' | 'completed';
					user_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					category_id?: string;
					subcategory?: string | null;
					status?: 'active' | 'completed';
					user_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			list_items: {
				Row: {
					id: string;
					list_id: string;
					name: string;
					quantity: number;
					estimated_price: number | null;
					checked: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					list_id: string;
					name: string;
					quantity?: number;
					estimated_price?: number | null;
					checked?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					list_id?: string;
					name?: string;
					quantity?: number;
					estimated_price?: number | null;
					checked?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			recurring_transactions: {
				Row: {
					id: string;
					name: string;
					amount: number;
					type: 'Income' | 'Expense' | 'Savings';
					category_id: string;
					subcategory: string | null;
					note: string;
					frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
					start_date: string;
					end_date: string | null;
					next_due_date: string;
					is_active: boolean;
					user_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					amount: number;
					type: 'Income' | 'Expense' | 'Savings';
					category_id: string;
					subcategory?: string | null;
					note: string;
					frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
					start_date: string;
					end_date?: string | null;
					next_due_date: string;
					is_active?: boolean;
					user_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					amount?: number;
					type?: 'Income' | 'Expense' | 'Savings';
					category_id?: string;
					subcategory?: string | null;
					note?: string;
					frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
					start_date?: string;
					end_date?: string | null;
					next_due_date?: string;
					is_active?: boolean;
					user_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
		};
	};
}
