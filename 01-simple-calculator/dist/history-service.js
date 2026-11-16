import { defaultStorageDriver } from './storage.js';
const STORAGE_KEY = 'ts_calculator_history';
const MAX_HISTORY = 50;
/**
 * Type guard for CalculationRecord objects loaded from storage.
 * Uses typeof and the 'in' operator to safely inspect arbitrary unknown JSON inputs.
 */
export function isValidCalculationRecord(item) {
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
 * Service to manage persistent calculation history using an injected storage driver.
 */
export class HistoryService {
    /**
     * Accepts an optional IStorageDriver to support Dependency Injection.
     * Defaults to defaultStorageDriver if not provided.
     */
    constructor(storage = defaultStorageDriver) {
        this.history = [];
        this.storage = storage;
        this.loadHistory();
    }
    /**
     * Loads history from storage with runtime filtering and generic type guards.
     */
    loadHistory() {
        const records = this.storage.getItem(STORAGE_KEY, [], (val) => Array.isArray(val));
        this.history = records.filter(isValidCalculationRecord);
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
        this.storage.setItem(STORAGE_KEY, this.history);
        return record;
    }
    /**
     * Retrieves a copy of the current history list (defensive copy).
     */
    getHistory() {
        return [...this.history];
    }
    /**
     * Clears all saved calculation history.
     */
    clearHistory() {
        this.history = [];
        this.storage.removeItem(STORAGE_KEY);
    }
}
