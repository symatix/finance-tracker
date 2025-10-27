import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar, Alert, Snackbar, Divider, Paper } from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProfileOperations } from '@/db';
import type { ProfileDocument } from '@/db';

export default function ProfilePage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [profile, setProfile] = useState<Partial<ProfileDocument>>({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
		open: false,
		message: '',
		severity: 'success',
	});

	useEffect(() => {
		const loadProfile = async () => {
			if (!user) return;

			try {
				const profileData = await ProfileOperations.findByUserId(user.id);
				if (profileData) {
					setProfile(profileData);
				}
			} catch (error) {
				console.error('Error loading profile:', error);
				setSnackbar({
					open: true,
					message: 'Failed to load profile',
					severity: 'error',
				});
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, [user]);

	const handleSave = async () => {
		if (!user) return;

		setSaving(true);
		try {
			await ProfileOperations.upsert(user.id, {
				email: user.email,
				first_name: profile.first_name || null,
				last_name: profile.last_name || null,
				display_name: profile.display_name || null,
				address_line_1: profile.address_line_1 || null,
				address_line_2: profile.address_line_2 || null,
				city: profile.city || null,
				state_province: profile.state_province || null,
				postal_code: profile.postal_code || null,
				country: profile.country || null,
				phone: profile.phone || null,
				date_of_birth: profile.date_of_birth || null,
				avatar_url: profile.avatar_url || null,
				bio: profile.bio || null,
			});

			setSnackbar({
				open: true,
				message: 'Profile saved successfully',
				severity: 'success',
			});
		} catch (error) {
			console.error('Error saving profile:', error);
			setSnackbar({
				open: true,
				message: 'Failed to save profile',
				severity: 'error',
			});
		} finally {
			setSaving(false);
		}
	};

	const handleInputChange = (field: keyof ProfileDocument, value: string) => {
		setProfile((prev: Partial<ProfileDocument>) => ({
			...prev,
			[field]: value || undefined,
		}));
	};

	const getDisplayName = () => {
		if (profile.display_name) return profile.display_name;
		if (profile.first_name && profile.last_name) {
			return `${profile.first_name} ${profile.last_name}`;
		}
		if (profile.first_name) return profile.first_name;
		if (profile.last_name) return profile.last_name;
		return user?.email?.split('@')[0] || 'User';
	};

	const getInitials = () => {
		const first = profile.first_name?.[0] || '';
		const last = profile.last_name?.[0] || '';
		if (first || last) return (first + last).toUpperCase();
		return user?.email?.[0]?.toUpperCase() || 'U';
	};

	if (loading) {
		return (
			<Box p={4} display='flex' justifyContent='center'>
				<Typography>Loading profile...</Typography>
			</Box>
		);
	}

	return (
		<Box p={4} maxWidth='800px' mx='auto'>
			<Box mb={4} display='flex' alignItems='center' gap={2}>
				<Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} variant='outlined'>
					Back
				</Button>
				<Typography variant='h4' component='h1'>
					Edit Profile
				</Typography>
			</Box>

			<Paper elevation={2} sx={{ p: 3, mb: 3 }}>
				<Box display='flex' alignItems='center' gap={3} mb={3}>
					<Avatar
						sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
						src={profile.avatar_url || undefined}
					>
						{!profile.avatar_url && getInitials()}
					</Avatar>
					<Box>
						<Typography variant='h5'>{getDisplayName()}</Typography>
						<Typography variant='body2' color='text.secondary'>
							{user?.email}
						</Typography>
					</Box>
				</Box>

				<Divider sx={{ mb: 3 }} />

				<Typography variant='h6' gutterBottom>
					Basic Information
				</Typography>
				<Box display='grid' gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} mb={4}>
					<TextField
						fullWidth
						label='First Name'
						value={profile.first_name || ''}
						onChange={(e) => handleInputChange('first_name', e.target.value)}
					/>
					<TextField
						fullWidth
						label='Last Name'
						value={profile.last_name || ''}
						onChange={(e) => handleInputChange('last_name', e.target.value)}
					/>
					<Box gridColumn='1 / -1'>
						<TextField
							fullWidth
							label='Display Name'
							value={profile.display_name || ''}
							onChange={(e) => handleInputChange('display_name', e.target.value)}
							helperText='This name will be displayed in family accounts'
						/>
					</Box>
					<Box gridColumn='1 / -1'>
						<TextField
							fullWidth
							label='Phone'
							value={profile.phone || ''}
							onChange={(e) => handleInputChange('phone', e.target.value)}
						/>
					</Box>
					<Box gridColumn='1 / -1'>
						<TextField
							fullWidth
							label='Date of Birth'
							type='date'
							value={profile.date_of_birth || ''}
							onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>
					</Box>
				</Box>

				<Typography variant='h6' gutterBottom>
					Address
				</Typography>
				<Box display='grid' gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} mb={4}>
					<Box gridColumn='1 / -1'>
						<TextField
							fullWidth
							label='Address Line 1'
							value={profile.address_line_1 || ''}
							onChange={(e) => handleInputChange('address_line_1', e.target.value)}
						/>
					</Box>
					<Box gridColumn='1 / -1'>
						<TextField
							fullWidth
							label='Address Line 2'
							value={profile.address_line_2 || ''}
							onChange={(e) => handleInputChange('address_line_2', e.target.value)}
						/>
					</Box>
					<TextField
						fullWidth
						label='City'
						value={profile.city || ''}
						onChange={(e) => handleInputChange('city', e.target.value)}
					/>
					<TextField
						fullWidth
						label='State/Province'
						value={profile.state_province || ''}
						onChange={(e) => handleInputChange('state_province', e.target.value)}
					/>
					<TextField
						fullWidth
						label='Postal Code'
						value={profile.postal_code || ''}
						onChange={(e) => handleInputChange('postal_code', e.target.value)}
					/>
					<TextField
						fullWidth
						label='Country'
						value={profile.country || ''}
						onChange={(e) => handleInputChange('country', e.target.value)}
					/>
				</Box>

				<Typography variant='h6' gutterBottom>
					Additional Information
				</Typography>
				<Box display='grid' gap={3} mb={4}>
					<TextField
						fullWidth
						label='Avatar URL'
						value={profile.avatar_url || ''}
						onChange={(e) => handleInputChange('avatar_url', e.target.value)}
						helperText='URL to your profile picture'
					/>
					<TextField
						fullWidth
						multiline
						rows={3}
						label='Bio'
						value={profile.bio || ''}
						onChange={(e) => handleInputChange('bio', e.target.value)}
						helperText='Tell others about yourself'
					/>
				</Box>

				<Box display='flex' justifyContent='flex-end' gap={2}>
					<Button variant='outlined' onClick={() => navigate(-1)}>
						Cancel
					</Button>
					<Button variant='contained' startIcon={<Save />} onClick={handleSave} disabled={saving}>
						{saving ? 'Saving...' : 'Save Profile'}
					</Button>
				</Box>
			</Paper>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
			>
				<Alert
					onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
					severity={snackbar.severity}
					sx={{ width: '100%' }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
