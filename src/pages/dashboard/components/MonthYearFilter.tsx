import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { MONTHS, YEARS_COUNT } from '../constants/dashboardConstants';

interface MonthYearFilterProps {
	selectedMonth: number;
	selectedYear: number;
	onMonthChange: (month: number) => void;
	onYearChange: (year: number) => void;
}

export function MonthYearFilter({ selectedMonth, selectedYear, onMonthChange, onYearChange }: MonthYearFilterProps) {
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: YEARS_COUNT }, (_, i) => currentYear - i);

	return (
		<Box display='flex' gap={2} mb={3}>
			<FormControl size='small'>
				<InputLabel>Month</InputLabel>
				<Select
					value={selectedMonth}
					label='Month'
					onChange={(e) => onMonthChange(Number(e.target.value))}
					sx={{ minWidth: 150 }}
				>
					{MONTHS.map((month, index) => (
						<MenuItem key={month} value={index}>
							{month}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<FormControl size='small'>
				<InputLabel>Year</InputLabel>
				<Select
					value={selectedYear}
					label='Year'
					onChange={(e) => onYearChange(Number(e.target.value))}
					sx={{ minWidth: 120 }}
				>
					{years.map((year) => (
						<MenuItem key={year} value={year}>
							{year}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</Box>
	);
}
