# Project 04: Advanced Contact Manager

A CRM-style address book and directory application built with **TypeScript, HTML5, and CSS3**.

This project demonstrates comprehensive TypeScript interfaces, intersection types, generic multi-field search and sorting utilities, custom runtime type guards, activity logging with discriminated unions, multi-field form validation, duplicate contact prevention, aggregate statistics calculation, seed data initialization, and asynchronous RFC 4180 CSV & JSON import/export operations.

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

## 🏛️ Advanced TypeScript Architecture & Concepts Applied

### 1. Intersection Types for Contact Domain Modeling
Instead of a monolithic interface, the `Contact` model is composed using modular, reusable interfaces via **Intersection Types (`&`)**:
```typescript
export interface BaseContact {
  id: string;
  fullName: string;
  phoneNumber: string;
}

export interface OptionalContactDetails {
  email?: string;
  age?: number;
  company?: string;
  jobTitle?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  birthday?: string;
  reminderDate?: string;
}

export interface ContactPreferences {
  category: ContactCategory;
  status: ContactStatus;
  isFavourite: boolean;
}

export interface ContactAuditInfo {
  createdAt: string;
  updatedAt?: string;
  activities?: ContactActivity[];
}

export type Contact = BaseContact &
  OptionalContactDetails &
  ContactPreferences &
  ContactAuditInfo;
```

### 2. Generic Multi-Field Search Engine (`<T>`)
A reusable generic search engine filters collections across any specified keys using `keyof T` constraints without loss of type information:
```typescript
export function searchByFields<T>(
  items: T[],
  query: string,
  searchableKeys: (keyof T)[]
): T[] {
  const normalisedQuery = query.trim().toLowerCase();
  if (!normalisedQuery) return [...items];

  return items.filter((item) =>
    searchableKeys.some((key) => {
      const val = item[key];
      if (val === undefined || val === null) return false;
      if (Array.isArray(val)) {
        return val.some((entry) => String(entry).toLowerCase().includes(normalisedQuery));
      }
      return String(val).toLowerCase().includes(normalisedQuery);
    })
  );
}
```

### 3. Type-Safe Sorting with `keyof` (`<T, K extends keyof T>`)
Sorting operates on typed properties with directional control and numerical/string branching:
```typescript
export function sortByKey<T, K extends keyof T>(
  items: T[],
  key: K,
  order: 'asc' | 'desc' = 'asc'
): T[]
```

### 4. Custom Type Guards (`val is T`) & `in` Operator Narrowing
Untrusted JSON loaded from `localStorage` or imported files is safely validated at runtime using custom type guards rather than unsafe type casts (`as Record<string, unknown>`):
```typescript
export function isContact(value: unknown): value is Contact {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'id' in value &&
    'fullName' in value &&
    'phoneNumber' in value &&
    'category' in value &&
    'status' in value &&
    typeof value.fullName === 'string'
  );
}
```

### 5. Discriminated Unions for Activity Logs
Contact activity logs are modeled as a discriminated union over `type`:
```typescript
export type ContactActivity =
  | { id: string; contactId: string; type: 'call'; date: string; notes: string; durationMinutes?: number }
  | { id: string; contactId: string; type: 'email'; date: string; notes: string; subject?: string }
  | { id: string; contactId: string; type: 'meeting'; date: string; notes: string; location?: string }
  | { id: string; contactId: string; type: 'note'; date: string; notes: string };
```

---

## 📂 Project Structure

```text
04-contact-manager/
├── index.html               # CRM dashboard, contact table, card container, and modals
├── style.css                # Professional SaaS CRM styling and modal animations
├── package.json             # Build, test, lint, and formatting scripts
├── tsconfig.json            # Strict TypeScript configuration
├── eslint.config.mjs        # Flat ESLint configuration
├── src/
│   ├── types.ts             # Contact intersection types, form types, and activity unions
│   ├── generic-utils.ts     # Generic search, filter, and sort utilities
│   ├── validation.ts        # Phone/email validators, form checks, and duplicate detection
│   ├── statistics.ts        # Functional statistics calculations (filter, reduce)
│   ├── storage.ts           # Resilient persistence, custom type guards, and seed contacts
│   ├── contact-service.ts   # In-memory store, CRUD, activity log, filtering, and sorting
│   ├── import-export.ts     # Asynchronous JSON/CSV file readers, validators, and exporters
│   ├── contact-manager.ts   # UI controller managing DOM elements, modals, and tables
│   └── main.ts              # Application initialization and bootstrap
├── tests/
│   └── validation.test.ts   # Vitest unit test suite (14 comprehensive tests)
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
