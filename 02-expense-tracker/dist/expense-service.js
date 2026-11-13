import { StorageService } from './storage.js';
import { ExpenseValidator } from './validation.js';
import { sortByField, filterItems } from './calculations.js';
const STORAGE_EXPENSES_KEY = 'ts_expense_tracker_items';
const STORAGE_BUDGET_KEY = 'ts_expense_tracker_budget';
const STORAGE_RECURRING_KEY = 'ts_expense_tracker_recurring';
const STORAGE_SETTINGS_KEY = 'ts_expense_tracker_settings';
const DEFAULT_SETTINGS = {
    currency: 'INR',
    monthlyBudget: 25000,
    categoryBudgets: {
        'Food & Dining': 8000,
        Transportation: 3000,
        Shopping: 4000,
        Entertainment: 2000,
        'Bills & Utilities': 5000,
        Health: 2000,
        Education: 1000
    }
};
/**
 * Service managing all transaction CRUD, recurring rules, budgets, and settings.
 */
export class ExpenseService {
    constructor() {
        this.transactions = [];
        this.recurringRules = [];
        this.settings = Object.assign({}, DEFAULT_SETTINGS);
        this.loadState();
        this.processRecurringTransactions();
    }
    loadState() {
        // 1. Load transactions with backward-compatibility for legacy expenses (defaulting type to 'expense')
        const rawTransactions = StorageService.getItem(STORAGE_EXPENSES_KEY, []);
        this.transactions = Array.isArray(rawTransactions)
            ? rawTransactions
                .filter((item) => ExpenseValidator.isValidExpenseObject(item))
                .map((item) => (Object.assign(Object.assign({}, item), { type: item.type || 'expense' })))
            : [];
        // 2. Load recurring rules
        const rawRecurring = StorageService.getItem(STORAGE_RECURRING_KEY, []);
        this.recurringRules = Array.isArray(rawRecurring) ? rawRecurring : [];
        // 3. Load user settings
        const savedSettings = StorageService.getItem(STORAGE_SETTINGS_KEY, {});
        const legacyBudget = StorageService.getItem(STORAGE_BUDGET_KEY, 25000);
        this.settings = {
            currency: savedSettings.currency || 'INR',
            monthlyBudget: typeof savedSettings.monthlyBudget === 'number'
                ? savedSettings.monthlyBudget
                : typeof legacyBudget === 'number'
                    ? legacyBudget
                    : DEFAULT_SETTINGS.monthlyBudget,
            categoryBudgets: Object.assign(Object.assign({}, DEFAULT_SETTINGS.categoryBudgets), (savedSettings.categoryBudgets || {}))
        };
    }
    getExpenses() {
        return [...this.transactions];
    }
    getSettings() {
        return Object.assign({}, this.settings);
    }
    getCurrency() {
        return this.settings.currency;
    }
    setCurrency(currency) {
        this.settings.currency = currency;
        this.saveSettings();
    }
    getBudget() {
        return this.settings.monthlyBudget;
    }
    setBudget(newBudget) {
        if (newBudget < 0) {
            throw new Error('Budget cannot be negative.');
        }
        this.settings.monthlyBudget = newBudget;
        this.saveSettings();
        StorageService.setItem(STORAGE_BUDGET_KEY, newBudget);
    }
    getCategoryBudgets() {
        return Object.keys(this.settings.categoryBudgets).map((category) => ({
            category: category,
            budget: this.settings.categoryBudgets[category]
        }));
    }
    setCategoryBudget(category, amount) {
        if (amount < 0)
            throw new Error('Category budget cannot be negative.');
        this.settings.categoryBudgets[category] = amount;
        this.saveSettings();
    }
    addExpense(data) {
        var _a;
        const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const txType = data.type || 'expense';
        const newTransaction = {
            id,
            title: data.title.trim(),
            amount: data.amount,
            type: txType,
            category: data.category,
            date: data.date,
            notes: ((_a = data.notes) === null || _a === void 0 ? void 0 : _a.trim()) || undefined,
            isRecurring: Boolean(data.isRecurring),
            paymentMethod: data.paymentMethod,
            status: data.status || 'completed'
        };
        this.transactions.unshift(newTransaction);
        this.save();
        return newTransaction;
    }
    updateExpense(id, updated) {
        const index = this.transactions.findIndex((e) => e.id === id);
        if (index === -1) {
            throw new Error(`Transaction with ID "${id}" not found.`);
        }
        const existing = this.transactions[index];
        const merged = Object.assign(Object.assign(Object.assign({}, existing), updated), { id: existing.id // Preserve immutable ID
         });
        this.transactions[index] = merged;
        this.save();
        return merged;
    }
    deleteExpense(id) {
        const initialLength = this.transactions.length;
        this.transactions = this.transactions.filter((e) => e.id !== id);
        const changed = this.transactions.length !== initialLength;
        if (changed) {
            this.save();
        }
        return changed;
    }
    clearAllExpenses() {
        this.transactions = [];
        this.save();
    }
    getExpenseById(id) {
        return this.transactions.find((e) => e.id === id);
    }
    /**
     * Filters and sorts transactions using generic filtering and sorting helpers.
     */
    filterExpenses(options) {
        let list = [...this.transactions];
        // Type filter
        if (options.type && options.type !== 'ALL') {
            list = filterItems(list, (tx) => tx.type === options.type);
        }
        // Category filter
        if (options.category && options.category !== 'ALL') {
            list = filterItems(list, (exp) => exp.category === options.category);
        }
        // Search query (title or notes)
        if (options.searchQuery && options.searchQuery.trim() !== '') {
            const q = options.searchQuery.toLowerCase().trim();
            list = filterItems(list, (exp) => exp.title.toLowerCase().indexOf(q) !== -1 ||
                (exp.notes ? exp.notes.toLowerCase().indexOf(q) !== -1 : false));
        }
        // Date range filter
        if (options.startDate) {
            list = filterItems(list, (exp) => exp.date >= options.startDate);
        }
        if (options.endDate) {
            list = filterItems(list, (exp) => exp.date <= options.endDate);
        }
        // Specific Month filter (YYYY-MM)
        if (options.month) {
            list = filterItems(list, (exp) => exp.date.indexOf(options.month) === 0);
        }
        // Specific Year filter (YYYY)
        if (options.year) {
            list = filterItems(list, (exp) => exp.date.indexOf(options.year) === 0);
        }
        // Sorting via generic sortByField utility
        if (options.sortBy) {
            const sortField = options.sortBy;
            const order = options.sortOrder || 'desc';
            list = sortByField(list, sortField, order);
        }
        return list;
    }
    // Recurring Rules Management
    getRecurringRules() {
        return [...this.recurringRules];
    }
    addRecurringRule(rule) {
        const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newRule = Object.assign(Object.assign({}, rule), { id });
        this.recurringRules.push(newRule);
        this.saveRecurring();
        return newRule;
    }
    deleteRecurringRule(id) {
        this.recurringRules = this.recurringRules.filter((r) => r.id !== id);
        this.saveRecurring();
    }
    toggleRecurringRule(id) {
        const rule = this.recurringRules.find((r) => r.id === id);
        if (rule) {
            rule.active = !rule.active;
            this.saveRecurring();
        }
    }
    /**
     * Generates pending recurring transactions if due.
     */
    processRecurringTransactions() {
        const today = new Date().toISOString().slice(0, 10);
        let count = 0;
        for (const rule of this.recurringRules) {
            if (!rule.active)
                continue;
            const nextDue = rule.nextDueDate || rule.startDate;
            if (nextDue <= today) {
                this.addExpense({
                    title: `[Recurring] ${rule.title}`,
                    amount: rule.amount,
                    type: rule.type,
                    category: rule.category,
                    date: nextDue,
                    notes: `Auto-generated recurring transaction (${rule.frequency})`,
                    isRecurring: true
                });
                rule.lastGeneratedDate = nextDue;
                rule.nextDueDate = this.calculateNextDate(nextDue, rule.frequency);
                count++;
            }
        }
        if (count > 0) {
            this.saveRecurring();
        }
        return count;
    }
    calculateNextDate(currentDateStr, frequency) {
        const date = new Date(currentDateStr);
        switch (frequency) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
        }
        return date.toISOString().slice(0, 10);
    }
    save() {
        StorageService.setItem(STORAGE_EXPENSES_KEY, this.transactions);
    }
    saveRecurring() {
        StorageService.setItem(STORAGE_RECURRING_KEY, this.recurringRules);
    }
    saveSettings() {
        StorageService.setItem(STORAGE_SETTINGS_KEY, this.settings);
    }
}
