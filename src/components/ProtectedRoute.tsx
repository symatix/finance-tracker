import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
				<CircularProgress />
			</Box>
		);
	}

	if (!user) {
		// Redirect to login page with return url
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return <>{children}</>;
};
