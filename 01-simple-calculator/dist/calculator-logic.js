/**
 * Compile-time and runtime exhaustiveness assertion helper.
 * When used in default switch branches, TypeScript will ensure that the parameter `x`
 * is narrowed to `never`. If a new operator is added to `Operator` union without
 * handling it in the switch, TypeScript emits a compile error.
 */
export function assertNever(x, message = 'Unexpected value encountered') {
    throw new Error(`${message}: ${String(x)}`);
}
/**
 * Core Calculator Arithmetic & Validation Logic
 *
 * Provides pure mathematical operations, precision handling, and exhaustive operator computation.
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
            throw new Error('Cannot divide by zero');
        }
        return a / b;
    }
    /**
     * Calculates modulo (remainder).
     * Throws an Error if modulo by zero is attempted.
     */
    static modulo(a, b) {
        if (b === 0) {
            throw new Error('Cannot divide by zero');
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
     * Negates a numeric string or toggles its sign safely.
     */
    static toggleSign(input) {
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
    static roundToPrecision(value, decimalPlaces = 10) {
        if (!Number.isFinite(value)) {
            return value;
        }
        const factor = Math.pow(10, decimalPlaces);
        return Math.round((value + Number.EPSILON) * factor) / factor;
    }
    /**
     * Executes calculation based on operator with compile-time exhaustiveness checking.
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
                // operator is guaranteed to be never if all operators in union are covered
                return assertNever(operator, 'Unsupported operator');
        }
        return this.roundToPrecision(result);
    }
    /**
     * Converts symbol to user-facing display operator.
     * Accepts Operator, null, or empty string for backwards compatibility with UI components.
     */
    static formatOperator(operator) {
        if (operator === null || operator === '') {
            return '';
        }
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
                return assertNever(operator, 'Unknown operator symbol');
        }
    }
    /**
     * Validates if a string is a valid numeric input using typeof and Number checks.
     */
    static isValidNumber(value) {
        if (typeof value === 'number') {
            return !isNaN(value) && isFinite(value);
        }
        if (typeof value === 'string') {
            if (value.trim() === '')
                return false;
            const num = Number(value);
            return !isNaN(num) && isFinite(num);
        }
        return false;
    }
}
