/**
 * types.ts
 * 
 * Defines all TypeScript types, type aliases, and interfaces used
 * throughout the Contact Manager application.
 */

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

/**
 * Main Contact Interface with tags, birthday, and reminder support.
 */
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
  tags?: string[];             // Contact groups / labels
  birthday?: string;           // Optional birthday (YYYY-MM-DD)
  reminderDate?: string;       // Follow-up reminder date (YYYY-MM-DD)
  createdAt: string;           // ISO 8601 string
  updatedAt?: string;          // ISO 8601 string
}

export interface ContactFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  age: string;
  company: string;
  jobTitle: string;
  address: string;
  category: ContactCategory;
  status: ContactStatus;
  isFavourite: boolean;
  notes: string;
  tags: string;                // Comma-separated input
  birthday: string;
  reminderDate: string;
}

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

export interface FilterOptions {
  searchQuery: string;
  category: string;
  status: string;
  favouritesOnly: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface ImportSummary {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}
