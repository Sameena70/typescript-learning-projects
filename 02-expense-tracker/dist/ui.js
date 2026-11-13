import { ExpenseCalculations, isIncomeTransaction } from './calculations.js';
/**
 * UI Renderer for Expense Tracker.
 */
export class ExpenseUI {
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
    updateDashboard(summary, settings) {
        const currency = settings.currency;
        if (this.totalExpensesDisplay) {
            this.totalExpensesDisplay.textContent = ExpenseCalculations.formatCurrency(summary.totalExpenses, currency);
        }
        if (this.totalIncomeDisplay) {
            this.totalIncomeDisplay.textContent = ExpenseCalculations.formatCurrency(summary.totalIncome, currency);
        }
        if (this.netBalanceDisplay) {
            this.netBalanceDisplay.textContent = ExpenseCalculations.formatCurrency(summary.totalBalance, currency);
            if (summary.totalBalance >= 0) {
                this.netBalanceDisplay.className = 'stat-value text-positive';
            }
            else {
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
            this.budgetDisplay.textContent = ExpenseCalculations.formatCurrency(summary.monthlyBudget, currency);
        }
        if (this.remainingBalanceDisplay) {
            this.remainingBalanceDisplay.textContent = ExpenseCalculations.formatCurrency(summary.remainingBudget, currency);
        }
        if (this.highestExpenseDisplay) {
            this.highestExpenseDisplay.textContent = ExpenseCalculations.formatCurrency(summary.highestExpense, currency);
        }
        if (this.avgExpenseDisplay) {
            this.avgExpenseDisplay.textContent = ExpenseCalculations.formatCurrency(summary.averageExpense, currency);
        }
        // Budget utilization bar and warning badges
        if (this.budgetProgressBar) {
            const clampedPct = Math.min(100, Math.max(0, summary.budgetPercentageUsed));
            this.budgetProgressBar.style.width = `${clampedPct}%`;
            if (summary.isOverBudget) {
                this.budgetProgressBar.className = 'progress-bar bg-danger';
            }
            else if (clampedPct > 80) {
                this.budgetProgressBar.className = 'progress-bar bg-warning';
            }
            else {
                this.budgetProgressBar.className = 'progress-bar bg-success';
            }
        }
        if (this.balanceBadge) {
            if (summary.monthlyBudget === 0) {
                this.balanceBadge.textContent = 'No monthly budget set';
                this.balanceBadge.className = 'badge badge-neutral';
            }
            else if (summary.isOverBudget) {
                this.balanceBadge.textContent = `Over budget by ${ExpenseCalculations.formatCurrency(Math.abs(summary.remainingBudget), currency)}`;
                this.balanceBadge.className = 'badge badge-danger';
            }
            else {
                this.balanceBadge.textContent = `${(100 - summary.budgetPercentageUsed).toFixed(1)}% remaining`;
                this.balanceBadge.className = 'badge badge-success';
            }
        }
        this.renderCategoryBudgets(summary.categoryBudgetProgress, currency);
        this.renderInsights(summary.insights);
        this.renderCategoryBars(summary.categoryBreakdown, summary.totalExpenses, currency);
        this.renderIncomeExpenseRatio(summary.totalIncome, summary.totalExpenses, currency);
        this.renderPeriodTrends(summary.monthlyTrends, summary.yearlyTrends, currency);
    }
    renderExpensesTable(expenses, settings, onEdit, onDelete) {
        if (!this.expenseTableBody)
            return;
        this.expenseTableBody.innerHTML = '';
        if (expenses.length === 0) {
            if (this.emptyState)
                this.emptyState.style.display = 'block';
            return;
        }
        if (this.emptyState)
            this.emptyState.style.display = 'none';
        expenses.forEach((exp) => {
            var _a;
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
            const formattedAmount = `${isIncome ? '+' : '-'}${ExpenseCalculations.formatCurrency(exp.amount, settings.currency)}`;
            const amountClass = isIncome ? 'amount-income' : 'amount-expense';
            row.innerHTML = `
        <td>${exp.date}</td>
        <td>${typeBadge}</td>
        <td>
          <strong>${this.escapeHTML(exp.title)}</strong>
          ${recurringBadge}
          ${exp.notes ? `<div class="tx-notes">${this.escapeHTML(exp.notes)}</div>` : ''}
        </td>
        <td><span class="category-pill">${this.escapeHTML(exp.category)}</span></td>
        <td class="${amountClass}"><strong>${formattedAmount}</strong></td>
        <td class="action-cell">
          <button class="btn btn-sm btn-icon btn-edit" data-id="${exp.id}" title="Edit transaction">✏️</button>
          <button class="btn btn-sm btn-icon btn-delete" data-id="${exp.id}" title="Delete transaction">🗑️</button>
        </td>
      `;
            const editBtn = row.querySelector('.btn-edit');
            editBtn === null || editBtn === void 0 ? void 0 : editBtn.addEventListener('click', () => onEdit(exp.id));
            const deleteBtn = row.querySelector('.btn-delete');
            deleteBtn === null || deleteBtn === void 0 ? void 0 : deleteBtn.addEventListener('click', () => onDelete(exp.id));
            (_a = this.expenseTableBody) === null || _a === void 0 ? void 0 : _a.appendChild(row);
        });
    }
    renderCategoryBudgets(budgets, currency) {
        if (!this.categoryBudgetList)
            return;
        this.categoryBudgetList.innerHTML = '';
        if (budgets.length === 0) {
            this.categoryBudgetList.innerHTML =
                '<div class="text-muted">No category budgets defined.</div>';
            return;
        }
        budgets.forEach((cb) => {
            var _a;
            const item = document.createElement('div');
            item.className = 'cat-budget-item';
            const progressColor = cb.isOver
                ? 'progress-danger'
                : cb.percentage > 80
                    ? 'progress-warning'
                    : 'progress-success';
            item.innerHTML = `
        <div class="cat-budget-header">
          <span class="cat-budget-name">${this.escapeHTML(cb.category)}</span>
          <span class="cat-budget-values">
            ${ExpenseCalculations.formatCurrency(cb.spent, currency)} /
            ${ExpenseCalculations.formatCurrency(cb.budget, currency)}
          </span>
        </div>
        <div class="progress-container">
          <div class="progress-bar ${progressColor}" style="width: ${Math.min(100, Math.max(0, cb.percentage))}%"></div>
        </div>
      `;
            (_a = this.categoryBudgetList) === null || _a === void 0 ? void 0 : _a.appendChild(item);
        });
    }
    renderInsights(insights) {
        if (!this.insightsContainer)
            return;
        this.insightsContainer.innerHTML = '';
        insights.forEach((insight) => {
            var _a;
            const card = document.createElement('div');
            card.className = `insight-card insight-${insight.type}`;
            card.innerHTML = `
        <div class="insight-title">${this.escapeHTML(insight.title)}</div>
        <div class="insight-message">${this.escapeHTML(insight.message)}</div>
      `;
            (_a = this.insightsContainer) === null || _a === void 0 ? void 0 : _a.appendChild(card);
        });
    }
    renderCategoryBars(breakdown, totalExpense, currency) {
        if (!this.categoryChartContainer)
            return;
        this.categoryChartContainer.innerHTML = '';
        const entries = Object.entries(breakdown).filter(([, amt]) => amt > 0);
        if (entries.length === 0) {
            this.categoryChartContainer.innerHTML =
                '<div class="text-muted text-center py-4">No spending data to display.</div>';
            return;
        }
        entries.sort((a, b) => b[1] - a[1]);
        entries.forEach(([cat, amt]) => {
            var _a;
            const pct = totalExpense > 0 ? (amt / totalExpense) * 100 : 0;
            const row = document.createElement('div');
            row.className = 'chart-bar-row';
            row.innerHTML = `
        <div class="chart-bar-label">${this.escapeHTML(cat)}</div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${pct}%"></div>
        </div>
        <div class="chart-bar-amt">${ExpenseCalculations.formatCurrency(amt, currency)} (${pct.toFixed(0)}%)</div>
      `;
            (_a = this.categoryChartContainer) === null || _a === void 0 ? void 0 : _a.appendChild(row);
        });
    }
    renderIncomeExpenseRatio(income, expenses, currency) {
        if (!this.incomeVsExpenseChart)
            return;
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
        <span class="legend-income">● Income: ${ExpenseCalculations.formatCurrency(income, currency)} (${incPct.toFixed(1)}%)</span>
        <span class="legend-expense">● Expenses: ${ExpenseCalculations.formatCurrency(expenses, currency)} (${expPct.toFixed(1)}%)</span>
      </div>
    `;
    }
    renderPeriodTrends(monthly, yearly, currency) {
        if (this.monthlySummaryTableBody) {
            this.monthlySummaryTableBody.innerHTML = '';
            monthly.forEach((m) => {
                var _a;
                const row = document.createElement('tr');
                row.innerHTML = `
          <td><strong>${m.period}</strong></td>
          <td class="amount-income">+${ExpenseCalculations.formatCurrency(m.income, currency)}</td>
          <td class="amount-expense">-${ExpenseCalculations.formatCurrency(m.expenses, currency)}</td>
          <td class="${m.netSavings >= 0 ? 'text-positive' : 'text-negative'}">
            ${ExpenseCalculations.formatCurrency(m.netSavings, currency)}
          </td>
          <td>${m.savingsRate.toFixed(1)}%</td>
        `;
                (_a = this.monthlySummaryTableBody) === null || _a === void 0 ? void 0 : _a.appendChild(row);
            });
        }
        if (this.yearlySummaryTableBody) {
            this.yearlySummaryTableBody.innerHTML = '';
            yearly.forEach((y) => {
                var _a;
                const row = document.createElement('tr');
                row.innerHTML = `
          <td><strong>${y.period}</strong></td>
          <td class="amount-income">+${ExpenseCalculations.formatCurrency(y.income, currency)}</td>
          <td class="amount-expense">-${ExpenseCalculations.formatCurrency(y.expenses, currency)}</td>
          <td class="${y.netSavings >= 0 ? 'text-positive' : 'text-negative'}">
            ${ExpenseCalculations.formatCurrency(y.netSavings, currency)}
          </td>
          <td>${y.savingsRate.toFixed(1)}%</td>
        `;
                (_a = this.yearlySummaryTableBody) === null || _a === void 0 ? void 0 : _a.appendChild(row);
            });
        }
    }
    showToast(message, isError = false) {
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
                if (toast.parentElement)
                    toast.parentElement.removeChild(toast);
            }, 300);
        }, 3000);
    }
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
