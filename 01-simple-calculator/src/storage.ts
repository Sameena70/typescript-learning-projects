/**
 * Calculator Storage Module
 * 
 * Demonstrates safe JSON storage with try/catch and fallback error handling.
 */

export class StorageService {
  /**
   * Safely reads and parses data from localStorage.
   * If parsing fails or storage is inaccessible, returns fallback.
   */
  static getItem<T>(key: string, fallback: T): T {
    try {
      const rawData = localStorage.getItem(key);
      if (rawData === null) {
        return fallback;
      }
      return JSON.parse(rawData) as T;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.warn(`[StorageService] Failed to read "${key}":`, error.message);
      } else {
        console.warn(`[StorageService] Unknown error reading "${key}"`);
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
}

