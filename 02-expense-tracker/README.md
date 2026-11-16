# Project 02: Expense Tracker

A comprehensive personal finance, expense ledger, and budget management application built with **TypeScript, HTML5, and CSS3**.

This project demonstrates clean modular architecture, pure functional calculation routines, isolated rule-based insights, decomposed UI renderers, constructor dependency injection, runtime schema validation, interactive financial charts, monthly & yearly trend reporting, and robust RFC 4180 CSV/JSON data portability.

---

## ✨ Features

- **Double-Entry Income & Expense Management:**
  - Track both incoming revenue (Salary, Freelance, Investment) and outgoing expenditures.
  - Complete CRUD operations: Add, edit, delete, and view transactions with title, amount, category, date, payment methods, and optional notes.
- **Interactive Visualizations & Charts:**
  - **Spending by Category Breakdown:** Real-time percentage bars for every expense category.
  - **Income vs. Expense Ratio Bar:** Visual cash flow balance with interactive percentages and monetary indicators.
  - **Dynamic Insights Feed:** Pure rule-based advice highlighting budget utilization, top spending categories, and savings patterns.
- **Historical Reports & Trends:**
  - **Monthly Performance Table:** Tracks historical monthly income, expenses, net savings, and savings rate (`%`).
  - **Yearly Overview Table:** High-level annual aggregates calculating multi-year savings trajectories.
- **Budgeting & Category Caps:**
  - Set an overall monthly spending budget with real-time budget progress visualization (Safe, Warning >80%, Exceeded >100%).
  - Set per-category budget limits (Food & Dining, Utilities, Shopping, etc.) and track individual progress.
- **Financial Dashboard & Metrics:**
  - Net Balance calculation (`Total Income - Total Expenses`).
  - Total Income, Total Expenses, and Net Savings breakdown.
  - Highest transaction and average transaction metrics.
- **Recurring Transactions Engine:**
  - Configure daily, weekly, monthly, and yearly recurring income or expenses.
  - Automated detection and generation on application startup without duplicate entries.
- **Multi-Currency Support:**
  - Switch seamlessly between `INR` (₹), `USD` ($), `EUR` (€), and `GBP` (£) formatted via native `Intl.NumberFormat`.
- **Advanced Filtering & Sorting:**
  - Filter by transaction type (`ALL`, `expense`, `income`).
  - Filter by category and date ranges.
  - Real-time text search through descriptions and notes.
  - Generic sorting by Date, Amount, Category, and Title (ascending / descending).
- **Comprehensive Import / Export Portability:**
  - **CSV Spreadsheet Export & Import:** Complies with RFC 4180 parsing and escaping.
  - **JSON Backup & Restore:** Export full state or restore records with duplicate prevention and ID collision safety.
- **Resilient Local Persistence:**
  - Built upon an `IExpenseStorageDriver` abstraction with fallback defaults and runtime error isolation.

---

## 🏛️ Application Architecture & Data Flow

The application separates mathematical calculations, business rules, storage persistence, and view presentation into distinct modules:

```text
[ User Events / Forms / File Upload ]
                 │
                 ▼
          [ ExpenseApp ] (main.ts - Application Controller & DI Bootstrap)
           ├── [ ExpenseService ] (expense-service.ts - Domain CRUD & Recurrence)
           │     └── [ IExpenseStorageDriver / StorageService ] (storage.ts)
           ├── [ Pure Analytics & Math ] (calculations.ts & utils.ts)
           ├── [ Insight Rule Engine ] (insights.ts - generateInsights)
           ├── [ File I/O Engine ] (import-export.ts & validation.ts)
           └── [ ExpenseUI ] (ui.ts - Coordinating UI Facade)
                 ├── [ DashboardRenderer ] (Summary Cards & Balance Bars)
                 ├── [ AnalyticsRenderer ] (Category Charts & Insight Cards)
                 └── [ TransactionTableRenderer ] (Data Table & Row Badges)
```

1. **User Action:** Captured by event handlers initialized in `ExpenseApp`.
2. **Domain Operations:** Managed by `ExpenseService`, which holds transaction state and persists through the injected `IExpenseStorageDriver`.
3. **Pure Math & Analytics:** Calculations in `src/calculations.ts` (`calculateTotalExpenses`, `calculateTotalIncome`, `calculateNetBalance`, `calculateMonthlyTotals`, `calculateCategoryTotals`, `calculateCategoryBreakdown`, `calculateCategoryBudgetProgress`, `generateSummary`, `formatCurrency`) are pure functions free of side effects.
4. **Insights Engine:** `generateInsights()` in `src/insights.ts` applies pure evaluation rules against spending distributions and budget thresholds.
5. **Modular UI Rendering:** `ExpenseUI` delegates presentation updates to dedicated renderers (`DashboardRenderer`, `AnalyticsRenderer`, `TransactionTableRenderer`).

---

## 💡 Important TypeScript Concepts & Design Patterns

### 1. Pure Functional Calculation Decomposition
All mathematical calculations have been refactored into pure exported functions. A backward-compatible `ExpenseCalculations` facade delegates to these functions:
```typescript
export function calculateTotalExpenses(transactions: readonly Expense[]): number;
export function calculateTotalIncome(transactions: readonly Expense[]): number;
export function calculateNetBalance(transactions: readonly Expense[]): number;
```

### 2. Isolated Insight Rule Engine (`src/insights.ts`)
Domain insight generation rules are separated from arithmetic logic:
```typescript
export function generateInsights(
  transactions: Expense[],
  monthlyExpenses: number,
  monthlyBudget: number,
  categoryBreakdown: Record<string, number>,
  totalExpensesCalculator: (transactions: Expense[]) => number
): SpendingInsight[];
```

### 3. Generic Utility Helpers (`src/utils.ts`)
Generic array sorting and filtering utilities preserve type `<T>` without casting:
```typescript
export function sortByField<T, K extends keyof T>(items: T[], key: K, order?: 'asc' | 'desc'): T[];
export function filterItems<T>(items: T[], predicate: (item: T) => boolean): T[];
```

### 4. Dependency Inversion via `IExpenseStorageDriver`
`ExpenseService` and `StorageService` depend on an explicit storage interface:
```typescript
export interface IExpenseStorageDriver {
  getItem<T>(key: string, fallback: T, validator?: StorageValidator<T>): T;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): void;
  clear(): void;
}
```

### 5. UI Decomposition (Single Responsibility Principle)
The UI is decomposed into three focused sub-renderers coordinated by `ExpenseUI`:
- **`DashboardRenderer`**: Summary metrics, balance cards, progress bars.
- **`AnalyticsRenderer`**: Category distribution, insights cards, trend tables.
- **`TransactionTableRenderer`**: Table rows, recurring badges, action buttons.

---

## 📂 Project Structure

```text
02-expense-tracker/
├── index.html                     # Main application layout and modal dialogs
├── style.css                      # Modern dark/light styling and responsiveness
├── package.json                   # Build, test, lint, and formatting scripts
├── tsconfig.json                  # Strict TypeScript configuration
├── eslint.config.mjs              # ESLint configuration
├── src/
│   ├── types.ts                   # Domain types, discriminated unions, and IExpenseStorageDriver
│   ├── calculations.ts            # Pure calculation functions & ExpenseCalculations facade
│   ├── insights.ts                # Pure domain rule engine for spending insights
│   ├── utils.ts                   # Generic sortByField and filterItems array helpers
│   ├── expense-service.ts         # Service managing transaction CRUD with constructor DI
│   ├── storage.ts                 # StorageService implementing IExpenseStorageDriver
│   ├── validation.ts              # Pure expense validation (validateExpense) & ExpenseValidator facade
│   ├── import-export.ts           # Pure CSV/JSON parsers & ExpenseImportExport facade
│   ├── ui.ts                      # Decomposed renderers and coordinating ExpenseUI
│   └── main.ts                    # ExpenseApp orchestrator with DOM-ready bootstrap
├── tests/
│   └── calculations.test.ts       # Vitest unit test suite (25 comprehensive tests)
└── dist/                          # Compiled ES6 JavaScript modules
```

---

## 💾 Storage & Data Persistence

- **Primary LocalStorage Keys:**
  - `ts_expense_tracker_items`: Transaction records list.
  - `ts_expense_tracker_budget`: Monthly budget value.
  - `ts_expense_tracker_recurring`: Configured recurring transaction rules.
  - `ts_expense_tracker_settings`: User finance preferences (active currency, category limits).
- **Resilience:** Corrupt JSON in storage is caught defensively by `StorageService`, logging a warning and returning safe fallback defaults.

---

## 🚀 Installation & Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Build TypeScript:**
   ```bash
   npm run build
   ```

3. **Run Unit Tests:**
   ```bash
   npm run test
   ```

4. **Lint Code:**
   ```bash
   npm run lint
   ```

5. **Check Formatting:**
   ```bash
   npm run format:check
   ```

6. **Run Locally:**
   Open `index.html` directly in any modern browser, or serve it with a local HTTP server:
   ```bash
   npx serve .
   ```
