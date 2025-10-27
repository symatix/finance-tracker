import {
	Drawer,
	Box,
	Typography,
	TextField,
	Button,
	Stack,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	IconButton,
} from '@mui/material';
import { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useBudgetStore, type Category } from '../../../store/store';
import type { RecurringTransactionDocument } from '../../../db';

interface RecurringTransactionModalProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: {
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
	}) => Promise<void>;
	editingRecurring?: RecurringTransactionDocument;
}

export function RecurringTransactionModal({
	open,
	onClose,
	onSubmit,
	editingRecurring,
}: RecurringTransactionModalProps) {
	const { categories } = useBudgetStore();
	const [formData, setFormData] = useState({
		name: '',
		amount: '',
		type: 'Expense' as 'Income' | 'Expense' | 'Savings',
		category_id: '',
		subcategory: '',
		note: '',
		frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
		start_date: new Date().toISOString().split('T')[0],
		end_date: '',
	});

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (editingRecurring) {
			setFormData({
				name: editingRecurring.name,
				amount: editingRecurring.amount.toString(),
				type: editingRecurring.type as 'Income' | 'Expense' | 'Savings',
				category_id: editingRecurring.category_id,
				subcategory: editingRecurring.subcategory || '',
				note: editingRecurring.note || '',
				frequency: editingRecurring.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
				start_date: editingRecurring.start_date,
				end_date: editingRecurring.end_date || '',
			});
		} else {
			// Reset form for new recurring transaction
			setFormData({
				name: '',
				amount: '',
				type: 'Expense',
				category_id: '',
				subcategory: '',
				note: '',
				frequency: 'monthly',
				start_date: new Date().toISOString().split('T')[0],
				end_date: '',
			});
		}
	}, [editingRecurring, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await onSubmit({
				name: formData.name,
				amount: parseFloat(formData.amount),
				type: formData.type,
				category_id: formData.category_id,
				subcategory: formData.subcategory || null,
				note: formData.note,
				frequency: formData.frequency,
				start_date: formData.start_date,
				end_date: formData.end_date || null,
				next_due_date: formData.start_date, // Initially set to start date
				is_active: true,
			});
		} catch (error) {
			console.error('Error submitting recurring transaction:', error);
		} finally {
			setLoading(false);
		}
	};

	const selectedCategory = categories.find((c: Category) => c.id === formData.category_id);
	const availableSubcategories = selectedCategory?.subcategories || [];

	return (
		<Drawer
			anchor='right'
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: { width: { xs: '100%', sm: 400 } },
			}}
		>
			<Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
				{/* Header */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<Typography variant='h6'>
						{editingRecurring ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
					</Typography>
					<IconButton onClick={onClose} size='small'>
						<CloseIcon />
					</IconButton>
				</Box>

				{/* Form */}
				<Box
					component='form'
					onSubmit={handleSubmit}
					sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
				>
					<Stack spacing={3} sx={{ flex: 1 }}>
						<TextField
							label='Name'
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							required
							fullWidth
							placeholder='e.g., Netflix Subscription'
						/>

						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
							<TextField
								label='Amount'
								type='number'
								value={formData.amount}
								onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
								required
								fullWidth
								inputProps={{ min: '0', step: '0.01' }}
							/>

							<FormControl fullWidth required>
								<InputLabel>Type</InputLabel>
								<Select
									value={formData.type}
									label='Type'
									onChange={(e) =>
										setFormData({
											...formData,
											type: e.target.value as 'Income' | 'Expense' | 'Savings',
										})
									}
								>
									<MenuItem value='Income'>Income</MenuItem>
									<MenuItem value='Expense'>Expense</MenuItem>
									<MenuItem value='Savings'>Savings</MenuItem>
								</Select>
							</FormControl>
						</Stack>

						<FormControl fullWidth required>
							<InputLabel>Category</InputLabel>
							<Select
								value={formData.category_id}
								label='Category'
								onChange={(e) =>
									setFormData({ ...formData, category_id: e.target.value, subcategory: '' })
								}
							>
								{categories
									.filter((cat: Category) => cat.type === formData.type)
									.map((category: Category) => (
										<MenuItem key={category.id} value={category.id}>
											{category.name}
										</MenuItem>
									))}
							</Select>
						</FormControl>

						{availableSubcategories.length > 0 && (
							<FormControl fullWidth>
								<InputLabel>Subcategory</InputLabel>
								<Select
									value={formData.subcategory}
									label='Subcategory'
									onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
								>
									<MenuItem value=''>
										<em>None</em>
									</MenuItem>
									{availableSubcategories.map((sub: string) => (
										<MenuItem key={sub} value={sub}>
											{sub}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						)}

						<FormControl fullWidth required>
							<InputLabel>Frequency</InputLabel>
							<Select
								value={formData.frequency}
								label='Frequency'
								onChange={(e) =>
									setFormData({
										...formData,
										frequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly',
									})
								}
							>
								<MenuItem value='daily'>Daily</MenuItem>
								<MenuItem value='weekly'>Weekly</MenuItem>
								<MenuItem value='monthly'>Monthly</MenuItem>
								<MenuItem value='yearly'>Yearly</MenuItem>
							</Select>
						</FormControl>

						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
							<TextField
								label='Start Date'
								type='date'
								value={formData.start_date}
								onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
								required
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>

							<TextField
								label='End Date (Optional)'
								type='date'
								value={formData.end_date}
								onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
								fullWidth
								InputLabelProps={{ shrink: true }}
								helperText='Leave empty for indefinite'
							/>
						</Stack>

						<TextField
							label='Note'
							value={formData.note}
							onChange={(e) => setFormData({ ...formData, note: e.target.value })}
							fullWidth
							multiline
							rows={2}
							placeholder='Optional notes about this recurring transaction'
						/>
					</Stack>

					{/* Actions */}
					<Stack direction='row' spacing={2} sx={{ mt: 4 }}>
						<Button onClick={onClose} fullWidth disabled={loading}>
							Cancel
						</Button>
						<Button type='submit' variant='contained' fullWidth disabled={loading}>
							{loading ? 'Saving...' : editingRecurring ? 'Update' : 'Create'}
						</Button>
					</Stack>
				</Box>
			</Box>
		</Drawer>
	);
}
