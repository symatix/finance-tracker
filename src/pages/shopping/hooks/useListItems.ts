import { useState, useEffect, useCallback } from 'react';
import { ListItemOperations } from '../../../db';
import type { ListItemDocument, CreateListItemInput, UpdateListItemInput } from '../../../db';

export function useListItems(listId: string | null) {
	const [items, setItems] = useState<ListItemDocument[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchItems = useCallback(async () => {
		if (!listId) {
			setItems([]);
			return;
		}
		setLoading(true);
		try {
			const fetchedItems = await ListItemOperations.findByListId(listId);
			setItems(fetchedItems);
		} catch (error) {
			console.error('Error fetching list items:', error);
		} finally {
			setLoading(false);
		}
	}, [listId]);

	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	const createItem = async (data: CreateListItemInput) => {
		try {
			await ListItemOperations.create(data);
			await fetchItems(); // Refresh
		} catch (error) {
			console.error('Error creating list item:', error);
			throw error;
		}
	};

	const updateItem = async (id: string, data: UpdateListItemInput) => {
		try {
			await ListItemOperations.update(id, data);
			await fetchItems(); // Refresh
		} catch (error) {
			console.error('Error updating list item:', error);
			throw error;
		}
	};

	const deleteItem = async (id: string) => {
		try {
			await ListItemOperations.delete(id);
			await fetchItems(); // Refresh
		} catch (error) {
			console.error('Error deleting list item:', error);
			throw error;
		}
	};

	const toggleItemChecked = async (id: string) => {
		try {
			await ListItemOperations.toggleChecked(id);
			await fetchItems(); // Refresh
		} catch (error) {
			console.error('Error toggling item checked:', error);
			throw error;
		}
	};

	const isListComplete = async () => {
		if (!listId) return false;
		try {
			return await ListItemOperations.isListComplete(listId);
		} catch (error) {
			console.error('Error checking if list is complete:', error);
			return false;
		}
	};

	return {
		items,
		loading,
		createItem,
		updateItem,
		deleteItem,
		toggleItemChecked,
		isListComplete,
		refetch: fetchItems,
	};
}
