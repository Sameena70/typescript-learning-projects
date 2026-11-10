import { Expense, ValidationResult, ExpenseCategory } from './types.js';

export const VALID_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Health',
  'Education',
  'Salary',
  'Investment',
  'Freelance',
  'Other'
];

/**
 * Validation functions for transaction input and imported data.
 */
export class ExpenseValidator {
  /**
   * Validates title, amount, category, type, and date.
   */
  public static validateExpense(input: {
    title: string;
    amount: number | string;
    type?: string;
    category: string;
    date: string;
    notes?: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    const cleanTitle = (input.title || '').trim();
    if (!cleanTitle) {
      errors.title = 'Description is required.';
    } else if (cleanTitle.length < 2) {
      errors.title = 'Description must be at least 2 characters.';
    } else if (cleanTitle.length > 80) {
      errors.title = 'Description cannot exceed 80 characters.';
    }

    const numAmount = typeof input.amount === 'string' ? parseFloat(input.amount) : input.amount;
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.amount = 'Please enter a valid positive amount.';
    } else if (numAmount > 100000000) {
      errors.amount = 'Amount cannot exceed 100,000,000.';
    }

    if (input.type && input.type !== 'income' && input.type !== 'expense') {
      errors.type = 'Type must be either income or expense.';
    }

    if (!input.category || !VALID_CATEGORIES.includes(input.category as ExpenseCategory)) {
      errors.category = 'Please select a valid category.';
    }

    if (!input.date) {
      errors.date = 'Transaction date is required.';
    } else {
      const parsedDate = new Date(input.date);
      if (isNaN(parsedDate.getTime())) {
        errors.date = 'Invalid date format (must be YYYY-MM-DD).';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Checks if an imported object satisfies the full Expense structure with backward compatibility.
   */
  public static isValidExpenseObject(item: unknown): item is Expense {
    if (!item || typeof item !== 'object') return false;
    const exp = item as Record<string, unknown>;

    const hasValidType = !exp.type || exp.type === 'income' || exp.type === 'expense';

    return (
      typeof exp.id === 'string' &&
      typeof exp.title === 'string' &&
      exp.title.trim().length > 0 &&
      typeof exp.amount === 'number' &&
      exp.amount > 0 &&
      hasValidType &&
      typeof exp.category === 'string' &&
      typeof exp.date === 'string' &&
      !isNaN(new Date(exp.date).getTime())
    );
  }
}
