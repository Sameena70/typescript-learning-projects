# Simple Calculator (TypeScript)

A clean, responsive, dark-themed **Calculator Web Application** built with **HTML5, CSS3, and modern TypeScript (compiled to JavaScript)**.

This project was progressively enhanced across six learning phases to practice TypeScript functions, strict return types, parameter handling, arrow functions, and nullish coalescing.

---

## ✨ Features

- **Core Operations**: Addition (`+`), Subtraction (`−`), Multiplication (`×`), Division (`÷`), and Modulo (`%`).
- **Percentage Calculations**: Instantly converts active numbers to a percentage (`/ 100`).
- **Precision Floating-Point Rounding**: Uses a dedicated, reusable rounding helper (`roundToPrecision`) to prevent standard JavaScript floating-point errors (e.g. `0.1 + 0.2` cleanly equals `0.3`).
- **Division-by-Zero Safety**: Returns `null` from calculation helpers to cleanly signal error conditions, displaying `"Error: Cannot divide by 0"` without crashing.
- **Display & History**: Dual-line screen showing current input and the previous operand with mathematical operator symbols.
- **Controls**: Decimal point (`.`) with duplicate prevention, single-digit deletion (`DEL`), and all-clear (`AC`).
- **Full Desktop Keyboard Accessibility**: Supports number keys (`0-9`), operators (`+`, `-`, `*`, `/`, `%`), decimal (`.`), calculation execution (`Enter` / `=`), backspace deletion (`DEL`), and escape (`AC`).

---

## 🛠️ Technologies Used

- **TypeScript (v5.x)**: Type annotations, strict mode, function extraction, union return types, and default parameters.
- **HTML5**: Semantic layout, display screen, and interactive button grid.
- **CSS3**: Modern dark theme variables, CSS Grid, Flexbox, and mobile-friendly responsive breakpoints.
- **JavaScript (ES6)**: Compiled output running directly in the browser.

---

## 📂 Project Structure

```text
01-simple-calculator/
├── dist/
│   └── calculator.js        # Compiled JavaScript output consumed by index.html
├── src/
│   └── calculator.ts        # TypeScript source code (math helpers, state, DOM logic)
├── index.html               # Main calculator interface markup
├── style.css                # Dark theme stylesheet and button grid layout
├── package.json             # NPM package scripts (build: "tsc", watch: "tsc --watch")
├── tsconfig.json            # Compiler configuration (Target: ES6, Strict: true)
└── README.md                # Project documentation
```

---

## 🧠 TypeScript Concepts Practised in this Project

1. **Pure Function Extraction & Separation of Concerns**:
   - `calculate(first: number, second: number, operator: string): number | null` decouples arithmetic logic completely from DOM updates.
2. **Explicit Return Types & `void`**:
   - Arithmetic helpers explicitly return `: number`.
   - `calculate()` returns the union type `: number | null` to account for invalid calculations (e.g., division by zero).
   - UI handlers (`computeResult()`, `updateDisplay()`, `clearAll()`) return `: void`.
3. **Default Parameters**:
   - `roundToPrecision(value: number, decimalPlaces: number = 8): number` provides a sensible default precision without requiring the caller to specify `8` each time.
4. **Nullish Coalescing (`??`)**:
   - Safely reading button data attributes (`btn.getAttribute("data-number") ?? ""`) without throwing errors or requiring verbose nested null checks.
5. **DOM Type Assertions & Strict Event Typing**:
   - Using `as HTMLButtonElement` and `as HTMLDivElement`.
   - Strictly typed `KeyboardEvent` in desktop keyboard listeners.

---

## 🚀 How to Run and Compile

### 1. Open in Browser
Open `index.html` directly in any web browser, or launch it from PowerShell:
```powershell
Start-Process "01-simple-calculator/index.html"
```

### 2. Compiling TypeScript
To compile TypeScript source files into JavaScript:
```bash
# Using local tsconfig
tsc --project ./01-simple-calculator/tsconfig.json

# Or using the package script inside this folder:
cd 01-simple-calculator
npm run build
```

Watch mode for automatic re-compilation on save:
```bash
npm run watch
```
