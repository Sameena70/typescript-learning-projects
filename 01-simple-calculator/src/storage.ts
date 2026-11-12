import { StorageValidator } from './types.js';

/**
 * Calculator Storage Module
 *
 * Provides safe localStorage reading, writing, and quota management.
 * Leverages TypeScript generics `<T>`, generic type guards, and error narrowing.
 */
export class StorageService {
  /**
   * Safely reads and parses data from localStorage with type guard validation.
   * Uses unknown for parsed JSON and type narrows via validator predicate.
   */
  static getItem<T>(key: string, fallback: T, validator?: StorageValidator<T>): T {
    try {
      const rawData = localStorage.getItem(key);
      if (rawData === null) {
        return fallback;
      }
      const parsed: unknown = JSON.parse(rawData);
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
   * Safely serializes and saves data to localStorage using JSON.stringify().
   */
  static setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`[StorageService] Failed to save "${key}":`, error.message);
      }
      return false;
    }
  }

  /**
   * Removes an item from localStorage.
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`[StorageService] Failed to remove "${key}":`, error.message);
      }
    }
  }

  /**
   * Clears all calculator data from localStorage.
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[StorageService] Failed to clear storage:', error.message);
      }
    }
  }
}
