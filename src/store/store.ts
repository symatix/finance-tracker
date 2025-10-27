import { create } from 'zustand';
import {
	CategoryOperations,
	TransactionOperations,
	RecurringTransactionOperations,
	PlannedExpenseOperations,
	FamilyOperations,
	FamilyMemberOperations,
	type CategoryDocument,
	type TransactionDocument,
	type RecurringTransactionDocument,
	type PlannedExpenseDocument,
	type FamilyDocument,
	type FamilyMemberDocument,
	type CreateCategoryInput,
	type CreateTransactionInput,
	type CreateRecurringTransactionInput,
	type CreatePlannedExpenseInput,
	type CreateFamilyInput,
	type CreateFamilyMemberInput,
} from '../db';

// ---------- Types ----------
// Re-export types from database schemas for backward compatibility
export type TransactionType = 'Income' | 'Expense' | 'Savings';

export interface Transaction {
	id?: string;
	type: TransactionType;
	amount: number;
	categoryId: string;
	subcategory?: string | null;
	note?: string | null;
	date: string;
	createdBy?: string | null;
}

export interface Category {
	id: string;
	name: string;
	type: TransactionType;
	subcategories: string[];
}

export interface Settings {
	monthlyBudget: number;
	theme: 'light' | 'dark';
}

export interface BudgetState {
	transactions: Transaction[];
	categories: Category[];
	recurringTransactions: Array<RecurringTransactionDocument & { categoryName?: string; categoryType?: string }>;
	plannedExpenses: Array<PlannedExpenseDocument & { categoryName?: string; categoryType?: string }>;
	families: Array<FamilyDocument & { members?: FamilyMemberDocument[] }>;
	currentFamilyId: string | null;
	settings: Settings;
	isLoading: boolean;
	error: string | null;
	isInitialized: boolean;
}

// ---------- Store Interface ----------
export interface BudgetStore extends BudgetState {
	// Initialization
	initialize: (userId: string) => Promise<void>;

	// Transaction methods (now async)
	addTransaction: (userId: string, transaction: Omit<Transaction, 'id'>) => Promise<void>;
	updateTransaction: (userId: string, id: string, updates: Partial<Transaction>) => Promise<void>;
	deleteTransaction: (userId: string, id: string) => Promise<void>;
	loadTransactions: (userId: string) => Promise<void>;

	// Recurring transaction methods
	addRecurringTransaction: (userId: string, recurring: CreateRecurringTransactionInput) => Promise<void>;
	updateRecurringTransaction: (
		userId: string,
		id: string,
		updates: Partial<RecurringTransactionDocument>
	) => Promise<void>;
	deleteRecurringTransaction: (userId: string, id: string) => Promise<void>;
	loadRecurringTransactions: (userId: string) => Promise<void>;
	processDueRecurringTransactions: (userId: string) => Promise<void>;

	// Planned expense methods
	addPlannedExpense: (userId: string, plannedExpense: CreatePlannedExpenseInput) => Promise<void>;
	updatePlannedExpense: (userId: string, id: string, updates: Partial<PlannedExpenseDocument>) => Promise<void>;
	deletePlannedExpense: (userId: string, id: string) => Promise<void>;
	loadPlannedExpenses: (userId: string) => Promise<void>;
	convertPlannedExpenseToTransaction: (
		userId: string,
		id: string,
		actualAmount?: number,
		actualDate?: string
	) => Promise<void>;

	// Family methods
	createFamily: (family: CreateFamilyInput) => Promise<void>;
	loadFamilies: (userId: string) => Promise<void>;
	updateFamily: (id: string, updates: Partial<FamilyDocument>) => Promise<void>;
	deleteFamily: (id: string) => Promise<void>;
	setCurrentFamily: (familyId: string | null) => void;

	// Family member methods
	addFamilyMember: (member: CreateFamilyMemberInput) => Promise<void>;
	updateFamilyMember: (id: string, updates: Partial<FamilyMemberDocument>) => Promise<void>;
	removeFamilyMember: (id: string) => Promise<void>;
	addCategory: (userId: string, category: Omit<Category, 'id'>) => Promise<void>;
	updateCategory: (userId: string, id: string, updates: Partial<Category>) => Promise<void>;
	deleteCategory: (userId: string, id: string) => Promise<void>;
	loadCategories: (userId: string) => Promise<void>;

	// Subcategory methods
	addSubcategory: (userId: string, categoryId: string, subcategoryName: string) => Promise<void>;
	updateSubcategory: (userId: string, categoryId: string, oldName: string, newName: string) => Promise<void>;
	deleteSubcategory: (userId: string, categoryId: string, subcategoryName: string) => Promise<void>;

	// Computed getters (synchronous, work with loaded data)
	getTotalIncome: () => number;
	getTotalExpenses: () => number;
	getTotalSavings: () => number;
	getBalance: () => number;
	getAvailablePerDay: () => number;

	// Settings (keep synchronous for now)
	setMonthlyBudget: (amount: number) => void;
	toggleTheme: () => void;

	// Utility
	resetAll: () => Promise<void>;
	clearError: () => void;
}

// ---------- Helpers ----------
// Convert Supabase document to store format
const documentToTransaction = (doc: TransactionDocument): Transaction => ({
	id: doc.id,
	type: doc.type,
	amount: doc.amount,
	categoryId: doc.category_id,
	subcategory: doc.subcategory,
	note: doc.note,
	date: doc.date,
	createdBy: doc.created_by,
});

const documentToCategory = (doc: CategoryDocument): Category => ({
	id: doc.id,
	name: doc.name,
	type: doc.type,
	subcategories: doc.subcategories || [],
});

// ---------- Store ----------
export const useBudgetStore = create<BudgetStore>((set, get) => ({
	transactions: [],
	categories: [],
	recurringTransactions: [],
	plannedExpenses: [],
	families: [],
	currentFamilyId: null,
	settings: {
		monthlyBudget: 0,
		theme: 'light',
	},
	isLoading: false,
	error: null,
	isInitialized: false,

	// ----- Initialization -----
	initialize: async (userId: string) => {
		try {
			set({ isLoading: true, error: null });

			// Load initial data - continue even if some fail
			try {
				await get().loadCategories(userId);
			} catch (catError) {
				console.warn('Failed to load categories:', catError);
			}

			try {
				await get().loadTransactions(userId);
			} catch (transError) {
				console.warn('Failed to load transactions:', transError);
			}

			try {
				await get().loadRecurringTransactions(userId);
			} catch (recError) {
				console.warn('Failed to load recurring transactions:', recError);
			}

			try {
				await get().loadPlannedExpenses(userId);
			} catch (planError) {
				console.warn('Failed to load planned expenses:', planError);
			}

			try {
				await get().loadFamilies(userId); // Load families and auto-select current family
			} catch (famError) {
				console.warn('Failed to load families:', famError);
			}

			set({ isInitialized: true, isLoading: false });
		} catch (error) {
			console.error('Failed to initialize store:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to initialize database',
				isLoading: false,
			});
		}
	},

	// ----- Transaction Methods -----
	addTransaction: async (userId: string, transaction) => {
		try {
			set({ isLoading: true, error: null });

			const currentFamilyId = get().currentFamilyId;
			const transactionData: CreateTransactionInput = {
				user_id: userId,
				amount: transaction.amount,
				type: transaction.type,
				category_id: transaction.categoryId,
				subcategory: transaction.subcategory || null,
				note: transaction.note || '',
				date: transaction.date,
				created_by: userId,
				shared_account_id: currentFamilyId,
				is_shared: currentFamilyId !== null,
			};

			const createdDoc = await TransactionOperations.create(transactionData);
			const newTransaction = documentToTransaction(createdDoc);

			set((state) => ({
				transactions: [...state.transactions, newTransaction],
				isLoading: false,
			}));
		} catch (error) {
			console.error('Failed to add transaction:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to add transaction',
				isLoading: false,
			});
		}
	},

	updateTransaction: async (userId: string, id, updates) => {
		try {
			set({ isLoading: true, error: null });

			const updateData: Partial<CreateTransactionInput> = {};
			if (updates.amount !== undefined) updateData.amount = updates.amount;
			if (updates.type !== undefined) updateData.type = updates.type;
			if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
			if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
			if (updates.note !== undefined) updateData.note = updates.note || '';
			if (updates.date !== undefined) updateData.date = updates.date;

			const updatedDoc = await TransactionOperations.update(id, updateData, userId);
			if (updatedDoc) {
				const updatedTransaction = documentToTransaction(updatedDoc);
				set((state) => ({
					transactions: state.transactions.map((t) => (t.id === id ? updatedTransaction : t)),
					isLoading: false,
				}));
			}
		} catch (error) {
			console.error('Failed to update transaction:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to update transaction',
				isLoading: false,
			});
		}
	},

	deleteTransaction: async (userId: string, id) => {
		try {
			set({ isLoading: true, error: null });

			const success = await TransactionOperations.delete(id, userId);
			if (success) {
				set((state) => ({
					transactions: state.transactions.filter((t) => t.id !== id),
					isLoading: false,
				}));
			}
		} catch (error) {
			console.error('Failed to delete transaction:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to delete transaction',
				isLoading: false,
			});
		}
	},

	loadTransactions: async (userId: string) => {
		try {
			const transactionDocs = await TransactionOperations.findAll(userId);
			const transactions = transactionDocs.map(documentToTransaction);
			set({ transactions });
		} catch (error) {
			console.error('Failed to load transactions:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to load transactions',
			});
		}
	},

	// ----- Recurring Transaction Methods -----
	addRecurringTransaction: async (userId: string, recurring) => {
		try {
			set({ isLoading: true, error: null });

			const currentFamilyId = get().currentFamilyId;
			const recurringData: CreateRecurringTransactionInput = {
				...recurring,
				user_id: userId,
				created_by: userId,
				shared_account_id: currentFamilyId,
				is_shared: currentFamilyId !== null,
			};

			const createdDoc = await RecurringTransactionOperations.create(recurringData);

			set((state) => ({
				recurringTransactions: [...state.recurringTransactions, createdDoc],
				isLoading: false,
			}));
		} catch (error) {
			console.error('Failed to add recurring transaction:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to add recurring transaction',
				isLoading: false,
			});
		}
	},

	updateRecurringTransaction: async (userId: string, id, updates) => {
		try {
			set({ isLoading: true, error: null });

			const updateData: Partial<CreateRecurringTransactionInput> = {};
			if (updates.name !== undefined) updateData.name = updates.name;
			if (updates.amount !== undefined) updateData.amount = updates.amount;
			if (updates.type !== undefined) updateData.type = updates.type;
			if (updates.category_id !== undefined) updateData.category_id = updates.category_id;
			if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
			if (updates.note !== undefined) updateData.note = updates.note;
			if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
			if (updates.start_date !== undefined) updateData.start_date = updates.start_date;
			if (updates.end_date !== undefined) updateData.end_date = updates.end_date;
			if (updates.next_due_date !== undefined) updateData.next_due_date = updates.next_due_date;
			if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

			const updatedDoc = await RecurringTransactionOperations.update(id, updateData, userId);
			if (updatedDoc) {
				set((state) => ({
					recurringTransactions: state.recurringTransactions.map((r) => (r.id === id ? updatedDoc : r)),
					isLoading: false,
				}));
			}
		} catch (error) {
			console.error('Failed to update recurring transaction:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to update recurring transaction',
				isLoading: false,
			});
		}
	},

	deleteRecurringTransaction: async (userId: string, id) => {
		try {
			set({ isLoading: true, error: null });

			const success = await RecurringTransactionOperations.delete(id, userId);
			if (success) {
				set((state) => ({
					recurringTransactions: state.recurringTransactions.filter((r) => r.id !== id),
					isLoading: false,
				}));
			}
		} catch (error) {
			console.error('Failed to delete recurring transaction:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to delete recurring transaction',
				isLoading: false,
			});
		}
	},

	loadRecurringTransactions: async (userId: string) => {
		try {
			const recurringDocs = await RecurringTransactionOperations.findWithCategoryDetails(userId);
			set({ recurringTransactions: recurringDocs });
		} catch (error) {
			console.error('Failed to load recurring transactions:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to load recurring transactions',
			});
		}
	},

	processDueRecurringTransactions: async (userId: string) => {
		try {
			await RecurringTransactionOperations.processDueTransactions(userId);
			// Reload transactions and recurring transactions to reflect changes
			await get().loadTransactions(userId);
			await get().loadRecurringTransactions(userId);
		} catch (error) {
			console.error('Failed to process due recurring transactions:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to process due recurring transactions',
			});
		}
	},

	// ----- Planned Expense Methods -----
	addPlannedExpense: async (userId: string, plannedExpense) => {
		try {
			set({ isLoading: true, error: null });

			const currentFamilyId = get().currentFamilyId;
			const plannedExpenseData: CreatePlannedExpenseInput = {
				...plannedExpense,
				user_id: userId,
				created_by: userId,
				shared_account_id: currentFamilyId,
				is_shared: currentFamilyId !== null,
			};

			const createdDoc = await PlannedExpenseOperations.create(plannedExpenseData);

			set((state) => ({
				plannedExpenses: [...state.plannedExpenses, createdDoc],
				isLoading: false,
			}));
		} catch (error) {
			console.error('Failed to add planned expense:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to add planned expense',
				isLoading: false,
			});
		}
	},

	updatePlannedExpense: async (userId: string, id, updates) => {
		try {
			set({ isLoading: true, error: null });

			const updateData: Partial<CreatePlannedExpenseInput> = {};
			if (updates.name !== undefined) updateData.name = updates.name;
			if (updates.amount !== undefined) updateData.amount = updates.amount;
			if (updates.category_id !== undefined) updateData.category_id = updates.category_id;
			if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
			if (updates.note !== undefined) updateData.note = updates.note;
			if (updates.due_date !== undefined) updateData.due_date = updates.due_date;
			if (updates.priority !== undefined) updateData.priority = updates.priority;
			if (updates.status !== undefined) updateData.status = updates.status;

			const updatedDoc = await PlannedExpenseOperations.update(id, updateData, userId);
			if (updatedDoc) {
				set((state) => ({
					plannedExpenses: state.plannedExpenses.map((p) => (p.id === id ? updatedDoc : p)),
					isLoading: false,
				}));
			}
		} catch (error) {
			console.error('Failed to update planned expense:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to update planned expense',
				isLoading: false,
			});
		}
	},

	deletePlannedExpense: async (userId: string, id) => {
		try {
			set({ isLoading: true, error: null });

			const success = await PlannedExpenseOperations.delete(id, userId);
			if (success) {
				set((state) => ({
					plannedExpenses: state.plannedExpenses.filter((p) => p.id !== id),
					isLoading: false,
				}));
			}
		} catch (error) {
			console.error('Failed to delete planned expense:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to delete planned expense',
				isLoading: false,
			});
		}
	},

	loadPlannedExpenses: async (userId: string) => {
		try {
			const plannedExpenseDocs = await PlannedExpenseOperations.findWithCategoryDetails(userId);
			set({ plannedExpenses: plannedExpenseDocs });
		} catch (error) {
			console.error('Failed to load planned expenses:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to load planned expenses',
			});
		}
	},

	convertPlannedExpenseToTransaction: async (userId: string, id, actualAmount, actualDate) => {
		try {
			set({ isLoading: true, error: null });

			await PlannedExpenseOperations.convertToTransaction(id, userId, actualAmount, actualDate);
			// Reload both planned expenses and transactions to reflect changes
			await get().loadPlannedExpenses(userId);
			await get().loadTransactions(userId);

			set({ isLoading: false });
		} catch (error) {
			console.error('Failed to convert planned expense to transaction:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to convert planned expense to transaction',
				isLoading: false,
			});
		}
	},

	// ----- Category Methods -----
	addCategory: async (userId: string, category) => {
		try {
			set({ isLoading: true, error: null });

			const currentFamilyId = get().currentFamilyId;
			const categoryData: CreateCategoryInput = {
				name: category.name,
				type: category.type,
				subcategories: category.subcategories || [],
				created_by: userId,
				shared_account_id: currentFamilyId,
				is_shared: currentFamilyId !== null,
			};

			const createdDoc = await CategoryOperations.create(categoryData);
			const newCategory = documentToCategory(createdDoc);

			set((state) => ({
				categories: [...state.categories, newCategory],
				isLoading: false,
			}));
		} catch (error) {
			console.error('Failed to add category:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to add category',
				isLoading: false,
			});
		}
	},

	updateCategory: async (userId: string, id, updates) => {
		try {
			set({ isLoading: true, error: null });

			const updateData: Partial<CreateCategoryInput> = {};
			if (updates.name !== undefined) updateData.name = updates.name;
			if (updates.type !== undefined) updateData.type = updates.type;
			if (updates.subcategories !== undefined) updateData.subcategories = updates.subcategories;

			const updatedDoc = await CategoryOperations.update(id, updateData, userId);
			if (updatedDoc) {
				const updatedCategory = documentToCategory(updatedDoc);
				set((state) => ({
					categories: state.categories.map((c) => (c.id === id ? updatedCategory : c)),
					isLoading: false,
				}));
			}
		} catch (error) {
			console.error('Failed to update category:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to update category',
				isLoading: false,
			});
		}
	},

	deleteCategory: async (userId: string, id) => {
		try {
			set({ isLoading: true, error: null });

			const success = await CategoryOperations.delete(id, userId);
			if (success) {
				set((state) => ({
					categories: state.categories.filter((c) => c.id !== id),
					transactions: state.transactions.filter((t) => t.categoryId !== id),
					isLoading: false,
				}));
			}
		} catch (error) {
			console.error('Failed to delete category:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to delete category',
				isLoading: false,
			});
		}
	},

	loadCategories: async (userId: string) => {
		try {
			const categoryDocs = await CategoryOperations.findAll(userId);
			const categories = categoryDocs.map(documentToCategory);
			set({ categories });
		} catch (error) {
			console.error('Failed to load categories:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to load categories',
			});
		}
	},

	// ----- Subcategory Methods -----
	addSubcategory: async (userId: string, categoryId, subcategoryName) => {
		try {
			const category = get().categories.find((c) => c.id === categoryId);
			if (!category) return;

			const updatedSubcategories = [...(category.subcategories || []), subcategoryName];
			await get().updateCategory(userId, categoryId, { subcategories: updatedSubcategories });
		} catch (error) {
			console.error('Failed to add subcategory:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to add subcategory',
			});
		}
	},

	updateSubcategory: async (userId: string, categoryId, oldName, newName) => {
		try {
			const category = get().categories.find((c) => c.id === categoryId);
			if (!category) return;

			const updatedSubcategories = (category.subcategories || []).map((sub: string) =>
				sub === oldName ? newName : sub
			);
			await get().updateCategory(userId, categoryId, { subcategories: updatedSubcategories });
		} catch (error) {
			console.error('Failed to update subcategory:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to update subcategory',
			});
		}
	},

	deleteSubcategory: async (userId: string, categoryId, subcategoryName) => {
		try {
			const category = get().categories.find((c) => c.id === categoryId);
			if (!category) return;

			const updatedSubcategories = (category.subcategories || []).filter(
				(sub: string) => sub !== subcategoryName
			);
			await get().updateCategory(userId, categoryId, { subcategories: updatedSubcategories });
		} catch (error) {
			console.error('Failed to delete subcategory:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to delete subcategory',
			});
		}
	},

	// ----- Computed Getters -----
	getTotalIncome: () =>
		get()
			.transactions.filter((t) => t.type === 'Income')
			.reduce((sum, t) => sum + t.amount, 0),

	getTotalExpenses: () =>
		get()
			.transactions.filter((t) => t.type === 'Expense')
			.reduce((sum, t) => sum + t.amount, 0),

	getTotalSavings: () =>
		get()
			.transactions.filter((t) => t.type === 'Savings')
			.reduce((sum, t) => sum + t.amount, 0),

	getBalance: () => get().getTotalIncome() - get().getTotalExpenses(),

	getAvailablePerDay: () => {
		const balance = get().getBalance();
		const today = new Date();
		const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
		const remainingDays = daysInMonth - today.getDate() + 1;
		return balance / remainingDays;
	},

	// ----- Settings -----
	setMonthlyBudget: (amount) =>
		set((state) => ({
			settings: { ...state.settings, monthlyBudget: amount },
		})),

	toggleTheme: () =>
		set((state) => ({
			settings: {
				...state.settings,
				theme: state.settings.theme === 'light' ? 'dark' : 'light',
			},
		})),

	// ----- Utility -----
	resetAll: async () => {
		try {
			set({ isLoading: true, error: null });
			// Note: In a real app, you might want to clear the database
			// For now, just reset local state
			set({
				transactions: [],
				categories: [],
				recurringTransactions: [],
				plannedExpenses: [],
				settings: { monthlyBudget: 0, theme: 'light' },
				isLoading: false,
			});
		} catch (error) {
			console.error('Failed to reset:', error);
			set({
				error: error instanceof Error ? error.message : 'Failed to reset',
				isLoading: false,
			});
		}
	},

	clearError: () => set({ error: null }),

	// Family methods
	createFamily: async (family: CreateFamilyInput) => {
		try {
			set({ isLoading: true, error: null });
			const newFamily = await FamilyOperations.create(family);
			set((state) => ({
				families: [...state.families, newFamily],
				isLoading: false,
			}));
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to create family', isLoading: false });
		}
	},

	loadFamilies: async (userId: string) => {
		try {
			const families = await FamilyOperations.findByUserId(userId);

			// Auto-select first family if no current family is set and families exist
			const currentFamilyId = get().currentFamilyId;
			const shouldAutoSelect = !currentFamilyId && families.length > 0;
			const newCurrentFamilyId = shouldAutoSelect ? families[0].id : currentFamilyId;

			set({
				families,
				currentFamilyId: newCurrentFamilyId,
				isLoading: false,
			});
		} catch (error) {
			console.error('Failed to load families:', error);
			set({ error: error instanceof Error ? error.message : 'Failed to load families', isLoading: false });
		}
	},

	updateFamily: async (id: string, updates: Partial<FamilyDocument>) => {
		try {
			set({ isLoading: true, error: null });
			const updatedFamily = await FamilyOperations.update(id, updates);
			if (updatedFamily) {
				set((state) => ({
					families: state.families.map((family) => (family.id === id ? updatedFamily : family)),
					isLoading: false,
				}));
			} else {
				set({ error: 'Family not found', isLoading: false });
			}
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to update family', isLoading: false });
		}
	},

	deleteFamily: async (id: string) => {
		try {
			set({ isLoading: true, error: null });
			await FamilyOperations.delete(id);
			set((state) => ({
				families: state.families.filter((family) => family.id !== id),
				currentFamilyId: state.currentFamilyId === id ? null : state.currentFamilyId,
				isLoading: false,
			}));
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to delete family', isLoading: false });
		}
	},

	setCurrentFamily: (familyId: string | null) => {
		set({ currentFamilyId: familyId });
	},

	// Family member methods
	addFamilyMember: async (member: CreateFamilyMemberInput) => {
		try {
			set({ isLoading: true, error: null });
			const newMember = await FamilyMemberOperations.create(member);
			set((state) => ({
				families: state.families.map((family) =>
					family.id === member.family_id
						? { ...family, members: [...(family.members || []), newMember] }
						: family
				),
				isLoading: false,
			}));
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to add family member', isLoading: false });
		}
	},

	updateFamilyMember: async (id: string, updates: Partial<FamilyMemberDocument>) => {
		try {
			set({ isLoading: true, error: null });
			const updatedMember = await FamilyMemberOperations.update(id, updates);
			if (updatedMember) {
				set((state) => ({
					families: state.families.map((family) =>
						family.members?.some((member) => member.id === id)
							? {
									...family,
									members: family.members?.map((member) =>
										member.id === id ? updatedMember : member
									),
							  }
							: family
					),
					isLoading: false,
				}));
			} else {
				set({ error: 'Family member not found', isLoading: false });
			}
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to update family member', isLoading: false });
		}
	},

	removeFamilyMember: async (id: string) => {
		try {
			set({ isLoading: true, error: null });
			await FamilyMemberOperations.delete(id);
			set((state) => ({
				families: state.families.map((family) => ({
					...family,
					members: family.members?.filter((member) => member.id !== id),
				})),
				isLoading: false,
			}));
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Failed to remove family member', isLoading: false });
		}
	},
}));
