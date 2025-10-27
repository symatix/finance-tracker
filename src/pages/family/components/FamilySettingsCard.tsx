import {
	Card,
	CardContent,
	Typography,
	Box,
	Button,
	Stack,
	Divider,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material';
import { Edit, Delete, FamilyRestroom } from '@mui/icons-material';
import { useState } from 'react';
import type { FamilyDocument } from '../../../db/schemas';

interface FamilySettingsCardProps {
	family: FamilyDocument;
	onEdit: () => void;
	onDelete: () => void;
}

export function FamilySettingsCard({ family, onEdit, onDelete }: FamilySettingsCardProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		setDeleteDialogOpen(false);
		onDelete();
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
	};

	return (
		<>
			<Card>
				<CardContent>
					<Typography variant='h6' gutterBottom>
						Family Settings
					</Typography>

					<Box sx={{ mb: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
							<FamilyRestroom sx={{ mr: 1, color: 'primary.main' }} />
							<Typography variant='h6' color='primary.main'>
								{family.name}
							</Typography>
						</Box>
						{family.description && (
							<Typography variant='body2' color='text.secondary'>
								{family.description}
							</Typography>
						)}
						<Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
							Created {new Date(family.created_at).toLocaleDateString()}
						</Typography>
					</Box>

					<Divider sx={{ my: 2 }} />

					<Stack spacing={2}>
						<Button variant='outlined' startIcon={<Edit />} onClick={onEdit} fullWidth>
							Edit Family Details
						</Button>
						<Button
							variant='outlined'
							color='error'
							startIcon={<Delete />}
							onClick={handleDeleteClick}
							fullWidth
						>
							Delete Family
						</Button>
					</Stack>
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
				<DialogTitle>Delete Family</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to delete the family "{family.name}"?</Typography>
					<Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
						This action cannot be undone. All family members will be removed and shared resources will no
						longer be accessible.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel}>Cancel</Button>
					<Button onClick={handleDeleteConfirm} color='error' variant='contained'>
						Delete Family
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
