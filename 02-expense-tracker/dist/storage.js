/**
 * Storage Service for Expense Tracker
 *
 * Safely persists transactions, recurring rules, and financial settings in localStorage.
 * Handles missing, malformed, or corrupted data gracefully with try/catch.
 */
export class StorageService {
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
