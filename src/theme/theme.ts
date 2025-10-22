import { createTheme } from '@mui/material/styles';

// Extend the theme interface to include custom financial colors
declare module '@mui/material/styles' {
	interface Palette {
		financial: {
			Income: string;
			Expense: string;
			Savings: string;
			neutral: string;
			profit: string;
			loss: string;
		};
	}

	interface PaletteOptions {
		financial?: {
			Income?: string;
			Expense?: string;
			Savings?: string;
			neutral?: string;
			profit?: string;
			loss?: string;
		};
	}
}

// Azure Portal inspired theme - Professional, clean, and business-focused
const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#0078D4', // Azure's signature blue
			light: '#1890FF',
			dark: '#005A9E',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#106EBE', // Darker blue for secondary actions
			light: '#3A96DD',
			dark: '#004578',
			contrastText: '#ffffff',
		},
		error: {
			main: '#D13438', // Azure's red
			light: '#F1707B',
			dark: '#A4262C',
		},
		warning: {
			main: '#FF8C00', // Azure's orange
			light: '#FFB833',
			dark: '#D26900',
		},
		info: {
			main: '#0078D4', // Same as primary for consistency
			light: '#1890FF',
			dark: '#005A9E',
		},
		success: {
			main: '#107C10', // Azure's green
			light: '#4CAF50',
			dark: '#0B5A0B',
		},
		background: {
			default: '#0F0F0F', // Dark background like Azure dark mode
			paper: '#1A1A1A', // Dark surface for cards and surfaces
		},
		text: {
			primary: '#FFFFFF', // Light text for dark backgrounds
			secondary: '#CCCCCC', // Light gray for secondary text
		},
		divider: '#3A3A3A', // Dark gray dividers
		financial: {
			Savings: '#0078D4', // Azure blue for Savings
			Income: '#107C10', // Azure green for Income
			Expense: '#D13438', // Azure red for Expenses
			neutral: '#CCCCCC', // Light gray for neutral/transfers
			profit: '#107C10', // Green for profits
			loss: '#D13438', // Red for losses
		},
		grey: {
			50: '#FAFAFA',
			100: '#F3F2F1',
			200: '#EDEBE9',
			300: '#E1DFDD',
			400: '#D2D0CE',
			500: '#C8C6C4',
			600: '#A19F9D',
			700: '#979593',
			800: '#605E5C',
			900: '#323130',
		},
	},
	typography: {
		fontFamily:
			'"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue", sans-serif',
		h1: {
			fontWeight: 600,
			fontSize: '2.25rem',
			letterSpacing: '-0.02em',
			color: '#FFFFFF',
		},
		h2: {
			fontWeight: 600,
			fontSize: '1.875rem',
			letterSpacing: '-0.01em',
			color: '#FFFFFF',
		},
		h3: {
			fontWeight: 600,
			fontSize: '1.5rem',
			letterSpacing: '-0.01em',
			color: '#FFFFFF',
		},
		h4: {
			fontWeight: 600,
			fontSize: '1.25rem',
			letterSpacing: '-0.01em',
			color: '#FFFFFF',
		},
		h5: {
			fontWeight: 600,
			fontSize: '1.125rem',
			letterSpacing: '-0.01em',
			color: '#FFFFFF',
		},
		h6: {
			fontWeight: 600,
			fontSize: '1rem',
			letterSpacing: '0em',
			color: '#FFFFFF',
		},
		body1: {
			fontSize: '1rem',
			lineHeight: 1.5,
			color: '#FFFFFF',
		},
		body2: {
			fontSize: '0.875rem',
			lineHeight: 1.4,
			color: '#CCCCCC',
		},
		button: {
			fontWeight: 600,
			fontSize: '0.9375rem',
			letterSpacing: '0.02em',
			textTransform: 'none',
		},
		caption: {
			fontSize: '0.8125rem',
			color: '#CCCCCC',
		},
	},
	shape: {
		borderRadius: 2, // Azure uses minimal border radius
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: {
					backgroundColor: '#0F0F0F',
					color: '#FFFFFF',
					fontFamily:
						'"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue", sans-serif',
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: '#1A1A1A',
					borderBottom: '1px solid #3A3A3A',
					boxShadow: 'none',
					color: '#FFFFFF',
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					backgroundColor: '#1A1A1A',
					border: '1px solid #3A3A3A',
					boxShadow: '0 1.6px 3.6px 0 rgba(0, 0, 0, 0.3), 0 0.3px 0.9px 0 rgba(0, 0, 0, 0.2)',
					transition: 'all 0.2s ease-in-out',
					borderRadius: 0,
					'&:hover': {
						boxShadow: '0 3.2px 7.2px 0 rgba(0, 0, 0, 0.3), 0 0.6px 1.8px 0 rgba(0, 0, 0, 0.2)',
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundColor: '#1A1A1A',
					border: '1px solid #3A3A3A',
					borderRadius: 0,
				},
			},
		},
		MuiFormControl: {
			styleOverrides: {
				root: {
					marginBottom: '16px',
					'& .MuiInputLabel-root': {
						padding: '0 4px',
						color: '#CCCCCC',
						'&.Mui-focused': {
							color: '#0078D4',
						},
						'&.MuiFormLabel-filled': {
							color: '#CCCCCC',
						},
					},
					'& .MuiOutlinedInput-root': {
						backgroundColor: '#1A1A1A',
						'& fieldset': {
							borderColor: '#3A3A3A',
							borderWidth: '1px',
						},
						'&:hover fieldset': {
							borderColor: '#555555',
						},
						'&.Mui-focused fieldset': {
							borderColor: '#0078D4',
							borderWidth: '2px',
						},
					},
					'& .MuiSelect-select': {
						color: '#FFFFFF',
					},
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					'& .MuiOutlinedInput-root': {
						backgroundColor: '#1A1A1A',
						borderRadius: 2,
						'& fieldset': {
							borderColor: '#3A3A3A',
							borderWidth: '1px',
						},
						'&:hover fieldset': {
							borderColor: '#555555',
						},
						'&.Mui-focused fieldset': {
							borderColor: '#0078D4',
							borderWidth: '2px',
						},
					},
					'& .MuiInputLabel-root': {
						color: '#CCCCCC',
						'&.Mui-focused': {
							color: '#0078D4',
						},
					},
					'& .MuiOutlinedInput-input': {
						color: '#FFFFFF',
					},
				},
			},
		},
		MuiTableContainer: {
			styleOverrides: {
				root: {
					backgroundColor: '#1A1A1A',
					border: '1px solid #3A3A3A',
					borderRadius: 2,
				},
			},
		},
		MuiTableHead: {
			styleOverrides: {
				root: {
					borderBottom: '1px solid #3A3A3A',
					'& .MuiTableRow-root': {
						backgroundColor: '#1a1a1a',
					},
					'& .MuiTableCell-head': {
						color: '#FFFFFF',
						fontWeight: 600,
						fontSize: '0.875rem',
						borderBottom: 'none',
						padding: '12px 16px',
					},
				},
			},
		},
		MuiTableRow: {
			styleOverrides: {
				root: {
					backgroundColor: '#0F0F0F',
					borderBottom: '1px solid #3A3A3A',
					'&:hover': {
						backgroundColor: '#000000',
					},
					'&:last-child': {
						borderBottom: 'none',
					},
				},
			},
		},
		MuiTableCell: {
			styleOverrides: {
				root: {
					borderColor: '#3A3A3A',
					padding: '12px 16px',
					color: '#FFFFFF',
					fontSize: '0.9375rem',
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					backgroundColor: '#2A2A2A',
					color: '#FFFFFF',
					fontWeight: 500,
					borderRadius: 2,
					height: '24px',
					fontSize: '0.75rem',
					'&:hover': {
						backgroundColor: '#3A3A3A',
					},
				},
				colorPrimary: {
					backgroundColor: '#1A3A1A',
					color: '#4CAF50',
				},
				colorSecondary: {
					backgroundColor: '#3A2A1A',
					color: '#FF8C00',
				},
			},
		},
		MuiDialog: {
			styleOverrides: {
				paper: {
					backgroundColor: '#1A1A1A',
					border: '1px solid #3A3A3A',
					boxShadow: '0 3.2px 7.2px 0 rgba(0, 0, 0, 0.3), 0 0.6px 1.8px 0 rgba(0, 0, 0, 0.2)',
					borderRadius: 2,
				},
			},
		},
		MuiDialogTitle: {
			styleOverrides: {
				root: {
					backgroundColor: '#1A1A1A',
					color: '#FFFFFF',
					fontWeight: 600,
					padding: '20px 24px 16px',
					margin: 0,
					borderBottom: '1px solid #3A3A3A',
				},
			},
		},
		MuiTabs: {
			styleOverrides: {
				indicator: {
					backgroundColor: '#0078D4',
					height: '2px',
				},
				root: {
					borderBottom: '1px solid #3A3A3A',
				},
			},
		},
		MuiTab: {
			styleOverrides: {
				root: {
					fontWeight: 600,
					textTransform: 'none',
					fontSize: '0.875rem',
					minHeight: '44px',
					color: '#CCCCCC',
					'&.Mui-selected': {
						color: '#0078D4',
					},
				},
			},
		},
		MuiDrawer: {
			styleOverrides: {
				paper: {
					backgroundColor: '#0F0F0F',
					borderRight: '1px solid #3A3A3A',
					borderLeft: '1px solid #3A3A3A',
					boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.3), 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
				},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					borderRadius: 2,
					margin: '2px 8px',
					'&:hover': {
						backgroundColor: '#2A2A2A',
					},
					'&.Mui-selected': {
						backgroundColor: 'rgba(0, 120, 212, 0.1)',
						color: '#0078D4',
						'&:hover': {
							backgroundColor: 'rgba(0, 120, 212, 0.15)',
						},
					},
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					borderRadius: 2,
					padding: '8px',
					'&:hover': {
						backgroundColor: '#2A2A2A',
					},
				},
			},
		},
		MuiMenu: {
			styleOverrides: {
				paper: {
					border: '1px solid #3A3A3A',
					borderRadius: 2,
					boxShadow: '0 3.2px 7.2px 0 rgba(0, 0, 0, 0.3), 0 0.6px 1.8px 0 rgba(0, 0, 0, 0.2)',
					backgroundColor: '#1A1A1A',
				},
			},
		},
		MuiMenuItem: {
			styleOverrides: {
				root: {
					fontSize: '0.9375rem',
					padding: '8px 16px',
					color: '#FFFFFF',
					'&:hover': {
						backgroundColor: '#2A2A2A',
					},
				},
			},
		},
	},
});

export default theme;
