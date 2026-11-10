# ContactHub Pro — Advanced Contact Management System

An enterprise-ready contact management dashboard built with modular TypeScript, ES6 modules, JSON/CSV two-way import/export, and complete contact metadata tracking (groups, tags, birthdays, and reminders).

---

## 1. Project Overview

**ContactHub Pro** provides a complete directory solution for personal and professional networking. It allows users to manage contacts across multiple categories, organize with custom tags, track birthdays, schedule follow-up reminders, and perform safe data backups via CSV and JSON.

---

## 2. Features

- **Rich Contact Profiles**:
  - Full Name, Phone, Email, Age, Company, Job Title, Address, Notes.
  - **Tags / Groups**: Tag contacts (e.g. "Developer", "Client Lead", "Badminton").
  - **Birthday & Reminder Tracking**: Store birthdays and follow-up alerts.
  - Active/Inactive status toggle & Favourite starring.
- **Search & Multi-Filter Engine**:
  - Full-text search across Name, Phone, Email, Company, and Tags.
  - Category filtering (Work, Clients, Business, Family, Friends, Other).
  - Status and Favourites filtering.
  - Multi-column sorting (Name, Creation Date, Company).
- **Two-Way Data Portability (JSON & CSV)**:
  - **JSON Export / Import**: Full fidelity schema backup and restore.
  - **CSV Export / Import**: Excel and spreadsheet compatible data portability.
  - Duplicate detection by phone number and email address.
  - Granular import error reporting with imported vs skipped counts.
- **Defensive Data Persistence**:
  - Automatic pre-populated seed data on first launch.
  - Safe parsing with error recovery for corrupted `localStorage`.

---

## 3. Technology Stack

- **HTML5 & CSS3**: Responsive grid layout, Plus Jakarta Sans typography, modal dialogs.
- **TypeScript 5.x**: Strict mode, ES6 modules, interfaces, and custom types.
- **Async File APIs**: Promise-based `FileReader` for JSON and CSV file parsing.

---

## 4. Folder Structure

```
04-contact-manager/
├── dist/                  # Compiled JavaScript ES6 modules
│   ├── contact-manager.js # DOM controller & modal management
│   ├── contact-service.js # Business logic, CRUD & state
│   ├── import-export.js   # JSON import/export & Promise FileReader
│   ├── main.js            # Entry point
│   ├── statistics.js      # Dashboard metric aggregations
│   ├── storage.ts.js      # LocalStorage with seed data
│   ├── types.js           # Shared interfaces & union types
│   └── validation.js      # Centralized validation & duplicate detector
├── src/                   # TypeScript source code
│   ├── types.ts
│   ├── storage.ts
│   ├── validation.ts
│   ├── statistics.ts
│   ├── contact-service.ts
│   ├── import-export.ts
│   ├── contact-manager.ts
│   └── main.ts
├── index.html             # Application markup with type="module"
├── style.css              # Dashboard stylesheet
├── package.json           # Build scripts & dependencies
├── tsconfig.json          # TypeScript compiler options
└── README.md              # Project documentation
```

---

## 5. TypeScript Module Breakdown

- **`types.ts`**: Core interfaces (`Contact`, `ContactFormData`, `ContactStatistics`, `ImportSummary`).
- **`validation.ts`**: Centralized email, phone number, and duplicate contact detection (`findDuplicateContact`).
- **`storage.ts`**: Encapsulates `localStorage` loading, saving, and initial seed dataset generation.
- **`statistics.ts`**: Aggregates totals, active counts, and category breakdowns using `reduce()`.
- **`contact-service.ts`**: Handles in-memory contact lists, filtering, sorting, and CSV parsing.
- **`import-export.ts`**: Implements asynchronous Promise-based file reading for JSON imports and download generation.
- **`contact-manager.ts`**: Manages modal popups, table rows, cards, and UI toasts.
- **`main.ts`**: Application initialization script.

---

## 6. How Concepts Work

### A. Centralized Duplicate Detection
Before adding or importing any contact, `validation.ts` normalizes phone numbers (stripping whitespace, parentheses, and dashes) and checks for clashes:
```typescript
export function findDuplicateContact(
  phone: string,
  email: string | undefined,
  existingContacts: Contact[],
  excludeContactId?: string
): Contact | undefined
```

### B. Promise-Based JSON Import
```typescript
public static readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(JSON.parse(reader.result as string));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}
```

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

- [x] Initial seed contacts load into dashboard cards and table.
- [x] Add contact: fill name, phone, tags, birthday, and follow-up date; verify card displays all details.
- [x] Duplicate check: attempt to add a contact with an already existing phone number; verify proper validation error appears.
- [x] Search by tag: enter a tag in the search bar and verify matching contacts appear.
- [x] JSON export & import: click Export JSON to download backup; re-import the file to verify duplicate handling.
- [x] CSV export & import: click Export CSV, import a valid CSV file, verify toast summary.
