# TypeScript Projects Portfolio

A collection of beginner-to-intermediate modern web applications built using **TypeScript, HTML5, and CSS3**.

---

## 🚀 Live Demo on GitHub Pages
Visit the live portal hosting all three projects:
👉 **[https://Sameena70.github.io/typescript-learning-projects/](https://Sameena70.github.io/typescript-learning-projects/)**

---

## 📂 Included Projects

### 1. [01. Simple Calculator](./01-simple-calculator)
A dark-themed, responsive web calculator.
- **Key Features**: Addition, Subtraction, Multiplication, Division, Percentage, Clear (AC), Delete (DEL), Division-by-Zero error prevention, and full **Desktop Keyboard Support**.
- **Tech Highlights**: Basic types (`number`, `string`, `boolean`), functions with strict return types, DOM type assertions (`as HTMLButtonElement`), and template literals.

### 2. [02. Personal Expense Tracker](./02-expense-tracker)
A clean, light & warm-gray styled personal finance tracker formatted with **Indian Rupee (₹ INR)**.
- **Key Features**: Add expenses (Amount, Category, Date, Title), Monthly Budget tracking, Remaining Balance with color-coded status badges, Category Filter, and single-item delete.
- **Tech Highlights**: TypeScript `interface Expense`, typed array operations (`.filter()`, `.reduce()`), browser `localStorage` integration, and `Intl.NumberFormat("en-IN")`.

### 3. [03. Guess Master (Number Guessing Game)](./03-number-guessing-game)
A high-level cyberpunk / neon dark-glow number guessing game.
- **Key Features**: 3 difficulty levels (Easy 1–100, Medium 1–500, Hard 1–1000), dynamic attempt progress bar, instant directional hints ("Too High!", "Too Low!"), input validation (rejects floats/invalid ranges without consuming attempts), and persistent session statistics (Played, Won, Lost, Win Rate %).
- **Tech Highlights**: Custom TypeScript types (`type DifficultyLevel`), `Record` configurations, typed loops, input validation, and DOM UI state management.

---

## 🛠️ Repository Structure

```text
type script/
├── index.html                   # Showcase landing page for GitHub Pages
├── README.md                    # Main portfolio documentation
├── .gitignore                   # Ignores node_modules, temp files, and caches
├── .nojekyll                    # Ensures GitHub Pages serves subfolders cleanly
│
├── 01-simple-calculator/        # Project 1: Calculator
│   ├── index.html
│   ├── style.css
│   ├── tsconfig.json
│   ├── package.json
│   ├── README.md
│   ├── src/calculator.ts
│   └── dist/calculator.js
│
├── 02-expense-tracker/          # Project 2: Expense Tracker (INR)
│   ├── index.html
│   ├── style.css
│   ├── tsconfig.json
│   ├── package.json
│   ├── README.md
│   ├── src/expense-tracker.ts
│   └── dist/expense-tracker.js
│
└── 03-number-guessing-game/     # Project 3: Guess Master
    ├── index.html
    ├── style.css
    ├── tsconfig.json
    ├── package.json
    ├── README.md
    ├── src/number-guessing-game.ts
    └── dist/number-guessing-game.js
```

---

## 💻 Running the Projects Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sameena70/typescript-learning-projects.git
   cd typescript-learning-projects
   ```

2. **Open the Showcase or Projects**:
   - Open root `index.html` to access all projects from a unified menu.
   - Or open any individual project directly:
     - `01-simple-calculator/index.html`
     - `02-expense-tracker/index.html`
     - `03-number-guessing-game/index.html`

3. **Recompiling TypeScript**:
   - For Calculator:
     ```bash
     cd 01-simple-calculator && npx -p typescript tsc
     ```
   - For Expense Tracker:
     ```bash
     cd 02-expense-tracker && npx -p typescript tsc
     ```
   - For Guess Master:
     ```bash
     cd 03-number-guessing-game && npx -p typescript tsc
     ```

---

## License
Open-source under the [MIT License](https://opensource.org/licenses/MIT).
