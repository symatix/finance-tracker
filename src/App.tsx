import { useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { AuthProvider } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import AcceptInvitation from './pages/AcceptInvitation';
import { useAuth } from './hooks/useAuth';
import { useBudgetStore } from './store';

const DashboardPage = lazy(() => import('./pages/dashboard'));
const TransactionPage = lazy(() => import('./pages/details'));
const CategoryPage = lazy(() => import('./pages/category'));
const ShoppingPage = lazy(() => import('./pages/shopping').then((module) => ({ default: module.default })));
const RecurringPage = lazy(() => import('./pages/recurring').then((module) => ({ default: module.default })));
const PlannedPage = lazy(() => import('./pages/planned').then((module) => ({ default: module.default })));
const FamilyPage = lazy(() => import('./pages/family').then((module) => ({ default: module.default })));
const ProfilePage = lazy(() => import('./pages/Profile'));
const HelpPage = lazy(() => import('./pages/help').then((module) => ({ default: module.default })));

// Handle GitHub Pages SPA redirects
function GitHubPagesRedirect() {
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		// Handle redirected URLs from 404.html
		// GitHub Pages redirects /finance-tracker/accept-invite?token=... to /finance-tracker/?/accept-invite&token=...
		const searchParams = new URLSearchParams(location.search);
		const redirectedPath = searchParams.get('/');

		if (redirectedPath) {
			// Remove the redirect parameter and reconstruct the path
			searchParams.delete('/');
			const queryString = searchParams.toString();
			const cleanPath = `/${redirectedPath}${queryString ? `?${queryString}` : ''}`;

			// Replace the current URL with the clean path
			navigate(cleanPath, { replace: true });
		}
	}, [location, navigate]);

	return null;
}

function AppContent() {
	const { user, loading: authLoading } = useAuth();
	const { initialize, isInitialized, error } = useBudgetStore();

	useEffect(() => {
		if (user && !isInitialized && !authLoading) {
			initialize(user.id);
		}
	}, [user, initialize, isInitialized, authLoading]);

	// Show loading state while auth or store is initializing
	if (authLoading || (!isInitialized && !error && user)) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
				<div>Loading...</div>
			</div>
		);
	}

	// Show error state if initialization failed
	if (error) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					flexDirection: 'column',
				}}
			>
				<div style={{ color: 'red', marginBottom: '1rem' }}>Failed to load application: {error}</div>
				<button onClick={() => window.location.reload()}>Retry</button>
			</div>
		);
	}

	return (
		<>
			<NavBar />
			<Routes>
				{/* Default route → Dashboard */}
				<Route path='/' element={<Navigate to='/dashboard' replace />} />
				<Route path='/dashboard' element={<DashboardPage />} />
				<Route path='/transactions' element={<TransactionPage />} />
				<Route path='/categories' element={<CategoryPage />} />
				<Route path='/shopping' element={<ShoppingPage />} />
				<Route path='/recurring' element={<RecurringPage />} />
				<Route path='/planned' element={<PlannedPage />} />
				<Route path='/family' element={<FamilyPage />} />
				<Route path='/profile' element={<ProfilePage />} />
				<Route path='/help' element={<HelpPage />} />
				{/* Fallback */}
				<Route path='*' element={<Navigate to='/dashboard' replace />} />
			</Routes>
		</>
	);
}

export default function App() {
	return (
		<AuthProvider>
			<Router basename='/finance-tracker/'>
				<GitHubPagesRedirect />
				<Routes>
					{/* Public routes */}
					<Route path='/login' element={<Login />} />
					<Route path='/accept-invite' element={<AcceptInvitation />} />

					{/* Protected routes */}
					<Route
						path='/*'
						element={
							<ProtectedRoute>
								<AppContent />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</Router>
		</AuthProvider>
	);
}
