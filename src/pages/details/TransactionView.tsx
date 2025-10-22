import { useBudgetStore } from '../../store/store';
import type { Transaction } from '../../store/store';
import { Box, Divider, Typography, Stack } from '@mui/material';
import { TransactionFilter } from './components/TransactionFilter';
import { TransactionTable } from './components/TransactionTable';
import { useTransactionFilter } from './hooks/useTransactionFilter';
import AddTransactionButtons from './components/TransactionActions';
import { useAuth } from '../../hooks/useAuth';

export function TransactionView() {
	const { user } = useAuth();
	const { transactions, categories, updateTransaction, deleteTransaction } = useBudgetStore();

	const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || 'Uncategorized';

	const { filters, sort, filteredAndSortedTransactions, updateFilter, updateSort, clearFilters } =
		useTransactionFilter(transactions, getCategoryName);

	const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
		if (user) {
			updateTransaction(user.id, id, updates);
		}
	};

	const handleDeleteTransaction = (id: string) => {
		if (user) {
			deleteTransaction(user.id, id);
		}
	};

	return (
		<Box p={4}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				justifyContent={{ xs: 'flex-start', sm: 'space-between' }}
				alignItems='baseline'
				mb={1}
			>
				<Typography variant='h5'>Transaction Details</Typography>
				<AddTransactionButtons />
			</Stack>

			<Divider sx={{ mb: 3 }} />
			<TransactionFilter
				filters={filters}
				categories={categories}
				onFilterChange={updateFilter}
				onClearFilters={clearFilters}
			/>

			<TransactionTable
				filteredAndSortedTransactions={filteredAndSortedTransactions}
				sort={sort}
				getCategoryName={getCategoryName}
				onSort={updateSort}
				onUpdateTransaction={handleUpdateTransaction}
				onDeleteTransaction={handleDeleteTransaction}
			/>
		</Box>
	);
}
