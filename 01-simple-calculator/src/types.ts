/**
 * Calculator Type Definitions
 *
 * Defines domain-specific types, discriminated unions, interfaces,
 * and generic storage models for the Simple Calculator application.
 */

/**
 * Valid arithmetic operator literal types.
 */
export type Operator = '+' | '-' | '*' | '/' | '%';

/**
 * Calculation Record persisted in history storage.
 */
export interface CalculationRecord {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

/**
 * Comprehensive Calculator State.
 * Replaced the empty-string sentinel with `Operator | null` for type-safe operator representation.
 */
export interface CalculatorState {
  currentInput: string;
  previousInput: string;
  selectedOperator: Operator | null;
  shouldResetDisplay: boolean;
  memoryValue: number;
  lastExpression: string;
  isError: boolean;
}

/**
 * Discriminated Union for Calculation Outcomes.
 * Eliminates conflicting states (e.g. error and result simultaneously populated or empty).
 */
export type CalculationOutcome =
  | {
      status: 'success';
      expressionToSave: string;
      resultToSave: string;
      /** Backward compatibility helper for legacy code/tests expecting resultToSave directly */
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

/**
 * Storage item validator predicate function type.
 */
export type StorageValidator<T> = (val: unknown) => val is T;

/**
 * Generic Storage Driver interface (DIP - Dependency Inversion Principle).
 * Decouples state and service models from concrete browser localStorage APIs.
 */
export interface IStorageDriver {
  getItem<T>(key: string, fallback: T, validator?: StorageValidator<T>): T;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): void;
  clear(): void;
}
