import { useState, useMemo } from 'react';
import type { PlannedExpenseDocument } from '../../../db';

const ITEMS_PER_PAGE = 10;

export function usePlannedExpenseTable(
	plannedExpenses: (PlannedExpenseDocument & { categoryName?: string; categoryType?: string })[],
	onUpdateExpense: (id: string, updates: Partial<PlannedExpenseDocument>) => void,
	onDeleteExpense: (id: string) => void,
	onConvertToTransaction: (id: string) => void
) {
	const [page, setPage] = useState(1);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedExpense, setSelectedExpense] = useState<PlannedExpenseDocument | undefined>(undefined);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [expenseToDelete, setExpenseToDelete] = useState<string>('');

	// Sort expenses by due date (closest first)
	const sortedExpenses = useMemo(() => {
		return [...plannedExpenses].sort((a, b) => {
			const dateA = new Date(a.due_date).getTime();
			const dateB = new Date(b.due_date).getTime();
			return dateA - dateB;
		});
	}, [plannedExpenses]);

	// Paginate expenses
	const totalPages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE);
	const paginatedExpenses = useMemo(() => {
		const startIndex = (page - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		return sortedExpenses.slice(startIndex, endIndex);
	}, [sortedExpenses, page]);

	// Reset to first page when expenses change
	useMemo(() => {
		if (page > totalPages && totalPages > 0) {
			setPage(1);
		}
	}, [page, totalPages]);

	const editExpense = (expense: PlannedExpenseDocument) => {
		setSelectedExpense(expense);
		setModalOpen(true);
	};

	const deleteExpense = (id: string) => {
		setExpenseToDelete(id);
		setConfirmOpen(true);
	};

	const convertExpense = (id: string) => {
		onConvertToTransaction(id);
	};

	const confirmDelete = () => {
		onDeleteExpense(expenseToDelete);
		setConfirmOpen(false);
		setExpenseToDelete('');
	};

	const cancelDelete = () => {
		setConfirmOpen(false);
		setExpenseToDelete('');
	};

	const saveExpense = async (expenseData: {
		name: string;
		amount: number;
		category_id: string;
		subcategory: string | null;
		note: string;
		due_date: string;
		priority: 'low' | 'medium' | 'high' | 'urgent';
		status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
	}) => {
		if (selectedExpense) {
			await onUpdateExpense(selectedExpense.id, expenseData);
		}
		closeModal();
	};

	const closeModal = () => {
		setModalOpen(false);
		setSelectedExpense(undefined);
	};

	return {
		page,
		setPage,
		totalPages,
		paginatedExpenses,
		modalOpen,
		selectedExpense,
		confirmOpen,
		editExpense,
		deleteExpense,
		convertExpense,
		confirmDelete,
		cancelDelete,
		saveExpense,
		closeModal,
	};
}
