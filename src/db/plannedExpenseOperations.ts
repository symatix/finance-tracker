import { supabase } from './supabase';
import type { PlannedExpenseDocument, CreatePlannedExpenseInput, UpdatePlannedExpenseInput } from './schemas';

export class PlannedExpenseOperations {
	// Create a new planned expense
	static async create(plannedExpenseData: CreatePlannedExpenseInput): Promise<PlannedExpenseDocument> {
		const now = new Date().toISOString();

		const { data, error } = await supabase
			.from('planned_expenses')
			.insert({
				...plannedExpenseData,
				created_at: now,
				updated_at: now,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	// Get all planned expenses for a user
	static async findAll(userId: string): Promise<PlannedExpenseDocument[]> {
		const { data, error } = await supabase
			.from('planned_expenses')
			.select('*')
			.eq('user_id', userId)
			.order('due_date', { ascending: true });

		if (error) throw error;
		return data || [];
	}

	// Get planned expense by ID
	static async findById(id: string, userId: string): Promise<PlannedExpenseDocument | null> {
		const { data, error } = await supabase
			.from('planned_expenses')
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

	// Get planned expenses due soon (within next N days)
	static async findDueSoon(userId: string, daysAhead: number = 30): Promise<PlannedExpenseDocument[]> {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + daysAhead);

		const { data, error } = await supabase
			.from('planned_expenses')
			.select('*')
			.eq('user_id', userId)
			.eq('status', 'planned')
			.lte('due_date', futureDate.toISOString().split('T')[0])
			.order('due_date', { ascending: true });

		if (error) throw error;
		return data || [];
	}

	// Get planned expenses by status
	static async findByStatus(userId: string, status: string): Promise<PlannedExpenseDocument[]> {
		const { data, error } = await supabase
			.from('planned_expenses')
			.select('*')
			.eq('user_id', userId)
			.eq('status', status)
			.order('due_date', { ascending: true });

		if (error) throw error;
		return data || [];
	}

	// Update planned expense
	static async update(
		id: string,
		updateData: UpdatePlannedExpenseInput,
		userId: string
	): Promise<PlannedExpenseDocument | null> {
		const { data, error } = await supabase
			.from('planned_expenses')
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

	// Delete planned expense
	static async delete(id: string, userId: string): Promise<boolean> {
		const { error } = await supabase.from('planned_expenses').delete().eq('id', id).eq('user_id', userId);

		if (error) throw error;
		return true;
	}

	// Get planned expenses with category details (joined)
	static async findWithCategoryDetails(
		userId: string
	): Promise<Array<PlannedExpenseDocument & { categoryName?: string; categoryType?: string }>> {
		const { data, error } = await supabase
			.from('planned_expenses')
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
			.order('due_date', { ascending: true });

		if (error) throw error;

		// Transform the nested category data to flat structure
		return (data || []).map(
			(planned: PlannedExpenseDocument & { categories?: { name: string; type: string } }) => ({
				...planned,
				categoryName: planned.categories?.name,
				categoryType: planned.categories?.type,
			})
		);
	}

	// Convert planned expense to transaction (when confirmed/paid)
	static async convertToTransaction(
		id: string,
		userId: string,
		actualAmount?: number,
		actualDate?: string
	): Promise<PlannedExpenseDocument | null> {
		// First get the planned expense
		const plannedExpense = await this.findById(id, userId);
		if (!plannedExpense) return null;

		// Create the transaction
		const { error: transactionError } = await supabase.from('transactions').insert({
			amount: actualAmount || plannedExpense.amount,
			type: 'Expense', // Planned expenses are typically expenses
			category_id: plannedExpense.category_id,
			subcategory: plannedExpense.subcategory,
			note: plannedExpense.note || `Planned: ${plannedExpense.name}`,
			date: actualDate || plannedExpense.due_date,
			user_id: userId,
		});

		if (transactionError) throw transactionError;

		// Update the planned expense status to completed
		return await this.update(id, { status: 'completed' }, userId);
	}
}
