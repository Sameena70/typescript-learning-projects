// ========================================================
// TypeScript: Personal Expense Tracker
// Demonstrating Types, Interfaces, LocalStorage & DOM
// ========================================================

/**
 * 1. Data Structure Definitions using TypeScript Interface
 * An interface defines the strict shape of an Expense object.
 */
interface Expense {
  id: string;          // Unique identifier (UUID or timestamp)
  title: string;       // Name / description of the expense
  amount: number;      // Expense cost as a number
  category: string;    // Category (Food, Bills, Shopping, etc.)
  date: string;        // Date formatted as YYYY-MM-DD
}

// ========================================================
// 2. DOM Elements with TypeScript Type Assertions
// ========================================================

// Summary displays
const totalExpensesDisplay = document.getElementById("totalExpensesDisplay") as HTMLDivElement;
const expenseCountText = document.getElementById("expenseCountText") as HTMLDivElement;
const budgetDisplay = document.getElementById("budgetDisplay") as HTMLDivElement;
const remainingBalanceDisplay = document.getElementById("remainingBalanceDisplay") as HTMLDivElement;
const balanceBadge = document.getElementById("balanceBadge") as HTMLSpanElement;
const budgetProgressBar = document.getElementById("budgetProgressBar") as HTMLDivElement;

// Form inputs & errors
const expenseForm = document.getElementById("expenseForm") as HTMLFormElement;
const expenseTitle = document.getElementById("expenseTitle") as HTMLInputElement;
const expenseAmount = document.getElementById("expenseAmount") as HTMLInputElement;
const expenseCategory = document.getElementById("expenseCategory") as HTMLSelectElement;
const expenseDate = document.getElementById("expenseDate") as HTMLInputElement;
const resetFormBtn = document.getElementById("resetFormBtn") as HTMLButtonElement;

const titleError = document.getElementById("titleError") as HTMLSpanElement;
const amountError = document.getElementById("amountError") as HTMLSpanElement;
const dateError = document.getElementById("dateError") as HTMLSpanElement;

// Records table & controls
const expenseTableBody = document.getElementById("expenseTableBody") as HTMLTableSectionElement;
const emptyState = document.getElementById("emptyState") as HTMLDivElement;
const categoryFilter = document.getElementById("categoryFilter") as HTMLSelectElement;
const clearAllBtn = document.getElementById("clearAllBtn") as HTMLButtonElement;

// Budget modal elements
const editBudgetBtn = document.getElementById("editBudgetBtn") as HTMLButtonElement;
const budgetModal = document.getElementById("budgetModal") as HTMLDivElement;
const closeModalBtn = document.getElementById("closeModalBtn") as HTMLButtonElement;
const cancelBudgetBtn = document.getElementById("cancelBudgetBtn") as HTMLButtonElement;
const saveBudgetBtn = document.getElementById("saveBudgetBtn") as HTMLButtonElement;
const monthlyBudgetInput = document.getElementById("monthlyBudgetInput") as HTMLInputElement;
const budgetError = document.getElementById("budgetError") as HTMLSpanElement;

// ========================================================
// 3. Application State Variables
// ========================================================

const STORAGE_EXPENSES_KEY: string = "ts_expense_tracker_items";
const STORAGE_BUDGET_KEY: string = "ts_expense_tracker_budget";

// Array holding all expense items
let expenses: Expense[] = loadExpensesFromStorage();

// Monthly target budget (default to 1000 if not set)
let monthlyBudget: number = loadBudgetFromStorage();

// ========================================================
// 4. Storage Helpers (localStorage)
// ========================================================

/**
 * Loads expenses from browser's localStorage.
 * Uses ?? to provide a safe fallback string "[]" when localStorage item is null.
 */
function loadExpensesFromStorage(): Expense[] {
  const savedData: string = localStorage.getItem(STORAGE_EXPENSES_KEY) ?? "[]";
  try {
    return JSON.parse(savedData) as Expense[];
  } catch {
    return [];
  }
}

/**
 * Saves current expenses array into localStorage
 */
function saveExpensesToStorage(): void {
  localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
}

/**
 * Loads the user's monthly budget.
 * Uses ?? to provide a fallback "25000" if no budget is found in storage.
 */
function loadBudgetFromStorage(): number {
  const savedBudget: string = localStorage.getItem(STORAGE_BUDGET_KEY) ?? "25000";
  const parsed: number = parseFloat(savedBudget);
  if (!isNaN(parsed) && parsed >= 0) {
    return parsed;
  }
  return 25000; // Default monthly budget is ₹25,000
}

/**
 * Saves the monthly budget
 */
function saveBudgetToStorage(newBudget: number): void {
  monthlyBudget = newBudget;
  localStorage.setItem(STORAGE_BUDGET_KEY, newBudget.toString());
}

// ========================================================
// 5. Utility / Formatting Functions
// ========================================================

/**
 * Formats a number to a currency string.
 * Uses default parameters: currencyCode defaults to "INR", locale defaults to "en-IN".
 * @param amount - The numerical amount to format
 * @param currencyCode - ISO currency code (defaults to "INR")
 * @param locale - Formatting locale string (defaults to "en-IN")
 */
function formatCurrency(
  amount: number,
  currencyCode: string = "INR",
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a YYYY-MM-DD string into a readable date (e.g. Oct 30, 2026).
 * Optional parameter fallbackText specifies what to return when dateString is empty.
 */
function formatDate(dateString?: string, fallbackText: string = "-"): string {
  if (!dateString) return fallbackText;
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
 * Sets today's date as default in the date input.
 * Local variables (today, year, month, day) are scoped cleanly inside this function.
 */
function setDefaultDate(): void {
  const today: Date = new Date();
  const year: number = today.getFullYear();
  const month: string = String(today.getMonth() + 1).padStart(2, "0");
  const day: string = String(today.getDate()).padStart(2, "0");
  expenseDate.value = `${year}-${month}-${day}`;
}

/**
 * Calculates percentage of budget spent, capped at 100%.
 * Pure reusable calculation helper with function scope parameters.
 */
function calculateBudgetPercentage(spent: number, budget: number): number {
  if (budget <= 0) {
    return 0;
  }
  return Math.min((spent / budget) * 100, 100);
}

/**
 * Resets all expense form input fields and restores validation defaults.
 * Reusable helper eliminating duplicate form-reset code.
 */
function resetExpenseForm(): void {
  expenseTitle.value = "";
  expenseAmount.value = "";
  clearValidationErrors();
  setDefaultDate();
}

// ========================================================
// 6. Validation Helpers
// ========================================================

/**
 * Clears error messages on the form
 */
function clearValidationErrors(): void {
  titleError.innerText = "";
  amountError.innerText = "";
  dateError.innerText = "";
}

/**
 * Validates the expense form inputs
 */
function validateExpenseForm(): boolean {
  clearValidationErrors();
  let isValid: boolean = true;

  // Title validation
  const titleValue: string = expenseTitle.value.trim();
  if (titleValue.length === 0) {
    titleError.innerText = "Please enter an expense description.";
    isValid = false;
  } else if (titleValue.length < 2) {
    titleError.innerText = "Description must be at least 2 characters long.";
    isValid = false;
  }

  // Amount validation
  const amountValue: number = parseFloat(expenseAmount.value);
  if (isNaN(amountValue)) {
    amountError.innerText = "Please enter a valid amount.";
    isValid = false;
  } else if (amountValue <= 0) {
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
 * Calculates sum of all expenses.
 * Uses reduce() with an arrow function callback to accumulate amounts into a single number.
 * Callback parameters: (runningTotal: number, currentExpense: Expense)
 */
function calculateTotalExpenses(): number {
  return expenses.reduce(
    (runningTotal: number, currentExpense: Expense): number => runningTotal + currentExpense.amount,
    0
  );
}

/**
 * Updates top summary statistics (Total, Budget, Balance, Progress)
 */
function renderSummary(): void {
  const totalSpent: number = calculateTotalExpenses();
  const remainingBalance: number = monthlyBudget - totalSpent;

  totalExpensesDisplay.innerText = formatCurrency(totalSpent);
  budgetDisplay.innerText = formatCurrency(monthlyBudget);
  remainingBalanceDisplay.innerText = formatCurrency(remainingBalance);

  // Count description
  expenseCountText.innerText = `${expenses.length} transaction${expenses.length === 1 ? "" : "s"} recorded`;

  // Calculate percentage of budget used via reusable helper function
  const percentUsed: number = calculateBudgetPercentage(totalSpent, monthlyBudget);

  budgetProgressBar.style.width = `${percentUsed}%`;

  // Status badges & color indication
  if (remainingBalance < 0) {
    balanceBadge.innerText = "Over Budget";
    balanceBadge.className = "stat-badge badge-exceeded";
    budgetProgressBar.style.backgroundColor = "var(--accent-rose)";
    remainingBalanceDisplay.style.color = "var(--accent-rose)";
  } else if (percentUsed >= 85) {
    balanceBadge.innerText = "Warning (85%+)";
    balanceBadge.className = "stat-badge badge-danger";
    budgetProgressBar.style.backgroundColor = "var(--accent-amber)";
    remainingBalanceDisplay.style.color = "#ffffff";
  } else {
    balanceBadge.innerText = "Within Budget";
    balanceBadge.className = "stat-badge badge-safe";
    budgetProgressBar.style.backgroundColor = "var(--accent-emerald)";
    remainingBalanceDisplay.style.color = "#ffffff";
  }
}

/**
 * Renders the table rows based on active filter
 */
function renderExpenseTable(): void {
  const selectedCategory: string = categoryFilter.value;

  // Filter items: filter() uses a callback returning boolean to keep only matching expenses
  const filteredExpenses: Expense[] = expenses.filter((item: Expense): boolean => {
    return selectedCategory === "ALL" || item.category === selectedCategory;
  });

  // Toggle empty state display
  if (filteredExpenses.length === 0) {
    expenseTableBody.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  // Generate table rows HTML: map() transforms each Expense into an HTML table row string
  const rowsHtml: string = filteredExpenses
    .map((item: Expense): string => {
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
  const deleteButtons = expenseTableBody.querySelectorAll<HTMLButtonElement>(".btn-delete");
  deleteButtons.forEach((btn: HTMLButtonElement) => {
    btn.addEventListener("click", () => {
      // getAttribute returns string | null; use ?? to safely extract ID
      const idToDelete: string = btn.getAttribute("data-id") ?? "";
      if (idToDelete !== "") {
        deleteExpense(idToDelete);
      }
    });
  });
}

/**
 * Escapes HTML characters to prevent XSS attacks in titles
 */
function escapeHtml(text: string): string {
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
function handleAddExpense(event: Event): void {
  event.preventDefault(); // Prevent standard page reload

  if (!validateExpenseForm()) {
    return;
  }

  // Create new expense object conforming to Expense interface
  const newExpense: Expense = {
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

  // Reset input fields using reusable helper
  resetExpenseForm();
  expenseTitle.focus();

  // Re-render
  renderSummary();
  renderExpenseTable();
}

/**
 * Deletes a single expense by ID.
 * filter() creates a new array containing every expense EXCEPT the one matching the given ID.
 */
function deleteExpense(id: string): void {
  expenses = expenses.filter((item: Expense): boolean => item.id !== id);
  saveExpensesToStorage();
  renderSummary();
  renderExpenseTable();
}

/**
 * Clears all expenses after confirmation
 */
function clearAllExpenses(): void {
  if (expenses.length === 0) {
    return;
  }

  const confirmAction: boolean = window.confirm("Are you sure you want to delete all expenses? This cannot be undone.");
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

function openBudgetModal(): void {
  monthlyBudgetInput.value = monthlyBudget.toString();
  budgetError.innerText = "";
  budgetModal.classList.remove("hidden");
  monthlyBudgetInput.focus();
}

function closeBudgetModal(): void {
  budgetModal.classList.add("hidden");
  budgetError.innerText = "";
}

function handleSaveBudget(): void {
  const enteredValue: number = parseFloat(monthlyBudgetInput.value);

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
resetFormBtn.addEventListener("click", resetExpenseForm);
categoryFilter.addEventListener("change", renderExpenseTable);
clearAllBtn.addEventListener("click", clearAllExpenses);

editBudgetBtn.addEventListener("click", openBudgetModal);
closeModalBtn.addEventListener("click", closeBudgetModal);
cancelBudgetBtn.addEventListener("click", closeBudgetModal);
saveBudgetBtn.addEventListener("click", handleSaveBudget);

// Close modal when clicking outside card
budgetModal.addEventListener("click", (event: MouseEvent) => {
  if (event.target === budgetModal) {
    closeBudgetModal();
  }
});

// Close modal on Escape key
window.addEventListener("keydown", (event: KeyboardEvent) => {
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

