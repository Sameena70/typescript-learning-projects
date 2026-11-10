import { CalculationRecord } from './types.js';
import { StorageService } from './storage.js';

const STORAGE_KEY = 'ts_calculator_history';
const MAX_HISTORY = 50;

/**
 * Service to manage persistent calculation history using localStorage and JSON.
 */
export class HistoryService {
  private history: CalculationRecord[] = [];

  constructor() {
    this.loadHistory();
  }

  /**
   * Loads history from localStorage.
   */
  public loadHistory(): CalculationRecord[] {
    const records = StorageService.getItem<CalculationRecord[]>(STORAGE_KEY, []);
    // Validate records structure
    this.history = Array.isArray(records)
      ? records.filter(item => item && typeof item.expression === 'string' && typeof item.result === 'string')
      : [];
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

    StorageService.setItem(STORAGE_KEY, this.history);
    return record;
  }

  /**
   * Retrieves current history list.
   */
  public getHistory(): CalculationRecord[] {
    return [...this.history];
  }

  /**
   * Clears all saved calculation history.
   */
  public clearHistory(): void {
    this.history = [];
    StorageService.removeItem(STORAGE_KEY);
  }
}

