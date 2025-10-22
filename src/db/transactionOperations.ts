import { supabase } from './supabase';
import type { TransactionDocument, CreateTransactionInput, UpdateTransactionInput } from './schemas';

export class TransactionOperations {
	// Create a new transaction
	static async create(transactionData: CreateTransactionInput): Promise<TransactionDocument> {
		const now = new Date().toISOString();

		const { data, error } = await supabase
			.from('transactions')
			.insert({
				...transactionData,
				created_at: now,
				updated_at: now,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	// Get all transactions
	static async findAll(userId: string): Promise<TransactionDocument[]> {
		const { data, error } = await supabase
			.from('transactions')
			.select('*')
			.eq('user_id', userId)
			.order('date', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Get transaction by ID
	static async findById(id: string, userId: string): Promise<TransactionDocument | null> {
		const { data, error } = await supabase
			.from('transactions')
			.select('*')
			.eq('id', id)
			.eq('user_id', userId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Get transactions by date range
	static async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<TransactionDocument[]> {
		const { data, error } = await supabase
			.from('transactions')
			.select('*')
			.eq('user_id', userId)
			.gte('date', startDate.toISOString())
			.lte('date', endDate.toISOString())
			.order('date', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Get transactions by category
	static async findByCategory(userId: string, categoryId: string): Promise<TransactionDocument[]> {
		const { data, error } = await supabase
			.from('transactions')
			.select('*')
			.eq('user_id', userId)
			.eq('category_id', categoryId)
			.order('date', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Get transactions by type
	static async findByType(userId: string, type: 'Income' | 'Expense' | 'Savings'): Promise<TransactionDocument[]> {
		const { data, error } = await supabase
			.from('transactions')
			.select('*')
			.eq('user_id', userId)
			.eq('type', type)
			.order('date', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Get transactions by month and year
	static async findByMonthYear(userId: string, month: number, year: number): Promise<TransactionDocument[]> {
		const startDate = new Date(year, month - 1, 1).toISOString();
		const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

		const { data, error } = await supabase
			.from('transactions')
			.select('*')
			.eq('user_id', userId)
			.gte('date', startDate)
			.lte('date', endDate)
			.order('date', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Update transaction
	static async update(
		id: string,
		updateData: UpdateTransactionInput,
		userId: string
	): Promise<TransactionDocument | null> {
		const { data, error } = await supabase
			.from('transactions')
			.update({
				...updateData,
				updated_at: new Date().toISOString(),
			})
			.eq('id', id)
			.eq('user_id', userId)
			.select()
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Delete transaction
	static async delete(id: string, userId: string): Promise<boolean> {
		const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);

		if (error) throw error;
		return true;
	}

	// Get transaction summary by date range
	static async getSummaryByDateRange(
		userId: string,
		startDate: Date,
		endDate: Date
	): Promise<{
		totalIncome: number;
		totalExpense: number;
		totalSavings: number;
		netAmount: number;
	}> {
		const { data, error } = await supabase
			.from('transactions')
			.select('type, amount')
			.eq('user_id', userId)
			.gte('date', startDate.toISOString())
			.lte('date', endDate.toISOString());

		if (error) throw error;

		const summary = {
			totalIncome: 0,
			totalExpense: 0,
			totalSavings: 0,
			netAmount: 0,
		};

		data?.forEach((transaction: { type: string; amount: number }) => {
			switch (transaction.type) {
				case 'Income':
					summary.totalIncome += transaction.amount;
					break;
				case 'Expense':
					summary.totalExpense += transaction.amount;
					break;
				case 'Savings':
					summary.totalSavings += transaction.amount;
					break;
			}
		});

		summary.netAmount = summary.totalIncome - summary.totalExpense - summary.totalSavings;

		return summary;
	}

	// Get transactions with category details (joined)
	static async findWithCategoryDetails(
		userId: string
	): Promise<Array<TransactionDocument & { categoryName?: string; categoryType?: string }>> {
		const { data, error } = await supabase
			.from('transactions')
			.select(
				`
				*,
				categories (
					name,
					type
				)
			`
			)
			.eq('user_id', userId)
			.order('date', { ascending: false });

		if (error) throw error;

		// Transform the nested category data to flat structure
		return (data || []).map(
			(transaction: TransactionDocument & { categories?: { name: string; type: string } }) => ({
				...transaction,
				categoryName: transaction.categories?.name,
				categoryType: transaction.categories?.type,
			})
		);
	}
}
