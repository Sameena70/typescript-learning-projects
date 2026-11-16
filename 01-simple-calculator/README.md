# Project 01: Simple Calculator

A modern, responsive client-side arithmetic calculator built with **TypeScript, HTML5, and CSS3**.

This project demonstrates clean modular TypeScript architecture, strict type safety, safe `localStorage` persistence with runtime validation, continuous chained calculation support, floating-point precision handling, dependency injection, and responsive desktop keyboard shortcuts.

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
- **Desktop Keyboard Support:** Seamlessly handles numbers (`0`–`9`), operators (`+`, `-`, `*`, `/`, `%`), decimal point (`.`), Enter/Equals (`=`), Backspace (`DEL`), Escape (`AC`), and keyboard interaction.

---

## 🏛️ Application Architecture & Data Flow

The project follows a modular, decoupled architecture driven by pure functions, state encapsulation, and dependency injection:

```text
[ User / Keyboard Input ]
           │
           ▼
     [ CalculatorApp ] (main.ts - Orchestrator & Event Controller)
      ├── [ CalculatorUI ] (ui.ts - DOM & Display Renderer)
      ├── [ CalculatorStateModel ] (calculator-state.ts - State Machine)
      │     └── [ Pure Math Functions & Operator Map ] (calculator-logic.ts)
      └── [ HistoryService ] (history-service.ts - History Manager)
            └── [ IStorageDriver / StorageService ] (storage.ts - Persistence)
```

1. **User / Keyboard Input:** Captured in `main.ts` via delegated event listeners and keyboard shortcuts.
2. **State & Orchestration:** `CalculatorApp` coordinates between the UI, the state model, and the history service.
3. **Pure Arithmetic Operations:** Pure functions (`add`, `subtract`, `multiply`, `divide`, `modulo`, `percentage`, `roundToPrecision`, `toggleSign`) and an immutable operator map (`OPERATOR_OPERATIONS: Record<Operator, ArithmeticOperation>`) execute calculations without side effects.
4. **State Machine (`CalculatorStateModel`):** Encapsulates active operand, operator, memory accumulator, and calculation outcome transitions.
5. **Storage Abstraction (`IStorageDriver`):** Decouples memory and history persistence from browser `window.localStorage`, enabling in-memory testing.

---

## 💡 Important TypeScript Concepts & Design Patterns

### 1. Pure Functions & Operator Map Pattern
Arithmetic functions are pure named exports, replacing fragile `switch` statements with an exhaustive `Record<Operator, ArithmeticOperation>` map:
```typescript
export type ArithmeticOperation = (a: number, b: number) => number;

export const OPERATOR_OPERATIONS: Record<Operator, ArithmeticOperation> = {
  '+': add,
  '-': subtract,
  '*': multiply,
  '/': divide,
  '%': modulo
};
```

### 2. Backward-Compatible Static Facade
To guarantee 100% backward compatibility for existing consumers, a static `CalculatorLogic` facade delegates calls to the pure functions:
```typescript
export class CalculatorLogic {
  public static add(a: number, b: number): number { return add(a, b); }
  public static compute(op: Operator, a: number, b: number): number { return compute(op, a, b); }
}
```

### 3. Discriminated Unions for State Transitions
Instead of optional or conflicting properties, `CalculationOutcome` is structured as a strict discriminated union:
```typescript
export type CalculationOutcome =
  | { status: 'success'; expressionToSave: string; resultToSave: string }
  | { status: 'error'; error: string }
  | { status: 'idle' };
```

### 4. Compile-Time Exhaustiveness Checking with `never`
The fallback branch in `formatOperator()` and `compute()` invokes `assertNever(x: never)`:
```typescript
export function assertNever(x: never, message: string = 'Unexpected value encountered'): never {
  throw new Error(`${message}: ${String(x)}`);
}
```

### 5. Dependency Inversion via `IStorageDriver`
High-level services (`HistoryService`, `CalculatorStateModel`) depend on the storage interface rather than concrete browser APIs:
```typescript
export interface IStorageDriver {
  getItem<T>(key: string, fallback: T, validator?: StorageValidator<T>): T;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): void;
  clear(): void;
}
```

---

## 📂 Project Structure

```text
01-simple-calculator/
├── index.html                     # Main user interface and history drawer
├── style.css                      # Calculator theme, animations, and responsive styles
├── package.json                   # Build, test, lint, and formatting scripts
├── tsconfig.json                  # Strict TypeScript configuration
├── eslint.config.mjs              # ESLint configuration
├── src/
│   ├── types.ts                   # Domain types, discriminated unions, and IStorageDriver
│   ├── calculator-logic.ts        # Pure arithmetic functions, operator map (OPERATOR_OPERATIONS), and facade
│   ├── calculator-state.ts        # Encapsulated state machine with constructor DI
│   ├── history-service.ts         # Calculation history manager with constructor DI
│   ├── storage.ts                 # StorageService implementing IStorageDriver
│   ├── ui.ts                      # DOM updating, operator highlighting, and drawer animations
│   └── main.ts                    # CalculatorApp controller and event listener bindings
├── tests/
│   └── calculator-logic.test.ts   # Vitest unit test suite (32 comprehensive tests)
└── dist/                          # Compiled ES6 JavaScript modules
```

---

## 💾 Storage & Data Persistence

- **Primary LocalStorage Keys:**
  - `ts_calculator_history`: Persists up to 50 recent calculation records `{ id, expression, result, timestamp }`.
  - `ts_calculator_memory`: Persists active memory accumulator numeric state.
- **Corrupt Storage Fallback:** `StorageService` wraps all reads in a `try...catch` block. If parsing fails, it logs a warning and returns the safe fallback value (`[]` or `0`).

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
