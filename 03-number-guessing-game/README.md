# Guess Master — Number Guessing Game (TypeScript)

A sleek, cyberpunk-styled **Number Guessing Game Web Application** built using **HTML5, CSS3, and modern TypeScript (compiled to JavaScript)**.

Designed with practical TypeScript implementations, this game incorporates custom type aliases, mapped record configurations, array transformation callbacks (`.map()`), typed arrow functions, and nullish coalescing.

---

## 🎮 Game Overview

The application generates a secret random number within a designated range based on your chosen difficulty level. Your objective is to deduce the hidden code before your allowed attempts run out:
- **Easy**: Numbers between **1 – 100** (7 attempts)
- **Medium**: Numbers between **1 – 500** (9 attempts)
- **Hard**: Numbers between **1 – 1000** (10 attempts)

After every guess, immediate directional feedback is provided:
- **"Too Low! Try a Higher Number"** ($\uparrow$)
- **"Too High! Try a Lower Number"** ($\downarrow$)
- **"CYBER CODE CRACKED! YOU WON!"** ($\checkmark$) upon exact match
- **"SYSTEM LOCKED: YOU LOST!"** if you exhaust all attempts

---

## ✨ Features

1. **Dynamic Difficulty Settings**: Switch between Easy, Medium, and Hard with auto-adjusting ranges and attempt caps.
2. **Safe Input Validation**:
   - Rejects empty strings.
   - Rejects decimal numbers/floats.
   - Rejects non-numeric text.
   - Rejects out-of-range guesses without deducting player attempts.
3. **Attempt Progress Bar**: Visual progress indicator that dynamically transitions colors as remaining attempts decrease (Cyan $\to$ Amber $\to$ Rose).
4. **Functional Guess History**: Chronological history badges generated via `.map()` displaying past guesses with directional indicators.
5. **Session Statistics**: Real-time tracking of **Games Played**, **Games Won**, **Games Lost**, and **Win Rate %** calculated via a dedicated arrow helper.
6. **Game State Reset**: One-click restart button with visual glow animations upon game completion.

---

## 🛠️ Technologies Used

- **TypeScript (v5.x)**: Union types, Record mappings, arrow functions, `.map()` callback rendering, and default parameters.
- **HTML5**: Form controls, HUD badges, and semantic game sections.
- **CSS3**: Cyberpunk / neon theme with CSS variables, glowing borders, gradients, and responsive breakpoints.
- **JavaScript (ES6)**: Compiled browser output.

---

## 📂 Project Structure

```text
03-number-guessing-game/
├── dist/
│   └── number-guessing-game.js      # Compiled JavaScript output consumed by index.html
├── src/
│   └── number-guessing-game.ts      # TypeScript source code (state, callbacks, DOM)
├── index.html                       # Application game interface
├── style.css                        # Cyberpunk styling, neon glows, and HUD progress bar
├── package.json                     # NPM package scripts (build: "tsc", watch: "tsc --watch")
├── tsconfig.json                    # Compiler configuration (Target: ES6, Strict: true)
└── README.md                        # Project documentation
```

---

## 🧠 TypeScript Concepts Practised in this Project

1. **Type Aliases & Mapped Record Configurations**:
   ```typescript
   type DifficultyLevel = "easy" | "medium" | "hard";

   interface DifficultyConfig {
     name: string;
     min: number;
     max: number;
     maxAttempts: number;
   }

   const DIFFICULTY_SETTINGS: Record<DifficultyLevel, DifficultyConfig> = { ... };
   ```
2. **Functional Array Transformation with `.map()`**:
   - Transformed numerical guess history into styled HTML tags cleanly replacing imperative `for` loops:
     ```typescript
     const tagsHtml: string = guessHistory
       .map((val: number): string => {
         // evaluate class and directional arrow
         return `<span class="history-tag ${tagClass}">${val} ${arrow}</span>`;
       })
       .join("");
     ```
3. **Typed Arrow Functions**:
   - Pure win rate calculation with division-by-zero protection:
     ```typescript
     const calculateWinRate = (won: number, total: number): number => {
       return total === 0 ? 0 : Math.round((won / total) * 100);
     };
     ```
4. **Default Parameters**:
   - `generateRandomNumber(min: number = 1, max: number = 100): number`
5. **Safe Data Attribute Retrieval & Nullish Coalescing (`??`)**:
   - Safely reading button difficulty attributes with a fallback string:
     ```typescript
     const rawLevel: string = btn.getAttribute("data-difficulty") ?? "";
     if (rawLevel === "easy" || rawLevel === "medium" || rawLevel === "hard") { ... }
     ```

---

## 🚀 How to Run and Compile

### 1. Open in Browser
Double-click `index.html` or launch it via PowerShell:
```powershell
Start-Process "03-number-guessing-game/index.html"
```

### 2. Compiling TypeScript
To compile `src/number-guessing-game.ts` into `dist/number-guessing-game.js`:
```bash
# Using local tsconfig
tsc --project ./03-number-guessing-game/tsconfig.json

# Or using the package script inside this folder:
cd 03-number-guessing-game
npm run build
```

Watch mode for automatic re-compilation on save:
```bash
npm run watch
```
