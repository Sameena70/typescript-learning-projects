import { compute, formatOperator, percentage, roundToPrecision, toggleSign } from './calculator-logic.js';
import { factorial, safeSin, safeCos, safeTan, safeAsin, safeAcos, safeAtan, safeLog10, safeLn, safeSqrt, safeCbrt, safeReciprocal } from './scientific-logic.js';
import { evaluateExpression } from './expression-parser.js';
import { defaultStorageDriver } from './storage.js';
const MEMORY_STORAGE_KEY = 'ts_calculator_memory';
const SETTINGS_STORAGE_KEY = 'ts_calculator_settings';
const MAX_DIGIT_LENGTH = 20;
function isMemoryNumber(val) {
    return typeof val === 'number' && !isNaN(val) && isFinite(val);
}
export class CalculatorStateModel {
    constructor(storage = defaultStorageDriver) {
        this.storage = storage;
        const savedMemory = this.storage.getItem(MEMORY_STORAGE_KEY, 0, isMemoryNumber);
        const defaultSettings = {
            defaultAngleMode: 'DEG',
            precision: 10,
            numberFormat: 'standard'
        };
        const savedSettings = this.storage.getItem(SETTINGS_STORAGE_KEY, defaultSettings, (val) => typeof val === 'object' && val !== null);
        this.state = {
            currentInput: '0',
            previousInput: '',
            selectedOperator: null,
            shouldResetDisplay: false,
            memoryValue: savedMemory,
            lastExpression: '',
            isError: false,
            activeTab: 'standard',
            angleMode: savedSettings.defaultAngleMode || 'DEG',
            settings: savedSettings,
            lastAnswer: '0'
        };
    }
    getState() {
        return Object.assign({}, this.state);
    }
    dismissError() {
        if (this.state.isError) {
            this.clearAll();
        }
    }
    setActiveTab(tab) {
        this.state.activeTab = tab;
    }
    toggleAngleMode() {
        this.state.angleMode = this.state.angleMode === 'DEG' ? 'RAD' : 'DEG';
    }
    setAngleMode(mode) {
        this.state.angleMode = mode;
    }
    updateSettings(newSettings) {
        this.state.settings = Object.assign(Object.assign({}, this.state.settings), newSettings);
        this.storage.setItem(SETTINGS_STORAGE_KEY, this.state.settings);
        if (newSettings.defaultAngleMode) {
            this.state.angleMode = newSettings.defaultAngleMode;
        }
    }
    appendDigit(digit) {
        this.dismissError();
        if (this.state.shouldResetDisplay) {
            this.state.currentInput = digit;
            this.state.shouldResetDisplay = false;
        }
        else {
            if (this.state.currentInput === '0') {
                this.state.currentInput = digit;
            }
            else {
                if (this.state.currentInput.length >= MAX_DIGIT_LENGTH)
                    return;
                this.state.currentInput += digit;
            }
        }
    }
    appendDecimal() {
        this.dismissError();
        if (this.state.shouldResetDisplay) {
            this.state.currentInput = '0.';
            this.state.shouldResetDisplay = false;
            return;
        }
        const parts = this.state.currentInput.split(/[+\-*/^%]/);
        const lastPart = parts[parts.length - 1];
        if (!lastPart.includes('.')) {
            this.state.currentInput += '.';
        }
    }
    appendText(text) {
        this.dismissError();
        if (this.state.shouldResetDisplay) {
            this.state.currentInput = text;
            this.state.shouldResetDisplay = false;
        }
        else {
            if (this.state.currentInput === '0') {
                this.state.currentInput = text;
            }
            else {
                this.state.currentInput += text;
            }
        }
    }
    toggleSign() {
        this.dismissError();
        this.state.currentInput = toggleSign(this.state.currentInput);
    }
    deleteLast() {
        if (this.state.isError) {
            this.clearAll();
            return;
        }
        if (this.state.shouldResetDisplay)
            return;
        if (this.state.currentInput.length === 1 ||
            (this.state.currentInput.length === 2 && this.state.currentInput.startsWith('-'))) {
            this.state.currentInput = '0';
        }
        else {
            this.state.currentInput = this.state.currentInput.slice(0, -1);
            if (this.state.currentInput === '' || this.state.currentInput === '-') {
                this.state.currentInput = '0';
            }
        }
    }
    clearAll() {
        this.state.currentInput = '0';
        this.state.previousInput = '';
        this.state.selectedOperator = null;
        this.state.shouldResetDisplay = false;
        this.state.lastExpression = '';
        this.state.isError = false;
    }
    applyPercentage() {
        this.dismissError();
        const value = parseFloat(this.state.currentInput);
        if (!isNaN(value)) {
            const result = percentage(value);
            this.state.currentInput = roundToPrecision(result, this.state.settings.precision).toString();
            this.state.shouldResetDisplay = true;
        }
    }
    setOperator(operator) {
        this.dismissError();
        let outcome = { status: 'idle' };
        if (this.state.previousInput !== '' && this.state.selectedOperator !== null) {
            if (!this.state.shouldResetDisplay) {
                outcome = this.calculateResult();
                if (outcome.status === 'error')
                    return outcome;
            }
        }
        this.state.previousInput = this.state.currentInput;
        this.state.selectedOperator = operator;
        this.state.shouldResetDisplay = true;
        return outcome;
    }
    calculateResult() {
        if (this.state.isError) {
            this.clearAll();
            return { status: 'idle' };
        }
        if (this.state.activeTab === 'scientific' || /[()^πe]/.test(this.state.currentInput)) {
            try {
                const rawExpr = this.state.currentInput;
                const res = evaluateExpression(rawExpr, this.state.angleMode);
                const resStr = roundToPrecision(res, this.state.settings.precision).toString();
                this.state.lastExpression = `${rawExpr} =`;
                this.state.currentInput = resStr;
                this.state.lastAnswer = resStr;
                this.state.shouldResetDisplay = true;
                this.state.isError = false;
                return {
                    status: 'success',
                    expressionToSave: `${rawExpr} =`,
                    resultToSave: resStr
                };
            }
            catch (err) {
                this.clearAll();
                this.state.isError = true;
                const msg = err instanceof Error ? err.message : 'Error';
                return { status: 'error', error: msg };
            }
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
        const formattedOp = formatOperator(op);
        const expression = `${first} ${formattedOp} ${second}`;
        try {
            const result = compute(first, second, op);
            const resultStr = roundToPrecision(result, this.state.settings.precision).toString();
            this.state.currentInput = resultStr;
            this.state.lastAnswer = resultStr;
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
        }
        catch (error) {
            this.clearAll();
            this.state.isError = true;
            const message = error instanceof Error ? error.message : 'Error';
            return { status: 'error', error: message };
        }
    }
    applyUnaryScientific(funcName) {
        this.dismissError();
        const val = parseFloat(this.state.currentInput);
        if (isNaN(val)) {
            this.state.isError = true;
            return { status: 'error', error: 'Invalid Input' };
        }
        try {
            let res;
            let exprLabel;
            switch (funcName) {
                case 'sin':
                    res = safeSin(val, this.state.angleMode);
                    exprLabel = `sin(${val})`;
                    break;
                case 'cos':
                    res = safeCos(val, this.state.angleMode);
                    exprLabel = `cos(${val})`;
                    break;
                case 'tan':
                    res = safeTan(val, this.state.angleMode);
                    exprLabel = `tan(${val})`;
                    break;
                case 'asin':
                    res = safeAsin(val, this.state.angleMode);
                    exprLabel = `sin⁻¹(${val})`;
                    break;
                case 'acos':
                    res = safeAcos(val, this.state.angleMode);
                    exprLabel = `cos⁻¹(${val})`;
                    break;
                case 'atan':
                    res = safeAtan(val, this.state.angleMode);
                    exprLabel = `tan⁻¹(${val})`;
                    break;
                case 'log':
                    res = safeLog10(val);
                    exprLabel = `log(${val})`;
                    break;
                case 'ln':
                    res = safeLn(val);
                    exprLabel = `ln(${val})`;
                    break;
                case 'sqrt':
                    res = safeSqrt(val);
                    exprLabel = `√(${val})`;
                    break;
                case 'cbrt':
                    res = safeCbrt(val);
                    exprLabel = `∛(${val})`;
                    break;
                case 'sqr':
                    res = val * val;
                    exprLabel = `sqr(${val})`;
                    break;
                case 'cube':
                    res = val * val * val;
                    exprLabel = `cube(${val})`;
                    break;
                case 'recip':
                    res = safeReciprocal(val);
                    exprLabel = `1/(${val})`;
                    break;
                case 'abs':
                    res = Math.abs(val);
                    exprLabel = `|${val}|`;
                    break;
                case 'fact':
                    res = factorial(val);
                    exprLabel = `${val}!`;
                    break;
                case 'tenPow':
                    res = Math.pow(10, val);
                    exprLabel = `10^(${val})`;
                    break;
                case 'ePow':
                    res = Math.exp(val);
                    exprLabel = `e^(${val})`;
                    break;
                default: throw new Error(`Unknown scientific function: ${funcName}`);
            }
            const resStr = roundToPrecision(res, this.state.settings.precision).toString();
            this.state.lastExpression = `${exprLabel} =`;
            this.state.currentInput = resStr;
            this.state.lastAnswer = resStr;
            this.state.shouldResetDisplay = true;
            return {
                status: 'success',
                expressionToSave: `${exprLabel} =`,
                resultToSave: resStr
            };
        }
        catch (err) {
            this.clearAll();
            this.state.isError = true;
            const msg = err instanceof Error ? err.message : 'Error';
            return { status: 'error', error: msg };
        }
    }
    memoryClear() {
        this.state.memoryValue = 0;
        this.storage.setItem(MEMORY_STORAGE_KEY, 0);
    }
    memoryRecall() {
        this.dismissError();
        this.state.currentInput = this.state.memoryValue.toString();
        this.state.shouldResetDisplay = true;
    }
    memoryAdd() {
        this.dismissError();
        const current = parseFloat(this.state.currentInput);
        if (!isNaN(current)) {
            this.state.memoryValue = roundToPrecision(this.state.memoryValue + current, this.state.settings.precision);
            this.storage.setItem(MEMORY_STORAGE_KEY, this.state.memoryValue);
            this.state.shouldResetDisplay = true;
        }
    }
    memorySubtract() {
        this.dismissError();
        const current = parseFloat(this.state.currentInput);
        if (!isNaN(current)) {
            this.state.memoryValue = roundToPrecision(this.state.memoryValue - current, this.state.settings.precision);
            this.storage.setItem(MEMORY_STORAGE_KEY, this.state.memoryValue);
            this.state.shouldResetDisplay = true;
        }
    }
}
