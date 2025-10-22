import {
	Drawer,
	Typography,
	Divider,
	TextField,
	Select,
	MenuItem,
	InputLabel,
	FormControl,
	IconButton,
	Button,
	Stack,
	Box,
} from '@mui/material';
import { Add, Edit, Delete, Save, Cancel, Close } from '@mui/icons-material';
import type { TransactionType } from '../../../store';

import { useCategoryModal, type CategoryFormData } from '../hooks/useCategoryModal';

interface CategoryModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (name: string, type: TransactionType, subcategories: string[]) => void;
	initialData?: CategoryFormData;
}

export function CategoryModal({ open, onClose, onSave, initialData }: CategoryModalProps) {
	const {
		name,
		type,
		subcategories,
		newSubcategoryName,
		editingIndex,
		editingName,
		setName,
		setType,
		setNewSubcategoryName,
		setEditingName,
		addSubcategory,
		startEditSubcategory,
		saveEditSubcategory,
		cancelEditSubcategory,
		deleteSubcategory,
		getFormData,
		isValid,
	} = useCategoryModal({ open, initialData });

	const handleSave = () => {
		if (!isValid()) return;
		const data = getFormData();
		onSave(data.name, data.type, data.subcategories);
	};

	return (
		<Drawer
			open={open}
			onClose={onClose}
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
						{initialData ? 'Edit Category' : 'Add Category'}
					</Typography>
					<IconButton onClick={onClose} size='small'>
						<Close />
					</IconButton>
				</Box>

				<Divider sx={{ mb: 3 }} />

				{/* Form Content */}
				<Stack spacing={3} sx={{ flexGrow: 1, overflow: 'visible' }}>
					<FormControl fullWidth>
						<InputLabel>Type</InputLabel>
						<Select
							value={type}
							label='Type'
							onChange={(e) => setType(e.target.value as TransactionType)}
							autoFocus
						>
							<MenuItem value='Income'>Income</MenuItem>
							<MenuItem value='Expense'>Expense</MenuItem>
							<MenuItem value='Savings'>Savings</MenuItem>
						</Select>
					</FormControl>
					<TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} fullWidth />

					{/* Subcategory Management */}
					<Box>
						<Typography variant='h6' gutterBottom>
							Subcategories
						</Typography>

						{/* Add New Subcategory */}
						<Stack direction='row' spacing={1} alignItems='center' mb={2}>
							<TextField
								size='small'
								placeholder='Add subcategory'
								value={newSubcategoryName}
								onChange={(e) => setNewSubcategoryName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addSubcategory();
									}
								}}
								sx={{ flexGrow: 1 }}
							/>
							<IconButton color='primary' onClick={addSubcategory} disabled={!newSubcategoryName.trim()}>
								<Add />
							</IconButton>
						</Stack>

						{/* Existing Subcategories */}
						<Stack spacing={1}>
							{subcategories.map((sub, index) => (
								<Box key={index} display='flex' alignItems='center' gap={1}>
									{editingIndex === index ? (
										<>
											<TextField
												size='small'
												value={editingName}
												onChange={(e) => setEditingName(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														saveEditSubcategory();
													}
												}}
												sx={{ flexGrow: 1 }}
											/>
											<IconButton color='primary' size='small' onClick={saveEditSubcategory}>
												<Save />
											</IconButton>
											<IconButton size='small' onClick={cancelEditSubcategory}>
												<Cancel />
											</IconButton>
										</>
									) : (
										<>
											<Box
												sx={{
													flexGrow: 1,
													p: 1,
													border: '1px solid',
													borderColor: 'divider',
													borderRadius: 1,
													display: 'flex',
													alignItems: 'center',
												}}
											>
												<Typography variant='body2'>{sub}</Typography>
											</Box>
											<IconButton size='small' onClick={() => startEditSubcategory(index)}>
												<Edit />
											</IconButton>
											<IconButton
												size='small'
												color='error'
												onClick={() => deleteSubcategory(index)}
											>
												<Delete />
											</IconButton>
										</>
									)}
								</Box>
							))}
							{subcategories.length === 0 && (
								<Typography variant='body2' color='text.secondary' style={{ fontStyle: 'italic' }}>
									No subcategories added yet
								</Typography>
							)}
						</Stack>
					</Box>
				</Stack>

				{/* Actions */}
				<Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
					<Stack direction='row' spacing={2} justifyContent='flex-end'>
						<Button onClick={onClose}>Cancel</Button>
						<Button variant='contained' onClick={handleSave} disabled={!isValid()}>
							Save
						</Button>
					</Stack>
				</Box>
			</Box>
		</Drawer>
	);
}
