export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			categories: {
				Row: {
					id: string;
					name: string;
					type: string;
					subcategories: string[] | null;
					created_by: string | null;
					shared_account_id: string | null;
					is_shared: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					type: string;
					subcategories?: string[] | null;
					created_by?: string;
					shared_account_id?: string | null;
					is_shared?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					type?: string;
					subcategories?: string[] | null;
					updated_at?: string;
				};
			};
			transactions: {
				Row: {
					id: string;
					amount: number;
					type: string;
					category_id: string;
					subcategory: string | null;
					note: string | null;
					date: string;
					user_id: string | null;
					created_by: string | null;
					shared_account_id: string | null;
					is_shared: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					amount: number;
					type: string;
					category_id: string;
					subcategory?: string | null;
					note?: string | null;
					date: string;
					user_id?: string | null;
					created_by?: string;
					shared_account_id?: string | null;
					is_shared?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					amount?: number;
					type?: string;
					category_id?: string;
					subcategory?: string | null;
					note?: string | null;
					date?: string;
					updated_at?: string;
				};
			};
			shopping_lists: {
				Row: {
					id: string;
					name: string;
					category_id: string;
					subcategory: string | null;
					status: string;
					user_id: string | null;
					created_by: string | null;
					shared_account_id: string | null;
					is_shared: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					category_id: string;
					subcategory?: string | null;
					status?: string;
					user_id?: string | null;
					created_by?: string;
					shared_account_id?: string | null;
					is_shared?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					category_id?: string;
					subcategory?: string | null;
					status?: string;
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
					updated_at?: string;
				};
			};
			recurring_transactions: {
				Row: {
					id: string;
					name: string;
					amount: number;
					type: string;
					category_id: string;
					subcategory: string | null;
					note: string | null;
					frequency: string;
					start_date: string;
					end_date: string | null;
					next_due_date: string;
					is_active: boolean;
					user_id: string | null;
					created_by: string | null;
					shared_account_id: string | null;
					is_shared: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					amount: number;
					type: string;
					category_id: string;
					subcategory?: string | null;
					note?: string | null;
					frequency: string;
					start_date: string;
					end_date?: string | null;
					next_due_date: string;
					is_active?: boolean;
					user_id?: string | null;
					created_by?: string;
					shared_account_id?: string | null;
					is_shared?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					amount?: number;
					type?: string;
					category_id?: string;
					subcategory?: string | null;
					note?: string | null;
					frequency?: string;
					start_date?: string;
					end_date?: string | null;
					next_due_date?: string;
					is_active?: boolean;
					updated_at?: string;
				};
			};
			families: {
				Row: {
					id: string;
					name: string;
					description: string | null;
					owner_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					description?: string | null;
					owner_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					description?: string | null;
					updated_at?: string;
				};
			};
			family_members: {
				Row: {
					id: string;
					family_id: string;
					user_id: string;
					role: string;
					joined_at: string;
				};
				Insert: {
					id?: string;
					family_id: string;
					user_id: string;
					role?: string;
					joined_at?: string;
				};
				Update: {
					id?: string;
					role?: string;
				};
			};
			invitations: {
				Row: {
					id: string;
					email: string;
					invited_by: string;
					family_id: string;
					role: string;
					status: string;
					invite_token: string | null;
					expires_at: string;
					created_at: string;
					accepted_at: string | null;
					accepted_by: string | null;
				};
				Insert: {
					id?: string;
					email: string;
					invited_by: string;
					family_id: string;
					role?: string;
					status?: string;
					invite_token?: string | null;
					expires_at?: string;
					created_at?: string;
					accepted_at?: string | null;
					accepted_by?: string | null;
				};
				Update: {
					id?: string;
					status?: string;
					accepted_at?: string | null;
					accepted_by?: string | null;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
	};
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
