import { Operator } from './types.js';

/**
 * Core Calculator Arithmetic & Validation Logic
 *
 * Provides pure mathematical operations and precision handling.
 */
export class CalculatorLogic {
  /**
   * Adds two numbers.
   */
  static add(a: number, b: number): number {
    return a + b;
  }

  /**
   * Subtracts second number from first.
   */
  static subtract(a: number, b: number): number {
    return a - b;
  }

  /**
   * Multiplies two numbers.
   */
  static multiply(a: number, b: number): number {
    return a * b;
  }

  /**
   * Divides first number by second.
   * Throws an Error if division by zero is attempted.
   */
  static divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a / b;
  }

  /**
   * Calculates modulo (remainder).
   * Throws an Error if modulo by zero is attempted.
   */
  static modulo(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a % b;
  }

  /**
   * Converts value to percentage.
   */
  static percentage(value: number): number {
    return value / 100;
  }

  /**
   * Negates a numeric string or toggles its sign safely.
   */
  static toggleSign(input: string): string {
    if (input === '0' || input === '' || input === '0.') {
      return input;
    }
    if (input.startsWith('-')) {
      return input.slice(1);
    }
    return '-' + input;
  }

  /**
   * Rounds a number to avoid typical floating point inaccuracies.
   */
  static roundToPrecision(value: number, decimalPlaces: number = 10): number {
    if (!Number.isFinite(value)) {
      return value;
    }
    const factor = Math.pow(10, decimalPlaces);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  /**
   * Executes calculation based on operator.
   */
  static compute(first: number, second: number, operator: Operator): number {
    let result: number;

    switch (operator) {
      case '+':
        result = this.add(first, second);
        break;
      case '-':
        result = this.subtract(first, second);
        break;
      case '*':
        result = this.multiply(first, second);
        break;
      case '/':
        result = this.divide(first, second);
        break;
      case '%':
        result = this.modulo(first, second);
        break;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }

    return this.roundToPrecision(result);
  }

  /**
   * Converts symbol to user-facing display operator.
   */
  static formatOperator(operator: Operator | ''): string {
    switch (operator) {
      case '+':
        return '+';
      case '-':
        return '−';
      case '*':
        return '×';
      case '/':
        return '÷';
      case '%':
        return '%';
      default:
        return '';
    }
  }

  /**
   * Validates if a string is a valid numeric input.
   */
  static isValidNumber(value: string): boolean {
    if (value.trim() === '') return false;
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  }
}
