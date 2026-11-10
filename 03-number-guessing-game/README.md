# Project 03: Number Guessing Game (Guess Master)

An interactive, cyberpunk-themed number guessing game built with **TypeScript, HTML5, and CSS3**.

This project demonstrates modular application architecture, pure game logic, dynamic range validation, immutable state modeling, resilient error handling, and lifetime match statistics persisted in `localStorage`.

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

## 🏛️ Project Architecture

```text
03-number-guessing-game/
├── index.html               # Main game console, status badges, and drawer markup
├── style.css                # Cyberpunk dark theme and glowing visual cues
├── package.json             # Build, test, lint, and formatting scripts
├── tsconfig.json            # Strict TypeScript configuration
├── eslint.config.mjs        # Flat ESLint configuration
├── src/
│   ├── types.ts             # Game contracts (DifficultyConfig, GuessResult, GameRecord, LifetimeStatistics)
│   ├── game-config.ts       # Boundaries manager for preset and custom difficulties
│   ├── game-logic.ts        # Pure secret generator and guess evaluation functions
│   ├── game-state.ts        # Active game model managing attempts and match lifecycle
│   ├── statistics.ts        # Lifetime stats calculation and schema-guarded history manager
│   ├── storage.ts           # Safe localStorage wrapper with runtime validator support
│   ├── ui.ts                # Null-safe visual feedback, guess tags, and modal/drawer renderer
│   └── main.ts              # Game lifecycle controller, decimal validator, and event binder
├── tests/
│   └── game-logic.test.ts   # Vitest unit test suite (21 comprehensive tests)
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
- **`npm run test`**: Executes the 21 unit tests with **Vitest**.
- **`npm run lint`**: Analyzes TypeScript code for potential issues with **ESLint**.
- **`npm run format:check`**: Verifies code formatting against **Prettier** rules.

---

## 🌐 Running Locally

Because this project uses native browser ES Modules, serve it using an HTTP server:

```bash
npx serve .
```

Open `http://localhost:3000/index.html` in your browser.
