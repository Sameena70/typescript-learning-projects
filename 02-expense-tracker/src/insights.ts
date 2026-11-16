import { Expense, SpendingInsight } from './types.js';

/**
 * Generates actionable financial insights from spending and budget patterns.
 * Decoupled from core calculation math (SRP).
 */
export function generateInsights(
  transactions: Expense[],
  monthlyExpenses: number,
  monthlyBudget: number,
  categoryBreakdown: Record<string, number>,
  totalExpensesCalculator: (transactions: Expense[]) => number
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
    const totalExp = totalExpensesCalculator(transactions);
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
