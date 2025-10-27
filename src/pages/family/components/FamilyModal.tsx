import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import type { FamilyDocument, CreateFamilyInput } from '../../../db/schemas';

interface FamilyModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (familyData: CreateFamilyInput | { id: string; updates: Partial<FamilyDocument> }) => Promise<void>;
	initialData?: FamilyDocument;
	userId: string;
}

export function FamilyModal({ open, onClose, onSave, initialData, userId }: FamilyModalProps) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const isEditing = !!initialData;

	useEffect(() => {
		if (open) {
			if (initialData) {
				setName(initialData.name);
				setDescription(initialData.description || '');
			} else {
				setName('');
				setDescription('');
			}
		}
	}, [open, initialData]);

	const handleSave = async () => {
		if (!name.trim()) return;

		setIsLoading(true);
		try {
			if (isEditing && initialData) {
				await onSave({
					id: initialData.id,
					updates: {
						name: name.trim(),
						description: description.trim() || null,
					},
				});
			} else {
				await onSave({
					name: name.trim(),
					description: description.trim() || null,
					owner_id: userId,
				});
			}
			onClose();
		} catch (error) {
			console.error('Failed to save family:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			onClose();
		}
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
			<DialogTitle>{isEditing ? 'Edit Family' : 'Create New Family'}</DialogTitle>
			<DialogContent>
				<Stack spacing={3} sx={{ pt: 1 }}>
					<TextField
						label='Family Name'
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						fullWidth
						autoFocus
						disabled={isLoading}
					/>
					<TextField
						label='Description (Optional)'
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						multiline
						rows={3}
						fullWidth
						disabled={isLoading}
						placeholder='Add a description for your family...'
					/>
					{!isEditing && (
						<Typography variant='body2' color='text.secondary'>
							After creating the family, you can invite other members to join and collaborate on your
							finances.
						</Typography>
					)}
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} disabled={isLoading}>
					Cancel
				</Button>
				<Button onClick={handleSave} variant='contained' disabled={!name.trim() || isLoading}>
					{isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
