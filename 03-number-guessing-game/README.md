# Project 03: Number Guessing Game (Guess Master)

A high-tech cyberpunk number guessing game built with **TypeScript, HTML5, and CSS3**, designed to match modern gaming UI aesthetics with glowing borders and glassmorphism.

This project demonstrates modular application architecture, pure game logic, dynamic range validation, immutable state modeling, resilient error handling, audio/haptic feedback, lifetime match statistics, and an accessible game history drawer.

---

## ✨ Features

- **Cyberpunk Gaming Aesthetic:**
  - Dark midnight-blue canvas with purple and cyan neon borders and subtle glassmorphic panels.
  - Interactive difficulty mode selectors with glowing badge indicators.
  - Directional hint indicators: **TOO HIGH** (with ↓ arrow) and **TOO LOW** (with ↑ arrow).
  - Celebration animations upon victory and overload state upon game over.
- **Multiple Difficulty Modes:**
  - **Easy:** Range 1 to 100 with 10 attempts.
  - **Medium:** Range 1 to 500 with 8 attempts.
  - **Hard:** Range 1 to 1,000 with 6 attempts.
  - **Custom:** Configurable range and attempt limits with real-time validation.
- **HUD & Match Feedback:**
  - Dynamic visual attempts counter showing remaining guesses.
  - Interactive past-guesses strip recording every attempt in the current session.
  - Duplicate guess detection preventing repeated attempts without penalty.
- **Lifetime Statistics HUD:**
  - Tracks total matches, total victories, games lost, win rate %, and fewest attempts record.
- **Game History Drawer:**
  - Slide-out drawer tracking chronological match history with difficulty tiers and outcomes.

---

## 🏛️ Architecture & Modules

```text
03-number-guessing-game/
├── src/
│   ├── types.ts            # Difficulty settings, state interfaces & game result models
│   ├── game-config.ts      # Preset & custom range configuration management
│   ├── game-logic.ts       # Pure functions for secret generation and guess evaluation
│   ├── game-state.ts       # Active match state machine
│   ├── statistics.ts       # Lifetime metrics and match history management
│   ├── storage.ts          # Safe localStorage driver with corrupt-data fallback
│   ├── ui.ts               # DOM renderer, neon animations & drawer controller
│   └── main.ts             # Application bootstrapper & event listeners
├── tests/
│   └── game-logic.test.ts  # Vitest unit test suite
├── index.html              # Responsive layout with cyberpunk aesthetic
├── style.css               # Neon glows, animations and responsive rules
└── tsconfig.json
```

---

## 🛠️ Verification & Build Commands

```bash
# Run Vitest unit tests
npm test

# Compile TypeScript to dist/
npm run build

# Run ESLint checks
npm run lint

# Format check with Prettier
npm run format:check
```
