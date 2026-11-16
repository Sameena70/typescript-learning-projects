import {
  Expense,
  ExpenseDashboardSummary,
  UserFinanceSettings,
  PeriodSummary,
  CurrencyCode,
  CategoryBudgetProgress,
  SpendingInsight
} from './types.js';
import { formatCurrency, isIncomeTransaction } from './calculations.js';

/**
 * Escapes HTML characters for safe innerHTML injection.
 */
export function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Renders the primary financial dashboard statistics and progress bars.
 */
export class DashboardRenderer {
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
  }

  public render(summary: ExpenseDashboardSummary, settings: UserFinanceSettings): void {
    const currency = settings.currency;

    if (this.totalExpensesDisplay) {
      this.totalExpensesDisplay.textContent = formatCurrency(summary.totalExpenses, currency);
    }
    if (this.totalIncomeDisplay) {
      this.totalIncomeDisplay.textContent = formatCurrency(summary.totalIncome, currency);
    }
    if (this.netBalanceDisplay) {
      this.netBalanceDisplay.textContent = formatCurrency(summary.totalBalance, currency);
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
      this.budgetDisplay.textContent = formatCurrency(summary.monthlyBudget, currency);
    }
    if (this.remainingBalanceDisplay) {
      this.remainingBalanceDisplay.textContent = formatCurrency(summary.remainingBudget, currency);
    }
    if (this.highestExpenseDisplay) {
      this.highestExpenseDisplay.textContent = formatCurrency(summary.highestExpense, currency);
    }
    if (this.avgExpenseDisplay) {
      this.avgExpenseDisplay.textContent = formatCurrency(summary.averageExpense, currency);
    }

    // Budget utilization bar and warning badges
    if (this.budgetProgressBar) {
      const clampedPct = Math.min(100, Math.max(0, summary.budgetPercentageUsed));
      this.budgetProgressBar.style.width = `${clampedPct}%`;

      if (summary.isOverBudget) {
        this.budgetProgressBar.className = 'progress-bar bg-danger';
      } else if (clampedPct > 80) {
        this.budgetProgressBar.className = 'progress-bar bg-warning';
      } else {
        this.budgetProgressBar.className = 'progress-bar bg-success';
      }
    }

    if (this.balanceBadge) {
      if (summary.monthlyBudget === 0) {
        this.balanceBadge.textContent = 'No monthly budget set';
        this.balanceBadge.className = 'badge badge-neutral';
      } else if (summary.isOverBudget) {
        this.balanceBadge.textContent = `Over budget by ${formatCurrency(
          Math.abs(summary.remainingBudget),
          currency
        )}`;
        this.balanceBadge.className = 'badge badge-danger';
      } else {
        this.balanceBadge.textContent = `${(100 - summary.budgetPercentageUsed).toFixed(1)}% remaining`;
        this.balanceBadge.className = 'badge badge-success';
      }
    }
  }
}

/**
 * Renders the interactive analytics views (category breakdown, ratio bar, trends, insights).
 */
export class AnalyticsRenderer {
  private insightsContainer: HTMLElement | null;
  private categoryChartContainer: HTMLElement | null;
  private incomeVsExpenseChart: HTMLElement | null;
  private monthlySummaryTableBody: HTMLElement | null;
  private yearlySummaryTableBody: HTMLElement | null;
  private categoryBudgetList: HTMLElement | null;

  constructor() {
    this.insightsContainer = document.getElementById('insightsContainer');
    this.categoryChartContainer = document.getElementById('categoryChartContainer');
    this.incomeVsExpenseChart = document.getElementById('incomeVsExpenseChart');
    this.monthlySummaryTableBody = document.getElementById('monthlySummaryTableBody');
    this.yearlySummaryTableBody = document.getElementById('yearlySummaryTableBody');
    this.categoryBudgetList = document.getElementById('categoryBudgetList');
  }

  public renderCategoryBudgets(budgets: CategoryBudgetProgress[], currency: CurrencyCode): void {
    if (!this.categoryBudgetList) return;
    this.categoryBudgetList.innerHTML = '';

    if (budgets.length === 0) {
      this.categoryBudgetList.innerHTML =
        '<div class="text-muted">No category budgets defined.</div>';
      return;
    }

    budgets.forEach((cb) => {
      const item = document.createElement('div');
      item.className = 'cat-budget-item';

      const progressColor = cb.isOver
        ? 'progress-danger'
        : cb.percentage > 80
          ? 'progress-warning'
          : 'progress-success';

      item.innerHTML = `
        <div class="cat-budget-header">
          <span class="cat-budget-name">${escapeHTML(cb.category)}</span>
          <span class="cat-budget-values">
            ${formatCurrency(cb.spent, currency)} /
            ${formatCurrency(cb.budget, currency)}
          </span>
        </div>
        <div class="progress-container">
          <div class="progress-bar ${progressColor}" style="width: ${Math.min(100, Math.max(0, cb.percentage))}%"></div>
        </div>
      `;

      this.categoryBudgetList?.appendChild(item);
    });
  }

  public renderInsights(insights: SpendingInsight[]): void {
    if (!this.insightsContainer) return;
    this.insightsContainer.innerHTML = '';

    insights.forEach((insight) => {
      const card = document.createElement('div');
      card.className = `insight-card insight-${insight.type}`;
      card.innerHTML = `
        <div class="insight-title">${escapeHTML(insight.title)}</div>
        <div class="insight-message">${escapeHTML(insight.message)}</div>
      `;
      this.insightsContainer?.appendChild(card);
    });
  }

  public renderCategoryBars(
    breakdown: Record<string, number>,
    totalExpense: number,
    currency: CurrencyCode
  ): void {
    if (!this.categoryChartContainer) return;
    this.categoryChartContainer.innerHTML = '';

    const entries = Object.entries(breakdown).filter(([, amt]) => amt > 0);
    if (entries.length === 0) {
      this.categoryChartContainer.innerHTML =
        '<div class="text-muted text-center py-4">No spending data to display.</div>';
      return;
    }

    entries.sort((a, b) => b[1] - a[1]);

    entries.forEach(([cat, amt]) => {
      const pct = totalExpense > 0 ? (amt / totalExpense) * 100 : 0;
      const row = document.createElement('div');
      row.className = 'chart-bar-row';
      row.innerHTML = `
        <div class="chart-bar-label">${escapeHTML(cat)}</div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${pct}%"></div>
        </div>
        <div class="chart-bar-amt">${formatCurrency(amt, currency)} (${pct.toFixed(0)}%)</div>
      `;
      this.categoryChartContainer?.appendChild(row);
    });
  }

  public renderIncomeExpenseRatio(income: number, expenses: number, currency: CurrencyCode): void {
    if (!this.incomeVsExpenseChart) return;
    this.incomeVsExpenseChart.innerHTML = '';

    const total = income + expenses;
    if (total === 0) {
      this.incomeVsExpenseChart.innerHTML =
        '<div class="text-muted text-center py-4">No transactions recorded.</div>';
      return;
    }

    const incPct = (income / total) * 100;
    const expPct = (expenses / total) * 100;

    this.incomeVsExpenseChart.innerHTML = `
      <div class="ratio-bar-wrapper">
        <div class="ratio-segment ratio-income" style="width: ${incPct}%" title="Income: ${incPct.toFixed(1)}%"></div>
        <div class="ratio-segment ratio-expense" style="width: ${expPct}%" title="Expenses: ${expPct.toFixed(1)}%"></div>
      </div>
      <div class="ratio-legend">
        <span class="legend-income">● Income: ${formatCurrency(income, currency)} (${incPct.toFixed(1)}%)</span>
        <span class="legend-expense">● Expenses: ${formatCurrency(expenses, currency)} (${expPct.toFixed(1)}%)</span>
      </div>
    `;
  }

  public renderPeriodTrends(
    monthly: PeriodSummary[],
    yearly: PeriodSummary[],
    currency: CurrencyCode
  ): void {
    if (this.monthlySummaryTableBody) {
      this.monthlySummaryTableBody.innerHTML = '';
      monthly.forEach((m) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${m.period}</strong></td>
          <td class="amount-income">+${formatCurrency(m.income, currency)}</td>
          <td class="amount-expense">-${formatCurrency(m.expenses, currency)}</td>
          <td class="${m.netSavings >= 0 ? 'text-positive' : 'text-negative'}">
            ${formatCurrency(m.netSavings, currency)}
          </td>
          <td>${m.savingsRate.toFixed(1)}%</td>
        `;
        this.monthlySummaryTableBody?.appendChild(row);
      });
    }

    if (this.yearlySummaryTableBody) {
      this.yearlySummaryTableBody.innerHTML = '';
      yearly.forEach((y) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${y.period}</strong></td>
          <td class="amount-income">+${formatCurrency(y.income, currency)}</td>
          <td class="amount-expense">-${formatCurrency(y.expenses, currency)}</td>
          <td class="${y.netSavings >= 0 ? 'text-positive' : 'text-negative'}">
            ${formatCurrency(y.netSavings, currency)}
          </td>
          <td>${y.savingsRate.toFixed(1)}%</td>
        `;
        this.yearlySummaryTableBody?.appendChild(row);
      });
    }
  }
}

/**
 * Renders the transactions data table.
 */
export class TransactionTableRenderer {
  private expenseTableBody: HTMLElement | null;
  private emptyState: HTMLElement | null;

  constructor() {
    this.expenseTableBody = document.getElementById('expenseTableBody');
    this.emptyState = document.getElementById('emptyState');
  }

  public render(
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
      const isIncome = isIncomeTransaction(exp);
      const row = document.createElement('tr');
      row.className = isIncome ? 'row-income' : 'row-expense';

      // Type Badge
      const typeBadge = isIncome
        ? '<span class="badge badge-success">Income</span>'
        : '<span class="badge badge-danger">Expense</span>';

      // Recurring badge
      const recurringBadge = exp.isRecurring
        ? '<span class="badge badge-neutral badge-recurring" title="Recurring Transaction">🔄</span> '
        : '';

      const formattedAmount = `${isIncome ? '+' : '-'}${formatCurrency(
        exp.amount,
        settings.currency
      )}`;

      const amountClass = isIncome ? 'amount-income' : 'amount-expense';

      row.innerHTML = `
        <td>${exp.date}</td>
        <td>${typeBadge}</td>
        <td>
          <strong>${escapeHTML(exp.title)}</strong>
          ${recurringBadge}
          ${exp.notes ? `<div class="tx-notes">${escapeHTML(exp.notes)}</div>` : ''}
        </td>
        <td><span class="category-pill">${escapeHTML(exp.category)}</span></td>
        <td class="${amountClass}"><strong>${formattedAmount}</strong></td>
        <td class="action-cell">
          <button class="btn btn-sm btn-icon btn-edit" data-id="${exp.id}" title="Edit transaction">✏️</button>
          <button class="btn btn-sm btn-icon btn-delete" data-id="${exp.id}" title="Delete transaction">🗑️</button>
        </td>
      `;

      const editBtn = row.querySelector('.btn-edit');
      editBtn?.addEventListener('click', () => onEdit(exp.id));

      const deleteBtn = row.querySelector('.btn-delete');
      deleteBtn?.addEventListener('click', () => onDelete(exp.id));

      this.expenseTableBody?.appendChild(row);
    });
  }
}

/**
 * UI Renderer coordinating the focused view renderers.
 * Preserves complete backward compatibility with the existing ExpenseUI API.
 */
export class ExpenseUI {
  private dashboardRenderer: DashboardRenderer;
  private analyticsRenderer: AnalyticsRenderer;
  private tableRenderer: TransactionTableRenderer;

  constructor() {
    this.dashboardRenderer = new DashboardRenderer();
    this.analyticsRenderer = new AnalyticsRenderer();
    this.tableRenderer = new TransactionTableRenderer();
  }

  public updateDashboard(summary: ExpenseDashboardSummary, settings: UserFinanceSettings): void {
    const currency = settings.currency;
    this.dashboardRenderer.render(summary, settings);
    this.analyticsRenderer.renderCategoryBudgets(summary.categoryBudgetProgress, currency);
    this.analyticsRenderer.renderInsights(summary.insights);
    this.analyticsRenderer.renderCategoryBars(
      summary.categoryBreakdown,
      summary.totalExpenses,
      currency
    );
    this.analyticsRenderer.renderIncomeExpenseRatio(
      summary.totalIncome,
      summary.totalExpenses,
      currency
    );
    this.analyticsRenderer.renderPeriodTrends(
      summary.monthlyTrends,
      summary.yearlyTrends,
      currency
    );
  }

  public renderExpensesTable(
    expenses: Expense[],
    settings: UserFinanceSettings,
    onEdit: (id: string) => void,
    onDelete: (id: string) => void
  ): void {
    this.tableRenderer.render(expenses, settings, onEdit, onDelete);
  }

  public showToast(message: string, isError = false): void {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, 3000);
  }
}
