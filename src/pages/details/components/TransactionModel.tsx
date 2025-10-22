import { useState, useEffect } from 'react';
import { useBudgetStore } from '../../../store';
import type { TransactionType, Transaction } from '../../../store';
import {
	Stack,
	Drawer,
	Typography,
	Divider,
	Button,
	TextField,
	Select,
	MenuItem,
	InputLabel,
	FormControl,
	Box,
	IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface TransactionModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (data: {
		id?: string;
		amount: number;
		note: string;
		categoryId: string;
		subcategory?: string;
		type: TransactionType;
	}) => void;
	// For editing existing transaction
	transaction?: Transaction | null;
	// For creating new transaction
	transactionType?: TransactionType;
}

export const TransactionModal = ({ open, onClose, onSave, transaction, transactionType }: TransactionModalProps) => {
	const { categories, isLoading } = useBudgetStore();

	// Determine if we're in edit mode
	const isEditMode = !!transaction;
	const currentType = transaction?.type || transactionType;

	// Form state
	const [amount, setAmount] = useState('');
	const [note, setNote] = useState('');
	const [categoryId, setCategoryId] = useState('');
	const [subcategory, setSubcategory] = useState('');

	// Reset form when modal opens/closes or transaction changes
	useEffect(() => {
		if (open) {
			if (isEditMode && transaction) {
				setAmount(transaction.amount.toString());
				setNote(transaction.note || '');
				setCategoryId(transaction.categoryId);
				setSubcategory(transaction.subcategory || '');
			} else if (transactionType) {
				// For new transactions, pre-select first category of the type
				const defaultCategory = categories.find((c) => c.type === transactionType);
				setAmount('');
				setNote('');
				setCategoryId(defaultCategory?.id || '');
				setSubcategory('');
			}
		}
	}, [open, transaction, transactionType, categories, isEditMode]);

	const filteredCategories = categories.filter((c) => c.type === currentType);
	const selectedCategory = categories.find((c) => c.id === categoryId);
	const subcategories = selectedCategory?.subcategories || [];

	const handleSave = () => {
		if (!amount || isNaN(Number(amount)) || !categoryId || !currentType) return;

		onSave({
			id: transaction?.id,
			amount: Number(amount),
			note,
			categoryId,
			subcategory: subcategory || undefined,
			type: currentType,
		});

		// Reset form
		setAmount('');
		setNote('');
		setCategoryId('');
		setSubcategory('');
		onClose();
	};

	const handleClose = () => {
		// Reset form when closing
		setAmount('');
		setNote('');
		setCategoryId('');
		setSubcategory('');
		onClose();
	};

	return (
		<Drawer
			open={open}
			onClose={handleClose}
			anchor='right'
			PaperProps={{
				sx: {
					width: { xs: '100%', sm: 400 },
					borderLeft: '1px solid',
					borderColor: 'divider',
					backgroundColor: '#000000',
				},
			}}
		>
			<Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a1a' }}>
				{/* Header */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
					<Typography variant='h6' sx={{ fontWeight: 600 }}>
						{isEditMode ? 'Edit Transaction' : `Add ${currentType}`}
					</Typography>
					<IconButton onClick={handleClose} size='small'>
						<Close />
					</IconButton>
				</Box>

				<Divider sx={{ mb: 3 }} />

				{/* Form Content */}
				<Stack spacing={3} sx={{ flexGrow: 1, overflow: 'visible' }}>
					{/* Category Selection */}
					<FormControl fullWidth>
						<InputLabel>Category</InputLabel>
						<Select value={categoryId} label='Category' onChange={(e) => setCategoryId(e.target.value)}>
							{filteredCategories.map((c) => (
								<MenuItem key={c.id} value={c.id}>
									{c.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Subcategory Selection */}
					{categoryId && subcategories.length > 0 && (
						<FormControl fullWidth>
							<InputLabel>Subcategory (Optional)</InputLabel>
							<Select
								value={subcategory}
								label='Subcategory (Optional)'
								onChange={(e) => setSubcategory(e.target.value)}
							>
								<MenuItem value=''>None</MenuItem>
								{subcategories.map((sub) => (
									<MenuItem key={sub} value={sub}>
										{sub}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					)}

					{/* Amount */}
					<TextField
						label='Amount'
						type='number'
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						fullWidth
						required
					/>

					{/* Note */}
					<TextField
						label='Note'
						value={note}
						onChange={(e) => setNote(e.target.value)}
						fullWidth
						multiline
						rows={3}
					/>
				</Stack>

				{/* Actions */}
				<Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
					<Stack direction='row' spacing={2} justifyContent='flex-end'>
						<Button onClick={handleClose} disabled={isLoading}>
							Cancel
						</Button>
						<Button variant='contained' onClick={handleSave} disabled={!amount || !categoryId || isLoading}>
							{isLoading
								? isEditMode
									? 'Updating...'
									: 'Adding...'
								: isEditMode
								? 'Update'
								: 'Add Transaction'}
						</Button>
					</Stack>
				</Box>
			</Box>
		</Drawer>
	);
};
