import { Box, Divider, Typography, Stack, Button } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useRecurringTransactions } from './hooks/useRecurringTransactions';
import { RecurringTransactionModal } from './components/RecurringTransactionModal';
import { RecurringTransactionTable } from './components/RecurringTransactionTable';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import type { RecurringTransactionDocument } from '../../db';

export default function RecurringTransactionView() {
	const { user } = useAuth();
	const { recurringTransactions, loading, createRecurring, updateRecurring, deleteRecurring } =
		useRecurringTransactions();
	const [modalOpen, setModalOpen] = useState(false);
	const [editingRecurring, setEditingRecurring] = useState<RecurringTransactionDocument | undefined>(undefined);

	const handleCreateRecurring = () => {
		setEditingRecurring(undefined);
		setModalOpen(true);
	};

	const handleModalClose = () => {
		setModalOpen(false);
		setEditingRecurring(undefined);
	};

	const handleModalSubmit = async (recurringData: {
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
		if (editingRecurring) {
			await updateRecurring(editingRecurring.id, recurringData);
		} else {
			await createRecurring(recurringData);
		}
		handleModalClose();
	};

	const handleUpdateRecurring = async (id: string, updates: Partial<RecurringTransactionDocument>) => {
		await updateRecurring(id, updates);
	};

	const handleDeleteRecurring = async (id: string) => {
		if (confirm('Are you sure you want to delete this recurring transaction?')) {
			await deleteRecurring(id);
		}
	};

	if (!user) return null;

	return (
		<Box p={4}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				justifyContent={{ xs: 'flex-start', sm: 'space-between' }}
				alignItems={{ xs: 'flex-start', sm: 'center' }}
				mb={1}
				spacing={2}
			>
				<Typography variant='h5'>Recurring Transactions</Typography>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					onClick={handleCreateRecurring}
					sx={{ width: { xs: '100%', sm: 'auto' } }}
				>
					New Recurring
				</Button>
			</Stack>

			<Divider sx={{ mb: 3 }} />

			{loading ? (
				<Typography>Loading...</Typography>
			) : (
				<RecurringTransactionTable
					recurringTransactions={recurringTransactions}
					onUpdateRecurring={handleUpdateRecurring}
					onDeleteRecurring={handleDeleteRecurring}
				/>
			)}

			<RecurringTransactionModal
				open={modalOpen}
				onClose={handleModalClose}
				onSubmit={handleModalSubmit}
				editingRecurring={editingRecurring}
			/>
		</Box>
	);
}
