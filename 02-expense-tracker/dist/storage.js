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
    static getItem(key, fallback, validator) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) {
                return fallback;
            }
            const parsed = JSON.parse(raw);
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
     * Serializes and writes data to localStorage safely.
     */
    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`[StorageService] Failed to persist "${key}":`, error.message);
            }
            return false;
        }
    }
    /**
     * Removes a specific item from localStorage.
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
    /**
     * Clears all storage keys safely.
     */
    static clear() {
        try {
            localStorage.clear();
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('[StorageService] Failed to clear storage:', error.message);
            }
        }
    }
}
