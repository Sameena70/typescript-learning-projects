# TypeScript Calculator Web Application

A clean, modern, beginner-friendly Calculator Web Application built with **HTML5, CSS3, and TypeScript (compiled to JavaScript)**. Designed with practical examples to learn and demonstrate core TypeScript fundamentals such as static typing, strict mode, DOM element type casting, functions with type annotations, and desktop keyboard accessibility.

---

## Features

- **Core Arithmetic Operations**: Addition (`+`), Subtraction (`−`), Multiplication (`×`), Division (`÷`), and Modulo/Remainder (`%`).
- **Percentage Calculation**: Convert any active value to its percentage instantly (`%`).
- **Zero Division Protection**: Gracefully handles division by zero and displays a clean error state without crashing.
- **Display Screen & History**: Shows both the active operand and the previous operation with formatted operators.
- **Decimal & Digit Controls**: Supports fractional numbers with duplicate decimal prevention, single-digit deletion (`DEL`), and full reset (`AC`).
- **Desktop Keyboard Support**: Type calculations naturally using your physical keyboard (`0-9`, `+`, `-`, `*`, `/`, `%`, `.`, `Enter`, `=`, `Backspace`, `Escape`).
- **Responsive UI**: Fully centered layout styled with a modern dark theme that adapts seamlessly to desktop and mobile screen sizes.

---

## Technologies Used

- **TypeScript**: Application logic, static type checks, DOM casting, and math operators.
- **HTML5**: Semantic markup for the calculator display screen and button grid.
- **CSS3**: Modern Flexbox, CSS Grid, custom color palette, and responsive breakpoints.
- **Node.js & npm / npx**: Tooling to run the TypeScript compiler (`tsc`).

---

## Project Structure

```text
type script/
├── .gitignore            # Rules for excluding dependency and cache files from Git
├── index.html            # Web interface with display screen and button grid
├── package.json          # Node project scripts & devDependencies
├── README.md             # Project documentation and guide
├── style.css             # Dark theme styling, button styles, and responsive layout
├── tsconfig.json         # TypeScript compiler configuration (strict mode, target ES6)
├── src/
│   └── calculator.ts     # TypeScript source code (types, functions, DOM logic)
└── dist/
    └── calculator.js     # Compiled JavaScript consumed by index.html
```

---

## Getting Started & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone or Download the Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd "type script"
```

### 2. Install Dependencies (Optional)
If you wish to install TypeScript locally:
```bash
npm install
```

---

## How to Run the Project

### Running in the Browser
No complex local server setup is needed:
- Double-click `index.html` to open it in your default web browser, or
- On Windows PowerShell:
  ```powershell
  Start-Process index.html
  ```

### Compiling TypeScript Changes
When you edit `src/calculator.ts`, compile the changes into `dist/calculator.js`:

- **One-time compile**:
  ```bash
  npx -p typescript tsc
  ```
- **Watch mode (automatically compiles on save)**:
  ```bash
  npx -p typescript tsc --watch
  ```

---

## Keyboard Shortcuts (Desktop)

| Key | Action |
| --- | --- |
| `0` - `9` | Enter number digit |
| `.` | Enter decimal point |
| `+`, `-`, `*`, `/`, `%` | Arithmetic operations |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last digit (`DEL`) |
| `Escape` | Clear all (`AC`) |

---

## License
This project is open-source and free to use under the [MIT License](https://opensource.org/licenses/MIT).

