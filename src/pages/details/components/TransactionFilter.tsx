import { Stack, Select, MenuItem, InputLabel, FormControl, TextField, Button } from '@mui/material';
import { FilterListOff } from '@mui/icons-material';
import { type Category } from '../../../store/store';
import { type FilterState } from '../hooks/useTransactionFilter';

interface TransactionFilterProps {
	filters: FilterState;
	categories: Category[];
	onFilterChange: (key: keyof FilterState, value: string) => void;
	onClearFilters: () => void;
}

export function TransactionFilter({ filters, categories, onFilterChange, onClearFilters }: TransactionFilterProps) {
	const hasActiveFilters = Object.values(filters).some((value) => value !== '');

	return (
		<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems='flex-end' mb={3}>
			<FormControl size='small' sx={{ minWidth: 120 }}>
				<InputLabel>Type</InputLabel>
				<Select value={filters.type} onChange={(e) => onFilterChange('type', e.target.value)} label='Type'>
					<MenuItem value=''>All</MenuItem>
					<MenuItem value='Income'>Income</MenuItem>
					<MenuItem value='Expense'>Expense</MenuItem>
					<MenuItem value='Savings'>Savings</MenuItem>
				</Select>
			</FormControl>

			<FormControl size='small' sx={{ minWidth: 150 }}>
				<InputLabel>Category</InputLabel>
				<Select
					value={filters.category}
					onChange={(e) => onFilterChange('category', e.target.value)}
					label='Category'
				>
					<MenuItem value=''>All</MenuItem>
					{categories.map((c) => (
						<MenuItem key={c.id} value={c.id}>
							{c.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<TextField
				label='From'
				type='date'
				size='small'
				InputLabelProps={{ shrink: true }}
				value={filters.dateFrom}
				onChange={(e) => onFilterChange('dateFrom', e.target.value)}
			/>

			<TextField
				label='To'
				type='date'
				size='small'
				InputLabelProps={{ shrink: true }}
				value={filters.dateTo}
				onChange={(e) => onFilterChange('dateTo', e.target.value)}
			/>

			<TextField
				label='Min Amount'
				type='number'
				size='small'
				value={filters.minAmount}
				onChange={(e) => onFilterChange('minAmount', e.target.value)}
			/>

			<TextField
				label='Max Amount'
				type='number'
				size='small'
				value={filters.maxAmount}
				onChange={(e) => onFilterChange('maxAmount', e.target.value)}
			/>

			{hasActiveFilters && (
				<Button variant='outlined' startIcon={<FilterListOff />} onClick={onClearFilters} size='small'>
					Clear
				</Button>
			)}
		</Stack>
	);
}
