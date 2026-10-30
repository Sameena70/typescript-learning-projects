# TypeScript Projects Portfolio

A collection of beginner-friendly and modern web applications built using **TypeScript, HTML5, and CSS3**.

---

## 🚀 Live Demo on GitHub Pages
Visit the live portal hosting both projects:
👉 **[https://Sameena70.github.io/typescript-simple-calculator/](https://Sameena70.github.io/typescript-simple-calculator/)**

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

---

## 🛠️ Repository Structure

```text
type script/
├── index.html                   # Showcase landing page for GitHub Pages
├── README.md                    # Main portfolio documentation
├── .gitignore                   # Ignores node_modules, temp files, and caches
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
└── 02-expense-tracker/          # Project 2: Expense Tracker (INR)
    ├── index.html
    ├── style.css
    ├── tsconfig.json
    ├── package.json
    ├── README.md
    ├── src/expense-tracker.ts
    └── dist/expense-tracker.js
```

---

## 💻 Running the Projects Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sameena70/typescript-simple-calculator.git
   cd typescript-simple-calculator
   ```

2. **Open the Showcase or Projects**:
   - Open root `index.html` to access both projects from a menu.
   - Or open `01-simple-calculator/index.html` / `02-expense-tracker/index.html` directly.

3. **Recompiling TypeScript**:
   - For Calculator:
     ```bash
     cd 01-simple-calculator && npx -p typescript tsc
     ```
   - For Expense Tracker:
     ```bash
     cd 02-expense-tracker && npx -p typescript tsc
     ```

---

## License
Open-source under the [MIT License](https://opensource.org/licenses/MIT).

