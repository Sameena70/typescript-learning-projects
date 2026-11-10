export const VALID_CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Health',
    'Education',
    'Other'
];
/**
 * Validation functions for expense input and imported data.
 */
export class ExpenseValidator {
    /**
     * Validates title, amount, category and date.
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
        if (isNaN(numAmount) || numAmount <= 0) {
            errors.amount = 'Please enter a valid positive amount.';
        }
        else if (numAmount > 10000000) {
            errors.amount = 'Amount cannot exceed ₹1,00,00,000.';
        }
        if (!input.category || !VALID_CATEGORIES.includes(input.category)) {
            errors.category = 'Please select a valid category.';
        }
        if (!input.date) {
            errors.date = 'Expense date is required.';
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
     * Checks if an imported object satisfies the full Expense structure.
     */
    static isValidExpenseObject(item) {
        if (!item || typeof item !== 'object')
            return false;
        const exp = item;
        return (typeof exp.id === 'string' &&
            typeof exp.title === 'string' &&
            exp.title.trim().length > 0 &&
            typeof exp.amount === 'number' &&
            exp.amount > 0 &&
            typeof exp.category === 'string' &&
            VALID_CATEGORIES.includes(exp.category) &&
            typeof exp.date === 'string' &&
            !isNaN(new Date(exp.date).getTime()));
    }
}
