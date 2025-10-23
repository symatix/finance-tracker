import { supabase } from './supabase';
import type { ListItemDocument, CreateListItemInput, UpdateListItemInput } from './schemas';

export class ListItemOperations {
	// Create a new list item
	static async create(itemData: CreateListItemInput): Promise<ListItemDocument> {
		const now = new Date().toISOString();

		const { data, error } = await supabase
			.from('list_items')
			.insert({
				...itemData,
				created_at: now,
				updated_at: now,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	// Get all items for a list
	static async findByListId(listId: string): Promise<ListItemDocument[]> {
		const { data, error } = await supabase
			.from('list_items')
			.select('*')
			.eq('list_id', listId)
			.order('created_at', { ascending: true });

		if (error) throw error;
		return data || [];
	}

	// Get item by ID
	static async findById(id: string): Promise<ListItemDocument | null> {
		const { data, error } = await supabase.from('list_items').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Update list item
	static async update(id: string, updateData: UpdateListItemInput): Promise<ListItemDocument | null> {
		const { data, error } = await supabase
			.from('list_items')
			.update({
				...updateData,
				updated_at: new Date().toISOString(),
			})
			.eq('id', id)
			.select()
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Delete list item
	static async delete(id: string): Promise<boolean> {
		const { error } = await supabase.from('list_items').delete().eq('id', id);

		if (error) throw error;
		return true;
	}

	// Toggle checked status
	static async toggleChecked(id: string): Promise<ListItemDocument | null> {
		// First get current status
		const currentItem = await this.findById(id);
		if (!currentItem) return null;

		return this.update(id, { checked: !currentItem.checked });
	}

	// Check if all items in a list are checked
	static async isListComplete(listId: string): Promise<boolean> {
		const items = await this.findByListId(listId);
		return items.length > 0 && items.every((item) => item.checked);
	}

	// Bulk update items (e.g., mark multiple as checked)
	static async bulkUpdate(ids: string[], updateData: Partial<UpdateListItemInput>): Promise<ListItemDocument[]> {
		const { data, error } = await supabase
			.from('list_items')
			.update({
				...updateData,
				updated_at: new Date().toISOString(),
			})
			.in('id', ids)
			.select();

		if (error) throw error;
		return data || [];
	}
}
