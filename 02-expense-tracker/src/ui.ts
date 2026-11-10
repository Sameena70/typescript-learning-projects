import { Expense, ExpenseDashboardSummary } from './types.js';
import { ExpenseCalculations } from './calculations.js';

/**
 * UI Renderer for Expense Tracker.
 */
export class ExpenseUI {
  private totalExpensesDisplay: HTMLElement;
  private expenseCountText: HTMLElement;
  private budgetDisplay: HTMLElement;
  private remainingBalanceDisplay: HTMLElement;
  private balanceBadge: HTMLElement;
  private budgetProgressBar: HTMLElement;
  private highestExpenseDisplay: HTMLElement;
  private avgExpenseDisplay: HTMLElement;

  private expenseTableBody: HTMLElement;
  private emptyState: HTMLElement;

  constructor() {
    this.totalExpensesDisplay = document.getElementById('totalExpensesDisplay')!;
    this.expenseCountText = document.getElementById('expenseCountText')!;
    this.budgetDisplay = document.getElementById('budgetDisplay')!;
    this.remainingBalanceDisplay = document.getElementById('remainingBalanceDisplay')!;
    this.balanceBadge = document.getElementById('balanceBadge')!;
    this.budgetProgressBar = document.getElementById('budgetProgressBar')!;
    this.highestExpenseDisplay = document.getElementById('highestExpenseDisplay')!;
    this.avgExpenseDisplay = document.getElementById('avgExpenseDisplay')!;

    this.expenseTableBody = document.getElementById('expenseTableBody')!;
    this.emptyState = document.getElementById('emptyState')!;
  }

  public updateDashboard(summary: ExpenseDashboardSummary): void {
    if (this.totalExpensesDisplay) {
      this.totalExpensesDisplay.textContent = ExpenseCalculations.formatINR(summary.totalSpent);
    }
    if (this.expenseCountText) {
      this.expenseCountText.textContent = `${summary.transactionCount} transactions recorded`;
    }
    if (this.budgetDisplay) {
      this.budgetDisplay.textContent = ExpenseCalculations.formatINR(summary.monthlyBudget);
    }
    if (this.remainingBalanceDisplay) {
      this.remainingBalanceDisplay.textContent = ExpenseCalculations.formatINR(summary.remainingBudget);
    }
    if (this.highestExpenseDisplay) {
      this.highestExpenseDisplay.textContent = ExpenseCalculations.formatINR(summary.highestExpense);
    }
    if (this.avgExpenseDisplay) {
      this.avgExpenseDisplay.textContent = ExpenseCalculations.formatINR(summary.averageExpense);
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
      this.budgetProgressBar.style.width = `${summary.budgetPercentageUsed}%`;
      if (summary.isOverBudget) {
        this.budgetProgressBar.style.backgroundColor = '#ef4444';
      } else if (summary.budgetPercentageUsed > 80) {
        this.budgetProgressBar.style.backgroundColor = '#f59e0b';
      } else {
        this.budgetProgressBar.style.backgroundColor = '#10b981';
      }
    }
  }

  public renderExpensesTable(
    expenses: Expense[],
    onEdit: (id: string) => void,
    onDelete: (id: string) => void
  ): void {
    this.expenseTableBody.innerHTML = '';

    if (expenses.length === 0) {
      this.emptyState.style.display = 'block';
      return;
    }

    this.emptyState.style.display = 'none';

    expenses.forEach(exp => {
      const row = document.createElement('tr');
      row.className = 'expense-row';

      const notesHtml = exp.notes ? `<div class="expense-notes">${this.escapeHTML(exp.notes)}</div>` : '';

      row.innerHTML = `
        <td>
          <div class="expense-title-cell">
            <span class="font-medium">${this.escapeHTML(exp.title)}</span>
            ${notesHtml}
          </div>
        </td>
        <td><span class="category-tag">${this.escapeHTML(exp.category)}</span></td>
        <td><span class="date-text">${exp.date}</span></td>
        <td><span class="amount-text font-bold">${ExpenseCalculations.formatINR(exp.amount)}</span></td>
        <td class="text-center">
          <div class="action-buttons-group">
            <button class="action-btn edit-btn" data-id="${exp.id}" title="Edit Expense">✏️</button>
            <button class="action-btn delete-btn" data-id="${exp.id}" title="Delete Expense">🗑️</button>
          </div>
        </td>
      `;

      row.querySelector('.edit-btn')?.addEventListener('click', () => onEdit(exp.id));
      row.querySelector('.delete-btn')?.addEventListener('click', () => onDelete(exp.id));

      this.expenseTableBody.appendChild(row);
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

  private escapeHTML(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

