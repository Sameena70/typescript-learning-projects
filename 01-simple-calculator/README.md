# Project 01: Simple Calculator

A modern, responsive client-side arithmetic calculator built with **TypeScript, HTML5, and CSS3**.

This project demonstrates clean modular TypeScript architecture, strict type safety, safe `localStorage` persistence with runtime validation, continuous chained calculation support, floating-point precision handling, and responsive desktop keyboard shortcuts.

---

## ✨ Features

- **Core Operations:** Standard addition (`+`), subtraction (`−`), multiplication (`×`), division (`÷`), and modulo (`%`).
- **Continuous Chained Calculations:** Easily compute sequential operations such as `10 + 5 × 2` (evaluating `10 + 5 = 15`, then `15 × 2 = 30`) without pressing equals between steps.
- **Operator Switching:** Pressing a different operator button before typing the second operand seamlessly updates the active operation without breaking state.
- **Sign Toggling (`±`):** Quickly negate numbers between positive and negative values.
- **Precision Rounding:** Dedicated mathematical rounding logic prevents typical floating-point inaccuracies (e.g., `0.1 + 0.2 = 0.3`).
- **Safety Checks:** Division and modulo by zero are caught defensively and present clean visual error feedback without crashing the state machine. Pressing any digit or clear dismisses the error gracefully.
- **Memory Controls:** Four dedicated memory buttons (`MC` Memory Clear, `MR` Memory Recall, `M+` Memory Add, `M−` Memory Subtract) persisted across browser sessions via `localStorage` with runtime schema validation.
- **Calculation History:** Persistent slide-out drawer storing up to 50 recent calculation records. Clicking or pressing Enter on any record recalls its result back to the display.
- **Desktop Keyboard Support:** Seamlessly handles numbers (`0`–`9`), operators (`+`, `-`, `*`, `/`, `%`), decimal point (`.`), Enter/Equals (`=`), Backspace (`DEL`), Escape (`AC`), and `Ctrl+M` / `Cmd+M` for memory recall.

---

## 🏛️ Project Architecture

```text
01-simple-calculator/
├── index.html               # Main user interface and history drawer
├── style.css                # Dark theme, active operator styling, and drawer animations
├── package.json             # Build, test, lint, and formatting scripts
├── tsconfig.json            # Strict TypeScript configuration
├── eslint.config.mjs        # Flat ESLint configuration
├── src/
│   ├── types.ts             # Type contracts (Operator, CalculationRecord, CalculatorState, CalculationOutcome)
│   ├── calculator-logic.ts  # Pure arithmetic methods, sign toggling, and precision algorithms
│   ├── calculator-state.ts  # Calculator state machine and memory management
│   ├── history-service.ts   # Persistent history list manager with validation
│   ├── storage.ts           # Safe generic localStorage wrapper with runtime schema guards
│   ├── ui.ts                # DOM updating, operator highlighting, and drawer controller
│   └── main.ts              # Entry point and event binding (clicks & keyboard)
├── tests/
│   └── calculator-logic.test.ts  # Vitest unit test suite (27 comprehensive tests)
└── dist/                    # Compiled ES6 JavaScript modules
```

---

## 🛠️ Installation & Setup

Navigate into the project directory and install the local developer dependencies:

```bash
cd 01-simple-calculator
npm install
```

---

## 💻 Available Scripts

- **`npm run build`**: Compiles TypeScript files from `src/` to `dist/` using `tsc`.
- **`npm run watch`**: Starts the TypeScript compiler in watch mode for live recompilation.
- **`npm run test`**: Executes the 27 unit tests with **Vitest**.
- **`npm run lint`**: Analyzes TypeScript code for potential issues with **ESLint**.
- **`npm run format:check`**: Verifies code formatting against **Prettier** rules.

---

## 🌐 Running Locally

Because this project uses native browser ES Modules, serve it using an HTTP server:

```bash
npx serve .
```

Open `http://localhost:3000/index.html` in your browser.
