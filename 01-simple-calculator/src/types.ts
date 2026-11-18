export type Operator = '+' | '-' | '*' | '/' | '%';
export type AngleMode = 'DEG' | 'RAD';
export type ActiveTab = 'standard' | 'scientific' | 'history' | 'settings';
export type NumberFormatPreference = 'standard' | 'locale' | 'scientific';

export type StorageValidator<T> = (val: unknown) => val is T;

export interface CalculatorSettings {
  defaultAngleMode: AngleMode;
  precision: number;
  numberFormat: NumberFormatPreference;
}

export interface CalculationRecord {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  mode?: 'standard' | 'scientific';
}

export interface CalculatorState {
  currentInput: string;
  previousInput: string;
  selectedOperator: Operator | null;
  shouldResetDisplay: boolean;
  memoryValue: number;
  lastExpression: string;
  isError: boolean;
  activeTab: ActiveTab;
  angleMode: AngleMode;
  settings: CalculatorSettings;
  lastAnswer: string;
}

export type CalculationOutcome =
  | {
      status: 'success';
      expressionToSave: string;
      resultToSave: string;
      error?: undefined;
    }
  | {
      status: 'error';
      error: string;
      expressionToSave?: undefined;
      resultToSave?: undefined;
    }
  | {
      status: 'idle';
      error?: undefined;
      expressionToSave?: undefined;
      resultToSave?: undefined;
    };

export interface IStorageDriver {
  getItem<T>(key: string, fallback: T, validator?: StorageValidator<T>): T;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): void;
  clear(): void;
}
