import { describe, it, expect, beforeEach } from 'vitest';
import {
  ExpenseCalculations,
  sortByField,
  filterItems,
  isIncomeTransaction,
  isExpenseTransaction
} from '../src/calculations.js';
import { ExpenseService } from '../src/expense-service.js';
import { ExpenseValidator } from '../src/validation.js';
import { ExpenseImportExport } from '../src/import-export.js';
import { StorageService } from '../src/storage.js';
import { Expense, CategoryBudget } from '../src/types.js';

// Setup Mock LocalStorage for headless tests
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
};

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createLocalStorageMock(),
    writable: true
  });
}

describe('ExpenseCalculations', () => {
  const sampleTransactions: Expense[] = [
    {
      id: '1',
      title: 'Groceries',
      amount: 1500,
      category: 'Food & Dining',
      date: '2026-11-01',
      type: 'expense'
    },
    {
      id: '2',
      title: 'Bus Pass',
      amount: 800,
      category: 'Transportation',
      date: '2026-11-03',
      type: 'expense'
    },
    {
      id: '3',
      title: 'Salary Deposit',
      amount: 50000,
      category: 'Salary',
      date: '2026-11-01',
      type: 'income'
    },
    {
      id: '4',
      title: 'Dinner',
      amount: 1200,
      category: 'Food & Dining',
      date: '2026-11-05',
      type: 'expense'
    },
    {
      id: '5',
      title: 'Freelance Design',
      amount: 10000,
      category: 'Freelance',
      date: '2026-10-15',
      type: 'income'
    },
    {
      id: '6',
      title: 'Electricity Bill',
      amount: 3000,
      category: 'Bills & Utilities',
      date: '2026-10-15',
      type: 'expense'
    }
  ];

  it('calculates total expense amount correctly', () => {
    const totalExp = ExpenseCalculations.calculateTotalExpenses(sampleTransactions);
    expect(totalExp).toBe(6500); // 1500 + 800 + 1200 + 3000
    // Backward compatibility alias
    expect(ExpenseCalculations.calculateTotal(sampleTransactions)).toBe(6500);
  });

  it('calculates total income correctly', () => {
    const totalInc = ExpenseCalculations.calculateTotalIncome(sampleTransactions);
    expect(totalInc).toBe(60000); // 50000 + 10000
  });

  it('calculates net balance (Income - Expense)', () => {
    const net = ExpenseCalculations.calculateNetBalance(sampleTransactions);
    expect(net).toBe(53500); // 60000 - 6500
  });

  it('calculates monthly spending and monthly income for target months', () => {
    const novExpense = ExpenseCalculations.calculateMonthlySpending(sampleTransactions, '2026-11');
    expect(novExpense).toBe(3500); // 1500 + 800 + 1200

    const novIncome = ExpenseCalculations.calculateMonthlyIncome(sampleTransactions, '2026-11');
    expect(novIncome).toBe(50000);

    const octExpense = ExpenseCalculations.calculateMonthlySpending(sampleTransactions, '2026-10');
    expect(octExpense).toBe(3000);
  });

  it('aggregates expenses and incomes by category accurately', () => {
    const expTotals = ExpenseCalculations.calculateCategoryTotals(sampleTransactions);
    expect(expTotals['Food & Dining']).toBe(2700);
    expect(expTotals['Transportation']).toBe(800);
    expect(expTotals['Bills & Utilities']).toBe(3000);

    const incTotals = ExpenseCalculations.calculateIncomeCategoryTotals(sampleTransactions);
    expect(incTotals['Salary']).toBe(50000);
    expect(incTotals['Freelance']).toBe(10000);
  });

  it('formats currency with support for INR, USD, EUR, and GBP', () => {
    expect(ExpenseCalculations.formatCurrency(5000, 'INR')).toMatch(/₹|INR/);
    expect(ExpenseCalculations.formatCurrency(120, 'USD')).toMatch(/\$|USD/);
    expect(ExpenseCalculations.formatINR(2500)).toMatch(/₹|INR/);
  });

  it('finds highest and average expense values accurately', () => {
    expect(ExpenseCalculations.getHighestExpense(sampleTransactions)).toBe(3000);
    expect(ExpenseCalculations.getAverageExpense(sampleTransactions)).toBe(6500 / 4);
  });

  it('generates multi-period monthly trends with savings rate percentages', () => {
    const trends = ExpenseCalculations.calculateMonthlyTrends(sampleTransactions);
    expect(trends.length).toBe(2); // Oct and Nov

    const octTrend = trends.find((t) => t.period === '2026-10');
    expect(octTrend?.income).toBe(10000);
    expect(octTrend?.expenses).toBe(3000);
    expect(octTrend?.netSavings).toBe(7000);
    expect(octTrend?.savingsRate).toBe(70);
  });

  it('generates comprehensive dashboard summary including budget utilization', () => {
    const categoryBudgets: CategoryBudget[] = [
      { category: 'Food & Dining', budget: 5000 },
      { category: 'Bills & Utilities', budget: 2000 }
    ];

    const summary = ExpenseCalculations.generateSummary(sampleTransactions, 10000, categoryBudgets);
    expect(summary.totalBalance).toBe(53500);
    expect(summary.totalIncome).toBe(60000);
    expect(summary.totalExpenses).toBe(6500);
    expect(summary.insights.length).toBeGreaterThan(0);
  });
});

describe('Generic Utilities and Discriminated Union Guards', () => {
  const testItems = [
    {
      id: '1',
      title: 'Coffee',
      amount: 120,
      date: '2026-11-02',
      type: 'expense' as const,
      category: 'Food & Dining' as const
    },
    {
      id: '2',
      title: 'Salary',
      amount: 45000,
      date: '2026-11-01',
      type: 'income' as const,
      category: 'Salary' as const
    },
    {
      id: '3',
      title: 'Apples',
      amount: 80,
      date: '2026-11-03',
      type: 'expense' as const,
      category: 'Food & Dining' as const
    }
  ];

  it('sorts objects generically by numeric key', () => {
    const sorted = sortByField(testItems, 'amount', 'asc');
    expect(sorted[0].amount).toBe(80);
    expect(sorted[1].amount).toBe(120);
    expect(sorted[2].amount).toBe(45000);
  });

  it('sorts objects generically by string key in descending order', () => {
    const sorted = sortByField(testItems, 'title', 'desc');
    expect(sorted[0].title).toBe('Salary');
    expect(sorted[1].title).toBe('Coffee');
    expect(sorted[2].title).toBe('Apples');
  });

  it('filters items generically preserving type', () => {
    const expensesOnly = filterItems(testItems, (item) => item.type === 'expense');
    expect(expensesOnly).toHaveLength(2);
  });

  it('correctly discriminates income vs expense with type guards', () => {
    const income = testItems[1];
    const expense = testItems[0];

    expect(isIncomeTransaction(income)).toBe(true);
    expect(isIncomeTransaction(expense)).toBe(false);

    expect(isExpenseTransaction(expense)).toBe(true);
    expect(isExpenseTransaction(income)).toBe(false);
  });
});

describe('ExpenseValidator & Validation Errors', () => {
  it('validates a correct expense input without errors', () => {
    const result = ExpenseValidator.validateExpense({
      title: 'Groceries at Supermarket',
      amount: 250.5,
      type: 'expense',
      category: 'Food & Dining',
      date: '2026-11-12'
    });

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('flags missing and invalid fields with typed error keys', () => {
    const result = ExpenseValidator.validateExpense({
      title: '',
      amount: -50,
      category: 'InvalidCat' as unknown as Expense['category'],
      date: 'invalid-date'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
    expect(result.errors.amount).toBeDefined();
    expect(result.errors.category).toBeDefined();
    expect(result.errors.date).toBeDefined();
  });

  it('validates raw objects via type guard with backward compatibility', () => {
    const validLegacy = {
      id: 'tx_123',
      title: 'Old expense',
      amount: 400,
      category: 'Shopping',
      date: '2026-05-10'
    };
    expect(ExpenseValidator.isValidExpenseObject(validLegacy)).toBe(true);

    const invalid = { id: 123, title: 'No string id' };
    expect(ExpenseValidator.isValidExpenseObject(invalid)).toBe(false);
  });
});

describe('ExpenseService (State & CRUD Operations)', () => {
  let service: ExpenseService;

  beforeEach(() => {
    localStorage.clear();
    service = new ExpenseService();
  });

  it('adds and retrieves transactions correctly', () => {
    const tx = service.addExpense({
      title: 'Monthly Internet',
      amount: 1500,
      type: 'expense',
      category: 'Bills & Utilities',
      date: '2026-11-01'
    });

    expect(tx.id).toBeDefined();
    expect(service.getExpenses()).toHaveLength(1);
    expect(service.getExpenseById(tx.id)?.title).toBe('Monthly Internet');
  });

  it('updates an existing transaction safely', () => {
    const tx = service.addExpense({
      title: 'Snack',
      amount: 50,
      type: 'expense',
      category: 'Food & Dining',
      date: '2026-11-02'
    });

    const updated = service.updateExpense(tx.id, { amount: 65 });
    expect(updated.amount).toBe(65);
    expect(service.getExpenseById(tx.id)?.amount).toBe(65);
  });

  it('deletes a transaction and updates storage', () => {
    const tx = service.addExpense({
      title: 'Movie',
      amount: 300,
      type: 'expense',
      category: 'Entertainment',
      date: '2026-11-03'
    });

    expect(service.deleteExpense(tx.id)).toBe(true);
    expect(service.getExpenses()).toHaveLength(0);
  });

  it('filters transactions by type, category, and search query using generic helpers', () => {
    service.addExpense({
      title: 'Groceries',
      amount: 1000,
      type: 'expense',
      category: 'Food & Dining',
      date: '2026-11-01'
    });
    service.addExpense({
      title: 'Consulting Fee',
      amount: 25000,
      type: 'income',
      category: 'Freelance',
      date: '2026-11-02'
    });

    const incomeOnly = service.filterExpenses({ type: 'income' });
    expect(incomeOnly).toHaveLength(1);
    expect(incomeOnly[0].title).toBe('Consulting Fee');

    const foodOnly = service.filterExpenses({ category: 'Food & Dining' });
    expect(foodOnly).toHaveLength(1);
    expect(foodOnly[0].title).toBe('Groceries');
  });
});

describe('Generic Storage Resilience and CSV Parsing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('StorageService falls back safely upon encountering corrupt JSON', () => {
    localStorage.setItem('corrupt_key', '{ bad json ::');
    const result = StorageService.getItem<number>(
      'corrupt_key',
      100,
      (val: unknown): val is number => typeof val === 'number'
    );
    expect(result).toBe(100);
  });

  it('parses valid CSV transaction content properly', () => {
    const csvData = [
      'ID,Type,Title,Amount,Category,Date,Notes,IsRecurring',
      'tx_1,expense,Coffee,150,Food & Dining,2026-11-01,Morning latte,false',
      'tx_2,income,Bonus,10000,Salary,2026-11-02,Quarterly bonus,false'
    ].join('\r\n');

    const parsed = ExpenseImportExport.parseCSVContent(csvData);
    expect(parsed.validExpenses).toHaveLength(2);
    expect(parsed.result.success).toBe(true);
    expect(parsed.validExpenses[0].type).toBe('expense');
    expect(parsed.validExpenses[1].type).toBe('income');
  });

  it('handles invalid CSV content with skipped lines and error messages', () => {
    const badCSV = [
      'ID,Type,Title,Amount,Category,Date',
      'tx_1,expense,Coffee,-100,Food & Dining,2026-11-01' // negative amount
    ].join('\r\n');

    const parsed = ExpenseImportExport.parseCSVContent(badCSV);
    expect(parsed.validExpenses).toHaveLength(0);
    expect(parsed.result.skippedCount).toBe(1);
    expect(parsed.result.errors.length).toBeGreaterThan(0);
  });
});
