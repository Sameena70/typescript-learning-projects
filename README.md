# TypeScript Learning Curriculum & Projects Showcase

A comprehensive, progressive curriculum of four production-grade client-side applications built with **TypeScript, modern HTML5, and CSS3**.

This repository guides developers from core algorithmic TypeScript logic to modular state machines, scientific expression parsers, financial ledger engines, and responsive CRM frontend architecture. All four applications run natively in modern web browsers using ES modules without external runtime framework dependencies.

---

## 🚀 Projects Overview

| # | Project | Description | Core Capabilities | TypeScript Concepts Demonstrated |
| :-: | :--- | :--- | :--- | :--- |
| **01** | **[Simple Calculator](./01-simple-calculator)** | Desktop-grade standard & scientific calculator | Standard arithmetic, scientific functions ($\sin$, $\cos$, $\sqrt{x}$, $\log$, $n!$), mathematical expression evaluation with PEMDAS precedence, memory store (`MC`, `MR`, `M+`, `M−`), and persistent calculation history drawer. | Classes, Union Types, Type Narrowing, Expression Parsing, Floating-Point Precision, LocalStorage Serialization. |
| **02** | **[Expense Tracker](./02-expense-tracker)** | Comprehensive personal finance & budget dashboard | Double-entry income & expenses, interactive Monthly Overview curve chart, Top Categories donut chart, multi-currency support (`INR ₹`, `USD $`, `EUR €`, `GBP £`), recurring transactions engine, multi-page navigation (Dashboard, Transactions, Analytics, Budgets, Settings), and RFC 4180 CSV & JSON backup/restore. | Interfaces, Custom Type Guards, Financial Aggregations, SVG Chart Generation, Async `FileReader` Promises, Trend Calculations. |
| **03** | **[Number Guessing Game](./03-number-guessing-game)** | Cyberpunk code-cracking interactive guessing game | 4 difficulty tiers (Easy, Medium, Hard, Custom), directional hint indicators (Too High/Too Low), attempt limits, lifetime statistics (win rate, best score), neon animations, and match history drawer. | Pure Business Logic, Boundary Validation, Immutable State Models, Persistent Statistics. |
| **04** | **[Contact Manager](./04-contact-manager)** | ContactHub SaaS CRM directory & address book | Exact ContactHub reference design, 3-column contact card grid with avatars, star toggles, full CRUD operations, duplicate phone/email detection, group categorization, view switching (Grid/List, Favorites, Groups, Import/Export, Settings), and RFC 4180 CSV & JSON portability. | Advanced Interfaces, Form Validation, Array Callbacks (`filter`, `reduce`), File Downloads, Modal Orchestration. |

---

## 🏛️ Architectural Highlights & Quality Standards

- **Zero Framework Runtime:** Pure vanilla TypeScript leveraging native DOM APIs and standard browser ES Modules (`<script type="module">`).
- **Completely Independent Projects:** Each project contains its own `package.json`, `package-lock.json`, `tsconfig.json`, and isolated dependencies. No dependency hoisting or forced workspace coupling.
- **Enterprise Tooling:**
  - **Type Checking:** Strict mode enabled (`"strict": true`, `"noImplicitAny": true`).
  - **Automated Testing:** Powered by **Vitest** for fast unit testing of pure arithmetic, scientific logic, statistics, financial calculations, and data validation rules (**95+ passing tests** across repository).
  - **Linting:** Configured with modern flat **ESLint** (`typescript-eslint`).
  - **Formatting:** Enforced via repository-wide **Prettier** standards.
- **GitHub Pages Ready:** Pre-compiled distribution files are located in each project's `dist/` directory, and relative asset routing ensures live static hosting out of the box.

---

## 📂 Repository Structure

```text
type-script/
├── .gitignore                   # Ignores node_modules, logs, and OS caches
├── .nojekyll                    # Ensures static asset loading for GitHub Pages
├── .prettierrc                  # Central Prettier formatting standards
├── .prettierignore              # Ignores build artifacts and dependencies from formatting
├── index.html                   # Central portfolio showcase portal
├── package.json                 # Root script orchestration (build, test, lint, format)
├── CONTRIBUTING.md              # Coding standards, workflow, and style guide
├── README.md                    # Root repository documentation
│
├── 01-simple-calculator/        # Project 01: Simple & Scientific Calculator
│   ├── index.html               # Calculator interface & keypad layouts
│   ├── style.css                # Dark theme & glassmorphic styles
│   ├── package.json             # Project dependencies & scripts
│   ├── tsconfig.json            # TypeScript configuration
│   ├── eslint.config.mjs        # Project ESLint flat config
│   ├── src/                     # Modular TypeScript source code
│   │   ├── types.ts             # Operators and state contracts
│   │   ├── calculator-logic.ts  # Standard arithmetic & precision methods
│   │   ├── scientific-logic.ts  # Advanced scientific functions
│   │   ├── expression-parser.ts # Mathematical expression evaluator
│   │   ├── calculator-state.ts  # State management & memory store
│   │   ├── history-service.ts   # Persistent calculation history
│   │   ├── storage.ts           # Safe localStorage wrapper
│   │   ├── ui.ts                # DOM rendering & drawer controller
│   │   └── main.ts              # Entry point & keyboard listener
│   ├── tests/                   # Vitest unit test suites
│   └── dist/                    # Compiled ES6 distribution files
│
├── 02-expense-tracker/          # Project 02: Expense Tracker Dashboard
│   ├── index.html               # Expense tracker multi-view interface
│   ├── style.css                # Financial dashboard layout, charts & badges
│   ├── package.json             # Project dependencies & scripts
│   ├── tsconfig.json            # TypeScript configuration
│   ├── eslint.config.mjs        # Project ESLint flat config
│   ├── src/                     # Modular TypeScript source code
│   │   ├── types.ts             # Expense interfaces & categories
│   │   ├── calculations.ts      # Pure metric, financial math & trend calculators
│   │   ├── charts.ts            # SVG chart generator
│   │   ├── validation.ts        # Input rules & custom type guards
│   │   ├── storage.ts           # Safe localStorage service
│   │   ├── expense-service.ts   # In-memory CRUD, recurring engine & search store
│   │   ├── import-export.ts     # RFC 4180 CSV & JSON backup handler
│   │   ├── ui.ts                # DOM table, KPI, visual charts & modal controller
│   │   └── main.ts              # Bootstrap entry point
│   ├── tests/                   # Vitest unit test suites
│   └── dist/                    # Compiled ES6 distribution files
│
├── 03-number-guessing-game/     # Project 03: Number Guessing Game (Guess Master)
│   ├── index.html               # Cyberpunk game console & history drawer
│   ├── style.css                # Modern neon gaming styling
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
│   └── dist/                    # Compiled ES6 distribution files
│
└── 04-contact-manager/          # Project 04: ContactHub (Advanced Contact Manager)
    ├── index.html               # ContactHub layout, card grid & modals
    ├── style.css                # SaaS CRM layout & styling
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
    │   ├── data/
    │   │   └── seed-contacts.ts # ContactHub reference seed profiles
    │   └── main.ts              # Application initialization
    ├── tests/                   # Vitest unit test suites
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
# Run all unit tests across all four projects (95+ tests total)
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

## 🌐 Running Applications from the Major (Root) Folder

Because all four applications use native browser ES modules, serve them from the root directory using an HTTP server.

### Option 1: Using Python HTTP Server (Recommended)
From your main `type script` (or `type-script`) root folder, run:
```bash
python -m http.server 8080
```
Then open your browser and navigate to:
- **Central Showcase Hub:** `http://localhost:8080/index.html`
- **01 - Simple Calculator:** `http://localhost:8080/01-simple-calculator/index.html`
- **02 - Expense Tracker:** `http://localhost:8080/02-expense-tracker/index.html`
- **03 - Number Guessing Game:** `http://localhost:8080/03-number-guessing-game/index.html`
- **04 - Contact Manager:** `http://localhost:8080/04-contact-manager/index.html`

### Option 2: Using Node.js `npx serve`
```bash
npx serve .
```
Navigate to:
- `http://localhost:3000/01-simple-calculator/index.html`
- `http://localhost:3000/02-expense-tracker/index.html`
- `http://localhost:3000/03-number-guessing-game/index.html`
- `http://localhost:3000/04-contact-manager/index.html`

### Option 3: Using VS Code Live Server
1. Open the root workspace folder in VS Code.
2. Right-click `index.html` in the root (or right-click `index.html` inside any of the 4 project folders).
3. Select **"Open with Live Server"**.
