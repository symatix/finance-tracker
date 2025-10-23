import {
	Drawer,
	Typography,
	Divider,
	Button,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	IconButton,
	Checkbox,
	Stack,
	TextField,
	Box,
	Accordion,
	AccordionSummary,
	AccordionDetails,
} from '@mui/material';
import { Delete, Edit, Add, Close, ExpandMore } from '@mui/icons-material';
import { useState } from 'react';
import { useListItems } from '../hooks/useListItems';
import { ListItemModal } from './ListItemModal';
import type { ShoppingListDocument, ListItemDocument } from '../../../db';

interface ListDetailModalProps {
	open: boolean;
	onClose: () => void;
	list: ShoppingListDocument | null;
	onCompleteList: (listId: string, totalAmount: number) => void;
}

export function ListDetailModal({ open, onClose, list, onCompleteList }: ListDetailModalProps) {
	const { items, loading, createItem, updateItem, deleteItem, toggleItemChecked } = useListItems(list?.id || null);
	const [itemModalOpen, setItemModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<ListItemDocument | null>(null);
	const [newItemName, setNewItemName] = useState('');
	const [newItemQuantity, setNewItemQuantity] = useState(1);
	const [newItemPrice, setNewItemPrice] = useState('');
	const [totalAmount, setTotalAmount] = useState(0);

	const handleAddItem = () => {
		if (!newItemName.trim()) return;
		const item = {
			name: newItemName.trim(),
			quantity: newItemQuantity,
			estimated_price: newItemPrice ? Number(newItemPrice) : undefined,
		};
		if (list) {
			createItem({ ...item, list_id: list.id });
		}
		setNewItemName('');
		setNewItemQuantity(1);
		setNewItemPrice('');
	};

	const handleEditItemClick = (item: ListItemDocument) => {
		setEditingItem(item);
		setItemModalOpen(true);
	};

	const handleDeleteItem = async (itemId: string) => {
		if (confirm('Delete this item?')) {
			await deleteItem(itemId);
		}
	};

	const handleItemModalSubmit = async (data: { name: string; quantity: number; estimated_price?: number }) => {
		if (editingItem) {
			await updateItem(editingItem.id, data);
		} else if (list) {
			await createItem({ ...data, list_id: list.id });
		}
		setItemModalOpen(false);
	};

	const handleCompleteList = () => {
		if (list && totalAmount > 0) {
			onCompleteList(list.id, totalAmount);
			onClose();
		}
	};

	const allChecked = items.length > 0 && items.every((item) => item.checked);

	return (
		<Drawer
			open={open}
			onClose={onClose}
			anchor='right'
			PaperProps={{
				sx: {
					width: { xs: '100%', sm: 500 },
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
						{list?.name}
					</Typography>
					<IconButton onClick={onClose} size='small'>
						<Close />
					</IconButton>
				</Box>

				<Divider sx={{ mb: 3 }} />

				{/* Content */}
				<Stack spacing={3} sx={{ flexGrow: 1, overflow: 'visible' }}>
					<Stack direction='row' justifyContent='space-between' alignItems='center'>
						<Typography variant='h6'>Items</Typography>
					</Stack>

					{/* Add New Item Form */}
					<Stack direction='row' spacing={1} alignItems='center'>
						<TextField
							size='small'
							placeholder='Item name'
							value={newItemName}
							onChange={(e) => setNewItemName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									handleAddItem();
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
						<IconButton color='primary' onClick={handleAddItem} disabled={!newItemName.trim()}>
							<Add />
						</IconButton>
					</Stack>

					{loading ? (
						<Typography>Loading items...</Typography>
					) : items.length === 0 ? (
						<Typography>No items yet. Add some!</Typography>
					) : (
						<Stack spacing={2} sx={{ flexGrow: 1, overflow: 'auto' }}>
							{/* Unchecked Items */}
							<List>
								{items
									.filter((item) => !item.checked)
									.map((item) => (
										<ListItem key={item.id} divider>
											<Checkbox
												checked={item.checked}
												onChange={() => toggleItemChecked(item.id)}
											/>
											<ListItemText
												primary={item.name}
												secondary={`Qty: ${item.quantity}${
													item.estimated_price ? ` | Est: $${item.estimated_price}` : ''
												}`}
											/>
											<ListItemSecondaryAction>
												<IconButton onClick={() => handleEditItemClick(item)} size='small'>
													<Edit />
												</IconButton>
												<IconButton
													onClick={() => handleDeleteItem(item.id)}
													color='error'
													size='small'
												>
													<Delete />
												</IconButton>
											</ListItemSecondaryAction>
										</ListItem>
									))}
							</List>

							{/* Checked Items Accordion */}
							{items.some((item) => item.checked) && (
								<Accordion
									sx={{
										backgroundColor: '#2a2a2a',
										'& .MuiAccordionSummary-root': {
											backgroundColor: '#2a2a2a',
										},
										'& .MuiAccordionDetails-root': {
											backgroundColor: '#1a1a1a',
										},
									}}
								>
									<AccordionSummary expandIcon={<ExpandMore />}>
										<Typography variant='subtitle1'>
											Completed Items ({items.filter((item) => item.checked).length})
										</Typography>
									</AccordionSummary>
									<AccordionDetails sx={{ p: 0 }}>
										<List>
											{items
												.filter((item) => item.checked)
												.map((item) => (
													<ListItem key={item.id} divider sx={{ opacity: 0.6 }}>
														<Checkbox
															checked={item.checked}
															onChange={() => toggleItemChecked(item.id)}
														/>
														<ListItemText
															primary={item.name}
															secondary={`Qty: ${item.quantity}${
																item.estimated_price
																	? ` | Est: $${item.estimated_price}`
																	: ''
															}`}
															sx={{ textDecoration: 'line-through' }}
														/>
														<ListItemSecondaryAction>
															<IconButton
																onClick={() => handleEditItemClick(item)}
																size='small'
															>
																<Edit />
															</IconButton>
															<IconButton
																onClick={() => handleDeleteItem(item.id)}
																color='error'
																size='small'
															>
																<Delete />
															</IconButton>
														</ListItemSecondaryAction>
													</ListItem>
												))}
										</List>
									</AccordionDetails>
								</Accordion>
							)}
						</Stack>
					)}

					{allChecked && (
						<>
							<Divider />
							<Typography variant='h6' gutterBottom>
								List Complete!
							</Typography>
							<TextField
								label='Total Amount Spent'
								type='number'
								fullWidth
								value={totalAmount}
								onChange={(e) => setTotalAmount(Number(e.target.value))}
								inputProps={{ min: 0, step: 0.01 }}
							/>
						</>
					)}
				</Stack>

				{/* Actions */}
				<Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
					<Stack direction='row' spacing={2} justifyContent='flex-end'>
						<Button onClick={onClose}>Close</Button>
						{allChecked && (
							<Button onClick={handleCompleteList} variant='contained' disabled={totalAmount <= 0}>
								Complete List
							</Button>
						)}
					</Stack>
				</Box>
			</Box>

			<ListItemModal
				open={itemModalOpen}
				onClose={() => setItemModalOpen(false)}
				onSubmit={handleItemModalSubmit}
				editingItem={editingItem}
			/>
		</Drawer>
	);
}
