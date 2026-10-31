# Number Guessing Game — TypeScript

A modern, beginner-friendly **Number Guessing Game** web application built with **HTML5, CSS3, and pure TypeScript (compiled to JavaScript)**.

---

## 🎮 Game Overview

The computer picks a random secret number between **1** and **100**. Your goal is to deduce the secret number within **7 attempts**. After each guess, the game gives you immediate hints:
- **"Too Low! Try a Higher Number"** with an upward indicator
- **"Too High! Try a Lower Number"** with a downward indicator
- **"Congratulations! You Won!"** when you find the exact match

If you use all 7 attempts without guessing the number, the game ends and reveals the secret number.

---

## ✨ Features

1. **Random Number Generator**: Dynamically generates an integer from 1 to 100 on every new game.
2. **Attempt Tracker**: Visual progress dot indicator and dynamic attempt counter (`7 / 7`).
3. **Strict Input Validation**:
   - Rejects empty values.
   - Rejects decimals/floats (e.g. `45.5`).
   - Rejects non-numeric characters.
   - Rejects out-of-range numbers ($<1$ or $>100$).
   - **Invalid inputs do NOT consume attempts.**
4. **Previous Guess History**: Displays chronological tags of previous guesses in the active round with high/low badges.
5. **Session Statistics**:
   - Tracks **Games Played**, **Games Won**, **Games Lost**, and **Win Rate %**.
   - Preserved across game restarts without resetting.
6. **Polished & Responsive UI**: Clean card design with dynamic feedback banners for victory, loss, warnings, and hints.

---

## 🧠 TypeScript Concepts Practised

This project is tailored for learning core TypeScript fundamentals:

- **Explicit Type Annotations**:
  ```typescript
  let secretNumber: number = 0;
  let remainingAttempts: number = 7;
  let isGameOver: boolean = false;
  let guessHistory: number[] = [];
  ```
- **Type Union & Null Return**:
  ```typescript
  function validateGuessInput(rawValue: string): number | null
  ```
  Returns a validated `number` on success, or `null` to signal invalid input.
- **Logical Operators (`&&`, `||`, `!`) & Conditionals**:
  ```typescript
  if (parsedNumber < MIN_NUMBER || parsedNumber > MAX_NUMBER) { ... }
  ```
- **Typed Loops (`for`)**:
  ```typescript
  for (let i: number = 0; i < MAX_ATTEMPTS; i++) { ... }
  ```
- **DOM Type Assertions**:
  ```typescript
  const guessInput = document.getElementById("guessInput") as HTMLInputElement;
  const submitGuessBtn = document.getElementById("submitGuessBtn") as HTMLButtonElement;
  ```

---

## 📂 Project Structure

```text
03-number-guessing-game/
├── dist/
│   └── number-guessing-game.js      # Compiled JavaScript output
├── src/
│   └── number-guessing-game.ts      # TypeScript source code
├── index.html                       # Application interface
├── style.css                        # Modern CSS styling
├── package.json                     # Project scripts (build: "tsc")
├── tsconfig.json                    # Compiler config (Target: ES6, Strict: true)
└── README.md                        # Documentation
```

---

## 🚀 How to Run Locally

### 1. Open in Browser
Double-click `index.html` or run this command in PowerShell:
```powershell
Start-Process "03-number-guessing-game\index.html"
```

### 2. Building / Compiling TypeScript
To recompile `src/number-guessing-game.ts` into `dist/number-guessing-game.js`:

```powershell
# Using the package script:
cd 03-number-guessing-game
npm run build

# Or directly using the compiler:
npx -p typescript tsc -p "03-number-guessing-game/tsconfig.json"
```

To enable watch mode (auto-compile on save):
```powershell
npx -p typescript tsc -p "03-number-guessing-game/tsconfig.json" --watch
```

