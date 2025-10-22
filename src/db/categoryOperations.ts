import { supabase } from './supabase';
import type { CategoryDocument, CreateCategoryInput, UpdateCategoryInput } from './schemas';

export class CategoryOperations {
	// Create a new category
	static async create(categoryData: CreateCategoryInput): Promise<CategoryDocument> {
		const { data, error } = await supabase.from('categories').insert(categoryData).select().single();

		if (error) throw error;
		return data;
	}

	// Get all categories
	static async findAll(userId: string): Promise<CategoryDocument[]> {
		const { data, error } = await supabase.from('categories').select('*').eq('user_id', userId).order('name');

		if (error) throw error;
		return data;
	}

	// Get category by ID
	static async findById(id: string, userId: string): Promise<CategoryDocument | null> {
		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.eq('id', id)
			.eq('user_id', userId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Get categories by type
	static async findByType(userId: string, type: 'Income' | 'Expense' | 'Savings'): Promise<CategoryDocument[]> {
		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.eq('user_id', userId)
			.eq('type', type)
			.order('name');

		if (error) throw error;
		return data;
	}

	// Update category
	static async update(id: string, updateData: UpdateCategoryInput, userId: string): Promise<CategoryDocument | null> {
		const { data, error } = await supabase
			.from('categories')
			.update(updateData)
			.eq('id', id)
			.eq('user_id', userId)
			.select()
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Delete category
	static async delete(id: string, userId: string): Promise<boolean> {
		const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', userId);

		if (error) throw error;
		return true;
	}

	// Check if category exists
	static async exists(id: string, userId: string): Promise<boolean> {
		const { data, error } = await supabase
			.from('categories')
			.select('id')
			.eq('id', id)
			.eq('user_id', userId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return false; // Not found
			throw error;
		}
		return !!data;
	}

	// Get category names for dropdowns
	static async getCategoryNames(userId: string): Promise<{ id: string; name: string; type: string }[]> {
		const { data, error } = await supabase
			.from('categories')
			.select('id, name, type')
			.eq('user_id', userId)
			.order('name');

		if (error) throw error;
		return data;
	}
}
