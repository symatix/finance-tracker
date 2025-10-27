import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	Alert,
	Box,
	Typography,
	Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { InvitationOperations } from '../../../db';
import { supabase } from '../../../db/supabase';
import type { InvitationDocument } from '../../../db/schemas';

interface AddMemberModalProps {
	open: boolean;
	onClose: () => void;
	familyId: string;
	onMemberAdded: () => void;
}

export function AddMemberModal({ open, onClose, familyId, onMemberAdded }: AddMemberModalProps) {
	const [email, setEmail] = useState('');
	const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [existingInvitation, setExistingInvitation] = useState<InvitationDocument | null>(null);

	useEffect(() => {
		if (open && email.trim()) {
			checkExistingInvitation();
		} else {
			setExistingInvitation(null);
		}
	}, [open, email]);

	const checkExistingInvitation = async () => {
		if (!email.trim()) {
			setExistingInvitation(null);
			return;
		}

		try {
			const invitations = await InvitationOperations.findByFamilyId(familyId);
			const existing = invitations.find(
				(inv) => inv.email.toLowerCase() === email.trim().toLowerCase() && inv.status === 'pending'
			);
			setExistingInvitation(existing || null);
		} catch (err) {
			console.error('Failed to check existing invitation:', err);
		}
	};

	const handleResendInvitation = async () => {
		if (!existingInvitation) return;

		setIsLoading(true);
		setError(null);

		try {
			// Try to send the email again
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session?.access_token) {
				throw new Error('No authentication token available');
			}

			const response = await supabase.functions.invoke('send-invitation', {
				body: {
					email: existingInvitation.email,
					family_id: existingInvitation.family_id,
					role: existingInvitation.role,
					invited_by: existingInvitation.invited_by,
				},
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			if (response.error) {
				throw new Error('Failed to resend invitation email');
			}

			setError(null);
			alert('Invitation email resent successfully!');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to resend invitation');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelInvitation = async () => {
		if (!existingInvitation) return;

		if (!confirm('Are you sure you want to cancel this pending invitation?')) return;

		setIsLoading(true);
		setError(null);

		try {
			await InvitationOperations.delete(existingInvitation.id);
			setExistingInvitation(null);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to cancel invitation');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim() || existingInvitation) return;

		setIsLoading(true);
		setError(null);

		try {
			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email.trim())) {
				throw new Error('Please enter a valid email address');
			}

			// Create invitation
			await InvitationOperations.createInvitation(email.trim(), familyId, role);

			onMemberAdded();
			handleClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to send invitation');
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setEmail('');
		setRole('member');
		setError(null);
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
			<form onSubmit={handleSubmit}>
				<DialogTitle>Add Account Member</DialogTitle>
				<DialogContent>
					{error && (
						<Alert severity='error' sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					<TextField
						autoFocus
						margin='dense'
						label='Email Address'
						type='email'
						helperText='Enter the email address of the person you want to invite'
						fullWidth
						variant='outlined'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder='user@example.com'
						required
						sx={{ mb: 2 }}
					/>

					{existingInvitation && (
						<Alert severity='info' sx={{ mb: 2 }}>
							<Typography variant='body2' gutterBottom>
								This email has already been invited to this account.
							</Typography>
							<Box sx={{ mt: 1 }}>
								<Chip
									label={`Role: ${existingInvitation.role}`}
									size='small'
									color='primary'
									sx={{ mr: 1 }}
								/>
								<Chip
									label={`Invited: ${new Date(existingInvitation.created_at).toLocaleDateString()}`}
									size='small'
									variant='outlined'
								/>
							</Box>
							<Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
								<Button
									size='small'
									variant='outlined'
									onClick={handleResendInvitation}
									disabled={isLoading}
								>
									Resend Email
								</Button>
								<Button
									size='small'
									color='error'
									onClick={handleCancelInvitation}
									disabled={isLoading}
								>
									Cancel Invitation
								</Button>
							</Box>
						</Alert>
					)}

					<FormControl fullWidth margin='dense' disabled={!!existingInvitation}>
						<InputLabel>Role</InputLabel>
						<Select
							value={role}
							label='Role'
							onChange={(e) => setRole(e.target.value as 'admin' | 'member' | 'viewer')}
						>
							<MenuItem value='viewer'>Viewer - Can only view shared resources</MenuItem>
							<MenuItem value='member'>Member - Can view and manage shared resources</MenuItem>
							<MenuItem value='admin'>Admin - Can manage members and resources</MenuItem>
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						type='submit'
						variant='contained'
						disabled={isLoading || !email.trim() || !!existingInvitation}
					>
						{isLoading ? 'Sending Invite...' : 'Send Invitation'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
