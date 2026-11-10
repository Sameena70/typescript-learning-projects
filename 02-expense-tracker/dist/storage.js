/**
 * Storage Service for Expense Tracker
 *
 * Safely persists expenses and budget configurations in browser localStorage.
 * Handles missing, malformed, or corrupted data gracefully with try/catch.
 */
export class StorageService {
    static getItem(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) {
                return fallback;
            }
            return JSON.parse(raw);
        }
        catch (error) {
            if (error instanceof Error) {
                console.warn(`[StorageService] Failed to read "${key}":`, error.message);
            }
            else {
                console.warn(`[StorageService] Corrupted storage for key: "${key}"`);
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
