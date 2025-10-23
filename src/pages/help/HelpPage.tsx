import {
	Box,
	Typography,
	Card,
	CardContent,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Chip,
} from '@mui/material';
import {
	ExpandMore,
	Dashboard,
	Receipt,
	Category,
	ShoppingCart,
	Repeat,
	EventNote,
	AccountBalance,
	Help,
	Info,
	Warning,
	CheckCircle,
} from '@mui/icons-material';

export default function HelpPage() {
	const sections = [
		{
			title: 'Getting Started',
			icon: <Info color='primary' />,
			content: (
				<Box>
					<Typography variant='body1' paragraph>
						Welcome to FinanceTracker! This application helps you manage your personal finances by tracking
						transactions, budgeting, and planning expenses. Here's how to get started:
					</Typography>
					<List>
						<ListItem>
							<ListItemIcon>
								<CheckCircle color='success' />
							</ListItemIcon>
							<ListItemText primary='Sign in with your account to access your financial data' />
						</ListItem>
						<ListItem>
							<ListItemIcon>
								<CheckCircle color='success' />
							</ListItemIcon>
							<ListItemText primary='Set up categories to organize your transactions' />
						</ListItem>
						<ListItem>
							<ListItemIcon>
								<CheckCircle color='success' />
							</ListItemIcon>
							<ListItemText primary='Add your income and expense transactions' />
						</ListItem>
						<ListItem>
							<ListItemIcon>
								<CheckCircle color='success' />
							</ListItemIcon>
							<ListItemText primary='Monitor your budget on the dashboard' />
						</ListItem>
					</List>
				</Box>
			),
		},
		{
			title: 'Dashboard',
			icon: <Dashboard color='primary' />,
			content: (
				<Box>
					<Typography variant='body1' paragraph>
						The dashboard provides an overview of your financial health with key metrics and visualizations.
					</Typography>
					<Typography variant='h6' gutterBottom>
						Summary Cards:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Income - Total income for the selected month' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Expenses - Total expenses for the selected month' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Savings - Total savings for the selected month' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Balance - Net balance (Income - Expenses)' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Available per day - Remaining balance divided by days left in month' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Active Shopping Lists - Number of incomplete shopping lists' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Planned Expenses - Total planned expenses for the selected month' />
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						Charts:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Income vs Expenses - Bar chart showing monthly totals' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Daily Spending Trends - Line chart showing daily income and expenses' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Expense Breakdown - Pie chart showing expenses by category' />
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						Budget Alerts:
					</Typography>
					<Typography variant='body2' paragraph>
						The dashboard displays important budget alerts including upcoming expenses, balance warnings,
						and overdue payments.
					</Typography>
				</Box>
			),
		},
		{
			title: 'Transactions',
			icon: <Receipt color='primary' />,
			content: (
				<Box>
					<Typography variant='body1' paragraph>
						Track all your income and expenses in the Transactions section.
					</Typography>
					<Typography variant='h6' gutterBottom>
						How to add a transaction:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary="Click 'Add <Transaction type>' button" />
						</ListItem>
						<ListItem>
							<ListItemText primary='Choose a category and subcategory' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Enter amount' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Add optional note' />
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						Features:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Filter by date range, type, or category' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Edit or delete existing transactions' />
						</ListItem>
						<ListItem>
							<ListItemText primary='View transaction history with pagination' />
						</ListItem>
					</List>
				</Box>
			),
		},
		{
			title: 'Categories',
			icon: <Category color='primary' />,
			content: (
				<Box>
					<Typography variant='body1' paragraph>
						Categories help organize your transactions. Each category has a type (Income, Expense, or
						Savings) and can have subcategories.
					</Typography>
					<Typography variant='h6' gutterBottom>
						Managing Categories:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Add new categories with name and type' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Create subcategories under existing categories' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Edit category names and types' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Delete categories (only if no transactions use them)' />
						</ListItem>
					</List>
					<Typography variant='body2' color='text.secondary'>
						Note: Categories cannot be deleted if they have associated transactions.
					</Typography>
				</Box>
			),
		},
		{
			title: 'Shopping Lists',
			icon: <ShoppingCart color='primary' />,
			content: (
				<Box>
					<Typography variant='body1' paragraph>
						Create and manage shopping lists to track planned purchases and convert them to expenses when
						completed.
					</Typography>
					<Typography variant='h6' gutterBottom>
						Creating Shopping Lists:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary="Click 'Create List' to start a new shopping list" />
						</ListItem>
						<ListItem>
							<ListItemText primary='Add items with name, quantity, and estimated price' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Assign to a category for proper expense tracking' />
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						Managing Lists:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Mark items as purchased or edit quantities' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Complete the entire list to convert to a transaction' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Filter lists by status (active/completed)' />
						</ListItem>
					</List>
				</Box>
			),
		},
		{
			title: 'Recurring Transactions',
			icon: <Repeat color='primary' />,
			content: (
				<Box>
					<Typography variant='body1' paragraph>
						Set up automatic recurring transactions for regular income or expenses that repeat on a
						schedule.
					</Typography>
					<Typography variant='h6' gutterBottom>
						Setting up Recurring Transactions:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Choose frequency: Daily, Weekly, Monthly, or Yearly' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Set start date and optional end date' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Configure amount, category, and description' />
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						Automation:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='System automatically creates transactions on due dates' />
						</ListItem>
						<ListItem>
							<ListItemText primary='View next due date for each recurring transaction' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Pause or resume recurring transactions' />
						</ListItem>
					</List>
				</Box>
			),
		},
		{
			title: 'Planned Expenses',
			icon: <EventNote color='primary' />,
			content: (
				<Box>
					<Typography variant='body1' paragraph>
						Plan and track upcoming expenses to better manage your budget and avoid surprises.
					</Typography>
					<Typography variant='h6' gutterBottom>
						Creating Planned Expenses:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Set expense name, amount, and due date' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Assign priority: Low, Medium, High, or Urgent' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Choose category and add notes' />
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						Status Management:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Track status: Pending, Completed, or Cancelled' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Convert planned expenses to actual transactions' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Receive budget alerts for upcoming due dates' />
						</ListItem>
					</List>
				</Box>
			),
		},
		{
			title: 'Budget Alerts',
			icon: <Warning color='primary' />,
			content: (
				<Box>
					<Typography variant='body1' paragraph>
						The system automatically monitors your finances and provides important alerts and warnings.
					</Typography>
					<Typography variant='h6' gutterBottom>
						Alert Types:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Balance Warnings - When planned expenses exceed available funds' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Upcoming Expenses - Notifications for expenses due soon' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Overdue Payments - Alerts for missed expense due dates' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Daily Spending Impact - Warnings about budget constraints' />
						</ListItem>
					</List>
					<Typography variant='body2' color='text.secondary'>
						Alerts appear on the dashboard and help you make informed financial decisions.
					</Typography>
				</Box>
			),
		},
		{
			title: 'Tips & Best Practices',
			icon: <Help color='primary' />,
			content: (
				<Box>
					<Typography variant='h6' gutterBottom>
						Organization:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Use consistent category names and subcategories' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Set up recurring transactions for regular income/expenses' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Plan major expenses in advance using Planned Expenses' />
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						Budgeting:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Monitor your daily available amount on the dashboard' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Review budget alerts regularly' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Use shopping lists for planned purchases' />
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						Data Management:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Regularly review and categorize transactions' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Keep transaction notes descriptive' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Archive old data if needed (contact support)' />
						</ListItem>
					</List>
				</Box>
			),
		},
	];

	return (
		<Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
			<Box sx={{ mb: 4, textAlign: 'center' }}>
				<AccountBalance sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }} />
				<Typography variant='h3' component='h1' gutterBottom fontWeight='bold'>
					FinanceTracker Help & Guide
				</Typography>
				<Typography variant='h6' color='text.secondary'>
					Complete guide to managing your personal finances
				</Typography>
			</Box>

			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant='body1' paragraph>
						This comprehensive guide covers all features and functionalities of FinanceTracker. Use the
						expandable sections below to learn about specific features and how to use them effectively.
					</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
						<Chip label='Dashboard' size='small' color='primary' variant='outlined' />
						<Chip label='Transactions' size='small' color='primary' variant='outlined' />
						<Chip label='Categories' size='small' color='primary' variant='outlined' />
						<Chip label='Shopping Lists' size='small' color='primary' variant='outlined' />
						<Chip label='Recurring Transactions' size='small' color='primary' variant='outlined' />
						<Chip label='Planned Expenses' size='small' color='primary' variant='outlined' />
						<Chip label='Budget Alerts' size='small' color='primary' variant='outlined' />
					</Box>
				</CardContent>
			</Card>

			{sections.map((section, index) => (
				<Card key={index} sx={{ mb: 2 }}>
					<Accordion>
						<AccordionSummary
							expandIcon={<ExpandMore />}
							aria-controls={`panel${index}-content`}
							id={`panel${index}-header`}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								{section.icon}
								<Typography variant='h5' fontWeight='600'>
									{section.title}
								</Typography>
							</Box>
						</AccordionSummary>
						<AccordionDetails>{section.content}</AccordionDetails>
					</Accordion>
				</Card>
			))}

			<Card sx={{ mt: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
				<CardContent>
					<Typography variant='h6' gutterBottom>
						Need More Help?
					</Typography>
					<Typography variant='body2'>
						If you have questions or need assistance, please check the specific feature documentation above
						or contact support. Remember to regularly review your transactions and budget to maintain
						financial health.
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
}
