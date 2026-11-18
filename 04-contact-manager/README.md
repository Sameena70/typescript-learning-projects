# Project 04: ContactHub (Advanced Contact Manager)

A modern, high-fidelity CRM address book and directory application built with **TypeScript, HTML5, and CSS3**, designed to replicate the clean SaaS aesthetics of the ContactHub design system.

This project demonstrates clean architecture, encapsulated services, repository abstractions, constructor dependency injection, defensive copying, decomposed UI controllers, multi-field form validation, duplicate prevention, dynamic group categorization, multi-view switching, and robust RFC 4180 CSV & JSON data portability.

---

## ✨ Features

- **ContactHub SaaS Design System:**
  - Dark midnight-navy radial background with an ambient glow.
  - Off-white application container with rounded corners (`border-radius: 28px`).
  - Left navigation sidebar featuring:
    - ContactHub logo with vibrant blue people icon.
    - Active pill navigation for **Contacts**, **Favorites**, **Groups**, **Import / Export**, and **Settings**.
    - Interactive **Need Help?** card with quick-start modal launcher.
- **Top Header & Directory Toolbar:**
  - Bold title and subtitle with prominent blue `+ Add Contact` action button.
  - Wide rounded search input for real-time contact filtering across names, emails, phones, and companies.
  - **All Groups** dropdown selector with custom chevron.
  - Grid View (3-column cards) vs. List View (data table) view switcher.
- **3-Column Profile Cards Grid:**
  - White profile cards with subtle drop shadows and hover elevation.
  - Circular profile portrait (`68px × 68px`).
  - Top-right gold star (★) button for instant favorite toggling.
  - Bold contact name, muted job title, and clickable email link.
  - Action buttons for viewing details, editing, and deleting records.
- **Dedicated Sub-Views:**
  - **Favorites:** Filtered view displaying only starred VIP contacts.
  - **Groups:** Interactive category cards displaying counts for Work, Clients, Business, Family, Friends, and Other.
  - **Import / Export:** Dedicated cards for downloading/uploading JSON and CSV backup files.
  - **Settings:** Directory display preferences and data reset controls.
- **Data Portability & Resilience:**
  - Full RFC 4180 CSV and JSON import/export with duplicate email/phone prevention.
  - Resilient `localStorage` caching with corrupt-data recovery and seed contacts pre-population.

---

## 🏛️ Architecture & Modules

```text
04-contact-manager/
├── src/
│   ├── types.ts            # Contact domain types, intersection types, and activity models
│   ├── validation.ts       # Form validation and duplicate detection
│   ├── statistics.ts       # Category counts and aggregate metric calculations
│   ├── storage.ts          # LocalStorage resilience driver & schema migration
│   ├── contact-service.ts  # Encapsulated state management & CRUD service
│   ├── import-export.ts    # RFC 4180 CSV and JSON export/import handlers
│   ├── contact-manager.ts  # UI coordinator, view switcher & modal controller
│   ├── data/
│   │   └── seed-contacts.ts # Realistic initial contact records
│   ├── ui/
│   │   ├── contact-details.ts # Details view and activity logging
│   │   ├── contact-form.ts    # Modal form inputs and validation feedback
│   │   └── contact-list.ts    # Card and table rendering logic
│   └── main.ts             # Application initialization
├── tests/
│   └── validation.test.ts  # Vitest unit test suite (20 tests)
├── index.html              # Complete ContactHub HTML5 template
├── style.css               # Design system stylesheets & responsive media queries
└── tsconfig.json
```

---

## 🛠️ Verification & Build Commands

```bash
# Run Vitest unit tests
npm test

# Compile TypeScript to dist/
npm run build

# Run ESLint checks
npm run lint

# Format check with Prettier
npm run format:check
```
