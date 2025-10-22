import type { TransactionType } from '../../../store';
import { useState, useEffect } from 'react';

export interface CategoryFormData {
	name: string;
	type: TransactionType;
	subcategories: string[];
}

export interface UseCategoryModalProps {
	open: boolean;
	initialData?: CategoryFormData;
}

export function useCategoryModal({ open, initialData }: UseCategoryModalProps) {
	const [name, setName] = useState('');
	const [type, setType] = useState<TransactionType>('Expense');
	const [subcategories, setSubcategories] = useState<string[]>([]);
	const [newSubcategoryName, setNewSubcategoryName] = useState('');
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editingName, setEditingName] = useState('');

	// Reset form when modal opens or initial data changes
	useEffect(() => {
		if (open) {
			setName(initialData?.name || '');
			setType(initialData?.type || 'Expense');
			setSubcategories(initialData?.subcategories ? [...initialData.subcategories] : []);
			setNewSubcategoryName('');
			setEditingIndex(null);
			setEditingName('');
		}
	}, [open, initialData]);

	const addSubcategory = () => {
		const trimmed = newSubcategoryName.trim();
		if (!trimmed) return;
		setSubcategories([...subcategories, trimmed]);
		setNewSubcategoryName('');
	};

	const startEditSubcategory = (index: number) => {
		setEditingIndex(index);
		setEditingName(subcategories[index]);
	};

	const saveEditSubcategory = () => {
		const trimmed = editingName.trim();
		if (!trimmed || editingIndex === null) return;
		const updated = [...subcategories];
		updated[editingIndex] = trimmed;
		setSubcategories(updated);
		setEditingIndex(null);
		setEditingName('');
	};

	const cancelEditSubcategory = () => {
		setEditingIndex(null);
		setEditingName('');
	};

	const deleteSubcategory = (index: number) => {
		setSubcategories(subcategories.filter((_, i) => i !== index));
	};

	const getFormData = (): CategoryFormData => ({
		name: name.trim(),
		type,
		subcategories,
	});

	const isValid = () => name.trim().length > 0;

	return {
		// Form state
		name,
		type,
		subcategories,
		newSubcategoryName,
		editingIndex,
		editingName,

		// Setters
		setName,
		setType,
		setNewSubcategoryName,
		setEditingName,

		// Actions
		addSubcategory,
		startEditSubcategory,
		saveEditSubcategory,
		cancelEditSubcategory,
		deleteSubcategory,

		// Utilities
		getFormData,
		isValid,
	};
}
