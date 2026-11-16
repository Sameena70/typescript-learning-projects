import { CalculationRecord, IStorageDriver } from './types.js';
import { defaultStorageDriver } from './storage.js';

const STORAGE_KEY = 'ts_calculator_history';
const MAX_HISTORY = 50;

/**
 * Type guard for CalculationRecord objects loaded from storage.
 * Uses typeof and the 'in' operator to safely inspect arbitrary unknown JSON inputs.
 */
export function isValidCalculationRecord(item: unknown): item is CalculationRecord {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  // Type narrowing using 'in' operator
  if ('id' in item && 'expression' in item && 'result' in item && 'timestamp' in item) {
    const candidate = item as {
      id: unknown;
      expression: unknown;
      result: unknown;
      timestamp: unknown;
    };
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.expression === 'string' &&
      typeof candidate.result === 'string' &&
      typeof candidate.timestamp === 'number'
    );
  }

  return false;
}

/**
 * Service to manage persistent calculation history using an injected storage driver.
 */
export class HistoryService {
  private history: CalculationRecord[] = [];
  private storage: IStorageDriver;

  /**
   * Accepts an optional IStorageDriver to support Dependency Injection.
   * Defaults to defaultStorageDriver if not provided.
   */
  constructor(storage: IStorageDriver = defaultStorageDriver) {
    this.storage = storage;
    this.loadHistory();
  }

  /**
   * Loads history from storage with runtime filtering and generic type guards.
   */
  public loadHistory(): CalculationRecord[] {
    const records = this.storage.getItem<CalculationRecord[]>(
      STORAGE_KEY,
      [],
      (val: unknown): val is CalculationRecord[] => Array.isArray(val)
    );

    this.history = records.filter(isValidCalculationRecord);
    return [...this.history];
  }

  /**
   * Adds a new calculation record and persists to storage.
   */
  public addRecord(expression: string, result: string): CalculationRecord {
    const record: CalculationRecord = {
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
  public getHistory(): CalculationRecord[] {
    return [...this.history];
  }

  /**
   * Clears all saved calculation history.
   */
  public clearHistory(): void {
    this.history = [];
    this.storage.removeItem(STORAGE_KEY);
  }
}
