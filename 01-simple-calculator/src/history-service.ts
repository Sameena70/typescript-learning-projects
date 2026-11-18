import { CalculationRecord, IStorageDriver } from './types.js';
import { defaultStorageDriver } from './storage.js';

const STORAGE_KEY = 'ts_calculator_history';
const MAX_HISTORY = 50;

export function isValidCalculationRecord(item: unknown): item is CalculationRecord {
  if (typeof item !== 'object' || item === null) return false;
  if ('id' in item && 'expression' in item && 'result' in item && 'timestamp' in item) {
    const c = item as { id: unknown; expression: unknown; result: unknown; timestamp: unknown };
    return (
      typeof c.id === 'string' &&
      typeof c.expression === 'string' &&
      typeof c.result === 'string' &&
      typeof c.timestamp === 'number'
    );
  }
  return false;
}

export class HistoryService {
  private history: CalculationRecord[] = [];
  private storage: IStorageDriver;

  constructor(storage: IStorageDriver = defaultStorageDriver) {
    this.storage = storage;
    this.loadHistory();
  }

  public loadHistory(): CalculationRecord[] {
    const records = this.storage.getItem<CalculationRecord[]>(
      STORAGE_KEY,
      [],
      (val: unknown): val is CalculationRecord[] => Array.isArray(val)
    );
    this.history = records.filter(isValidCalculationRecord);
    return [...this.history];
  }

  public addRecord(expression: string, result: string, mode: 'standard' | 'scientific' = 'standard'): CalculationRecord {
    const record: CalculationRecord = {
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

  public deleteRecord(id: string): void {
    this.history = this.history.filter((rec) => rec.id !== id);
    this.storage.setItem(STORAGE_KEY, this.history);
  }

  public getHistory(): CalculationRecord[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
    this.storage.removeItem(STORAGE_KEY);
  }
}
