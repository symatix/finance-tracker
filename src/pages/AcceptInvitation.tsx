import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Chip } from '@mui/material';
import { CheckCircle, Error, Group } from '@mui/icons-material';
import { InvitationOperations } from '../db';
import { useAuth } from '../hooks/useAuth';
import type { InvitationDocument } from '../db';

export default function AcceptInvitation() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [invitation, setInvitation] = useState<InvitationDocument | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAccepting, setIsAccepting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const token = searchParams.get('token');

	useEffect(() => {
		if (!token) {
			setError('Invalid invitation link - no token provided');
			setIsLoading(false);
			return;
		}

		// Check if user is authenticated
		if (!user) {
			// Redirect to login with the invitation token
			navigate(`/login?invite=${token}`);
			return;
		}

		// Fetch invitation details
		const fetchInvitation = async () => {
			try {
				const inviteData = await InvitationOperations.findByToken(token);
				if (!inviteData) {
					setError('Invitation not found or has expired');
					return;
				}

				// Check if invitation is for current user's email
				if (inviteData.email !== user.email) {
					setError('This invitation is for a different email address');
					return;
				}

				if (inviteData.status !== 'pending') {
					setError(`This invitation has already been ${inviteData.status}`);
					return;
				}

				setInvitation(inviteData);
			} catch (err: unknown) {
				setError(err instanceof Error ? (err as Error).message : 'Failed to load invitation');
			} finally {
				setIsLoading(false);
			}
		};

		fetchInvitation();
	}, [token, user, navigate]);

	const handleAccept = async () => {
		if (!token) return;

		setIsAccepting(true);
		setError(null);

		try {
			await InvitationOperations.accept(token);
			setSuccess(true);

			// Redirect to dashboard after a short delay
			setTimeout(() => {
				navigate('/dashboard');
			}, 2000);
		} catch (err: unknown) {
			setError(err instanceof Error ? (err as Error).message : 'Failed to accept invitation');
		} finally {
			setIsAccepting(false);
		}
	};

	const handleDecline = () => {
		navigate('/dashboard');
	};

	if (isLoading) {
		return (
			<Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box p={4} maxWidth={600} mx='auto'>
				<Card>
					<CardContent sx={{ textAlign: 'center', py: 6 }}>
						<Error sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
						<Typography variant='h5' color='error' gutterBottom>
							Invitation Error
						</Typography>
						<Typography variant='body1' color='text.secondary' mb={3}>
							{error}
						</Typography>
						<Button variant='contained' onClick={() => navigate('/dashboard')}>
							Go to Dashboard
						</Button>
					</CardContent>
				</Card>
			</Box>
		);
	}

	if (success) {
		return (
			<Box p={4} maxWidth={600} mx='auto'>
				<Card>
					<CardContent sx={{ textAlign: 'center', py: 6 }}>
						<CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
						<Typography variant='h5' color='success.main' gutterBottom>
							Welcome to the Account!
						</Typography>
						<Typography variant='body1' color='text.secondary' mb={3}>
							You have successfully joined the account. You will be redirected to the dashboard shortly.
						</Typography>
					</CardContent>
				</Card>
			</Box>
		);
	}

	if (!invitation) return null;

	return (
		<Box p={4} maxWidth={600} mx='auto'>
			<Card>
				<CardContent sx={{ textAlign: 'center', py: 4 }}>
					<Group sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
					<Typography variant='h5' gutterBottom>
						Account Invitation
					</Typography>
					<Typography variant='body1' color='text.secondary' mb={3}>
						You've been invited to join a shared financial account. Review the details below and accept the
						invitation to get started.
					</Typography>

					<Box sx={{ textAlign: 'left', mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
						<Typography variant='subtitle2' gutterBottom>
							Account: <strong>{invitation.family_id}</strong>
						</Typography>
						<Typography variant='subtitle2' gutterBottom>
							Your Role: <Chip label={invitation.role} color='primary' size='small' />
						</Typography>
						<Typography variant='caption' color='text.secondary'>
							Invited: {new Date(invitation.created_at).toLocaleDateString()}
						</Typography>
					</Box>

					<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
						<Button variant='outlined' onClick={handleDecline} disabled={isAccepting}>
							Decline
						</Button>
						<Button
							variant='contained'
							onClick={handleAccept}
							disabled={isAccepting}
							startIcon={isAccepting ? <CircularProgress size={20} /> : null}
						>
							{isAccepting ? 'Accepting...' : 'Accept Invitation'}
						</Button>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
}
