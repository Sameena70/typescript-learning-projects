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
    if (outcome.status === 'error') {
      this.ui.showError(outcome.error);
    } else if (outcome.status === 'success') {
      this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave);
      this.refreshHistory();
      this.ui.updateDisplay(this.stateModel.getState());
    } else {
      this.ui.updateDisplay(this.stateModel.getState());
    }
  }

  private handleEquals(): void {
    const outcome = this.stateModel.calculateResult();
    if (outcome.status === 'error') {
      this.ui.showError(outcome.error);
    } else if (outcome.status === 'success') {
      this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave);
      this.refreshHistory();
      this.ui.updateDisplay(this.stateModel.getState(), outcome.expressionToSave);
    } else {
      this.ui.updateDisplay(this.stateModel.getState());
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
        const op = btn.getAttribute('data-operator') as Operator | null;
        if (op === '+' || op === '-' || op === '*' || op === '/' || op === '%') {
          this.handleOperator(op);
        }
      });
    });

    // Equals button
    const equalsBtn = document.getElementById('equalsBtn');
    equalsBtn?.addEventListener('click', () => {
      this.handleEquals();
    });

    // Clear All (AC)
    const clearBtn = document.getElementById('clearBtn');
    clearBtn?.addEventListener('click', () => {
      this.stateModel.clearAll();
      this.ui.updateDisplay(this.stateModel.getState());
    });

    // Delete Last (Backspace)
    const deleteBtn = document.getElementById('deleteBtn');
    deleteBtn?.addEventListener('click', () => {
      this.stateModel.deleteLast();
      this.ui.updateDisplay(this.stateModel.getState());
    });

    // Percentage button (%)
    const percentBtn = document.getElementById('percentBtn');
    percentBtn?.addEventListener('click', () => {
      this.stateModel.applyPercentage();
      this.ui.updateDisplay(this.stateModel.getState());
    });

    // Memory Keys
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

    // History Drawer Triggers
    const historyToggleBtn = document.getElementById('historyToggleBtn');
    historyToggleBtn?.addEventListener('click', () => {
      this.ui.toggleHistoryPanel();
    });

    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    closeHistoryBtn?.addEventListener('click', () => {
      this.ui.closeHistoryPanel();
    });

    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    clearHistoryBtn?.addEventListener('click', () => {
      this.historyService.clearHistory();
      this.refreshHistory();
    });

    // Keyboard support with safe key handling
    window.addEventListener('keydown', (e: KeyboardEvent) => {
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
        this.handleOperator(e.key as Operator);
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
