"use strict";
// ==========================================
// 1. DOM Element Selection with Type Casting
// ==========================================
// In TypeScript, we can tell the compiler the exact HTML element type
// using "as HTMLDivElement" or "as HTMLButtonElement".
const historyDisplay = document.getElementById("historyDisplay");
const currentDisplay = document.getElementById("currentDisplay");
const clearButton = document.getElementById("clearBtn");
const deleteButton = document.getElementById("deleteBtn");
const percentButton = document.getElementById("percentBtn");
const decimalButton = document.getElementById("decimalBtn");
const equalsButton = document.getElementById("equalsBtn");
// Select groups of buttons using querySelectorAll
const numberButtons = document.querySelectorAll(".btn-number[data-number]");
const operatorButtons = document.querySelectorAll(".btn-operator");
// ==========================================
// 2. Calculator State Variables
// ==========================================
// Using explicit TypeScript type annotations: string and boolean
let currentInput = "0"; // The number currently being entered
let previousInput = ""; // The first operand stored when operator is pressed
let selectedOperator = ""; // The chosen operator: "+", "-", "*", "/"
let shouldResetDisplay = false; // Flag to reset display on next number entry
// ==========================================
// 3. Core Arithmetic Functions
// ==========================================
/**
 * Adds two numbers.
 * @param a - First number
 * @param b - Second number
 * @returns The sum as a number
 */
function add(a, b) {
    return a + b;
}
/**
 * Subtracts the second number from the first.
 */
function subtract(a, b) {
    return a - b;
}
/**
 * Multiplies two numbers.
 */
function multiply(a, b) {
    return a * b;
}
/**
 * Divides the first number by the second.
 * Returns null if division by zero is attempted.
 */
function divide(a, b) {
    if (b === 0) {
        return null; // Signals an error condition
    }
    return a / b;
}
/**
 * Calculates modulo (remainder of division) using the % operator.
 */
function modulo(a, b) {
    if (b === 0) {
        return null;
    }
    return a % b;
}
/**
 * Converts the current value to a percentage (divides by 100).
 */
function calculatePercentage(value) {
    return value / 100;
}
/**
 * Rounds a number to a specified number of decimal places to prevent floating-point inaccuracies.
 * Uses a default parameter (decimalPlaces = 8) so callers can omit the precision argument.
 * @param value - The number to round
 * @param decimalPlaces - Number of decimal digits to keep (defaults to 8)
 * @returns The rounded number
 */
function roundToPrecision(value, decimalPlaces = 8) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(value * factor) / factor;
}
/**
 * Performs the arithmetic operation between two numbers based on an operator symbol.
 * @param first - First operand
 * @param second - Second operand
 * @param operator - Operator symbol ("+", "-", "*", "/", "%")
 * @returns Calculated result number, or null if division by zero occurred
 */
function calculate(first, second, operator) {
    if (operator === "+") {
        return add(first, second);
    }
    if (operator === "-") {
        return subtract(first, second);
    }
    if (operator === "*") {
        return multiply(first, second);
    }
    if (operator === "/") {
        return divide(first, second);
    }
    if (operator === "%") {
        return modulo(first, second);
    }
    return null;
}
// ==========================================
// 4. Helper Function to Get Math Symbol for UI
// ==========================================
function getOperatorSymbol(operator) {
    if (operator === "+")
        return "+";
    if (operator === "-")
        return "−";
    if (operator === "*")
        return "×";
    if (operator === "/")
        return "÷";
    return operator;
}
// ==========================================
// 5. Display Updating Function
// ==========================================
/**
 * Updates the screen using Template Literals
 */
function updateDisplay() {
    currentDisplay.innerText = currentInput;
    if (selectedOperator !== "" && previousInput !== "") {
        const symbol = getOperatorSymbol(selectedOperator);
        // Template literal demonstration: `${variable1} ${variable2}`
        historyDisplay.innerText = `${previousInput} ${symbol}`;
    }
    else {
        historyDisplay.innerText = "";
    }
}
// ==========================================
// 6. User Interaction Handlers
// ==========================================
/**
 * Appends a digit (0-9) to the current input
 */
function appendNumber(numString) {
    // If a calculation was just completed or operator chosen, start a fresh number
    if (shouldResetDisplay) {
        currentInput = numString;
        shouldResetDisplay = false;
    }
    else {
        // If screen currently only displays "0", replace it (unless entering more digits)
        if (currentInput === "0") {
            currentInput = numString;
        }
        else {
            currentInput = currentInput + numString;
        }
    }
    updateDisplay();
}
/**
 * Appends decimal point, ensuring no duplicates exist
 */
function appendDecimal() {
    if (shouldResetDisplay) {
        currentInput = "0.";
        shouldResetDisplay = false;
        updateDisplay();
        return;
    }
    // Prevent multiple decimal points in one number
    if (!currentInput.includes(".")) {
        currentInput = currentInput + ".";
        updateDisplay();
    }
}
/**
 * Sets the active arithmetic operator (+, -, *, /)
 */
function chooseOperator(operator) {
    // If an operator was already chosen and user enters another number, evaluate first
    if (previousInput !== "" && !shouldResetDisplay) {
        computeResult();
    }
    selectedOperator = operator;
    previousInput = currentInput;
    shouldResetDisplay = true;
    updateDisplay();
}
/**
 * Performs calculation based on current state
 */
function computeResult() {
    // Cannot compute if we have no stored operator or previous operand
    if (selectedOperator === "" || previousInput === "") {
        return;
    }
    // Convert string inputs to numbers
    const firstOperand = parseFloat(previousInput);
    const secondOperand = parseFloat(currentInput);
    // Perform calculation using the reusable calculate function
    const calculationResult = calculate(firstOperand, secondOperand, selectedOperator);
    // Handle Division by Zero error
    if (calculationResult === null) {
        currentInput = "Error: Cannot divide by 0";
        previousInput = "";
        selectedOperator = "";
        shouldResetDisplay = true;
        updateDisplay();
        return;
    }
    // Round floating point inaccuracies using reusable rounding helper (defaults to 8 decimal places)
    const roundedResult = roundToPrecision(calculationResult);
    // Format history and store result
    const operatorSymbol = getOperatorSymbol(selectedOperator);
    historyDisplay.innerText = `${previousInput} ${operatorSymbol} ${currentInput} =`;
    // Update current input with result converted back to string
    currentInput = roundedResult.toString();
    selectedOperator = "";
    previousInput = "";
    shouldResetDisplay = true;
    currentDisplay.innerText = currentInput;
}
/**
 * Clears entire calculator state (All Clear - AC)
 */
function clearAll() {
    currentInput = "0";
    previousInput = "";
    selectedOperator = "";
    shouldResetDisplay = false;
    updateDisplay();
}
/**
 * Deletes the last entered character (DEL button)
 */
function deleteLastDigit() {
    // If screen shows an error message or we just completed a calculation, reset to 0
    if (shouldResetDisplay || currentInput.includes("Error")) {
        clearAll();
        return;
    }
    if (currentInput.length === 1) {
        currentInput = "0";
    }
    else {
        currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
}
/**
 * Handles the % button by converting current value to percentage
 */
function handlePercentage() {
    const numericValue = parseFloat(currentInput);
    if (isNaN(numericValue)) {
        return;
    }
    const percentResult = calculatePercentage(numericValue);
    currentInput = percentResult.toString();
    updateDisplay();
}
// ==========================================
// 7. Event Listeners Setup
// ==========================================
// Number buttons
numberButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        var _a;
        // getAttribute returns string | null; use ?? to provide an empty string fallback
        const digitValue = (_a = btn.getAttribute("data-number")) !== null && _a !== void 0 ? _a : "";
        if (digitValue !== "") {
            appendNumber(digitValue);
        }
    });
});
// Operator buttons
operatorButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        var _a;
        // getAttribute returns string | null; use ?? to provide an empty string fallback
        const operatorValue = (_a = btn.getAttribute("data-operator")) !== null && _a !== void 0 ? _a : "";
        if (operatorValue !== "") {
            chooseOperator(operatorValue);
        }
    });
});
// Action buttons
clearButton.addEventListener("click", clearAll);
deleteButton.addEventListener("click", deleteLastDigit);
percentButton.addEventListener("click", handlePercentage);
decimalButton.addEventListener("click", appendDecimal);
equalsButton.addEventListener("click", computeResult);
// ==========================================
// 8. Desktop Keyboard Support
// ==========================================
// Allows typing numbers and operators directly using your desktop keyboard
window.addEventListener("keydown", (event) => {
    const key = event.key;
    // Numbers 0 through 9
    if (key >= "0" && key <= "9") {
        appendNumber(key);
        return;
    }
    // Operators
    if (key === "+" || key === "-" || key === "*" || key === "/" || key === "%") {
        chooseOperator(key);
        return;
    }
    // Decimal point
    if (key === ".") {
        appendDecimal();
        return;
    }
    // Calculate result (Enter or Equals)
    if (key === "Enter" || key === "=") {
        event.preventDefault(); // Prevents accidental form submit or button click repeats
        computeResult();
        return;
    }
    // Delete last digit (Backspace)
    if (key === "Backspace") {
        deleteLastDigit();
        return;
    }
    // Clear all (Escape key)
    if (key === "Escape") {
        clearAll();
        return;
    }
});
// Initialize display on startup
updateDisplay();
