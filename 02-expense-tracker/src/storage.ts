/**
 * Storage Service for Expense Tracker
 * 
 * Safely persists expenses and budget configurations in browser localStorage.
 * Handles missing, malformed, or corrupted data gracefully with try/catch.
 */

export class StorageService {
  public static getItem<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.warn(`[StorageService] Failed to read "${key}":`, error.message);
      } else {
        console.warn(`[StorageService] Corrupted storage for key: "${key}"`);
      }
      return fallback;
    }
  }

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

  public static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`[StorageService] Failed to remove "${key}":`, error.message);
      }
    }
  }
}

