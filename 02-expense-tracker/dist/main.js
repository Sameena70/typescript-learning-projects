var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ExpenseService } from './expense-service.js';
import { generateSummary } from './calculations.js';
import { validateExpense } from './validation.js';
import { exportToJSON, exportToCSV, parseAndValidateImport } from './import-export.js';
import { ExpenseUI } from './ui.js';
export class ExpenseApp {
    constructor(service = new ExpenseService(), ui = new ExpenseUI()) {
        this.currentEditingId = null;
        this.currentDateFormat = 'YYYY-MM-DD';
        this.service = service;
        this.ui = ui;
        this.init();
    }
    init() {
        const generated = this.service.processRecurringTransactions();
        if (generated > 0) {
            this.ui.showToast(`Processed ${generated} recurring transaction(s).`);
        }
        this.currentDateFormat = localStorage.getItem('date_format_preference') || 'YYYY-MM-DD';
        const dateSelect = document.getElementById('dateFormatSelect');
        if (dateSelect)
            dateSelect.value = this.currentDateFormat;
        this.bindEvents();
        this.initTheme();
        this.syncCurrencyUI();
        this.refresh();
    }
    refresh() {
        const filterOptions = this.getActiveFilters();
        const filteredExpenses = this.service.filterExpenses(filterOptions);
        const allExpenses = this.service.getExpenses();
        const budget = this.service.getBudget();
        const categoryBudgets = this.service.getCategoryBudgets();
        const settings = this.service.getSettings();
        // Check if analytics month filter is selected
        const analyticsMonthSelect = document.getElementById('analyticsMonthFilter');
        let analyticsExpenses = allExpenses;
        if (analyticsMonthSelect && analyticsMonthSelect.value !== 'all') {
            const monthIdx = parseInt(analyticsMonthSelect.value, 10);
            const year = new Date().getFullYear();
            const monthStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
            analyticsExpenses = allExpenses.filter((e) => e.date.startsWith(monthStr));
        }
        const summary = generateSummary(allExpenses, budget, categoryBudgets);
        const analyticsSummary = analyticsExpenses === allExpenses
            ? summary
            : generateSummary(analyticsExpenses, budget, categoryBudgets);
        this.ui.updateDashboard(analyticsSummary, settings, allExpenses, summary.insights, summary.categoryBudgetProgress, (cat) => this.handleDeleteCategoryBudget(cat));
        this.ui.renderExpensesTable(filteredExpenses, settings, (id) => this.openEditModal(id), (id) => this.handleDelete(id), this.currentDateFormat);
    }
    handleDeleteCategoryBudget(category) {
        if (confirm(`Remove budget ceiling for "${category}"?`)) {
            this.service.deleteCategoryBudget(category);
            this.ui.showToast(`Category budget for "${category}" removed.`);
            this.refresh();
        }
    }
    syncCurrencyUI() {
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) {
            currencySelect.value = this.service.getCurrency();
        }
    }
    initTheme() {
        const savedTheme = localStorage.getItem('theme_preference') || 'light';
        const sidebarToggle = document.getElementById('themeToggleCheckbox');
        const settingsToggle = document.getElementById('settingsThemeCheckbox');
        const setDark = (isDark) => {
            if (isDark) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme_preference', 'dark');
            }
            else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme_preference', 'light');
            }
            if (sidebarToggle)
                sidebarToggle.checked = isDark;
            if (settingsToggle)
                settingsToggle.checked = isDark;
        };
        setDark(savedTheme === 'dark');
        sidebarToggle === null || sidebarToggle === void 0 ? void 0 : sidebarToggle.addEventListener('change', () => setDark(sidebarToggle.checked));
        settingsToggle === null || settingsToggle === void 0 ? void 0 : settingsToggle.addEventListener('change', () => setDark(settingsToggle.checked));
    }
    getActiveFilters() {
        const topSearch = document.getElementById('topSearchInput');
        const tableSearch = document.getElementById('tableSearchInput');
        const monthSelect = document.getElementById('monthFilterSelect');
        const typeFilter = document.getElementById('tableTypeFilter');
        const categoryFilter = document.getElementById('tableCategoryFilter');
        const startDateInput = document.getElementById('tableStartDateFilter');
        const endDateInput = document.getElementById('tableEndDateFilter');
        const sortBySelect = document.getElementById('tableSortBySelect');
        const sortOrderSelect = document.getElementById('tableSortOrderSelect');
        let startDate = (startDateInput === null || startDateInput === void 0 ? void 0 : startDateInput.value) || undefined;
        let endDate = (endDateInput === null || endDateInput === void 0 ? void 0 : endDateInput.value) || undefined;
        if (!startDate && !endDate && monthSelect && monthSelect.value !== 'all') {
            const now = new Date();
            const monthIdx = parseInt(monthSelect.value, 10);
            const year = now.getFullYear();
            const start = new Date(year, monthIdx, 1);
            const end = new Date(year, monthIdx + 1, 0);
            startDate = start.toISOString().split('T')[0];
            endDate = end.toISOString().split('T')[0];
        }
        const searchQuery = ((tableSearch === null || tableSearch === void 0 ? void 0 : tableSearch.value) || (topSearch === null || topSearch === void 0 ? void 0 : topSearch.value) || '').trim();
        return {
            type: (typeFilter === null || typeFilter === void 0 ? void 0 : typeFilter.value) || 'ALL',
            category: (categoryFilter === null || categoryFilter === void 0 ? void 0 : categoryFilter.value) || 'ALL',
            searchQuery,
            startDate,
            endDate,
            sortBy: (sortBySelect === null || sortBySelect === void 0 ? void 0 : sortBySelect.value) || 'date',
            sortOrder: (sortOrderSelect === null || sortOrderSelect === void 0 ? void 0 : sortOrderSelect.value) || 'desc'
        };
    }
    handleDelete(id) {
        const expense = this.service.getExpenseById(id);
        if (!expense)
            return;
        if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
            const success = this.service.deleteExpense(id);
            if (success) {
                this.ui.showToast('Transaction deleted successfully.');
                this.refresh();
            }
            else {
                this.ui.showToast('Failed to delete transaction.', true);
            }
        }
    }
    openEditModal(id) {
        const expense = this.service.getExpenseById(id);
        if (!expense)
            return;
        this.currentEditingId = id;
        const modal = document.getElementById('transactionModal');
        const titleInput = document.getElementById('modalTitleInput');
        const amountInput = document.getElementById('modalAmountInput');
        const categorySelect = document.getElementById('modalCategorySelect');
        const dateInput = document.getElementById('modalDateInput');
        const notesInput = document.getElementById('modalNotesInput');
        const modalHeading = document.getElementById('modalHeadingText');
        if (modalHeading)
            modalHeading.textContent = 'Edit Transaction';
        if (titleInput)
            titleInput.value = expense.title;
        if (amountInput)
            amountInput.value = expense.amount.toString();
        if (categorySelect)
            categorySelect.value = expense.category;
        if (dateInput)
            dateInput.value = expense.date;
        if (notesInput)
            notesInput.value = expense.notes || '';
        const typeRadio = document.querySelector(`input[name="modalType"][value="${expense.type}"]`);
        if (typeRadio)
            typeRadio.checked = true;
        if (modal)
            modal.style.display = 'flex';
    }
    openAddModal() {
        this.currentEditingId = null;
        const modal = document.getElementById('transactionModal');
        const form = document.getElementById('transactionModalForm');
        form === null || form === void 0 ? void 0 : form.reset();
        const dateInput = document.getElementById('modalDateInput');
        if (dateInput)
            dateInput.value = new Date().toISOString().split('T')[0];
        const modalHeading = document.getElementById('modalHeadingText');
        if (modalHeading)
            modalHeading.textContent = 'Add Transaction';
        if (modal)
            modal.style.display = 'flex';
    }
    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach((m) => {
            m.style.display = 'none';
        });
        this.currentEditingId = null;
    }
    bindEvents() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        document
            .querySelectorAll('#openAddModalBtn, #bottomAddTransactionBtn, #transactionsAddBtn')
            .forEach((btn) => {
            btn.addEventListener('click', () => this.openAddModal());
        });
        document.querySelectorAll('.modal-close-trigger').forEach((btn) => {
            btn.addEventListener('click', () => this.closeModals());
        });
        const topSearch = document.getElementById('topSearchInput');
        topSearch === null || topSearch === void 0 ? void 0 : topSearch.addEventListener('input', () => {
            const tableSearch = document.getElementById('tableSearchInput');
            if (tableSearch)
                tableSearch.value = topSearch.value;
            this.refresh();
        });
        const tableSearch = document.getElementById('tableSearchInput');
        tableSearch === null || tableSearch === void 0 ? void 0 : tableSearch.addEventListener('input', () => {
            if (topSearch)
                topSearch.value = tableSearch.value;
            this.refresh();
        });
        const monthSelect = document.getElementById('monthFilterSelect');
        monthSelect === null || monthSelect === void 0 ? void 0 : monthSelect.addEventListener('change', () => this.refresh());
        const typeFilter = document.getElementById('tableTypeFilter');
        typeFilter === null || typeFilter === void 0 ? void 0 : typeFilter.addEventListener('change', () => this.refresh());
        const catFilter = document.getElementById('tableCategoryFilter');
        catFilter === null || catFilter === void 0 ? void 0 : catFilter.addEventListener('change', () => this.refresh());
        const startDateInput = document.getElementById('tableStartDateFilter');
        startDateInput === null || startDateInput === void 0 ? void 0 : startDateInput.addEventListener('change', () => this.refresh());
        const endDateInput = document.getElementById('tableEndDateFilter');
        endDateInput === null || endDateInput === void 0 ? void 0 : endDateInput.addEventListener('change', () => this.refresh());
        const sortBySelect = document.getElementById('tableSortBySelect');
        sortBySelect === null || sortBySelect === void 0 ? void 0 : sortBySelect.addEventListener('change', () => this.refresh());
        const sortOrderSelect = document.getElementById('tableSortOrderSelect');
        sortOrderSelect === null || sortOrderSelect === void 0 ? void 0 : sortOrderSelect.addEventListener('change', () => this.refresh());
        (_a = document.getElementById('resetFiltersBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            if (topSearch)
                topSearch.value = '';
            if (tableSearch)
                tableSearch.value = '';
            if (typeFilter)
                typeFilter.value = 'ALL';
            if (catFilter)
                catFilter.value = 'ALL';
            if (startDateInput)
                startDateInput.value = '';
            if (endDateInput)
                endDateInput.value = '';
            if (sortBySelect)
                sortBySelect.value = 'date';
            if (sortOrderSelect)
                sortOrderSelect.value = 'desc';
            this.refresh();
            this.ui.showToast('Filters reset to default.');
        });
        const analyticsMonthSelect = document.getElementById('analyticsMonthFilter');
        analyticsMonthSelect === null || analyticsMonthSelect === void 0 ? void 0 : analyticsMonthSelect.addEventListener('change', () => this.refresh());
        const currencySelect = document.getElementById('currencySelect');
        currencySelect === null || currencySelect === void 0 ? void 0 : currencySelect.addEventListener('change', () => {
            const curr = currencySelect.value;
            this.service.setCurrency(curr);
            this.refresh();
            this.ui.showToast(`Currency changed to ${curr}`);
        });
        const dateFormatSelect = document.getElementById('dateFormatSelect');
        dateFormatSelect === null || dateFormatSelect === void 0 ? void 0 : dateFormatSelect.addEventListener('change', () => {
            this.currentDateFormat = dateFormatSelect.value;
            localStorage.setItem('date_format_preference', this.currentDateFormat);
            this.refresh();
            this.ui.showToast(`Date format set to ${this.currentDateFormat}`);
        });
        (_b = document.getElementById('notificationBellBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.ui.showToast('You have 0 unread alerts.');
        });
        // Budget modal triggers
        (_c = document.getElementById('openBudgetModalBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            const modal = document.getElementById('budgetConfigModal');
            const input = document.getElementById('budgetAmountInput');
            if (input)
                input.value = this.service.getBudget().toString();
            if (modal)
                modal.style.display = 'flex';
        });
        (_d = document.getElementById('budgetConfigForm')) === null || _d === void 0 ? void 0 : _d.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('budgetAmountInput');
            const val = parseFloat(input.value);
            if (!isNaN(val) && val >= 0) {
                this.service.setBudget(val);
                this.closeModals();
                this.refresh();
                this.ui.showToast('Monthly budget updated successfully.');
            }
        });
        // Category Budget Modal triggers
        (_e = document.getElementById('openCategoryBudgetModalBtn')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            const modal = document.getElementById('categoryBudgetModal');
            const amountInput = document.getElementById('catBudgetAmountInput');
            if (amountInput)
                amountInput.value = '';
            if (modal)
                modal.style.display = 'flex';
        });
        (_f = document.getElementById('categoryBudgetForm')) === null || _f === void 0 ? void 0 : _f.addEventListener('submit', (e) => {
            e.preventDefault();
            const catSelect = document.getElementById('catBudgetSelect');
            const amountInput = document.getElementById('catBudgetAmountInput');
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
        const form = document.getElementById('transactionModalForm');
        form === null || form === void 0 ? void 0 : form.addEventListener('submit', (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('modalTitleInput');
            const amountInput = document.getElementById('modalAmountInput');
            const categorySelect = document.getElementById('modalCategorySelect');
            const dateInput = document.getElementById('modalDateInput');
            const notesInput = document.getElementById('modalNotesInput');
            const typeRadio = document.querySelector('input[name="modalType"]:checked');
            const title = titleInput.value.trim();
            const amount = parseFloat(amountInput.value);
            const category = categorySelect.value;
            const date = dateInput.value;
            const type = (typeRadio === null || typeRadio === void 0 ? void 0 : typeRadio.value) || 'expense';
            const notes = notesInput.value.trim();
            const formData = {
                title,
                amount,
                category,
                date,
                type,
                notes: notes || undefined
            };
            const validation = validateExpense(formData);
            if (!validation.isValid) {
                const firstErrorKey = Object.keys(validation.errors)[0];
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
            }
            else {
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
            var _a;
            (_a = document.getElementById('jsonFileInput')) === null || _a === void 0 ? void 0 : _a.click();
        };
        (_g = document.getElementById('exportJsonBtn')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', handleExportJson);
        (_h = document.getElementById('settingsExportJsonBtn')) === null || _h === void 0 ? void 0 : _h.addEventListener('click', handleExportJson);
        (_j = document.getElementById('exportCsvBtn')) === null || _j === void 0 ? void 0 : _j.addEventListener('click', handleExportCsv);
        (_k = document.getElementById('settingsExportCsvBtn')) === null || _k === void 0 ? void 0 : _k.addEventListener('click', handleExportCsv);
        (_l = document.getElementById('importJsonBtn')) === null || _l === void 0 ? void 0 : _l.addEventListener('click', handleImportJsonClick);
        (_m = document
            .getElementById('settingsImportJsonBtn')) === null || _m === void 0 ? void 0 : _m.addEventListener('click', handleImportJsonClick);
        (_o = document.getElementById('jsonFileInput')) === null || _o === void 0 ? void 0 : _o.addEventListener('change', (e) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return;
            try {
                const { validExpenses, result } = yield parseAndValidateImport(file);
                validExpenses.forEach((item) => this.service.addExpense(item));
                this.refresh();
                this.ui.showToast(`Imported ${result.importedCount} transaction(s).`);
            }
            catch (_b) {
                this.ui.showToast('Failed to import JSON file.', true);
            }
        }));
        // Clear all data
        (_p = document.getElementById('clearAllDataBtn')) === null || _p === void 0 ? void 0 : _p.addEventListener('click', () => {
            if (confirm('Are you sure you want to PERMANENTLY clear all transactions? This cannot be undone.')) {
                this.service.clearAllExpenses();
                this.refresh();
                this.ui.showToast('All transactions permanently cleared.', true);
            }
        });
        // Load sample data
        (_q = document.getElementById('loadSampleDataBtn')) === null || _q === void 0 ? void 0 : _q.addEventListener('click', () => {
            const samples = [
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
    switchView(view) {
        const mainDashboard = document.getElementById('mainDashboardSection');
        const transactionsSection = document.getElementById('transactionsTableSection');
        const analyticsSection = document.getElementById('analyticsSection');
        const budgetsSection = document.getElementById('budgetsSection');
        const settingsSection = document.getElementById('settingsSection');
        if (mainDashboard)
            mainDashboard.style.display = view === 'dashboard' ? 'block' : 'none';
        if (transactionsSection)
            transactionsSection.style.display = view === 'transactions' ? 'block' : 'none';
        if (analyticsSection)
            analyticsSection.style.display = view === 'analytics' ? 'block' : 'none';
        if (budgetsSection)
            budgetsSection.style.display = view === 'budgets' ? 'block' : 'none';
        if (settingsSection)
            settingsSection.style.display = view === 'settings' ? 'block' : 'none';
    }
}
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new ExpenseApp();
    });
}
