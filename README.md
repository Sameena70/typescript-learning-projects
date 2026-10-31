# TypeScript Learning Projects Portfolio

A structured collection of three beginner-to-intermediate modern web applications built using **TypeScript, HTML5, and CSS3**.

This repository was developed to practice core TypeScript fundamentals through practical, real-world implementations. Over six progressive learning phases, each project was systematically enhanced—improving code organization, type safety, scope handling, reusable helpers, array callbacks, and null-safety without altering user interface design or core application workflows.

---

## 🚀 Projects Overview

| Project | Description | Main Features | Technologies |
| :--- | :--- | :--- | :--- |
| **[01. Simple Calculator](./01-simple-calculator)** | Responsive web arithmetic calculator | Addition, subtraction, multiplication, division, modulo, percentage, division-by-zero protection, precision rounding, and full desktop keyboard support | HTML5, CSS3, TypeScript |
| **[02. Expense Tracker](./02-expense-tracker)** | Personal finance and monthly budget tracker | Expense logging (title, amount, category, date), Indian Rupee (₹ INR) currency formatting, category filter, single deletion, monthly budget modal, remaining balance, color-coded badges, and `localStorage` persistence | HTML5, CSS3, TypeScript |
| **[03. Number Guessing Game](./03-number-guessing-game)** | Cyberpunk-themed interactive guess game | 3 difficulty tiers (Easy 1–100, Medium 1–500, Hard 1–1000), dynamic attempts progress bar, directional hints ("Too High!", "Too Low!"), input validation without penalty, guess history tags, and session win rate statistics | HTML5, CSS3, TypeScript |

---

## 📂 Repository Structure

```text
typescript-learning-projects/
├── .gitignore                   # Excludes node_modules, logs, and system cache files
├── .nojekyll                    # Ensures clean asset loading for GitHub Pages
├── index.html                   # Central portfolio showcase landing page
├── README.md                    # Root repository documentation
│
├── 01-simple-calculator/        # Project 1: Simple Calculator
│   ├── index.html               # Calculator interface
│   ├── style.css                # Dark-themed calculator styles
│   ├── package.json             # Build script & TypeScript dev dependency
│   ├── tsconfig.json            # Strict TypeScript configuration (Target: ES6)
│   ├── README.md                # Project-specific documentation
│   ├── src/
│   │   └── calculator.ts        # Source TypeScript implementation
│   └── dist/
│       └── calculator.js        # Compiled JavaScript loaded by index.html
│
├── 02-expense-tracker/          # Project 2: Expense Tracker
│   ├── index.html               # Expense tracker & budget modal markup
│   ├── style.css                # Warm-gray styling, responsive grid & badges
│   ├── package.json             # Build script & TypeScript dev dependency
│   ├── tsconfig.json            # Strict TypeScript configuration (Target: ES6)
│   ├── README.md                # Project-specific documentation
│   ├── src/
│   │   └── expense-tracker.ts   # Source TypeScript implementation
│   └── dist/
│       └── expense-tracker.js   # Compiled JavaScript loaded by index.html
│
└── 03-number-guessing-game/     # Project 3: Number Guessing Game
    ├── index.html               # Cyberpunk gaming interface
    ├── style.css                # Neon glow theme, custom badges & progress bar
    ├── package.json             # Build script & TypeScript dev dependency
    ├── tsconfig.json            # Strict TypeScript configuration (Target: ES6)
    ├── README.md                # Project-specific documentation
    ├── src/
    │   └── number-guessing-game.ts # Source TypeScript implementation
    └── dist/
        └── number-guessing-game.js # Compiled JavaScript loaded by index.html
```

---

## 🧠 TypeScript Concepts Practised

Throughout the repository, the following core concepts have been applied to real application logic:

1. **Variables and Data Types**: Primitive types (`number`, `string`, `boolean`) and arrays (`number[]`, `Expense[]`).
2. **Functions, Parameters & Arguments**: Explicit parameter type annotations preventing invalid data inputs (e.g., `calculate(first: number, second: number, operator: string)`).
3. **Explicit Return Types & `void`**: Functions returning values explicitly state their type (`: number`, `: string`, `: boolean`). Side-effect-only functions (such as UI updates or event listeners) are strictly annotated with `: void`.
4. **Union Types**: Modeling multiple valid states or error conditions (e.g., `number | null` in `calculate()` for division by zero; `DifficultyLevel = "easy" | "medium" | "hard"`).
5. **Arrow Functions**: Concise function expressions with lexical scope (e.g., `const calculateWinRate = (won: number, total: number): number => ...`).
6. **Callbacks & Event Listeners**: Passing functions as arguments to event listeners (`btn.addEventListener("click", computeResult)`) and button iterations.
7. **Array Methods with Typed Callbacks**:
   - `forEach()`: Iterating through DOM node collections to attach click handlers.
   - `map()`: Transforming historical guess numbers into styled HTML badge tags (`guessHistory.map(...)`), and mapping `Expense` objects into table row HTML strings.
   - `filter()`: Filtering expenses by selected category dropdown, and removing items by ID (`expenses.filter(item => item.id !== id)`).
   - `reduce()`: Accumulating total spending from an array of expenses (`expenses.reduce((total, item) => total + item.amount, 0)`).
8. **Global, Local & Block Scope**:
   - *Global Scope*: Persistent application state (`expenses`, `monthlyBudget`, `currentInput`, `guessHistory`) kept accessible across asynchronous event listeners.
   - *Local / Function Scope*: Calculation variables (`factor`, `firstOperand`, `totalSpent`) isolated within function bodies.
   - *Block Scope*: Temporary variables within `if` branches declared using `const` or `let`.
9. **Reusable Helper Functions**:
   - `roundToPrecision(value, decimalPlaces)`: Pure rounding helper eliminating floating-point errors.
   - `calculate(first, second, operator)`: Pure arithmetic dispatcher decoupled from DOM UI.
   - `resetExpenseForm()`: Reusable helper eliminating duplicate form reset and validation-clearing code.
   - `calculateBudgetPercentage(spent, budget)`: Pure budget consumption calculation helper.
10. **Optional Parameters (`?`)**:
    - `formatDate(dateString?: string, fallbackText: string = "-")`: Safely handles omitted or undefined date inputs.
11. **Default Parameters**:
    - `roundToPrecision(value: number, decimalPlaces: number = 8)`: Omits need to manually pass precision on standard operations.
    - `generateRandomNumber(min: number = 1, max: number = 100)`: Supplies default range bounds.
    - `formatCurrency(amount: number, currencyCode: string = "INR", locale: string = "en-IN")`: Provides standard formatting defaults while allowing overrides.
12. **Nullish Coalescing (`??`)**:
    - Replaces `null` or `undefined` with safe fallback values without overwriting valid falsy values like `0` or `""`:
      - `localStorage.getItem(STORAGE_EXPENSES_KEY) ?? "[]"`
      - `btn.getAttribute("data-number") ?? ""`
      - `btn.getAttribute("data-difficulty") ?? ""`
13. **TypeScript Strict Mode**: Enabled in all three projects (`"strict": true`, `"noImplicitAny": true`) ensuring zero unhandled types.
14. **TypeScript Compilation**: Transforming `.ts` source files inside `src/` to browser-ready `.js` files inside `dist/`.

---

## 📈 Learning Phases Completed

The codebase was enhanced through six structured learning phases:

- **Phase 1: Project Analysis & Upgrade Preparation**: Audited repository health, verified TypeScript compile status, inspected code organization, and established individual project refactoring goals.
- **Phase 2: Functions, Parameters & Return Types**: Extracted pure arithmetic dispatching (`calculate()`) and precision rounding (`roundToPrecision()`) in the Calculator, strictly typing all parameters and return signatures (`number | null`, `void`).
- **Phase 3: Arrow Functions & Callbacks**: Replaced imperative `for` loops with functional `.map()` transformations for guess tags in Guess Master, refactored win rate calculations with typed arrow functions, and enforced explicit return annotations on all array callbacks.
- **Phase 4: Scope & Reusable Code**: Reviewed global vs. local variable boundaries. Extracted repeated form-resetting and budget calculation logic into reusable helpers (`resetExpenseForm()`, `calculateBudgetPercentage()`), eliminating code duplication.
- **Phase 5: Optional Parameters, Default Parameters & Nullish Coalescing (`??`)**: Added optional parameters (`formatDate`), default parameter fallbacks (`roundToPrecision`, `generateRandomNumber`, `formatCurrency`), and converted DOM attribute and storage reads to use `??` for safe nullish handling.
- **Phase 6: Final Testing, Code Review & GitHub Verification**: Executed automated validation scripts for all extracted logic, ran compilation across all projects, reviewed Git diffs, and updated project documentation.

---

## 🛠️ Technologies Used

- **HTML5**: Semantic web structure (forms, tables, modal dialogs, status badges).
- **CSS3**: Responsive layouts (Flexbox, CSS Grid), custom properties/variables, modern dark theme styling, and animations.
- **TypeScript (v5.x)**: Type annotations, strict mode, interfaces, union types, arrow functions, and ES6 compilation.
- **JavaScript (ES6)**: Compiled output executed by web browsers.
- **Git & GitHub**: Version control and repository hosting.

---

## 💻 Setup and Execution Instructions

### Prerequisites
Make sure [Node.js](https://nodejs.org/) (which includes `npm` and `npx`) is installed.

### 1. Clone the Repository
```bash
git clone https://github.com/Sameena70/typescript-learning-projects.git
cd typescript-learning-projects
```

### 2. Compiling TypeScript Code
Source files are located in `src/` and compile directly into `dist/`. You can compile any project using its local `tsconfig.json`:

```bash
# Compile Simple Calculator
tsc --project ./01-simple-calculator/tsconfig.json

# Compile Expense Tracker
tsc --project ./02-expense-tracker/tsconfig.json

# Compile Number Guessing Game
tsc --project ./03-number-guessing-game/tsconfig.json
```

Or run watch mode while developing:
```bash
tsc --project ./01-simple-calculator/tsconfig.json --watch
```

### 3. Running the Applications
No web server setup is required. You can launch the applications directly:
- **Central Portfolio Showcase**: Open root `index.html` in your web browser.
- **Individual Projects**:
  - `01-simple-calculator/index.html`
  - `02-expense-tracker/index.html`
  - `03-number-guessing-game/index.html`

On Windows PowerShell, open any file directly:
```powershell
Start-Process "01-simple-calculator/index.html"
```

---

## 📊 Current Project Status

- **Compilation**: All three projects compile cleanly with **0 errors and 0 warnings** under `strict: true`.
- **Logic Validation**: Automated logic tests for calculations, date/currency formatters, and win rate formulas completed with 100% pass rate.
- **Manual Verification**: Interactive browser testing (clicking through buttons and keyboards) remains open for manual user confirmation.
- **Git Status**: Working tree changes from Phases 2–6 remain uncommitted in the local branch, ready for user review.

---

## 🎯 Future Learning Goals

The next stages of learning will focus on:
- Advanced DOM manipulation and Browser Web APIs.
- JSON data serialization and parsing patterns.
- Asynchronous TypeScript (Promises, `async`/`await`).
- Working with the Fetch API for remote data integration.
- Connecting frontend clients to backend services and REST APIs.
- Object-Oriented Programming (OOP) with TypeScript Classes and Generics.

---

## 📄 License
Open-source under the [MIT License](https://opensource.org/licenses/MIT).
