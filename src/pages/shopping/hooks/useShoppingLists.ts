import { useState, useEffect, useCallback } from 'react';
import { ShoppingListOperations } from '../../../db';
import type { ShoppingListDocument, CreateShoppingListInput, UpdateShoppingListInput } from '../../../db';
import { useAuth } from '../../../hooks/useAuth';

export function useShoppingLists(filter: 'active' | 'completed' | 'all' = 'active') {
	const { user } = useAuth();
	const [shoppingLists, setShoppingLists] = useState<ShoppingListDocument[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchLists = useCallback(async () => {
		if (!user) return;
		try {
			const lists = await ShoppingListOperations.findWithCategoryDetails(user.id, filter);
			setShoppingLists(lists);
		} catch (error) {
			console.error('Error fetching shopping lists:', error);
		} finally {
			setLoading(false);
		}
	}, [user, filter]);

	useEffect(() => {
		fetchLists();
	}, [fetchLists]);

	const createList = async (
		data: Omit<CreateShoppingListInput, 'user_id'> & {
			items?: { name: string; quantity: number; estimated_price?: number }[];
		}
	) => {
		if (!user) return;
		try {
			const { items, ...listData } = data;
			if (items && items.length > 0) {
				await ShoppingListOperations.createWithItems({ ...listData, user_id: user.id }, items);
			} else {
				await ShoppingListOperations.create({ ...listData, user_id: user.id });
			}
			await fetchLists(); // Refresh
		} catch (error) {
			console.error('Error creating shopping list:', error);
			throw error;
		}
	};

	const updateList = async (id: string, data: UpdateShoppingListInput) => {
		if (!user) return;
		try {
			await ShoppingListOperations.update(id, data, user.id);
			await fetchLists(); // Refresh
		} catch (error) {
			console.error('Error updating shopping list:', error);
			throw error;
		}
	};

	const deleteList = async (id: string) => {
		if (!user) return;
		try {
			await ShoppingListOperations.delete(id, user.id);
			await fetchLists(); // Refresh
		} catch (error) {
			console.error('Error deleting shopping list:', error);
			throw error;
		}
	};

	return {
		shoppingLists,
		loading,
		createList,
		updateList,
		deleteList,
		refetch: fetchLists,
	};
}
