import { useState, useEffect, useMemo } from 'react';
import { ShoppingListOperations } from '../../../db';
import { useAuth } from '../../../hooks/useAuth';
import { useBudgetStore } from '../../../store';

export function useDashboardMetrics(selectedMonth: number, selectedYear: number) {
	const { user } = useAuth();
	const { plannedExpenses } = useBudgetStore();
	const [activeShoppingListsCount, setActiveShoppingListsCount] = useState(0);
	const [loading, setLoading] = useState(true);

	// Fetch active shopping lists count
	useEffect(() => {
		const fetchActiveShoppingLists = async () => {
			if (!user) return;
			try {
				const activeLists = await ShoppingListOperations.findByStatus(user.id, 'active');
				setActiveShoppingListsCount(activeLists.length);
			} catch (error) {
				console.error('Error fetching active shopping lists:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchActiveShoppingLists();
	}, [user]);

	// Calculate monthly planned expenses total
	const monthlyPlannedExpensesTotal = useMemo(() => {
		return plannedExpenses
			.filter((expense) => {
				const dueDate = new Date(expense.due_date);
				return dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear;
			})
			.reduce((total, expense) => total + expense.amount, 0);
	}, [plannedExpenses, selectedMonth, selectedYear]);

	return {
		activeShoppingListsCount,
		monthlyPlannedExpensesTotal,
		loading,
	};
}
