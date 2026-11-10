import { describe, it, expect, beforeEach } from 'vitest';
import { CalculatorLogic } from '../src/calculator-logic.js';
import { CalculatorStateModel } from '../src/calculator-state.js';
import { HistoryService } from '../src/history-service.js';
import { StorageService } from '../src/storage.js';

// Mock localStorage for Node test environment
const storageMock: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string): string | null => (key in storageMock ? storageMock[key] : null),
  setItem: (key: string, value: string): void => {
    storageMock[key] = value;
  },
  removeItem: (key: string): void => {
    delete storageMock[key];
  },
  clear: (): void => {
    for (const key of Object.keys(storageMock)) {
      delete storageMock[key];
    }
  }
};

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
}

describe('CalculatorLogic (Pure Arithmetic & Validation)', () => {
  it('adds two numbers accurately', () => {
    expect(CalculatorLogic.add(5, 7)).toBe(12);
    expect(CalculatorLogic.add(-3, 8)).toBe(5);
    expect(CalculatorLogic.add(0.1, 0.2)).toBeCloseTo(0.3, 10);
  });

  it('subtracts numbers accurately', () => {
    expect(CalculatorLogic.subtract(10, 4)).toBe(6);
    expect(CalculatorLogic.subtract(4, 10)).toBe(-6);
  });

  it('multiplies numbers accurately', () => {
    expect(CalculatorLogic.multiply(6, 7)).toBe(42);
    expect(CalculatorLogic.multiply(-4, 5)).toBe(-20);
    expect(CalculatorLogic.multiply(0, 100)).toBe(0);
  });

  it('divides numbers accurately', () => {
    expect(CalculatorLogic.divide(20, 4)).toBe(5);
    expect(CalculatorLogic.divide(7, 2)).toBe(3.5);
  });

  it('throws descriptive error on division by zero', () => {
    expect(() => CalculatorLogic.divide(10, 0)).toThrow('Cannot divide by zero');
  });

  it('calculates modulo accurately and throws on modulo by zero', () => {
    expect(CalculatorLogic.modulo(10, 3)).toBe(1);
    expect(CalculatorLogic.modulo(14, 7)).toBe(0);
    expect(() => CalculatorLogic.modulo(10, 0)).toThrow('Cannot divide by zero');
  });

  it('converts values to percentages', () => {
    expect(CalculatorLogic.percentage(50)).toBe(0.5);
    expect(CalculatorLogic.percentage(100)).toBe(1);
    expect(CalculatorLogic.percentage(0)).toBe(0);
  });

  it('toggles signs for negative and positive values', () => {
    expect(CalculatorLogic.toggleSign('5')).toBe('-5');
    expect(CalculatorLogic.toggleSign('-5')).toBe('5');
    expect(CalculatorLogic.toggleSign('0')).toBe('0');
    expect(CalculatorLogic.toggleSign('')).toBe('');
    expect(CalculatorLogic.toggleSign('0.')).toBe('0.');
  });

  it('rounds floating point precision accurately', () => {
    expect(CalculatorLogic.roundToPrecision(0.1 + 0.2)).toBe(0.3);
    expect(CalculatorLogic.roundToPrecision(0.00000000012, 10)).toBe(0.0000000001);
  });

  it('validates numeric strings', () => {
    expect(CalculatorLogic.isValidNumber('123')).toBe(true);
    expect(CalculatorLogic.isValidNumber('-45.67')).toBe(true);
    expect(CalculatorLogic.isValidNumber('abc')).toBe(false);
    expect(CalculatorLogic.isValidNumber('')).toBe(false);
  });

  it('formats operators into display symbols', () => {
    expect(CalculatorLogic.formatOperator('+')).toBe('+');
    expect(CalculatorLogic.formatOperator('-')).toBe('−');
    expect(CalculatorLogic.formatOperator('*')).toBe('×');
    expect(CalculatorLogic.formatOperator('/')).toBe('÷');
    expect(CalculatorLogic.formatOperator('%')).toBe('%');
    expect(CalculatorLogic.formatOperator('')).toBe('');
  });
});

describe('CalculatorStateModel (State Machine & Chained Calculations)', () => {
  let model: CalculatorStateModel;

  beforeEach(() => {
    localStorage.clear();
    model = new CalculatorStateModel();
  });

  it('initializes with default zero state', () => {
    const state = model.getState();
    expect(state.currentInput).toBe('0');
    expect(state.previousInput).toBe('');
    expect(state.selectedOperator).toBe('');
    expect(state.memoryValue).toBe(0);
  });

  it('appends digits and limits length', () => {
    model.appendDigit('5');
    expect(model.getState().currentInput).toBe('5');
    model.appendDigit('6');
    expect(model.getState().currentInput).toBe('56');

    // Prevent duplicate leading zeroes
    model.clearAll();
    model.appendDigit('0');
    expect(model.getState().currentInput).toBe('0');
  });

  it('handles decimal points and prevents duplicates', () => {
    model.appendDecimal();
    expect(model.getState().currentInput).toBe('0.');
    model.appendDigit('5');
    model.appendDecimal(); // duplicate decimal ignored
    expect(model.getState().currentInput).toBe('0.5');
  });

  it('toggles signs on current input', () => {
    model.appendDigit('4');
    model.toggleSign();
    expect(model.getState().currentInput).toBe('-4');
    model.toggleSign();
    expect(model.getState().currentInput).toBe('4');
  });

  it('deletes digits one by one and resets to 0', () => {
    model.appendDigit('1');
    model.appendDigit('2');
    model.deleteLast();
    expect(model.getState().currentInput).toBe('1');
    model.deleteLast();
    expect(model.getState().currentInput).toBe('0');
  });

  it('performs basic two-operand calculations', () => {
    model.appendDigit('8');
    model.setOperator('+');
    model.appendDigit('4');
    const outcome = model.calculateResult();

    expect(outcome.resultToSave).toBe('12');
    expect(model.getState().currentInput).toBe('12');
  });

  it('supports continuous chained calculations (e.g. 10 + 5 * 2)', () => {
    model.appendDigit('1');
    model.appendDigit('0'); // 10
    model.setOperator('+'); // +
    model.appendDigit('5'); // 5
    const chain1 = model.setOperator('*'); // intermediate calculation: 10 + 5 = 15

    expect(chain1.resultToSave).toBe('15');
    expect(model.getState().currentInput).toBe('15');
    expect(model.getState().previousInput).toBe('15');
    expect(model.getState().selectedOperator).toBe('*');

    model.appendDigit('2'); // 2
    const finalOutcome = model.calculateResult(); // 15 * 2 = 30
    expect(finalOutcome.resultToSave).toBe('30');
    expect(model.getState().currentInput).toBe('30');
  });

  it('handles operator replacement without entering new digits', () => {
    model.appendDigit('9');
    model.setOperator('+');
    model.setOperator('*'); // switch operator before typing second operand
    expect(model.getState().selectedOperator).toBe('*');
    model.appendDigit('3');
    const outcome = model.calculateResult();
    expect(outcome.resultToSave).toBe('27');
  });

  it('handles division by zero gracefully without crashing state', () => {
    model.appendDigit('9');
    model.setOperator('/');
    model.appendDigit('0');
    const outcome = model.calculateResult();

    expect(outcome.error).toBe('Cannot divide by zero');
    expect(model.getState().isError).toBe(true);

    // Typing a new digit dismisses error cleanly
    model.appendDigit('5');
    expect(model.getState().isError).toBe(false);
    expect(model.getState().currentInput).toBe('5');
  });

  it('applies percentage calculations', () => {
    model.appendDigit('5');
    model.appendDigit('0');
    model.applyPercentage();
    expect(model.getState().currentInput).toBe('0.5');
  });

  it('reliably handles MC, MR, M+, and M− memory functions', () => {
    model.appendDigit('2');
    model.appendDigit('5');
    model.memoryAdd(); // M = 25
    expect(model.getState().memoryValue).toBe(25);

    model.clearAll();
    model.appendDigit('1');
    model.appendDigit('0');
    model.memorySubtract(); // M = 25 - 10 = 15
    expect(model.getState().memoryValue).toBe(15);

    model.clearAll();
    expect(model.getState().currentInput).toBe('0');
    model.memoryRecall();
    expect(model.getState().currentInput).toBe('15');

    model.memoryClear();
    expect(model.getState().memoryValue).toBe(0);
  });
});

describe('HistoryService and Storage Resilience', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and reloads calculation history', () => {
    const historyService = new HistoryService();
    historyService.addRecord('5 + 5 =', '10');
    historyService.addRecord('10 * 2 =', '20');

    const history = historyService.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].expression).toBe('10 * 2 =');
    expect(history[0].result).toBe('20');
  });

  it('clears history correctly', () => {
    const historyService = new HistoryService();
    historyService.addRecord('1 + 1 =', '2');
    historyService.clearHistory();
    expect(historyService.getHistory()).toHaveLength(0);
  });

  it('safely filters out corrupted records from localStorage', () => {
    localStorage.setItem(
      'ts_calculator_history',
      JSON.stringify([
        { id: '1', expression: '2 + 2 =', result: '4', timestamp: 123 },
        { broken: true }, // invalid
        null,
        'string instead of object'
      ])
    );

    const historyService = new HistoryService();
    const history = historyService.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].result).toBe('4');
  });

  it('handles malformed JSON in localStorage without throwing', () => {
    localStorage.setItem('ts_calculator_history', '{ malformed json ::');
    const historyService = new HistoryService();
    expect(historyService.getHistory()).toEqual([]);
  });

  it('StorageService falls back safely when reading corrupted storage', () => {
    localStorage.setItem('ts_calculator_memory', 'not-a-number');
    const result = StorageService.getItem<number>(
      'ts_calculator_memory',
      0,
      (val): val is number => typeof val === 'number'
    );
    expect(result).toBe(0);
  });
});
