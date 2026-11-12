import { CalculatorState, Operator, CalculationOutcome } from './types.js';
import { CalculatorLogic } from './calculator-logic.js';
import { StorageService } from './storage.js';

const MEMORY_STORAGE_KEY = 'ts_calculator_memory';

/**
 * Manages the state machine and arithmetic flow of the calculator.
 */
export class CalculatorStateModel {
  private state: CalculatorState;

  constructor() {
    const savedMemory = StorageService.getItem<number>(
      MEMORY_STORAGE_KEY,
      0,
      (val: unknown): val is number => typeof val === 'number' && !isNaN(val) && isFinite(val)
    );

    this.state = {
      currentInput: '0',
      previousInput: '',
      selectedOperator: null,
      shouldResetDisplay: false,
      memoryValue: savedMemory,
      lastExpression: '',
      isError: false
    };
  }

  public getState(): Readonly<CalculatorState> {
    return { ...this.state };
  }

  /**
   * Resets error state if a new action is performed.
   */
  private dismissError(): void {
    if (this.state.isError) {
      this.clearAll();
    }
  }

  public appendDigit(digit: string): void {
    this.dismissError();

    if (this.state.shouldResetDisplay) {
      this.state.currentInput = digit;
      this.state.shouldResetDisplay = false;
    } else {
      if (this.state.currentInput === '0') {
        this.state.currentInput = digit;
      } else {
        // Prevent exceeding sensible display length (15 digits)
        if (this.state.currentInput.replace(/[-.]/g, '').length >= 15) {
          return;
        }
        this.state.currentInput += digit;
      }
    }
  }

  public appendDecimal(): void {
    this.dismissError();

    if (this.state.shouldResetDisplay) {
      this.state.currentInput = '0.';
      this.state.shouldResetDisplay = false;
      return;
    }

    if (!this.state.currentInput.includes('.')) {
      this.state.currentInput += '.';
    }
  }

  public toggleSign(): void {
    this.dismissError();
    this.state.currentInput = CalculatorLogic.toggleSign(this.state.currentInput);
  }

  public deleteLast(): void {
    if (this.state.isError) {
      this.clearAll();
      return;
    }

    if (this.state.shouldResetDisplay) {
      return;
    }

    if (
      this.state.currentInput.length === 1 ||
      (this.state.currentInput.length === 2 && this.state.currentInput.startsWith('-'))
    ) {
      this.state.currentInput = '0';
    } else {
      this.state.currentInput = this.state.currentInput.slice(0, -1);
      if (this.state.currentInput === '-' || this.state.currentInput === '') {
        this.state.currentInput = '0';
      }
    }
  }

  public clearAll(): void {
    this.state.currentInput = '0';
    this.state.previousInput = '';
    this.state.selectedOperator = null;
    this.state.shouldResetDisplay = false;
    this.state.lastExpression = '';
    this.state.isError = false;
  }

  public applyPercentage(): void {
    this.dismissError();
    const value = parseFloat(this.state.currentInput);
    if (!isNaN(value)) {
      const result = CalculatorLogic.percentage(value);
      this.state.currentInput = CalculatorLogic.roundToPrecision(result).toString();
      this.state.shouldResetDisplay = true;
    }
  }

  /**
   * Sets the active operator.
   * If an operator was already selected and a second operand is entered,
   * it executes the intermediate calculation to support continuous chaining (e.g., 10 + 5 * 2).
   * If the user presses a different operator before entering a second operand, it updates the operator.
   */
  public setOperator(operator: Operator): CalculationOutcome {
    this.dismissError();
    let outcome: CalculationOutcome = { status: 'idle' };

    if (this.state.previousInput !== '' && this.state.selectedOperator !== null) {
      if (!this.state.shouldResetDisplay) {
        // Execute pending calculation for chained operations
        outcome = this.calculateResult();
        if (outcome.status === 'error') {
          return outcome;
        }
      }
    }

    this.state.previousInput = this.state.currentInput;
    this.state.selectedOperator = operator;
    this.state.shouldResetDisplay = true;

    return outcome;
  }

  /**
   * Calculates the arithmetic result of (previousInput selectedOperator currentInput).
   * Returns a type-safe discriminated union (`CalculationOutcome`).
   */
  public calculateResult(): CalculationOutcome {
    if (this.state.isError) {
      this.clearAll();
      return { status: 'idle' };
    }

    if (this.state.selectedOperator === null || this.state.previousInput === '') {
      return { status: 'idle' };
    }

    const first = parseFloat(this.state.previousInput);
    const second = parseFloat(this.state.currentInput);
    const op = this.state.selectedOperator;

    if (isNaN(first) || isNaN(second)) {
      this.state.isError = true;
      return { status: 'error', error: 'Invalid Input' };
    }

    const formattedOp = CalculatorLogic.formatOperator(op);
    const expression = `${first} ${formattedOp} ${second}`;

    try {
      const result = CalculatorLogic.compute(first, second, op);
      const resultStr = result.toString();

      this.state.currentInput = resultStr;
      this.state.previousInput = '';
      this.state.selectedOperator = null;
      this.state.shouldResetDisplay = true;
      this.state.lastExpression = `${expression} =`;
      this.state.isError = false;

      return {
        status: 'success',
        expressionToSave: `${expression} =`,
        resultToSave: resultStr
      };
    } catch (error: unknown) {
      this.clearAll();
      this.state.isError = true;
      const message = error instanceof Error ? error.message : 'Error';
      return { status: 'error', error: message };
    }
  }

  // Memory functions
  public memoryClear(): void {
    this.state.memoryValue = 0;
    StorageService.setItem(MEMORY_STORAGE_KEY, 0);
  }

  public memoryRecall(): void {
    this.dismissError();
    this.state.currentInput = this.state.memoryValue.toString();
    this.state.shouldResetDisplay = true;
  }

  public memoryAdd(): void {
    this.dismissError();
    const current = parseFloat(this.state.currentInput);
    if (!isNaN(current)) {
      this.state.memoryValue = CalculatorLogic.roundToPrecision(this.state.memoryValue + current);
      StorageService.setItem(MEMORY_STORAGE_KEY, this.state.memoryValue);
      this.state.shouldResetDisplay = true;
    }
  }

  public memorySubtract(): void {
    this.dismissError();
    const current = parseFloat(this.state.currentInput);
    if (!isNaN(current)) {
      this.state.memoryValue = CalculatorLogic.roundToPrecision(this.state.memoryValue - current);
      StorageService.setItem(MEMORY_STORAGE_KEY, this.state.memoryValue);
      this.state.shouldResetDisplay = true;
    }
  }
}
