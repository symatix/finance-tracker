import { useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { AuthProvider } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import { useAuth } from './hooks/useAuth';
import { useBudgetStore } from './store';

const DashboardPage = lazy(() => import('./pages/dashboard'));
const TransactionPage = lazy(() => import('./pages/details'));
const CategoryPage = lazy(() => import('./pages/category'));

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
				<Routes>
					{/* Public login route */}
					<Route path='/login' element={<Login />} />

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
