# Project 04: Advanced Contact Manager

A CRM-style address book and directory application built with **TypeScript, HTML5, and CSS3**.

This project demonstrates clean architecture, encapsulated services, repository abstractions, constructor dependency injection, defensive copying, decomposed UI controllers, intersection types, generic multi-field search and sorting utilities, custom runtime type guards, activity logging with discriminated unions, multi-field form validation, duplicate contact prevention, aggregate statistics calculation, seed data isolation, and robust RFC 4180 CSV & JSON import/export operations with embedded-newline support.

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
- **RFC 4180 CSV & JSON Import/Export:** Export the entire contact database to standard CSV or JSON backup files, or import external files with record-by-record schema validation without overwriting existing valid contacts. Fully supports quoted fields containing commas, double quotes, and embedded newlines (`\n`).
- **Resilient Persistence & Migrations:** Automatically migrates legacy storage keys and pre-populates realistic sample contacts for first-time visitors while persisting all updates to `localStorage`.

---

## 🏛️ Application Architecture & Data Flow

The project eliminates module-level mutable state and decouples storage, business logic, and UI components into a clean layered architecture:

```text
[ User / Form Input / CSV / JSON ]
                │
                ▼
      [ ContactManagerApp ] (main.ts - Orchestrator & DI Controller)
       ├── [ ContactService ] (contact-service.ts - Encapsulated State & CRUD)
       │     └── [ IContactRepository / ContactRepository ] (storage.ts)
       │           └── [ IContactStorageDriver / LocalStorageDriver ]
       ├── [ Isolated Seed Data ] (data/seed-contacts.ts - SEED_CONTACTS)
       ├── [ Pure CSV Engine ] (utils/csv-utils.ts - splitCSVRecords, parseCSVLine, escapeCSVField)
       ├── [ Async File I/O ] (import-export.ts - exportToJSON, parseAndValidateJSON, exportToCSV, parseCSVContent)
       ├── [ Validation Engine ] (validation.ts - validateContactForm, findDuplicateContact)
       ├── [ Statistics Calculator ] (statistics.ts - calculateContactStatistics)
       └── [ UI Controller Facade ] (contact-manager.ts)
             ├── [ ContactFormUI ] (ui/contact-form.ts - Form & Error Handling)
             ├── [ ContactDetailsUI ] (ui/contact-details.ts - Details & Activities)
             └── [ ContactListUI ] (ui/contact-list.ts - Table & Card Views)
```

1. **User Action:** Handled by event listeners coordinated through `ContactManagerApp` and `contact-manager.ts`.
2. **Business Operations:** Handled exclusively by `ContactService`. Internal state (`private contacts: Contact[]`) is encapsulated and protected by defensive copying.
3. **Repository Abstraction (`IContactRepository`):** Implemented by `ContactRepository` to decouple domain entity persistence from storage drivers.
4. **Storage Driver Abstraction (`IContactStorageDriver`):** Implemented by `LocalStorageDriver` to wrap key-value storage operations, allowing headless in-memory testing.
5. **Specialized UI Components:** Dedicated renderers (`ContactFormUI`, `ContactDetailsUI`, `ContactListUI`) handle modular presentation tasks under the `contact-manager.ts` facade.

---

## 💡 Important TypeScript Concepts & Design Patterns

### 1. Encapsulated `ContactService` with Defensive Copying
All methods returning contacts produce deep clones of nested reference arrays (`tags`, `activities`), preventing external callers from mutating private state:
```typescript
public getAllContacts(): Contact[] {
  return this.contacts.map((c) => ({
    ...c,
    tags: c.tags ? [...c.tags] : undefined,
    activities: c.activities ? c.activities.map((a) => ({ ...a })) : undefined
  }));
}
```

### 2. Repository & Driver Abstraction (Dependency Inversion Principle)
`ContactService` depends on `IContactRepository`, and `ContactRepository` depends on `IContactStorageDriver`:
```typescript
export interface IContactStorageDriver {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface IContactRepository {
  loadContacts(): Contact[];
  saveContacts(contacts: readonly Contact[]): boolean;
  clearContacts(): void;
}
```

### 3. Quote-Aware CSV Record Splitting (`src/utils/csv-utils.ts`)
To adhere to RFC 4180 and preserve multi-line notes, `splitCSVRecords()` splits documents while tracking quote boundaries:
```typescript
export function splitCSVRecords(text: string): string[];
export function parseCSVLine(line: string): string[];
export function escapeCSVField(val: string): string;
```

### 4. Modular Intersection Types (`&`)
The `Contact` entity is composed of focused, reusable domain interfaces:
```typescript
export type Contact = BaseContact &
  OptionalContactDetails &
  ContactPreferences &
  ContactAuditInfo;
```

### 5. Discriminated Unions for Contact Activity Logs
Activity tracking uses discriminated unions keyed on `type` (`call`, `email`, `meeting`, `note`):
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
├── index.html                     # Main application layout, table, cards, and modal dialogs
├── style.css                      # Modern responsive styles, category badges, and animations
├── package.json                   # Build, test, lint, and formatting scripts
├── tsconfig.json                  # Strict TypeScript configuration
├── eslint.config.mjs              # ESLint configuration
├── src/
│   ├── types.ts                   # Domain types, discriminated unions, and repository interfaces
│   ├── contact-service.ts         # Encapsulated ContactService class & backward-compatible facade
│   ├── storage.ts                 # LocalStorageDriver and ContactRepository implementing abstractions
│   ├── validation.ts              # Pure contact validation functions & duplicate check
│   ├── import-export.ts           # Pure CSV/JSON import/export routines & facade
│   ├── statistics.ts              # Aggregate dashboard statistics calculator
│   ├── generic-utils.ts           # Generic multi-field search, sort, and filter utilities
│   ├── contact-manager.ts         # Coordinating UI facade with backward-compatible functions
│   ├── main.ts                    # ContactManagerApp entry controller with DOM-ready bootstrap
│   ├── data/
│   │   └── seed-contacts.ts       # Isolated realistic sample contact records (SEED_CONTACTS)
│   ├── ui/
│   │   ├── contact-form.ts        # Dedicated modal form management & error mapping (ContactFormUI)
│   │   ├── contact-details.ts     # Details viewing modal & activity logging form (ContactDetailsUI)
│   │   └── contact-list.ts        # Desktop table & responsive mobile cards renderer (ContactListUI)
│   └── utils/
│       └── csv-utils.ts           # Quote-aware CSV record splitting and escaping utilities
├── tests/
│   └── validation.test.ts         # Vitest unit test suite (20 comprehensive tests)
└── dist/                          # Compiled ES6 JavaScript modules
```

---

## 💾 Storage & Data Persistence

- **Primary LocalStorage Keys:**
  - `ts_contact_manager_contacts_v1`: Primary key storing sanitized JSON contact records.
  - `ts_contact_manager_contacts`: Legacy storage key automatically migrated if primary is empty.
- **Corrupt Storage Fallback:** If stored JSON is corrupt or non-array, `ContactRepository` safely catches the error and falls back to seed contacts without crashing.

---

## 🚀 Installation & Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Build TypeScript:**
   ```bash
   npm run build
   ```

3. **Run Unit Tests:**
   ```bash
   npm run test
   ```

4. **Lint Code:**
   ```bash
   npm run lint
   ```

5. **Check Formatting:**
   ```bash
   npm run format:check
   ```

6. **Run Locally:**
   Open `index.html` directly in any modern browser, or serve it with a local HTTP server:
   ```bash
   npx serve .
   ```
