import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useBudgetStore } from '../../../store';
import type { RecurringTransactionDocument, CreateRecurringTransactionInput } from '../../../db';

export function useRecurringTransactions() {
	const { user } = useAuth();
	const {
		recurringTransactions,
		addRecurringTransaction,
		updateRecurringTransaction,
		deleteRecurringTransaction,
		loadRecurringTransactions,
		processDueRecurringTransactions,
	} = useBudgetStore();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user && recurringTransactions.length === 0) {
			loadRecurringTransactions(user.id);
		}
	}, [user, loadRecurringTransactions, recurringTransactions.length]);

	const createRecurring = async (data: Omit<CreateRecurringTransactionInput, 'user_id'>) => {
		if (!user) return;
		setLoading(true);
		try {
			await addRecurringTransaction(user.id, { ...data, user_id: user.id });
		} finally {
			setLoading(false);
		}
	};

	const updateRecurring = async (id: string, updates: Partial<RecurringTransactionDocument>) => {
		if (!user) return;
		setLoading(true);
		try {
			await updateRecurringTransaction(user.id, id, updates);
		} finally {
			setLoading(false);
		}
	};

	const deleteRecurring = async (id: string) => {
		if (!user) return;
		setLoading(true);
		try {
			await deleteRecurringTransaction(user.id, id);
		} finally {
			setLoading(false);
		}
	};

	const processDueRecurring = async () => {
		if (!user) return;
		setLoading(true);
		try {
			await processDueRecurringTransactions(user.id);
		} finally {
			setLoading(false);
		}
	};

	return {
		recurringTransactions,
		loading,
		createRecurring,
		updateRecurring,
		deleteRecurring,
		processDueRecurring,
	};
}
