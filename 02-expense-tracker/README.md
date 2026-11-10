# Project 02: Expense Tracker

A comprehensive personal finance, expense ledger, and budget management application built with **TypeScript, HTML5, and CSS3**.

This project demonstrates clean architecture, modular TypeScript development, comprehensive domain models (income, expenses, recurring transactions, category budgets, multi-currency settings), runtime schema validation, interactive financial charts, monthly & yearly trend reporting, robust CSV/JSON data portability, and automated testing with Vitest.

---

## ✨ Features

- **Double-Entry Income & Expense Management:**
  - Track both incoming revenue (Salary, Freelance, Investment) and outgoing expenditures.
  - Complete CRUD operations: Add, edit, delete, and view transactions with title, amount, category, date, and optional notes.
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
  - Switch seamlessly between `INR` (₹), `USD` ($), `EUR` (€), and `GBP` (£).
  - Formatted via native `Intl.NumberFormat`.
- **Advanced Filtering & Sorting:**
  - Filter by transaction type (`All`, `Expenses Only`, `Income Only`).
  - Filter by category and date ranges (start date to end date).
  - Real-time text search through descriptions and notes.
  - Multi-attribute sorting by Date, Amount, Category, and Title (ascending / descending).
- **Comprehensive Import / Export Portability:**
  - **CSV Spreadsheet Export & Import:** Complies with RFC 4180 parsing and escaping.
  - **JSON Backup & Restore:** Export full state or restore records with duplicate prevention and ID collision safety.
- **Resilient Local Persistence:**
  - Built upon a generic typed `StorageService` with fallback defaults and runtime error isolation.
  - Backward compatible with legacy records.

---

## 🏛️ Project Architecture

```text
02-expense-tracker/
├── index.html               # Semantic dashboard layout, forms, charts, and modal dialogs
├── style.css                # Polished responsive design with modern badge/chart/progress styles
├── package.json             # Build, test, lint, and formatting configurations
├── tsconfig.json            # Strict TypeScript compiler options (DOM, ES2022)
├── eslint.config.mjs        # Flat ESLint configuration
├── src/
│   ├── types.ts             # Domain contracts (Expense, RecurringRule, PeriodSummary, etc.)
│   ├── calculations.ts      # Pure financial math, aggregations, trends, and currency formatters
│   ├── validation.ts        # Runtime schema validation & type guards
│   ├── storage.ts           # Resilient localStorage service
│   ├── expense-service.ts   # Core business logic: CRUD, recurring engine, filtering, import
│   ├── import-export.ts     # JSON backup/restore & RFC 4180 CSV parser/exporter
│   ├── ui.ts                # Dynamic DOM rendering, charts, KPI metrics, and toasts
│   └── main.ts              # Event orchestration and lifecycle management
├── tests/
│   └── calculations.test.ts # Vitest unit test suite (23 tests covering logic, validation, trends & I/O)
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
