# Project 02: Expense Tracker

A comprehensive personal finance, expense ledger, and budget management application built with **TypeScript, HTML5, and CSS3**.

This project demonstrates clean architecture, modular TypeScript development, comprehensive domain models (income, expenses, recurring transactions, category budgets, multi-currency settings), runtime schema validation, interactive financial charts, monthly & yearly trend reporting, robust CSV/JSON data portability, and automated testing with Vitest.

---

## ✨ Features

- **Double-Entry Income & Expense Management:**
  - Track both incoming revenue (Salary, Freelance, Investment) and outgoing expenditures.
  - Complete CRUD operations: Add, edit, delete, and view transactions with title, amount, category, date, payment methods, and optional notes.
- **Interactive Visualizations & Charts:**
  - **Spending by Category Breakdown:** Real-time percentage bars for every expense category.
  - **Income vs. Expense Ratio Bar:** Visual cash flow balance with interactive percentages and monetary indicators.
  - **Dynamic Insights Feed:** Intelligent advice highlighting budget utilization, top spending categories, and savings patterns.
- **Historical Reports & Trends:**
  - **Monthly Performance Table:** Tracks historical monthly income, expenses, net savings, and savings rate (`%`).
  - **Yearly Overview Table:** High-level annual aggregates calculating multi-year savings trajectories.
- **Budgeting & Category Caps:**
  - Set an overall monthly spending budget with real-time budget progress visualization (Safe, Warning >80%, Exceeded >100%).
  - Set per-category budget limits (Food & Dining, Utilities, Shopping, etc.) and track individual progress.
- **Financial Dashboard & Metrics:**
  - Net Balance calculation (`Total Income - Total Expenses`).
  - Total Income, Total Expenses, and Net Savings breakdown.
  - Monthly spending vs. income analysis.
  - Highest transaction and average transaction metrics.
- **Recurring Transactions Engine:**
  - Configure daily, weekly, monthly, and yearly recurring income or expenses.
  - Automated detection and generation on application startup without duplicate entries.
- **Multi-Currency Support:**
  - Switch seamlessly between `INR` (₹), `USD` ($), `EUR` (€), and `GBP` (£) formatted via native `Intl.NumberFormat`.
- **Advanced Filtering & Sorting:**
  - Filter by transaction type (`ALL`, `expense`, `income`).
  - Filter by category (`ALL` or specific `ExpenseCategory`) and date ranges.
  - Real-time text search through descriptions and notes.
  - Multi-attribute generic sorting by Date, Amount, Category, and Title (ascending / descending).
- **Comprehensive Import / Export Portability:**
  - **CSV Spreadsheet Export & Import:** Complies with RFC 4180 parsing and escaping.
  - **JSON Backup & Restore:** Export full state or restore records with duplicate prevention and ID collision safety.
- **Resilient Local Persistence:**
  - Built upon a generic typed `StorageService` with fallback defaults and runtime error isolation.
  - Backward compatible with legacy records missing explicit transaction types.

---

## 🏛️ Advanced TypeScript Architecture & Concepts Applied

### 1. Discriminated Unions for Financial Transactions
Transactions are modeled using a strict discriminated union pattern:
```typescript
export interface BaseTransaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  notes?: string;
  isRecurring?: boolean;
  paymentMethod?: PaymentMethod;
  status?: TransactionStatus;
}

export interface IncomeTransaction extends BaseTransaction {
  type: 'income';
  category: ExpenseCategory;
}

export interface ExpenseTransaction extends BaseTransaction {
  type: 'expense';
  category: ExpenseCategory;
}

export type Transaction = IncomeTransaction | ExpenseTransaction;
export type Expense = Transaction; // backward compatibility alias
```
This enables type narrowing across analytics and calculations using `transaction.type === 'income'` or custom type guards `isIncomeTransaction(tx)`.

### 2. Generics with Key Constraints (`<T, K extends keyof T>`)
Reusable sorting and filtering utilities operate across any dataset without losing type safety or using `any`:
```typescript
export function sortByField<T, K extends keyof T>(
  items: T[],
  key: K,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  const multiplier = order === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    // Numerical vs string comparisons with null safety...
  });
}
```

### 3. Type-Safe Generic Validation (`ValidationErrors<T>`)
Instead of loosely typing error maps as `Record<string, string>`, form validation uses generic mapped types constrained to the form's actual keys:
```typescript
export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface ValidationResult<T = ExpenseFormData> {
  isValid: boolean;
  errors: ValidationErrors<T>;
}
```

### 4. Strongly Typed Filter Options
Broad strings have been eliminated in favor of literal unions:
```typescript
export interface ExpenseFilterOptions {
  type?: 'ALL' | TransactionType;
  category?: 'ALL' | ExpenseCategory;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  status?: 'ALL' | TransactionStatus;
}
```

### 5. Type Narrowing (`in`, `typeof`, Custom Predicates)
- **`in` operator**: Safely verifies property presence before indexing unknown objects (`'id' in item && 'amount' in item`).
- **Custom Type Predicates**: `isExpenseCategory(val: unknown): val is ExpenseCategory` and `isTransactionType(val: unknown): val is TransactionType`.
- **Generic Storage Validation**: `StorageService.getItem<T>(key, fallback, validator?: (val: unknown) => val is T)` eliminates unsafe fallback type casting (`as T`).

---

## 📂 Project Structure

```text
02-expense-tracker/
├── index.html               # Semantic dashboard layout, forms, charts, and modal dialogs
├── style.css                # Polished responsive design with modern badge/chart/progress styles
├── package.json             # Build, test, lint, and formatting configurations
├── tsconfig.json            # Strict TypeScript compiler options (DOM, ES2022)
├── eslint.config.mjs        # Flat ESLint configuration
├── src/
│   ├── types.ts             # Domain models, discriminated unions, and generic validation types
│   ├── calculations.ts      # Pure financial math, aggregations, trends, and generic sortByField
│   ├── validation.ts        # Type-safe validation functions and schema type guards
│   ├── storage.ts           # Resilient generic localStorage service with validator predicates
│   ├── expense-service.ts   # Core business logic: CRUD, recurring engine, filtering, import
│   ├── import-export.ts     # JSON backup/restore & RFC 4180 CSV parser/exporter
│   ├── ui.ts                # Dynamic DOM rendering, charts, KPI metrics, and toasts
│   └── main.ts              # Event orchestration and lifecycle management
├── tests/
│   └── calculations.test.ts # Vitest unit test suite (23 tests covering calculations, generics & I/O)
└── dist/                    # Compiled ES6 JavaScript modules
```

---

## 🛠️ Installation & Setup

Navigate into the project directory and install the local developer dependencies:

```bash
cd 02-expense-tracker
npm install
```

---

## 💻 Available Scripts

- **`npm run build`**: Compiles TypeScript files from `src/` to `dist/` using `tsc`.
- **`npm run watch`**: Starts the TypeScript compiler in watch mode for live recompilation.
- **`npm run test`**: Executes unit test suites with **Vitest**.
- **`npm run lint`**: Analyzes TypeScript code for potential issues with **ESLint**.
- **`npm run format:check`**: Verifies code formatting against **Prettier** rules.

---

## 🌐 Running Locally

Because this project uses native browser ES Modules, serve it using a local HTTP server:

```bash
npx serve .
```

Open `http://localhost:3000/index.html` in your browser.
