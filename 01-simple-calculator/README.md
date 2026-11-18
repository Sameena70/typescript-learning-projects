# Project 01: Simple & Scientific Calculator

A premium, modern client-side arithmetic and scientific calculator application built with **TypeScript, HTML5, and CSS3**, designed to match high-fidelity dark-mode UI standards.

This project demonstrates modular TypeScript architecture, strict type safety, safe `localStorage` persistence, continuous chained arithmetic, robust mathematical expression parsing (handling PEMDAS precedence and balanced parentheses), scientific trigonometry and logarithmic functions, precision rounding, and an accessible calculation history drawer.

---

## ✨ Features

- **Modern Dark UI Design:**
  - Deep midnight-navy glassmorphism layout with subtle glow effects and rounded panel aesthetics.
  - Sidebar mode switcher: **Standard Mode**, **Scientific Mode**, **History View**, and **Settings**.
  - Crisp high-contrast digital display showing active operands, full expressions, and real-time results.
- **Dual Calculator Engines:**
  - **Standard Calculator Mode:** Immediate execution arithmetic (`+`, `−`, `×`, `÷`, `%`), continuous chained calculations, sign negation (`±`), and memory operations (`MC`, `MR`, `M+`, `M−`).
  - **Scientific Calculator Mode:** Complex mathematical expressions supporting parenthesis groupings `( ... )`, scientific operators ($\pi$, $e$, $\sqrt{x}$, $x^2$, $x^y$, $|x|$), trigonometric functions ($\sin$, $\cos$, $\tan$), logarithms ($\ln$, $\log_{10}$), factorial ($n!$), and $1/x$.
- **Precision & Error Safety:**
  - Dedicated rounding logic eliminates floating-point inaccuracies (e.g., `0.1 + 0.2 = 0.3`).
  - Division by zero and invalid mathematical arguments (e.g., negative square roots) are caught gracefully with localized error banners.
- **Memory Store (`MC`, `MR`, `M+`, `M−`):**
  - Instant memory accumulator persisted across browser sessions in `localStorage`.
- **Persistent Calculation History:**
  - Dedicated slide-out drawer storing past calculation expressions and outcomes.
  - Clicking any history item recalls its result directly back to the display.
- **Desktop Keyboard Support:**
  - Supports numeric keys `0`–`9`, operators (`+`, `-`, `*`, `/`, `%`, `^`), parentheses `(` and `)`, Enter (`=`), Backspace (`DEL`), and Escape (`AC`).

---

## 🏛️ Architecture & Modules

```text
01-simple-calculator/
├── src/
│   ├── types.ts                # Calculation state, operator definitions, and history interfaces
│   ├── calculator-logic.ts     # Pure arithmetic logic & floating-point precision functions
│   ├── scientific-logic.ts     # Scientific functions (sin, cos, tan, sqrt, log, pow, fact)
│   ├── expression-parser.ts    # Mathematical tokenization and evaluation engine (PEMDAS)
│   ├── calculator-state.ts     # Standard mode state machine & memory store
│   ├── history-service.ts      # Persistent calculation history manager
│   ├── storage.ts              # LocalStorage wrapper with fallback drivers
│   ├── ui.ts                   # DOM renderer, scientific pad controller & history drawer
│   └── main.ts                 # Bootstrap orchestrator & keyboard listeners
├── tests/
│   ├── calculator-logic.test.ts
│   └── scientific-calculator.test.ts
├── index.html                  # Responsive HTML5 layout
├── style.css                   # Custom CSS styling with CSS variables
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
