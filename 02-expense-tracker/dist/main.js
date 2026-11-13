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
import { ExpenseCalculations } from './calculations.js';
import { ExpenseValidator } from './validation.js';
import { ExpenseImportExport } from './import-export.js';
import { ExpenseUI } from './ui.js';
class ExpenseApp {
    constructor() {
        this.currentEditingId = null;
        this.service = new ExpenseService();
        this.ui = new ExpenseUI();
        this.init();
    }
    init() {
        // Process any due recurring transactions upon startup
        const generated = this.service.processRecurringTransactions();
        if (generated > 0) {
            this.ui.showToast(`Processed ${generated} recurring transaction(s).`);
        }
        this.bindEvents();
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
        const summary = ExpenseCalculations.generateSummary(allExpenses, budget, categoryBudgets);
        this.ui.updateDashboard(summary, settings);
        this.ui.renderExpensesTable(filteredExpenses, settings, (id) => this.openEditModal(id), (id) => this.handleDelete(id));
    }
    syncCurrencyUI() {
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) {
            currencySelect.value = this.service.getCurrency();
        }
    }
    getActiveFilters() {
        const typeEl = document.getElementById('typeFilter');
        const categoryEl = document.getElementById('categoryFilter');
        const searchEl = document.getElementById('searchDescriptionInput');
        const startDateEl = document.getElementById('startDateFilter');
        const endDateEl = document.getElementById('endDateFilter');
        const sortByEl = document.getElementById('sortBySelect');
        const sortOrderEl = document.getElementById('sortOrderSelect');
        return {
            type: (typeEl === null || typeEl === void 0 ? void 0 : typeEl.value) || 'ALL',
            category: (categoryEl === null || categoryEl === void 0 ? void 0 : categoryEl.value) || 'ALL',
            searchQuery: (searchEl === null || searchEl === void 0 ? void 0 : searchEl.value) || '',
            startDate: (startDateEl === null || startDateEl === void 0 ? void 0 : startDateEl.value) || undefined,
            endDate: (endDateEl === null || endDateEl === void 0 ? void 0 : endDateEl.value) || undefined,
            sortBy: (sortByEl === null || sortByEl === void 0 ? void 0 : sortByEl.value) || 'date',
            sortOrder: (sortOrderEl === null || sortOrderEl === void 0 ? void 0 : sortOrderEl.value) || 'desc'
        };
    }
    handleDelete(id) {
        const expense = this.service.getExpenseById(id);
        if (!expense)
            return;
        if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
            try {
                this.service.deleteExpense(id);
                this.ui.showToast('Transaction deleted successfully.');
                this.refresh();
            }
            catch (error) {
                if (error instanceof Error) {
                    this.ui.showToast(error.message, true);
                }
            }
        }
    }
    openEditModal(id) {
        const expense = this.service.getExpenseById(id);
        if (!expense)
            return;
        this.currentEditingId = id;
        const editModal = document.getElementById('editModal');
        const editTitle = document.getElementById('editTitle');
        const editAmount = document.getElementById('editAmount');
        const editType = document.getElementById('editType');
        const editCategory = document.getElementById('editCategory');
        const editDate = document.getElementById('editDate');
        const editNotes = document.getElementById('editNotes');
        if (editTitle)
            editTitle.value = expense.title;
        if (editAmount)
            editAmount.value = expense.amount.toString();
        if (editType)
            editType.value = expense.type || 'expense';
        if (editCategory)
            editCategory.value = expense.category;
        if (editDate)
            editDate.value = expense.date;
        if (editNotes)
            editNotes.value = expense.notes || '';
        if (editModal)
            editModal.classList.add('open');
    }
    closeEditModal() {
        this.currentEditingId = null;
        const editModal = document.getElementById('editModal');
        if (editModal)
            editModal.classList.remove('open');
    }
    bindEvents() {
        var _a, _b, _c, _d, _e, _f;
        // Add Transaction Form
        const expenseForm = document.getElementById('expenseForm');
        expenseForm === null || expenseForm === void 0 ? void 0 : expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('expenseTitle');
            const amountInput = document.getElementById('expenseAmount');
            const typeInput = document.getElementById('expenseType');
            const categoryInput = document.getElementById('expenseCategory');
            const dateInput = document.getElementById('expenseDate');
            const notesInput = document.getElementById('expenseNotes');
            const recurringInput = document.getElementById('isRecurringCheckbox');
            const formData = {
                title: (titleInput === null || titleInput === void 0 ? void 0 : titleInput.value) || '',
                amount: (amountInput === null || amountInput === void 0 ? void 0 : amountInput.value) || '',
                type: (typeInput === null || typeInput === void 0 ? void 0 : typeInput.value) || 'expense',
                category: (categoryInput === null || categoryInput === void 0 ? void 0 : categoryInput.value) || '',
                date: (dateInput === null || dateInput === void 0 ? void 0 : dateInput.value) || '',
                notes: (notesInput === null || notesInput === void 0 ? void 0 : notesInput.value) || '',
                isRecurring: (recurringInput === null || recurringInput === void 0 ? void 0 : recurringInput.checked) || false
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
                    category: formData.category,
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
            }
            catch (error) {
                if (error instanceof Error) {
                    this.ui.showToast(error.message, true);
                }
            }
        });
        // Save Edited Transaction
        const saveEditBtn = document.getElementById('saveEditBtn');
        saveEditBtn === null || saveEditBtn === void 0 ? void 0 : saveEditBtn.addEventListener('click', () => {
            if (!this.currentEditingId)
                return;
            const editTitle = document.getElementById('editTitle');
            const editAmount = document.getElementById('editAmount');
            const editType = document.getElementById('editType');
            const editCategory = document.getElementById('editCategory');
            const editDate = document.getElementById('editDate');
            const editNotes = document.getElementById('editNotes');
            const formData = {
                title: (editTitle === null || editTitle === void 0 ? void 0 : editTitle.value) || '',
                amount: (editAmount === null || editAmount === void 0 ? void 0 : editAmount.value) || '',
                type: (editType === null || editType === void 0 ? void 0 : editType.value) || 'expense',
                category: (editCategory === null || editCategory === void 0 ? void 0 : editCategory.value) || '',
                date: (editDate === null || editDate === void 0 ? void 0 : editDate.value) || '',
                notes: (editNotes === null || editNotes === void 0 ? void 0 : editNotes.value) || ''
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
                    category: formData.category,
                    date: formData.date,
                    notes: formData.notes
                });
                this.closeEditModal();
                this.ui.showToast('Transaction updated.');
                this.refresh();
            }
            catch (error) {
                if (error instanceof Error) {
                    this.ui.showToast(error.message, true);
                }
            }
        });
        // Cancel Edit Modal
        (_a = document.getElementById('cancelEditBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.closeEditModal();
        });
        (_b = document.getElementById('closeEditModalBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.closeEditModal();
        });
        // Currency Switcher
        const currencySelect = document.getElementById('currencySelect');
        currencySelect === null || currencySelect === void 0 ? void 0 : currencySelect.addEventListener('change', () => {
            this.service.setCurrency(currencySelect.value);
            this.ui.showToast(`Currency changed to ${currencySelect.value}`);
            this.refresh();
        });
        // Update Overall Budget
        const updateBudgetBtn = document.getElementById('updateBudgetBtn');
        updateBudgetBtn === null || updateBudgetBtn === void 0 ? void 0 : updateBudgetBtn.addEventListener('click', () => {
            const budgetInput = document.getElementById('monthlyBudgetInput');
            const val = parseFloat((budgetInput === null || budgetInput === void 0 ? void 0 : budgetInput.value) || '');
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
        saveCatBudgetBtn === null || saveCatBudgetBtn === void 0 ? void 0 : saveCatBudgetBtn.addEventListener('click', () => {
            const catSelect = document.getElementById('budgetCategorySelect');
            const amtInput = document.getElementById('categoryBudgetAmount');
            const category = catSelect === null || catSelect === void 0 ? void 0 : catSelect.value;
            const amount = parseFloat((amtInput === null || amtInput === void 0 ? void 0 : amtInput.value) || '');
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
            el === null || el === void 0 ? void 0 : el.addEventListener('input', () => this.refresh());
            el === null || el === void 0 ? void 0 : el.addEventListener('change', () => this.refresh());
        });
        // Reset Filters
        (_c = document.getElementById('resetFiltersBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            const typeFilter = document.getElementById('typeFilter');
            const categoryFilter = document.getElementById('categoryFilter');
            const searchInput = document.getElementById('searchDescriptionInput');
            const startDate = document.getElementById('startDateFilter');
            const endDate = document.getElementById('endDateFilter');
            const sortBy = document.getElementById('sortBySelect');
            const sortOrder = document.getElementById('sortOrderSelect');
            if (typeFilter)
                typeFilter.value = 'ALL';
            if (categoryFilter)
                categoryFilter.value = 'ALL';
            if (searchInput)
                searchInput.value = '';
            if (startDate)
                startDate.value = '';
            if (endDate)
                endDate.value = '';
            if (sortBy)
                sortBy.value = 'date';
            if (sortOrder)
                sortOrder.value = 'desc';
            this.refresh();
        });
        // Recurring Rule Form
        const recurringForm = document.getElementById('recurringRuleForm');
        recurringForm === null || recurringForm === void 0 ? void 0 : recurringForm.addEventListener('submit', (e) => {
            var _a, _b, _c, _d, _e, _f;
            e.preventDefault();
            const title = (_a = document.getElementById('recurringTitle')) === null || _a === void 0 ? void 0 : _a.value;
            const amount = parseFloat(((_b = document.getElementById('recurringAmount')) === null || _b === void 0 ? void 0 : _b.value) || '');
            const type = (_c = document.getElementById('recurringType')) === null || _c === void 0 ? void 0 : _c.value;
            const category = (_d = document.getElementById('recurringCategory')) === null || _d === void 0 ? void 0 : _d.value;
            const frequency = (_e = document.getElementById('recurringFrequency')) === null || _e === void 0 ? void 0 : _e.value;
            const startDate = (_f = document.getElementById('recurringStartDate')) === null || _f === void 0 ? void 0 : _f.value;
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
        (_d = document.getElementById('exportJSONBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            ExpenseImportExport.exportToJSON(this.service.getExpenses());
            this.ui.showToast('JSON export downloaded.');
        });
        // Export CSV
        (_e = document.getElementById('exportCSVBtn')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            ExpenseImportExport.exportToCSV(this.service.getExpenses());
            this.ui.showToast('CSV export downloaded.');
        });
        // Import File
        const importFileInput = document.getElementById('importFileInput');
        importFileInput === null || importFileInput === void 0 ? void 0 : importFileInput.addEventListener('change', () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const file = (_a = importFileInput.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return;
            try {
                if (file.name.endsWith('.json')) {
                    const { validExpenses, result } = yield ExpenseImportExport.parseAndValidateImport(file);
                    if (validExpenses.length > 0) {
                        validExpenses.forEach((exp) => this.service.addExpense(exp));
                        this.refresh();
                        this.ui.showToast(`Imported ${validExpenses.length} transactions from JSON.`);
                    }
                    else {
                        this.ui.showToast(`No valid records found. ${result.errors.join(' ')}`, true);
                    }
                }
                else if (file.name.endsWith('.csv')) {
                    const text = yield ExpenseImportExport.readTextFile(file);
                    const { validExpenses, result } = ExpenseImportExport.parseCSVContent(text);
                    if (validExpenses.length > 0) {
                        validExpenses.forEach((exp) => this.service.addExpense(exp));
                        this.refresh();
                        this.ui.showToast(`Imported ${validExpenses.length} transactions from CSV.`);
                    }
                    else {
                        this.ui.showToast(`No valid CSV records: ${result.errors.join(' ')}`, true);
                    }
                }
                else {
                    this.ui.showToast('Unsupported file type. Use .json or .csv.', true);
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    this.ui.showToast(error.message, true);
                }
            }
            finally {
                importFileInput.value = '';
            }
        }));
        // Clear All Data
        (_f = document.getElementById('clearAllDataBtn')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
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
