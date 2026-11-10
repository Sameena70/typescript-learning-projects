# Contributing Guidelines

Thank you for contributing to the TypeScript Learning Curriculum!

This repository demonstrates high standards of type safety, code readability, automated testing, and software design across client-side vanilla TypeScript projects.

Please follow these guidelines to keep the codebase clean, consistent, and maintainable.

---

## 🏗️ Architectural Principles

1. **Vanilla TypeScript & Native Web Standards:**
   - Applications must run directly in modern web browsers without heavy UI frameworks (React, Vue, Angular) or complex bundlers (Webpack, Vite build).
   - Use standard ES module imports (`import { ... } from './module.js';`) in TypeScript source files.
   - All modules must be compiled via `tsc` into the corresponding `dist/` directory.

2. **Decoupled & Independent Projects:**
   - Each project (`01-simple-calculator`, `02-expense-tracker`, `03-number-guessing-game`, `04-contact-manager`) must remain completely self-contained.
   - Do not cross-import code between project directories.
   - Each project manages its own dependencies in its local `package.json`.

3. **Separation of Concerns:**
   - **Types (`types.ts`):** Interface definitions, union types, and data contracts.
   - **Business Logic / Calculations:** Pure functions without DOM or storage side effects.
   - **Storage (`storage.ts`):** Encapsulated persistence layers with defensive parsing.
   - **Services:** In-memory state management, data filtering, and file I/O.
   - **UI / Controller:** DOM query selection, event listener wiring, and HTML rendering.

---

## 📐 TypeScript & Coding Conventions

- **Strict Typing:** Never use `any`. Use `unknown` with runtime type narrowing or user-defined type guards (`item is T`).
- **Compiler Flags:** Always maintain `"strict": true` and `"noImplicitAny": true`.
- **Imports:** Explicitly include the `.js` extension on relative imports (e.g. `import { GameLogic } from './game-logic.js';`) so the compiled output runs seamlessly in browser native ES module environments.
- **Null Safety:** Avoid unsafe non-null type assertions (`as HTMLElement`) wherever possible; check presence before manipulating DOM elements.
- **Defensive Error Handling:** Wrap all `JSON.parse`, `localStorage`, and `FileReader` interactions in `try / catch` blocks with fallback values.

---

## 🎨 Code Style & Quality Tooling

We enforce strict automated code quality standards across all projects:

### 1. Code Formatting (Prettier)
Configuration is governed by the root `.prettierrc`:
- Indentation: 2 spaces
- Quotes: Single quotes (`'...'`)
- Semicolons: Required (`semi: true`)
- Trailing commas: None (`trailingComma: "none"`)
- Print width: 100 characters

Check formatting:
```bash
npm run format:check:all
```

### 2. Linting (ESLint)
Modern flat ESLint configuration (`eslint.config.mjs`) is configured in each project.
- No unused variables or unused imports.
- Proper error cause chaining when rethrowing exceptions.

Run linter:
```bash
npm run lint:all
```

---

## 🧪 Testing Guidelines (Vitest)

- Every pure business logic module (calculations, game rules, validators, string/math formatters) must be covered by automated unit tests in the project's `tests/` directory.
- Tests should be meaningful and deterministic. Do not write dummy tests or test trivial framework implementation details.
- Use descriptive `describe` and `it` blocks explaining the expected behavior.

Run test suites:
```bash
npm run test:all
```

---

## 🔄 Recommended Development Workflow

1. **Install dependencies:**
   ```bash
   npm install --prefix <project-folder>
   ```
2. **Implement changes:** Work within the target project's `src/` directory.
3. **Verify compilation:**
   ```bash
   npm run build:all
   ```
4. **Run unit tests:**
   ```bash
   npm run test:all
   ```
5. **Check linting and formatting:**
   ```bash
   npm run lint:all
   npm run format:check:all
   ```
6. Verify in the browser using a local HTTP server (`npx serve .`).

