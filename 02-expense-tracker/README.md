# Advanced Personal Expense Tracker

A modern personal finance web application built in strict TypeScript with ES6 modules, JSON export/import capabilities, and INR currency formatting.

---

## 1. Project Overview

The **Advanced Expense Tracker** helps users manage daily expenses, set and monitor monthly budgets in Indian Rupees (₹), track category spending trends, filter and search transaction logs, and import/export expense data via JSON files.

---

## 2. Features

- **Expense Management**:
  - Add expenses with title, amount, category, date, and optional notes.
  - Edit existing expenses via an interactive modal.
  - Delete individual transactions or clear all records.
- **Budgeting & Dashboard Analytics**:
  - Custom monthly budget setting with remaining balance indicator.
  - Visual color-coded progress bar (Green: Safe, Orange: Warning >80%, Red: Over budget).
  - Spending metrics: Total spent, Monthly spending, Highest transaction, Average expense.
- **Search, Filter & Sorting**:
  - Real-time text search across expense descriptions and notes.
  - Filter by category (Food, Transport, Bills, Shopping, etc.).
  - Date range filtering (Start Date to End Date).
  - Multi-criteria sorting by Date or Amount (Ascending/Descending).
- **JSON Import & Export**:
  - Export all expense records to a clean `.json` file.
  - Import expense records from JSON using `FileReader` and `Promises`.
  - Schema validation and duplicate record detection.
- **Error Handling**:
  - Validates required fields, positive amounts, and realistic dates.
  - Catches corrupted or unavailable `localStorage`.
  - Non-intrusive floating toast notifications for user feedback.

---

## 3. Technology Stack

- **HTML5 & CSS3**: Modern dashboard layout with Plus Jakarta Sans typography.
- **TypeScript 5.x**: Strict mode, interfaces, union types, array methods (`reduce`, `filter`, `find`, `sort`).
- **Async File APIs**: Browser `FileReader` wrapped in typed ES6 `Promise`s.

---

## 4. Folder Structure

```
02-expense-tracker/
├── dist/                  # Compiled JavaScript ES6 modules
│   ├── calculations.js
│   ├── expense-service.js
│   ├── import-export.js
│   ├── main.js
│   ├── storage.js
│   ├── types.js
│   ├── ui.js
│   └── validation.js
├── src/                   # TypeScript source code
│   ├── types.ts           # Interfaces & union types
│   ├── storage.ts         # Safe localStorage persistence
│   ├── validation.ts      # Expense form & import data validators
│   ├── calculations.ts    # Financial math & INR currency formatters
│   ├── expense-service.ts # CRUD & in-memory transaction store
│   ├── import-export.ts   # Promise-based JSON import/export
│   ├── ui.ts              # DOM renderer & toasts
│   └── main.ts            # Application bootstrap & event listeners
├── index.html             # Application markup with type="module"
├── style.css              # Custom styling
├── package.json           # Build scripts & dependencies
├── tsconfig.json          # TypeScript compiler options
└── README.md              # Project documentation
```

---

## 5. TypeScript Module Breakdown

- **`types.ts`**: Declares `Expense`, `ExpenseCategory`, `ExpenseFilterOptions`, and `ExpenseDashboardSummary`.
- **`storage.ts`**: Generic persistence methods with `try/catch` and fallback data.
- **`validation.ts`**: Pure functions `validateExpense()` and `isValidExpenseObject()`.
- **`calculations.ts`**: Pure functions using array methods (`reduce`, `filter`, `map`) to calculate totals, monthly spend, category breakdown, and formatted INR strings.
- **`expense-service.ts`**: Manages state, sorting, filtering, deduplication, and updates.
- **`import-export.ts`**: Demonstrates Promise-based asynchronous file reading (`readJSONFile`) and JSON downloads.
- **`ui.ts`**: DOM updates, table rendering, and toast alerts.
- **`main.ts`**: Event orchestration and user interaction bindings.

---

## 6. How Concepts Work

### A. Async/Await & Promises
When a user uploads a `.json` backup:
```typescript
public static readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(JSON.parse(reader.result as string));
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
```
The caller consumes this cleanly using `await ExpenseImportExport.parseAndValidateImport(file)`.

### B. Safe JSON Parsing
All `localStorage` and uploaded JSON operations are wrapped in `try/catch`:
```typescript
try {
  return JSON.parse(rawData);
} catch (error: unknown) {
  if (error instanceof Error) {
    console.warn("Corrupted JSON:", error.message);
  }
  return fallback;
}
```

---

## 7. Installation & Build

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run watch
```

Run with any static web server (such as Live Server or `npx serve .`).

---

## 8. Manual Testing Checklist

- [x] Add new expense: enter title, amount, category, date, and notes; verify row appears in table.
- [x] Edit expense: click ✏️, edit title or amount, save and verify changes persist.
- [x] Filter & Search: type keywords in the search bar, select a category, and verify table filters immediately.
- [x] Set monthly budget: click Edit in the Monthly Budget card, set a new limit, and verify progress bar recalculates.
- [x] Export JSON: click 📤 Export JSON, verify `.json` file downloads.
- [x] Import JSON: click 📥 Import JSON, upload the exported file, verify duplicate records are safely skipped with toast feedback.
- [x] Delete expense: click 🗑️ to delete a single expense with confirmation.
