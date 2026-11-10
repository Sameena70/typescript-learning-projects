import { CalculatorStateModel } from './calculator-state.js';
import { HistoryService } from './history-service.js';
import { CalculatorUI } from './ui.js';
import { Operator, CalculationRecord } from './types.js';

/**
 * Main Application Bootstrap for the Advanced TypeScript Calculator.
 */
class CalculatorApp {
  private stateModel: CalculatorStateModel;
  private historyService: HistoryService;
  private ui: CalculatorUI;

  constructor() {
    this.stateModel = new CalculatorStateModel();
    this.historyService = new HistoryService();
    this.ui = new CalculatorUI();

    this.init();
  }

  private init(): void {
    this.bindEvents();
    this.refreshHistory();
    this.ui.updateDisplay(this.stateModel.getState());
  }

  private refreshHistory(): void {
    const history = this.historyService.getHistory();
    this.ui.renderHistory(history, (record: CalculationRecord) => {
      // Recall past result into current display
      this.stateModel.clearAll();
      this.stateModel.appendDigit(record.result);
      this.ui.updateDisplay(this.stateModel.getState(), record.expression);
      this.ui.closeHistoryPanel();
    });
  }

  private handleOperator(operator: Operator): void {
    const outcome = this.stateModel.setOperator(operator);
    if (outcome.error) {
      this.ui.showError(outcome.error);
    } else {
      if (outcome.expressionToSave && outcome.resultToSave) {
        this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave);
        this.refreshHistory();
      }
      this.ui.updateDisplay(this.stateModel.getState());
    }
  }

  private handleEquals(): void {
    const outcome = this.stateModel.calculateResult();
    if (outcome.error) {
      this.ui.showError(outcome.error);
    } else {
      if (outcome.expressionToSave && outcome.resultToSave) {
        this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave);
        this.refreshHistory();
      }
      this.ui.updateDisplay(this.stateModel.getState(), outcome.expressionToSave);
    }
  }

  private bindEvents(): void {
    // Number buttons
    const numberBtns = document.querySelectorAll<HTMLButtonElement>('.btn-number[data-number]');
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
    decimalBtn?.addEventListener('click', () => {
      this.stateModel.appendDecimal();
      this.ui.updateDisplay(this.stateModel.getState());
    });

    // Negation button (toggle sign)
    const signBtn = document.getElementById('signBtn');
    signBtn?.addEventListener('click', () => {
      this.stateModel.toggleSign();
      this.ui.updateDisplay(this.stateModel.getState());
    });

    // Operator buttons
    const operatorBtns = document.querySelectorAll<HTMLButtonElement>('.btn-operator');
    operatorBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const op = btn.getAttribute('data-operator') as Operator;
        if (op) {
          this.handleOperator(op);
        }
      });
    });

    // Equals button
    const equalsBtn = document.getElementById('equalsBtn');
    equalsBtn?.addEventListener('click', () => this.handleEquals());

    // Clear and Delete
    const clearBtn = document.getElementById('clearBtn');
    clearBtn?.addEventListener('click', () => {
      this.stateModel.clearAll();
      this.ui.updateDisplay(this.stateModel.getState());
    });

    const deleteBtn = document.getElementById('deleteBtn');
    deleteBtn?.addEventListener('click', () => {
      this.stateModel.deleteLast();
      this.ui.updateDisplay(this.stateModel.getState());
    });

    // Percentage
    const percentBtn = document.getElementById('percentBtn');
    percentBtn?.addEventListener('click', () => {
      this.stateModel.applyPercentage();
      this.ui.updateDisplay(this.stateModel.getState());
    });

    // Memory buttons
    document.getElementById('mcBtn')?.addEventListener('click', () => {
      this.stateModel.memoryClear();
      this.ui.updateDisplay(this.stateModel.getState());
    });
    document.getElementById('mrBtn')?.addEventListener('click', () => {
      this.stateModel.memoryRecall();
      this.ui.updateDisplay(this.stateModel.getState());
    });
    document.getElementById('mPlusBtn')?.addEventListener('click', () => {
      this.stateModel.memoryAdd();
      this.ui.updateDisplay(this.stateModel.getState());
    });
    document.getElementById('mMinusBtn')?.addEventListener('click', () => {
      this.stateModel.memorySubtract();
      this.ui.updateDisplay(this.stateModel.getState());
    });

    // History controls
    document.getElementById('toggleHistoryBtn')?.addEventListener('click', () => {
      this.ui.toggleHistoryPanel();
    });
    document.getElementById('closeHistoryBtn')?.addEventListener('click', () => {
      this.ui.closeHistoryPanel();
    });
    document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
      this.historyService.clearHistory();
      this.refreshHistory();
    });

    // Keyboard support
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      const key = event.key;

      if (!isNaN(Number(key)) && key !== ' ') {
        this.stateModel.appendDigit(key);
        this.ui.updateDisplay(this.stateModel.getState());
      } else if (key === '.') {
        this.stateModel.appendDecimal();
        this.ui.updateDisplay(this.stateModel.getState());
      } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%') {
        this.handleOperator(key as Operator);
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        this.handleEquals();
      } else if (key === 'Backspace') {
        this.stateModel.deleteLast();
        this.ui.updateDisplay(this.stateModel.getState());
      } else if (key === 'Escape') {
        this.stateModel.clearAll();
        this.ui.updateDisplay(this.stateModel.getState());
      } else if (key === 'm' || key === 'M') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.stateModel.memoryRecall();
          this.ui.updateDisplay(this.stateModel.getState());
        }
      }
    });
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new CalculatorApp();
});
