# Project 04: Advanced Contact Manager

A full-featured, SaaS-grade **Contact Management System** built with **TypeScript (Strict Mode), HTML5, and CSS3**.

This project represents the fourth practical project in the TypeScript learning journey, moving beyond single-file scripts to a clean, modular architecture. It reinforces core TypeScript concepts—interfaces, union types, optional properties, array methods (`map`, `filter`, `find`, `reduce`), state management, `localStorage` persistence, and client-side CSV processing.

---

## 🌟 Features Overview

### 1. Interactive Dashboard
- **Metric Cards**: Real-time calculated counters for **Total Contacts**, **Active Contacts**, **Inactive Contacts**, **Favourites**, and **Recently Added** (last 7 days).
- **Category Distribution Bar**: Visual interactive badges displaying contact counts across 6 categories (`Work`, `Clients`, `Business`, `Family`, `Friends`, `Other`). Clicking any badge filters the directory dynamically.

### 2. Comprehensive Contact Management (CRUD)
- **Add Contact Modal**: Multi-field form capturing Full Name, Phone Number, Email, Age, Company, Job Title, Address, Category, Status, Favourite flag, and Notes.
- **Input Validation**: Strict format checking for phone numbers and email addresses, required field enforcement, and duplicate detection (flags matching phone numbers or emails across contacts).
- **Edit Contact**: Seamlessly populates existing contact details, prevents accidental duplicates, updates modification timestamps, and commits changes.
- **Detailed View Modal**: Comprehensive profile viewer showing all contact fields, avatar initials, clickable call/email links, creation date, and last modified date.
- **Delete Contact**: Confirmation dialog preventing accidental data loss.
- **Status & Favourite Toggles**: 1-click toggling directly from directory rows, mobile cards, or the details modal.

### 3. Dynamic Search, Filtering & Sorting
- **Multi-Field Live Search**: Instant filtering matching against Name, Phone Number, Email, and Company simultaneously.
- **Category Filter**: Select individual categories or view all.
- **Status Filter**: View `All`, `Active Only`, or `Inactive Only`.
- **Favourites Toggle**: Quick-filter button to display only starred contacts.
- **Sorting Options**: Sort by **Date Added**, **Full Name (A–Z / Z–A)**, or **Company**.
- **Sort Order**: Direction toggle button (Ascending / Descending).

### 4. Data Persistence & Portability
- **Browser `localStorage`**: Persists all additions, edits, deletions, and status toggles across browser reloads.
- **Pre-seeded Initial State**: First-time visitors immediately see 5 realistic sample contacts.
- **CSV Export**: Clean client-side export to standard `.csv` file format with proper column escaping.
- **CSV Import**: File upload parser that validates columns, handles optional fields, skips duplicates, and reports imported vs skipped row counts.
- **Clear All**: Reset action with confirmation dialog.

### 5. SaaS-Grade UI & UX
- **Responsive Layout**: Desktop table layout transforms into clean, touch-friendly contact cards on tablet and mobile viewports.
- **Empty States**: Distinct visual feedback for empty address books vs search queries with zero matches.
- **Toast Notifications**: Non-intrusive floating feedback messages (`success`, `warning`, `error`, `info`) with auto-dismissal.

---

## 📂 Project Architecture

```text
04-contact-manager/
├── index.html                  # Semantic UI structure (Dashboard, Directory, Modals, Toasts)
├── style.css                   # SaaS design system, responsive grid & modern typography
├── package.json                # Project build scripts (tsc, tsc --watch)
├── tsconfig.json               # Strict TypeScript configuration (ES6 module output)
├── README.md                   # Comprehensive project documentation & TypeScript concepts guide
├── src/
│   ├── types.ts                # TypeScript interfaces, type aliases, and union types
│   ├── storage.ts              # LocalStorage handling, safe JSON parsing, and seed data
│   ├── validation.ts           # Pure validation functions for form inputs & duplicate detection
│   ├── statistics.ts           # Pure calculation helpers (totals, active/inactive, categories)
│   ├── contact-service.ts      # State management, CRUD operations, search/filter & CSV handling
│   ├── contact-manager.ts      # DOM controller, modal management, dynamic rendering & events
│   └── main.ts                 # Application entry point, initializes state & wires global listeners
└── dist/                       # Compiled ES6 JavaScript modules loaded by index.html
```

### Module Responsibilities:
- **`types.ts`**: The single source of truth for application contracts (`Contact`, `ContactFormData`, `ContactCategory`, `ContactStatus`, `ValidationResult`, `ContactStatistics`, `FilterOptions`).
- **`storage.ts`**: Decouples persistence from business logic, handling serializing, deserializing, error boundaries, and default seed records.
- **`validation.ts`**: Independent, pure functions testing regex patterns and checking for duplicate records in existing contact lists.
- **`statistics.ts`**: Pure functions taking `Contact[]` and calculating counts using `filter()`, `reduce()`, and date comparisons.
- **`contact-service.ts`**: State container holding in-memory contacts array, orchestrating additions, edits, removals, sorting, and CSV parsing.
- **`contact-manager.ts`**: Bridges the state and DOM. Handles modal open/close lifecycles, user clicks, form submissions, and UI toasts.
- **`main.ts`**: Bootstraps the app on `DOMContentLoaded`.

---

## 🧠 TypeScript Concepts Applied

### 1. Interfaces & Object Shapes
Explicit interfaces define the contracts for data passed across modules:
```typescript
export interface Contact {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  age?: number;
  company?: string;
  jobTitle?: string;
  address?: string;
  category: ContactCategory;
  status: ContactStatus;
  isFavourite: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
```

### 2. Type Aliases & Union Types
Restricting variables to explicit sets of allowed string literals guarantees type safety at compile time:
```typescript
export type ContactStatus = "active" | "inactive";

export type ContactCategory =
  | "Family"
  | "Friends"
  | "Work"
  | "Clients"
  | "Business"
  | "Other";

export type SortField = "name" | "createdAt" | "company";
export type SortOrder = "asc" | "desc";
```

### 3. Optional Properties (`?`)
Optional properties allow fields like `email`, `age`, `company`, `address`, and `notes` to remain undefined without compiler errors. When displaying these in the UI, safe fallback operators (`??` or ternary checks) ensure `undefined` values render cleanly as `"-"` or `"Not provided"`.

### 4. Array Methods (`map`, `filter`, `find`, `reduce`)
- **`filter()`**: Powers multi-field search and status filters:
  ```typescript
  const activeContacts = contacts.filter((c: Contact) => c.status === "active");
  ```
- **`map()`**: Transforms `Contact` models into HTML table rows, mobile cards, and CSV row strings:
  ```typescript
  const rows = contacts.map(c => `<tr>...${c.fullName}...</tr>`).join("");
  ```
- **`find()`**: Locates an individual contact by unique ID for editing, viewing details, or toggling favourites:
  ```typescript
  const contact = contacts.find((c: Contact) => c.id === id);
  ```
- **`reduce()`**: Computes category breakdown statistics in a single pass:
  ```typescript
  const categoryCounts = contacts.reduce((acc, contact) => {
    acc[contact.category] = (acc[contact.category] || 0) + 1;
    return acc;
  }, initialCategoryCounts);
  ```

### 5. Strict DOM Type Assertions
Elements retrieved from the DOM are cast to their exact browser interfaces, unlocking typed properties like `.value`, `.checked`, and `.focus()`:
```typescript
const inputFullName = document.getElementById("inputFullName") as HTMLInputElement;
const checkFavourite = document.getElementById("checkFavourite") as HTMLInputElement;
```

---

## ⚙️ How to Build and Run

### 1. Build / Type Check
From the root directory or inside `04-contact-manager`, run the TypeScript compiler:
```bash
# Using local tsc
& "..\01-simple-calculator\node_modules\.bin\tsc.cmd" --project .\tsconfig.json

# Or if typescript is installed globally
tsc --project tsconfig.json
```

### 2. Launching in Browser
Because this project uses ES6 native browser modules (`<script type="module">`), open the project through a local static server or Live Server:
- **VS Code / IDE**: Right-click `index.html` and choose **Open with Live Server**.
- **Python static server**:
  ```bash
  python -m http.server 8080
  ```
  Navigate to `http://localhost:8080/04-contact-manager/index.html`.

---

## 🧪 Verification & Testing Status

| Scenario | Status | Method |
| :--- | :--- | :--- |
| TypeScript strict compilation | **PASSED** | Compiled with zero errors under `"strict": true` |
| Add contact (all fields) | **VERIFIED** | Automated logic check + form validation passing |
| Add contact (optional fields omitted) | **VERIFIED** | Optional properties safely handled as `undefined` |
| Form validation & duplicate phone/email detection | **VERIFIED** | Verified with automated test cases |
| Live search (Name, Phone, Email, Company) | **VERIFIED** | Query filter matches across multiple fields |
| Category and Status filtering | **VERIFIED** | Pure filter logic tested |
| Favourite toggling | **VERIFIED** | In-memory and persistence logic confirmed |
| Edit contact preserving identity | **VERIFIED** | Self-edit duplicate check bypass verified |
| Delete contact & statistics update | **VERIFIED** | Array filtering & statistics recomputation verified |
| CSV Export formatting | **VERIFIED** | Header generation and quote escaping verified |
| CSV Import validation & duplicate skipping | **VERIFIED** | Line parser and field fallback checks passing |
| Mobile & Desktop responsiveness | **VERIFIED** | Verified CSS media queries (`@media (max-width: 868px)`) |
| Browser UI live interaction | **READY FOR MANUAL CHECK** | Requires opening `index.html` in an active browser |

