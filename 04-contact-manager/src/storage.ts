/**
 * storage.ts
 *
 * Safe persistence, schema migration, and retrieval of contacts in browser localStorage.
 * Handles corrupted, incomplete, and legacy stored data using type narrowing and generics.
 * Implements IContactRepository and IContactStorageDriver for Dependency Injection.
 */

import {
  Contact,
  ContactCategory,
  ContactStatus,
  IContactStorageDriver,
  IContactRepository
} from './types.js';
import { VALID_CATEGORIES, isContactCategory } from './generic-utils.js';
import { SEED_CONTACTS } from './data/seed-contacts.js';

export { VALID_CATEGORIES, SEED_CONTACTS };

export const STORAGE_KEY = 'ts_contact_manager_contacts_v1';
export const LEGACY_STORAGE_KEY = 'ts_contact_manager_contacts';

/**
 * Type guard verifying if an arbitrary unknown value satisfies the Contact structure.
 * Uses `in` operator and `typeof` checks to avoid blind type casts.
 */
export function isContact(value: unknown): value is Contact {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (
    'id' in value &&
    'fullName' in value &&
    'phoneNumber' in value &&
    'category' in value &&
    'status' in value &&
    'isFavourite' in value &&
    'createdAt' in value
  ) {
    const candidate = value as Record<string, unknown>;
    return (
      typeof candidate.id === 'string' &&
      candidate.id.length > 0 &&
      typeof candidate.fullName === 'string' &&
      candidate.fullName.trim().length >= 2 &&
      typeof candidate.phoneNumber === 'string' &&
      candidate.phoneNumber.trim().length >= 5 &&
      isContactCategory(candidate.category) &&
      (candidate.status === 'active' || candidate.status === 'inactive') &&
      typeof candidate.isFavourite === 'boolean' &&
      typeof candidate.createdAt === 'string'
    );
  }

  return false;
}

/**
 * Default browser LocalStorage driver implementation with defensive try-catch guards.
 */
export class LocalStorageDriver implements IContactStorageDriver {
  public getItem(key: string): string | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.warn(`[LocalStorageDriver] Error reading key "${key}":`, error.message);
      }
      return null;
    }
  }

  public setItem(key: string, value: string): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, value);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`[LocalStorageDriver] Error writing key "${key}":`, error.message);
      }
    }
  }

  public removeItem(key: string): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(key);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`[LocalStorageDriver] Error removing key "${key}":`, error.message);
      }
    }
  }

  public clear(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.clear();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[LocalStorageDriver] Error clearing storage:', error.message);
      }
    }
  }
}

export const defaultContactStorageDriver: IContactStorageDriver = new LocalStorageDriver();

/**
 * Sanitizes and migrates a raw or legacy contact record to ensure complete schema compliance.
 */
export function sanitizeContactRecord(raw: unknown, index = 0): Contact | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  // FullName is mandatory and must be a string of at least 2 characters
  const rawName =
    'fullName' in obj && typeof obj.fullName === 'string'
      ? obj.fullName.trim()
      : 'name' in obj && typeof obj.name === 'string'
        ? obj.name.trim()
        : '';
  if (rawName.length < 2) {
    return null;
  }

  // PhoneNumber is mandatory
  const rawPhone =
    'phoneNumber' in obj && typeof obj.phoneNumber === 'string'
      ? obj.phoneNumber.trim()
      : 'phone' in obj && typeof obj.phone === 'string'
        ? obj.phone.trim()
        : '';
  if (rawPhone.length < 5) {
    return null;
  }

  // ID sanitization (guarantee unique non-empty ID)
  const id =
    'id' in obj && typeof obj.id === 'string' && obj.id.trim().length > 0
      ? obj.id.trim()
      : `ct_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;

  // Category fallback
  const category: ContactCategory =
    'category' in obj && isContactCategory(obj.category) ? obj.category : 'Other';

  // Status fallback
  const status: ContactStatus =
    'status' in obj && obj.status === 'inactive' ? 'inactive' : 'active';

  // Tags sanitization
  let tags: string[] | undefined = undefined;
  if ('tags' in obj) {
    if (Array.isArray(obj.tags)) {
      tags = obj.tags
        .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
        .map((t) => t.trim());
    } else if (typeof obj.tags === 'string' && obj.tags.trim().length > 0) {
      tags = obj.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }
  }

  return {
    id,
    fullName: rawName,
    phoneNumber: rawPhone,
    email:
      'email' in obj && typeof obj.email === 'string' && obj.email.trim().length > 0
        ? obj.email.trim()
        : undefined,
    age:
      'age' in obj && typeof obj.age === 'number' && obj.age > 0 && obj.age < 130
        ? obj.age
        : undefined,
    company:
      'company' in obj && typeof obj.company === 'string' && obj.company.trim().length > 0
        ? obj.company.trim()
        : undefined,
    jobTitle:
      'jobTitle' in obj && typeof obj.jobTitle === 'string' && obj.jobTitle.trim().length > 0
        ? obj.jobTitle.trim()
        : undefined,
    address:
      'address' in obj && typeof obj.address === 'string' && obj.address.trim().length > 0
        ? obj.address.trim()
        : undefined,
    category,
    status,
    isFavourite: 'isFavourite' in obj ? Boolean(obj.isFavourite) : false,
    notes:
      'notes' in obj && typeof obj.notes === 'string' && obj.notes.trim().length > 0
        ? obj.notes.trim()
        : undefined,
    tags: tags && tags.length > 0 ? tags : undefined,
    birthday:
      'birthday' in obj && typeof obj.birthday === 'string' ? obj.birthday.trim() : undefined,
    reminderDate:
      'reminderDate' in obj && typeof obj.reminderDate === 'string'
        ? obj.reminderDate.trim()
        : undefined,
    activities:
      'activities' in obj && Array.isArray(obj.activities)
        ? (obj.activities as Contact['activities'])
        : undefined,
    createdAt:
      'createdAt' in obj && typeof obj.createdAt === 'string' && obj.createdAt
        ? obj.createdAt
        : new Date().toISOString(),
    updatedAt: 'updatedAt' in obj && typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined
  };
}

/**
 * ContactRepository implementing IContactRepository.
 * Interacts with an IContactStorageDriver for persistence, schema migrations, and deduplication.
 */
export class ContactRepository implements IContactRepository {
  private driver: IContactStorageDriver;

  constructor(driver: IContactStorageDriver = defaultContactStorageDriver) {
    this.driver = driver;
  }

  public loadContacts(): Contact[] {
    try {
      let rawData = this.driver.getItem(STORAGE_KEY);
      // Migration: check legacy storage key if primary is empty
      if (!rawData) {
        const legacyData = this.driver.getItem(LEGACY_STORAGE_KEY);
        if (legacyData) {
          rawData = legacyData;
          this.driver.setItem(STORAGE_KEY, legacyData);
        }
      }

      if (!rawData) {
        this.saveContacts(SEED_CONTACTS);
        return SEED_CONTACTS.map((c) => ({ ...c }));
      }

      const parsed: unknown = JSON.parse(rawData);
      if (!Array.isArray(parsed)) {
        console.warn('Storage data is not an array, falling back to seed contacts.');
        return SEED_CONTACTS.map((c) => ({ ...c }));
      }

      const seenIds = new Set<string>();
      const validContacts: Contact[] = [];

      parsed.forEach((item: unknown, index: number) => {
        const sanitized = sanitizeContactRecord(item, index);
        if (sanitized) {
          if (seenIds.has(sanitized.id)) {
            sanitized.id = `ct_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
          }
          seenIds.add(sanitized.id);
          validContacts.push(sanitized);
        }
      });

      return validContacts.length > 0 ? validContacts : SEED_CONTACTS.map((c) => ({ ...c }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to load contacts from storage driver:', error.message);
      }
      return SEED_CONTACTS.map((c) => ({ ...c }));
    }
  }

  public saveContacts(contacts: readonly Contact[]): boolean {
    try {
      const serialized = JSON.stringify(contacts);
      this.driver.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to save contacts to storage driver:', error.message);
      }
      return false;
    }
  }

  public clearContacts(): void {
    try {
      this.driver.removeItem(STORAGE_KEY);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to clear contacts from storage driver:', error.message);
      }
    }
  }
}

export const defaultContactRepository: IContactRepository = new ContactRepository();

/**
 * Backward compatibility facade functions.
 */
export function loadSavedContacts(): Contact[] {
  return defaultContactRepository.loadContacts();
}

export function saveContactsToStorage(contacts: Contact[]): boolean {
  return defaultContactRepository.saveContacts(contacts);
}

export function clearStoredContacts(): void {
  defaultContactRepository.clearContacts();
}
