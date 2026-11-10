/**
 * Storage utility for game statistics and history
 */
export class GameStorage {
    static getItem(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            if (data === null)
                return fallback;
            return JSON.parse(data);
        }
        catch (error) {
            if (error instanceof Error) {
                console.warn(`[GameStorage] Failed to read "${key}":`, error.message);
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
                console.error(`[GameStorage] Failed to save "${key}":`, error.message);
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
                console.error(`[GameStorage] Failed to remove "${key}":`, error.message);
            }
        }
    }
}
