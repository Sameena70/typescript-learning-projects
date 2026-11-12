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
            // Recall past result into current display
            this.stateModel.clearAll();
            this.stateModel.appendDigit(record.result);
            this.ui.updateDisplay(this.stateModel.getState(), record.expression);
            this.ui.closeHistoryPanel();
        });
    }
    handleOperator(operator) {
        const outcome = this.stateModel.setOperator(operator);
        if (outcome.status === 'error') {
            this.ui.showError(outcome.error);
        }
        else if (outcome.status === 'success') {
            this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave);
            this.refreshHistory();
            this.ui.updateDisplay(this.stateModel.getState());
        }
        else {
            this.ui.updateDisplay(this.stateModel.getState());
        }
    }
    handleEquals() {
        const outcome = this.stateModel.calculateResult();
        if (outcome.status === 'error') {
            this.ui.showError(outcome.error);
        }
        else if (outcome.status === 'success') {
            this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave);
            this.refreshHistory();
            this.ui.updateDisplay(this.stateModel.getState(), outcome.expressionToSave);
        }
        else {
            this.ui.updateDisplay(this.stateModel.getState());
        }
    }
    bindEvents() {
        var _a, _b, _c, _d;
        // Number buttons
        const numberBtns = document.querySelectorAll('.btn-number[data-number]');
        numberBtns.forEach((btn) => {
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
        // Negation button (toggle sign)
        const signBtn = document.getElementById('signBtn');
        signBtn === null || signBtn === void 0 ? void 0 : signBtn.addEventListener('click', () => {
            this.stateModel.toggleSign();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        // Operator buttons
        const operatorBtns = document.querySelectorAll('.btn-operator');
        operatorBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const op = btn.getAttribute('data-operator');
                if (op === '+' || op === '-' || op === '*' || op === '/' || op === '%') {
                    this.handleOperator(op);
                }
            });
        });
        // Equals button
        const equalsBtn = document.getElementById('equalsBtn');
        equalsBtn === null || equalsBtn === void 0 ? void 0 : equalsBtn.addEventListener('click', () => {
            this.handleEquals();
        });
        // Clear All (AC)
        const clearBtn = document.getElementById('clearBtn');
        clearBtn === null || clearBtn === void 0 ? void 0 : clearBtn.addEventListener('click', () => {
            this.stateModel.clearAll();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        // Delete Last (Backspace)
        const deleteBtn = document.getElementById('deleteBtn');
        deleteBtn === null || deleteBtn === void 0 ? void 0 : deleteBtn.addEventListener('click', () => {
            this.stateModel.deleteLast();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        // Percentage button (%)
        const percentBtn = document.getElementById('percentBtn');
        percentBtn === null || percentBtn === void 0 ? void 0 : percentBtn.addEventListener('click', () => {
            this.stateModel.applyPercentage();
            this.ui.updateDisplay(this.stateModel.getState());
        });
        // Memory Keys
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
        // History Drawer Triggers
        const historyToggleBtn = document.getElementById('historyToggleBtn');
        historyToggleBtn === null || historyToggleBtn === void 0 ? void 0 : historyToggleBtn.addEventListener('click', () => {
            this.ui.toggleHistoryPanel();
        });
        const closeHistoryBtn = document.getElementById('closeHistoryBtn');
        closeHistoryBtn === null || closeHistoryBtn === void 0 ? void 0 : closeHistoryBtn.addEventListener('click', () => {
            this.ui.closeHistoryPanel();
        });
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        clearHistoryBtn === null || clearHistoryBtn === void 0 ? void 0 : clearHistoryBtn.addEventListener('click', () => {
            this.historyService.clearHistory();
            this.refreshHistory();
        });
        // Keyboard support with safe key handling
        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            if (/^[0-9]$/.test(e.key)) {
                this.stateModel.appendDigit(e.key);
                this.ui.updateDisplay(this.stateModel.getState());
                return;
            }
            if (e.key === '.') {
                this.stateModel.appendDecimal();
                this.ui.updateDisplay(this.stateModel.getState());
                return;
            }
            if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '%') {
                this.handleOperator(e.key);
                return;
            }
            if (e.key === 'Enter' || e.key === '=') {
                e.preventDefault();
                this.handleEquals();
                return;
            }
            if (e.key === 'Backspace') {
                this.stateModel.deleteLast();
                this.ui.updateDisplay(this.stateModel.getState());
                return;
            }
            if (e.key === 'Escape') {
                this.stateModel.clearAll();
                this.ui.updateDisplay(this.stateModel.getState());
                return;
            }
        });
    }
}
// Instantiate application once DOM is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new CalculatorApp();
    });
}
