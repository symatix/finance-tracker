import {
	Drawer,
	Typography,
	Divider,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	Stack,
	Box,
	IconButton,
} from '@mui/material';
import { Close, Add, Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useBudgetStore } from '../../../store/store';
import type { Category } from '../../../store/store';
import type { ShoppingListDocument } from '../../../db';

interface ShoppingListModalProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: {
		name: string;
		category_id: string;
		subcategory?: string;
		items: { name: string; quantity: number; estimated_price?: number }[];
	}) => void;
	editingList?: ShoppingListDocument;
}

export function ShoppingListModal({ open, onClose, onSubmit, editingList }: ShoppingListModalProps) {
	const { categories } = useBudgetStore();
	const [name, setName] = useState('');
	const [categoryId, setCategoryId] = useState('');
	const [subcategory, setSubcategory] = useState('');
	const [items, setItems] = useState<{ name: string; quantity: number; estimated_price?: number }[]>([]);
	const [newItemName, setNewItemName] = useState('');
	const [newItemQuantity, setNewItemQuantity] = useState(1);
	const [newItemPrice, setNewItemPrice] = useState('');
	const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
	const [editingItemName, setEditingItemName] = useState('');
	const [editingItemQuantity, setEditingItemQuantity] = useState(1);
	const [editingItemPrice, setEditingItemPrice] = useState('');

	useEffect(() => {
		if (editingList) {
			setName(editingList.name || '');
			setCategoryId(editingList.category_id || '');
			setSubcategory(editingList.subcategory || '');
			// For editing, we don't load existing items here - they would be managed separately
			setItems([]);
		} else {
			setName('');
			setCategoryId('');
			setSubcategory('');
			setItems([]);
		}
		setNewItemName('');
		setNewItemQuantity(1);
		setNewItemPrice('');
		setEditingItemIndex(null);
		setEditingItemName('');
		setEditingItemQuantity(1);
		setEditingItemPrice('');
	}, [editingList, open]);

	const selectedCategory = categories.find((cat: Category) => cat.id === categoryId);
	const availableSubcategories = selectedCategory?.subcategories || [];

	const addItem = () => {
		if (!newItemName.trim()) return;
		const item = {
			name: newItemName.trim(),
			quantity: newItemQuantity,
			estimated_price: newItemPrice ? Number(newItemPrice) : undefined,
		};
		setItems([...items, item]);
		setNewItemName('');
		setNewItemQuantity(1);
		setNewItemPrice('');
	};

	const startEditItem = (index: number) => {
		const item = items[index];
		setEditingItemIndex(index);
		setEditingItemName(item.name);
		setEditingItemQuantity(item.quantity);
		setEditingItemPrice(item.estimated_price?.toString() || '');
	};

	const saveEditItem = () => {
		if (editingItemIndex === null || !editingItemName.trim()) return;
		const updatedItems = [...items];
		updatedItems[editingItemIndex] = {
			name: editingItemName.trim(),
			quantity: editingItemQuantity,
			estimated_price: editingItemPrice ? Number(editingItemPrice) : undefined,
		};
		setItems(updatedItems);
		setEditingItemIndex(null);
		setEditingItemName('');
		setEditingItemQuantity(1);
		setEditingItemPrice('');
	};

	const cancelEditItem = () => {
		setEditingItemIndex(null);
		setEditingItemName('');
		setEditingItemQuantity(1);
		setEditingItemPrice('');
	};

	const deleteItem = (index: number) => {
		setItems(items.filter((_, i) => i !== index));
	};

	const handleSubmit = () => {
		if (!name.trim() || !categoryId) return;
		onSubmit({
			name: name.trim(),
			category_id: categoryId,
			subcategory: subcategory || undefined,
			items,
		});
	};

	const handleClose = () => {
		setName('');
		setCategoryId('');
		setSubcategory('');
		setItems([]);
		setNewItemName('');
		setNewItemQuantity(1);
		setNewItemPrice('');
		setEditingItemIndex(null);
		setEditingItemName('');
		setEditingItemQuantity(1);
		setEditingItemPrice('');
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
						{editingList ? 'Edit Shopping List' : 'Create Shopping List'}
					</Typography>
					<IconButton onClick={handleClose} size='small'>
						<Close />
					</IconButton>
				</Box>

				<Divider sx={{ mb: 3 }} />

				{/* Form Content */}
				<Stack spacing={3} sx={{ flexGrow: 1, overflow: 'visible' }}>
					<TextField
						label='List Name'
						value={name}
						onChange={(e) => setName(e.target.value)}
						fullWidth
						autoFocus
					/>
					<FormControl fullWidth>
						<InputLabel>Category</InputLabel>
						<Select value={categoryId} label='Category' onChange={(e) => setCategoryId(e.target.value)}>
							{categories.map((category: Category) => (
								<MenuItem key={category.id} value={category.id}>
									{category.name} ({category.type})
								</MenuItem>
							))}
						</Select>
					</FormControl>
					{availableSubcategories.length > 0 && (
						<FormControl fullWidth>
							<InputLabel>Subcategory (optional)</InputLabel>
							<Select
								value={subcategory}
								label='Subcategory (optional)'
								onChange={(e) => setSubcategory(e.target.value)}
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

					{/* Items Management */}
					<Box>
						<Typography variant='h6' gutterBottom>
							Items
						</Typography>

						{/* Add New Item */}
						<Stack direction='row' spacing={1} alignItems='center' mb={2}>
							<TextField
								size='small'
								placeholder='Item name'
								value={newItemName}
								onChange={(e) => setNewItemName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addItem();
									}
								}}
								sx={{ flexGrow: 1 }}
							/>
							<TextField
								size='small'
								type='number'
								placeholder='Qty'
								value={newItemQuantity}
								onChange={(e) => setNewItemQuantity(Number(e.target.value) || 1)}
								inputProps={{ min: 1 }}
								sx={{ width: 80 }}
							/>
							<TextField
								size='small'
								type='number'
								placeholder='Est. price'
								value={newItemPrice}
								onChange={(e) => setNewItemPrice(e.target.value)}
								inputProps={{ min: 0, step: 0.01 }}
								sx={{ width: 100 }}
							/>
							<IconButton color='primary' onClick={addItem} disabled={!newItemName.trim()}>
								<Add />
							</IconButton>
						</Stack>

						{/* Existing Items */}
						<Stack spacing={1}>
							{items.map((item, index) => (
								<Box key={index} display='flex' alignItems='center' gap={1}>
									{editingItemIndex === index ? (
										<>
											<TextField
												size='small'
												value={editingItemName}
												onChange={(e) => setEditingItemName(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														saveEditItem();
													}
												}}
												sx={{ flexGrow: 1 }}
											/>
											<TextField
												size='small'
												type='number'
												value={editingItemQuantity}
												onChange={(e) => setEditingItemQuantity(Number(e.target.value) || 1)}
												inputProps={{ min: 1 }}
												sx={{ width: 80 }}
											/>
											<TextField
												size='small'
												type='number'
												value={editingItemPrice}
												onChange={(e) => setEditingItemPrice(e.target.value)}
												inputProps={{ min: 0, step: 0.01 }}
												sx={{ width: 100 }}
											/>
											<IconButton color='primary' size='small' onClick={saveEditItem}>
												<Save />
											</IconButton>
											<IconButton size='small' onClick={cancelEditItem}>
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
												<Typography variant='body2'>
													{item.name} (Qty: {item.quantity}
													{item.estimated_price ? `, Est: $${item.estimated_price}` : ''})
												</Typography>
											</Box>
											<IconButton size='small' onClick={() => startEditItem(index)}>
												<Edit />
											</IconButton>
											<IconButton size='small' color='error' onClick={() => deleteItem(index)}>
												<Delete />
											</IconButton>
										</>
									)}
								</Box>
							))}
							{items.length === 0 && (
								<Typography variant='body2' color='text.secondary' style={{ fontStyle: 'italic' }}>
									No items added yet
								</Typography>
							)}
						</Stack>
					</Box>
				</Stack>

				{/* Actions */}
				<Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
					<Stack direction='row' spacing={2} justifyContent='flex-end'>
						<Button onClick={handleClose}>Cancel</Button>
						<Button onClick={handleSubmit} variant='contained' disabled={!name.trim() || !categoryId}>
							{editingList ? 'Update' : 'Create'}
						</Button>
					</Stack>
				</Box>
			</Box>
		</Drawer>
	);
}
