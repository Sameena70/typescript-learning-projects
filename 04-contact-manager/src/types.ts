/**
 * types.ts
 *
 * Defines domain-specific types, intersection types, discriminated unions,
 * and generic utilities for the Contact Manager application.
 */

export type ContactStatus = 'active' | 'inactive';

export type ContactCategory = 'Family' | 'Friends' | 'Work' | 'Clients' | 'Business' | 'Other';

export type SortField = 'name' | 'createdAt' | 'company';
export type SortOrder = 'asc' | 'desc';

export type ActivityType = 'call' | 'email' | 'meeting' | 'note';

/**
 * Discriminated Union for Contact Activities.
 * Allows type-safe variation between communication, meetings, and notes.
 */
export type ContactActivity =
  | {
      id: string;
      contactId: string;
      type: 'call';
      date: string;
      notes: string;
      durationMinutes?: number;
    }
  | {
      id: string;
      contactId: string;
      type: 'email';
      date: string;
      notes: string;
      subject?: string;
    }
  | {
      id: string;
      contactId: string;
      type: 'meeting';
      date: string;
      notes: string;
      location?: string;
    }
  | {
      id: string;
      contactId: string;
      type: 'note';
      date: string;
      notes: string;
    };

/**
 * 1. Base mandatory identity information.
 */
export interface BaseContact {
  id: string;
  fullName: string;
  phoneNumber: string;
}

/**
 * 2. Optional contact profile information.
 */
export interface OptionalContactDetails {
  email?: string;
  age?: number;
  company?: string;
  jobTitle?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  birthday?: string; // YYYY-MM-DD
  reminderDate?: string; // YYYY-MM-DD
}

/**
 * 3. Categorization and status preferences.
 */
export interface ContactPreferences {
  category: ContactCategory;
  status: ContactStatus;
  isFavourite: boolean;
}

/**
 * 4. Audit timestamps and activity tracking.
 */
export interface ContactAuditInfo {
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
  activities?: ContactActivity[];
}

/**
 * Modular Contact entity composed using TypeScript Intersection Types.
 */
export type Contact = BaseContact & OptionalContactDetails & ContactPreferences & ContactAuditInfo;

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
  tags: string; // Comma-separated input
  birthday: string;
  reminderDate: string;
}

/**
 * Generic Validation Error record constrained to form keys.
 */
export type ValidationErrors<T> = Partial<Record<keyof T | 'general', string>>;

export interface ValidationResult<T = ContactFormData> {
  isValid: boolean;
  errors: ValidationErrors<T>;
}

export interface ContactStatistics {
  total: number;
  active: number;
  inactive: number;
  favourites: number;
  recentlyAdded: number;
  withReminders: number;
  categoryCounts: Record<ContactCategory, number>;
}

/**
 * Strongly typed filter options.
 */
export interface FilterOptions {
  searchQuery: string;
  category: 'all' | ContactCategory | string;
  status: 'all' | ContactStatus | string;
  favouritesOnly: boolean;
  tag?: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ImportSummary {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}

/**
 * Generic Storage Validator predicate function.
 */
export type StorageValidator<T> = (val: unknown) => val is T;
