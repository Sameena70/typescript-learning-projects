import { StorageValidator } from './types.js';

/**
 * Storage utility for game statistics and history
 * with runtime validation and schema protection using generics `<T>`.
 */
export class GameStorage {
  public static getItem<T>(key: string, fallback: T, validator?: StorageValidator<T>): T {
    try {
      const data = localStorage.getItem(key);
      if (data === null) return fallback;
      const parsed: unknown = JSON.parse(data);
      if (validator) {
        return validator(parsed) ? parsed : fallback;
      }
      return parsed as T;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.warn(`[GameStorage] Failed to read "${key}":`, error.message);
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
        console.error(`[GameStorage] Failed to save "${key}":`, error.message);
      }
      return false;
    }
  }

  public static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`[GameStorage] Failed to remove "${key}":`, error.message);
      }
    }
  }

  public static clear(): void {
    try {
      localStorage.clear();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[GameStorage] Failed to clear storage:', error.message);
      }
    }
  }
}
