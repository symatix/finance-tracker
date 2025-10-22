import { Card, Typography, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CHART_COLORS } from '../constants/dashboardConstants';
import { formatCurrency } from '../../../utils';

interface ChartsSectionProps {
	incomeVsExpensesData: Array<{ name: string; amount: number }>;
	categoryBreakdown: Array<{ name: string; value: number }>;
}

export function ChartsSection({ incomeVsExpensesData, categoryBreakdown }: ChartsSectionProps) {
	return (
		<Card sx={{ p: 2, mb: 3 }}>
			<Grid container spacing={4}>
				<Grid size={6}>
					<Typography variant='h6' fontWeight='bold' mb={2}>
						Income vs Expenses
					</Typography>
					<ResponsiveContainer width='100%' height={250}>
						<BarChart data={incomeVsExpensesData}>
							<XAxis dataKey='name' />
							<YAxis />
							<Tooltip />
							<Bar dataKey='amount' fill='#1976d2' radius={[6, 6, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</Grid>
				<Grid size={6}>
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
