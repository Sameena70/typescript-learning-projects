"use strict";
// ========================================================
// TypeScript: Personal Expense Tracker
// Demonstrating Types, Interfaces, LocalStorage & DOM
// ========================================================
// ========================================================
// 2. DOM Elements with TypeScript Type Assertions
// ========================================================
// Summary displays
const totalExpensesDisplay = document.getElementById("totalExpensesDisplay");
const expenseCountText = document.getElementById("expenseCountText");
const budgetDisplay = document.getElementById("budgetDisplay");
const remainingBalanceDisplay = document.getElementById("remainingBalanceDisplay");
const balanceBadge = document.getElementById("balanceBadge");
const budgetProgressBar = document.getElementById("budgetProgressBar");
// Form inputs & errors
const expenseForm = document.getElementById("expenseForm");
const expenseTitle = document.getElementById("expenseTitle");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");
const resetFormBtn = document.getElementById("resetFormBtn");
const titleError = document.getElementById("titleError");
const amountError = document.getElementById("amountError");
const dateError = document.getElementById("dateError");
// Records table & controls
const expenseTableBody = document.getElementById("expenseTableBody");
const emptyState = document.getElementById("emptyState");
const categoryFilter = document.getElementById("categoryFilter");
const clearAllBtn = document.getElementById("clearAllBtn");
// Budget modal elements
const editBudgetBtn = document.getElementById("editBudgetBtn");
const budgetModal = document.getElementById("budgetModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBudgetBtn = document.getElementById("cancelBudgetBtn");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const monthlyBudgetInput = document.getElementById("monthlyBudgetInput");
const budgetError = document.getElementById("budgetError");
// ========================================================
// 3. Application State Variables
// ========================================================
const STORAGE_EXPENSES_KEY = "ts_expense_tracker_items";
const STORAGE_BUDGET_KEY = "ts_expense_tracker_budget";
// Array holding all expense items
let expenses = loadExpensesFromStorage();
// Monthly target budget (default to 1000 if not set)
let monthlyBudget = loadBudgetFromStorage();
// ========================================================
// 4. Storage Helpers (localStorage)
// ========================================================
/**
 * Loads expenses from browser's localStorage
 */
function loadExpensesFromStorage() {
    const savedData = localStorage.getItem(STORAGE_EXPENSES_KEY);
    if (savedData !== null) {
        try {
            return JSON.parse(savedData);
        }
        catch (_a) {
            return [];
        }
    }
    return [];
}
/**
 * Saves current expenses array into localStorage
 */
function saveExpensesToStorage() {
    localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
}
/**
 * Loads the user's monthly budget
 */
function loadBudgetFromStorage() {
    const savedBudget = localStorage.getItem(STORAGE_BUDGET_KEY);
    if (savedBudget !== null) {
        const parsed = parseFloat(savedBudget);
        if (!isNaN(parsed) && parsed >= 0) {
            return parsed;
        }
    }
    return 25000; // Default monthly budget is ₹25,000
}
/**
 * Saves the monthly budget
 */
function saveBudgetToStorage(newBudget) {
    monthlyBudget = newBudget;
    localStorage.setItem(STORAGE_BUDGET_KEY, newBudget.toString());
}
// ========================================================
// 5. Utility / Formatting Functions
// ========================================================
/**
 * Formats a number to Indian Rupee (INR) currency string (e.g. 12500 -> ₹12,500.00)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);
}
/**
 * Formats a YYYY-MM-DD string into a readable date (e.g. Oct 30, 2026)
 */
function formatDate(dateString) {
    if (!dateString)
        return "-";
    const dateParts = dateString.split("-");
    if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const dateObj = new Date(year, month, day);
        return dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }
    return dateString;
}
/**
 * Sets today's date as default in the date input
 */
function setDefaultDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    expenseDate.value = `${year}-${month}-${day}`;
}
// ========================================================
// 6. Validation Helpers
// ========================================================
/**
 * Clears error messages on the form
 */
function clearValidationErrors() {
    titleError.innerText = "";
    amountError.innerText = "";
    dateError.innerText = "";
}
/**
 * Validates the expense form inputs
 */
function validateExpenseForm() {
    clearValidationErrors();
    let isValid = true;
    // Title validation
    const titleValue = expenseTitle.value.trim();
    if (titleValue.length === 0) {
        titleError.innerText = "Please enter an expense description.";
        isValid = false;
    }
    else if (titleValue.length < 2) {
        titleError.innerText = "Description must be at least 2 characters long.";
        isValid = false;
    }
    // Amount validation
    const amountValue = parseFloat(expenseAmount.value);
    if (isNaN(amountValue)) {
        amountError.innerText = "Please enter a valid amount.";
        isValid = false;
    }
    else if (amountValue <= 0) {
        amountError.innerText = "Amount must be greater than $0.00.";
        isValid = false;
    }
    // Date validation
    if (!expenseDate.value) {
        dateError.innerText = "Please select a valid date.";
        isValid = false;
    }
    return isValid;
}
// ========================================================
// 7. Core Calculations & UI Rendering
// ========================================================
/**
 * Calculates sum of all expenses
 */
function calculateTotalExpenses() {
    return expenses.reduce((total, item) => total + item.amount, 0);
}
/**
 * Updates top summary statistics (Total, Budget, Balance, Progress)
 */
function renderSummary() {
    const totalSpent = calculateTotalExpenses();
    const remainingBalance = monthlyBudget - totalSpent;
    totalExpensesDisplay.innerText = formatCurrency(totalSpent);
    budgetDisplay.innerText = formatCurrency(monthlyBudget);
    remainingBalanceDisplay.innerText = formatCurrency(remainingBalance);
    // Count description
    expenseCountText.innerText = `${expenses.length} transaction${expenses.length === 1 ? "" : "s"} recorded`;
    // Calculate percentage of budget used
    let percentUsed = 0;
    if (monthlyBudget > 0) {
        percentUsed = Math.min((totalSpent / monthlyBudget) * 100, 100);
    }
    budgetProgressBar.style.width = `${percentUsed}%`;
    // Status badges & color indication
    if (remainingBalance < 0) {
        balanceBadge.innerText = "Over Budget";
        balanceBadge.className = "stat-badge badge-exceeded";
        budgetProgressBar.style.backgroundColor = "var(--accent-rose)";
        remainingBalanceDisplay.style.color = "var(--accent-rose)";
    }
    else if (percentUsed >= 85) {
        balanceBadge.innerText = "Warning (85%+)";
        balanceBadge.className = "stat-badge badge-danger";
        budgetProgressBar.style.backgroundColor = "var(--accent-amber)";
        remainingBalanceDisplay.style.color = "#ffffff";
    }
    else {
        balanceBadge.innerText = "Within Budget";
        balanceBadge.className = "stat-badge badge-safe";
        budgetProgressBar.style.backgroundColor = "var(--accent-emerald)";
        remainingBalanceDisplay.style.color = "#ffffff";
    }
}
/**
 * Renders the table rows based on active filter
 */
function renderExpenseTable() {
    const selectedCategory = categoryFilter.value;
    // Filter items
    const filteredExpenses = expenses.filter((item) => {
        if (selectedCategory === "ALL") {
            return true;
        }
        return item.category === selectedCategory;
    });
    // Toggle empty state display
    if (filteredExpenses.length === 0) {
        expenseTableBody.innerHTML = "";
        emptyState.classList.remove("hidden");
        return;
    }
    emptyState.classList.add("hidden");
    // Generate table rows HTML
    const rowsHtml = filteredExpenses
        .map((item) => {
        return `
        <tr>
          <td>
            <strong>${escapeHtml(item.title)}</strong>
          </td>
          <td>
            <span class="category-tag">${escapeHtml(item.category)}</span>
          </td>
          <td>${formatDate(item.date)}</td>
          <td class="amount-text">${formatCurrency(item.amount)}</td>
          <td class="text-center">
            <button 
              type="button" 
              class="btn-delete" 
              data-id="${item.id}" 
              title="Delete this expense"
            >
              🗑️ Delete
            </button>
          </td>
        </tr>
      `;
    })
        .join("");
    expenseTableBody.innerHTML = rowsHtml;
    // Attach delete event listeners to all delete buttons
    const deleteButtons = expenseTableBody.querySelectorAll(".btn-delete");
    deleteButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const idToDelete = btn.getAttribute("data-id");
            if (idToDelete) {
                deleteExpense(idToDelete);
            }
        });
    });
}
/**
 * Escapes HTML characters to prevent XSS attacks in titles
 */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}
// ========================================================
// 8. User Actions (Add, Delete, Clear, Edit Budget)
// ========================================================
/**
 * Adds a new expense item from form inputs
 */
function handleAddExpense(event) {
    event.preventDefault(); // Prevent standard page reload
    if (!validateExpenseForm()) {
        return;
    }
    // Create new expense object conforming to Expense interface
    const newExpense = {
        id: "exp_" + Date.now().toString(),
        title: expenseTitle.value.trim(),
        amount: parseFloat(expenseAmount.value),
        category: expenseCategory.value,
        date: expenseDate.value,
    };
    // Add to start of array
    expenses.unshift(newExpense);
    // Persist to storage
    saveExpensesToStorage();
    // Reset input fields
    expenseTitle.value = "";
    expenseAmount.value = "";
    clearValidationErrors();
    setDefaultDate();
    expenseTitle.focus();
    // Re-render
    renderSummary();
    renderExpenseTable();
}
/**
 * Deletes a single expense by ID
 */
function deleteExpense(id) {
    expenses = expenses.filter((item) => item.id !== id);
    saveExpensesToStorage();
    renderSummary();
    renderExpenseTable();
}
/**
 * Clears all expenses after confirmation
 */
function clearAllExpenses() {
    if (expenses.length === 0) {
        return;
    }
    const confirmAction = window.confirm("Are you sure you want to delete all expenses? This cannot be undone.");
    if (confirmAction) {
        expenses = [];
        saveExpensesToStorage();
        renderSummary();
        renderExpenseTable();
    }
}
// ========================================================
// 9. Budget Modal Controls
// ========================================================
function openBudgetModal() {
    monthlyBudgetInput.value = monthlyBudget.toString();
    budgetError.innerText = "";
    budgetModal.classList.remove("hidden");
    monthlyBudgetInput.focus();
}
function closeBudgetModal() {
    budgetModal.classList.add("hidden");
    budgetError.innerText = "";
}
function handleSaveBudget() {
    const enteredValue = parseFloat(monthlyBudgetInput.value);
    if (isNaN(enteredValue) || enteredValue < 0) {
        budgetError.innerText = "Please enter a valid positive number.";
        return;
    }
    saveBudgetToStorage(enteredValue);
    closeBudgetModal();
    renderSummary();
}
// ========================================================
// 10. Event Listeners Registration
// ========================================================
expenseForm.addEventListener("submit", handleAddExpense);
resetFormBtn.addEventListener("click", () => {
    expenseTitle.value = "";
    expenseAmount.value = "";
    clearValidationErrors();
    setDefaultDate();
});
categoryFilter.addEventListener("change", renderExpenseTable);
clearAllBtn.addEventListener("click", clearAllExpenses);
editBudgetBtn.addEventListener("click", openBudgetModal);
closeModalBtn.addEventListener("click", closeBudgetModal);
cancelBudgetBtn.addEventListener("click", closeBudgetModal);
saveBudgetBtn.addEventListener("click", handleSaveBudget);
// Close modal when clicking outside card
budgetModal.addEventListener("click", (event) => {
    if (event.target === budgetModal) {
        closeBudgetModal();
    }
});
// Close modal on Escape key
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !budgetModal.classList.contains("hidden")) {
        closeBudgetModal();
    }
});
// ========================================================
// 11. Initial Application Setup
// ========================================================
setDefaultDate();
renderSummary();
renderExpenseTable();
