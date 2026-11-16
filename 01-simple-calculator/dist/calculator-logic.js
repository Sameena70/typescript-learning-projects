/**
 * Compile-time and runtime exhaustiveness assertion helper.
 * When used in default switch/guard branches, TypeScript ensures that the parameter `x`
 * is narrowed to `never`. If a new operator is added to `Operator` union without
 * handling it, TypeScript emits a compile error.
 */
export function assertNever(x, message = 'Unexpected value encountered') {
    throw new Error(`${message}: ${String(x)}`);
}
/**
 * Adds two numbers.
 */
export function add(a, b) {
    return a + b;
}
/**
 * Subtracts second number from first.
 */
export function subtract(a, b) {
    return a - b;
}
/**
 * Multiplies two numbers.
 */
export function multiply(a, b) {
    return a * b;
}
/**
 * Divides first number by second.
 * Throws an Error if division by zero is attempted.
 */
export function divide(a, b) {
    if (b === 0) {
        throw new Error('Cannot divide by zero');
    }
    return a / b;
}
/**
 * Calculates modulo (remainder).
 * Throws an Error if modulo by zero is attempted.
 */
export function modulo(a, b) {
    if (b === 0) {
        throw new Error('Cannot divide by zero');
    }
    return a % b;
}
/**
 * Operator strategy map associating each supported arithmetic operator with its function.
 * Uses TypeScript's `Record<Operator, ArithmeticOperation>` to ensure compile-time completeness.
 */
export const OPERATOR_OPERATIONS = {
    '+': add,
    '-': subtract,
    '*': multiply,
    '/': divide,
    '%': modulo
};
/**
 * Operator display symbols lookup map.
 */
export const OPERATOR_SYMBOLS = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
    '%': '%'
};
/**
 * Converts value to percentage.
 */
export function percentage(value) {
    return value / 100;
}
/**
 * Negates a numeric string or toggles its sign safely.
 */
export function toggleSign(input) {
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
export function roundToPrecision(value, decimalPlaces = 10) {
    if (!Number.isFinite(value)) {
        return value;
    }
    const factor = Math.pow(10, decimalPlaces);
    return Math.round((value + Number.EPSILON) * factor) / factor;
}
/**
 * Executes calculation based on operator using the operator operations map and precision rounding.
 */
export function compute(first, second, operator) {
    const operation = OPERATOR_OPERATIONS[operator];
    if (typeof operation !== 'function') {
        return assertNever(operator, 'Unsupported operator');
    }
    const result = operation(first, second);
    return roundToPrecision(result);
}
/**
 * Converts symbol to user-facing display operator.
 * Accepts Operator, null, or empty string for backwards compatibility with UI components.
 */
export function formatOperator(operator) {
    if (operator === null || operator === '') {
        return '';
    }
    const symbol = OPERATOR_SYMBOLS[operator];
    if (typeof symbol !== 'string') {
        return assertNever(operator, 'Unknown operator symbol');
    }
    return symbol;
}
/**
 * Validates if a string or number is a valid numeric input using typeof and Number checks.
 */
export function isValidNumber(value) {
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
/**
 * Backward-compatible facade preserving static access for existing consumers and tests.
 */
export class CalculatorLogic {
}
CalculatorLogic.add = add;
CalculatorLogic.subtract = subtract;
CalculatorLogic.multiply = multiply;
CalculatorLogic.divide = divide;
CalculatorLogic.modulo = modulo;
CalculatorLogic.percentage = percentage;
CalculatorLogic.toggleSign = toggleSign;
CalculatorLogic.roundToPrecision = roundToPrecision;
CalculatorLogic.compute = compute;
CalculatorLogic.formatOperator = formatOperator;
CalculatorLogic.isValidNumber = isValidNumber;
