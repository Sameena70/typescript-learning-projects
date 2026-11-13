/**
 * Storage utility for game statistics and history
 * with runtime validation and schema protection using generics `<T>`.
 */
export class GameStorage {
    static getItem(key, fallback, validator) {
        try {
            const data = localStorage.getItem(key);
            if (data === null)
                return fallback;
            const parsed = JSON.parse(data);
            if (validator) {
                return validator(parsed) ? parsed : fallback;
            }
            return parsed;
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
    static clear() {
        try {
            localStorage.clear();
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('[GameStorage] Failed to clear storage:', error.message);
            }
        }
    }
}
