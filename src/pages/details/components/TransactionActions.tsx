import { useState } from 'react';
import { Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TransactionModal } from './TransactionModel';
import { useBudgetStore } from '../../../store';
import { useAuth } from '../../../hooks/useAuth';
import type { TransactionType } from '../../../store';

export default function TransactionActions() {
	const { user } = useAuth();
	const { addTransaction, isLoading } = useBudgetStore();
	const [openModal, setOpenModal] = useState(false);
	const [transactionType, setTransactionType] = useState<TransactionType>('Income');

	const handleOpenModal = (type: TransactionType) => {
		setTransactionType(type);
		setOpenModal(true);
	};

	const handleCloseModal = () => setOpenModal(false);

	const handleSaveTransaction = async (data: {
		id?: string;
		amount: number;
		note: string;
		categoryId: string;
		subcategory?: string;
		type: TransactionType;
	}) => {
		if (!user) return;

		try {
			await addTransaction(user.id, {
				type: data.type,
				amount: data.amount,
				categoryId: data.categoryId,
				subcategory: data.subcategory,
				note: data.note,
				date: new Date().toISOString(),
			});
			handleCloseModal();
		} catch (error) {
			console.error('Failed to add transaction:', error);
			// Error handling is done in the store
		}
	};

	return (
		<>
			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='flex-end'>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					color='info'
					onClick={() => handleOpenModal('Income')}
					disabled={isLoading}
				>
					Add Income
				</Button>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					color='info'
					onClick={() => handleOpenModal('Expense')}
					disabled={isLoading}
				>
					Add Expense
				</Button>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					color='info'
					onClick={() => handleOpenModal('Savings')}
					disabled={isLoading}
				>
					Add Savings
				</Button>
			</Stack>
			<TransactionModal
				open={openModal}
				onClose={handleCloseModal}
				onSave={handleSaveTransaction}
				transactionType={transactionType}
			/>
		</>
	);
}
