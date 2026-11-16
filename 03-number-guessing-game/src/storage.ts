import { StorageValidator, IGameStorageDriver } from './types.js';

/**
 * Storage utility for game statistics and history
 * with runtime validation and schema protection using generics `<T>`.
 * Implements IGameStorageDriver for Dependency Injection.
 */
export class GameStorage implements IGameStorageDriver {
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

  // Instance methods implementing IGameStorageDriver
  public getItem<T>(key: string, fallback: T, validator?: StorageValidator<T>): T {
    return GameStorage.getItem(key, fallback, validator);
  }

  public setItem<T>(key: string, value: T): boolean {
    return GameStorage.setItem(key, value);
  }

  public removeItem(key: string): void {
    GameStorage.removeItem(key);
  }

  public clear(): void {
    GameStorage.clear();
  }
}

/**
 * Default singleton storage driver for the Number Guessing Game.
 */
export const defaultGameStorageDriver: IGameStorageDriver = new GameStorage();
