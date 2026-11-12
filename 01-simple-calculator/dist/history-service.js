import { StorageService } from './storage.js';
const STORAGE_KEY = 'ts_calculator_history';
const MAX_HISTORY = 50;
/**
 * Type guard for CalculationRecord objects loaded from storage.
 * Uses typeof and the 'in' operator to safely inspect arbitrary unknown JSON inputs.
 */
function isValidRecord(item) {
    if (typeof item !== 'object' || item === null) {
        return false;
    }
    // Type narrowing using 'in' operator
    if ('id' in item && 'expression' in item && 'result' in item && 'timestamp' in item) {
        const candidate = item;
        return (typeof candidate.id === 'string' &&
            typeof candidate.expression === 'string' &&
            typeof candidate.result === 'string' &&
            typeof candidate.timestamp === 'number');
    }
    return false;
}
/**
 * Service to manage persistent calculation history using localStorage and JSON.
 */
export class HistoryService {
    constructor() {
        this.history = [];
        this.loadHistory();
    }
    /**
     * Loads history from localStorage with strict runtime filtering and generic type guards.
     */
    loadHistory() {
        const records = StorageService.getItem(STORAGE_KEY, [], (val) => Array.isArray(val));
        this.history = records.filter(isValidRecord);
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
