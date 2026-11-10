import { describe, it, expect, beforeEach } from 'vitest';
import { ExpenseCalculations } from '../src/calculations.js';
import { ExpenseService } from '../src/expense-service.js';
import { ExpenseValidator } from '../src/validation.js';
import { ExpenseImportExport } from '../src/import-export.js';
import { Expense, CategoryBudget } from '../src/types.js';

// Setup Mock LocalStorage for headless tests
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
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

    const octIncome = ExpenseCalculations.calculateMonthlyIncome(sampleTransactions, '2026-10');
    expect(octIncome).toBe(10000);
  });

  it('groups spending totals by category correctly', () => {
    const categoryTotals = ExpenseCalculations.calculateCategoryTotals(sampleTransactions);
    expect(categoryTotals['Food & Dining']).toBe(2700);
    expect(categoryTotals['Transportation']).toBe(800);
    expect(categoryTotals['Bills & Utilities']).toBe(3000);
    expect(categoryTotals['Salary']).toBeUndefined(); // Only expenses
  });

  it('groups income totals by category correctly', () => {
    const incCategoryTotals = ExpenseCalculations.calculateIncomeCategoryTotals(sampleTransactions);
    expect(incCategoryTotals['Salary']).toBe(50000);
    expect(incCategoryTotals['Freelance']).toBe(10000);
  });

  it('identifies highest and average expense amounts ignoring income', () => {
    expect(ExpenseCalculations.getHighestExpense(sampleTransactions)).toBe(3000);
    expect(ExpenseCalculations.getAverageExpense(sampleTransactions)).toBe(1625); // 6500 / 4

    expect(ExpenseCalculations.getHighestExpense([])).toBe(0);
    expect(ExpenseCalculations.getAverageExpense([])).toBe(0);
  });

  it('calculates monthly and yearly performance trends', () => {
    const monthlyTrends = ExpenseCalculations.calculateMonthlyTrends(sampleTransactions);
    expect(monthlyTrends.length).toBe(2); // 2026-10 and 2026-11
    expect(monthlyTrends[0].period).toBe('2026-10');
    expect(monthlyTrends[0].income).toBe(10000);
    expect(monthlyTrends[0].expenses).toBe(3000);
    expect(monthlyTrends[0].netSavings).toBe(7000);
    expect(monthlyTrends[0].savingsRate).toBe(70);

    const yearlyTrends = ExpenseCalculations.calculateYearlyTrends(sampleTransactions);
    expect(yearlyTrends.length).toBe(1);
    expect(yearlyTrends[0].period).toBe('2026');
    expect(yearlyTrends[0].income).toBe(60000);
    expect(yearlyTrends[0].expenses).toBe(6500);
    expect(yearlyTrends[0].netSavings).toBe(53500);
  });

  it('generates actionable spending insights', () => {
    const categoryTotals = ExpenseCalculations.calculateCategoryTotals(sampleTransactions);
    const insights = ExpenseCalculations.generateInsights(
      sampleTransactions,
      3500,
      5000,
      categoryTotals
    );

    expect(insights.length).toBeGreaterThan(0);
    expect(insights.some((i) => i.title.includes('Top Spending'))).toBe(true);
  });

  it('generates complete dashboard summary including category budgets and trends', () => {
    const categoryBudgets: CategoryBudget[] = [
      { category: 'Food & Dining', budget: 2500 } // Spent 2700, so over budget
    ];

    const summary = ExpenseCalculations.generateSummary(
      sampleTransactions,
      5000,
      categoryBudgets,
      '2026-11'
    );
    expect(summary.totalSpent).toBe(6500);
    expect(summary.totalIncome).toBe(60000);
    expect(summary.totalBalance).toBe(53500);
    expect(summary.monthlyBudget).toBe(5000);
    expect(summary.transactionCount).toBe(6);
    expect(summary.savingsRate).toBeCloseTo(89.16, 1);
    expect(summary.categoryBudgetProgress.length).toBe(1);
    expect(summary.categoryBudgetProgress[0].spent).toBe(2700);
    expect(summary.categoryBudgetProgress[0].isOver).toBe(true);
    expect(summary.monthlyTrends.length).toBe(2);
    expect(summary.yearlyTrends.length).toBe(1);
  });

  it('formats amounts across different currencies', () => {
    expect(ExpenseCalculations.formatINR(25000)).toContain('25,000');
    expect(ExpenseCalculations.formatCurrency(150, 'USD')).toContain('150');
    expect(ExpenseCalculations.formatCurrency(200, 'EUR')).toContain('200');
    expect(ExpenseCalculations.formatCurrency(300, 'GBP')).toContain('300');
  });
});

describe('ExpenseValidator', () => {
  it('validates a correct expense transaction', () => {
    const result = ExpenseValidator.validateExpense({
      title: 'Groceries',
      amount: 1500,
      category: 'Food & Dining',
      date: '2026-11-01',
      type: 'expense'
    });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('validates a correct income transaction', () => {
    const result = ExpenseValidator.validateExpense({
      title: 'Consulting',
      amount: 4500,
      category: 'Freelance',
      date: '2026-11-02',
      type: 'income'
    });
    expect(result.isValid).toBe(true);
  });

  it('rejects invalid titles, negative amounts, and invalid dates', () => {
    const result = ExpenseValidator.validateExpense({
      title: '',
      amount: -50,
      category: 'UnknownCategory' as unknown as Expense['category'],
      date: 'invalid-date'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
    expect(result.errors.amount).toBeDefined();
    expect(result.errors.category).toBeDefined();
    expect(result.errors.date).toBeDefined();
  });

  it('isValidExpenseObject recognizes valid transactions', () => {
    expect(
      ExpenseValidator.isValidExpenseObject({
        id: '123',
        title: 'Lunch',
        amount: 250,
        category: 'Food & Dining',
        date: '2026-11-05'
      })
    ).toBe(true);

    expect(
      ExpenseValidator.isValidExpenseObject({
        title: 'Lunch'
      })
    ).toBe(false);
  });
});

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(() => {
    const mockStorage = createLocalStorageMock();
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true
    });
    service = new ExpenseService();
  });

  it('adds, retrieves, updates, and deletes transactions', () => {
    const item = service.addExpense({
      title: 'Coffee',
      amount: 150,
      category: 'Food & Dining',
      date: '2026-11-01',
      type: 'expense'
    });

    expect(service.getExpenses().length).toBe(1);
    expect(item.id).toBeDefined();
    expect(service.getExpenseById(item.id)?.title).toBe('Coffee');

    const updated = service.updateExpense(item.id, { title: 'Espresso', amount: 200 });
    expect(updated.title).toBe('Espresso');
    expect(updated.amount).toBe(200);

    service.deleteExpense(item.id);
    expect(service.getExpenses().length).toBe(0);
  });

  it('filters by transaction type (income vs expense) and category', () => {
    service.addExpense({
      title: 'Coffee',
      amount: 150,
      category: 'Food & Dining',
      date: '2026-11-01',
      type: 'expense'
    });
    service.addExpense({
      title: 'Salary',
      amount: 50000,
      category: 'Salary',
      date: '2026-11-01',
      type: 'income'
    });

    const expensesOnly = service.filterExpenses({ type: 'expense' });
    expect(expensesOnly.length).toBe(1);
    expect(expensesOnly[0].title).toBe('Coffee');

    const incomeOnly = service.filterExpenses({ type: 'income' });
    expect(incomeOnly.length).toBe(1);
    expect(incomeOnly[0].title).toBe('Salary');
  });

  it('manages recurring rules and processes due transactions', () => {
    const rule = service.addRecurringRule({
      title: 'Gym Membership',
      amount: 2000,
      category: 'Health',
      type: 'expense',
      frequency: 'monthly',
      startDate: '2026-01-01'
    });

    expect(service.getRecurringRules().length).toBe(1);

    // Initial addition triggers processing
    const generatedExpenses = service.getExpenses().filter((e) => e.isRecurring);
    expect(generatedExpenses.length).toBeGreaterThan(0);
    expect(generatedExpenses[0].title).toContain('Gym Membership');

    // Remove recurring rule
    service.deleteRecurringRule(rule.id);
    expect(service.getRecurringRules().length).toBe(0);
  });

  it('bulk imports transactions safely avoiding duplicates', () => {
    const t1: Expense = {
      id: 't-1',
      title: 'Internet',
      amount: 1200,
      category: 'Bills & Utilities',
      date: '2026-11-01',
      type: 'expense'
    };

    service.bulkImport([t1]);
    expect(service.getExpenses().length).toBe(1);

    // Re-import the exact same item
    const { added, skipped } = service.bulkImport([t1]);
    expect(added).toBe(0);
    expect(skipped).toBe(1);
    expect(service.getExpenses().length).toBe(1);
  });

  it('manages user settings and category budgets', () => {
    service.setCurrency('USD');
    expect(service.getCurrency()).toBe('USD');

    service.setCategoryBudget('Food & Dining', 3000);
    const cb = service.getCategoryBudgets();
    expect(cb.find((c) => c.category === 'Food & Dining')?.budget).toBe(3000);
  });
});

describe('ExpenseImportExport CSV and File parsing', () => {
  it('escapes and parses CSV fields correctly', () => {
    const fieldWithComma = 'Food, Dining';
    const escaped = ExpenseImportExport.escapeCSVField(fieldWithComma);
    expect(escaped).toBe('"Food, Dining"');

    const parsed = ExpenseImportExport.parseCSVLine('"Food, Dining",500,expense');
    expect(parsed).toEqual(['Food, Dining', '500', 'expense']);
  });

  it('correctly splits multi-line CSV text', () => {
    const csv = 'Header1,Header2\r\nVal1,Val2\r\nVal3,Val4';
    const lines = ExpenseImportExport.splitCSVLines(csv);
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('Header1,Header2');
  });

  it('handles embedded quotation marks properly in CSV', () => {
    const text = '"A ""quoted"" note",100,Food & Dining';
    const parsed = ExpenseImportExport.parseCSVLine(text);
    expect(parsed[0]).toBe('A "quoted" note');
    expect(parsed[1]).toBe('100');
  });
});
