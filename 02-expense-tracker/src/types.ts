/**
 * Core Type Definitions for Advanced Expense Tracker
 */

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills & Utilities'
  | 'Health'
  | 'Education'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export type SortField = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

export interface ExpenseFilterOptions {
  category?: string; // 'ALL' or specific category
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  month?: string; // YYYY-MM
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export interface ExpenseDashboardSummary {
  totalSpent: number;
  monthlySpent: number;
  monthlyBudget: number;
  remainingBudget: number;
  transactionCount: number;
  highestExpense: number;
  averageExpense: number;
  categoryBreakdown: Record<string, number>;
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

