import { supabase } from './supabase';
import type { ShoppingListDocument, CreateShoppingListInput, UpdateShoppingListInput } from './schemas';
import { TransactionOperations } from './transactionOperations';
import type { TransactionDocument } from './schemas';

export class ShoppingListOperations {
	// Create a new shopping list
	static async create(listData: CreateShoppingListInput): Promise<ShoppingListDocument> {
		const now = new Date().toISOString();

		const { data, error } = await supabase
			.from('shopping_lists')
			.insert({
				...listData,
				created_at: now,
				updated_at: now,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	// Create a new shopping list with items
	static async createWithItems(
		listData: CreateShoppingListInput,
		items: { name: string; quantity: number; estimated_price?: number }[]
	): Promise<ShoppingListDocument> {
		// Create the list first
		const list = await this.create(listData);

		// Create items if any
		if (items.length > 0) {
			const now = new Date().toISOString();
			const itemsData = items.map((item) => ({
				list_id: list.id,
				name: item.name,
				quantity: item.quantity,
				estimated_price: item.estimated_price,
				created_at: now,
				updated_at: now,
			}));

			const { error: itemsError } = await supabase.from('list_items').insert(itemsData);
			if (itemsError) throw itemsError;
		}

		return list;
	}

	// Get all shopping lists
	static async findAll(userId: string): Promise<ShoppingListDocument[]> {
		const { data, error } = await supabase
			.from('shopping_lists')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Get shopping list by ID
	static async findById(id: string, userId: string): Promise<ShoppingListDocument | null> {
		const { data, error } = await supabase
			.from('shopping_lists')
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

	// Get shopping lists by category
	static async findByCategory(userId: string, categoryId: string): Promise<ShoppingListDocument[]> {
		const { data, error } = await supabase
			.from('shopping_lists')
			.select('*')
			.eq('user_id', userId)
			.eq('category_id', categoryId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Get shopping lists by status
	static async findByStatus(userId: string, status: 'active' | 'completed'): Promise<ShoppingListDocument[]> {
		const { data, error } = await supabase
			.from('shopping_lists')
			.select('*')
			.eq('user_id', userId)
			.eq('status', status)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Update shopping list
	static async update(
		id: string,
		updateData: UpdateShoppingListInput,
		userId: string
	): Promise<ShoppingListDocument | null> {
		const { data, error } = await supabase
			.from('shopping_lists')
			.update({
				...updateData,
				updated_at: new Date().toISOString(),
			})
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

	// Delete shopping list
	static async delete(id: string, userId: string): Promise<boolean> {
		const { error } = await supabase.from('shopping_lists').delete().eq('id', id).eq('user_id', userId);

		if (error) throw error;
		return true;
	}

	// Get shopping lists with category details (joined)
	static async findWithCategoryDetails(
		userId: string,
		statusFilter: 'active' | 'completed' | 'all' = 'active'
	): Promise<Array<ShoppingListDocument & { categoryName?: string; categoryType?: string }>> {
		let query = supabase
			.from('shopping_lists')
			.select(
				`
				*,
				categories (
					name,
					type
				)
			`
			)
			.eq('user_id', userId);

		// Apply status filter
		if (statusFilter !== 'all') {
			query = query.eq('status', statusFilter);
		}

		const { data, error } = await query.order('created_at', { ascending: false });

		if (error) throw error;

		// Transform the nested category data to flat structure
		return (data || []).map((list: ShoppingListDocument & { categories?: { name: string; type: string } }) => ({
			...list,
			categoryName: list.categories?.name,
			categoryType: list.categories?.type,
		}));
	}

	// Complete a shopping list and create a transaction
	static async completeList(
		id: string,
		totalAmount: number,
		userId: string,
		note?: string
	): Promise<{ list: ShoppingListDocument; transaction: TransactionDocument } | null> {
		// First, get the list to get category info
		const list = await this.findById(id, userId);
		if (!list) return null;

		// Update list status to completed
		const updatedList = await this.update(id, { status: 'completed' }, userId);
		if (!updatedList) return null;

		// Create transaction
		const transaction = await TransactionOperations.create({
			amount: totalAmount,
			type: 'Expense', // Assuming shopping lists are expenses
			category_id: list.category_id,
			subcategory: null,
			note: note || `Shopping list: ${list.name}`,
			date: new Date().toISOString().split('T')[0], // Today's date
			user_id: userId,
		});

		return { list: updatedList, transaction };
	}
}
