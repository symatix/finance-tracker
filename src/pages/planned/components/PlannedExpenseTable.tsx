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
import { Edit, Delete, SwapHoriz } from '@mui/icons-material';
import { formatCurrency } from '../../../utils';
import type { PlannedExpenseDocument } from '../../../db';
import { usePlannedExpenseTable } from '../hooks/usePlannedExpenseTable';
import { PlannedExpenseModal } from './PlannedExpenseModal';

interface PlannedExpenseTableProps {
	plannedExpenses: (PlannedExpenseDocument & { categoryName?: string; categoryType?: string })[];
	onUpdateExpense: (id: string, updates: Partial<PlannedExpenseDocument>) => void;
	onDeleteExpense: (id: string) => void;
	onConvertToTransaction: (id: string) => void;
}

const PRIORITY_LABELS = {
	low: 'Low',
	medium: 'Medium',
	high: 'High',
	urgent: 'Urgent',
};

const STATUS_LABELS = {
	planned: 'Planned',
	confirmed: 'Confirmed',
	completed: 'Completed',
	cancelled: 'Cancelled',
};

const getPriorityColor = (priority: string) => {
	switch (priority) {
		case 'low':
			return 'success';
		case 'medium':
			return 'info';
		case 'high':
			return 'warning';
		case 'urgent':
			return 'error';
		default:
			return 'default';
	}
};

const getStatusColor = (status: string) => {
	switch (status) {
		case 'planned':
			return 'default';
		case 'confirmed':
			return 'info';
		case 'completed':
			return 'success';
		case 'cancelled':
			return 'error';
		default:
			return 'default';
	}
};

const getDueDateColor = (dueDate: string) => {
	const today = new Date().toISOString().split('T')[0];
	const due = new Date(dueDate);
	const todayDate = new Date(today);

	if (due < todayDate) return 'error'; // Overdue
	if (due.toISOString().split('T')[0] === today) return 'warning'; // Due today
	return 'default'; // Future
};

export function PlannedExpenseTable({
	plannedExpenses,
	onUpdateExpense,
	onDeleteExpense,
	onConvertToTransaction,
}: PlannedExpenseTableProps) {
	const {
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
	} = usePlannedExpenseTable(plannedExpenses, onUpdateExpense, onDeleteExpense, onConvertToTransaction);

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Amount</TableCell>
							<TableCell>Category</TableCell>
							<TableCell>Due Date</TableCell>
							<TableCell>Priority</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Note</TableCell>
							<TableCell align='right'>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedExpenses.map((expense) => (
							<TableRow key={expense.id} sx={{ opacity: expense.status === 'completed' ? 0.7 : 1 }}>
								<TableCell>{expense.name}</TableCell>
								<TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(expense.amount)}</TableCell>
								<TableCell>
									{expense.categoryName} {expense.subcategory && ` / ${expense.subcategory}`}
								</TableCell>
								<TableCell>
									<Typography
										variant='body2'
										color={getDueDateColor(expense.due_date)}
										fontWeight={getDueDateColor(expense.due_date) !== 'default' ? 'bold' : 'normal'}
									>
										{new Date(expense.due_date).toLocaleDateString()}
									</Typography>
								</TableCell>
								<TableCell>
									<Chip
										label={PRIORITY_LABELS[expense.priority as keyof typeof PRIORITY_LABELS]}
										color={getPriorityColor(expense.priority)}
										size='small'
										variant='outlined'
									/>
								</TableCell>
								<TableCell>
									<Chip
										label={STATUS_LABELS[expense.status as keyof typeof STATUS_LABELS]}
										color={getStatusColor(expense.status)}
										size='small'
									/>
								</TableCell>
								<TableCell>{expense.note || '-'}</TableCell>
								<TableCell align='right'>
									<Stack direction='row' spacing={1} justifyContent='flex-end'>
										{expense.status !== 'completed' && (
											<>
												<IconButton
													color='primary'
													onClick={() => editExpense(expense)}
													size='small'
												>
													<Edit />
												</IconButton>
												<IconButton
													color='secondary'
													onClick={() => convertExpense(expense.id)}
													size='small'
												>
													<SwapHoriz />
												</IconButton>
											</>
										)}
										<IconButton
											color='error'
											onClick={() => deleteExpense(expense.id)}
											size='small'
										>
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
			{modalOpen && selectedExpense && (
				<PlannedExpenseModal
					open={modalOpen}
					onClose={closeModal}
					onSubmit={saveExpense}
					editingExpense={selectedExpense}
				/>
			)}

			{/* Delete Confirmation */}
			<Dialog open={confirmOpen} onClose={cancelDelete}>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to delete this planned expense?</Typography>
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
