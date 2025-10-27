import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Box,
	Button,
	IconButton,
	Chip,
	Avatar,
	CircularProgress,
	Alert,
} from '@mui/material';
import { Email, Cancel, Refresh, CheckCircle, Error as ErrorIcon, Schedule } from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import { InvitationOperations } from '../../../db';
import type { InvitationDocument } from '../../../db';

interface InvitationsTableProps {
	familyId: string;
}

export function InvitationsTable({ familyId }: InvitationsTableProps) {
	const [invitations, setInvitations] = useState<InvitationDocument[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadInvitations = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await InvitationOperations.findByFamilyId(familyId);
			setInvitations(data);
		} catch (err) {
			setError(err instanceof Error ? (err as Error).message : 'Failed to load invitations');
		} finally {
			setIsLoading(false);
		}
	}, [familyId]);

	useEffect(() => {
		loadInvitations();
	}, [loadInvitations]);

	const handleResendInvitation = async (invitation: InvitationDocument) => {
		try {
			// Call the Edge Function to resend email
			const { supabase } = await import('../../../db/supabase');
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session?.access_token) {
				throw new Error('No authentication token available');
			}

			const response = await supabase.functions.invoke('send-invitation', {
				body: {
					email: invitation.email,
					family_id: invitation.family_id,
					role: invitation.role,
					invited_by: invitation.invited_by,
				},
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			if (response.error) {
				throw new Error('Failed to resend invitation email');
			}

			alert('Invitation email resent successfully!');
			loadInvitations(); // Refresh the list
		} catch (err: unknown) {
			alert(err instanceof Error ? (err as Error).message : 'Failed to resend invitation');
		}
	};

	const handleCancelInvitation = async (invitationId: string) => {
		if (!confirm('Are you sure you want to cancel this invitation?')) return;

		try {
			await InvitationOperations.delete(invitationId);
			loadInvitations(); // Refresh the list
		} catch (err: unknown) {
			alert(err instanceof Error ? (err as Error).message : 'Failed to cancel invitation');
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'pending':
				return <Schedule color='warning' />;
			case 'accepted':
				return <CheckCircle color='success' />;
			case 'expired':
				return <ErrorIcon color='error' />;
			case 'cancelled':
				return <Cancel color='error' />;
			default:
				return <Email />;
		}
	};

	const getStatusColor = (
		status: string
	): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
		switch (status) {
			case 'pending':
				return 'warning';
			case 'accepted':
				return 'success';
			case 'expired':
			case 'cancelled':
				return 'error';
			default:
				return 'default';
		}
	};

	if (isLoading) {
		return (
			<Box sx={{ textAlign: 'center', py: 4 }}>
				<CircularProgress size={24} />
				<Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
					Loading invitations...
				</Typography>
			</Box>
		);
	}

	if (invitations.length === 0) {
		return null; // Don't show the table if there are no invitations
	}

	return (
		<Box sx={{ mt: 4 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
				<Typography variant='h6'>Pending Invitations</Typography>
				<Button size='small' startIcon={<Refresh />} onClick={loadInvitations} disabled={isLoading}>
					Refresh
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Email</TableCell>
							<TableCell>Role</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Sent</TableCell>
							<TableCell>Expires</TableCell>
							<TableCell align='right'>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{invitations.map((invitation) => (
							<TableRow key={invitation.id}>
								<TableCell>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
										<Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
											<Email fontSize='small' />
										</Avatar>
										<Typography variant='body2'>{invitation.email}</Typography>
									</Box>
								</TableCell>
								<TableCell>
									<Chip label={invitation.role} size='small' color='primary' variant='outlined' />
								</TableCell>
								<TableCell>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										{getStatusIcon(invitation.status)}
										<Chip
											label={invitation.status}
											size='small'
											color={getStatusColor(invitation.status)}
											variant='filled'
										/>
									</Box>
								</TableCell>
								<TableCell>
									<Typography variant='body2' color='text.secondary'>
										{new Date(invitation.created_at).toLocaleDateString()}
									</Typography>
								</TableCell>
								<TableCell>
									<Typography variant='body2' color='text.secondary'>
										{invitation.expires_at
											? new Date(invitation.expires_at).toLocaleDateString()
											: 'N/A'}
									</Typography>
								</TableCell>
								<TableCell align='right'>
									{invitation.status === 'pending' && (
										<Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
											<IconButton
												size='small'
												onClick={() => handleResendInvitation(invitation)}
												color='primary'
												title='Resend invitation'
											>
												<Email fontSize='small' />
											</IconButton>
											<IconButton
												size='small'
												onClick={() => handleCancelInvitation(invitation.id)}
												color='error'
												title='Cancel invitation'
											>
												<Cancel fontSize='small' />
											</IconButton>
										</Box>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}
