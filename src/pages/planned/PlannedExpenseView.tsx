import { Box, Divider, Typography, Stack, Button, Alert, AlertTitle } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { usePlannedExpenses } from './hooks/usePlannedExpenses';
import { PlannedExpenseModal } from './components/PlannedExpenseModal';
import { PlannedExpenseTable } from './components/PlannedExpenseTable';
import { useBudgetAlerts, type BudgetAlert } from '../../hooks/useBudgetAlerts';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import type { PlannedExpenseDocument } from '../../db';

export default function PlannedExpenseView() {
	const { user } = useAuth();
	const {
		plannedExpenses,
		loading,
		createPlannedExpense,
		updatePlannedExpense,
		deletePlannedExpense,
		convertToTransaction,
	} = usePlannedExpenses();
	const { alerts } = useBudgetAlerts();
	const [modalOpen, setModalOpen] = useState(false);
	const [editingExpense, setEditingExpense] = useState<PlannedExpenseDocument | undefined>(undefined);

	const handleCreateExpense = () => {
		setEditingExpense(undefined);
		setModalOpen(true);
	};

	const handleModalClose = () => {
		setModalOpen(false);
		setEditingExpense(undefined);
	};

	const handleModalSubmit = async (expenseData: {
		name: string;
		amount: number;
		category_id: string;
		subcategory: string | null;
		note: string;
		due_date: string;
		priority: 'low' | 'medium' | 'high' | 'urgent';
		status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
	}) => {
		if (editingExpense) {
			await updatePlannedExpense(editingExpense.id, expenseData);
		} else {
			await createPlannedExpense(expenseData);
		}
		handleModalClose();
	};

	const handleUpdateExpense = async (id: string, updates: Partial<PlannedExpenseDocument>) => {
		await updatePlannedExpense(id, updates);
	};

	const handleDeleteExpense = async (id: string) => {
		if (confirm('Are you sure you want to delete this planned expense?')) {
			await deletePlannedExpense(id);
		}
	};

	const handleConvertToTransaction = async (id: string) => {
		if (confirm('Convert this planned expense to a transaction?')) {
			await convertToTransaction(id);
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
				<Typography variant='h5'>Planned Expenses</Typography>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					onClick={handleCreateExpense}
					sx={{ width: { xs: '100%', sm: 'auto' } }}
				>
					New Planned Expense
				</Button>
			</Stack>

			<Divider sx={{ mb: 3 }} />

			{/* Budget Alerts */}
			{alerts.length > 0 && (
				<Stack spacing={2} sx={{ mb: 3 }}>
					{alerts.map((alert: BudgetAlert, index: number) => (
						<Alert
							key={index}
							severity={alert.type === 'danger' ? 'error' : alert.type}
							sx={{ '& .MuiAlert-message': { width: '100%' } }}
						>
							<AlertTitle>
								{alert.type === 'danger'
									? '⚠️ Critical'
									: alert.type === 'warning'
									? '⚡ Warning'
									: 'ℹ️ Info'}
							</AlertTitle>
							{alert.message}
						</Alert>
					))}
				</Stack>
			)}

			{loading ? (
				<Typography>Loading...</Typography>
			) : (
				<PlannedExpenseTable
					plannedExpenses={plannedExpenses}
					onUpdateExpense={handleUpdateExpense}
					onDeleteExpense={handleDeleteExpense}
					onConvertToTransaction={handleConvertToTransaction}
				/>
			)}

			<PlannedExpenseModal
				open={modalOpen}
				onClose={handleModalClose}
				onSubmit={handleModalSubmit}
				editingExpense={editingExpense}
			/>
		</Box>
	);
}
