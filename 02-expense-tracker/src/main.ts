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
  TransactionType,
  SortField,
  SortOrder
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
      category: (categoryEl?.value as 'ALL' | ExpenseCategory) || 'ALL',
      searchQuery: searchEl?.value || '',
      startDate: startDateEl?.value || undefined,
      endDate: endDateEl?.value || undefined,
      sortBy: (sortByEl?.value as SortField) || 'date',
      sortOrder: (sortOrderEl?.value as SortOrder) || 'desc'
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
    const editModal = document.getElementById('editModal');
    const editTitle = document.getElementById('editTitle') as HTMLInputElement;
    const editAmount = document.getElementById('editAmount') as HTMLInputElement;
    const editType = document.getElementById('editType') as HTMLSelectElement;
    const editCategory = document.getElementById('editCategory') as HTMLSelectElement;
    const editDate = document.getElementById('editDate') as HTMLInputElement;
    const editNotes = document.getElementById('editNotes') as HTMLTextAreaElement;

    if (editTitle) editTitle.value = expense.title;
    if (editAmount) editAmount.value = expense.amount.toString();
    if (editType) editType.value = expense.type || 'expense';
    if (editCategory) editCategory.value = expense.category;
    if (editDate) editDate.value = expense.date;
    if (editNotes) editNotes.value = expense.notes || '';

    if (editModal) editModal.classList.add('open');
  }

  private closeEditModal(): void {
    this.currentEditingId = null;
    const editModal = document.getElementById('editModal');
    if (editModal) editModal.classList.remove('open');
  }

  private bindEvents(): void {
    // Add Transaction Form
    const expenseForm = document.getElementById('expenseForm') as HTMLFormElement;
    expenseForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      const titleInput = document.getElementById('expenseTitle') as HTMLInputElement;
      const amountInput = document.getElementById('expenseAmount') as HTMLInputElement;
      const typeInput = document.getElementById('expenseType') as HTMLSelectElement;
      const categoryInput = document.getElementById('expenseCategory') as HTMLSelectElement;
      const dateInput = document.getElementById('expenseDate') as HTMLInputElement;
      const notesInput = document.getElementById('expenseNotes') as HTMLTextAreaElement;
      const recurringInput = document.getElementById('isRecurringCheckbox') as HTMLInputElement;

      const formData = {
        title: titleInput?.value || '',
        amount: amountInput?.value || '',
        type: (typeInput?.value as TransactionType) || 'expense',
        category: categoryInput?.value || '',
        date: dateInput?.value || '',
        notes: notesInput?.value || '',
        isRecurring: recurringInput?.checked || false
      };

      const validation = ExpenseValidator.validateExpense(formData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        this.ui.showToast(firstError || 'Validation failed.', true);
        return;
      }

      try {
        this.service.addExpense({
          title: formData.title,
          amount: parseFloat(formData.amount),
          type: formData.type,
          category: formData.category as ExpenseCategory,
          date: formData.date,
          notes: formData.notes,
          isRecurring: formData.isRecurring
        });

        expenseForm.reset();
        // Reset default date to today
        if (dateInput) {
          dateInput.value = new Date().toISOString().slice(0, 10);
        }

        this.ui.showToast('Transaction added successfully.');
        this.refresh();
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.ui.showToast(error.message, true);
        }
      }
    });

    // Save Edited Transaction
    const saveEditBtn = document.getElementById('saveEditBtn');
    saveEditBtn?.addEventListener('click', () => {
      if (!this.currentEditingId) return;

      const editTitle = document.getElementById('editTitle') as HTMLInputElement;
      const editAmount = document.getElementById('editAmount') as HTMLInputElement;
      const editType = document.getElementById('editType') as HTMLSelectElement;
      const editCategory = document.getElementById('editCategory') as HTMLSelectElement;
      const editDate = document.getElementById('editDate') as HTMLInputElement;
      const editNotes = document.getElementById('editNotes') as HTMLTextAreaElement;

      const formData = {
        title: editTitle?.value || '',
        amount: editAmount?.value || '',
        type: (editType?.value as TransactionType) || 'expense',
        category: editCategory?.value || '',
        date: editDate?.value || '',
        notes: editNotes?.value || ''
      };

      const validation = ExpenseValidator.validateExpense(formData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        this.ui.showToast(firstError || 'Validation failed.', true);
        return;
      }

      try {
        this.service.updateExpense(this.currentEditingId, {
          title: formData.title,
          amount: parseFloat(formData.amount),
          type: formData.type,
          category: formData.category as ExpenseCategory,
          date: formData.date,
          notes: formData.notes
        });

        this.closeEditModal();
        this.ui.showToast('Transaction updated.');
        this.refresh();
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.ui.showToast(error.message, true);
        }
      }
    });

    // Cancel Edit Modal
    document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
      this.closeEditModal();
    });

    document.getElementById('closeEditModalBtn')?.addEventListener('click', () => {
      this.closeEditModal();
    });

    // Currency Switcher
    const currencySelect = document.getElementById('currencySelect') as HTMLSelectElement;
    currencySelect?.addEventListener('change', () => {
      this.service.setCurrency(currencySelect.value as CurrencyCode);
      this.ui.showToast(`Currency changed to ${currencySelect.value}`);
      this.refresh();
    });

    // Update Overall Budget
    const updateBudgetBtn = document.getElementById('updateBudgetBtn');
    updateBudgetBtn?.addEventListener('click', () => {
      const budgetInput = document.getElementById('monthlyBudgetInput') as HTMLInputElement;
      const val = parseFloat(budgetInput?.value || '');
      if (isNaN(val) || val < 0) {
        this.ui.showToast('Please enter a valid non-negative budget.', true);
        return;
      }
      this.service.setBudget(val);
      this.ui.showToast('Monthly budget updated.');
      this.refresh();
    });

    // Category Budget Form
    const saveCatBudgetBtn = document.getElementById('saveCatBudgetBtn');
    saveCatBudgetBtn?.addEventListener('click', () => {
      const catSelect = document.getElementById('budgetCategorySelect') as HTMLSelectElement;
      const amtInput = document.getElementById('categoryBudgetAmount') as HTMLInputElement;

      const category = catSelect?.value;
      const amount = parseFloat(amtInput?.value || '');

      if (!category || isNaN(amount) || amount < 0) {
        this.ui.showToast('Please provide a valid category and budget amount.', true);
        return;
      }

      this.service.setCategoryBudget(category, amount);
      amtInput.value = '';
      this.ui.showToast(`Budget for "${category}" updated.`);
      this.refresh();
    });

    // Filter Controls
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
      const el = document.getElementById(id);
      el?.addEventListener('input', () => this.refresh());
      el?.addEventListener('change', () => this.refresh());
    });

    // Reset Filters
    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
      const typeFilter = document.getElementById('typeFilter') as HTMLSelectElement;
      const categoryFilter = document.getElementById('categoryFilter') as HTMLSelectElement;
      const searchInput = document.getElementById('searchDescriptionInput') as HTMLInputElement;
      const startDate = document.getElementById('startDateFilter') as HTMLInputElement;
      const endDate = document.getElementById('endDateFilter') as HTMLInputElement;
      const sortBy = document.getElementById('sortBySelect') as HTMLSelectElement;
      const sortOrder = document.getElementById('sortOrderSelect') as HTMLSelectElement;

      if (typeFilter) typeFilter.value = 'ALL';
      if (categoryFilter) categoryFilter.value = 'ALL';
      if (searchInput) searchInput.value = '';
      if (startDate) startDate.value = '';
      if (endDate) endDate.value = '';
      if (sortBy) sortBy.value = 'date';
      if (sortOrder) sortOrder.value = 'desc';

      this.refresh();
    });

    // Recurring Rule Form
    const recurringForm = document.getElementById('recurringRuleForm') as HTMLFormElement;
    recurringForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (document.getElementById('recurringTitle') as HTMLInputElement)?.value;
      const amount = parseFloat(
        (document.getElementById('recurringAmount') as HTMLInputElement)?.value || ''
      );
      const type = (document.getElementById('recurringType') as HTMLSelectElement)
        ?.value as TransactionType;
      const category = (document.getElementById('recurringCategory') as HTMLSelectElement)
        ?.value as ExpenseCategory;
      const frequency = (document.getElementById('recurringFrequency') as HTMLSelectElement)
        ?.value as RecurringFrequency;
      const startDate = (document.getElementById('recurringStartDate') as HTMLInputElement)?.value;

      if (!title || isNaN(amount) || amount <= 0 || !startDate) {
        this.ui.showToast('Please fill all recurring rule fields properly.', true);
        return;
      }

      this.service.addRecurringRule({
        title,
        amount,
        type,
        category,
        frequency,
        startDate,
        active: true
      });

      recurringForm.reset();
      this.ui.showToast('Recurring rule saved.');
    });

    // Export JSON
    document.getElementById('exportJSONBtn')?.addEventListener('click', () => {
      ExpenseImportExport.exportToJSON(this.service.getExpenses());
      this.ui.showToast('JSON export downloaded.');
    });

    // Export CSV
    document.getElementById('exportCSVBtn')?.addEventListener('click', () => {
      ExpenseImportExport.exportToCSV(this.service.getExpenses());
      this.ui.showToast('CSV export downloaded.');
    });

    // Import File
    const importFileInput = document.getElementById('importFileInput') as HTMLInputElement;
    importFileInput?.addEventListener('change', async () => {
      const file = importFileInput.files?.[0];
      if (!file) return;

      try {
        if (file.name.endsWith('.json')) {
          const { validExpenses, result } = await ExpenseImportExport.parseAndValidateImport(file);
          if (validExpenses.length > 0) {
            validExpenses.forEach((exp) => this.service.addExpense(exp));
            this.refresh();
            this.ui.showToast(`Imported ${validExpenses.length} transactions from JSON.`);
          } else {
            this.ui.showToast(`No valid records found. ${result.errors.join(' ')}`, true);
          }
        } else if (file.name.endsWith('.csv')) {
          const text = await ExpenseImportExport.readTextFile(file);
          const { validExpenses, result } = ExpenseImportExport.parseCSVContent(text);
          if (validExpenses.length > 0) {
            validExpenses.forEach((exp) => this.service.addExpense(exp));
            this.refresh();
            this.ui.showToast(`Imported ${validExpenses.length} transactions from CSV.`);
          } else {
            this.ui.showToast(`No valid CSV records: ${result.errors.join(' ')}`, true);
          }
        } else {
          this.ui.showToast('Unsupported file type. Use .json or .csv.', true);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.ui.showToast(error.message, true);
        }
      } finally {
        importFileInput.value = '';
      }
    });

    // Clear All Data
    document.getElementById('clearAllDataBtn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to permanently clear all transactions?')) {
        this.service.clearAllExpenses();
        this.ui.showToast('All transaction data cleared.');
        this.refresh();
      }
    });
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new ExpenseApp();
  });
}
