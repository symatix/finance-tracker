import {
	Card,
	CardContent,
	Typography,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	ListItemSecondaryAction,
	IconButton,
	Chip,
	Avatar,
	Box,
	Button,
	CircularProgress,
	Alert,
} from '@mui/material';
import { Email, Cancel, Refresh, CheckCircle, Error as ErrorIcon, Schedule } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { InvitationOperations } from '../../../db';
import type { InvitationDocument } from '../../../db';

interface InvitationsCardProps {
	familyId: string;
}

export function InvitationsCard({ familyId }: InvitationsCardProps) {
	const [invitations, setInvitations] = useState<InvitationDocument[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadInvitations = async () => {
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
	};

	useEffect(() => {
		loadInvitations();
	}, [familyId]);

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
			<Card>
				<CardContent sx={{ textAlign: 'center', py: 4 }}>
					<CircularProgress size={24} />
					<Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
						Loading invitations...
					</Typography>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardContent>
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

				{invitations.length === 0 ? (
					<Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 2 }}>
						No pending invitations. Send invitations to add new members.
					</Typography>
				) : (
					<List dense>
						{invitations.map((invitation) => (
							<ListItem key={invitation.id}>
								<ListItemAvatar>
									<Avatar sx={{ bgcolor: 'secondary.main' }}>
										<Email fontSize='small' />
									</Avatar>
								</ListItemAvatar>
								<ListItemText
									primary={
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											{invitation.email}
											{getStatusIcon(invitation.status)}
										</Box>
									}
									secondary={
										<Typography variant='caption' color='text.secondary'>
											Sent {new Date(invitation.created_at).toLocaleDateString()}
											{invitation.expires_at && (
												<span>
													{' • Expires '}
													{new Date(invitation.expires_at).toLocaleDateString()}
												</span>
											)}
										</Typography>
									}
								/>
								<ListItemSecondaryAction>
									<Box
										sx={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'flex-end',
											gap: 1,
										}}
									>
										<Box sx={{ display: 'flex', gap: 1 }}>
											<Chip
												label={invitation.role}
												size='small'
												color='primary'
												variant='outlined'
											/>
											<Chip
												label={invitation.status}
												size='small'
												color={getStatusColor(invitation.status)}
												variant='filled'
											/>
										</Box>
										{invitation.status === 'pending' && (
											<Box sx={{ display: 'flex', gap: 1 }}>
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
									</Box>
								</ListItemSecondaryAction>
							</ListItem>
						))}
					</List>
				)}
			</CardContent>
		</Card>
	);
}
