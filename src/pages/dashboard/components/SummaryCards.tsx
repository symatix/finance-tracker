import { Grid, Card, CardContent, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { formatCurrency } from '../../../utils';
import { TRANSACTION_COLORS } from '../../../theme/financial-utils';

interface SummaryCardProps {
	title: ReactNode;
	value: string;
	color: string;
	borderColor: string;
}

function SummaryCard({ title, value, color, borderColor }: SummaryCardProps) {
	return (
		<Grid size={{ xs: 12, md: 2 }}>
			<Card sx={{ borderLeft: `6px solid ${borderColor}`, borderRadius: 2 }}>
				<CardContent>
					<Typography variant='subtitle2' color='text.secondary'>
						{title}
					</Typography>
					<Typography variant='h5' color={color} fontWeight='bold'>
						{value}
					</Typography>
				</CardContent>
			</Card>
		</Grid>
	);
}

interface SummaryCardsProps {
	totalIncome: number;
	totalExpenses: number;
	totalSavings: number;
	balance: number;
	availablePerDay: number;
}

export function SummaryCards({
	totalIncome,
	totalExpenses,
	totalSavings,
	balance,
	availablePerDay,
}: SummaryCardsProps) {
	return (
		<Grid container spacing={3} mb={3}>
			<SummaryCard
				title='Income'
				value={formatCurrency(totalIncome)}
				color='success.main'
				borderColor={TRANSACTION_COLORS['Income']}
			/>
			<SummaryCard
				title='Expenses'
				value={formatCurrency(totalExpenses)}
				color='error.main'
				borderColor={TRANSACTION_COLORS['Expense']}
			/>
			<SummaryCard
				title='Savings'
				value={formatCurrency(totalSavings)}
				color='info.main'
				borderColor={TRANSACTION_COLORS['Savings']}
			/>
			<SummaryCard title='Balance' value={formatCurrency(balance)} color='primary' borderColor='#0288d1' />
			<SummaryCard
				title={
					<>
						Available <small>per day</small>
					</>
				}
				value={formatCurrency(availablePerDay)}
				color='warning.main'
				borderColor='#f9a825'
			/>
		</Grid>
	);
}
