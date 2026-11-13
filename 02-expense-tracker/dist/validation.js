export const VALID_CATEGORIES = [
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
 * Type guard checking if an arbitrary value is a valid ExpenseCategory.
 */
export function isExpenseCategory(val) {
    return typeof val === 'string' && VALID_CATEGORIES.indexOf(val) !== -1;
}
/**
 * Type guard checking if an arbitrary value is a valid TransactionType.
 */
export function isTransactionType(val) {
    return val === 'income' || val === 'expense';
}
/**
 * Validation functions for transaction input and imported data.
 */
export class ExpenseValidator {
    /**
     * Validates title, amount, category, type, and date with generic validation error typing.
     */
    static validateExpense(input) {
        const errors = {};
        const cleanTitle = (input.title || '').trim();
        if (!cleanTitle) {
            errors.title = 'Description is required.';
        }
        else if (cleanTitle.length < 2) {
            errors.title = 'Description must be at least 2 characters.';
        }
        else if (cleanTitle.length > 80) {
            errors.title = 'Description cannot exceed 80 characters.';
        }
        const numAmount = typeof input.amount === 'string' ? parseFloat(input.amount) : input.amount;
        if (typeof numAmount !== 'number' || isNaN(numAmount) || numAmount <= 0) {
            errors.amount = 'Please enter a valid positive amount.';
        }
        else if (numAmount > 100000000) {
            errors.amount = 'Amount cannot exceed 100,000,000.';
        }
        if (input.type && input.type !== 'income' && input.type !== 'expense') {
            errors.type = 'Type must be either income or expense.';
        }
        if (!input.category || !isExpenseCategory(input.category)) {
            errors.category = 'Please select a valid category.';
        }
        if (!input.date) {
            errors.date = 'Transaction date is required.';
        }
        else {
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
     * Type guard checking if an imported unknown object satisfies the full Expense structure
     * with backward compatibility for legacy transactions missing the type property.
     */
    static isValidExpenseObject(item) {
        if (typeof item !== 'object' || item === null)
            return false;
        // Type narrowing using 'in' operator to verify property existence
        if ('id' in item &&
            'title' in item &&
            'amount' in item &&
            'category' in item &&
            'date' in item) {
            const exp = item;
            const hasValidId = typeof exp.id === 'string' && exp.id.length > 0;
            const hasValidTitle = typeof exp.title === 'string' && exp.title.trim().length > 0;
            const hasValidAmount = typeof exp.amount === 'number' && exp.amount > 0 && isFinite(exp.amount);
            const hasValidCategory = isExpenseCategory(exp.category);
            const hasValidDate = typeof exp.date === 'string' && !isNaN(new Date(exp.date).getTime());
            const hasValidType = !('type' in exp) ||
                exp.type === undefined ||
                exp.type === 'income' ||
                exp.type === 'expense';
            return (hasValidId &&
                hasValidTitle &&
                hasValidAmount &&
                hasValidCategory &&
                hasValidDate &&
                hasValidType);
        }
        return false;
    }
}
