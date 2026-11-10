import { StorageService } from './storage.js';
import { ExpenseValidator } from './validation.js';
const STORAGE_EXPENSES_KEY = 'ts_expense_tracker_items';
const STORAGE_BUDGET_KEY = 'ts_expense_tracker_budget';
const DEFAULT_BUDGET = 25000;
/**
 * Service managing all expense CRUD, storage, sorting, and filtering operations.
 */
export class ExpenseService {
    constructor() {
        this.expenses = [];
        this.budget = DEFAULT_BUDGET;
        this.loadState();
    }
    loadState() {
        const rawExpenses = StorageService.getItem(STORAGE_EXPENSES_KEY, []);
        this.expenses = Array.isArray(rawExpenses)
            ? rawExpenses.filter(item => ExpenseValidator.isValidExpenseObject(item))
            : [];
        const rawBudget = StorageService.getItem(STORAGE_BUDGET_KEY, DEFAULT_BUDGET);
        this.budget = typeof rawBudget === 'number' && rawBudget >= 0 ? rawBudget : DEFAULT_BUDGET;
    }
    getExpenses() {
        return [...this.expenses];
    }
    getBudget() {
        return this.budget;
    }
    setBudget(newBudget) {
        if (newBudget < 0) {
            throw new Error('Budget cannot be negative.');
        }
        this.budget = newBudget;
        StorageService.setItem(STORAGE_BUDGET_KEY, this.budget);
    }
    addExpense(data) {
        var _a;
        const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newExpense = {
            id,
            title: data.title.trim(),
            amount: data.amount,
            category: data.category,
            date: data.date,
            notes: ((_a = data.notes) === null || _a === void 0 ? void 0 : _a.trim()) || undefined
        };
        this.expenses.unshift(newExpense);
        this.save();
        return newExpense;
    }
    updateExpense(id, updated) {
        const index = this.expenses.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error(`Expense with ID "${id}" not found.`);
        }
        const existing = this.expenses[index];
        const merged = Object.assign(Object.assign(Object.assign({}, existing), updated), { id: existing.id // Preserve immutable ID
         });
        this.expenses[index] = merged;
        this.save();
        return merged;
    }
    deleteExpense(id) {
        const initialLength = this.expenses.length;
        this.expenses = this.expenses.filter(e => e.id !== id);
        const changed = this.expenses.length !== initialLength;
        if (changed) {
            this.save();
        }
        return changed;
    }
    clearAllExpenses() {
        this.expenses = [];
        this.save();
    }
    getExpenseById(id) {
        return this.expenses.find(e => e.id === id);
    }
    /**
     * Filters and sorts expenses using Array methods (filter, sort).
     */
    filterExpenses(options) {
        let list = [...this.expenses];
        // Category filter
        if (options.category && options.category !== 'ALL') {
            list = list.filter(exp => exp.category === options.category);
        }
        // Search description filter
        if (options.searchQuery && options.searchQuery.trim() !== '') {
            const q = options.searchQuery.toLowerCase().trim();
            list = list.filter(exp => exp.title.toLowerCase().includes(q) ||
                (exp.notes && exp.notes.toLowerCase().includes(q)));
        }
        // Date range filter
        if (options.startDate) {
            list = list.filter(exp => exp.date >= options.startDate);
        }
        if (options.endDate) {
            list = list.filter(exp => exp.date <= options.endDate);
        }
        // Specific Month filter (YYYY-MM)
        if (options.month) {
            list = list.filter(exp => exp.date.startsWith(options.month));
        }
        // Sorting
        if (options.sortBy) {
            const order = options.sortOrder === 'asc' ? 1 : -1;
            list.sort((a, b) => {
                if (options.sortBy === 'amount') {
                    return (a.amount - b.amount) * order;
                }
                else {
                    // Date sorting
                    return a.date.localeCompare(b.date) * order;
                }
            });
        }
        return list;
    }
    bulkImport(newItems) {
        let added = 0;
        let skipped = 0;
        for (const item of newItems) {
            // Prevent duplicates by checking ID or matching (title, date, amount)
            const duplicate = this.expenses.some(e => e.id === item.id ||
                (e.title.toLowerCase() === item.title.toLowerCase() && e.date === item.date && e.amount === item.amount));
            if (duplicate) {
                skipped++;
            }
            else {
                this.expenses.push(item);
                added++;
            }
        }
        // Sort newest first
        this.expenses.sort((a, b) => b.date.localeCompare(a.date));
        this.save();
        return { added, skipped };
    }
    save() {
        StorageService.setItem(STORAGE_EXPENSES_KEY, this.expenses);
    }
}
