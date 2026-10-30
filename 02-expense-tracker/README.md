# Personal Expense Tracker (TypeScript)

A modern, responsive, and beginner-friendly **Personal Expense Tracker Web Application** built using **HTML5, CSS3, and TypeScript (compiled to JavaScript)**.

---

## Features

1. **Add Expenses**:
   - Record transactions with Description, Amount ($), Category, and Date.
   - Intelligent auto-fill sets the default date to today.
2. **Strict Form Validations**:
   - Ensures no empty description, positive non-zero amounts, and valid date selections with visual inline error messages.
3. **Monthly Budget & Balance Calculation**:
   - Set and update your custom monthly budget anytime via an interactive modal.
   - Calculates remaining balance and percentage utilized.
   - Dynamic status badges: **Within Budget** (green), **Warning** (amber), and **Over Budget** (red).
4. **Expense List & Table**:
   - Real-time overview of all expenses.
   - Filter transactions easily by category.
5. **Delete & Clear Operations**:
   - Remove individual expenses with one click.
   - Clear all records with confirmation dialog.
6. **Data Persistence (localStorage)**:
   - All transactions and budget targets persist safely across page refreshes.
7. **Clean Modern Dark UI**:
   - Styled using CSS Grid, Flexbox, custom glow effects, and modern card components.

---

## Technologies Used

- **TypeScript**: Static typing, strict mode, object interfaces (`interface Expense`), DOM type casting, and state management.
- **HTML5**: Semantic forms, tables, modals, and responsive layout.
- **CSS3**: Modern dark theme variables, responsive grid, status badges, and interactive animations.
- **Browser APIs**: `localStorage` and `Intl.NumberFormat` for currency formatting.

---

## Project Structure

```text
02-expense-tracker/
├── dist/
│   └── expense-tracker.js   # Compiled JavaScript used by index.html
├── src/
│   └── expense-tracker.ts   # Main TypeScript source code
├── index.html               # Main user interface
├── style.css                # Modern styling and responsive rules
├── package.json             # NPM package scripts (build, watch)
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

---

## TypeScript Learning Highlights

This project demonstrates practical TypeScript concepts:
- **`interface Expense`**: Enforces strict object shapes:
  ```typescript
  interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
  }
  ```
- **Type Assertions on DOM elements**:
  ```typescript
  const expenseTitle = document.getElementById("expenseTitle") as HTMLInputElement;
  ```
- **Array methods with typed callbacks**:
  ```typescript
  expenses.reduce((total: number, item: Expense) => total + item.amount, 0);
  expenses.filter((item: Expense) => item.category === selectedCategory);
  ```
- **Union Types & Null Safety**: Safe parsing of `localStorage.getItem()` returning `string | null`.

---

## How to Run Locally

### 1. Open in Browser
Double-click `index.html` or open PowerShell inside this folder:
```powershell
Start-Process index.html
```

### 2. Compile TypeScript
To compile your TypeScript code into JavaScript:
```powershell
npx -p typescript tsc
```
Or run in watch mode:
```powershell
npx -p typescript tsc --watch
```

