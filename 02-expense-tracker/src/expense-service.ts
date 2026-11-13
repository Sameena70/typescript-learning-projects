import {
  Expense,
  ExpenseFilterOptions,
  ExpenseCategory,
  TransactionType,
  RecurringRule,
  UserFinanceSettings,
  CurrencyCode,
  CategoryBudget,
  PaymentMethod,
  TransactionStatus
} from './types.js';
import { StorageService } from './storage.js';
import { ExpenseValidator } from './validation.js';
import { sortByField, filterItems } from './calculations.js';

const STORAGE_EXPENSES_KEY = 'ts_expense_tracker_items';
const STORAGE_BUDGET_KEY = 'ts_expense_tracker_budget';
const STORAGE_RECURRING_KEY = 'ts_expense_tracker_recurring';
const STORAGE_SETTINGS_KEY = 'ts_expense_tracker_settings';

const DEFAULT_SETTINGS: UserFinanceSettings = {
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
  private transactions: Expense[] = [];
  private recurringRules: RecurringRule[] = [];
  private settings: UserFinanceSettings = { ...DEFAULT_SETTINGS };

  constructor() {
    this.loadState();
    this.processRecurringTransactions();
  }

  private loadState(): void {
    // 1. Load transactions with backward-compatibility for legacy expenses (defaulting type to 'expense')
    const rawTransactions = StorageService.getItem<unknown[]>(STORAGE_EXPENSES_KEY, []);
    this.transactions = Array.isArray(rawTransactions)
      ? rawTransactions
          .filter((item): item is Expense => ExpenseValidator.isValidExpenseObject(item))
          .map((item) => ({
            ...item,
            type: item.type || 'expense'
          }))
      : [];

    // 2. Load recurring rules
    const rawRecurring = StorageService.getItem<RecurringRule[]>(STORAGE_RECURRING_KEY, []);
    this.recurringRules = Array.isArray(rawRecurring) ? rawRecurring : [];

    // 3. Load user settings
    const savedSettings = StorageService.getItem<Partial<UserFinanceSettings>>(
      STORAGE_SETTINGS_KEY,
      {}
    );
    const legacyBudget = StorageService.getItem<number>(STORAGE_BUDGET_KEY, 25000);

    this.settings = {
      currency: savedSettings.currency || 'INR',
      monthlyBudget:
        typeof savedSettings.monthlyBudget === 'number'
          ? savedSettings.monthlyBudget
          : typeof legacyBudget === 'number'
            ? legacyBudget
            : DEFAULT_SETTINGS.monthlyBudget,
      categoryBudgets: {
        ...DEFAULT_SETTINGS.categoryBudgets,
        ...(savedSettings.categoryBudgets || {})
      }
    };
  }

  public getExpenses(): Expense[] {
    return [...this.transactions];
  }

  public getSettings(): Readonly<UserFinanceSettings> {
    return { ...this.settings };
  }

  public getCurrency(): CurrencyCode {
    return this.settings.currency;
  }

  public setCurrency(currency: CurrencyCode): void {
    this.settings.currency = currency;
    this.saveSettings();
  }

  public getBudget(): number {
    return this.settings.monthlyBudget;
  }

  public setBudget(newBudget: number): void {
    if (newBudget < 0) {
      throw new Error('Budget cannot be negative.');
    }
    this.settings.monthlyBudget = newBudget;
    this.saveSettings();
    StorageService.setItem(STORAGE_BUDGET_KEY, newBudget);
  }

  public getCategoryBudgets(): CategoryBudget[] {
    return Object.keys(this.settings.categoryBudgets).map((category) => ({
      category: category as ExpenseCategory,
      budget: this.settings.categoryBudgets[category]
    }));
  }

  public setCategoryBudget(category: string, amount: number): void {
    if (amount < 0) throw new Error('Category budget cannot be negative.');
    this.settings.categoryBudgets[category] = amount;
    this.saveSettings();
  }

  public addExpense(data: {
    title: string;
    amount: number;
    type?: TransactionType;
    category: ExpenseCategory;
    date: string;
    notes?: string;
    isRecurring?: boolean;
    paymentMethod?: PaymentMethod;
    status?: TransactionStatus;
  }): Expense {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const txType: TransactionType = data.type || 'expense';

    const newTransaction: Expense = {
      id,
      title: data.title.trim(),
      amount: data.amount,
      type: txType,
      category: data.category,
      date: data.date,
      notes: data.notes?.trim() || undefined,
      isRecurring: Boolean(data.isRecurring),
      paymentMethod: data.paymentMethod,
      status: data.status || 'completed'
    };

    this.transactions.unshift(newTransaction);
    this.save();
    return newTransaction;
  }

  public updateExpense(id: string, updated: Partial<Omit<Expense, 'id'>>): Expense {
    const index = this.transactions.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Transaction with ID "${id}" not found.`);
    }

    const existing = this.transactions[index];
    const merged: Expense = {
      ...existing,
      ...updated,
      id: existing.id // Preserve immutable ID
    } as Expense;

    this.transactions[index] = merged;
    this.save();
    return merged;
  }

  public deleteExpense(id: string): boolean {
    const initialLength = this.transactions.length;
    this.transactions = this.transactions.filter((e) => e.id !== id);
    const changed = this.transactions.length !== initialLength;
    if (changed) {
      this.save();
    }
    return changed;
  }

  public clearAllExpenses(): void {
    this.transactions = [];
    this.save();
  }

  public getExpenseById(id: string): Expense | undefined {
    return this.transactions.find((e) => e.id === id);
  }

  /**
   * Filters and sorts transactions using generic filtering and sorting helpers.
   */
  public filterExpenses(options: ExpenseFilterOptions): Expense[] {
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
      list = filterItems(
        list,
        (exp) =>
          exp.title.toLowerCase().indexOf(q) !== -1 ||
          (exp.notes ? exp.notes.toLowerCase().indexOf(q) !== -1 : false)
      );
    }

    // Date range filter
    if (options.startDate) {
      list = filterItems(list, (exp) => exp.date >= options.startDate!);
    }
    if (options.endDate) {
      list = filterItems(list, (exp) => exp.date <= options.endDate!);
    }

    // Specific Month filter (YYYY-MM)
    if (options.month) {
      list = filterItems(list, (exp) => exp.date.indexOf(options.month!) === 0);
    }

    // Specific Year filter (YYYY)
    if (options.year) {
      list = filterItems(list, (exp) => exp.date.indexOf(options.year!) === 0);
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
  public getRecurringRules(): RecurringRule[] {
    return [...this.recurringRules];
  }

  public addRecurringRule(rule: Omit<RecurringRule, 'id'>): RecurringRule {
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRule: RecurringRule = {
      ...rule,
      id
    };
    this.recurringRules.push(newRule);
    this.saveRecurring();
    return newRule;
  }

  public deleteRecurringRule(id: string): void {
    this.recurringRules = this.recurringRules.filter((r) => r.id !== id);
    this.saveRecurring();
  }

  public toggleRecurringRule(id: string): void {
    const rule = this.recurringRules.find((r) => r.id === id);
    if (rule) {
      rule.active = !rule.active;
      this.saveRecurring();
    }
  }

  /**
   * Generates pending recurring transactions if due.
   */
  public processRecurringTransactions(): number {
    const today = new Date().toISOString().slice(0, 10);
    let count = 0;

    for (const rule of this.recurringRules) {
      if (!rule.active) continue;

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

  private calculateNextDate(currentDateStr: string, frequency: string): string {
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

  private save(): void {
    StorageService.setItem(STORAGE_EXPENSES_KEY, this.transactions);
  }

  private saveRecurring(): void {
    StorageService.setItem(STORAGE_RECURRING_KEY, this.recurringRules);
  }

  private saveSettings(): void {
    StorageService.setItem(STORAGE_SETTINGS_KEY, this.settings);
  }
}
