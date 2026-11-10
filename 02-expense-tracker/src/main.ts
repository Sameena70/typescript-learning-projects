import { ExpenseService } from './expense-service.js';
import { ExpenseCalculations } from './calculations.js';
import { ExpenseValidator } from './validation.js';
import { ExpenseImportExport } from './import-export.js';
import { ExpenseUI } from './ui.js';
import {
  CurrencyCode,
  ExpenseCategory,
  ExpenseFilterOptions,
  RecurringFrequency,
  TransactionType
} from './types.js';

class ExpenseApp {
  private service: ExpenseService;
  private ui: ExpenseUI;
  private currentEditingId: string | null = null;

  constructor() {
    this.service = new ExpenseService();
    this.ui = new ExpenseUI();

    this.init();
  }

  private init(): void {
    // Process any due recurring transactions upon startup
    const generated = this.service.processRecurringTransactions();
    if (generated > 0) {
      this.ui.showToast(`Processed ${generated} recurring transaction(s).`);
    }

    this.bindEvents();
    this.syncCurrencyUI();
    this.refresh();
  }

  private refresh(): void {
    const filterOptions = this.getActiveFilters();
    const filteredExpenses = this.service.filterExpenses(filterOptions);
    const allExpenses = this.service.getExpenses();
    const budget = this.service.getBudget();
    const categoryBudgets = this.service.getCategoryBudgets();
    const settings = this.service.getSettings();

    const summary = ExpenseCalculations.generateSummary(allExpenses, budget, categoryBudgets);
    this.ui.updateDashboard(summary, settings);

    this.ui.renderExpensesTable(
      filteredExpenses,
      settings,
      (id: string) => this.openEditModal(id),
      (id: string) => this.handleDelete(id)
    );
  }

  private syncCurrencyUI(): void {
    const currencySelect = document.getElementById('currencySelect') as HTMLSelectElement;
    if (currencySelect) {
      currencySelect.value = this.service.getCurrency();
    }
  }

  private getActiveFilters(): ExpenseFilterOptions {
    const typeEl = document.getElementById('typeFilter') as HTMLSelectElement;
    const categoryEl = document.getElementById('categoryFilter') as HTMLSelectElement;
    const searchEl = document.getElementById('searchDescriptionInput') as HTMLInputElement;
    const startDateEl = document.getElementById('startDateFilter') as HTMLInputElement;
    const endDateEl = document.getElementById('endDateFilter') as HTMLInputElement;
    const sortByEl = document.getElementById('sortBySelect') as HTMLSelectElement;
    const sortOrderEl = document.getElementById('sortOrderSelect') as HTMLSelectElement;

    return {
      type: (typeEl?.value as 'ALL' | TransactionType) || 'ALL',
      category: categoryEl?.value || 'ALL',
      searchQuery: searchEl?.value || '',
      startDate: startDateEl?.value || undefined,
      endDate: endDateEl?.value || undefined,
      sortBy: (sortByEl?.value as 'date' | 'amount' | 'category') || 'date',
      sortOrder: (sortOrderEl?.value as 'asc' | 'desc') || 'desc'
    };
  }

  private handleDelete(id: string): void {
    const expense = this.service.getExpenseById(id);
    if (!expense) return;

    if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
      try {
        this.service.deleteExpense(id);
        this.ui.showToast('Transaction deleted successfully.');
        this.refresh();
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.ui.showToast(error.message, true);
        }
      }
    }
  }

  private openEditModal(id: string): void {
    const expense = this.service.getExpenseById(id);
    if (!expense) return;

    this.currentEditingId = id;
    const modal = document.getElementById('editExpenseModal') as HTMLDivElement;
    const titleInput = document.getElementById('editTitleInput') as HTMLInputElement;
    const amountInput = document.getElementById('editAmountInput') as HTMLInputElement;
    const categoryInput = document.getElementById('editCategorySelect') as HTMLSelectElement;
    const dateInput = document.getElementById('editDateInput') as HTMLInputElement;
    const notesInput = document.getElementById('editNotesInput') as HTMLInputElement;
    const expenseRadio = document.getElementById('editTypeExpense') as HTMLInputElement;
    const incomeRadio = document.getElementById('editTypeIncome') as HTMLInputElement;

    if (expense.type === 'income') {
      incomeRadio.checked = true;
    } else {
      expenseRadio.checked = true;
    }

    titleInput.value = expense.title;
    amountInput.value = expense.amount.toString();
    categoryInput.value = expense.category;
    dateInput.value = expense.date;
    notesInput.value = expense.notes || '';

    modal.classList.remove('hidden');
  }

  private closeEditModal(): void {
    this.currentEditingId = null;
    const modal = document.getElementById('editExpenseModal');
    modal?.classList.add('hidden');
  }

  private renderRecurringRulesList(): void {
    const listEl = document.getElementById('recurringRulesList');
    if (!listEl) return;

    const rules = this.service.getRecurringRules();
    const settings = this.service.getSettings();

    if (rules.length === 0) {
      listEl.innerHTML = '<p class="text-muted text-sm">No recurring rules configured yet.</p>';
      return;
    }

    listEl.innerHTML = rules
      .map(
        (r) => `
        <div class="recurring-rule-item">
          <div>
            <strong>${this.ui.escapeHTML(r.title)}</strong> 
            <span class="type-badge ${r.type === 'income' ? 'income-badge' : 'expense-badge'}">${r.type}</span>
            <div class="text-sm text-muted">
              ${ExpenseCalculations.formatCurrency(r.amount, settings.currency)} • ${r.frequency} • Next: ${r.nextDueDate}
            </div>
          </div>
          <button class="action-btn delete-rec-btn" data-rule-id="${r.id}" title="Remove Rule">🗑️</button>
        </div>
      `
      )
      .join('');

    listEl.querySelectorAll('.delete-rec-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const ruleId = (e.currentTarget as HTMLElement).getAttribute('data-rule-id');
        if (ruleId) {
          this.service.deleteRecurringRule(ruleId);
          this.renderRecurringRulesList();
          this.ui.showToast('Recurring rule removed.');
        }
      });
    });
  }

  private bindEvents(): void {
    // Currency Selector
    const currencySelect = document.getElementById('currencySelect') as HTMLSelectElement;
    currencySelect?.addEventListener('change', () => {
      this.service.setCurrency(currencySelect.value as CurrencyCode);
      this.ui.showToast(`Active currency updated to ${currencySelect.value}.`);
      this.refresh();
    });

    // Add Expense Form
    const expenseForm = document.getElementById('expenseForm') as HTMLFormElement;
    const titleInput = document.getElementById('expenseTitle') as HTMLInputElement;
    const amountInput = document.getElementById('expenseAmount') as HTMLInputElement;
    const categorySelect = document.getElementById('expenseCategory') as HTMLSelectElement;
    const dateInput = document.getElementById('expenseDate') as HTMLInputElement;
    const notesInput = document.getElementById('expenseNotes') as HTMLInputElement;

    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    expenseForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      const typeRadio = document.querySelector(
        'input[name="transactionType"]:checked'
      ) as HTMLInputElement;
      const type: TransactionType = typeRadio?.value === 'income' ? 'income' : 'expense';

      const validation = ExpenseValidator.validateExpense({
        title: titleInput.value,
        amount: amountInput.value,
        category: categorySelect.value,
        date: dateInput.value,
        type,
        notes: notesInput?.value
      });

      // Clear previous error styles
      const titleErr = document.getElementById('titleError');
      const amountErr = document.getElementById('amountError');
      const dateErr = document.getElementById('dateError');
      if (titleErr) titleErr.textContent = validation.errors.title || '';
      if (amountErr) amountErr.textContent = validation.errors.amount || '';
      if (dateErr) dateErr.textContent = validation.errors.date || '';

      if (!validation.isValid) return;

      try {
        this.service.addExpense({
          title: titleInput.value,
          amount: parseFloat(amountInput.value),
          category: categorySelect.value as ExpenseCategory,
          date: dateInput.value,
          type,
          notes: notesInput?.value
        });

        expenseForm.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        // Reset radio back to expense
        const defaultRadio = document.querySelector(
          'input[name="transactionType"][value="expense"]'
        ) as HTMLInputElement;
        if (defaultRadio) defaultRadio.checked = true;

        this.ui.showToast(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
        this.refresh();
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.ui.showToast(err.message, true);
        }
      }
    });

    // Reset Form button
    document.getElementById('resetFormBtn')?.addEventListener('click', () => {
      expenseForm.reset();
      dateInput.value = new Date().toISOString().split('T')[0];
      const titleErr = document.getElementById('titleError');
      const amountErr = document.getElementById('amountError');
      const dateErr = document.getElementById('dateError');
      if (titleErr) titleErr.textContent = '';
      if (amountErr) amountErr.textContent = '';
      if (dateErr) dateErr.textContent = '';
    });

    // Edit modal form submission
    document.getElementById('editExpenseForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.currentEditingId) return;

      const editTitleInput = document.getElementById('editTitleInput') as HTMLInputElement;
      const editAmountInput = document.getElementById('editAmountInput') as HTMLInputElement;
      const editCategoryInput = document.getElementById('editCategorySelect') as HTMLSelectElement;
      const editDateInput = document.getElementById('editDateInput') as HTMLInputElement;
      const editNotesInput = document.getElementById('editNotesInput') as HTMLInputElement;
      const editTypeRadio = document.querySelector(
        'input[name="editTransactionType"]:checked'
      ) as HTMLInputElement;
      const type: TransactionType = editTypeRadio?.value === 'income' ? 'income' : 'expense';

      const validation = ExpenseValidator.validateExpense({
        title: editTitleInput.value,
        amount: editAmountInput.value,
        category: editCategoryInput.value,
        date: editDateInput.value,
        type
      });

      const editErrorEl = document.getElementById('editErrorMsg');
      if (!validation.isValid) {
        if (editErrorEl) editErrorEl.textContent = Object.values(validation.errors)[0];
        return;
      }
      if (editErrorEl) editErrorEl.textContent = '';

      try {
        this.service.updateExpense(this.currentEditingId, {
          title: editTitleInput.value,
          amount: parseFloat(editAmountInput.value),
          category: editCategoryInput.value as ExpenseCategory,
          date: editDateInput.value,
          type,
          notes: editNotesInput.value || undefined
        });

        this.closeEditModal();
        this.ui.showToast('Transaction updated successfully!');
        this.refresh();
      } catch (err: unknown) {
        if (err instanceof Error && editErrorEl) {
          editErrorEl.textContent = err.message;
        }
      }
    });

    document
      .getElementById('cancelEditBtn')
      ?.addEventListener('click', () => this.closeEditModal());
    document
      .getElementById('closeEditModalBtn')
      ?.addEventListener('click', () => this.closeEditModal());

    // Budget Modal controls
    const budgetModal = document.getElementById('budgetModal');
    const monthlyBudgetInput = document.getElementById('monthlyBudgetInput') as HTMLInputElement;
    const budgetError = document.getElementById('budgetError');

    document.getElementById('editBudgetBtn')?.addEventListener('click', () => {
      monthlyBudgetInput.value = this.service.getBudget().toString();
      if (budgetError) budgetError.textContent = '';
      budgetModal?.classList.remove('hidden');
    });

    const closeBudgetModal = () => budgetModal?.classList.add('hidden');
    document.getElementById('closeModalBtn')?.addEventListener('click', closeBudgetModal);
    document.getElementById('cancelBudgetBtn')?.addEventListener('click', closeBudgetModal);

    document.getElementById('saveBudgetBtn')?.addEventListener('click', () => {
      const val = parseFloat(monthlyBudgetInput.value);
      if (isNaN(val) || val < 0) {
        if (budgetError) budgetError.textContent = 'Please enter a valid non-negative budget.';
        return;
      }
      this.service.setBudget(val);
      closeBudgetModal();
      this.ui.showToast('Monthly budget updated successfully!');
      this.refresh();
    });

    // Category Budget button in modal
    document.getElementById('setCategoryBudgetBtn')?.addEventListener('click', () => {
      const catSelect = document.getElementById('budgetCategorySelect') as HTMLSelectElement;
      const limitInput = document.getElementById('categoryBudgetLimitInput') as HTMLInputElement;
      const limit = parseFloat(limitInput.value);
      if (isNaN(limit) || limit <= 0) {
        this.ui.showToast('Please enter a valid limit greater than 0', true);
        return;
      }
      this.service.setCategoryBudget(catSelect.value as ExpenseCategory, limit);
      limitInput.value = '';
      this.ui.showToast(`Budget for ${catSelect.value} updated.`);
      this.refresh();
    });

    // Recurring Modal controls
    const recurringModal = document.getElementById('recurringModal');
    document.getElementById('recurringRulesBtn')?.addEventListener('click', () => {
      this.renderRecurringRulesList();
      const recDate = document.getElementById('recStartDateInput') as HTMLInputElement;
      if (recDate && !recDate.value) {
        recDate.value = new Date().toISOString().split('T')[0];
      }
      recurringModal?.classList.remove('hidden');
    });

    const closeRecModal = () => recurringModal?.classList.add('hidden');
    document.getElementById('closeRecurringModalBtn')?.addEventListener('click', closeRecModal);
    document.getElementById('closeRecurringBtn')?.addEventListener('click', closeRecModal);

    // Add Recurring Rule Form
    document.getElementById('recurringRuleForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const recTitle = (document.getElementById('recTitleInput') as HTMLInputElement).value;
      const recAmount = parseFloat(
        (document.getElementById('recAmountInput') as HTMLInputElement).value
      );
      const recType = (document.getElementById('recTypeSelect') as HTMLSelectElement)
        .value as TransactionType;
      const recCategory = (document.getElementById('recCategorySelect') as HTMLSelectElement)
        .value as ExpenseCategory;
      const recFrequency = (document.getElementById('recFrequencySelect') as HTMLSelectElement)
        .value as RecurringFrequency;
      const recDate = (document.getElementById('recStartDateInput') as HTMLInputElement).value;

      try {
        this.service.addRecurringRule({
          title: recTitle,
          amount: recAmount,
          type: recType,
          category: recCategory,
          frequency: recFrequency,
          startDate: recDate,
          nextDueDate: recDate
        });
        (document.getElementById('recurringRuleForm') as HTMLFormElement).reset();
        this.renderRecurringRulesList();
        this.ui.showToast('Recurring rule saved!');
        this.refresh();
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.ui.showToast(err.message, true);
        }
      }
    });

    // Clear all
    document.getElementById('clearAllBtn')?.addEventListener('click', () => {
      if (
        confirm('Are you sure you want to clear ALL recorded transactions? This cannot be undone.')
      ) {
        this.service.clearAllExpenses();
        this.ui.showToast('All transactions cleared.');
        this.refresh();
      }
    });

    // Search and Filters
    const filterElements = [
      'typeFilter',
      'categoryFilter',
      'searchDescriptionInput',
      'startDateFilter',
      'endDateFilter',
      'sortBySelect',
      'sortOrderSelect'
    ];
    filterElements.forEach((id) => {
      document.getElementById(id)?.addEventListener('input', () => this.refresh());
      document.getElementById(id)?.addEventListener('change', () => this.refresh());
    });

    // Reset Filters button
    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
      (document.getElementById('typeFilter') as HTMLSelectElement).value = 'ALL';
      (document.getElementById('categoryFilter') as HTMLSelectElement).value = 'ALL';
      (document.getElementById('searchDescriptionInput') as HTMLInputElement).value = '';
      (document.getElementById('startDateFilter') as HTMLInputElement).value = '';
      (document.getElementById('endDateFilter') as HTMLInputElement).value = '';
      (document.getElementById('sortBySelect') as HTMLSelectElement).value = 'date';
      (document.getElementById('sortOrderSelect') as HTMLSelectElement).value = 'desc';
      this.refresh();
    });

    // JSON Export
    document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
      const expenses = this.service.getExpenses();
      if (expenses.length === 0) {
        this.ui.showToast('No transactions available to export.', true);
        return;
      }
      try {
        ExpenseImportExport.exportToJSON(expenses);
        this.ui.showToast('Exported JSON backup successfully.');
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.ui.showToast(err.message, true);
        }
      }
    });

    // CSV Export
    document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
      const expenses = this.service.getExpenses();
      if (expenses.length === 0) {
        this.ui.showToast('No transactions available to export.', true);
        return;
      }
      try {
        ExpenseImportExport.exportToCSV(expenses);
        this.ui.showToast('Exported CSV spreadsheet successfully.');
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.ui.showToast(err.message, true);
        }
      }
    });

    // JSON Import
    const jsonFileInput = document.getElementById('jsonFileInput') as HTMLInputElement;
    document.getElementById('importJsonBtn')?.addEventListener('click', () => {
      jsonFileInput?.click();
    });

    jsonFileInput?.addEventListener('change', async () => {
      const file = jsonFileInput.files?.[0];
      if (!file) return;

      try {
        const { validItems, importResult } = await ExpenseImportExport.parseAndValidateImport(file);
        const { added, skipped } = this.service.bulkImport(validItems);
        this.ui.showToast(
          `Imported ${added} records (${skipped + importResult.skippedCount} skipped/duplicates).`
        );
        this.refresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to import JSON file.';
        this.ui.showToast(msg, true);
      } finally {
        jsonFileInput.value = '';
      }
    });

    // CSV Import
    const csvFileInput = document.getElementById('csvFileInput') as HTMLInputElement;
    document.getElementById('importCsvBtn')?.addEventListener('click', () => {
      csvFileInput?.click();
    });

    csvFileInput?.addEventListener('change', async () => {
      const file = csvFileInput.files?.[0];
      if (!file) return;

      try {
        const { validItems, importResult } = await ExpenseImportExport.parseAndValidateCSV(file);
        const { added, skipped } = this.service.bulkImport(validItems);
        this.ui.showToast(
          `Imported ${added} records from CSV (${skipped + importResult.skippedCount} skipped/duplicates).`
        );
        this.refresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to import CSV file.';
        this.ui.showToast(msg, true);
      } finally {
        csvFileInput.value = '';
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ExpenseApp();
});
