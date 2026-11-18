import { describe, it, expect, beforeEach } from 'vitest';
import {
  factorial,
  safeSin,
  safeCos,
  safeTan,
  safeAsin,
  safeAcos,
  safeAtan,
  safeLog10,
  safeLn,
  safeSqrt,
  safePower,
  safeReciprocal
} from '../src/scientific-logic.js';
import { evaluateExpression } from '../src/expression-parser.js';
import { CalculatorStateModel } from '../src/calculator-state.js';
import { HistoryService } from '../src/history-service.js';

describe('Scientific Calculator Pure Math Functions', () => {
  it('calculates factorials correctly and throws on invalid inputs', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
    expect(factorial(5)).toBe(120);
    expect(() => factorial(-1)).toThrow();
    expect(() => factorial(3.5)).toThrow();
  });

  it('calculates trigonometric functions in DEG accurately', () => {
    expect(safeSin(30, 'DEG')).toBeCloseTo(0.5, 6);
    expect(safeCos(60, 'DEG')).toBeCloseTo(0.5, 6);
    expect(safeTan(45, 'DEG')).toBeCloseTo(1, 6);
  });

  it('calculates inverse trigonometric functions accurately', () => {
    expect(safeAsin(0.5, 'DEG')).toBeCloseTo(30, 6);
    expect(safeAcos(0.5, 'DEG')).toBeCloseTo(60, 6);
    expect(safeAtan(1, 'DEG')).toBeCloseTo(45, 6);
  });

  it('calculates logarithms correctly', () => {
    expect(safeLog10(100)).toBe(2);
    expect(safeLn(Math.E)).toBeCloseTo(1, 6);
    expect(() => safeLog10(0)).toThrow();
    expect(() => safeLn(-5)).toThrow();
  });

  it('calculates powers and roots correctly', () => {
    expect(safePower(2, 2)).toBe(4);
    expect(safePower(2, 3)).toBe(8);
    expect(safePower(2, 4)).toBe(16);
    expect(safeSqrt(81)).toBe(9);
    expect(safeSqrt(144)).toBe(12);
    expect(safeReciprocal(4)).toBe(0.25);
    expect(() => safeSqrt(-4)).toThrow();
    expect(() => safeReciprocal(0)).toThrow('Cannot divide by zero');
  });
});

describe('Scientific Expression Parser', () => {
  it('evaluates basic and chained arithmetic with operator precedence', () => {
    expect(evaluateExpression('10 + 5')).toBe(15);
    expect(evaluateExpression('10 - 5')).toBe(5);
    expect(evaluateExpression('10 * 5')).toBe(50);
    expect(evaluateExpression('10 / 5')).toBe(2);
    expect(evaluateExpression('2 + 3 * 4')).toBe(14);
    expect(evaluateExpression('(2 + 3) * 4')).toBe(20);
  });

  it('evaluates scientific expressions', () => {
    expect(evaluateExpression('sqrt(144)')).toBe(12);
    expect(evaluateExpression('log(100)')).toBe(2);
    expect(evaluateExpression('sin(30)', 'DEG')).toBeCloseTo(0.5, 6);
    expect(evaluateExpression('fact(5)')).toBe(120);
  });

  it('handles division by zero in expressions', () => {
    expect(() => evaluateExpression('10 / 0')).toThrow('Cannot divide by zero');
  });
});

describe('History System Tests', () => {
  let historyService: HistoryService;

  beforeEach(() => {
    historyService = new HistoryService();
    historyService.clearHistory();
  });

  it('creates and retrieves history entries immediately', () => {
    expect(historyService.getHistory().length).toBe(0);
    const rec = historyService.addRecord('25 * 4', '100', 'standard');
    expect(rec.result).toBe('100');
    expect(historyService.getHistory().length).toBe(1);
    expect(historyService.getHistory()[0].expression).toBe('25 * 4');
  });

  it('deletes individual records', () => {
    const rec1 = historyService.addRecord('1 + 1', '2');
    const rec2 = historyService.addRecord('2 + 2', '4');
    expect(historyService.getHistory().length).toBe(2);
    historyService.deleteRecord(rec1.id);
    expect(historyService.getHistory().length).toBe(1);
    expect(historyService.getHistory()[0].id).toBe(rec2.id);
  });

  it('clears all history', () => {
    historyService.addRecord('1 + 1', '2');
    historyService.addRecord('2 + 2', '4');
    historyService.clearHistory();
    expect(historyService.getHistory().length).toBe(0);
  });
});

describe('Memory Operations Tests', () => {
  it('handles MC, MR, M+, and M- accurately', () => {
    const model = new CalculatorStateModel();
    model.memoryClear();
    expect(model.getState().memoryValue).toBe(0);

    model.appendDigit('5');
    model.memoryAdd();
    expect(model.getState().memoryValue).toBe(5);

    model.appendDigit('2');
    model.memorySubtract();
    expect(model.getState().memoryValue).toBe(3);

    model.clearAll();
    model.memoryRecall();
    expect(model.getState().currentInput).toBe('3');

    model.memoryClear();
    expect(model.getState().memoryValue).toBe(0);
  });
});
