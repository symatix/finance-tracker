import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import type { ListItemDocument } from '../../../db';

interface ListItemModalProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: { name: string; quantity: number; estimated_price?: number }) => void;
	editingItem?: ListItemDocument | null;
}

export function ListItemModal({ open, onClose, onSubmit, editingItem }: ListItemModalProps) {
	const [name, setName] = useState('');
	const [quantity, setQuantity] = useState(1);
	const [estimatedPrice, setEstimatedPrice] = useState<number | undefined>();

	useEffect(() => {
		if (editingItem) {
			setName(editingItem.name || '');
			setQuantity(editingItem.quantity || 1);
			setEstimatedPrice(editingItem.estimated_price || undefined);
		} else {
			setName('');
			setQuantity(1);
			setEstimatedPrice(undefined);
		}
	}, [editingItem, open]);

	const handleSubmit = () => {
		if (!name.trim()) return;
		onSubmit({
			name: name.trim(),
			quantity,
			estimated_price: estimatedPrice,
		});
	};

	const handleClose = () => {
		setName('');
		setQuantity(1);
		setEstimatedPrice(undefined);
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
			<DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin='dense'
					label='Item Name'
					fullWidth
					variant='outlined'
					value={name}
					onChange={(e) => setName(e.target.value)}
					sx={{ mb: 2 }}
				/>
				<TextField
					margin='dense'
					label='Quantity'
					type='number'
					fullWidth
					variant='outlined'
					value={quantity}
					onChange={(e) => setQuantity(Number(e.target.value))}
					sx={{ mb: 2 }}
					inputProps={{ min: 1 }}
				/>
				<TextField
					margin='dense'
					label='Estimated Price (optional)'
					type='number'
					fullWidth
					variant='outlined'
					value={estimatedPrice || ''}
					onChange={(e) => setEstimatedPrice(e.target.value ? Number(e.target.value) : undefined)}
					inputProps={{ min: 0, step: 0.01 }}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Cancel</Button>
				<Button onClick={handleSubmit} variant='contained' disabled={!name.trim()}>
					{editingItem ? 'Update' : 'Add'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
