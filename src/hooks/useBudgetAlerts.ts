import { useMemo } from 'react';
import { useBudgetStore } from '../store';

export interface BudgetAlert {
	type: 'warning' | 'danger' | 'info';
	message: string;
	expenseId?: string;
	amount?: number;
	dueDate?: string;
}

export function useBudgetAlerts() {
	const { plannedExpenses, getBalance, getAvailablePerDay } = useBudgetStore();

	const alerts = useMemo((): BudgetAlert[] => {
		const alertList: BudgetAlert[] = [];
		const currentBalance = getBalance();
		const availablePerDay = getAvailablePerDay();

		// Check for expenses due in the next 30 days
		const upcomingExpenses = plannedExpenses.filter((expense) => {
			if (expense.status === 'completed' || expense.status === 'cancelled') return false;

			const dueDate = new Date(expense.due_date);
			const today = new Date();
			const thirtyDaysFromNow = new Date();
			thirtyDaysFromNow.setDate(today.getDate() + 30);

			return dueDate >= today && dueDate <= thirtyDaysFromNow;
		});

		// Sort by due date
		upcomingExpenses.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

		// Check total upcoming expenses vs current balance
		const totalUpcoming = upcomingExpenses.reduce((sum, expense) => sum + expense.amount, 0);

		if (totalUpcoming > currentBalance) {
			alertList.push({
				type: 'danger',
				message: `Your planned expenses ($${totalUpcoming.toFixed(
					2
				)}) exceed your current balance ($${currentBalance.toFixed(2)})`,
			});
		} else if (totalUpcoming > currentBalance * 0.8) {
			alertList.push({
				type: 'warning',
				message: `Your planned expenses will use ${((totalUpcoming / currentBalance) * 100).toFixed(
					1
				)}% of your current balance`,
			});
		}

		// Check individual high-priority expenses
		upcomingExpenses.forEach((expense) => {
			if (expense.priority === 'urgent' && expense.amount > currentBalance * 0.5) {
				alertList.push({
					type: 'danger',
					message: `Urgent expense "${expense.name}" ($${expense.amount.toFixed(2)}) is ${(
						(expense.amount / currentBalance) *
						100
					).toFixed(1)}% of your balance`,
					expenseId: expense.id,
					amount: expense.amount,
					dueDate: expense.due_date,
				});
			} else if (expense.priority === 'high' && expense.amount > currentBalance * 0.3) {
				alertList.push({
					type: 'warning',
					message: `High priority expense "${expense.name}" ($${expense.amount.toFixed(2)}) due ${new Date(
						expense.due_date
					).toLocaleDateString()}`,
					expenseId: expense.id,
					amount: expense.amount,
					dueDate: expense.due_date,
				});
			}
		});

		// Check daily spending impact
		const dailyExpenseImpact = totalUpcoming / 30;
		if (dailyExpenseImpact > availablePerDay * 0.5) {
			alertList.push({
				type: 'warning',
				message: `Your planned expenses will reduce your daily available amount by ${(
					(dailyExpenseImpact / availablePerDay) *
					100
				).toFixed(1)}%`,
			});
		}

		// Check for expenses due today
		const today = new Date().toISOString().split('T')[0];
		const dueToday = upcomingExpenses.filter((expense) => expense.due_date === today);

		if (dueToday.length > 0) {
			const totalDueToday = dueToday.reduce((sum, expense) => sum + expense.amount, 0);
			alertList.push({
				type: 'info',
				message: `You have ${dueToday.length} expense(s) due today totaling $${totalDueToday.toFixed(2)}`,
			});
		}

		// Check for overdue expenses
		const overdueExpenses = plannedExpenses.filter((expense) => {
			if (expense.status === 'completed' || expense.status === 'cancelled') return false;
			return new Date(expense.due_date) < new Date();
		});

		if (overdueExpenses.length > 0) {
			const totalOverdue = overdueExpenses.reduce((sum, expense) => sum + expense.amount, 0);
			alertList.push({
				type: 'danger',
				message: `You have ${overdueExpenses.length} overdue expense(s) totaling $${totalOverdue.toFixed(2)}`,
			});
		}

		return alertList;
	}, [plannedExpenses, getBalance, getAvailablePerDay]);

	return {
		alerts,
		hasWarnings: alerts.some((alert) => alert.type === 'warning' || alert.type === 'danger'),
		hasDanger: alerts.some((alert) => alert.type === 'danger'),
	};
}
