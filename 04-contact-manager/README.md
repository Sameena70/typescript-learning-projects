# Project 04: Advanced Contact Manager

A CRM-style address book and directory application built with **TypeScript, HTML5, and CSS3**.

This project demonstrates comprehensive TypeScript interfaces, multi-field form validation, duplicate contact prevention, aggregate statistics calculation using functional array methods (`filter`, `reduce`), seed data initialization, activity logging, reminder tracking, and asynchronous RFC 4180 CSV & JSON import/export operations.

---

## ✨ Features

- **Full CRUD Management:** Create, view, edit, and delete contacts with comprehensive profile fields: Full Name, Phone, Email, Age, Company, Job Title, Address, Notes, Tags, Birthday, and Follow-up Reminder Date.
- **Categorization & Status:** Organize contacts by category (`Family`, `Friends`, `Work`, `Clients`, `Business`, `Other`) and lifecycle status (`Active` vs. `Inactive`).
- **Favourites System:** One-click toggling to flag and filter VIP/favourite contacts.
- **Activity & Interaction Logging:** Record calls, emails, meetings, and notes directly associated with each contact.
- **Duplicate Prevention:** Form, CSV, and JSON import validation actively prevent duplicate entries matching on normalized phone numbers or case-insensitive emails.
- **Dashboard Metrics:** Real-time counters showing total contacts, active count, inactive count, favourites, contacts with pending follow-up reminders, and contacts added within the last 7 days.
- **Search & Multi-Filter:** Instantly filter contacts by category pills, search text (names, phones, emails, company, notes, tags), active status, tags, or favourites with dynamic sort ordering.
- **Dual Display Modes:** View contacts in an interactive desktop table or responsive mobile-first profile cards.
- **CSV & JSON Import/Export:** Export the entire contact database to standard RFC 4180 CSV or JSON backup files, or import external files with record-by-record schema validation without overwriting existing valid contacts.
- **Resilient Persistence & Migrations:** Automatically migrates legacy keys and pre-populates realistic sample contacts for first-time visitors while persisting all updates to `localStorage`.

---

## 🏛️ Project Architecture

```text
04-contact-manager/
├── index.html               # CRM dashboard, contact table, card container, and modals
├── style.css                # Professional SaaS CRM styling and modal animations
├── package.json             # Build, test, lint, and formatting scripts
├── tsconfig.json            # Strict TypeScript configuration
├── eslint.config.mjs        # Flat ESLint configuration
├── src/
│   ├── types.ts             # Contact interfaces, form types, activity contracts, and statistics
│   ├── validation.ts        # Phone/email validators, form checks, and duplicate detection
│   ├── statistics.ts        # Functional statistics calculations (filter, reduce)
│   ├── storage.ts           # Resilient localStorage persistence, migrations, and seed contacts
│   ├── contact-service.ts   # In-memory store, CRUD, activity log, filtering, sorting, and CSV parsing
│   ├── import-export.ts     # Asynchronous JSON/CSV file readers, validators, and exporters
│   ├── contact-manager.ts   # UI controller managing DOM elements, modals, and tables
│   └── main.ts              # Application initialization and bootstrap
├── tests/
│   └── validation.test.ts   # Vitest unit test suite (19 tests covering validation, CRUD, duplicate detection, and I/O)
└── dist/                    # Compiled ES6 JavaScript modules
```

---

## 🛠️ Installation & Setup

Navigate into the project directory and install the local developer dependencies:

```bash
cd 04-contact-manager
npm install
```

---

## 💻 Available Scripts

- **`npm run build`**: Compiles TypeScript files from `src/` to `dist/` using `tsc`.
- **`npm run watch`**: Starts the TypeScript compiler in watch mode for live recompilation.
- **`npm run test`**: Executes unit test suites with **Vitest**.
- **`npm run lint`**: Analyzes TypeScript code for potential issues with **ESLint**.
- **`npm run format:check`**: Verifies code formatting against **Prettier** rules.

---

## 🌐 Running Locally

Because this project uses native browser ES Modules, serve it using an HTTP server:

```bash
npx serve .
```

Open `http://localhost:3000/index.html` in your browser.
