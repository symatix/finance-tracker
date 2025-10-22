import { useState, useMemo } from 'react';
import { type Transaction } from '../../../store/store';

export interface TableOperations {
	editTransaction: (transaction: Transaction) => void;
	deleteTransaction: (id: string) => void;
	confirmDelete: () => void;
	cancelDelete: () => void;
}

export function useTransactionTable(
	filteredTransactions: Transaction[],
	onUpdate: (id: string, data: { amount: number; note: string; categoryId: string; subcategory?: string }) => void,
	onDelete: (id: string) => void
) {
	// Pagination state
	const [page, setPage] = useState(1);
	const rowsPerPage = 10;

	// Modal state
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

	// Delete confirmation state
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

	// Paginated data
	const paginatedTransactions = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		return filteredTransactions.slice(start, start + rowsPerPage);
	}, [filteredTransactions, page]);

	const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);

	// Handlers
	const editTransaction = (transaction: Transaction) => {
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

	const saveTransaction = (data: {
		id?: string;
		amount: number;
		note: string;
		categoryId: string;
		subcategory?: string;
		type?: string; // Optional for compatibility with unified modal
	}) => {
		if (data.id) {
			onUpdate(data.id, {
				amount: data.amount,
				note: data.note,
				categoryId: data.categoryId,
				subcategory: data.subcategory,
			});
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
