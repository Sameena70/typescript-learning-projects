import { StorageValidator } from './types.js';

/**
 * Storage Service for Expense Tracker
 *
 * Safely persists transactions, recurring rules, and financial settings in localStorage.
 * Handles missing, malformed, or corrupted data gracefully using generic types `<T>`
 * and runtime validator predicates.
 */
export class StorageService {
  /**
   * Safely retrieves and parses JSON items from localStorage with type-safe validation.
   */
  public static getItem<T>(key: string, fallback: T, validator?: StorageValidator<T>): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return fallback;
      }
      const parsed: unknown = JSON.parse(raw);
      if (validator) {
        return validator(parsed) ? parsed : fallback;
      }
      return parsed as T;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.warn(`[StorageService] Failed to read "${key}":`, error.message);
      }
      return fallback;
    }
  }

  /**
   * Serializes and writes data to localStorage safely.
   */
  public static setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`[StorageService] Failed to persist "${key}":`, error.message);
      }
      return false;
    }
  }

  /**
   * Removes a specific item from localStorage.
   */
  public static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`[StorageService] Failed to remove "${key}":`, error.message);
      }
    }
  }

  /**
   * Clears all storage keys safely.
   */
  public static clear(): void {
    try {
      localStorage.clear();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[StorageService] Failed to clear storage:', error.message);
      }
    }
  }
}
