/**
 * Core Type Definitions for Personal Finance & Expense Tracker
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

export interface Expense {
  id: string;
  title: string;
  amount: number;
  type: TransactionType; // 'income' | 'expense'
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  notes?: string;
  isRecurring?: boolean;
}

export type SortField = 'date' | 'amount' | 'title' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface ExpenseFilterOptions {
  type?: 'ALL' | TransactionType;
  category?: string; // 'ALL' or specific category
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  month?: string; // YYYY-MM
  year?: string; // YYYY
  sortBy?: SortField;
  sortOrder?: SortOrder;
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

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}
