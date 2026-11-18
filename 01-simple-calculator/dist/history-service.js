import { defaultStorageDriver } from './storage.js';
const STORAGE_KEY = 'ts_calculator_history';
const MAX_HISTORY = 50;
export function isValidCalculationRecord(item) {
    if (typeof item !== 'object' || item === null)
        return false;
    if ('id' in item && 'expression' in item && 'result' in item && 'timestamp' in item) {
        const c = item;
        return (typeof c.id === 'string' &&
            typeof c.expression === 'string' &&
            typeof c.result === 'string' &&
            typeof c.timestamp === 'number');
    }
    return false;
}
export class HistoryService {
    constructor(storage = defaultStorageDriver) {
        this.history = [];
        this.storage = storage;
        this.loadHistory();
    }
    loadHistory() {
        const records = this.storage.getItem(STORAGE_KEY, [], (val) => Array.isArray(val));
        this.history = records.filter(isValidCalculationRecord);
        return [...this.history];
    }
    addRecord(expression, result, mode = 'standard') {
        const record = {
            id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            expression,
            result,
            timestamp: Date.now(),
            mode
        };
        this.history.unshift(record);
        if (this.history.length > MAX_HISTORY) {
            this.history = this.history.slice(0, MAX_HISTORY);
        }
        this.storage.setItem(STORAGE_KEY, this.history);
        return record;
    }
    deleteRecord(id) {
        this.history = this.history.filter((rec) => rec.id !== id);
        this.storage.setItem(STORAGE_KEY, this.history);
    }
    getHistory() {
        return [...this.history];
    }
    clearHistory() {
        this.history = [];
        this.storage.removeItem(STORAGE_KEY);
    }
}
