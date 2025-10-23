import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Pagination,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Chip,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { formatCurrency } from '../../../utils';
import type { RecurringTransactionDocument } from '../../../db';
import { useRecurringTransactionTable } from '../hooks/useRecurringTransactionTable';
import { RecurringTransactionModal } from './RecurringTransactionModal';

interface RecurringTransactionTableProps {
	recurringTransactions: (RecurringTransactionDocument & { categoryName?: string; categoryType?: string })[];
	onUpdateRecurring: (id: string, updates: Partial<RecurringTransactionDocument>) => void;
	onDeleteRecurring: (id: string) => void;
}

const FREQUENCY_LABELS = {
	daily: 'Daily',
	weekly: 'Weekly',
	monthly: 'Monthly',
	yearly: 'Yearly',
};

const getStatusColor = (isActive: boolean, nextDueDate: string) => {
	if (!isActive) return 'default';
	const today = new Date().toISOString().split('T')[0];
	const dueDate = new Date(nextDueDate);
	const todayDate = new Date(today);

	if (dueDate < todayDate) return 'error'; // Overdue
	if (dueDate.toISOString().split('T')[0] === today) return 'warning'; // Due today
	return 'success'; // Future
};

const getStatusLabel = (isActive: boolean, nextDueDate: string) => {
	if (!isActive) return 'Inactive';
	const today = new Date().toISOString().split('T')[0];
	const dueDate = new Date(nextDueDate);
	const todayDate = new Date(today);

	if (dueDate < todayDate) return 'Overdue';
	if (dueDate.toISOString().split('T')[0] === today) return 'Due Today';
	return 'Active';
};

export function RecurringTransactionTable({
	recurringTransactions,
	onUpdateRecurring,
	onDeleteRecurring,
}: RecurringTransactionTableProps) {
	const {
		page,
		setPage,
		totalPages,
		paginatedTransactions,
		modalOpen,
		selectedTransaction,
		confirmOpen,
		editTransaction,
		deleteTransaction,
		confirmDelete,
		cancelDelete,
		saveTransaction,
		closeModal,
	} = useRecurringTransactionTable(recurringTransactions, onUpdateRecurring, onDeleteRecurring);

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Amount</TableCell>
							<TableCell>Type</TableCell>
							<TableCell>Category</TableCell>
							<TableCell>Frequency</TableCell>
							<TableCell>Next Due</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Note</TableCell>
							<TableCell align='right'>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedTransactions.map((recurring) => (
							<TableRow key={recurring.id} sx={{ opacity: recurring.is_active ? 1 : 0.7 }}>
								<TableCell>{recurring.name}</TableCell>
								<TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(recurring.amount)}</TableCell>
								<TableCell>{recurring.type}</TableCell>
								<TableCell>
									{recurring.categoryName} {recurring.subcategory && ` / ${recurring.subcategory}`}
								</TableCell>
								<TableCell>
									{FREQUENCY_LABELS[recurring.frequency as keyof typeof FREQUENCY_LABELS]}
								</TableCell>
								<TableCell>{new Date(recurring.next_due_date).toLocaleDateString()}</TableCell>
								<TableCell>
									<Chip
										label={getStatusLabel(recurring.is_active, recurring.next_due_date)}
										color={getStatusColor(recurring.is_active, recurring.next_due_date)}
										size='small'
									/>
								</TableCell>
								<TableCell>{recurring.note || '-'}</TableCell>
								<TableCell align='right'>
									<Stack direction='row' spacing={1} justifyContent='flex-end'>
										<IconButton color='primary' onClick={() => editTransaction(recurring)}>
											<Edit />
										</IconButton>
										<IconButton color='error' onClick={() => deleteTransaction(recurring.id)}>
											<Delete />
										</IconButton>
									</Stack>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Pagination */}
			<Stack mt={2} alignItems='center'>
				<Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color='primary' />
			</Stack>

			{/* Edit Modal */}
			{modalOpen && selectedTransaction && (
				<RecurringTransactionModal
					open={modalOpen}
					onClose={closeModal}
					onSubmit={saveTransaction}
					editingRecurring={selectedTransaction}
				/>
			)}

			{/* Delete Confirmation */}
			<Dialog open={confirmOpen} onClose={cancelDelete}>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to delete this recurring transaction?</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={cancelDelete}>Cancel</Button>
					<Button color='error' variant='contained' onClick={confirmDelete}>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
