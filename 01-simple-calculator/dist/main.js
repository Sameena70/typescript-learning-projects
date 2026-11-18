import { CalculatorStateModel } from './calculator-state.js';
import { HistoryService } from './history-service.js';
import { CalculatorUI } from './ui.js';
export class CalculatorApp {
    constructor(stateModel = new CalculatorStateModel(), historyService = new HistoryService(), ui = new CalculatorUI()) {
        this.stateModel = stateModel;
        this.historyService = historyService;
        this.ui = ui;
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
            this.stateModel.clearAll();
            this.stateModel.appendDigit(record.result);
            this.ui.updateDisplay(this.stateModel.getState(), record.expression);
            this.ui.closeHistoryPanel();
            this.switchTab('standard');
        }, (id) => {
            this.historyService.deleteRecord(id);
            this.refreshHistory();
        });
    }
    switchTab(tab) {
        this.stateModel.setActiveTab(tab);
        this.ui.switchTab(tab);
    }
    handleOperator(operator) {
        const outcome = this.stateModel.setOperator(operator);
        if (outcome.status === 'error') {
            this.ui.showError(outcome.error);
        }
        else if (outcome.status === 'success') {
            this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave, 'standard');
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
            this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave, this.stateModel.getState().activeTab === 'scientific' ? 'scientific' : 'standard');
            this.refreshHistory();
            this.ui.updateDisplay(this.stateModel.getState(), outcome.expressionToSave);
        }
        else {
            this.ui.updateDisplay(this.stateModel.getState());
        }
    }
    handleUnaryScientific(funcName) {
        const outcome = this.stateModel.applyUnaryScientific(funcName);
        if (outcome.status === 'error') {
            this.ui.showError(outcome.error);
        }
        else if (outcome.status === 'success') {
            this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave, 'scientific');
            this.refreshHistory();
            this.ui.updateDisplay(this.stateModel.getState(), outcome.expressionToSave);
        }
        else {
            this.ui.updateDisplay(this.stateModel.getState());
        }
    }
    bindEvents() {
        var _a, _b;
        // Navigation Tabs
        const navBtns = document.querySelectorAll('.nav-item');
        navBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                if (tab)
                    this.switchTab(tab);
            });
        });
        // Angle mode button (DEG/RAD)
        const angleBtn = document.getElementById('angleModeBtn');
        angleBtn === null || angleBtn === void 0 ? void 0 : angleBtn.addEventListener('click', () => {
            this.stateModel.toggleAngleMode();
            this.ui.updateDisplay(this.stateModel.getState());
        });
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
        // Decimal buttons
        const decimalBtns = document.querySelectorAll('.btn-decimal');
        decimalBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.stateModel.appendDecimal();
                this.ui.updateDisplay(this.stateModel.getState());
            });
        });
        // Negation buttons (toggle sign)
        const signBtns = document.querySelectorAll('.btn-sign');
        signBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.stateModel.toggleSign();
                this.ui.updateDisplay(this.stateModel.getState());
            });
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
        // Equals buttons
        const equalsBtns = document.querySelectorAll('.btn-equals');
        equalsBtns.forEach((btn) => {
            btn.addEventListener('click', () => this.handleEquals());
        });
        // Clear All (C / AC)
        const clearBtns = document.querySelectorAll('.btn-clear');
        clearBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.stateModel.clearAll();
                this.ui.updateDisplay(this.stateModel.getState());
            });
        });
        // Delete Last (DEL / Backspace)
        const deleteBtns = document.querySelectorAll('.btn-del');
        deleteBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.stateModel.deleteLast();
                this.ui.updateDisplay(this.stateModel.getState());
            });
        });
        // Percentage buttons
        const percentBtns = document.querySelectorAll('.btn-percent');
        percentBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.stateModel.applyPercentage();
                this.ui.updateDisplay(this.stateModel.getState());
            });
        });
        // Scientific specific buttons
        const sciFuncBtns = document.querySelectorAll('[data-sci-func]');
        sciFuncBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const fn = btn.getAttribute('data-sci-func');
                if (fn)
                    this.handleUnaryScientific(fn);
            });
        });
        // Scientific append buttons: (, ), pi, e, power, ans
        const sciAppendBtns = document.querySelectorAll('[data-sci-append]');
        sciAppendBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-sci-append');
                if (text === 'ans') {
                    this.stateModel.appendText(this.stateModel.getState().lastAnswer);
                }
                else if (text !== null) {
                    this.stateModel.appendText(text);
                }
                this.ui.updateDisplay(this.stateModel.getState());
            });
        });
        // Memory operations
        const bindMemory = (id, action) => {
            document.querySelectorAll(`#${id}`).forEach((btn) => {
                btn.addEventListener('click', () => {
                    action();
                    this.ui.updateDisplay(this.stateModel.getState());
                });
            });
        };
        bindMemory('mcBtn', () => this.stateModel.memoryClear());
        bindMemory('mrBtn', () => this.stateModel.memoryRecall());
        bindMemory('mPlusBtn', () => this.stateModel.memoryAdd());
        bindMemory('mMinusBtn', () => this.stateModel.memorySubtract());
        // History drawer triggers
        const toggleHistoryBtns = document.querySelectorAll('#toggleHistoryBtn');
        toggleHistoryBtns.forEach((btn) => {
            btn.addEventListener('click', () => this.ui.toggleHistoryPanel());
        });
        (_a = document.getElementById('closeHistoryBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.ui.closeHistoryPanel();
        });
        const clearHistoryBtns = document.querySelectorAll('#clearHistoryBtn, #clearAllHistoryBtn');
        clearHistoryBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.historyService.clearHistory();
                this.refreshHistory();
            });
        });
        // Settings actions
        const angleSetting = document.getElementById('settingAngleMode');
        angleSetting === null || angleSetting === void 0 ? void 0 : angleSetting.addEventListener('change', () => {
            const mode = angleSetting.value;
            this.stateModel.updateSettings({ defaultAngleMode: mode });
            this.ui.updateDisplay(this.stateModel.getState());
        });
        const precisionSetting = document.getElementById('settingPrecision');
        precisionSetting === null || precisionSetting === void 0 ? void 0 : precisionSetting.addEventListener('change', () => {
            const prec = parseInt(precisionSetting.value, 10);
            this.stateModel.updateSettings({ precision: prec });
            this.ui.updateDisplay(this.stateModel.getState());
        });
        (_b = document.getElementById('clearMemorySettingBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.stateModel.memoryClear();
            this.ui.updateDisplay(this.stateModel.getState());
            alert('Memory has been cleared.');
        });
        // Keyboard support
        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
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
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new CalculatorApp();
    });
}
