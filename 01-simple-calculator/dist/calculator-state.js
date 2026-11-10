import { CalculatorLogic } from './calculator-logic.js';
import { StorageService } from './storage.js';
const MEMORY_STORAGE_KEY = 'ts_calculator_memory';
/**
 * Manages the state and operations of the calculator.
 */
export class CalculatorStateModel {
    constructor() {
        const savedMemory = StorageService.getItem(MEMORY_STORAGE_KEY, 0);
        this.state = {
            currentInput: '0',
            previousInput: '',
            selectedOperator: '',
            shouldResetDisplay: false,
            memoryValue: typeof savedMemory === 'number' && !isNaN(savedMemory) ? savedMemory : 0
        };
    }
    getState() {
        return Object.assign({}, this.state);
    }
    appendDigit(digit) {
        if (this.state.shouldResetDisplay) {
            this.state.currentInput = digit;
            this.state.shouldResetDisplay = false;
        }
        else {
            if (this.state.currentInput === '0') {
                this.state.currentInput = digit;
            }
            else {
                // Prevent exceeding sensible length
                if (this.state.currentInput.replace('-', '').length >= 15) {
                    return;
                }
                this.state.currentInput += digit;
            }
        }
    }
    appendDecimal() {
        if (this.state.shouldResetDisplay) {
            this.state.currentInput = '0.';
            this.state.shouldResetDisplay = false;
            return;
        }
        if (!this.state.currentInput.includes('.')) {
            this.state.currentInput += '.';
        }
    }
    deleteLast() {
        if (this.state.shouldResetDisplay) {
            return;
        }
        if (this.state.currentInput.length === 1 ||
            (this.state.currentInput.length === 2 && this.state.currentInput.startsWith('-'))) {
            this.state.currentInput = '0';
        }
        else {
            this.state.currentInput = this.state.currentInput.slice(0, -1);
        }
    }
    clearAll() {
        this.state.currentInput = '0';
        this.state.previousInput = '';
        this.state.selectedOperator = '';
        this.state.shouldResetDisplay = false;
    }
    applyPercentage() {
        const value = parseFloat(this.state.currentInput);
        if (!isNaN(value)) {
            const result = CalculatorLogic.percentage(value);
            this.state.currentInput = CalculatorLogic.roundToPrecision(result).toString();
            this.state.shouldResetDisplay = true;
        }
    }
    setOperator(operator) {
        let resultOutcome = {};
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
    calculateResult() {
        if (!this.state.selectedOperator || this.state.previousInput === '') {
            return {};
        }
        const first = parseFloat(this.state.previousInput);
        const second = parseFloat(this.state.currentInput);
        const op = this.state.selectedOperator;
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
        }
        catch (error) {
            this.clearAll();
            const message = error instanceof Error ? error.message : 'Error';
            return { error: message };
        }
    }
    // Memory functions
    memoryClear() {
        this.state.memoryValue = 0;
        StorageService.setItem(MEMORY_STORAGE_KEY, 0);
    }
    memoryRecall() {
        this.state.currentInput = this.state.memoryValue.toString();
        this.state.shouldResetDisplay = true;
    }
    memoryAdd() {
        const current = parseFloat(this.state.currentInput);
        if (!isNaN(current)) {
            this.state.memoryValue = CalculatorLogic.roundToPrecision(this.state.memoryValue + current);
            StorageService.setItem(MEMORY_STORAGE_KEY, this.state.memoryValue);
            this.state.shouldResetDisplay = true;
        }
    }
    memorySubtract() {
        const current = parseFloat(this.state.currentInput);
        if (!isNaN(current)) {
            this.state.memoryValue = CalculatorLogic.roundToPrecision(this.state.memoryValue - current);
            StorageService.setItem(MEMORY_STORAGE_KEY, this.state.memoryValue);
            this.state.shouldResetDisplay = true;
        }
    }
}
