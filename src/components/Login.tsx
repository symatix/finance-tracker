import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Container, Paper } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isSignUp, setIsSignUp] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { signIn, signUp } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);

			if (error) {
				setError(error.message);
			} else {
				navigate('/dashboard');
			}
		} catch {
			setError('An unexpected error occurred');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container component='main' maxWidth='sm'>
			<Box
				sx={{
					marginTop: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<Paper
					elevation={3}
					sx={{
						padding: 4,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						width: '100%',
					}}
				>
					<Typography component='h1' variant='h4' fontWeight='bold' gutterBottom>
						FinanceTracker
					</Typography>
					<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
						{isSignUp ? 'Sign up' : 'Log in'}
					</Typography>

					<Box component='form' onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
						<TextField
							margin='normal'
							required
							fullWidth
							id='email'
							label='Email Address'
							name='email'
							autoComplete='email'
							autoFocus
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading}
						/>
						<TextField
							margin='normal'
							required
							fullWidth
							name='password'
							label='Password'
							type='password'
							id='password'
							autoComplete='current-password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
						/>

						{error && (
							<Alert severity='error' sx={{ mt: 2 }}>
								{error}
							</Alert>
						)}

						<Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }} disabled={loading}>
							{loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
						</Button>

						<Button fullWidth variant='text' onClick={() => setIsSignUp(!isSignUp)} disabled={loading}>
							{isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
						</Button>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
};
