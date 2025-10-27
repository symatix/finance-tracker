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
	CheckCircle,
	Group,
	PersonAdd,
	AdminPanelSettings,
	Email,
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
			title: 'Account Management & Collaboration',
			icon: <Group color='primary' />,
			content: (
				<Box>
					<Typography variant='body1' paragraph>
						FinanceTracker supports multi-user collaboration through shared accounts (families/households).
						Invite family members to collaborate on financial management with role-based permissions.
					</Typography>
					<Typography variant='h6' gutterBottom>
						Creating Accounts:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='Create a new account (family/household) from the Account Management page' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Set account name and description' />
						</ListItem>
						<ListItem>
							<ListItemText primary='You become the account owner with full permissions' />
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						User Roles & Permissions:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemIcon>
								<AdminPanelSettings color='primary' />
							</ListItemIcon>
							<ListItemText
								primary='Owner - Full control, manage members, edit/delete account'
								secondary='Can invite new members, change roles, delete the account'
							/>
						</ListItem>
						<ListItem>
							<ListItemIcon>
								<AdminPanelSettings color='secondary' />
							</ListItemIcon>
							<ListItemText
								primary='Admin - Manage members and content'
								secondary='Can invite members, manage transactions, but cannot delete account'
							/>
						</ListItem>
						<ListItem>
							<ListItemText
								primary='Member - Read/write access'
								secondary='Can view and create transactions, shopping lists, etc.'
							/>
						</ListItem>
						<ListItem>
							<ListItemText
								primary='Viewer - Read-only access'
								secondary='Can view all data but cannot make changes'
							/>
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						Inviting Members:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemIcon>
								<PersonAdd color='primary' />
							</ListItemIcon>
							<ListItemText primary='Click "Add Member" to send email invitations' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Choose appropriate role for each invitee' />
						</ListItem>
						<ListItem>
							<ListItemIcon>
								<Email color='primary' />
							</ListItemIcon>
							<ListItemText primary='Secure email invitations with 7-day expiration' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Recipients click invitation link to join' />
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						Managing Members:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText primary='View all account members in a table format' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Change member roles (owner/admin only)' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Remove members from the account' />
						</ListItem>
						<ListItem>
							<ListItemText primary='Monitor pending invitations' />
						</ListItem>
					</List>
					<Typography variant='h6' gutterBottom>
						Shared vs Private Data:
					</Typography>
					<List dense>
						<ListItem>
							<ListItemText
								primary='Shared Resources - Categories, transactions, lists accessible to all members'
								secondary='Based on account membership and role permissions'
							/>
						</ListItem>
						<ListItem>
							<ListItemText
								primary='Private Resources - Personal categories remain creator-only'
								secondary='Only the creator can view/edit their private items'
							/>
						</ListItem>
					</List>
					<Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
						Note: Account owners can edit account details and delete the entire account. All members will
						lose access to shared resources when an account is deleted.
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
						<Chip label='Account Management' size='small' color='primary' variant='outlined' />
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
