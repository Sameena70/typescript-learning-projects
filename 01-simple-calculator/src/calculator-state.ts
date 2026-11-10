import { CalculatorState, Operator } from './types.js';
import { CalculatorLogic } from './calculator-logic.js';
import { StorageService } from './storage.js';

const MEMORY_STORAGE_KEY = 'ts_calculator_memory';

/**
 * Manages the state and operations of the calculator.
 */
export class CalculatorStateModel {
  private state: CalculatorState;

  constructor() {
    const savedMemory = StorageService.getItem<number>(MEMORY_STORAGE_KEY, 0);
    this.state = {
      currentInput: '0',
      previousInput: '',
      selectedOperator: '',
      shouldResetDisplay: false,
      memoryValue: typeof savedMemory === 'number' && !isNaN(savedMemory) ? savedMemory : 0
    };
  }

  public getState(): Readonly<CalculatorState> {
    return { ...this.state };
  }

  public appendDigit(digit: string): void {
    if (this.state.shouldResetDisplay) {
      this.state.currentInput = digit;
      this.state.shouldResetDisplay = false;
    } else {
      if (this.state.currentInput === '0') {
        this.state.currentInput = digit;
      } else {
        // Prevent exceeding sensible length
        if (this.state.currentInput.replace('-', '').length >= 15) {
          return;
        }
        this.state.currentInput += digit;
      }
    }
  }

  public appendDecimal(): void {
    if (this.state.shouldResetDisplay) {
      this.state.currentInput = '0.';
      this.state.shouldResetDisplay = false;
      return;
    }

    if (!this.state.currentInput.includes('.')) {
      this.state.currentInput += '.';
    }
  }

  public deleteLast(): void {
    if (this.state.shouldResetDisplay) {
      return;
    }

    if (this.state.currentInput.length === 1 || 
       (this.state.currentInput.length === 2 && this.state.currentInput.startsWith('-'))) {
      this.state.currentInput = '0';
    } else {
      this.state.currentInput = this.state.currentInput.slice(0, -1);
    }
  }

  public clearAll(): void {
    this.state.currentInput = '0';
    this.state.previousInput = '';
    this.state.selectedOperator = '';
    this.state.shouldResetDisplay = false;
  }

  public applyPercentage(): void {
    const value = parseFloat(this.state.currentInput);
    if (!isNaN(value)) {
      const result = CalculatorLogic.percentage(value);
      this.state.currentInput = CalculatorLogic.roundToPrecision(result).toString();
      this.state.shouldResetDisplay = true;
    }
  }

  public setOperator(operator: Operator): { expressionToSave?: string; resultToSave?: string; error?: string } {
    let resultOutcome: { expressionToSave?: string; resultToSave?: string; error?: string } = {};

    if (this.state.previousInput !== '' && this.state.selectedOperator !== '') {
      if (!this.state.shouldResetDisplay) {
        resultOutcome = this.calculateResult();
      }
    }

    this.state.previousInput = this.state.currentInput;
    this.state.selectedOperator = operator;
    this.state.shouldResetDisplay = true;

    return resultOutcome;
  }

  public calculateResult(): { expressionToSave?: string; resultToSave?: string; error?: string } {
    if (!this.state.selectedOperator || this.state.previousInput === '') {
      return {};
    }

    const first = parseFloat(this.state.previousInput);
    const second = parseFloat(this.state.currentInput);
    const op = this.state.selectedOperator as Operator;

    if (isNaN(first) || isNaN(second)) {
      return { error: 'Invalid Input' };
    }

    const formattedOp = CalculatorLogic.formatOperator(op);
    const expression = `${first} ${formattedOp} ${second}`;

    try {
      const result = CalculatorLogic.compute(first, second, op);
      const resultStr = result.toString();

      this.state.currentInput = resultStr;
      this.state.previousInput = '';
      this.state.selectedOperator = '';
      this.state.shouldResetDisplay = true;

      return {
        expressionToSave: `${expression} =`,
        resultToSave: resultStr
      };
    } catch (error: unknown) {
      this.clearAll();
      const message = error instanceof Error ? error.message : 'Error';
      return { error: message };
    }
  }

  // Memory functions
  public memoryClear(): void {
    this.state.memoryValue = 0;
    StorageService.setItem(MEMORY_STORAGE_KEY, 0);
  }

  public memoryRecall(): void {
    this.state.currentInput = this.state.memoryValue.toString();
    this.state.shouldResetDisplay = true;
  }

  public memoryAdd(): void {
    const current = parseFloat(this.state.currentInput);
    if (!isNaN(current)) {
      this.state.memoryValue = CalculatorLogic.roundToPrecision(this.state.memoryValue + current);
      StorageService.setItem(MEMORY_STORAGE_KEY, this.state.memoryValue);
      this.state.shouldResetDisplay = true;
    }
  }

  public memorySubtract(): void {
    const current = parseFloat(this.state.currentInput);
    if (!isNaN(current)) {
      this.state.memoryValue = CalculatorLogic.roundToPrecision(this.state.memoryValue - current);
      StorageService.setItem(MEMORY_STORAGE_KEY, this.state.memoryValue);
      this.state.shouldResetDisplay = true;
    }
  }
}
