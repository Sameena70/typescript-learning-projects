# TypeScript Learning Curriculum & Projects Showcase

A comprehensive, progressive curriculum of four production-grade client-side applications built with **TypeScript, modern HTML5, and CSS3**.

This repository guides developers from core algorithmic TypeScript logic to modular state machines, asynchronous I/O, robust data validation, and responsive CRM frontend architecture. All four applications run natively in modern web browsers using ES modules without external runtime framework dependencies.

---

## 🚀 Projects Overview

| # | Project | Description | Core Capabilities | TypeScript Concepts Demonstrated |
| :-: | :--- | :--- | :--- | :--- |
| **01** | **[Simple Calculator](./01-simple-calculator)** | Desktop-grade arithmetic calculator | Standard arithmetic, precision rounding, percentage, 4-button memory store (`MC`, `MR`, `M+`, `M−`), persistent history drawer, keyboard shortcuts. | Classes, Union Types, Type Narrowing, Floating-Point Precision, LocalStorage Serialization. |
| **02** | **[Expense Tracker](./02-expense-tracker)** | Comprehensive personal finance & budget ledger | Double-entry income & expenses, category budget caps, multi-currency support (`INR`, `USD`, `EUR`, `GBP`), recurring transactions engine, visual category charts, income vs. expense ratios, monthly & yearly trend tables, RFC 4180 CSV & JSON backup/restore. | Interfaces, Custom Type Guards, Financial Aggregations, Async `FileReader` Promises, Trend Calculations. |
| **03** | **[Number Guessing Game](./03-number-guessing-game)** | Code-cracking interactive guessing game | 4 difficulty tiers (Easy, Medium, Hard, Custom), dynamic visual range guidance, lifetime statistics (win rate, best score, average tries), game history drawer, audio/haptic feedback. | Pure Business Logic, Boundary Validation, Immutable State Models, Persistent Statistics. |
| **04** | **[Contact Manager](./04-contact-manager)** | CRM-style directory & address book | Full CRUD operations, duplicate phone/email detection, category segmentation, active/inactive states, favourites, interaction activity logs, follow-up reminders, tags, RFC 4180 CSV & JSON import/export, seed data. | Advanced Interfaces, Form Validation, Array Callbacks (`filter`, `reduce`), File Downloads, Modal Orchestration. |

---

## 🏛️ Architectural Highlights & Quality Standards

- **Zero Framework Runtime:** Pure vanilla TypeScript leveraging native DOM APIs and standard browser ES Modules (`<script type="module">`).
- **Completely Independent Projects:** Each project contains its own `package.json`, `package-lock.json`, `tsconfig.json`, and isolated dependencies. No dependency hoisting or forced workspace coupling.
- **Enterprise Tooling:**
  - **Type Checking:** Strict mode enabled (`"strict": true`, `"noImplicitAny": true`).
  - **Automated Testing:** Powered by **Vitest** for fast unit testing of pure arithmetic, statistics, calculations, and data validation rules (**90 passing tests** across repository).
  - **Linting:** Configured with modern flat **ESLint** (`typescript-eslint`).
  - **Formatting:** Enforced via repository-wide **Prettier** standards.
- **GitHub Pages Ready:** Pre-compiled distribution files are located in each project's `dist/` directory, and relative asset routing ensures live static hosting out of the box.

---

## 📂 Repository Structure

```text
typescript-learning-projects/
├── .gitignore                   # Ignores node_modules, logs, and OS caches
├── .nojekyll                    # Ensures static asset loading for GitHub Pages
├── .prettierrc                  # Central Prettier formatting standards
├── .prettierignore              # Ignores build artifacts and dependencies from formatting
├── index.html                   # Central portfolio showcase portal
├── package.json                 # Root script orchestration (build, test, lint, format)
├── CONTRIBUTING.md              # Coding standards, workflow, and style guide
├── README.md                    # Root repository documentation
│
├── 01-simple-calculator/        # Project 01: Simple Calculator (27 tests)
│   ├── index.html               # Main calculator interface
│   ├── style.css                # Dark theme and drawer animations
│   ├── package.json             # Project dependencies & scripts
│   ├── tsconfig.json            # TypeScript configuration
│   ├── eslint.config.mjs        # Project ESLint flat config
│   ├── src/                     # Modular TypeScript source code
│   │   ├── types.ts             # Operators and state contracts
│   │   ├── calculator-logic.ts  # Pure arithmetic & precision methods
│   │   ├── calculator-state.ts  # State management & memory store
│   │   ├── history-service.ts   # Persistent calculation history
│   │   ├── storage.ts           # Safe localStorage wrapper
│   │   ├── ui.ts                # DOM rendering & drawer controller
│   │   └── main.ts              # Entry point & keyboard listener
│   ├── tests/                   # Vitest unit test suites
│   │   └── calculator-logic.test.ts
│   └── dist/                    # Compiled ES6 distribution files
│
├── 02-expense-tracker/          # Project 02: Expense Tracker (23 tests)
│   ├── index.html               # Expense tracker interface, charts & modals
│   ├── style.css                # Financial dashboard layout, charts & badges
│   ├── package.json             # Project dependencies & scripts
│   ├── tsconfig.json            # TypeScript configuration
│   ├── eslint.config.mjs        # Project ESLint flat config
│   ├── src/                     # Modular TypeScript source code
│   │   ├── types.ts             # Expense interfaces & categories
│   │   ├── calculations.ts      # Pure metric, financial math & trend calculators
│   │   ├── validation.ts        # Input rules & custom type guards
│   │   ├── storage.ts           # Safe localStorage service
│   │   ├── expense-service.ts   # In-memory CRUD, recurring engine, search & filter store
│   │   ├── import-export.ts     # RFC 4180 CSV & JSON backup handler
│   │   ├── ui.ts                # DOM table, KPI, visual charts & modal controller
│   │   └── main.ts              # Bootstrap entry point
│   ├── tests/                   # Vitest unit test suites
│   │   └── calculations.test.ts
│   └── dist/                    # Compiled ES6 distribution files
│
├── 03-number-guessing-game/     # Project 03: Number Guessing Game (21 tests)
│   ├── index.html               # Game console interface & history drawer
│   ├── style.css                # Modern cyberpunk styling
│   ├── package.json             # Project dependencies & scripts
│   ├── tsconfig.json            # TypeScript configuration
│   ├── eslint.config.mjs        # Project ESLint flat config
│   ├── src/                     # Modular TypeScript source code
│   │   ├── types.ts             # Difficulty configs & game record models
│   │   ├── game-config.ts       # Boundaries manager (preset & custom)
│   │   ├── game-logic.ts        # Pure secret generator & guess evaluation
│   │   ├── game-state.ts        # Active match state model
│   │   ├── statistics.ts        # Lifetime stats & match record manager
│   │   ├── storage.ts           # Persistence layer
│   │   ├── ui.ts                # Feedback, range & drawer renderer
│   │   └── main.ts              # Game lifecycle & event orchestrator
│   ├── tests/                   # Vitest unit test suites
│   │   └── game-logic.test.ts
│   └── dist/                    # Compiled ES6 distribution files
│
└── 04-contact-manager/          # Project 04: Advanced Contact Manager (19 tests)
    ├── index.html               # Address book interface & detailed modals
    ├── style.css                # Clean SaaS CRM layout & styling
    ├── package.json             # Project dependencies & scripts
    ├── tsconfig.json            # TypeScript configuration
    ├── eslint.config.mjs        # Project ESLint flat config
    ├── src/                     # Modular TypeScript source code
    │   ├── types.ts             # Contact interfaces, activity log & form models
    │   ├── validation.ts        # Duplicate check & input validators
    │   ├── statistics.ts        # Category breakdown & summary metrics
    │   ├── storage.ts           # Local storage resilience & initial seed loader
    │   ├── contact-service.ts   # Central data store, CRUD & activity logger
    │   ├── import-export.ts     # RFC 4180 CSV & JSON import/export handler
    │   ├── contact-manager.ts   # UI controller & DOM event coordinator
    │   └── main.ts              # Application initialization
    ├── tests/                   # Vitest unit test suites
    │   └── validation.test.ts
    └── dist/                    # Compiled ES6 distribution files
```

---

## 🛠️ Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or later (v22.x recommended)
- **npm**: v9.0.0 or later

### 1. Clone the Repository
```bash
git clone https://github.com/Sameena-kausar070/type-script.git
cd type-script
```

### 2. Install Dependencies
Install dependencies for each project:
```bash
npm install --prefix 01-simple-calculator
npm install --prefix 02-expense-tracker
npm install --prefix 03-number-guessing-game
npm install --prefix 04-contact-manager
```

---

## 💻 Available Scripts

The root `package.json` provides unified commands to manage all four projects sequentially:

### Compilation
```bash
# Build all four projects sequentially
npm run build:all

# Or build individual projects
npm run build:01
npm run build:02
npm run build:03
npm run build:04
```

### Automated Testing
```bash
# Run all unit tests across all four projects (90 tests total)
npm run test:all

# Or test individual projects
npm run test:01
npm run test:02
npm run test:03
npm run test:04
```

### Code Quality (Linting & Formatting)
```bash
# Run ESLint checks across all four projects
npm run lint:all

# Verify Prettier formatting across all four projects
npm run format:check:all
```

---

## 🌐 Running Applications Locally

Because all applications use native browser ES modules, serve them through a local HTTP development server rather than opening `.html` files directly via `file://`.

### Using Node.js `npx serve`:
```bash
# Serve the entire repository from the root
npx serve .
```
Then navigate to:
- **Central Showcase Hub:** `http://localhost:3000/index.html`
- **Calculator:** `http://localhost:3000/01-simple-calculator/index.html`
- **Expense Tracker:** `http://localhost:3000/02-expense-tracker/index.html`
- **Number Guessing Game:** `http://localhost:3000/03-number-guessing-game/index.html`
- **Contact Manager:** `http://localhost:3000/04-contact-manager/index.html`

Alternatively, use the **VS Code Live Server** extension by right-clicking `index.html` and choosing *Open with Live Server*.

---

## 📜 Contributing & Coding Standards

Please review [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on TypeScript conventions, code formatting, test requirements, and the recommended development workflow.
