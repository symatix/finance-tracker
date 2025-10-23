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
import { Close } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useBudgetStore } from '../../../store';
import type { PlannedExpenseDocument } from '../../../db';

interface PlannedExpenseModalProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: {
		name: string;
		amount: number;
		category_id: string;
		subcategory: string | null;
		note: string;
		due_date: string;
		priority: 'low' | 'medium' | 'high' | 'urgent';
		status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
	}) => void;
	editingExpense?: PlannedExpenseDocument;
}

export function PlannedExpenseModal({ open, onClose, onSubmit, editingExpense }: PlannedExpenseModalProps) {
	const { categories } = useBudgetStore();

	const [formData, setFormData] = useState({
		name: '',
		amount: 0,
		category_id: '',
		subcategory: '',
		note: '',
		due_date: new Date().toISOString().split('T')[0],
		priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
		status: 'planned' as 'planned' | 'confirmed' | 'completed' | 'cancelled',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (editingExpense) {
			setFormData({
				name: editingExpense.name,
				amount: editingExpense.amount,
				category_id: editingExpense.category_id,
				subcategory: editingExpense.subcategory || '',
				note: editingExpense.note || '',
				due_date: editingExpense.due_date,
				priority: editingExpense.priority,
				status: editingExpense.status,
			});
		} else {
			setFormData({
				name: '',
				amount: 0,
				category_id: '',
				subcategory: '',
				note: '',
				due_date: new Date().toISOString().split('T')[0],
				priority: 'medium',
				status: 'planned',
			});
		}
		setErrors({});
	}, [editingExpense, open]);

	const selectedCategory = categories.find((cat) => cat.id === formData.category_id);
	const availableSubcategories = selectedCategory?.subcategories || [];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) newErrors.name = 'Name is required';
		if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
		if (!formData.category_id) newErrors.category_id = 'Category is required';
		if (!formData.due_date) newErrors.due_date = 'Due date is required';

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		onSubmit({
			...formData,
			subcategory: formData.subcategory || null,
			note: formData.note || '',
		});
	};

	const handleChange = (field: string, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }));
		}
	};

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
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
					<Typography variant='h6'>
						{editingExpense ? 'Edit Planned Expense' : 'New Planned Expense'}
					</Typography>
					<IconButton onClick={onClose} size='small'>
						<Close />
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
							onChange={(e) => handleChange('name', e.target.value)}
							error={!!errors.name}
							helperText={errors.name}
							required
							fullWidth
						/>

						<TextField
							label='Amount'
							type='number'
							value={formData.amount}
							onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
							error={!!errors.amount}
							helperText={errors.amount}
							required
							fullWidth
							inputProps={{ min: 0, step: 0.01 }}
						/>

						<FormControl fullWidth error={!!errors.category_id}>
							<InputLabel>Category</InputLabel>
							<Select
								value={formData.category_id}
								onChange={(e) => handleChange('category_id', e.target.value)}
								label='Category'
								required
							>
								{categories.map((category) => (
									<MenuItem key={category.id} value={category.id}>
										{category.name} ({category.type})
									</MenuItem>
								))}
							</Select>
							{errors.category_id && (
								<Typography variant='caption' color='error' sx={{ mt: 1, ml: 2 }}>
									{errors.category_id}
								</Typography>
							)}
						</FormControl>

						{availableSubcategories.length > 0 && (
							<FormControl fullWidth>
								<InputLabel>Subcategory (Optional)</InputLabel>
								<Select
									value={formData.subcategory}
									onChange={(e) => handleChange('subcategory', e.target.value)}
									label='Subcategory (Optional)'
								>
									<MenuItem value=''>
										<em>None</em>
									</MenuItem>
									{availableSubcategories.map((subcategory) => (
										<MenuItem key={subcategory} value={subcategory}>
											{subcategory}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						)}

						<TextField
							label='Due Date'
							type='date'
							value={formData.due_date}
							onChange={(e) => handleChange('due_date', e.target.value)}
							error={!!errors.due_date}
							helperText={errors.due_date}
							required
							fullWidth
							InputLabelProps={{ shrink: true }}
						/>

						<FormControl fullWidth>
							<InputLabel>Priority</InputLabel>
							<Select
								value={formData.priority}
								onChange={(e) => handleChange('priority', e.target.value)}
								label='Priority'
							>
								<MenuItem value='low'>Low</MenuItem>
								<MenuItem value='medium'>Medium</MenuItem>
								<MenuItem value='high'>High</MenuItem>
								<MenuItem value='urgent'>Urgent</MenuItem>
							</Select>
						</FormControl>

						{editingExpense && (
							<FormControl fullWidth>
								<InputLabel>Status</InputLabel>
								<Select
									value={formData.status}
									onChange={(e) => handleChange('status', e.target.value)}
									label='Status'
								>
									<MenuItem value='planned'>Planned</MenuItem>
									<MenuItem value='confirmed'>Confirmed</MenuItem>
									<MenuItem value='completed'>Completed</MenuItem>
									<MenuItem value='cancelled'>Cancelled</MenuItem>
								</Select>
							</FormControl>
						)}

						<TextField
							label='Note (Optional)'
							value={formData.note}
							onChange={(e) => handleChange('note', e.target.value)}
							multiline
							rows={3}
							fullWidth
						/>
					</Stack>

					{/* Actions */}
					<Stack direction='row' spacing={2} sx={{ mt: 4 }}>
						<Button variant='outlined' onClick={onClose} fullWidth>
							Cancel
						</Button>
						<Button variant='contained' type='submit' fullWidth>
							{editingExpense ? 'Update' : 'Create'}
						</Button>
					</Stack>
				</Box>
			</Box>
		</Drawer>
	);
}
