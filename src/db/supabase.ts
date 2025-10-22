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
		};
	};
}
