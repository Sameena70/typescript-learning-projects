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
        this.bindEvents();
        this.refresh();
    }
    refresh() {
        const filterOptions = this.getActiveFilters();
        const filteredExpenses = this.service.filterExpenses(filterOptions);
        const allExpenses = this.service.getExpenses();
        const budget = this.service.getBudget();
        const summary = ExpenseCalculations.generateSummary(allExpenses, budget);
        this.ui.updateDashboard(summary);
        this.ui.renderExpensesTable(filteredExpenses, (id) => this.openEditModal(id), (id) => this.handleDelete(id));
    }
    getActiveFilters() {
        const categoryEl = document.getElementById('categoryFilter');
        const searchEl = document.getElementById('searchDescriptionInput');
        const startDateEl = document.getElementById('startDateFilter');
        const endDateEl = document.getElementById('endDateFilter');
        const sortByEl = document.getElementById('sortBySelect');
        const sortOrderEl = document.getElementById('sortOrderSelect');
        return {
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
                this.ui.showToast('Expense deleted successfully.');
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
        const modal = document.getElementById('editExpenseModal');
        const titleInput = document.getElementById('editTitleInput');
        const amountInput = document.getElementById('editAmountInput');
        const categoryInput = document.getElementById('editCategorySelect');
        const dateInput = document.getElementById('editDateInput');
        const notesInput = document.getElementById('editNotesInput');
        titleInput.value = expense.title;
        amountInput.value = expense.amount.toString();
        categoryInput.value = expense.category;
        dateInput.value = expense.date;
        notesInput.value = expense.notes || '';
        modal.classList.remove('hidden');
    }
    closeEditModal() {
        this.currentEditingId = null;
        const modal = document.getElementById('editExpenseModal');
        modal === null || modal === void 0 ? void 0 : modal.classList.add('hidden');
    }
    bindEvents() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        // Add Expense Form
        const expenseForm = document.getElementById('expenseForm');
        const titleInput = document.getElementById('expenseTitle');
        const amountInput = document.getElementById('expenseAmount');
        const categorySelect = document.getElementById('expenseCategory');
        const dateInput = document.getElementById('expenseDate');
        const notesInput = document.getElementById('expenseNotes');
        // Set today's date as default
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        expenseForm === null || expenseForm === void 0 ? void 0 : expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const validation = ExpenseValidator.validateExpense({
                title: titleInput.value,
                amount: amountInput.value,
                category: categorySelect.value,
                date: dateInput.value,
                notes: notesInput === null || notesInput === void 0 ? void 0 : notesInput.value
            });
            // Clear previous error styles
            document.getElementById('titleError').textContent = validation.errors.title || '';
            document.getElementById('amountError').textContent = validation.errors.amount || '';
            document.getElementById('dateError').textContent = validation.errors.date || '';
            if (!validation.isValid)
                return;
            try {
                this.service.addExpense({
                    title: titleInput.value,
                    amount: parseFloat(amountInput.value),
                    category: categorySelect.value,
                    date: dateInput.value,
                    notes: notesInput === null || notesInput === void 0 ? void 0 : notesInput.value
                });
                expenseForm.reset();
                dateInput.value = new Date().toISOString().split('T')[0];
                this.ui.showToast('Expense added successfully!');
                this.refresh();
            }
            catch (err) {
                if (err instanceof Error) {
                    this.ui.showToast(err.message, true);
                }
            }
        });
        // Reset Form button
        (_a = document.getElementById('resetFormBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            expenseForm.reset();
            dateInput.value = new Date().toISOString().split('T')[0];
            document.getElementById('titleError').textContent = '';
            document.getElementById('amountError').textContent = '';
            document.getElementById('dateError').textContent = '';
        });
        // Edit modal form submission
        (_b = document.getElementById('editExpenseForm')) === null || _b === void 0 ? void 0 : _b.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.currentEditingId)
                return;
            const titleInput = document.getElementById('editTitleInput');
            const amountInput = document.getElementById('editAmountInput');
            const categoryInput = document.getElementById('editCategorySelect');
            const dateInput = document.getElementById('editDateInput');
            const notesInput = document.getElementById('editNotesInput');
            const validation = ExpenseValidator.validateExpense({
                title: titleInput.value,
                amount: amountInput.value,
                category: categoryInput.value,
                date: dateInput.value
            });
            const editErrorEl = document.getElementById('editErrorMsg');
            if (!validation.isValid) {
                editErrorEl.textContent = Object.values(validation.errors)[0];
                return;
            }
            editErrorEl.textContent = '';
            try {
                this.service.updateExpense(this.currentEditingId, {
                    title: titleInput.value,
                    amount: parseFloat(amountInput.value),
                    category: categoryInput.value,
                    date: dateInput.value,
                    notes: notesInput.value || undefined
                });
                this.closeEditModal();
                this.ui.showToast('Expense updated successfully!');
                this.refresh();
            }
            catch (err) {
                if (err instanceof Error) {
                    editErrorEl.textContent = err.message;
                }
            }
        });
        (_c = document.getElementById('cancelEditBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => this.closeEditModal());
        (_d = document.getElementById('closeEditModalBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => this.closeEditModal());
        // Budget Modal controls
        const budgetModal = document.getElementById('budgetModal');
        const monthlyBudgetInput = document.getElementById('monthlyBudgetInput');
        const budgetError = document.getElementById('budgetError');
        (_e = document.getElementById('editBudgetBtn')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            monthlyBudgetInput.value = this.service.getBudget().toString();
            if (budgetError)
                budgetError.textContent = '';
            budgetModal === null || budgetModal === void 0 ? void 0 : budgetModal.classList.remove('hidden');
        });
        const closeBudgetModal = () => budgetModal === null || budgetModal === void 0 ? void 0 : budgetModal.classList.add('hidden');
        (_f = document.getElementById('closeModalBtn')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', closeBudgetModal);
        (_g = document.getElementById('cancelBudgetBtn')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', closeBudgetModal);
        (_h = document.getElementById('saveBudgetBtn')) === null || _h === void 0 ? void 0 : _h.addEventListener('click', () => {
            const val = parseFloat(monthlyBudgetInput.value);
            if (isNaN(val) || val < 0) {
                if (budgetError)
                    budgetError.textContent = 'Please enter a valid non-negative budget.';
                return;
            }
            this.service.setBudget(val);
            closeBudgetModal();
            this.ui.showToast('Budget updated successfully!');
            this.refresh();
        });
        // Clear all
        (_j = document.getElementById('clearAllBtn')) === null || _j === void 0 ? void 0 : _j.addEventListener('click', () => {
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
            var _a, _b;
            (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.addEventListener('input', () => this.refresh());
            (_b = document.getElementById(id)) === null || _b === void 0 ? void 0 : _b.addEventListener('change', () => this.refresh());
        });
        // Reset Filters button
        (_k = document.getElementById('resetFiltersBtn')) === null || _k === void 0 ? void 0 : _k.addEventListener('click', () => {
            document.getElementById('categoryFilter').value = 'ALL';
            document.getElementById('searchDescriptionInput').value = '';
            document.getElementById('startDateFilter').value = '';
            document.getElementById('endDateFilter').value = '';
            document.getElementById('sortBySelect').value = 'date';
            document.getElementById('sortOrderSelect').value = 'desc';
            this.refresh();
        });
        // JSON Export
        (_l = document.getElementById('exportJsonBtn')) === null || _l === void 0 ? void 0 : _l.addEventListener('click', () => {
            const expenses = this.service.getExpenses();
            if (expenses.length === 0) {
                this.ui.showToast('No expenses available to export.', true);
                return;
            }
            try {
                ExpenseImportExport.exportToJSON(expenses);
                this.ui.showToast('Exported expenses successfully.');
            }
            catch (err) {
                if (err instanceof Error) {
                    this.ui.showToast(err.message, true);
                }
            }
        });
        // JSON Import
        const jsonFileInput = document.getElementById('jsonFileInput');
        (_m = document.getElementById('importJsonBtn')) === null || _m === void 0 ? void 0 : _m.addEventListener('click', () => {
            jsonFileInput === null || jsonFileInput === void 0 ? void 0 : jsonFileInput.click();
        });
        jsonFileInput === null || jsonFileInput === void 0 ? void 0 : jsonFileInput.addEventListener('change', () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const file = (_a = jsonFileInput.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return;
            try {
                const { validItems, importResult } = yield ExpenseImportExport.parseAndValidateImport(file);
                const { added, skipped } = this.service.bulkImport(validItems);
                this.ui.showToast(`Imported ${added} records (${skipped + importResult.skippedCount} skipped/duplicates).`);
                this.refresh();
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to import JSON file.';
                this.ui.showToast(msg, true);
            }
            finally {
                jsonFileInput.value = '';
            }
        }));
    }
}
window.addEventListener('DOMContentLoaded', () => {
    new ExpenseApp();
});
