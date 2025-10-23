import { Box, Typography, Divider, Stack } from '@mui/material';
import { useMonthYearFilter } from './hooks/useMonthYearFilter';
import { useDashboardData } from './hooks/useDashboardData';
import { useBudgetAlerts } from '../../hooks/useBudgetAlerts';
import { MonthYearFilter } from './components/MonthYearFilter';
import { SummaryCards } from './components/SummaryCards';
import { ChartsSection } from './components/ChartsSection';
import { BudgetAlertsSection } from './components/BudgetAlertsSection';

export default function DashboardView() {
	const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useMonthYearFilter();
	const { alerts } = useBudgetAlerts();

	const {
		totalIncome,
		totalExpenses,
		totalSavings,
		balance,
		availablePerDay,
		categoryBreakdown,
		incomeVsExpensesData,
		dailySpendingTrends,
		activeShoppingListsCount,
		monthlyPlannedExpensesTotal,
	} = useDashboardData(selectedMonth, selectedYear);

	return (
		<Box p={4}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				justifyContent={{ xs: 'flex-start', sm: 'space-between' }}
				alignItems='center'
				mb={1}
			>
				<Typography variant='h5'>Dashboard</Typography>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='flex-end'>
					<MonthYearFilter
						selectedMonth={selectedMonth}
						selectedYear={selectedYear}
						onMonthChange={setSelectedMonth}
						onYearChange={setSelectedYear}
					/>
				</Stack>
			</Stack>

			<Divider sx={{ mb: 3 }} />

			<SummaryCards
				totalIncome={totalIncome}
				totalExpenses={totalExpenses}
				totalSavings={totalSavings}
				balance={balance}
				availablePerDay={availablePerDay}
				activeShoppingListsCount={activeShoppingListsCount}
				monthlyPlannedExpensesTotal={monthlyPlannedExpensesTotal}
			/>

			<BudgetAlertsSection alerts={alerts} />

			<ChartsSection
				incomeVsExpensesData={incomeVsExpensesData}
				categoryBreakdown={categoryBreakdown}
				dailySpendingTrends={dailySpendingTrends}
			/>
		</Box>
	);
}
