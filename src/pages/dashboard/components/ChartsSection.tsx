import { Card, Typography, Grid } from '@mui/material';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
	LineChart,
	Line,
} from 'recharts';
import { CHART_COLORS } from '../constants/dashboardConstants';
import { formatCurrency } from '../../../utils';
import { TRANSACTION_COLORS } from '../../../theme/financial-utils';

interface ChartsSectionProps {
	incomeVsExpensesData: Array<{ name: string; amount: number }>;
	categoryBreakdown: Array<{ name: string; value: number }>;
	dailySpendingTrends: Array<{ day: string; income: number; expenses: number; balance: number }>;
}

export function ChartsSection({ incomeVsExpensesData, categoryBreakdown, dailySpendingTrends }: ChartsSectionProps) {
	return (
		<Card sx={{ p: 2, mb: 3 }}>
			<Grid container spacing={4}>
				<Grid size={{ md: 4, sm: 12 }}>
					<Typography variant='h6' fontWeight='bold' mb={2}>
						Income vs Expenses
					</Typography>
					<ResponsiveContainer width='100%' height={250}>
						<BarChart data={incomeVsExpensesData}>
							<XAxis dataKey='name' />
							<YAxis />
							<Tooltip formatter={(value: number) => formatCurrency(value)} />
							<Bar dataKey='amount' radius={[6, 6, 0, 0]}>
								{incomeVsExpensesData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={
											entry.name === 'Income'
												? TRANSACTION_COLORS.Income
												: entry.name === 'Expenses'
												? TRANSACTION_COLORS.Expense
												: TRANSACTION_COLORS.Savings
										}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</Grid>
				<Grid size={{ md: 4, sm: 12 }}>
					<Typography variant='h6' fontWeight='bold' mb={2}>
						Daily Spending Trends
					</Typography>
					<ResponsiveContainer width='100%' height={250}>
						<LineChart data={dailySpendingTrends}>
							<XAxis dataKey='day' />
							<YAxis />
							<Tooltip formatter={(value: number) => formatCurrency(value)} />
							<Legend />
							<Line type='monotone' dataKey='income' stroke='#4CAF50' strokeWidth={2} name='Income' />
							<Line type='monotone' dataKey='expenses' stroke='#F44336' strokeWidth={2} name='Expenses' />
						</LineChart>
					</ResponsiveContainer>
				</Grid>
				<Grid size={{ md: 4, sm: 12 }}>
					<Typography variant='h6' fontWeight='bold' mb={2}>
						Expense Breakdown by Category
					</Typography>
					{categoryBreakdown.length > 0 ? (
						<ResponsiveContainer width='100%' height={300}>
							<PieChart>
								<Pie
									data={categoryBreakdown}
									dataKey='value'
									nameKey='name'
									cx='50%'
									cy='50%'
									outerRadius={100}
									label
								>
									{categoryBreakdown.map((_, index) => (
										<Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
									))}
								</Pie>
								<Tooltip formatter={(value: number) => formatCurrency(value)} />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					) : (
						<Typography color='text.secondary'>No Expenses for this month</Typography>
					)}
				</Grid>
			</Grid>
		</Card>
	);
}
