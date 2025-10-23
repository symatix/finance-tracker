import { useState, useMemo } from 'react';
import type { RecurringTransactionDocument } from '../../../db';

export function useRecurringTransactionTable(
	recurringTransactions: (RecurringTransactionDocument & { categoryName?: string; categoryType?: string })[],
	onUpdate: (id: string, updates: Partial<RecurringTransactionDocument>) => void,
	onDelete: (id: string) => void
) {
	// Pagination state
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;

	// Modal state
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransactionDocument | null>(null);

	// Delete confirmation state
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

	// Paginated data
	const paginatedTransactions = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return recurringTransactions.slice(start, start + rowsPerPage);
	}, [recurringTransactions, page]);

	const totalPages = Math.ceil(recurringTransactions.length / rowsPerPage);

	// Handlers
	const editTransaction = (transaction: RecurringTransactionDocument) => {
		setSelectedTransaction(transaction);
		setModalOpen(true);
	};

	const deleteTransaction = (id: string) => {
		setTransactionToDelete(id);
		setConfirmOpen(true);
	};

	const confirmDelete = () => {
		if (transactionToDelete) {
			onDelete(transactionToDelete);
		}
		setConfirmOpen(false);
		setTransactionToDelete(null);
	};

	const cancelDelete = () => {
		setConfirmOpen(false);
		setTransactionToDelete(null);
	};

	const saveTransaction = async (data: {
		name: string;
		amount: number;
		type: 'Income' | 'Expense' | 'Savings';
		category_id: string;
		subcategory: string | null;
		note: string;
		frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
		start_date: string;
		end_date: string | null;
		next_due_date: string;
		is_active: boolean;
	}) => {
		if (selectedTransaction) {
			await onUpdate(selectedTransaction.id, data);
		}
		setModalOpen(false);
		setSelectedTransaction(null);
	};

	const closeModal = () => {
		setModalOpen(false);
		setSelectedTransaction(null);
	};

	return {
		// Pagination
		page,
		setPage,
		totalPages,
		paginatedTransactions,

		// Modal state
		modalOpen,
		selectedTransaction,
		closeModal,

		// Delete confirmation
		confirmOpen,

		// Operations
		editTransaction,
		deleteTransaction,
		confirmDelete,
		cancelDelete,
		saveTransaction,
	};
}
