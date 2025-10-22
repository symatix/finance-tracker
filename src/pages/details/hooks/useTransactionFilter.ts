import { useState, useMemo } from 'react';
import type { Transaction, TransactionType } from '../../../store';

export interface FilterState {
	category: string;
	type: TransactionType | '';
	dateFrom: string;
	dateTo: string;
	minAmount: string;
	maxAmount: string;
}

export interface SortState {
	field: 'date' | 'amount' | 'type' | 'category';
	direction: 'asc' | 'desc';
}

export function useTransactionFilter(transactions: Transaction[], getCategoryName: (id: string) => string) {
	const [filters, setFilters] = useState<FilterState>({
		category: '',
		type: '',
		dateFrom: '',
		dateTo: '',
		minAmount: '',
		maxAmount: '',
	});

	const [sort, setSort] = useState<SortState>({
		field: 'date',
		direction: 'desc',
	});

	const updateFilter = (key: keyof FilterState, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const updateSort = (field: SortState['field']) => {
		setSort((prev) => ({
			field,
			direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
		}));
	};

	const clearFilters = () => {
		setFilters({
			category: '',
			type: '',
			dateFrom: '',
			dateTo: '',
			minAmount: '',
			maxAmount: '',
		});
	};

	const filteredAndSortedTransactions = useMemo(() => {
		return transactions
			.filter((t) => (filters.category ? t.categoryId === filters.category : true))
			.filter((t) => (filters.type ? t.type === filters.type : true))
			.filter((t) => (filters.dateFrom ? new Date(t.date) >= new Date(filters.dateFrom) : true))
			.filter((t) => (filters.dateTo ? new Date(t.date) <= new Date(filters.dateTo) : true))
			.filter((t) => (filters.minAmount ? t.amount >= Number(filters.minAmount) : true))
			.filter((t) => (filters.maxAmount ? t.amount <= Number(filters.maxAmount) : true))
			.sort((a, b) => {
				let aField: string | number, bField: string | number;
				switch (sort.field) {
					case 'date':
						aField = new Date(a.date).getTime();
						bField = new Date(b.date).getTime();
						break;
					case 'amount':
						aField = a.amount;
						bField = b.amount;
						break;
					case 'type':
						aField = a.type;
						bField = b.type;
						break;
					case 'category':
						aField = getCategoryName(a.categoryId);
						bField = getCategoryName(b.categoryId);
						break;
					default:
						aField = 0;
						bField = 0;
				}
				if (aField < bField) return sort.direction === 'asc' ? -1 : 1;
				if (aField > bField) return sort.direction === 'asc' ? 1 : -1;
				return 0;
			});
	}, [transactions, filters, sort, getCategoryName]);

	return {
		filters,
		sort,
		filteredAndSortedTransactions,
		updateFilter,
		updateSort,
		clearFilters,
	};
}
