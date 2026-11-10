import { ExpenseService } from './expense-service.js';
import { ExpenseCalculations } from './calculations.js';
import { ExpenseValidator } from './validation.js';
import { ExpenseImportExport } from './import-export.js';
import { ExpenseUI } from './ui.js';
import { ExpenseCategory, ExpenseFilterOptions } from './types.js';

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
    this.bindEvents();
    this.refresh();
  }

  private refresh(): void {
    const filterOptions = this.getActiveFilters();
    const filteredExpenses = this.service.filterExpenses(filterOptions);
    const allExpenses = this.service.getExpenses();
    const budget = this.service.getBudget();

    const summary = ExpenseCalculations.generateSummary(allExpenses, budget);
    this.ui.updateDashboard(summary);

    this.ui.renderExpensesTable(
      filteredExpenses,
      (id: string) => this.openEditModal(id),
      (id: string) => this.handleDelete(id)
    );
  }

  private getActiveFilters(): ExpenseFilterOptions {
    const categoryEl = document.getElementById('categoryFilter') as HTMLSelectElement;
    const searchEl = document.getElementById('searchDescriptionInput') as HTMLInputElement;
    const startDateEl = document.getElementById('startDateFilter') as HTMLInputElement;
    const endDateEl = document.getElementById('endDateFilter') as HTMLInputElement;
    const sortByEl = document.getElementById('sortBySelect') as HTMLSelectElement;
    const sortOrderEl = document.getElementById('sortOrderSelect') as HTMLSelectElement;

    return {
      category: categoryEl?.value || 'ALL',
      searchQuery: searchEl?.value || '',
      startDate: startDateEl?.value || undefined,
      endDate: endDateEl?.value || undefined,
      sortBy: (sortByEl?.value as 'date' | 'amount') || 'date',
      sortOrder: (sortOrderEl?.value as 'asc' | 'desc') || 'desc'
    };
  }

  private handleDelete(id: string): void {
    const expense = this.service.getExpenseById(id);
    if (!expense) return;

    if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
      try {
        this.service.deleteExpense(id);
        this.ui.showToast('Expense deleted successfully.');
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

  private bindEvents(): void {
    // Add Expense Form
    const expenseForm = document.getElementById('expenseForm') as HTMLFormElement;
    const titleInput = document.getElementById('expenseTitle') as HTMLInputElement;
    const amountInput = document.getElementById('expenseAmount') as HTMLInputElement;
    const categorySelect = document.getElementById('expenseCategory') as HTMLSelectElement;
    const dateInput = document.getElementById('expenseDate') as HTMLInputElement;
    const notesInput = document.getElementById('expenseNotes') as HTMLInputElement;

    // Set today's date as default
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    expenseForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      const validation = ExpenseValidator.validateExpense({
        title: titleInput.value,
        amount: amountInput.value,
        category: categorySelect.value,
        date: dateInput.value,
        notes: notesInput?.value
      });

      // Clear previous error styles
      document.getElementById('titleError')!.textContent = validation.errors.title || '';
      document.getElementById('amountError')!.textContent = validation.errors.amount || '';
      document.getElementById('dateError')!.textContent = validation.errors.date || '';

      if (!validation.isValid) return;

      try {
        this.service.addExpense({
          title: titleInput.value,
          amount: parseFloat(amountInput.value),
          category: categorySelect.value as ExpenseCategory,
          date: dateInput.value,
          notes: notesInput?.value
        });

        expenseForm.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        this.ui.showToast('Expense added successfully!');
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
      document.getElementById('titleError')!.textContent = '';
      document.getElementById('amountError')!.textContent = '';
      document.getElementById('dateError')!.textContent = '';
    });

    // Edit modal form submission
    document.getElementById('editExpenseForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.currentEditingId) return;

      const titleInput = document.getElementById('editTitleInput') as HTMLInputElement;
      const amountInput = document.getElementById('editAmountInput') as HTMLInputElement;
      const categoryInput = document.getElementById('editCategorySelect') as HTMLSelectElement;
      const dateInput = document.getElementById('editDateInput') as HTMLInputElement;
      const notesInput = document.getElementById('editNotesInput') as HTMLInputElement;

      const validation = ExpenseValidator.validateExpense({
        title: titleInput.value,
        amount: amountInput.value,
        category: categoryInput.value,
        date: dateInput.value
      });

      const editErrorEl = document.getElementById('editErrorMsg')!;
      if (!validation.isValid) {
        editErrorEl.textContent = Object.values(validation.errors)[0];
        return;
      }
      editErrorEl.textContent = '';

      try {
        this.service.updateExpense(this.currentEditingId, {
          title: titleInput.value,
          amount: parseFloat(amountInput.value),
          category: categoryInput.value as ExpenseCategory,
          date: dateInput.value,
          notes: notesInput.value || undefined
        });

        this.closeEditModal();
        this.ui.showToast('Expense updated successfully!');
        this.refresh();
      } catch (err: unknown) {
        if (err instanceof Error) {
          editErrorEl.textContent = err.message;
        }
      }
    });

    document.getElementById('cancelEditBtn')?.addEventListener('click', () => this.closeEditModal());
    document.getElementById('closeEditModalBtn')?.addEventListener('click', () => this.closeEditModal());

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
      this.ui.showToast('Budget updated successfully!');
      this.refresh();
    });

    // Clear all
    document.getElementById('clearAllBtn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear ALL recorded expenses? This cannot be undone.')) {
        this.service.clearAllExpenses();
        this.ui.showToast('All expenses cleared.');
        this.refresh();
      }
    });

    // Search and Filters
    const filterElements = [
      'categoryFilter',
      'searchDescriptionInput',
      'startDateFilter',
      'endDateFilter',
      'sortBySelect',
      'sortOrderSelect'
    ];
    filterElements.forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this.refresh());
      document.getElementById(id)?.addEventListener('change', () => this.refresh());
    });

    // Reset Filters button
    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
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
        this.ui.showToast('No expenses available to export.', true);
        return;
      }
      try {
        ExpenseImportExport.exportToJSON(expenses);
        this.ui.showToast('Exported expenses successfully.');
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
        this.ui.showToast(`Imported ${added} records (${skipped + importResult.skippedCount} skipped/duplicates).`);
        this.refresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to import JSON file.';
        this.ui.showToast(msg, true);
      } finally {
        jsonFileInput.value = '';
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ExpenseApp();
});

