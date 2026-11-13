# Project 03: Number Guessing Game (Guess Master)

An interactive, cyberpunk-themed number guessing game built with **TypeScript, HTML5, and CSS3**.

This project demonstrates modular application architecture, pure game logic, dynamic range validation, immutable state modeling, resilient error handling, discriminated union outcomes, compile-time exhaustiveness checking, and lifetime match statistics persisted in `localStorage`.

---

## ✨ Features

- **Multiple Difficulty Modes:**
  - **Easy:** Range 1 to 100 with 7 attempts.
  - **Medium:** Range 1 to 500 with 9 attempts.
  - **Hard:** Range 1 to 1,000 with 10 attempts.
  - **Custom:** User-configurable minimum (≥1), maximum (≤100,000), and allowed attempts (1–50) with comprehensive input validation.
- **Directional Visual Feedback:** Immediate visual feedback with dynamic color states and neon animations:
  - 👑 **VICTORY!** when guessing the secret code.
  - 💥 **SYSTEM OVERLOAD** when attempts are exhausted.
  - 📉 **TOO HIGH** with directional arrow (`↓`).
  - 📈 **TOO LOW** with directional arrow (`↑`).
  - ⚠️ **DUPLICATE GUESS** warning without consuming remaining tries.
- **Input & State Protection:**
  - Strictly prevents submitting decimal values, non-numbers, or out-of-range guesses.
  - Prevents interaction or submission once a match has completed until a new game or restart is triggered.
- **Guess History Tags:** Interactive visual badges displaying every past guess in the current match along with its directional hint.
- **Lifetime Statistics & Storage Resilience:**
  - Persistent tracking of total matches played, games won, games lost, win rate percentage, and best score (fewest attempts used).
  - Runtime schema validation prevents `NaN` or corrupted statistics payloads from breaking the HUD.
- **Match History Drawer:** Accessible slide-out drawer displaying past game outcomes with target numbers, attempts used, difficulty tier, and timestamps. Closes easily with the close button or `Escape` key.

---

## 🏛️ Advanced TypeScript Architecture & Concepts Applied

### 1. Discriminated Unions for Guess Outcomes
Instead of a flat bag of boolean flags (`isWon`, `isGameOver`, `type`), `GuessOutcome` is a strict **discriminated union** keyed on `status`:
```typescript
export type GuessOutcome =
  | { status: 'won'; target: number; attemptsUsed: number; attemptsLeft: number; isWon: true; isGameOver: true }
  | { status: 'lost'; target: number; attemptsLeft: 0; isWon: false; isGameOver: true }
  | { status: 'in-progress'; hint: 'too-high' | 'too-low'; attemptsLeft: number; isWon: false; isGameOver: false }
  | { status: 'duplicate'; guess: number; attemptsLeft: number; isWon: false; isGameOver: false };
```
This guarantees that winning outcomes contain `target` and `attemptsUsed`, in-progress outcomes have `hint`, and duplicate guesses never alter match counts.

### 2. Compile-Time Exhaustiveness Checking with `never`
In `GameUI.showFeedback()`, the `default` switch branch calls `assertNever(result, 'Unhandled GuessResult status')`:
```typescript
export function assertNever(x: never, message = 'Unexpected value encountered'): never {
  throw new Error(`${message}: ${String(x)}`);
}
```
If a new guess state is added to `GuessOutcome` without updating UI handling, the TypeScript compiler refuses to build.

### 3. Intersection Types for Game Configuration
Configuration separates shared boundaries from custom overrides using an intersection type:
```typescript
export interface BaseGameConfig {
  min: number;
  max: number;
  maxAttempts: number;
}

export type CustomDifficultyConfig = BaseGameConfig & {
  name: 'Custom';
  difficulty: 'custom';
};
```

### 4. Generic Filtering and Statistical Aggregations
Reusable generic helpers operate cleanly across game records without using `any`:
```typescript
export function filterRecordsByField<T, K extends keyof T>(
  items: T[],
  key: K,
  value: T[K]
): T[] {
  return items.filter((item) => item[key] === value);
}

export function aggregateNumericField<T>(
  items: T[],
  extractor: (item: T) => number
): number {
  return items.reduce((sum, item) => sum + extractor(item), 0);
}
```

### 5. Type Narrowing & Storage Schema Validation
- **`in` operator**: `isValidGameRecord(item: unknown)` safely checks for required properties on unknown storage objects before accessing them.
- **`typeof`**: Used throughout `game-state.ts` and `game-config.ts` to validate numeric inputs.
- **Generic `GameStorage`**: Generic `<T>` methods guarded with validator predicates `(val: unknown) => val is T`.

---

## 📂 Project Structure

```text
03-number-guessing-game/
├── index.html               # Main game console, status badges, and drawer markup
├── style.css                # Cyberpunk dark theme and glowing visual cues
├── package.json             # Build, test, lint, and formatting scripts
├── tsconfig.json            # Strict TypeScript configuration
├── eslint.config.mjs        # Flat ESLint configuration
├── src/
│   ├── types.ts             # Domain contracts, discriminated unions, and intersection types
│   ├── game-config.ts       # Boundaries manager for preset and custom difficulties
│   ├── game-logic.ts        # Pure secret generator, guess evaluation, and assertNever
│   ├── game-state.ts        # Active game state machine and match lifecycle
│   ├── statistics.ts        # Generic statistical aggregations and schema guards
│   ├── storage.ts           # Generic localStorage wrapper with runtime validator support
│   ├── ui.ts                # Null-safe visual feedback, guess tags, and modal/drawer renderer
│   └── main.ts              # Game lifecycle controller, decimal validator, and event binder
├── tests/
│   └── game-logic.test.ts   # Vitest unit test suite (20 comprehensive tests)
└── dist/                    # Compiled ES6 JavaScript modules
```

---

## 🛠️ Installation & Setup

Navigate into the project directory and install the local developer dependencies:

```bash
cd 03-number-guessing-game
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

Because this project uses native browser ES Modules, serve it using an HTTP server:

```bash
npx serve .
```

Open `http://localhost:3000/index.html` in your browser.
