import { formatCurrency, isIncomeTransaction } from './calculations.js';
import { computeDailyTrend, renderMonthlyLineChartSVG, renderDonutChart, renderComparisonBarChartSVG, renderAnalyticsMonthlyTrendsSVG } from './charts.js';
export function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
export class ExpenseUI {
    constructor() {
        this.totalExpensesDisplay = document.getElementById('totalExpensesDisplay');
        this.totalIncomeDisplay = document.getElementById('totalIncomeDisplay');
        this.netBalanceDisplay = document.getElementById('netBalanceDisplay');
        this.expenseTableBody = document.getElementById('expenseTableBody');
        this.emptyState = document.getElementById('emptyState');
        this.toastElement = document.getElementById('appToast');
        this.budgetDisplay = document.getElementById('budgetDisplay');
        this.remainingBalanceDisplay = document.getElementById('remainingBalanceDisplay');
        this.budgetProgressBar = document.getElementById('budgetProgressBar');
        this.budgetSpentDisplay = document.getElementById('budgetSpentDisplay');
        this.budgetPercentDisplay = document.getElementById('budgetPercentDisplay');
        this.budgetAlertText = document.getElementById('budgetAlertText');
        this.categoryBudgetList = document.getElementById('categoryBudgetList');
        this.insightsContainer = document.getElementById('insightsContainer');
        this.monthlyChartSVG = document.getElementById('monthlyOverviewChartSVG');
        this.donutCanvas = document.getElementById('topCategoriesCanvas');
        this.donutLegend = document.getElementById('topCategoriesLegend');
        // Analytics elements
        this.analyticsNetSavings = document.getElementById('analyticsNetSavings');
        this.analyticsSavingsRate = document.getElementById('analyticsSavingsRate');
        this.analyticsAvgExpense = document.getElementById('analyticsAvgExpense');
        this.analyticsTxCount = document.getElementById('analyticsTxCount');
        this.analyticsHighestExpense = document.getElementById('analyticsHighestExpense');
        this.incomeVsExpenseChartSVG = document.getElementById('incomeVsExpenseChartSVG');
        this.analyticsMonthlyTrendsSVG = document.getElementById('analyticsMonthlyTrendsSVG');
    }
    updateDashboard(summary, settings, allExpenses = [], insights = [], categoryBudgets = [], onDeleteCategoryBudget) {
        const currency = settings.currency;
        if (this.netBalanceDisplay) {
            this.netBalanceDisplay.textContent = formatCurrency(summary.totalBalance, currency);
        }
        if (this.totalIncomeDisplay) {
            this.totalIncomeDisplay.textContent = formatCurrency(summary.totalIncome, currency);
        }
        if (this.totalExpensesDisplay) {
            this.totalExpensesDisplay.textContent = formatCurrency(summary.totalExpenses, currency);
        }
        // Budgets Section elements
        if (this.budgetDisplay) {
            this.budgetDisplay.textContent = formatCurrency(summary.monthlyBudget, currency);
        }
        if (this.budgetSpentDisplay) {
            this.budgetSpentDisplay.textContent = formatCurrency(summary.monthlyExpenses, currency);
        }
        if (this.remainingBalanceDisplay) {
            this.remainingBalanceDisplay.textContent = formatCurrency(summary.remainingBudget, currency);
        }
        if (this.budgetPercentDisplay) {
            this.budgetPercentDisplay.textContent = `${summary.budgetPercentageUsed.toFixed(1)}%`;
        }
        if (this.budgetProgressBar) {
            const pct = Math.min(100, Math.max(0, summary.budgetPercentageUsed));
            this.budgetProgressBar.style.width = `${pct}%`;
            this.budgetProgressBar.className = `progress-bar-fill ${summary.isOverBudget ? 'bg-danger' : summary.budgetPercentageUsed > 80 ? 'bg-warning' : 'bg-primary'}`;
        }
        if (this.budgetAlertText) {
            if (summary.monthlyBudget <= 0) {
                this.budgetAlertText.textContent =
                    'No monthly limit set. Click "Set Monthly Budget" to establish one.';
                this.budgetAlertText.className = 'budget-status-msg';
            }
            else if (summary.isOverBudget) {
                this.budgetAlertText.textContent = `Warning: Over budget by ${formatCurrency(summary.monthlyExpenses - summary.monthlyBudget, currency)}!`;
                this.budgetAlertText.className = 'budget-status-msg text-danger font-bold';
            }
            else {
                this.budgetAlertText.textContent = `Healthy status: ${formatCurrency(summary.remainingBudget, currency)} left for this month.`;
                this.budgetAlertText.className = 'budget-status-msg text-green font-bold';
            }
        }
        // Dashboard Charts
        if (this.monthlyChartSVG) {
            const now = new Date();
            const points = computeDailyTrend(allExpenses, now.getFullYear(), now.getMonth());
            renderMonthlyLineChartSVG(this.monthlyChartSVG, points, formatCurrency(summary.totalBalance, currency));
        }
        if (this.donutCanvas && this.donutLegend) {
            renderDonutChart(this.donutCanvas, this.donutLegend, summary.categoryBreakdown, summary.totalExpenses);
        }
        // Analytics Page Updating
        this.updateAnalyticsPage(summary, currency);
        // Insights & Category Budgets
        this.renderInsights(insights);
        this.renderCategoryBudgets(categoryBudgets, currency, onDeleteCategoryBudget);
    }
    updateAnalyticsPage(summary, currency) {
        if (this.analyticsNetSavings) {
            this.analyticsNetSavings.textContent = formatCurrency(summary.netSavings, currency);
        }
        if (this.analyticsSavingsRate) {
            this.analyticsSavingsRate.textContent = `Savings Rate: ${summary.savingsRate.toFixed(1)}%`;
        }
        if (this.analyticsAvgExpense) {
            this.analyticsAvgExpense.textContent = formatCurrency(summary.averageExpense, currency);
        }
        if (this.analyticsTxCount) {
            this.analyticsTxCount.textContent = `${summary.transactionCount} transactions recorded`;
        }
        if (this.analyticsHighestExpense) {
            this.analyticsHighestExpense.textContent = formatCurrency(summary.highestExpense, currency);
        }
        const currSymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
        if (this.incomeVsExpenseChartSVG) {
            renderComparisonBarChartSVG(this.incomeVsExpenseChartSVG, summary.totalIncome, summary.totalExpenses, currSymbol);
        }
        if (this.analyticsMonthlyTrendsSVG) {
            renderAnalyticsMonthlyTrendsSVG(this.analyticsMonthlyTrendsSVG, summary.monthlyTrends);
        }
    }
    renderCategoryBudgets(budgets, currency, onDelete) {
        if (!this.categoryBudgetList)
            return;
        this.categoryBudgetList.innerHTML = '';
        if (budgets.length === 0) {
            this.categoryBudgetList.innerHTML =
                '<p class="text-sub text-sm">No category budgets configured yet. Click "+ Add Category Limit" to define spending caps for food, transit, etc.</p>';
            return;
        }
        budgets.forEach((cb) => {
            var _a, _b;
            const item = document.createElement('div');
            item.className = 'cat-budget-card';
            const pctFormatted = cb.percentage.toFixed(0);
            const isOver = cb.isOver;
            const barClass = isOver ? 'bg-danger' : cb.percentage > 80 ? 'bg-warning' : 'bg-primary';
            item.innerHTML = `
        <div class="cat-budget-header">
          <div>
            <strong class="text-main">${escapeHTML(cb.category)}</strong>
            <span class="badge ${isOver ? 'badge-danger' : 'badge-neutral'}" style="margin-left: 8px;">${pctFormatted}%</span>
          </div>
          <div class="cat-budget-actions">
            <span class="text-sub text-xs">${formatCurrency(cb.spent, currency)} / ${formatCurrency(cb.budget, currency)}</span>
            <button class="action-btn del-cat-btn" data-cat="${escapeHTML(cb.category)}" title="Remove Category Budget" type="button">🗑️</button>
          </div>
        </div>
        <div class="progress-track-wrap">
          <div class="progress-bar-fill ${barClass}" style="width: ${Math.min(100, cb.percentage)}%"></div>
        </div>
        <div class="text-xs ${isOver ? 'text-pink font-bold' : 'text-sub'}">
          ${isOver ? `Over budget by ${formatCurrency(cb.spent - cb.budget, currency)}!` : `${formatCurrency(Math.max(0, cb.budget - cb.spent), currency)} remaining`}
        </div>
      `;
            (_a = item.querySelector('.del-cat-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
                if (onDelete)
                    onDelete(cb.category);
            });
            (_b = this.categoryBudgetList) === null || _b === void 0 ? void 0 : _b.appendChild(item);
        });
    }
    renderInsights(insights) {
        if (!this.insightsContainer)
            return;
        this.insightsContainer.innerHTML = '';
        if (insights.length === 0) {
            this.insightsContainer.innerHTML =
                '<p class="text-sub text-sm">No financial insights recorded yet. Add transactions to generate spending recommendations.</p>';
            return;
        }
        insights.forEach((ins) => {
            var _a;
            const card = document.createElement('div');
            card.className = `insight-item insight-${ins.type}`;
            card.innerHTML = `
        <h4>${escapeHTML(ins.title)}</h4>
        <p>${escapeHTML(ins.message)}</p>
      `;
            (_a = this.insightsContainer) === null || _a === void 0 ? void 0 : _a.appendChild(card);
        });
    }
    renderExpensesTable(expenses, settings, onEdit, onDelete, dateFormat = 'YYYY-MM-DD') {
        if (!this.expenseTableBody)
            return;
        this.expenseTableBody.innerHTML = '';
        if (expenses.length === 0) {
            if (this.emptyState)
                this.emptyState.style.display = 'flex';
            return;
        }
        if (this.emptyState)
            this.emptyState.style.display = 'none';
        expenses.forEach((item) => {
            var _a, _b, _c;
            const row = document.createElement('tr');
            const isIncome = isIncomeTransaction(item);
            const amountClass = isIncome ? 'text-green font-bold' : 'text-pink font-bold';
            const amountPrefix = isIncome ? '+' : '-';
            let formattedDate = item.date;
            if (dateFormat === 'DD/MM/YYYY' && item.date.includes('-')) {
                const parts = item.date.split('-');
                formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            else if (dateFormat === 'MM/DD/YYYY' && item.date.includes('-')) {
                const parts = item.date.split('-');
                formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
            }
            row.innerHTML = `
        <td class="font-medium text-sub text-xs">${escapeHTML(formattedDate)}</td>
        <td>
          <div class="font-semibold text-main">${escapeHTML(item.title)}</div>
          ${item.notes ? `<div class="text-sub text-xs">${escapeHTML(item.notes)}</div>` : ''}
        </td>
        <td><span class="badge badge-neutral">${escapeHTML(item.category)}</span></td>
        <td><span class="badge ${isIncome ? 'badge-success' : 'badge-danger'}">${isIncome ? 'Income' : 'Expense'}</span></td>
        <td><span class="text-sub text-xs">${escapeHTML(item.paymentMethod || 'UPI / Card')}</span></td>
        <td class="${amountClass}">${amountPrefix}${formatCurrency(item.amount, settings.currency)}</td>
        <td style="text-align: right;">
          <button class="action-btn edit-btn" data-id="${item.id}" title="Edit" type="button">✏️</button>
          <button class="action-btn delete-btn" data-id="${item.id}" title="Delete" type="button">🗑️</button>
        </td>
      `;
            (_a = row.querySelector('.edit-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => onEdit(item.id));
            (_b = row.querySelector('.delete-btn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => onDelete(item.id));
            (_c = this.expenseTableBody) === null || _c === void 0 ? void 0 : _c.appendChild(row);
        });
    }
    showToast(message, isError = false) {
        if (!this.toastElement)
            return;
        this.toastElement.textContent = message;
        this.toastElement.className = `app-toast ${isError ? 'toast-error' : 'toast-success'}`;
        this.toastElement.style.display = 'block';
        setTimeout(() => {
            if (this.toastElement)
                this.toastElement.style.display = 'none';
        }, 3200);
    }
}
