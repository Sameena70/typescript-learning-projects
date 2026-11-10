import {
  Expense,
  ExpenseDashboardSummary,
  CurrencyCode,
  UserFinanceSettings,
  PeriodSummary,
  SpendingInsight
} from './types.js';

export class ExpenseCalculations {
  /**
   * Currency formatting supporting INR (default), USD, EUR, and GBP.
   */
  public static formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
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
  public static formatINR(amount: number): string {
    return this.formatCurrency(amount, 'INR');
  }

  /**
   * Sums total expenses from transactions list.
   */
  public static calculateTotalExpenses(transactions: Expense[]): number {
    return transactions
      .filter((t) => t.type === 'expense' || !t.type)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Sums total income from transactions list.
   */
  public static calculateTotalIncome(transactions: Expense[]): number {
    return transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calculates net balance (Income - Expenses).
   */
  public static calculateNetBalance(transactions: Expense[]): number {
    const income = this.calculateTotalIncome(transactions);
    const expenses = this.calculateTotalExpenses(transactions);
    return income - expenses;
  }

  /**
   * Legacy alias: sums total expenses.
   */
  public static calculateTotal(transactions: Expense[]): number {
    return this.calculateTotalExpenses(transactions);
  }

  /**
   * Computes monthly spending for the current month or given YYYY-MM.
   */
  public static calculateMonthlySpending(transactions: Expense[], yearMonth?: string): number {
    const target = yearMonth || new Date().toISOString().slice(0, 7);
    return transactions
      .filter((t) => (t.type === 'expense' || !t.type) && t.date.startsWith(target))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Computes monthly income for given YYYY-MM.
   */
  public static calculateMonthlyIncome(transactions: Expense[], yearMonth?: string): number {
    const target = yearMonth || new Date().toISOString().slice(0, 7);
    return transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(target))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Aggregates expenses by category.
   */
  public static calculateCategoryTotals(transactions: Expense[]): Record<string, number> {
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
  public static calculateIncomeCategoryTotals(transactions: Expense[]): Record<string, number> {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce<Record<string, number>>((acc, inc) => {
        acc[inc.category] = (acc[inc.category] || 0) + inc.amount;
        return acc;
      }, {});
  }

  /**
   * Finds highest individual expense amount.
   */
  public static getHighestExpense(transactions: Expense[]): number {
    const expenses = transactions.filter((t) => t.type === 'expense' || !t.type);
    if (expenses.length === 0) return 0;
    return Math.max(...expenses.map((e) => e.amount));
  }

  /**
   * Computes average transaction amount for expenses.
   */
  public static getAverageExpense(transactions: Expense[]): number {
    const expenses = transactions.filter((t) => t.type === 'expense' || !t.type);
    if (expenses.length === 0) return 0;
    return this.calculateTotalExpenses(expenses) / expenses.length;
  }

  /**
   * Aggregates monthly income, expenses, and savings across distinct months.
   */
  public static calculateMonthlyTrends(transactions: Expense[]): PeriodSummary[] {
    const monthsSet = new Set<string>();
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        monthsSet.add(t.date.slice(0, 7));
      }
    });

    const months = Array.from(monthsSet).sort();
    return months.map((period) => {
      const income = this.calculateMonthlyIncome(transactions, period);
      const expenses = this.calculateMonthlySpending(transactions, period);
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
  public static calculateYearlyTrends(transactions: Expense[]): PeriodSummary[] {
    const yearsSet = new Set<string>();
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 4) {
        yearsSet.add(t.date.slice(0, 4));
      }
    });

    const years = Array.from(yearsSet).sort();
    return years.map((period) => {
      const yearTx = transactions.filter((t) => t.date && t.date.startsWith(period));
      const income = this.calculateTotalIncome(yearTx);
      const expenses = this.calculateTotalExpenses(yearTx);
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
  public static generateInsights(
    transactions: Expense[],
    monthlyExpenses: number,
    monthlyBudget: number,
    categoryBreakdown: Record<string, number>
  ): SpendingInsight[] {
    const insights: SpendingInsight[] = [];

    if (transactions.length === 0) {
      insights.push({
        type: 'info',
        title: 'Welcome to your financial overview',
        message: 'Start by adding your income and expenses to unlock real-time financial insights.'
      });
      return insights;
    }

    // Budget utilization insight
    if (monthlyBudget > 0) {
      const budgetPct = (monthlyExpenses / monthlyBudget) * 100;
      if (budgetPct > 100) {
        insights.push({
          type: 'warning',
          title: 'Monthly Budget Exceeded',
          message: `Current spending exceeds your budget by ${(budgetPct - 100).toFixed(1)}%. Review discretionary categories.`
        });
      } else if (budgetPct > 80) {
        insights.push({
          type: 'warning',
          title: 'Approaching Budget Limit',
          message: `You have utilized ${budgetPct.toFixed(1)}% of your monthly budget. Watch upcoming expenses.`
        });
      } else {
        insights.push({
          type: 'success',
          title: 'Budget On Track',
          message: `You have used ${budgetPct.toFixed(1)}% of your monthly budget, maintaining healthy headroom.`
        });
      }
    }

    // Top expense category insight
    const sortedCats = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length > 0 && sortedCats[0][1] > 0) {
      const totalExp = this.calculateTotalExpenses(transactions);
      const topCat = sortedCats[0];
      const pct = totalExp > 0 ? ((topCat[1] / totalExp) * 100).toFixed(1) : '0';
      insights.push({
        type: 'info',
        title: `Top Spending: ${topCat[0]}`,
        message: `${topCat[0]} accounts for ${pct}% of your total recorded expenses.`
      });
    }

    return insights;
  }

  /**
   * Generates a complete financial dashboard overview.
   */
  public static generateSummary(
    transactions: Expense[],
    settingsOrBudget: UserFinanceSettings | number,
    categoryBudgetsList?: Array<{ category: string; budget: number }> | Record<string, number>,
    targetMonth?: string
  ): ExpenseDashboardSummary {
    const monthlyBudget =
      typeof settingsOrBudget === 'number' ? settingsOrBudget : settingsOrBudget.monthlyBudget;

    let categoryBudgets: Record<string, number> = {};
    if (typeof settingsOrBudget === 'object' && settingsOrBudget.categoryBudgets) {
      categoryBudgets = { ...settingsOrBudget.categoryBudgets };
    }
    if (Array.isArray(categoryBudgetsList)) {
      categoryBudgetsList.forEach((cb) => {
        categoryBudgets[cb.category] = cb.budget;
      });
    } else if (categoryBudgetsList && typeof categoryBudgetsList === 'object') {
      categoryBudgets = { ...categoryBudgets, ...categoryBudgetsList };
    }

    const currentMonth = targetMonth || new Date().toISOString().slice(0, 7);

    const totalIncome = this.calculateTotalIncome(transactions);
    const totalExpenses = this.calculateTotalExpenses(transactions);
    const totalBalance = totalIncome - totalExpenses;
    const netSavings = totalBalance;
    const savingsRate =
      totalIncome > 0 ? Math.max(0, Math.min(100, (netSavings / totalIncome) * 100)) : 0;

    const monthlyIncome = this.calculateMonthlyIncome(transactions, currentMonth);
    const monthlyExpenses = this.calculateMonthlySpending(transactions, currentMonth);
    const remainingBudget = monthlyBudget - monthlyExpenses;
    const isOverBudget = remainingBudget < 0;
    const budgetPercentageUsed =
      monthlyBudget > 0 ? Math.min((monthlyExpenses / monthlyBudget) * 100, 100) : 0;

    const categoryBreakdown = this.calculateCategoryTotals(transactions);
    const incomeCategoryBreakdown = this.calculateIncomeCategoryTotals(transactions);

    // Calculate category budget progress
    const categoryBudgetProgress = Object.entries(categoryBudgets).map(([cat, budget]) => {
      const spent = categoryBreakdown[cat] || 0;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      return {
        category: cat,
        spent,
        budget,
        percentage,
        isOver: spent > budget
      };
    });

    const categoryBudgetsCompat = categoryBudgetProgress.map((item) => ({
      category: item.category,
      spent: item.spent,
      budget: item.budget,
      percentageUsed: item.percentage,
      isOver: item.isOver
    }));

    const monthlyTrends = this.calculateMonthlyTrends(transactions);
    const yearlyTrends = this.calculateYearlyTrends(transactions);
    const insights = this.generateInsights(
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
      highestExpense: this.getHighestExpense(transactions),
      averageExpense: this.getAverageExpense(transactions),
      categoryBreakdown,
      incomeCategoryBreakdown,
      monthlyTrends,
      yearlyTrends,
      insights,
      categoryBudgetProgress,
      categoryBudgets: categoryBudgetsCompat,
      isOverBudget,
      budgetPercentageUsed
    };
  }
}
