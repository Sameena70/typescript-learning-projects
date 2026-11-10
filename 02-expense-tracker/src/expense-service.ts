import { Expense, ExpenseFilterOptions, ExpenseCategory } from './types.js';
import { StorageService } from './storage.js';
import { ExpenseValidator } from './validation.js';

const STORAGE_EXPENSES_KEY = 'ts_expense_tracker_items';
const STORAGE_BUDGET_KEY = 'ts_expense_tracker_budget';
const DEFAULT_BUDGET = 25000;

/**
 * Service managing all expense CRUD, storage, sorting, and filtering operations.
 */
export class ExpenseService {
  private expenses: Expense[] = [];
  private budget: number = DEFAULT_BUDGET;

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    const rawExpenses = StorageService.getItem<Expense[]>(STORAGE_EXPENSES_KEY, []);
    this.expenses = Array.isArray(rawExpenses)
      ? rawExpenses.filter(item => ExpenseValidator.isValidExpenseObject(item))
      : [];

    const rawBudget = StorageService.getItem<number>(STORAGE_BUDGET_KEY, DEFAULT_BUDGET);
    this.budget = typeof rawBudget === 'number' && rawBudget >= 0 ? rawBudget : DEFAULT_BUDGET;
  }

  public getExpenses(): Expense[] {
    return [...this.expenses];
  }

  public getBudget(): number {
    return this.budget;
  }

  public setBudget(newBudget: number): void {
    if (newBudget < 0) {
      throw new Error('Budget cannot be negative.');
    }
    this.budget = newBudget;
    StorageService.setItem(STORAGE_BUDGET_KEY, this.budget);
  }

  public addExpense(data: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    notes?: string;
  }): Expense {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newExpense: Expense = {
      id,
      title: data.title.trim(),
      amount: data.amount,
      category: data.category,
      date: data.date,
      notes: data.notes?.trim() || undefined
    };

    this.expenses.unshift(newExpense);
    this.save();
    return newExpense;
  }

  public updateExpense(id: string, updated: Partial<Omit<Expense, 'id'>>): Expense {
    const index = this.expenses.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Expense with ID "${id}" not found.`);
    }

    const existing = this.expenses[index];
    const merged: Expense = {
      ...existing,
      ...updated,
      id: existing.id // Preserve immutable ID
    };

    this.expenses[index] = merged;
    this.save();
    return merged;
  }

  public deleteExpense(id: string): boolean {
    const initialLength = this.expenses.length;
    this.expenses = this.expenses.filter(e => e.id !== id);
    const changed = this.expenses.length !== initialLength;
    if (changed) {
      this.save();
    }
    return changed;
  }

  public clearAllExpenses(): void {
    this.expenses = [];
    this.save();
  }

  public getExpenseById(id: string): Expense | undefined {
    return this.expenses.find(e => e.id === id);
  }

  /**
   * Filters and sorts expenses using Array methods (filter, sort).
   */
  public filterExpenses(options: ExpenseFilterOptions): Expense[] {
    let list = [...this.expenses];

    // Category filter
    if (options.category && options.category !== 'ALL') {
      list = list.filter(exp => exp.category === options.category);
    }

    // Search description filter
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase().trim();
      list = list.filter(exp => 
        exp.title.toLowerCase().includes(q) || 
        (exp.notes && exp.notes.toLowerCase().includes(q))
      );
    }

    // Date range filter
    if (options.startDate) {
      list = list.filter(exp => exp.date >= options.startDate!);
    }
    if (options.endDate) {
      list = list.filter(exp => exp.date <= options.endDate!);
    }

    // Specific Month filter (YYYY-MM)
    if (options.month) {
      list = list.filter(exp => exp.date.startsWith(options.month!));
    }

    // Sorting
    if (options.sortBy) {
      const order = options.sortOrder === 'asc' ? 1 : -1;
      list.sort((a, b) => {
        if (options.sortBy === 'amount') {
          return (a.amount - b.amount) * order;
        } else {
          // Date sorting
          return a.date.localeCompare(b.date) * order;
        }
      });
    }

    return list;
  }

  public bulkImport(newItems: Expense[]): { added: number; skipped: number } {
    let added = 0;
    let skipped = 0;

    for (const item of newItems) {
      // Prevent duplicates by checking ID or matching (title, date, amount)
      const duplicate = this.expenses.some(e => 
        e.id === item.id || 
        (e.title.toLowerCase() === item.title.toLowerCase() && e.date === item.date && e.amount === item.amount)
      );

      if (duplicate) {
        skipped++;
      } else {
        this.expenses.push(item);
        added++;
      }
    }

    // Sort newest first
    this.expenses.sort((a, b) => b.date.localeCompare(a.date));
    this.save();
    return { added, skipped };
  }

  private save(): void {
    StorageService.setItem(STORAGE_EXPENSES_KEY, this.expenses);
  }
}

