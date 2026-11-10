/**
 * Calculator Type Definitions
 * 
 * Defines the core types, interfaces, and unions used across
 * the calculator application modules.
 */

export type Operator = '+' | '-' | '*' | '/' | '%';

export interface CalculationRecord {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalculatorState {
  currentInput: string;
  previousInput: string;
  selectedOperator: Operator | '';
  shouldResetDisplay: boolean;
  memoryValue: number;
}

