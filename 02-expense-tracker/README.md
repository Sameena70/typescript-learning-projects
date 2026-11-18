# Project 02: Expense Tracker (Finance Dashboard)

A modern, high-fidelity personal finance dashboard and budget management application built with **TypeScript, HTML5, and CSS3**.

This project provides an exact recreation of modern financial SaaS dashboards, complete with double-entry income and expense tracking, interactive monthly trend lines, donut category charts, multi-page routing (Dashboard, Transactions, Analytics, Budgets, Settings), dark/light mode theming, and full RFC 4180 CSV & JSON backup portability.

---

## ✨ Features

- **Modern SaaS Financial Dashboard:**
  - Modern light theme with deep navy sidebar navigation.
  - Quick KPI summary cards: **Total Balance**, **Total Income**, and **Total Expenses** with percentage growth metrics.
  - Interactive SVG **Monthly Overview** curve chart and **Top Categories** donut chart.
  - Instant transaction recording via clean modal dialogues.
- **Multi-View Application Navigation:**
  - **Dashboard:** High-level overview of balances, metrics, charts, and quick actions.
  - **Transactions:** Comprehensive searchable and filterable ledger with category filtering, date sorting, and inline editing/deletion.
  - **Analytics:** In-depth cash flow statistics, category breakdowns, and income-to-expense ratios.
  - **Budgets:** Category spending limits with real-time visual progress indicators and threshold alerts.
  - **Settings:** Currency selector (`INR ₹`, `USD $`, `EUR €`, `GBP £`), light/dark theme switcher, and data reset tools.
- **Double-Entry Income & Expense Management:**
  - Record transactions with title, amount, category, date, payment method, and optional notes.
  - Automated balance updates across all metric displays.
- **Recurring Transactions Engine:**
  - Configure daily, weekly, monthly, and yearly recurring income or expenses.
  - Automatically calculates and applies due transactions without duplicate collisions.
- **Data Portability & Backups:**
  - **JSON Export & Import:** Export full database state or restore records safely.
  - **CSV Export & Import:** RFC 4180 compliant spreadsheet export and import.
- **Local Storage Persistence:**
  - Encapsulated storage service with fallback resilience and schema migrations.

---

## 🏛️ Architecture & Modules

```text
02-expense-tracker/
├── src/
│   ├── types.ts            # Interfaces for transactions, budgets, recurring items & views
│   ├── calculations.ts     # Pure mathematical functions for balance, totals, and trends
│   ├── charts.ts           # Dynamic SVG rendering for line graphs and category donut charts
│   ├── validation.ts       # Input validation rules and custom type guards
│   ├── storage.ts          # Safe localStorage storage driver with fallback
│   ├── expense-service.ts  # In-memory transaction and budget store with CRUD operations
│   ├── import-export.ts    # RFC 4180 CSV & JSON import and export handling
│   ├── ui.ts               # Multi-page view switcher, DOM binding, and modal manager
│   └── main.ts             # Application bootstrapper
├── tests/
│   └── calculations.test.ts # Vitest unit test suite
├── index.html              # Responsive layout supporting all 5 dashboard views
├── style.css               # Design system custom properties, components & themes
└── tsconfig.json
```

---

## 🛠️ Verification & Build Commands

```bash
# Run Vitest unit tests
npm test

# Compile TypeScript to dist/
npm run build

# Run ESLint checks
npm run lint

# Format check with Prettier
npm run format:check
```
