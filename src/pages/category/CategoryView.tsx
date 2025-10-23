import { Box, Stack, Button, Typography, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useBudgetStore } from '../../store/store';
import { useCategoryTable } from './hooks/useCategoryTable';
import { CategoryTable } from './components/CategoryTable';
import { CategoryModal } from './components/CategoryModal';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { useAuth } from '../../hooks/useAuth';

export default function CategoryView() {
	const { user } = useAuth();
	const { categories, transactions, addCategory, updateCategory, deleteCategory, isLoading } = useBudgetStore();

	// Get unique category IDs that have transactions
	const transactionCategoryIds = [...new Set(transactions.map((t) => t.categoryId))];

	const {
		modalOpen,
		categoryToEdit,
		confirmOpen,
		hasTransactions,
		openAddModal,
		openEditModal,
		closeModal,
		handleSave,
		openConfirmDialog,
		handleConfirmDelete,
		handleCancelDelete,
	} = useCategoryTable({
		categories,
		transactionCategoryIds,
		onAdd: async (name, type, subcategories) => {
			if (user) {
				await addCategory(user.id, { name, type, subcategories });
			}
		},
		onUpdate: async (id, name, type, subcategories) => {
			if (user) {
				await updateCategory(user.id, id, { name, type, subcategories });
			}
		},
		onDelete: async (id) => {
			if (user) {
				await deleteCategory(user.id, id);
			}
		},
	});

	return (
		<Box p={4}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				justifyContent={{ xs: 'flex-start', sm: 'space-between' }}
				alignItems='center'
				mb={1}
			>
				<Typography variant='h5'>Categories</Typography>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='flex-end'>
					<Button
						variant='contained'
						startIcon={<AddIcon />}
						color='primary'
						onClick={openAddModal}
						disabled={isLoading}
					>
						{isLoading ? 'Loading...' : 'Add Category'}
					</Button>
				</Stack>
			</Stack>

			<Divider sx={{ mb: 3 }} />

			<CategoryTable categories={categories} onEdit={openEditModal} onDelete={openConfirmDialog} />

			{/* Add/Edit Modal */}
			<CategoryModal
				open={modalOpen}
				onClose={closeModal}
				onSave={handleSave}
				initialData={
					categoryToEdit
						? {
								name: categoryToEdit.name,
								type: categoryToEdit.type,
								subcategories: categoryToEdit.subcategories || [],
						  }
						: undefined
				}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				open={confirmOpen}
				hasTransactions={hasTransactions}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
			/>
		</Box>
	);
}
