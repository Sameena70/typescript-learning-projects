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
        const modal = document.getElementById('editExpenseModal');
        const titleInput = document.getElementById('editTitleInput');
        const amountInput = document.getElementById('editAmountInput');
        const categoryInput = document.getElementById('editCategorySelect');
        const dateInput = document.getElementById('editDateInput');
        const notesInput = document.getElementById('editNotesInput');
        const expenseRadio = document.getElementById('editTypeExpense');
        const incomeRadio = document.getElementById('editTypeIncome');
        if (expense.type === 'income') {
            incomeRadio.checked = true;
        }
        else {
            expenseRadio.checked = true;
        }
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
    renderRecurringRulesList() {
        const listEl = document.getElementById('recurringRulesList');
        if (!listEl)
            return;
        const rules = this.service.getRecurringRules();
        const settings = this.service.getSettings();
        if (rules.length === 0) {
            listEl.innerHTML = '<p class="text-muted text-sm">No recurring rules configured yet.</p>';
            return;
        }
        listEl.innerHTML = rules
            .map((r) => `
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
      `)
            .join('');
        listEl.querySelectorAll('.delete-rec-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const ruleId = e.currentTarget.getAttribute('data-rule-id');
                if (ruleId) {
                    this.service.deleteRecurringRule(ruleId);
                    this.renderRecurringRulesList();
                    this.ui.showToast('Recurring rule removed.');
                }
            });
        });
    }
    bindEvents() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        // Currency Selector
        const currencySelect = document.getElementById('currencySelect');
        currencySelect === null || currencySelect === void 0 ? void 0 : currencySelect.addEventListener('change', () => {
            this.service.setCurrency(currencySelect.value);
            this.ui.showToast(`Active currency updated to ${currencySelect.value}.`);
            this.refresh();
        });
        // Add Expense Form
        const expenseForm = document.getElementById('expenseForm');
        const titleInput = document.getElementById('expenseTitle');
        const amountInput = document.getElementById('expenseAmount');
        const categorySelect = document.getElementById('expenseCategory');
        const dateInput = document.getElementById('expenseDate');
        const notesInput = document.getElementById('expenseNotes');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        expenseForm === null || expenseForm === void 0 ? void 0 : expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const typeRadio = document.querySelector('input[name="transactionType"]:checked');
            const type = (typeRadio === null || typeRadio === void 0 ? void 0 : typeRadio.value) === 'income' ? 'income' : 'expense';
            const validation = ExpenseValidator.validateExpense({
                title: titleInput.value,
                amount: amountInput.value,
                category: categorySelect.value,
                date: dateInput.value,
                type,
                notes: notesInput === null || notesInput === void 0 ? void 0 : notesInput.value
            });
            // Clear previous error styles
            const titleErr = document.getElementById('titleError');
            const amountErr = document.getElementById('amountError');
            const dateErr = document.getElementById('dateError');
            if (titleErr)
                titleErr.textContent = validation.errors.title || '';
            if (amountErr)
                amountErr.textContent = validation.errors.amount || '';
            if (dateErr)
                dateErr.textContent = validation.errors.date || '';
            if (!validation.isValid)
                return;
            try {
                this.service.addExpense({
                    title: titleInput.value,
                    amount: parseFloat(amountInput.value),
                    category: categorySelect.value,
                    date: dateInput.value,
                    type,
                    notes: notesInput === null || notesInput === void 0 ? void 0 : notesInput.value
                });
                expenseForm.reset();
                dateInput.value = new Date().toISOString().split('T')[0];
                // Reset radio back to expense
                const defaultRadio = document.querySelector('input[name="transactionType"][value="expense"]');
                if (defaultRadio)
                    defaultRadio.checked = true;
                this.ui.showToast(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
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
            const titleErr = document.getElementById('titleError');
            const amountErr = document.getElementById('amountError');
            const dateErr = document.getElementById('dateError');
            if (titleErr)
                titleErr.textContent = '';
            if (amountErr)
                amountErr.textContent = '';
            if (dateErr)
                dateErr.textContent = '';
        });
        // Edit modal form submission
        (_b = document.getElementById('editExpenseForm')) === null || _b === void 0 ? void 0 : _b.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.currentEditingId)
                return;
            const editTitleInput = document.getElementById('editTitleInput');
            const editAmountInput = document.getElementById('editAmountInput');
            const editCategoryInput = document.getElementById('editCategorySelect');
            const editDateInput = document.getElementById('editDateInput');
            const editNotesInput = document.getElementById('editNotesInput');
            const editTypeRadio = document.querySelector('input[name="editTransactionType"]:checked');
            const type = (editTypeRadio === null || editTypeRadio === void 0 ? void 0 : editTypeRadio.value) === 'income' ? 'income' : 'expense';
            const validation = ExpenseValidator.validateExpense({
                title: editTitleInput.value,
                amount: editAmountInput.value,
                category: editCategoryInput.value,
                date: editDateInput.value,
                type
            });
            const editErrorEl = document.getElementById('editErrorMsg');
            if (!validation.isValid) {
                if (editErrorEl)
                    editErrorEl.textContent = Object.values(validation.errors)[0];
                return;
            }
            if (editErrorEl)
                editErrorEl.textContent = '';
            try {
                this.service.updateExpense(this.currentEditingId, {
                    title: editTitleInput.value,
                    amount: parseFloat(editAmountInput.value),
                    category: editCategoryInput.value,
                    date: editDateInput.value,
                    type,
                    notes: editNotesInput.value || undefined
                });
                this.closeEditModal();
                this.ui.showToast('Transaction updated successfully!');
                this.refresh();
            }
            catch (err) {
                if (err instanceof Error && editErrorEl) {
                    editErrorEl.textContent = err.message;
                }
            }
        });
        (_c = document
            .getElementById('cancelEditBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => this.closeEditModal());
        (_d = document
            .getElementById('closeEditModalBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => this.closeEditModal());
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
            this.ui.showToast('Monthly budget updated successfully!');
            this.refresh();
        });
        // Category Budget button in modal
        (_j = document.getElementById('setCategoryBudgetBtn')) === null || _j === void 0 ? void 0 : _j.addEventListener('click', () => {
            const catSelect = document.getElementById('budgetCategorySelect');
            const limitInput = document.getElementById('categoryBudgetLimitInput');
            const limit = parseFloat(limitInput.value);
            if (isNaN(limit) || limit <= 0) {
                this.ui.showToast('Please enter a valid limit greater than 0', true);
                return;
            }
            this.service.setCategoryBudget(catSelect.value, limit);
            limitInput.value = '';
            this.ui.showToast(`Budget for ${catSelect.value} updated.`);
            this.refresh();
        });
        // Recurring Modal controls
        const recurringModal = document.getElementById('recurringModal');
        (_k = document.getElementById('recurringRulesBtn')) === null || _k === void 0 ? void 0 : _k.addEventListener('click', () => {
            this.renderRecurringRulesList();
            const recDate = document.getElementById('recStartDateInput');
            if (recDate && !recDate.value) {
                recDate.value = new Date().toISOString().split('T')[0];
            }
            recurringModal === null || recurringModal === void 0 ? void 0 : recurringModal.classList.remove('hidden');
        });
        const closeRecModal = () => recurringModal === null || recurringModal === void 0 ? void 0 : recurringModal.classList.add('hidden');
        (_l = document.getElementById('closeRecurringModalBtn')) === null || _l === void 0 ? void 0 : _l.addEventListener('click', closeRecModal);
        (_m = document.getElementById('closeRecurringBtn')) === null || _m === void 0 ? void 0 : _m.addEventListener('click', closeRecModal);
        // Add Recurring Rule Form
        (_o = document.getElementById('recurringRuleForm')) === null || _o === void 0 ? void 0 : _o.addEventListener('submit', (e) => {
            e.preventDefault();
            const recTitle = document.getElementById('recTitleInput').value;
            const recAmount = parseFloat(document.getElementById('recAmountInput').value);
            const recType = document.getElementById('recTypeSelect')
                .value;
            const recCategory = document.getElementById('recCategorySelect')
                .value;
            const recFrequency = document.getElementById('recFrequencySelect')
                .value;
            const recDate = document.getElementById('recStartDateInput').value;
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
                document.getElementById('recurringRuleForm').reset();
                this.renderRecurringRulesList();
                this.ui.showToast('Recurring rule saved!');
                this.refresh();
            }
            catch (err) {
                if (err instanceof Error) {
                    this.ui.showToast(err.message, true);
                }
            }
        });
        // Clear all
        (_p = document.getElementById('clearAllBtn')) === null || _p === void 0 ? void 0 : _p.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear ALL recorded transactions? This cannot be undone.')) {
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
            var _a, _b;
            (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.addEventListener('input', () => this.refresh());
            (_b = document.getElementById(id)) === null || _b === void 0 ? void 0 : _b.addEventListener('change', () => this.refresh());
        });
        // Reset Filters button
        (_q = document.getElementById('resetFiltersBtn')) === null || _q === void 0 ? void 0 : _q.addEventListener('click', () => {
            document.getElementById('typeFilter').value = 'ALL';
            document.getElementById('categoryFilter').value = 'ALL';
            document.getElementById('searchDescriptionInput').value = '';
            document.getElementById('startDateFilter').value = '';
            document.getElementById('endDateFilter').value = '';
            document.getElementById('sortBySelect').value = 'date';
            document.getElementById('sortOrderSelect').value = 'desc';
            this.refresh();
        });
        // JSON Export
        (_r = document.getElementById('exportJsonBtn')) === null || _r === void 0 ? void 0 : _r.addEventListener('click', () => {
            const expenses = this.service.getExpenses();
            if (expenses.length === 0) {
                this.ui.showToast('No transactions available to export.', true);
                return;
            }
            try {
                ExpenseImportExport.exportToJSON(expenses);
                this.ui.showToast('Exported JSON backup successfully.');
            }
            catch (err) {
                if (err instanceof Error) {
                    this.ui.showToast(err.message, true);
                }
            }
        });
        // CSV Export
        (_s = document.getElementById('exportCsvBtn')) === null || _s === void 0 ? void 0 : _s.addEventListener('click', () => {
            const expenses = this.service.getExpenses();
            if (expenses.length === 0) {
                this.ui.showToast('No transactions available to export.', true);
                return;
            }
            try {
                ExpenseImportExport.exportToCSV(expenses);
                this.ui.showToast('Exported CSV spreadsheet successfully.');
            }
            catch (err) {
                if (err instanceof Error) {
                    this.ui.showToast(err.message, true);
                }
            }
        });
        // JSON Import
        const jsonFileInput = document.getElementById('jsonFileInput');
        (_t = document.getElementById('importJsonBtn')) === null || _t === void 0 ? void 0 : _t.addEventListener('click', () => {
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
        // CSV Import
        const csvFileInput = document.getElementById('csvFileInput');
        (_u = document.getElementById('importCsvBtn')) === null || _u === void 0 ? void 0 : _u.addEventListener('click', () => {
            csvFileInput === null || csvFileInput === void 0 ? void 0 : csvFileInput.click();
        });
        csvFileInput === null || csvFileInput === void 0 ? void 0 : csvFileInput.addEventListener('change', () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const file = (_a = csvFileInput.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return;
            try {
                const { validItems, importResult } = yield ExpenseImportExport.parseAndValidateCSV(file);
                const { added, skipped } = this.service.bulkImport(validItems);
                this.ui.showToast(`Imported ${added} records from CSV (${skipped + importResult.skippedCount} skipped/duplicates).`);
                this.refresh();
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to import CSV file.';
                this.ui.showToast(msg, true);
            }
            finally {
                csvFileInput.value = '';
            }
        }));
    }
}
window.addEventListener('DOMContentLoaded', () => {
    new ExpenseApp();
});
