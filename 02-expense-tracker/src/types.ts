/**
 * Core Type Definitions for Personal Finance & Expense Tracker
 *
 * Implements discriminated unions, domain-specific literal unions,
 * generic utilities, and strictly-typed validation forms.
 */

export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills & Utilities'
  | 'Health'
  | 'Education'
  | 'Salary'
  | 'Investment'
  | 'Freelance'
  | 'Other';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Debit Card' | 'UPI' | 'Net Banking' | 'Other';

export type TransactionStatus = 'completed' | 'pending' | 'cleared';

/**
 * Base common fields shared across all financial transactions.
 */
export interface BaseTransaction {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  isRecurring?: boolean;
  paymentMethod?: PaymentMethod;
  status?: TransactionStatus;
}

/**
 * Income transaction variant of the discriminated union.
 */
export interface IncomeTransaction extends BaseTransaction {
  type: 'income';
  category: ExpenseCategory;
}

/**
 * Expense transaction variant of the discriminated union.
 */
export interface ExpenseTransaction extends BaseTransaction {
  type: 'expense';
  category: ExpenseCategory;
}

/**
 * Unified Transaction Discriminated Union.
 * Retains `Expense` type alias for full backward compatibility across the codebase.
 */
export type Transaction = IncomeTransaction | ExpenseTransaction;
export type Expense = Transaction;

export interface RecurringRule {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  frequency: RecurringFrequency;
  startDate: string;
  nextDueDate?: string;
  lastGeneratedDate?: string;
  active: boolean;
}

export type SortField = 'date' | 'amount' | 'title' | 'category';
export type SortOrder = 'asc' | 'desc';

/**
 * Strongly typed filter options avoiding loose string assignments.
 */
export interface ExpenseFilterOptions {
  type?: 'ALL' | TransactionType;
  category?: 'ALL' | ExpenseCategory;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  month?: string; // YYYY-MM
  year?: string; // YYYY
  sortBy?: SortField;
  sortOrder?: SortOrder;
  status?: 'ALL' | TransactionStatus;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  budget: number;
}

export interface UserFinanceSettings {
  currency: CurrencyCode;
  monthlyBudget: number;
  categoryBudgets: Record<string, number>;
}

export interface PeriodSummary {
  period: string; // YYYY-MM or YYYY
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number; // percentage (0 - 100)
}

export interface SpendingInsight {
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
}

export interface ExpenseDashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSpent: number; // backward-compatibility alias for totalExpenses
  netSavings: number;
  savingsRate: number; // percentage (0 - 100)
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBudget: number;
  remainingBudget: number;
  transactionCount: number;
  highestExpense: number;
  averageExpense: number;
  categoryBreakdown: Record<string, number>;
  incomeCategoryBreakdown: Record<string, number>;
  monthlyTrends: PeriodSummary[];
  yearlyTrends: PeriodSummary[];
  insights: SpendingInsight[];
  categoryBudgetProgress: Array<{
    category: string;
    spent: number;
    budget: number;
    percentage: number;
    isOver: boolean;
  }>;
  categoryBudgets: Array<{
    category: string;
    spent: number;
    budget: number;
    percentageUsed: number;
    isOver: boolean;
  }>;
  isOverBudget: boolean;
  budgetPercentageUsed: number;
}

/**
 * Shape of input data gathered from transaction forms.
 */
export interface ExpenseFormData {
  title: string;
  amount: number | string;
  type?: TransactionType | string;
  category: string;
  date: string;
  notes?: string;
  isRecurring?: boolean;
}

/**
 * Generic Validation Errors mapping keys of any form type T to error strings.
 */
export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface ValidationResult<T = ExpenseFormData> {
  isValid: boolean;
  errors: ValidationErrors<T>;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}

/**
 * Generic Storage Validator Predicate function.
 */
export type StorageValidator<T> = (val: unknown) => val is T;
