import { useState } from 'react';
import { useBudgetStore } from '../../../store/store';
import type { FamilyDocument, CreateFamilyInput } from '../../../db/schemas';

interface UseFamilyManagementProps {
	onCreate: () => Promise<void>;
	onUpdate: () => Promise<void>;
	onDelete: () => Promise<void>;
}

export function useFamilyManagement({ onCreate, onUpdate, onDelete }: UseFamilyManagementProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const [familyToEdit, setFamilyToEdit] = useState<FamilyDocument | undefined>();
	const { createFamily, updateFamily, deleteFamily } = useBudgetStore();

	const openCreateModal = () => {
		setFamilyToEdit(undefined);
		setModalOpen(true);
	};

	const openEditModal = (family: FamilyDocument) => {
		setFamilyToEdit(family);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setFamilyToEdit(undefined);
	};

	const handleCreateFamily = async (familyData: CreateFamilyInput) => {
		try {
			await createFamily(familyData);
			await onCreate();
			closeModal();
		} catch (error) {
			console.error('Failed to create family:', error);
			// Error handling is done in the store
		}
	};

	const handleUpdateFamily = async (id: string, updates: Partial<FamilyDocument>) => {
		try {
			await updateFamily(id, updates);
			await onUpdate();
			closeModal();
		} catch (error) {
			console.error('Failed to update family:', error);
			// Error handling is done in the store
		}
	};

	const handleDeleteFamily = async (id: string) => {
		try {
			await deleteFamily(id);
			await onDelete();
		} catch (error) {
			console.error('Failed to delete family:', error);
			// Error handling is done in the store
		}
	};

	return {
		modalOpen,
		familyToEdit,
		openCreateModal,
		openEditModal,
		closeModal,
		handleCreateFamily,
		handleUpdateFamily,
		handleDeleteFamily,
	};
}
