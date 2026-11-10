/**
 * Core Calculator Arithmetic & Validation Logic
 *
 * Provides pure mathematical operations and precision handling.
 */
export class CalculatorLogic {
    /**
     * Adds two numbers.
     */
    static add(a, b) {
        return a + b;
    }
    /**
     * Subtracts second number from first.
     */
    static subtract(a, b) {
        return a - b;
    }
    /**
     * Multiplies two numbers.
     */
    static multiply(a, b) {
        return a * b;
    }
    /**
     * Divides first number by second.
     * Throws an Error if division by zero is attempted.
     */
    static divide(a, b) {
        if (b === 0) {
            throw new Error("Cannot divide by zero");
        }
        return a / b;
    }
    /**
     * Calculates modulo (remainder).
     * Throws an Error if modulo by zero is attempted.
     */
    static modulo(a, b) {
        if (b === 0) {
            throw new Error("Cannot divide by zero");
        }
        return a % b;
    }
    /**
     * Converts value to percentage.
     */
    static percentage(value) {
        return value / 100;
    }
    /**
     * Rounds a number to avoid typical floating point inaccuracies (e.g., 0.1 + 0.2 = 0.30000000000000004).
     */
    static roundToPrecision(value, decimalPlaces = 8) {
        if (!Number.isFinite(value)) {
            return value;
        }
        const factor = Math.pow(10, decimalPlaces);
        return Math.round((value + Number.EPSILON) * factor) / factor;
    }
    /**
     * Executes calculation based on operator.
     */
    static compute(first, second, operator) {
        let result;
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
    static formatOperator(operator) {
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
}
