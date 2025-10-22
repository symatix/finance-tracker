import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { TransactionType } from '../store';
import { formatCurrency } from '../utils';

export const TRANSACTION_COLORS: Record<TransactionType, string> = {
	Savings: '#0066cc', // Bright blue for Savings
	Income: '#4CAF50', // Bright green for Income
	Expense: '#F44336', // Bright red for Expenses
};

// Hook to get financial colors from theme
export const useFinancialColors = () => {
	const theme = useTheme();
	return theme.palette.financial;
};

// Utility function to get color based on transaction type
export const getTransactionColor = (type: TransactionType, theme: Theme) => {
	return theme.palette.financial[type];
};

// Utility function to format currency with proper styling
export const formatCurrencyByType = (amount: number, type?: TransactionType) => {
	const formatted = formatCurrency(amount);

	return type === 'Expense' ? `-${formatted}` : formatted;
};

// Utility function to get amount display with color
export const getAmountDisplay = (amount: number, type: TransactionType) => {
	return {
		value: formatCurrencyByType(amount, type),
		color: TRANSACTION_COLORS[type],
		fontWeight: 600,
	};
};

export default {
	useFinancialColors,
	getTransactionColor,
	formatCurrencyByType,
	getAmountDisplay,
};
