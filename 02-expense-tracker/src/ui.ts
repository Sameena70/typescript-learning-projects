import { Expense, ExpenseDashboardSummary, UserFinanceSettings, PeriodSummary } from './types.js';
import { ExpenseCalculations } from './calculations.js';

/**
 * UI Renderer for Expense Tracker.
 */
export class ExpenseUI {
  private totalExpensesDisplay: HTMLElement | null;
  private totalIncomeDisplay: HTMLElement | null;
  private netBalanceDisplay: HTMLElement | null;
  private savingsRateDisplay: HTMLElement | null;
  private expenseCountText: HTMLElement | null;
  private budgetDisplay: HTMLElement | null;
  private remainingBalanceDisplay: HTMLElement | null;
  private balanceBadge: HTMLElement | null;
  private budgetProgressBar: HTMLElement | null;
  private highestExpenseDisplay: HTMLElement | null;
  private avgExpenseDisplay: HTMLElement | null;

  private expenseTableBody: HTMLElement | null;
  private emptyState: HTMLElement | null;
  private categoryBudgetList: HTMLElement | null;

  // New Phase 5 Interactive Elements
  private insightsContainer: HTMLElement | null;
  private categoryChartContainer: HTMLElement | null;
  private incomeVsExpenseChart: HTMLElement | null;
  private monthlySummaryTableBody: HTMLElement | null;
  private yearlySummaryTableBody: HTMLElement | null;

  constructor() {
    this.totalExpensesDisplay = document.getElementById('totalExpensesDisplay');
    this.totalIncomeDisplay = document.getElementById('totalIncomeDisplay');
    this.netBalanceDisplay = document.getElementById('netBalanceDisplay');
    this.savingsRateDisplay = document.getElementById('savingsRateDisplay');
    this.expenseCountText = document.getElementById('expenseCountText');
    this.budgetDisplay = document.getElementById('budgetDisplay');
    this.remainingBalanceDisplay = document.getElementById('remainingBalanceDisplay');
    this.balanceBadge = document.getElementById('balanceBadge');
    this.budgetProgressBar = document.getElementById('budgetProgressBar');
    this.highestExpenseDisplay = document.getElementById('highestExpenseDisplay');
    this.avgExpenseDisplay = document.getElementById('avgExpenseDisplay');

    this.expenseTableBody = document.getElementById('expenseTableBody');
    this.emptyState = document.getElementById('emptyState');
    this.categoryBudgetList = document.getElementById('categoryBudgetList');

    this.insightsContainer = document.getElementById('insightsContainer');
    this.categoryChartContainer = document.getElementById('categoryChartContainer');
    this.incomeVsExpenseChart = document.getElementById('incomeVsExpenseChart');
    this.monthlySummaryTableBody = document.getElementById('monthlySummaryTableBody');
    this.yearlySummaryTableBody = document.getElementById('yearlySummaryTableBody');
  }

  public updateDashboard(summary: ExpenseDashboardSummary, settings: UserFinanceSettings): void {
    const currency = settings.currency;

    if (this.totalExpensesDisplay) {
      this.totalExpensesDisplay.textContent = ExpenseCalculations.formatCurrency(
        summary.totalExpenses,
        currency
      );
    }
    if (this.totalIncomeDisplay) {
      this.totalIncomeDisplay.textContent = ExpenseCalculations.formatCurrency(
        summary.totalIncome,
        currency
      );
    }
    if (this.netBalanceDisplay) {
      this.netBalanceDisplay.textContent = ExpenseCalculations.formatCurrency(
        summary.totalBalance,
        currency
      );
      if (summary.totalBalance >= 0) {
        this.netBalanceDisplay.className = 'stat-value text-positive';
      } else {
        this.netBalanceDisplay.className = 'stat-value text-negative';
      }
    }
    if (this.savingsRateDisplay) {
      this.savingsRateDisplay.textContent = `${summary.savingsRate.toFixed(1)}% savings rate`;
    }
    if (this.expenseCountText) {
      this.expenseCountText.textContent = `${summary.transactionCount} transactions recorded`;
    }
    if (this.budgetDisplay) {
      this.budgetDisplay.textContent = ExpenseCalculations.formatCurrency(
        summary.monthlyBudget,
        currency
      );
    }
    if (this.remainingBalanceDisplay) {
      this.remainingBalanceDisplay.textContent = ExpenseCalculations.formatCurrency(
        summary.remainingBudget,
        currency
      );
    }
    if (this.highestExpenseDisplay) {
      this.highestExpenseDisplay.textContent = ExpenseCalculations.formatCurrency(
        summary.highestExpense,
        currency
      );
    }
    if (this.avgExpenseDisplay) {
      this.avgExpenseDisplay.textContent = ExpenseCalculations.formatCurrency(
        summary.averageExpense,
        currency
      );
    }

    if (this.balanceBadge) {
      if (summary.isOverBudget) {
        this.balanceBadge.textContent = 'Exceeded';
        this.balanceBadge.className = 'stat-badge badge-danger';
      } else if (summary.budgetPercentageUsed > 80) {
        this.balanceBadge.textContent = 'Warning';
        this.balanceBadge.className = 'stat-badge badge-warning';
      } else {
        this.balanceBadge.textContent = 'Safe';
        this.balanceBadge.className = 'stat-badge badge-success';
      }
    }

    if (this.budgetProgressBar) {
      this.budgetProgressBar.style.width = `${Math.min(100, summary.budgetPercentageUsed)}%`;
      if (summary.isOverBudget) {
        this.budgetProgressBar.style.backgroundColor = '#ef4444';
      } else if (summary.budgetPercentageUsed > 80) {
        this.budgetProgressBar.style.backgroundColor = '#f59e0b';
      } else {
        this.budgetProgressBar.style.backgroundColor = '#10b981';
      }
    }

    this.renderCategoryBudgets(summary, settings);
    this.renderCharts(summary, settings);
    this.renderInsights(summary);
    this.renderPeriodReports(summary, settings);
  }

  public renderCategoryBudgets(
    summary: ExpenseDashboardSummary,
    settings: UserFinanceSettings
  ): void {
    if (!this.categoryBudgetList) return;

    if (!summary.categoryBudgetProgress || summary.categoryBudgetProgress.length === 0) {
      this.categoryBudgetList.innerHTML =
        '<p class="text-muted text-sm">No category budgets defined.</p>';
      return;
    }

    this.categoryBudgetList.innerHTML = summary.categoryBudgetProgress
      .map((cb) => {
        const pct = cb.percentage;
        const color = cb.isOver ? '#ef4444' : pct > 80 ? '#f59e0b' : '#3b82f6';
        return `
          <div class="category-budget-item">
            <div class="cat-budget-header">
              <span class="font-medium">${this.escapeHTML(cb.category)}</span>
              <span class="text-sm ${cb.isOver ? 'text-danger font-bold' : 'text-muted'}">
                ${ExpenseCalculations.formatCurrency(cb.spent, settings.currency)} / 
                ${ExpenseCalculations.formatCurrency(cb.budget, settings.currency)} 
                (${pct.toFixed(0)}%)
              </span>
            </div>
            <div class="cat-progress-track">
              <div class="cat-progress-fill" style="width: ${Math.min(100, pct)}%; background-color: ${color}"></div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  public renderCharts(summary: ExpenseDashboardSummary, settings: UserFinanceSettings): void {
    // 1. Spending by Category Chart
    if (this.categoryChartContainer) {
      const catEntries = Object.entries(summary.categoryBreakdown).filter(([, amt]) => amt > 0);
      const totalExp = summary.totalExpenses;

      if (catEntries.length === 0) {
        this.categoryChartContainer.innerHTML =
          '<p class="text-muted text-sm chart-empty">No expense categories to visualize yet.</p>';
      } else {
        catEntries.sort((a, b) => b[1] - a[1]);
        const chartHtml = catEntries
          .map(([cat, amount]) => {
            const pct = totalExp > 0 ? (amount / totalExp) * 100 : 0;
            return `
              <div class="chart-row">
                <div class="chart-label-group">
                  <span class="chart-cat-name">${this.escapeHTML(cat)}</span>
                  <span class="chart-cat-val">${ExpenseCalculations.formatCurrency(amount, settings.currency)} (${pct.toFixed(1)}%)</span>
                </div>
                <div class="chart-bar-bg">
                  <div class="chart-bar-fill cat-fill" style="width: ${Math.max(2, pct)}%"></div>
                </div>
              </div>
            `;
          })
          .join('');
        this.categoryChartContainer.innerHTML = chartHtml;
      }
    }

    // 2. Income vs Expense Comparison Bar
    if (this.incomeVsExpenseChart) {
      const inc = summary.totalIncome;
      const exp = summary.totalExpenses;
      const total = inc + exp;

      if (total === 0) {
        this.incomeVsExpenseChart.innerHTML =
          '<p class="text-muted text-sm chart-empty">Log income or expenses to see comparison.</p>';
      } else {
        const incPct = total > 0 ? (inc / total) * 100 : 50;
        const expPct = total > 0 ? (exp / total) * 100 : 50;

        this.incomeVsExpenseChart.innerHTML = `
          <div class="comparison-bar-container">
            <div class="comp-bar-fill inc-fill" style="width: ${incPct}%;" title="Income: ${ExpenseCalculations.formatCurrency(inc, settings.currency)}"></div>
            <div class="comp-bar-fill exp-fill" style="width: ${expPct}%;" title="Expense: ${ExpenseCalculations.formatCurrency(exp, settings.currency)}"></div>
          </div>
          <div class="comp-legend">
            <span class="legend-item text-income">
              <span class="legend-dot dot-income"></span>
              Income: ${ExpenseCalculations.formatCurrency(inc, settings.currency)} (${incPct.toFixed(1)}%)
            </span>
            <span class="legend-item text-expense">
              <span class="legend-dot dot-expense"></span>
              Expenses: ${ExpenseCalculations.formatCurrency(exp, settings.currency)} (${expPct.toFixed(1)}%)
            </span>
          </div>
        `;
      }
    }
  }

  public renderInsights(summary: ExpenseDashboardSummary): void {
    if (!this.insightsContainer) return;

    if (!summary.insights || summary.insights.length === 0) {
      this.insightsContainer.innerHTML = '';
      return;
    }

    this.insightsContainer.innerHTML = summary.insights
      .map((ins) => {
        const icon = ins.type === 'warning' ? '⚠️' : ins.type === 'success' ? '🎯' : '💡';
        const cssClass =
          ins.type === 'warning'
            ? 'insight-warning'
            : ins.type === 'success'
              ? 'insight-success'
              : 'insight-info';
        return `
          <div class="insight-card ${cssClass}">
            <div class="insight-icon">${icon}</div>
            <div class="insight-content">
              <strong>${this.escapeHTML(ins.title)}</strong>
              <p>${this.escapeHTML(ins.message)}</p>
            </div>
          </div>
        `;
      })
      .join('');
  }

  public renderPeriodReports(
    summary: ExpenseDashboardSummary,
    settings: UserFinanceSettings
  ): void {
    // Monthly Summary Table
    if (this.monthlySummaryTableBody) {
      this.renderTrendTable(this.monthlySummaryTableBody, summary.monthlyTrends, settings.currency);
    }

    // Yearly Summary Table
    if (this.yearlySummaryTableBody) {
      this.renderTrendTable(this.yearlySummaryTableBody, summary.yearlyTrends, settings.currency);
    }
  }

  private renderTrendTable(
    tbody: HTMLElement,
    trends: PeriodSummary[],
    currency: UserFinanceSettings['currency']
  ): void {
    tbody.innerHTML = '';
    if (trends.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No historical data available.</td></tr>`;
      return;
    }

    trends.forEach((item) => {
      const row = document.createElement('tr');
      const netClass = item.netSavings >= 0 ? 'text-income font-bold' : 'text-expense font-bold';
      row.innerHTML = `
        <td class="font-medium">${this.escapeHTML(item.period)}</td>
        <td class="text-income">${ExpenseCalculations.formatCurrency(item.income, currency)}</td>
        <td class="text-expense">${ExpenseCalculations.formatCurrency(item.expenses, currency)}</td>
        <td class="${netClass}">${ExpenseCalculations.formatCurrency(item.netSavings, currency)}</td>
        <td><span class="stat-badge ${item.savingsRate > 20 ? 'badge-safe' : 'badge-neutral'}">${item.savingsRate.toFixed(1)}%</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  public renderExpensesTable(
    expenses: Expense[],
    settings: UserFinanceSettings,
    onEdit: (id: string) => void,
    onDelete: (id: string) => void
  ): void {
    if (!this.expenseTableBody) return;

    this.expenseTableBody.innerHTML = '';

    if (expenses.length === 0) {
      if (this.emptyState) this.emptyState.style.display = 'block';
      return;
    }

    if (this.emptyState) this.emptyState.style.display = 'none';

    expenses.forEach((exp) => {
      const row = document.createElement('tr');
      const isIncome = exp.type === 'income';
      row.className = `expense-row ${isIncome ? 'row-income' : 'row-expense'}`;

      const notesHtml = exp.notes
        ? `<div class="expense-notes">${this.escapeHTML(exp.notes)}</div>`
        : '';
      const recurringBadge = exp.isRecurring
        ? `<span class="badge-recurring" title="Recurring Transaction">🔄 Recurring</span>`
        : '';

      const typeBadge = isIncome
        ? `<span class="type-badge income-badge">Income</span>`
        : `<span class="type-badge expense-badge">Expense</span>`;

      const formattedAmount = `${isIncome ? '+' : '-'}${ExpenseCalculations.formatCurrency(
        exp.amount,
        settings.currency
      )}`;
      const amountClass = isIncome ? 'text-income font-bold' : 'text-expense font-bold';

      row.innerHTML = `
        <td>
          <div class="expense-title-cell">
            <span class="font-medium">${this.escapeHTML(exp.title)}</span>
            ${recurringBadge}
            ${notesHtml}
          </div>
        </td>
        <td>${typeBadge}</td>
        <td><span class="category-tag">${this.escapeHTML(exp.category)}</span></td>
        <td><span class="date-text">${exp.date}</span></td>
        <td><span class="amount-text ${amountClass}">${formattedAmount}</span></td>
        <td class="text-center">
          <div class="action-buttons-group">
            <button class="action-btn edit-btn" data-id="${exp.id}" title="Edit Transaction">✏️</button>
            <button class="action-btn delete-btn" data-id="${exp.id}" title="Delete Transaction">🗑️</button>
          </div>
        </td>
      `;

      row.querySelector('.edit-btn')?.addEventListener('click', () => onEdit(exp.id));
      row.querySelector('.delete-btn')?.addEventListener('click', () => onDelete(exp.id));

      this.expenseTableBody?.appendChild(row);
    });
  }

  public showToast(message: string, isError = false): void {
    const toast = document.createElement('div');
    toast.className = `app-toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hide');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  public escapeHTML(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
