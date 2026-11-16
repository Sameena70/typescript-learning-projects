# Project 03: Number Guessing Game (Guess Master)

An interactive, cyberpunk-themed number guessing game built with **TypeScript, HTML5, and CSS3**.

This project demonstrates modular application architecture, pure game logic, dynamic range validation, immutable state modeling, resilient error handling, discriminated union outcomes, compile-time exhaustiveness checking, constructor dependency injection, and lifetime match statistics persisted in `localStorage`.

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

## 🏛️ Application Architecture & Data Flow

The game decouples pure rule evaluation, state tracking, statistics aggregation, persistence, and UI presentation:

```text
[ User Guess Input / Mode Select / Drawer Toggle ]
                        │
                        ▼
           [ NumberGuessingGameApp ] (main.ts - Orchestrator & DI Controller)
            ├── [ GameStateManager ] (game-state.ts - Active Game State Machine)
            │     └── [ Pure Game Evaluation ] (game-logic.ts - evaluateGuess & generateSecret)
            ├── [ StatisticsManager ] (statistics.ts - Match Stats & History)
            │     └── [ IGameStorageDriver / GameStorage ] (storage.ts)
            └── [ GameUI ] (ui.ts - Neon HUD, Modals & History Drawer)
```

1. **User Action:** Received via DOM event handlers bound in `NumberGuessingGameApp`.
2. **Pure Evaluation:** `evaluateGuess()` and `generateSecret()` in `src/game-logic.ts` evaluate numeric guesses against target values without mutating state.
3. **State Management:** `GameStateManager` tracks current game lifecycle, past guesses, attempts left, and outcome transitions.
4. **Statistics & Persistence:** `StatisticsManager` records match outcomes, calculates lifetime win rates, and persists records using `IGameStorageDriver` (implemented by `GameStorage`).
5. **View Presentation:** `GameUI` displays neon feedback, updates attempt meters, animates directional hints, and populates the history drawer.

---

## 💡 Important TypeScript Concepts & Design Patterns

### 1. Pure Game Evaluation & Facade
Game evaluation methods are pure exported functions:
```typescript
export function evaluateGuess(
  guess: number,
  secret: number,
  remainingAttempts: number,
  previousGuesses: number[],
  maxAttempts?: number
): GuessOutcome;

export function generateSecret(min: number, max: number): number;
```
A backward-compatible `GameLogic` static facade delegates calls to these functions.

### 2. Discriminated Unions for Guess Outcomes
`GuessOutcome` is modeled as a strict discriminated union keyed on `status`:
```typescript
export type GuessOutcome =
  | { status: 'won'; type: 'CORRECT'; message: string; guess: number; target: number; attemptsUsed: number; attemptsLeft: number; isWon: true; isGameOver: true }
  | { status: 'lost'; type: 'GAME_OVER'; message: string; guess: number; target: number; attemptsLeft: 0; isWon: false; isGameOver: true }
  | { status: 'in-progress'; type: 'TOO_HIGH' | 'TOO_LOW'; message: string; guess: number; hint: 'too-high' | 'too-low'; attemptsLeft: number; isWon: false; isGameOver: false }
  | { status: 'duplicate'; type: 'DUPLICATE'; message: string; guess: number; attemptsLeft: number; isWon: false; isGameOver: false };
```

### 3. Compile-Time Exhaustiveness Checking with `never`
The UI switch statement verifies all possible outcome states using `assertNever`:
```typescript
export function assertNever(x: never, message = 'Unexpected value encountered'): never {
  throw new Error(`${message}: ${String(x)}`);
}
```

### 4. Dependency Inversion via `IGameStorageDriver`
Persistence is abstracted through `IGameStorageDriver`, implemented by `GameStorage`:
```typescript
export interface IGameStorageDriver {
  getItem<T>(key: string, fallback: T, validator?: StorageValidator<T>): T;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): void;
  clear(): void;
}
```

### 5. Generic Utility Helpers (`src/utils.ts`)
Reusable array filtering and calculation functions operate across game records without using `any`:
```typescript
export function filterRecordsByField<T, K extends keyof T>(items: T[], key: K, value: T[K]): T[];
export function aggregateNumericField<T>(items: T[], field: keyof T): number;
```

---

## 📂 Project Structure

```text
03-number-guessing-game/
├── index.html                     # Main gaming interface and history drawer
├── style.css                      # Cyberpunk neon theme, animations, and responsive styles
├── package.json                   # Build, test, lint, and formatting scripts
├── tsconfig.json                  # Strict TypeScript configuration
├── eslint.config.mjs              # ESLint configuration
├── src/
│   ├── types.ts                   # Domain types, discriminated unions, and IGameStorageDriver
│   ├── game-config.ts             # Difficulty tier settings and pure config validators
│   ├── game-logic.ts              # Pure evaluation functions (evaluateGuess, generateSecret) & GameLogic facade
│   ├── game-state.ts              # GameStateManager state machine
│   ├── statistics.ts              # StatisticsManager with constructor DI
│   ├── storage.ts                 # GameStorage implementing IGameStorageDriver
│   ├── utils.ts                   # Generic filterRecordsByField & aggregateNumericField helpers
│   ├── ui.ts                      # GameUI rendering controller and HUD updates
│   └── main.ts                    # NumberGuessingGameApp orchestrator with DOM-ready check
├── tests/
│   └── game-logic.test.ts         # Vitest unit test suite (22 comprehensive tests)
└── dist/                          # Compiled ES6 JavaScript modules
```

---

## 💾 Storage & Data Persistence

- **Primary LocalStorage Keys:**
  - `ts_game_lifetime_stats`: Lifetime statistics record `{ totalGames, gamesWon, gamesLost, bestScore, totalAttemptsUsed }`.
  - `ts_game_records_history`: Array of past match outcome summaries.
- **Corrupt Storage Fallback:** `GameStorage` catches malformed JSON defensively and returns safe initial statistics.

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
