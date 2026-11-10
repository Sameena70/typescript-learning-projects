import {
  Expense,
  ExpenseFilterOptions,
  ExpenseCategory,
  TransactionType,
  RecurringRule,
  UserFinanceSettings,
  CurrencyCode,
  CategoryBudget
} from './types.js';
import { StorageService } from './storage.js';
import { ExpenseValidator } from './validation.js';

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
          .filter((item) => ExpenseValidator.isValidExpenseObject(item))
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
    return Object.entries(this.settings.categoryBudgets).map(([category, budget]) => ({
      category: category as ExpenseCategory,
      budget
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
  }): Expense {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTransaction: Expense = {
      id,
      title: data.title.trim(),
      amount: data.amount,
      type: data.type || 'expense',
      category: data.category,
      date: data.date,
      notes: data.notes?.trim() || undefined,
      isRecurring: Boolean(data.isRecurring)
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
    };

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
   * Filters and sorts transactions using array methods.
   */
  public filterExpenses(options: ExpenseFilterOptions): Expense[] {
    let list = [...this.transactions];

    // Type filter
    if (options.type && options.type !== 'ALL') {
      list = list.filter((tx) => tx.type === options.type);
    }

    // Category filter
    if (options.category && options.category !== 'ALL') {
      list = list.filter((exp) => exp.category === options.category);
    }

    // Search query (title or notes)
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase().trim();
      list = list.filter(
        (exp) =>
          exp.title.toLowerCase().includes(q) || (exp.notes && exp.notes.toLowerCase().includes(q))
      );
    }

    // Date range filter
    if (options.startDate) {
      list = list.filter((exp) => exp.date >= options.startDate!);
    }
    if (options.endDate) {
      list = list.filter((exp) => exp.date <= options.endDate!);
    }

    // Specific Month filter (YYYY-MM)
    if (options.month) {
      list = list.filter((exp) => exp.date.startsWith(options.month!));
    }

    // Specific Year filter (YYYY)
    if (options.year) {
      list = list.filter((exp) => exp.date.startsWith(options.year!));
    }

    // Sorting
    if (options.sortBy) {
      const order = options.sortOrder === 'asc' ? 1 : -1;
      list.sort((a, b) => {
        if (options.sortBy === 'amount') {
          return (a.amount - b.amount) * order;
        } else if (options.sortBy === 'title') {
          return a.title.localeCompare(b.title) * order;
        } else if (options.sortBy === 'category') {
          return a.category.localeCompare(b.category) * order;
        } else {
          return a.date.localeCompare(b.date) * order;
        }
      });
    }

    return list;
  }

  /**
   * Recurring Rules Management.
   */
  public getRecurringRules(): RecurringRule[] {
    return [...this.recurringRules];
  }

  public addRecurringRule(
    rule: Omit<RecurringRule, 'id' | 'lastGeneratedDate' | 'active'>
  ): RecurringRule {
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRule: RecurringRule = {
      ...rule,
      id,
      active: true
    };
    this.recurringRules.push(newRule);
    this.saveRecurring();
    this.processRecurringTransactions();
    return newRule;
  }

  public deleteRecurringRule(id: string): void {
    this.recurringRules = this.recurringRules.filter((r) => r.id !== id);
    this.saveRecurring();
  }

  public processRecurringTransactions(): number {
    const today = new Date().toISOString().slice(0, 10);
    let generatedCount = 0;

    for (const rule of this.recurringRules) {
      if (!rule.active) continue;

      const lastDate = rule.lastGeneratedDate || rule.startDate;
      if (lastDate <= today) {
        // Create recurring transaction if not already made today
        const title = `[Recurring] ${rule.title}`;
        const alreadyExists = this.transactions.some(
          (t) => t.title === title && t.date === today && t.amount === rule.amount
        );

        if (!alreadyExists) {
          this.addExpense({
            title,
            amount: rule.amount,
            type: rule.type,
            category: rule.category,
            date: today,
            notes: `Auto-generated from recurring ${rule.frequency} rule`,
            isRecurring: true
          });
          rule.lastGeneratedDate = today;
          generatedCount++;
        }
      }
    }

    if (generatedCount > 0) {
      this.saveRecurring();
    }

    return generatedCount;
  }

  /**
   * Bulk import with deduplication and ID safety.
   */
  public bulkImport(newItems: Expense[]): { added: number; skipped: number } {
    let added = 0;
    let skipped = 0;
    const existingIds = new Set(this.transactions.map((e) => e.id));

    for (const rawItem of newItems) {
      const item: Expense = {
        ...rawItem,
        type: rawItem.type || 'expense'
      };

      // Check if duplicate content exists
      const duplicate = this.transactions.some(
        (e) =>
          e.title.toLowerCase() === item.title.toLowerCase() &&
          e.date === item.date &&
          e.amount === item.amount &&
          e.type === item.type
      );

      if (duplicate) {
        skipped++;
      } else {
        // Regenerate ID if conflicting with an existing ID
        const finalId = existingIds.has(item.id)
          ? `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
          : item.id;

        existingIds.add(finalId);
        this.transactions.push({ ...item, id: finalId });
        added++;
      }
    }

    this.transactions.sort((a, b) => b.date.localeCompare(a.date));
    this.save();
    return { added, skipped };
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
