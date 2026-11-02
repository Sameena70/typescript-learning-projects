/**
 * types.ts
 * 
 * Defines all TypeScript types, type aliases, and interfaces used
 * throughout the Contact Manager application.
 */

// 1. Type Aliases with Union Types
// Using union types guarantees that variables can only take allowed string values.
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

// 2. Main Contact Interface
// Defines the complete shape of a Contact record stored in our application state.
export interface Contact {
  id: string;                      // Unique ID generated for each contact
  fullName: string;                // Contact's full name (required)
  phoneNumber: string;             // Contact's phone number (required)
  email?: string;                  // Optional email address
  age?: number;                    // Optional age
  company?: string;                // Optional company name
  jobTitle?: string;               // Optional job title
  address?: string;                // Optional physical address
  category: ContactCategory;       // Category classification
  status: ContactStatus;           // Status: "active" or "inactive"
  isFavourite: boolean;            // Favourite toggle
  notes?: string;                  // Optional notes
  createdAt: string;               // ISO 8601 date string when created
  updatedAt?: string;              // ISO 8601 date string when last updated
}

// 3. Form Input Data Interface
// Captures values entered into the Add/Edit contact form before full Contact creation.
export interface ContactFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  age: string;                     // Raw string from form input, parsed to number later
  company: string;
  jobTitle: string;
  address: string;
  category: ContactCategory;
  status: ContactStatus;
  isFavourite: boolean;
  notes: string;
}

// 4. Form Validation Result Interface
// Structure used to pass back whether an input passes validation and any error messages.
export interface ValidationResult {
  isValid: boolean;
  errors: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    age?: string;
    general?: string;
  };
}

// 5. Dashboard Statistics Interface
// Holds calculated metrics computed using array methods.
export interface ContactStatistics {
  total: number;
  active: number;
  inactive: number;
  favourites: number;
  recentlyAdded: number;
  categoryCounts: {
    Family: number;
    Friends: number;
    Work: number;
    Clients: number;
    Business: number;
    Other: number;
  };
}

// 6. Filter & Search Options Interface
// Captures active search keyword, category, status, favourite, and sorting criteria.
export interface FilterOptions {
  searchQuery: string;
  category: string;                // "all" or specific ContactCategory
  status: string;                  // "all", "active", or "inactive"
  favouritesOnly: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
}

// 7. Toast Notification Types
export type ToastType = "success" | "error" | "warning" | "info";

