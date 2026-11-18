import { ExpenseService } from './expense-service.js';
import { generateSummary } from './calculations.js';
import { validateExpense } from './validation.js';
import { exportToJSON, exportToCSV, parseAndValidateImport } from './import-export.js';
import { ExpenseUI } from './ui.js';
import {
  CurrencyCode,
  ExpenseCategory,
  ExpenseFilterOptions,
  TransactionType,
  ExpenseFormData,
  SortField,
  SortOrder
} from './types.js';

export class ExpenseApp {
  private service: ExpenseService;
  private ui: ExpenseUI;
  private currentEditingId: string | null = null;
  private currentDateFormat: string = 'YYYY-MM-DD';

  constructor(service: ExpenseService = new ExpenseService(), ui: ExpenseUI = new ExpenseUI()) {
    this.service = service;
    this.ui = ui;

    this.init();
  }

  private init(): void {
    const generated = this.service.processRecurringTransactions();
    if (generated > 0) {
      this.ui.showToast(`Processed ${generated} recurring transaction(s).`);
    }

    this.currentDateFormat = localStorage.getItem('date_format_preference') || 'YYYY-MM-DD';
    const dateSelect = document.getElementById('dateFormatSelect') as HTMLSelectElement;
    if (dateSelect) dateSelect.value = this.currentDateFormat;

    this.bindEvents();
    this.initTheme();
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

    // Check if analytics month filter is selected
    const analyticsMonthSelect = document.getElementById(
      'analyticsMonthFilter'
    ) as HTMLSelectElement;
    let analyticsExpenses = allExpenses;
    if (analyticsMonthSelect && analyticsMonthSelect.value !== 'all') {
      const monthIdx = parseInt(analyticsMonthSelect.value, 10);
      const year = new Date().getFullYear();
      const monthStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      analyticsExpenses = allExpenses.filter((e) => e.date.startsWith(monthStr));
    }

    const summary = generateSummary(allExpenses, budget, categoryBudgets);
    const analyticsSummary =
      analyticsExpenses === allExpenses
        ? summary
        : generateSummary(analyticsExpenses, budget, categoryBudgets);

    this.ui.updateDashboard(
      analyticsSummary,
      settings,
      allExpenses,
      summary.insights,
      summary.categoryBudgetProgress,
      (cat: string) => this.handleDeleteCategoryBudget(cat)
    );

    this.ui.renderExpensesTable(
      filteredExpenses,
      settings,
      (id: string) => this.openEditModal(id),
      (id: string) => this.handleDelete(id),
      this.currentDateFormat
    );
  }

  private handleDeleteCategoryBudget(category: string): void {
    if (confirm(`Remove budget ceiling for "${category}"?`)) {
      this.service.deleteCategoryBudget(category);
      this.ui.showToast(`Category budget for "${category}" removed.`);
      this.refresh();
    }
  }

  private syncCurrencyUI(): void {
    const currencySelect = document.getElementById('currencySelect') as HTMLSelectElement;
    if (currencySelect) {
      currencySelect.value = this.service.getCurrency();
    }
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme_preference') || 'light';
    const sidebarToggle = document.getElementById('themeToggleCheckbox') as HTMLInputElement;
    const settingsToggle = document.getElementById('settingsThemeCheckbox') as HTMLInputElement;

    const setDark = (isDark: boolean) => {
      if (isDark) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme_preference', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme_preference', 'light');
      }
      if (sidebarToggle) sidebarToggle.checked = isDark;
      if (settingsToggle) settingsToggle.checked = isDark;
    };

    setDark(savedTheme === 'dark');

    sidebarToggle?.addEventListener('change', () => setDark(sidebarToggle.checked));
    settingsToggle?.addEventListener('change', () => setDark(settingsToggle.checked));
  }

  private getActiveFilters(): ExpenseFilterOptions {
    const topSearch = document.getElementById('topSearchInput') as HTMLInputElement;
    const tableSearch = document.getElementById('tableSearchInput') as HTMLInputElement;
    const monthSelect = document.getElementById('monthFilterSelect') as HTMLSelectElement;
    const typeFilter = document.getElementById('tableTypeFilter') as HTMLSelectElement;
    const categoryFilter = document.getElementById('tableCategoryFilter') as HTMLSelectElement;
    const startDateInput = document.getElementById('tableStartDateFilter') as HTMLInputElement;
    const endDateInput = document.getElementById('tableEndDateFilter') as HTMLInputElement;
    const sortBySelect = document.getElementById('tableSortBySelect') as HTMLSelectElement;
    const sortOrderSelect = document.getElementById('tableSortOrderSelect') as HTMLSelectElement;

    let startDate: string | undefined = startDateInput?.value || undefined;
    let endDate: string | undefined = endDateInput?.value || undefined;

    if (!startDate && !endDate && monthSelect && monthSelect.value !== 'all') {
      const now = new Date();
      const monthIdx = parseInt(monthSelect.value, 10);
      const year = now.getFullYear();
      const start = new Date(year, monthIdx, 1);
      const end = new Date(year, monthIdx + 1, 0);
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
    }

    const searchQuery = (tableSearch?.value || topSearch?.value || '').trim();

    return {
      type: (typeFilter?.value as 'ALL' | TransactionType) || 'ALL',
      category: (categoryFilter?.value as 'ALL' | ExpenseCategory) || 'ALL',
      searchQuery,
      startDate,
      endDate,
      sortBy: (sortBySelect?.value as SortField) || 'date',
      sortOrder: (sortOrderSelect?.value as SortOrder) || 'desc'
    };
  }

  private handleDelete(id: string): void {
    const expense = this.service.getExpenseById(id);
    if (!expense) return;

    if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
      const success = this.service.deleteExpense(id);
      if (success) {
        this.ui.showToast('Transaction deleted successfully.');
        this.refresh();
      } else {
        this.ui.showToast('Failed to delete transaction.', true);
      }
    }
  }

  private openEditModal(id: string): void {
    const expense = this.service.getExpenseById(id);
    if (!expense) return;

    this.currentEditingId = id;
    const modal = document.getElementById('transactionModal');
    const titleInput = document.getElementById('modalTitleInput') as HTMLInputElement;
    const amountInput = document.getElementById('modalAmountInput') as HTMLInputElement;
    const categorySelect = document.getElementById('modalCategorySelect') as HTMLSelectElement;
    const dateInput = document.getElementById('modalDateInput') as HTMLInputElement;
    const notesInput = document.getElementById('modalNotesInput') as HTMLTextAreaElement;
    const modalHeading = document.getElementById('modalHeadingText');

    if (modalHeading) modalHeading.textContent = 'Edit Transaction';
    if (titleInput) titleInput.value = expense.title;
    if (amountInput) amountInput.value = expense.amount.toString();
    if (categorySelect) categorySelect.value = expense.category;
    if (dateInput) dateInput.value = expense.date;
    if (notesInput) notesInput.value = expense.notes || '';

    const typeRadio = document.querySelector(
      `input[name="modalType"][value="${expense.type}"]`
    ) as HTMLInputElement;
    if (typeRadio) typeRadio.checked = true;

    if (modal) modal.style.display = 'flex';
  }

  private openAddModal(): void {
    this.currentEditingId = null;
    const modal = document.getElementById('transactionModal');
    const form = document.getElementById('transactionModalForm') as HTMLFormElement;
    form?.reset();

    const dateInput = document.getElementById('modalDateInput') as HTMLInputElement;
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const modalHeading = document.getElementById('modalHeadingText');
    if (modalHeading) modalHeading.textContent = 'Add Transaction';

    if (modal) modal.style.display = 'flex';
  }

  private closeModals(): void {
    document.querySelectorAll('.modal-overlay').forEach((m) => {
      (m as HTMLElement).style.display = 'none';
    });
    this.currentEditingId = null;
  }

  private bindEvents(): void {
    document
      .querySelectorAll('#openAddModalBtn, #bottomAddTransactionBtn, #transactionsAddBtn')
      .forEach((btn) => {
        btn.addEventListener('click', () => this.openAddModal());
      });

    document.querySelectorAll('.modal-close-trigger').forEach((btn) => {
      btn.addEventListener('click', () => this.closeModals());
    });

    const topSearch = document.getElementById('topSearchInput') as HTMLInputElement;
    topSearch?.addEventListener('input', () => {
      const tableSearch = document.getElementById('tableSearchInput') as HTMLInputElement;
      if (tableSearch) tableSearch.value = topSearch.value;
      this.refresh();
    });

    const tableSearch = document.getElementById('tableSearchInput') as HTMLInputElement;
    tableSearch?.addEventListener('input', () => {
      if (topSearch) topSearch.value = tableSearch.value;
      this.refresh();
    });

    const monthSelect = document.getElementById('monthFilterSelect') as HTMLSelectElement;
    monthSelect?.addEventListener('change', () => this.refresh());

    const typeFilter = document.getElementById('tableTypeFilter') as HTMLSelectElement;
    typeFilter?.addEventListener('change', () => this.refresh());

    const catFilter = document.getElementById('tableCategoryFilter') as HTMLSelectElement;
    catFilter?.addEventListener('change', () => this.refresh());

    const startDateInput = document.getElementById('tableStartDateFilter') as HTMLInputElement;
    startDateInput?.addEventListener('change', () => this.refresh());

    const endDateInput = document.getElementById('tableEndDateFilter') as HTMLInputElement;
    endDateInput?.addEventListener('change', () => this.refresh());

    const sortBySelect = document.getElementById('tableSortBySelect') as HTMLSelectElement;
    sortBySelect?.addEventListener('change', () => this.refresh());

    const sortOrderSelect = document.getElementById('tableSortOrderSelect') as HTMLSelectElement;
    sortOrderSelect?.addEventListener('change', () => this.refresh());

    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
      if (topSearch) topSearch.value = '';
      if (tableSearch) tableSearch.value = '';
      if (typeFilter) typeFilter.value = 'ALL';
      if (catFilter) catFilter.value = 'ALL';
      if (startDateInput) startDateInput.value = '';
      if (endDateInput) endDateInput.value = '';
      if (sortBySelect) sortBySelect.value = 'date';
      if (sortOrderSelect) sortOrderSelect.value = 'desc';
      this.refresh();
      this.ui.showToast('Filters reset to default.');
    });

    const analyticsMonthSelect = document.getElementById(
      'analyticsMonthFilter'
    ) as HTMLSelectElement;
    analyticsMonthSelect?.addEventListener('change', () => this.refresh());

    const currencySelect = document.getElementById('currencySelect') as HTMLSelectElement;
    currencySelect?.addEventListener('change', () => {
      const curr = currencySelect.value as CurrencyCode;
      this.service.setCurrency(curr);
      this.refresh();
      this.ui.showToast(`Currency changed to ${curr}`);
    });

    const dateFormatSelect = document.getElementById('dateFormatSelect') as HTMLSelectElement;
    dateFormatSelect?.addEventListener('change', () => {
      this.currentDateFormat = dateFormatSelect.value;
      localStorage.setItem('date_format_preference', this.currentDateFormat);
      this.refresh();
      this.ui.showToast(`Date format set to ${this.currentDateFormat}`);
    });

    document.getElementById('notificationBellBtn')?.addEventListener('click', () => {
      this.ui.showToast('You have 0 unread alerts.');
    });

    // Budget modal triggers
    document.getElementById('openBudgetModalBtn')?.addEventListener('click', () => {
      const modal = document.getElementById('budgetConfigModal');
      const input = document.getElementById('budgetAmountInput') as HTMLInputElement;
      if (input) input.value = this.service.getBudget().toString();
      if (modal) modal.style.display = 'flex';
    });

    document.getElementById('budgetConfigForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('budgetAmountInput') as HTMLInputElement;
      const val = parseFloat(input.value);
      if (!isNaN(val) && val >= 0) {
        this.service.setBudget(val);
        this.closeModals();
        this.refresh();
        this.ui.showToast('Monthly budget updated successfully.');
      }
    });

    // Category Budget Modal triggers
    document.getElementById('openCategoryBudgetModalBtn')?.addEventListener('click', () => {
      const modal = document.getElementById('categoryBudgetModal');
      const amountInput = document.getElementById('catBudgetAmountInput') as HTMLInputElement;
      if (amountInput) amountInput.value = '';
      if (modal) modal.style.display = 'flex';
    });

    document.getElementById('categoryBudgetForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const catSelect = document.getElementById('catBudgetSelect') as HTMLSelectElement;
      const amountInput = document.getElementById('catBudgetAmountInput') as HTMLInputElement;
      const cat = catSelect.value;
      const amount = parseFloat(amountInput.value);
      if (cat && !isNaN(amount) && amount >= 0) {
        this.service.setCategoryBudget(cat, amount);
        this.closeModals();
        this.refresh();
        this.ui.showToast(`Category budget for "${cat}" saved.`);
      }
    });

    document.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
        item.classList.add('active');
        const view = item.getAttribute('data-view');
        this.switchView(view || 'dashboard');
      });
    });

    const form = document.getElementById('transactionModalForm') as HTMLFormElement;
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('modalTitleInput') as HTMLInputElement;
      const amountInput = document.getElementById('modalAmountInput') as HTMLInputElement;
      const categorySelect = document.getElementById('modalCategorySelect') as HTMLSelectElement;
      const dateInput = document.getElementById('modalDateInput') as HTMLInputElement;
      const notesInput = document.getElementById('modalNotesInput') as HTMLTextAreaElement;
      const typeRadio = document.querySelector(
        'input[name="modalType"]:checked'
      ) as HTMLInputElement;

      const title = titleInput.value.trim();
      const amount = parseFloat(amountInput.value);
      const category = categorySelect.value as ExpenseCategory;
      const date = dateInput.value;
      const type = (typeRadio?.value as TransactionType) || 'expense';
      const notes = notesInput.value.trim();

      const formData: ExpenseFormData = {
        title,
        amount,
        category,
        date,
        type,
        notes: notes || undefined
      };

      const validation = validateExpense(formData);
      if (!validation.isValid) {
        const firstErrorKey = Object.keys(validation.errors)[0] as keyof ExpenseFormData;
        this.ui.showToast(validation.errors[firstErrorKey] || 'Please check your inputs', true);
        return;
      }

      if (this.currentEditingId) {
        this.service.updateExpense(this.currentEditingId, {
          title,
          amount,
          category,
          date,
          type,
          notes: notes || undefined
        });
        this.ui.showToast('Transaction updated successfully');
      } else {
        this.service.addExpense({
          title,
          amount,
          category,
          date,
          type,
          notes: notes || undefined
        });
        this.ui.showToast('Transaction added successfully');
      }

      this.closeModals();
      this.refresh();
    });

    const handleExportJson = () => {
      exportToJSON(this.service.getExpenses(), this.service.getSettings().currency);
      this.ui.showToast('JSON backup exported.');
    };

    const handleExportCsv = () => {
      exportToCSV(this.service.getExpenses());
      this.ui.showToast('CSV spreadsheet exported.');
    };

    const handleImportJsonClick = () => {
      document.getElementById('jsonFileInput')?.click();
    };

    document.getElementById('exportJsonBtn')?.addEventListener('click', handleExportJson);
    document.getElementById('settingsExportJsonBtn')?.addEventListener('click', handleExportJson);
    document.getElementById('exportCsvBtn')?.addEventListener('click', handleExportCsv);
    document.getElementById('settingsExportCsvBtn')?.addEventListener('click', handleExportCsv);
    document.getElementById('importJsonBtn')?.addEventListener('click', handleImportJsonClick);
    document
      .getElementById('settingsImportJsonBtn')
      ?.addEventListener('click', handleImportJsonClick);

    document.getElementById('jsonFileInput')?.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const { validExpenses, result } = await parseAndValidateImport(file);
        validExpenses.forEach((item) => this.service.addExpense(item));
        this.refresh();
        this.ui.showToast(`Imported ${result.importedCount} transaction(s).`);
      } catch {
        this.ui.showToast('Failed to import JSON file.', true);
      }
    });

    // Clear all data
    document.getElementById('clearAllDataBtn')?.addEventListener('click', () => {
      if (
        confirm(
          'Are you sure you want to PERMANENTLY clear all transactions? This cannot be undone.'
        )
      ) {
        this.service.clearAllExpenses();
        this.refresh();
        this.ui.showToast('All transactions permanently cleared.', true);
      }
    });

    // Load sample data
    document.getElementById('loadSampleDataBtn')?.addEventListener('click', () => {
      const samples: Array<{
        title: string;
        amount: number;
        category: ExpenseCategory;
        type: TransactionType;
        date: string;
        notes?: string;
      }> = [
        {
          title: 'Tech Salary Deposit',
          amount: 75000,
          category: 'Salary',
          type: 'income',
          date: '2026-01-01'
        },
        {
          title: 'Freelance Design Retainer',
          amount: 25000,
          category: 'Freelance',
          type: 'income',
          date: '2026-01-10'
        },
        {
          title: 'Organic Supermarket Groceries',
          amount: 4850,
          category: 'Food & Dining',
          type: 'expense',
          date: '2026-01-04'
        },
        {
          title: 'Metro Transit Monthly Pass',
          amount: 1500,
          category: 'Transportation',
          type: 'expense',
          date: '2026-01-05'
        },
        {
          title: 'High-speed Fiber Broadband',
          amount: 1299,
          category: 'Bills & Utilities',
          type: 'expense',
          date: '2026-01-08'
        },
        {
          title: 'Ergonomic Desk Accessories',
          amount: 3200,
          category: 'Shopping',
          type: 'expense',
          date: '2026-01-12'
        },
        {
          title: 'Streaming Subscriptions & Cinema',
          amount: 999,
          category: 'Entertainment',
          type: 'expense',
          date: '2026-01-15'
        },
        {
          title: 'Quarterly Health Checkup',
          amount: 2400,
          category: 'Health',
          type: 'expense',
          date: '2026-01-18'
        }
      ];

      samples.forEach((s) => this.service.addExpense(s));
      this.refresh();
      this.ui.showToast('Sample dataset loaded successfully.');
    });
  }

  private switchView(view: string): void {
    const mainDashboard = document.getElementById('mainDashboardSection');
    const transactionsSection = document.getElementById('transactionsTableSection');
    const analyticsSection = document.getElementById('analyticsSection');
    const budgetsSection = document.getElementById('budgetsSection');
    const settingsSection = document.getElementById('settingsSection');

    if (mainDashboard) mainDashboard.style.display = view === 'dashboard' ? 'block' : 'none';
    if (transactionsSection)
      transactionsSection.style.display = view === 'transactions' ? 'block' : 'none';
    if (analyticsSection) analyticsSection.style.display = view === 'analytics' ? 'block' : 'none';
    if (budgetsSection) budgetsSection.style.display = view === 'budgets' ? 'block' : 'none';
    if (settingsSection) settingsSection.style.display = view === 'settings' ? 'block' : 'none';
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new ExpenseApp();
  });
}
