import { useState } from 'react';

export function useMonthYearFilter() {
	const today = new Date();
	const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0–11
	const [selectedYear, setSelectedYear] = useState(today.getFullYear());

	return {
		selectedMonth,
		selectedYear,
		setSelectedMonth,
		setSelectedYear,
	};
}
