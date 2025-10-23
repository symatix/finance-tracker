import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Stack,
	Box,
	IconButton,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Menu,
	MenuItem,
	useTheme,
	useMediaQuery,
} from '@mui/material';
import { AccountBalance, Menu as MenuIcon, Logout, Person, KeyboardArrowDown } from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const NavBar = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
	const { signOut, user } = useAuth();

	const navItems = [
		{ label: 'Dashboard', path: '/dashboard' },
		{ label: 'Transactions', path: '/transactions' },
		{ label: 'Categories', path: '/categories' },
		{ label: 'Shopping', path: '/shopping' },
	];

	const handleDrawerToggle = () => {
		setDrawerOpen(!drawerOpen);
	};

	const handleDrawerClose = () => {
		setDrawerOpen(false);
	};

	const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setUserMenuAnchor(event.currentTarget);
	};

	const handleUserMenuClose = () => {
		setUserMenuAnchor(null);
	};

	const handleLogout = async () => {
		handleUserMenuClose();
		await signOut();
		navigate('/login');
	};

	const drawer = (
		<Box onClick={handleDrawerClose} sx={{ textAlign: 'center' }}>
			<Typography variant='h6' sx={{ my: 2, fontWeight: 700 }}>
				FinanceTracker
			</Typography>
			<Typography variant='body2' sx={{ mb: 2, color: 'text.secondary' }}>
				{user?.email}
			</Typography>
			<List>
				{navItems.map((item) => (
					<ListItem key={item.path} disablePadding>
						<ListItemButton
							component={Link}
							to={item.path}
							sx={{
								textAlign: 'center',
								backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
								color: location.pathname === item.path ? 'primary.contrastText' : 'text.primary',
								'&:hover': {
									backgroundColor: location.pathname === item.path ? 'primary.dark' : 'action.hover',
								},
							}}
						>
							<ListItemText primary={item.label} />
						</ListItemButton>
					</ListItem>
				))}
				<ListItem disablePadding>
					<ListItemButton
						onClick={handleLogout}
						sx={{
							textAlign: 'center',
							color: 'error.main',
							'&:hover': {
								backgroundColor: 'error.light',
								color: 'error.contrastText',
							},
						}}
					>
						<Logout sx={{ mr: 1 }} />
						<ListItemText primary='Logout' />
					</ListItemButton>
				</ListItem>
			</List>
		</Box>
	);

	return (
		<>
			<AppBar
				position='static'
				elevation={0}
				sx={{
					backgroundColor: 'background.paper',
					borderBottom: '1px solid',
					borderColor: 'divider',
					color: 'text.primary',
				}}
			>
				<Toolbar sx={{ minHeight: '64px', px: { xs: 2, md: 4 } }}>
					{/* Service Name */}
					<Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
						<AccountBalance sx={{ mr: 2, fontSize: '1.75rem', color: 'primary.main' }} />
						<Typography
							variant='h6'
							sx={{
								fontWeight: 600,
								letterSpacing: '-0.01em',
								color: 'text.primary',
							}}
						>
							FinanceTracker
						</Typography>
					</Box>

					{/* Desktop Navigation */}
					{!isMobile && (
						<Stack direction='row' spacing={0} alignItems='center'>
							{navItems.map((item) => (
								<Button
									key={item.path}
									variant='text'
									color='inherit'
									component={Link}
									to={item.path}
									sx={{
										borderRadius: 0,
										fontWeight: 500,
										px: 2,
										py: 1.5,
										textTransform: 'none',
										fontSize: '0.875rem',
										position: 'relative',
										color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
										borderBottom: location.pathname === item.path ? 2 : 0,
										borderBottomColor: 'primary.main',
										borderBottomStyle: 'solid',
										minHeight: 'auto',
										'&:hover': {
											backgroundColor: 'action.hover',
											color: 'text.primary',
										},
									}}
								>
									{item.label}
								</Button>
							))}

							{/* User Menu */}
							<Button
								onClick={handleUserMenuOpen}
								sx={{
									ml: 2,
									borderRadius: 1,
									fontWeight: 500,
									px: 2,
									py: 1,
									textTransform: 'none',
									fontSize: '0.875rem',
									color: 'text.secondary',
									minHeight: 'auto',
									border: '1px solid',
									borderColor: 'divider',
									'&:hover': {
										backgroundColor: 'action.hover',
										borderColor: 'action.hover',
									},
								}}
								endIcon={<KeyboardArrowDown />}
							>
								<Person sx={{ mr: 1, fontSize: '1rem' }} />
								{user?.email?.split('@')[0]}
							</Button>
							<Menu
								anchorEl={userMenuAnchor}
								open={Boolean(userMenuAnchor)}
								onClose={handleUserMenuClose}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'right',
								}}
								transformOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								PaperProps={{
									sx: {
										minWidth: 200,
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: 1,
										boxShadow: theme.shadows[8],
									},
								}}
							>
								<MenuItem disabled sx={{ opacity: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
									<Person sx={{ mr: 1, fontSize: '1rem' }} />
									{user?.email}
								</MenuItem>
								<MenuItem onClick={handleLogout} sx={{ fontSize: '0.875rem' }}>
									<Logout sx={{ mr: 1, fontSize: '1rem' }} />
									Sign out
								</MenuItem>
							</Menu>
						</Stack>
					)}

					{/* Mobile Navigation */}
					{isMobile && (
						<IconButton
							color='inherit'
							aria-label='open drawer'
							edge='start'
							onClick={handleDrawerToggle}
							sx={{ ml: 2 }}
						>
							<MenuIcon />
						</IconButton>
					)}
				</Toolbar>
			</AppBar>

			{/* Mobile Drawer */}
			<Drawer
				variant='temporary'
				open={drawerOpen}
				onClose={handleDrawerToggle}
				ModalProps={{
					keepMounted: true, // Better open performance on mobile.
				}}
				sx={{
					display: { xs: 'block', md: 'none' },
					'& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
				}}
			>
				{drawer}
			</Drawer>
		</>
	);
};
