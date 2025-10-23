import { supabase } from './supabase';
import type {
	RecurringTransactionDocument,
	CreateRecurringTransactionInput,
	UpdateRecurringTransactionInput,
} from './schemas';

export class RecurringTransactionOperations {
	// Create a new recurring transaction
	static async create(recurringData: CreateRecurringTransactionInput): Promise<RecurringTransactionDocument> {
		const now = new Date().toISOString();

		const { data, error } = await supabase
			.from('recurring_transactions')
			.insert({
				...recurringData,
				created_at: now,
				updated_at: now,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	// Get all recurring transactions for a user
	static async findAll(userId: string): Promise<RecurringTransactionDocument[]> {
		const { data, error } = await supabase
			.from('recurring_transactions')
			.select('*')
			.eq('user_id', userId)
			.order('next_due_date', { ascending: true });

		if (error) throw error;
		return data || [];
	}

	// Get active recurring transactions for a user
	static async findActive(userId: string): Promise<RecurringTransactionDocument[]> {
		const { data, error } = await supabase
			.from('recurring_transactions')
			.select('*')
			.eq('user_id', userId)
			.eq('is_active', true)
			.order('next_due_date', { ascending: true });

		if (error) throw error;
		return data || [];
	}

	// Get recurring transaction by ID
	static async findById(id: string, userId: string): Promise<RecurringTransactionDocument | null> {
		const { data, error } = await supabase
			.from('recurring_transactions')
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

	// Get recurring transactions due soon (within next 30 days)
	static async findDueSoon(userId: string, daysAhead: number = 30): Promise<RecurringTransactionDocument[]> {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + daysAhead);

		const { data, error } = await supabase
			.from('recurring_transactions')
			.select('*')
			.eq('user_id', userId)
			.eq('is_active', true)
			.lte('next_due_date', futureDate.toISOString().split('T')[0])
			.order('next_due_date', { ascending: true });

		if (error) throw error;
		return data || [];
	}

	// Update recurring transaction
	static async update(
		id: string,
		updateData: UpdateRecurringTransactionInput,
		userId: string
	): Promise<RecurringTransactionDocument | null> {
		const { data, error } = await supabase
			.from('recurring_transactions')
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

	// Delete recurring transaction
	static async delete(id: string, userId: string): Promise<boolean> {
		const { error } = await supabase.from('recurring_transactions').delete().eq('id', id).eq('user_id', userId);

		if (error) throw error;
		return true;
	}

	// Calculate next due date based on frequency
	static calculateNextDueDate(currentDueDate: Date, frequency: string): Date {
		const nextDate = new Date(currentDueDate);

		switch (frequency) {
			case 'daily':
				nextDate.setDate(nextDate.getDate() + 1);
				break;
			case 'weekly':
				nextDate.setDate(nextDate.getDate() + 7);
				break;
			case 'monthly':
				nextDate.setMonth(nextDate.getMonth() + 1);
				break;
			case 'yearly':
				nextDate.setFullYear(nextDate.getFullYear() + 1);
				break;
			default:
				throw new Error(`Invalid frequency: ${frequency}`);
		}

		return nextDate;
	}

	// Process due recurring transactions and create actual transactions
	static async processDueTransactions(userId: string): Promise<void> {
		const today = new Date().toISOString().split('T')[0];

		// Get all active recurring transactions that are due today or earlier
		const { data: dueRecurring, error: fetchError } = await supabase
			.from('recurring_transactions')
			.select('*')
			.eq('user_id', userId)
			.eq('is_active', true)
			.lte('next_due_date', today);

		if (fetchError) throw fetchError;

		if (!dueRecurring || dueRecurring.length === 0) return;

		// Process each due recurring transaction
		for (const recurring of dueRecurring) {
			try {
				// Create the actual transaction
				const { error: transactionError } = await supabase.from('transactions').insert({
					amount: recurring.amount,
					type: recurring.type,
					category_id: recurring.category_id,
					subcategory: recurring.subcategory,
					note: recurring.note || `${recurring.name} (Recurring)`,
					date: recurring.next_due_date,
					user_id: userId,
				});

				if (transactionError) throw transactionError;

				// Calculate next due date
				const currentDueDate = new Date(recurring.next_due_date);
				const nextDueDate = this.calculateNextDueDate(currentDueDate, recurring.frequency);

				// Check if we've reached the end date
				const shouldDeactivate = recurring.end_date && nextDueDate > new Date(recurring.end_date);

				// Update the recurring transaction
				const { error: updateError } = await supabase
					.from('recurring_transactions')
					.update({
						next_due_date: nextDueDate.toISOString().split('T')[0],
						is_active: shouldDeactivate ? false : true,
						updated_at: new Date().toISOString(),
					})
					.eq('id', recurring.id);

				if (updateError) throw updateError;
			} catch (error) {
				console.error(`Failed to process recurring transaction ${recurring.id}:`, error);
				// Continue processing other transactions even if one fails
			}
		}
	}

	// Get recurring transactions with category details (joined)
	static async findWithCategoryDetails(
		userId: string
	): Promise<Array<RecurringTransactionDocument & { categoryName?: string; categoryType?: string }>> {
		const { data, error } = await supabase
			.from('recurring_transactions')
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
			.order('next_due_date', { ascending: true });

		if (error) throw error;

		// Transform the nested category data to flat structure
		return (data || []).map(
			(recurring: RecurringTransactionDocument & { categories?: { name: string; type: string } }) => ({
				...recurring,
				categoryName: recurring.categories?.name,
				categoryType: recurring.categories?.type,
			})
		);
	}
}
