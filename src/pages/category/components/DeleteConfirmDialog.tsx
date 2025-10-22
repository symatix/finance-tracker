import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface DeleteConfirmDialogProps {
	open: boolean;
	hasTransactions: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export function DeleteConfirmDialog({ open, hasTransactions, onConfirm, onCancel }: DeleteConfirmDialogProps) {
	return (
		<Dialog open={open} onClose={onCancel}>
			<DialogTitle>Confirm Deletion</DialogTitle>
			<DialogContent>
				{hasTransactions ? (
					<Typography color='error'>
						Cannot delete this category! There are transactions attached to it.
					</Typography>
				) : (
					<Typography>Are you sure you want to delete this category?</Typography>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
				<Button onClick={onConfirm} color='error' variant='contained' disabled={hasTransactions}>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
