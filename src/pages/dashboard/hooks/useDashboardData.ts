import { useMemo } from 'react';
import { useBudgetStore } from '../../../store';
import type { TransactionType } from '../../../store';
import { useDashboardMetrics } from './useDashboardMetrics';

export function useDashboardData(selectedMonth: number, selectedYear: number) {
	const { transactions, categories, getAvailablePerDay } = useBudgetStore();
	const {
		activeShoppingListsCount,
		monthlyPlannedExpensesTotal,
		loading: metricsLoading,
	} = useDashboardMetrics(selectedMonth, selectedYear);

	// Filter transactions by month & year
	const filteredTransactions = useMemo(() => {
		return transactions.filter((t) => {
			const date = new Date(t.date);
			return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
		});
	}, [transactions, selectedMonth, selectedYear]);

	// Aggregate totals
	const getTotalAmount = (type: TransactionType) =>
		filteredTransactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);

	const totalIncome = getTotalAmount('Income');
	const totalExpenses = getTotalAmount('Expense');
	const totalSavings = getTotalAmount('Savings');
	const balance = totalIncome - totalExpenses;
	const availablePerDay = getAvailablePerDay();

	// Expense breakdown by category
	const categoryBreakdown = useMemo(() => {
		const map = new Map<string, number>();
		filteredTransactions
			.filter((t) => t.type === 'Expense')
			.forEach((t) => {
				const categoryName = categories.find((c) => c.id === t.categoryId)?.name ?? 'Uncategorized';
				map.set(categoryName, (map.get(categoryName) ?? 0) + t.amount);
			});
		return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
	}, [filteredTransactions, categories]);

	// Daily spending trends for the selected month
	const dailySpendingTrends = useMemo(() => {
		const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
		const dailyData = [];

		for (let day = 1; day <= daysInMonth; day++) {
			const dayTransactions = filteredTransactions.filter((t) => {
				const date = new Date(t.date);
				return date.getDate() === day;
			});

			const dayIncome = dayTransactions.filter((t) => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
			const dayExpenses = dayTransactions
				.filter((t) => t.type === 'Expense')
				.reduce((sum, t) => sum + t.amount, 0);

			dailyData.push({
				day: day.toString(),
				income: dayIncome,
				expenses: dayExpenses,
				balance: dayIncome - dayExpenses,
			});
		}

		return dailyData;
	}, [filteredTransactions, selectedMonth, selectedYear]);

	// Burn down chart - cumulative balance over time
	const burnDownData = useMemo(() => {
		const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
		const burnDown = [];
		let cumulativeBalance = 0;

		for (let day = 1; day <= daysInMonth; day++) {
			const dayTransactions = filteredTransactions.filter((t) => {
				const date = new Date(t.date);
				return date.getDate() === day;
			});

			const dayIncome = dayTransactions.filter((t) => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
			const dayExpenses = dayTransactions
				.filter((t) => t.type === 'Expense')
				.reduce((sum, t) => sum + t.amount, 0);

			cumulativeBalance += dayIncome - dayExpenses;

			burnDown.push({
				day: day.toString(),
				balance: cumulativeBalance,
			});
		}

		return burnDown;
	}, [filteredTransactions, selectedMonth, selectedYear]);

	// Chart data for income vs expenses
	const incomeVsExpensesData = useMemo(
		() => [
			{ name: 'Income', amount: totalIncome },
			{ name: 'Expenses', amount: totalExpenses },
			{ name: 'Savings', amount: totalSavings },
		],
		[totalIncome, totalExpenses, totalSavings]
	);

	return {
		filteredTransactions,
		totalIncome,
		totalExpenses,
		totalSavings,
		balance,
		availablePerDay,
		categoryBreakdown,
		incomeVsExpensesData,
		dailySpendingTrends,
		burnDownData,
		activeShoppingListsCount,
		monthlyPlannedExpensesTotal,
		loading: metricsLoading,
	};
}
