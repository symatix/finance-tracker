import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useBudgetStore } from '../../../store';
import type { PlannedExpenseDocument, CreatePlannedExpenseInput } from '../../../db';

export function usePlannedExpenses() {
	const { user } = useAuth();
	const {
		plannedExpenses,
		addPlannedExpense,
		updatePlannedExpense,
		deletePlannedExpense,
		loadPlannedExpenses,
		convertPlannedExpenseToTransaction,
	} = useBudgetStore();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user && plannedExpenses.length === 0) {
			loadPlannedExpenses(user.id);
		}
	}, [user, loadPlannedExpenses, plannedExpenses.length]);

	const createPlannedExpense = async (data: Omit<CreatePlannedExpenseInput, 'user_id'>) => {
		if (!user) return;
		setLoading(true);
		try {
			await addPlannedExpense(user.id, { ...data, user_id: user.id });
		} finally {
			setLoading(false);
		}
	};

	const updatePlannedExpenseHook = async (id: string, updates: Partial<PlannedExpenseDocument>) => {
		if (!user) return;
		setLoading(true);
		try {
			await updatePlannedExpense(user.id, id, updates);
		} finally {
			setLoading(false);
		}
	};

	const deletePlannedExpenseHook = async (id: string) => {
		if (!user) return;
		setLoading(true);
		try {
			await deletePlannedExpense(user.id, id);
		} finally {
			setLoading(false);
		}
	};

	const convertToTransaction = async (id: string) => {
		if (!user) return;
		setLoading(true);
		try {
			await convertPlannedExpenseToTransaction(user.id, id);
		} finally {
			setLoading(false);
		}
	};

	return {
		plannedExpenses,
		loading,
		createPlannedExpense,
		updatePlannedExpense: updatePlannedExpenseHook,
		deletePlannedExpense: deletePlannedExpenseHook,
		convertToTransaction,
	};
}
