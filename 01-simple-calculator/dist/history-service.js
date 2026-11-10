import { StorageService } from './storage.js';
const STORAGE_KEY = 'ts_calculator_history';
const MAX_HISTORY = 50;
/**
 * Service to manage persistent calculation history using localStorage and JSON.
 */
export class HistoryService {
    constructor() {
        this.history = [];
        this.loadHistory();
    }
    /**
     * Loads history from localStorage.
     */
    loadHistory() {
        const records = StorageService.getItem(STORAGE_KEY, []);
        // Validate records structure
        this.history = Array.isArray(records)
            ? records.filter(item => item && typeof item.expression === 'string' && typeof item.result === 'string')
            : [];
        return [...this.history];
    }
    /**
     * Adds a new calculation record and persists to storage.
     */
    addRecord(expression, result) {
        const record = {
            id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            expression,
            result,
            timestamp: Date.now()
        };
        this.history.unshift(record);
        if (this.history.length > MAX_HISTORY) {
            this.history = this.history.slice(0, MAX_HISTORY);
        }
        StorageService.setItem(STORAGE_KEY, this.history);
        return record;
    }
    /**
     * Retrieves current history list.
     */
    getHistory() {
        return [...this.history];
    }
    /**
     * Clears all saved calculation history.
     */
    clearHistory() {
        this.history = [];
        StorageService.removeItem(STORAGE_KEY);
    }
}
