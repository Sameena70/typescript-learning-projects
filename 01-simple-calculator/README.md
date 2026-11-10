# Advanced TypeScript Calculator

A modular, robust, and beginner-friendly dark-themed calculator web application built with modern TypeScript (ES6 modules).

---

## 1. Project Overview

The **Advanced TypeScript Calculator** performs high-precision arithmetic computations, provides full calculation history stored in browser storage (`localStorage`), offers Memory registers (MC, MR, M+, M-), and delivers full keyboard support.

---

## 2. Features

- **Full Arithmetic Operations**: Addition (`+`), subtraction (`−`), multiplication (`×`), division (`÷`), modulo (`%`), percentage.
- **Floating-Point Precision**: Precision rounding using `Number.EPSILON` to resolve standard IEEE-754 precision quirks (e.g. `0.1 + 0.2 = 0.3`).
- **Memory Operations**:
  - `MC`: Memory Clear (resets memory register).
  - `MR`: Memory Recall (retrieves stored value).
  - `M+`: Adds current input to memory.
  - `M-`: Subtracts current input from memory.
- **Persistent Calculation History**:
  - Slide-out history drawer.
  - Calculation expressions and results persisted via JSON and `localStorage`.
  - Click any past calculation result to reload it into the calculator.
  - One-click clear history.
- **Defensive Error Handling**:
  - Graceful division-by-zero protection (`throw new Error()`, `try/catch`).
  - Corrupted `localStorage` data handling with fallback values.
- **Full Keyboard Navigation**: Numbers, decimals, operators, Enter/Equal, Backspace, and Escape.

---

## 3. Technology Stack

- **HTML5 & CSS3**: Pure CSS grid and flexbox, glassmorphic dark theme.
- **TypeScript 5.x**: Strict mode, ES6 modules, typed interfaces.
- **Storage**: Browser `localStorage` with `JSON.stringify()` and `JSON.parse()`.

---

## 4. Folder Structure

```
01-simple-calculator/
├── dist/                  # Compiled JavaScript ES6 modules
│   ├── calculator-logic.js
│   ├── calculator-state.js
│   ├── history-service.js
│   ├── main.js
│   ├── storage.js
│   ├── types.js
│   └── ui.js
├── src/                   # TypeScript source code
│   ├── types.ts           # Interfaces & union types
│   ├── storage.ts         # Generic safe localStorage module
│   ├── calculator-logic.ts# Pure math functions & precision rounding
│   ├── calculator-state.ts# Calculator state machine & memory
│   ├── history-service.ts # History persistence service
│   ├── ui.ts              # DOM display renderer & drawer UI
│   └── main.ts            # Entry point & event listeners
├── index.html             # Application markup with type="module"
├── style.css              # Dark theme stylesheet
├── package.json           # Build scripts & dependencies
├── tsconfig.json          # TypeScript compiler options
└── README.md              # Project documentation
```

---

## 5. TypeScript Module Breakdown

- **`types.ts`**: Defines the `Operator` union type (`'+' | '-' | '*' | '/' | '%'`), `CalculationRecord` interface, and `CalculatorState` interface.
- **`storage.ts`**: Implements `StorageService` using static methods with generic types (`getItem<T>`, `setItem<T>`). Uses `try/catch` and `instanceof Error` to protect against quota limits and malformed JSON.
- **`calculator-logic.ts`**: Isolates pure mathematical operations from the DOM. Throws descriptive errors when dividing or performing modulo by zero.
- **`calculator-state.ts`**: Encapsulates state modifications (`currentInput`, `previousInput`, `selectedOperator`, `memoryValue`).
- **`history-service.ts`**: Manages the list of calculation records and serializes them to `localStorage`.
- **`ui.ts`**: Pure DOM manipulation module that updates display digits, memory badges, and history list rendering.
- **`main.ts`**: The application bootstrap that instantiates services, connects UI elements, and binds mouse and keyboard listeners.

---

## 6. How Concepts Work

### A. Import and Export
Each file exports named classes or types (e.g., `export class CalculatorLogic`, `export type Operator`). Modules are imported with explicit relative paths (e.g., `import { CalculatorStateModel } from './calculator-state.js';`). In `index.html`, the script is loaded with `<script type="module" src="dist/main.js" defer></script>`.

### B. JSON Storage
Data is serialized using `JSON.stringify(records)` and deserialized using `JSON.parse(rawData)`. When reading, if `localStorage.getItem()` returns `null` or invalid data, a safe fallback default is returned.

### C. Error Handling
- Arithmetic errors (e.g. division by zero) use `throw new Error("Cannot divide by zero")`.
- Callers wrap calculations in `try { ... } catch (error: unknown) { ... }`.
- TypeScript's `error instanceof Error` checks ensure type-safe access to `error.message`.

---

## 7. Installation & Build

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Watch mode during development
npm run watch
```

To run in the browser, open `index.html` using any local development server (such as Live Server or `npx serve .`).

---

## 8. Manual Testing Checklist

- [x] Basic addition: `12 + 8 = 20`
- [x] Precision test: `0.1 + 0.2 = 0.3` (no long floating point artifacts)
- [x] Division by zero: `10 ÷ 0 =` shows user-friendly error
- [x] Memory test: enter `50`, press `M+`, clear display, press `MR` (displays `50`), press `MC` (clears memory badge)
- [x] History panel: click the clock icon 🕒 to open drawer; verify past calculations appear; click an item to restore result; click Clear to empty history
- [x] Keyboard input: type numbers and operators directly on your keyboard
