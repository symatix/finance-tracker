import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	TableSortLabel,
	Pagination,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { formatCurrency } from '../../../utils';
import { type Transaction } from '../../../store';
import { type SortState } from '../hooks/useTransactionFilter';
import { useTransactionTable } from '../hooks/useTransactionTable';
import { TransactionModal } from './TransactionModel';
import { ProfileOperations } from '../../../db';
import { useCallback, useState, useEffect } from 'react';

interface TransactionTableProps {
	filteredAndSortedTransactions: Transaction[];
	sort: SortState;
	getCategoryName: (id: string) => string;
	onSort: (field: SortState['field']) => void;
	onUpdateTransaction: (id: string, data: { amount: number; note: string; categoryId: string }) => void;
	onDeleteTransaction: (id: string) => void;
	currentFamilyId: string | null;
}

const TRANSACTION_TYPE_COLORS = {
	Income: 'success.main',
	Expense: 'error.main',
	Savings: 'info.main',
};

export function TransactionTable({
	filteredAndSortedTransactions,
	sort,
	getCategoryName,
	onSort,
	onUpdateTransaction,
	onDeleteTransaction,
	currentFamilyId,
}: TransactionTableProps) {
	const [userProfiles, setUserProfiles] = useState<Map<string, string>>(new Map());

	const fetchUserProfiles = useCallback(async () => {
		try {
			// Get unique user IDs from transactions
			const userIds = new Set<string>();
			filteredAndSortedTransactions.forEach((t) => {
				if (t.createdBy) {
					userIds.add(t.createdBy);
				}
			});

			if (userIds.size === 0) {
				setUserProfiles(new Map());
				return;
			}

			// Fetch profiles for these users
			const displayNames = await ProfileOperations.getDisplayNames(Array.from(userIds));
			const profiles = new Map<string, string>();
			for (const userId of userIds) {
				profiles.set(userId, displayNames[userId] || 'Unknown User');
			}

			setUserProfiles(profiles);
		} catch (error) {
			console.error('Error fetching user profiles:', error);
			setUserProfiles(new Map());
		}
	}, [filteredAndSortedTransactions]);

	// Fetch user profiles when in family mode
	useEffect(() => {
		if (currentFamilyId) {
			fetchUserProfiles();
		}
	}, [currentFamilyId, fetchUserProfiles]);

	// Use the table hook internally
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
	} = useTransactionTable(filteredAndSortedTransactions, onUpdateTransaction, onDeleteTransaction);
	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell sortDirection={sort.field === 'date' ? sort.direction : false}>
								<TableSortLabel
									active={sort.field === 'date'}
									direction={sort.field === 'date' ? sort.direction : 'asc'}
									onClick={() => onSort('date')}
								>
									Date
								</TableSortLabel>
							</TableCell>
							<TableCell sortDirection={sort.field === 'type' ? sort.direction : false}>
								<TableSortLabel
									active={sort.field === 'type'}
									direction={sort.field === 'type' ? sort.direction : 'asc'}
									onClick={() => onSort('type')}
								>
									Type
								</TableSortLabel>
							</TableCell>
							<TableCell sortDirection={sort.field === 'category' ? sort.direction : false}>
								<TableSortLabel
									active={sort.field === 'category'}
									direction={sort.field === 'category' ? sort.direction : 'asc'}
									onClick={() => onSort('category')}
								>
									Category
								</TableSortLabel>
							</TableCell>
							<TableCell>Subcategory</TableCell>
							<TableCell sortDirection={sort.field === 'amount' ? sort.direction : false}>
								<TableSortLabel
									active={sort.field === 'amount'}
									direction={sort.field === 'amount' ? sort.direction : 'asc'}
									onClick={() => onSort('amount')}
								>
									Amount
								</TableSortLabel>
							</TableCell>
							<TableCell>Note</TableCell>
							{currentFamilyId && <TableCell>Created By</TableCell>}
							<TableCell align='right'>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedTransactions.map((t) => (
							<TableRow key={t.id}>
								<TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
								<TableCell>{t.type}</TableCell>
								<TableCell>{getCategoryName(t.categoryId)}</TableCell>
								<TableCell>{t.subcategory || '-'}</TableCell>
								<TableCell
									sx={{
										color: TRANSACTION_TYPE_COLORS[t.type],
										fontWeight: 'bold',
									}}
								>
									{formatCurrency(t.amount)}
								</TableCell>
								<TableCell>{t.note}</TableCell>
								{currentFamilyId && (
									<TableCell>{userProfiles.get(t.createdBy || '') || 'Unknown User'}</TableCell>
								)}
								<TableCell align='right'>
									<Stack direction='row' spacing={1} justifyContent='flex-end'>
										<IconButton color='primary' onClick={() => editTransaction(t)}>
											<Edit />
										</IconButton>
										<IconButton color='error' onClick={() => deleteTransaction(t.id!)}>
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
				<TransactionModal
					open={modalOpen}
					onClose={closeModal}
					onSave={saveTransaction}
					transaction={selectedTransaction}
				/>
			)}

			{/* Delete Confirmation */}
			<Dialog open={confirmOpen} onClose={cancelDelete}>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to delete this transaction?</Typography>
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
