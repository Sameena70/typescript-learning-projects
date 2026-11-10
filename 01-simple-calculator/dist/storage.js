/**
 * Calculator Storage Module
 *
 * Provides safe localStorage reading, writing, and quota management.
 */
export class StorageService {
    /**
     * Safely reads and parses data from localStorage with schema validation.
     */
    static getItem(key, fallback, validator) {
        try {
            const rawData = localStorage.getItem(key);
            if (rawData === null) {
                return fallback;
            }
            const parsed = JSON.parse(rawData);
            if (validator) {
                return validator(parsed) ? parsed : fallback;
            }
            return parsed;
        }
        catch (error) {
            if (error instanceof Error) {
                console.warn(`[StorageService] Failed to read "${key}":`, error.message);
            }
            return fallback;
        }
    }
    /**
     * Safely serializes and saves data to localStorage using JSON.stringify().
     */
    static setItem(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`[StorageService] Failed to save "${key}":`, error.message);
            }
            return false;
        }
    }
    /**
     * Removes an item from localStorage.
     */
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`[StorageService] Failed to remove "${key}":`, error.message);
            }
        }
    }
}
