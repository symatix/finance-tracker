import { useState } from 'react';
import type { Category, TransactionType } from '../../../store';

export interface UseCategoryTableProps {
	categories: Category[];
	transactionCategoryIds: string[];
	onAdd: (name: string, type: TransactionType, subcategories: string[]) => Promise<void>;
	onUpdate: (id: string, name: string, type: TransactionType, subcategories: string[]) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
}

export function useCategoryTable({
	categories,
	transactionCategoryIds,
	onAdd,
	onUpdate,
	onDelete,
}: UseCategoryTableProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
	const [hasTransactions, setHasTransactions] = useState(false);

	const categoryToEdit = categories.find((c) => c.id === editCategoryId);

	// Modal handlers
	const openAddModal = () => {
		setEditCategoryId(null);
		setModalOpen(true);
	};

	const openEditModal = (id: string) => {
		setEditCategoryId(id);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setEditCategoryId(null);
	};

	const handleSave = async (name: string, type: TransactionType, subcategories: string[]) => {
		try {
			if (editCategoryId && categoryToEdit) {
				await onUpdate(editCategoryId, name, type, subcategories);
			} else {
				await onAdd(name, type, subcategories);
			}
			closeModal();
		} catch (error) {
			console.error('Failed to save category:', error);
			// Error handling is done in the store
		}
	};

	// Delete handlers
	const openConfirmDialog = (id: string) => {
		const attached = transactionCategoryIds.includes(id);
		setCategoryToDelete(id);
		setHasTransactions(attached);
		setConfirmOpen(true);
	};

	const handleConfirmDelete = async () => {
		try {
			if (categoryToDelete && !hasTransactions) {
				await onDelete(categoryToDelete);
			}
			setConfirmOpen(false);
			setCategoryToDelete(null);
			setHasTransactions(false);
		} catch (error) {
			console.error('Failed to delete category:', error);
			// Error handling is done in the store
		}
	};

	const handleCancelDelete = () => {
		setConfirmOpen(false);
		setCategoryToDelete(null);
		setHasTransactions(false);
	};

	return {
		// Modal state
		modalOpen,
		editCategoryId,
		categoryToEdit,

		// Confirm dialog state
		confirmOpen,
		hasTransactions,

		// Actions
		openAddModal,
		openEditModal,
		closeModal,
		handleSave,
		openConfirmDialog,
		handleConfirmDelete,
		handleCancelDelete,
	};
}
