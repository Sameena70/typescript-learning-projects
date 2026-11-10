# GUESS MASTER — Cyberpunk Number Guessing Game

An interactive, neon-styled number guessing game engineered in modern TypeScript with ES6 modules, custom difficulty configuration, lifetime statistics, and match history persistence.

---

## 1. Project Overview

**GUESS MASTER** challenges players to crack a randomly generated secret numeric code within a limited number of attempts. It includes dynamic visual feedback, progress tracking, session and lifetime player statistics, and match history logs stored in browser storage.

---

## 2. Features

- **Multiple Difficulty Modes**:
  - **Easy**: 1 – 100 range with 7 attempts.
  - **Medium**: 1 – 500 range with 9 attempts.
  - **Hard**: 1 – 1,000 range with 10 attempts.
  - **Custom Mode**: Configure your own custom minimum, maximum, and allowed attempts.
- **Intelligent Game Logic**:
  - Duplicate guess prevention (repeated numbers do not penalize remaining attempts).
  - Post-game input lockdown prevents guessing after victory or defeat.
  - Range validation ensures guesses remain strictly within current bounds.
- **Lifetime Statistics & History**:
  - Tracks Total Games, Wins, Losses, Win Rate %, Best Score (fewest attempts used), and Average Attempts.
  - Slide-out Match History drawer recording target numbers, attempts used, difficulties, and timestamps.
  - Persisted using `localStorage` and `JSON.stringify()`.
- **Cyberpunk UI & Visual Feedback**:
  - Dynamic neon glow progress bar reflecting attempts left.
  - Color-coded feedback banner (Victory, System Overload, Too High, Too Low, Duplicate).

---

## 3. Technology Stack

- **HTML5 & CSS3**: Cyberpunk/neon aesthetic with ambient glow orbs and glassmorphism.
- **TypeScript 5.x**: Strict mode, custom types, object models, and generic storage.
- **Storage**: Browser `localStorage` with `JSON.stringify()` and `JSON.parse()`.

---

## 4. Folder Structure

```
03-number-guessing-game/
├── dist/                  # Compiled JavaScript ES6 modules
│   ├── game-config.js
│   ├── game-logic.js
│   ├── game-state.js
│   ├── main.js
│   ├── statistics.js
│   ├── storage.js
│   ├── types.js
│   └── ui.js
├── src/                   # TypeScript source code
│   ├── types.ts           # Game types & record interfaces
│   ├── storage.ts         # Generic localStorage wrapper
│   ├── game-config.ts     # Difficulty configuration model
│   ├── game-logic.ts      # Pure game rules & guess evaluation
│   ├── game-state.ts      # Active round state machine
│   ├── statistics.ts      # Lifetime stats & history management
│   ├── ui.ts              # DOM HUD renderer & history drawer
│   └── main.ts            # Entry point & event listeners
├── index.html             # Application markup with type="module"
├── style.css              # Cyberpunk dark theme stylesheet
├── package.json           # Build scripts & dependencies
├── tsconfig.json          # TypeScript compiler options
└── README.md              # Project documentation
```

---

## 5. TypeScript Module Breakdown

- **`types.ts`**: Defines `DifficultyLevel`, `GuessFeedbackType`, `GuessResult`, `GameRecord`, and `LifetimeStatistics`.
- **`game-config.ts`**: Provides defaults and validates custom user configurations.
- **`game-logic.ts`**: Evaluates guesses against secret numbers and generates typed feedback results (`CORRECT`, `GAME_OVER`, `TOO_HIGH`, `TOO_LOW`, `DUPLICATE`).
- **`game-state.ts`**: Tracks the ongoing game state (secret number, remaining tries, guess history).
- **`statistics.ts`**: Updates and serializes lifetime player records to `localStorage`.
- **`ui.ts`**: Handles HUD updates, guess tags, and modal controls.
- **`main.ts`**: Connects user input to game logic and handles difficulty switching.

---

## 6. How Concepts Work

### A. Separation of Game Logic from UI
The game rules in `game-logic.ts` contain zero references to `document` or HTML elements. They receive numbers and arrays, returning typed `GuessResult` objects. The `ui.ts` module is solely responsible for translating those results into DOM updates and animations.

### B. Persistent Statistics
Every completed match triggers:
```typescript
const record = this.stateModel.createGameRecord();
this.statsManager.recordGame(record);
```
Stats are saved as JSON strings and immediately restored when the browser reloads.

---

## 7. Installation & Build

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run watch
```

Run with any static web server (such as Live Server or `npx serve .`).

---

## 8. Manual Testing Checklist

- [x] Standard game loop: select Easy, enter guesses, verify feedback banners change properly.
- [x] Duplicate check: enter `42`, then enter `42` again; verify warning banner appears without decrementing remaining attempts.
- [x] Out-of-bounds check: enter a number below `min` or above `max`; verify error message is shown.
- [x] Custom difficulty: click ⚙️ Custom, set min: 10, max: 80, attempts: 5, start game and verify HUD updates.
- [x] Match history: click 📜 Game History, verify past completed matches appear with result and timestamp.
- [x] Refresh page: reload browser and confirm played/won/lost counters remain intact.
