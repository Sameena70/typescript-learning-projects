import {
  Expense,
  IncomeTransaction,
  ExpenseTransaction,
  ExpenseDashboardSummary,
  CurrencyCode,
  PeriodSummary,
  SpendingInsight,
  CategoryBudget
} from './types.js';
import { sortByField, filterItems } from './utils.js';
import { generateInsights as createInsights } from './insights.js';

// Re-export utility functions for backward compatibility with existing tests/consumers
export { sortByField, filterItems };

/**
 * Type guard for narrowing a Transaction to an IncomeTransaction.
 */
export function isIncomeTransaction(tx: Expense): tx is IncomeTransaction {
  return tx.type === 'income';
}

/**
 * Type guard for narrowing a Transaction to an ExpenseTransaction.
 */
export function isExpenseTransaction(tx: Expense): tx is ExpenseTransaction {
  return tx.type === 'expense';
}

/**
 * Currency formatting supporting INR (default), USD, EUR, and GBP.
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const localeMap: Record<CurrencyCode, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB'
  };

  return new Intl.NumberFormat(localeMap[currency] || 'en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formats a numeric value into INR currency string (backward compatibility).
 */
export function formatINR(amount: number): string {
  return formatCurrency(amount, 'INR');
}

/**
 * Sums total expenses from transactions list using discriminated union narrowing.
 */
export function calculateTotalExpenses(transactions: Expense[]): number {
  return transactions
    .filter(
      (t) => t.type === 'expense' || !('type' in t) || (t as { type?: unknown }).type === undefined
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Sums total income from transactions list using discriminated union narrowing.
 */
export function calculateTotalIncome(transactions: Expense[]): number {
  return transactions.filter(isIncomeTransaction).reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculates net balance (Income - Expenses).
 */
export function calculateNetBalance(transactions: Expense[]): number {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  return income - expenses;
}

/**
 * Legacy alias: sums total expenses.
 */
export function calculateTotal(transactions: Expense[]): number {
  return calculateTotalExpenses(transactions);
}

/**
 * Computes monthly spending for the current month or given YYYY-MM.
 */
export function calculateMonthlySpending(transactions: Expense[], yearMonth?: string): number {
  const target = yearMonth || new Date().toISOString().slice(0, 7);
  return transactions
    .filter((t) => (t.type === 'expense' || !t.type) && t.date.indexOf(target) === 0)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Computes monthly income for given YYYY-MM.
 */
export function calculateMonthlyIncome(transactions: Expense[], yearMonth?: string): number {
  const target = yearMonth || new Date().toISOString().slice(0, 7);
  return transactions
    .filter((t) => isIncomeTransaction(t) && t.date.indexOf(target) === 0)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Aggregates expenses by category.
 */
export function calculateCategoryTotals(transactions: Expense[]): Record<string, number> {
  return transactions
    .filter((t) => t.type === 'expense' || !t.type)
    .reduce<Record<string, number>>((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
}

/**
 * Aggregates income by category.
 */
export function calculateIncomeCategoryTotals(transactions: Expense[]): Record<string, number> {
  return transactions.filter(isIncomeTransaction).reduce<Record<string, number>>((acc, inc) => {
    acc[inc.category] = (acc[inc.category] || 0) + inc.amount;
    return acc;
  }, {});
}

/**
 * Finds highest individual expense amount.
 */
export function getHighestExpense(transactions: Expense[]): number {
  const expenses = transactions.filter((t) => t.type === 'expense' || !t.type);
  if (expenses.length === 0) return 0;
  return Math.max(...expenses.map((e) => e.amount));
}

/**
 * Computes average transaction amount for expenses.
 */
export function getAverageExpense(transactions: Expense[]): number {
  const expenses = transactions.filter((t) => t.type === 'expense' || !t.type);
  if (expenses.length === 0) return 0;
  return calculateTotalExpenses(expenses) / expenses.length;
}

/**
 * Aggregates monthly income, expenses, and savings across distinct months.
 */
export function calculateMonthlyTrends(transactions: Expense[]): PeriodSummary[] {
  const monthsSet = new Set<string>();
  transactions.forEach((t) => {
    if (t.date && t.date.length >= 7) {
      monthsSet.add(t.date.slice(0, 7));
    }
  });

  const months = Array.from(monthsSet).sort();
  return months.map((period) => {
    const income = calculateMonthlyIncome(transactions, period);
    const expenses = calculateMonthlySpending(transactions, period);
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, Math.min(100, (netSavings / income) * 100)) : 0;
    return {
      period,
      income,
      expenses,
      netSavings,
      savingsRate
    };
  });
}

/**
 * Aggregates yearly income, expenses, and savings across distinct years.
 */
export function calculateYearlyTrends(transactions: Expense[]): PeriodSummary[] {
  const yearsSet = new Set<string>();
  transactions.forEach((t) => {
    if (t.date && t.date.length >= 4) {
      yearsSet.add(t.date.slice(0, 4));
    }
  });

  const years = Array.from(yearsSet).sort();
  return years.map((period) => {
    const yearTx = transactions.filter((t) => t.date && t.date.indexOf(period) === 0);
    const income = calculateTotalIncome(yearTx);
    const expenses = calculateTotalExpenses(yearTx);
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, Math.min(100, (netSavings / income) * 100)) : 0;
    return {
      period,
      income,
      expenses,
      netSavings,
      savingsRate
    };
  });
}

/**
 * Generates actionable financial insights from spending and budget patterns.
 */
export function generateInsights(
  transactions: Expense[],
  monthlyExpenses: number,
  monthlyBudget: number,
  categoryBreakdown: Record<string, number>
): SpendingInsight[] {
  return createInsights(
    transactions,
    monthlyExpenses,
    monthlyBudget,
    categoryBreakdown,
    calculateTotalExpenses
  );
}

/**
 * Generates a complete financial dashboard overview.
 */
export function generateSummary(
  transactions: Expense[],
  monthlyBudget: number,
  categoryBudgets: CategoryBudget[]
): ExpenseDashboardSummary {
  const currentYearMonth = new Date().toISOString().slice(0, 7);

  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const totalBalance = totalIncome - totalExpenses;
  const netSavings = totalBalance;
  const savingsRate =
    totalIncome > 0 ? Math.max(0, Math.min(100, (netSavings / totalIncome) * 100)) : 0;

  const monthlyIncome = calculateMonthlyIncome(transactions, currentYearMonth);
  const monthlyExpenses = calculateMonthlySpending(transactions, currentYearMonth);
  const remainingBudget = monthlyBudget - monthlyExpenses;
  const isOverBudget = monthlyBudget > 0 && monthlyExpenses > monthlyBudget;
  const budgetPercentageUsed = monthlyBudget > 0 ? (monthlyExpenses / monthlyBudget) * 100 : 0;

  const categoryBreakdown = calculateCategoryTotals(transactions);
  const incomeCategoryBreakdown = calculateIncomeCategoryTotals(transactions);

  const monthlySpendingByCat = transactions
    .filter((t) => (t.type === 'expense' || !t.type) && t.date.indexOf(currentYearMonth) === 0)
    .reduce<Record<string, number>>((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

  const categoryBudgetProgress = categoryBudgets.map((cb) => {
    const spent = monthlySpendingByCat[cb.category] || 0;
    const percentage = cb.budget > 0 ? (spent / cb.budget) * 100 : 0;
    return {
      category: cb.category,
      spent,
      budget: cb.budget,
      percentage,
      isOver: spent > cb.budget
    };
  });

  const categoryBudgetsFormatted = categoryBudgets.map((cb) => {
    const spent = monthlySpendingByCat[cb.category] || 0;
    const percentageUsed = cb.budget > 0 ? (spent / cb.budget) * 100 : 0;
    return {
      category: cb.category,
      spent,
      budget: cb.budget,
      percentageUsed,
      isOver: spent > cb.budget
    };
  });

  const monthlyTrends = calculateMonthlyTrends(transactions);
  const yearlyTrends = calculateYearlyTrends(transactions);
  const insights = generateInsights(
    transactions,
    monthlyExpenses,
    monthlyBudget,
    categoryBreakdown
  );

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    totalSpent: totalExpenses,
    netSavings,
    savingsRate,
    monthlyIncome,
    monthlyExpenses,
    monthlyBudget,
    remainingBudget,
    transactionCount: transactions.length,
    highestExpense: getHighestExpense(transactions),
    averageExpense: getAverageExpense(transactions),
    categoryBreakdown,
    incomeCategoryBreakdown,
    monthlyTrends,
    yearlyTrends,
    insights,
    categoryBudgetProgress,
    categoryBudgets: categoryBudgetsFormatted,
    isOverBudget,
    budgetPercentageUsed
  };
}

/**
 * Backward-compatible facade preserving static access for existing consumers and tests.
 */
export class ExpenseCalculations {
  public static formatCurrency = formatCurrency;
  public static formatINR = formatINR;
  public static calculateTotalExpenses = calculateTotalExpenses;
  public static calculateTotalIncome = calculateTotalIncome;
  public static calculateNetBalance = calculateNetBalance;
  public static calculateTotal = calculateTotal;
  public static calculateMonthlySpending = calculateMonthlySpending;
  public static calculateMonthlyIncome = calculateMonthlyIncome;
  public static calculateCategoryTotals = calculateCategoryTotals;
  public static calculateIncomeCategoryTotals = calculateIncomeCategoryTotals;
  public static getHighestExpense = getHighestExpense;
  public static getAverageExpense = getAverageExpense;
  public static calculateMonthlyTrends = calculateMonthlyTrends;
  public static calculateYearlyTrends = calculateYearlyTrends;
  public static generateInsights = generateInsights;
  public static generateSummary = generateSummary;
}
