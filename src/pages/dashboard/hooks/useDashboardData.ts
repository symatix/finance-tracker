import { useMemo } from 'react';
import { useBudgetStore } from '../../../store';
import type { TransactionType } from '../../../store';

export function useDashboardData(selectedMonth: number, selectedYear: number) {
	const { transactions, categories, getAvailablePerDay } = useBudgetStore();

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
	};
}
