# Personal Expense Tracker (TypeScript)

A modern, responsive **Personal Expense and Budget Management Web Application** built using **HTML5, CSS3, and TypeScript (compiled to JavaScript)**.

Formatted specifically with **Indian Rupee (₹ INR)** currency, this project demonstrates real-world application state management, typed array callbacks, reusable helpers, default parameters, and browser `localStorage` integration.

---

## ✨ Features

1. **Add Expenses**:
   - Log transactions with Description, Amount (₹), Category, and Date.
   - Defaults automatically to today's date upon load and form reset.
2. **Form Validation**:
   - Rejects empty descriptions (< 2 characters), non-numeric or negative amounts, and missing dates with inline error feedback.
3. **Monthly Budget Tracking**:
   - Set and update your monthly spending target anytime via an interactive modal.
   - Calculates total spent, remaining balance, and visual budget consumption percentage.
   - Dynamic status badges: **Within Budget** (emerald), **Warning 85%+** (amber), and **Over Budget** (rose).
4. **Expense List & Table**:
   - Displays transactions in a clean responsive table.
   - Category filtering (Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Health, Education, Other, or All).
5. **Delete & Clear Operations**:
   - Delete individual expense rows with single-click buttons.
   - "Clear All" action with native confirmation alert to reset history.
6. **Data Persistence (`localStorage`)**:
   - All transactions and budget settings persist across browser restarts using safe `try / catch` deserialization and nullish fallbacks.
7. **Unified Form Reset**:
   - Consolidates form clearing and error removal into a reusable helper (`resetExpenseForm()`).

---

## 🛠️ Technologies Used

- **TypeScript (v5.x)**: Interfaces (`Expense`), strict mode, typed array methods, reusable helpers, default parameters, and nullish coalescing.
- **HTML5**: Semantic forms, tables, modal dialogs, and responsive sections.
- **CSS3**: Modern warm-gray theme variables, CSS Grid, Flexbox, progress bars, and status badges.
- **Browser APIs**: `localStorage` and `Intl.NumberFormat("en-IN")` for currency formatting.

---

## 📂 Project Structure

```text
02-expense-tracker/
├── dist/
│   └── expense-tracker.js   # Compiled JavaScript consumed by index.html
├── src/
│   └── expense-tracker.ts   # Main TypeScript source code
├── index.html               # Main application interface and budget modal
├── style.css                # Layout styling, card components, and status badges
├── package.json             # NPM package scripts (build: "tsc", watch: "tsc --watch")
├── tsconfig.json            # Compiler configuration (Target: ES6, Strict: true)
└── README.md                # Project documentation
```

---

## 🧠 TypeScript Concepts Practised in this Project

1. **Custom Interfaces (`interface Expense`)**:
   - Enforces strict contract for transaction records:
     ```typescript
     interface Expense {
       id: string;
       title: string;
       amount: number;
       category: string;
       date: string;
     }
     ```
2. **Higher-Order Array Callbacks with Explicit Types**:
   - `.reduce()`: Accumulates total expense amount into a single number:
     ```typescript
     expenses.reduce((runningTotal: number, currentExpense: Expense): number => runningTotal + currentExpense.amount, 0);
     ```
   - `.filter()`: Filters active category and filters out deleted IDs:
     ```typescript
     expenses.filter((item: Expense): boolean => item.id !== id);
     ```
   - `.map()`: Transforms `Expense` records into HTML table row strings.
3. **Reusable Functions & Eliminating Duplication**:
   - `resetExpenseForm()`: Unified helper replacing duplicated form reset instructions.
   - `calculateBudgetPercentage(spent: number, budget: number): number`: Pure math calculation capped cleanly at 100%.
4. **Default & Optional Parameters**:
   - `formatCurrency(amount: number, currencyCode: string = "INR", locale: string = "en-IN"): string`
   - `formatDate(dateString?: string, fallbackText: string = "-"): string`
5. **Nullish Coalescing (`??`) for Safe Storage & DOM Fallbacks**:
   - `localStorage.getItem(STORAGE_EXPENSES_KEY) ?? "[]"`
   - `localStorage.getItem(STORAGE_BUDGET_KEY) ?? "25000"`
   - `btn.getAttribute("data-id") ?? ""`

---

## 🚀 How to Run and Compile

### 1. Open in Browser
Double-click `index.html` or open PowerShell inside this folder:
```powershell
Start-Process "02-expense-tracker/index.html"
```

### 2. Compiling TypeScript
To recompile `src/expense-tracker.ts` into `dist/expense-tracker.js`:
```bash
# Using local tsconfig
tsc --project ./02-expense-tracker/tsconfig.json

# Or using the package script inside this folder:
cd 02-expense-tracker
npm run build
```

Watch mode for automatic re-compilation on save:
```bash
npm run watch
```
