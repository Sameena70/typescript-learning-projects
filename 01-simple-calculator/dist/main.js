import { CalculatorStateModel } from './calculator-state.js';
import { HistoryService } from './history-service.js';
import { CalculatorUI } from './ui.js';
/**
 * Main Application Bootstrap for the Advanced TypeScript Calculator.
 */
class CalculatorApp {
    constructor() {
        this.stateModel = new CalculatorStateModel();
        this.historyService = new HistoryService();
        this.ui = new CalculatorUI();
        this.init();
    }
    init() {
        this.bindEvents();
        this.refreshHistory();
        this.ui.updateDisplay(this.stateModel.getState());
    }
    refreshHistory() {
        const history = this.historyService.getHistory();
        this.ui.renderHistory(history, (record) => {
            // Allow user to reuse past result
            this.stateModel.clearAll();
            this.stateModel.appendDigit(record.result);
            this.ui.updateDisplay(this.stateModel.getState(), record.expression);
            this.ui.closeHistoryPanel();
        });
    }
    handleOperator(operator) {
        const outcome = this.stateModel.setOperator(operator);
        if (outcome.error) {
            this.ui.showError(outcome.error);
        }
        else {
            if (outcome.expressionToSave && outcome.resultToSave) {
                this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave);
                this.refreshHistory();
            }
            this.ui.updateDisplay(this.stateModel.getState());
        }
    }
    handleEquals() {
        const outcome = this.stateModel.calculateResult();
        if (outcome.error) {
            this.ui.showError(outcome.error);
        }
        else {
            if (outcome.expressionToSave && outcome.resultToSave) {
                this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave);
                this.refreshHistory();
            }
            this.ui.updateDisplay(this.stateModel.getState(), outcome.expressionToSave);
        }
    }
    bindEvents() {
        var _a, _b, _c, _d, _e, _f, _g;
        // Number buttons
        const numberBtns = document.querySelectorAll('.btn-number[data-number]');
        numberBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const num = btn.getAttribute('data-number');
                if (num !== null) {
                    this.stateModel.appendDigit(num);
                    this.ui.updateDisplay(this.stateModel.getState());
                }
            });
        });
        // Decimal button
        const decimalBtn = document.getElementById('decimalBtn');
        decimalBtn === null || decimalBtn === void 0 ? void 0 : decimalBtn.addEventListener('click', () => {
            this.stateModel.appendDecimal();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        // Operator buttons
        const operatorBtns = document.querySelectorAll('.btn-operator');
        operatorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const op = btn.getAttribute('data-operator');
                if (op) {
                    this.handleOperator(op);
                }
            });
        });
        // Equals button
        const equalsBtn = document.getElementById('equalsBtn');
        equalsBtn === null || equalsBtn === void 0 ? void 0 : equalsBtn.addEventListener('click', () => this.handleEquals());
        // Clear and Delete
        const clearBtn = document.getElementById('clearBtn');
        clearBtn === null || clearBtn === void 0 ? void 0 : clearBtn.addEventListener('click', () => {
            this.stateModel.clearAll();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        const deleteBtn = document.getElementById('deleteBtn');
        deleteBtn === null || deleteBtn === void 0 ? void 0 : deleteBtn.addEventListener('click', () => {
            this.stateModel.deleteLast();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        // Percentage
        const percentBtn = document.getElementById('percentBtn');
        percentBtn === null || percentBtn === void 0 ? void 0 : percentBtn.addEventListener('click', () => {
            this.stateModel.applyPercentage();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        // Memory buttons
        (_a = document.getElementById('mcBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.stateModel.memoryClear();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        (_b = document.getElementById('mrBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.stateModel.memoryRecall();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        (_c = document.getElementById('mPlusBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.stateModel.memoryAdd();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        (_d = document.getElementById('mMinusBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.stateModel.memorySubtract();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        // History controls
        (_e = document.getElementById('toggleHistoryBtn')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            this.ui.toggleHistoryPanel();
        });
        (_f = document.getElementById('closeHistoryBtn')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
            this.ui.closeHistoryPanel();
        });
        (_g = document.getElementById('clearHistoryBtn')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', () => {
            this.historyService.clearHistory();
            this.refreshHistory();
        });
        // Keyboard support
        window.addEventListener('keydown', (event) => {
            const key = event.key;
            if (!isNaN(Number(key)) && key !== ' ') {
                this.stateModel.appendDigit(key);
                this.ui.updateDisplay(this.stateModel.getState());
            }
            else if (key === '.') {
                this.stateModel.appendDecimal();
                this.ui.updateDisplay(this.stateModel.getState());
            }
            else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%') {
                this.handleOperator(key);
            }
            else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                this.handleEquals();
            }
            else if (key === 'Backspace') {
                this.stateModel.deleteLast();
                this.ui.updateDisplay(this.stateModel.getState());
            }
            else if (key === 'Escape') {
                this.stateModel.clearAll();
                this.ui.updateDisplay(this.stateModel.getState());
            }
        });
    }
}
// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
    new CalculatorApp();
});
