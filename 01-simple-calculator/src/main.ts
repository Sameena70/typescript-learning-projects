import { CalculatorStateModel } from './calculator-state.js';
import { HistoryService } from './history-service.js';
import { CalculatorUI } from './ui.js';
import { Operator, CalculationRecord, ActiveTab, AngleMode } from './types.js';

export class CalculatorApp {
  private stateModel: CalculatorStateModel;
  private historyService: HistoryService;
  private ui: CalculatorUI;

  constructor(
    stateModel: CalculatorStateModel = new CalculatorStateModel(),
    historyService: HistoryService = new HistoryService(),
    ui: CalculatorUI = new CalculatorUI()
  ) {
    this.stateModel = stateModel;
    this.historyService = historyService;
    this.ui = ui;

    this.init();
  }

  private init(): void {
    this.bindEvents();
    this.refreshHistory();
    this.ui.updateDisplay(this.stateModel.getState());
  }

  private refreshHistory(): void {
    const history = this.historyService.getHistory();
    this.ui.renderHistory(
      history,
      (record: CalculationRecord) => {
        this.stateModel.clearAll();
        this.stateModel.appendDigit(record.result);
        this.ui.updateDisplay(this.stateModel.getState(), record.expression);
        this.ui.closeHistoryPanel();
        this.switchTab('standard');
      },
      (id: string) => {
        this.historyService.deleteRecord(id);
        this.refreshHistory();
      }
    );
  }

  private switchTab(tab: ActiveTab): void {
    this.stateModel.setActiveTab(tab);
    this.ui.switchTab(tab);
  }

  private handleOperator(operator: Operator): void {
    const outcome = this.stateModel.setOperator(operator);
    if (outcome.status === 'error') {
      this.ui.showError(outcome.error);
    } else if (outcome.status === 'success') {
      this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave, 'standard');
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
      this.historyService.addRecord(
        outcome.expressionToSave,
        outcome.resultToSave,
        this.stateModel.getState().activeTab === 'scientific' ? 'scientific' : 'standard'
      );
      this.refreshHistory();
      this.ui.updateDisplay(this.stateModel.getState(), outcome.expressionToSave);
    } else {
      this.ui.updateDisplay(this.stateModel.getState());
    }
  }

  private handleUnaryScientific(funcName: string): void {
    const outcome = this.stateModel.applyUnaryScientific(funcName);
    if (outcome.status === 'error') {
      this.ui.showError(outcome.error);
    } else if (outcome.status === 'success') {
      this.historyService.addRecord(outcome.expressionToSave, outcome.resultToSave, 'scientific');
      this.refreshHistory();
      this.ui.updateDisplay(this.stateModel.getState(), outcome.expressionToSave);
    } else {
      this.ui.updateDisplay(this.stateModel.getState());
    }
  }

  private bindEvents(): void {
    // Navigation Tabs
    const navBtns = document.querySelectorAll<HTMLButtonElement>('.nav-item');
    navBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab') as ActiveTab | null;
        if (tab) this.switchTab(tab);
      });
    });

    // Angle mode button (DEG/RAD)
    const angleBtn = document.getElementById('angleModeBtn');
    angleBtn?.addEventListener('click', () => {
      this.stateModel.toggleAngleMode();
      this.ui.updateDisplay(this.stateModel.getState());
    });

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

    // Decimal buttons
    const decimalBtns = document.querySelectorAll<HTMLButtonElement>('.btn-decimal');
    decimalBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.stateModel.appendDecimal();
        this.ui.updateDisplay(this.stateModel.getState());
      });
    });

    // Negation buttons (toggle sign)
    const signBtns = document.querySelectorAll<HTMLButtonElement>('.btn-sign');
    signBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.stateModel.toggleSign();
        this.ui.updateDisplay(this.stateModel.getState());
      });
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

    // Equals buttons
    const equalsBtns = document.querySelectorAll<HTMLButtonElement>('.btn-equals');
    equalsBtns.forEach((btn) => {
      btn.addEventListener('click', () => this.handleEquals());
    });

    // Clear All (C / AC)
    const clearBtns = document.querySelectorAll<HTMLButtonElement>('.btn-clear');
    clearBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.stateModel.clearAll();
        this.ui.updateDisplay(this.stateModel.getState());
      });
    });

    // Delete Last (DEL / Backspace)
    const deleteBtns = document.querySelectorAll<HTMLButtonElement>('.btn-del');
    deleteBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.stateModel.deleteLast();
        this.ui.updateDisplay(this.stateModel.getState());
      });
    });

    // Percentage buttons
    const percentBtns = document.querySelectorAll<HTMLButtonElement>('.btn-percent');
    percentBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.stateModel.applyPercentage();
        this.ui.updateDisplay(this.stateModel.getState());
      });
    });

    // Scientific specific buttons
    const sciFuncBtns = document.querySelectorAll<HTMLButtonElement>('[data-sci-func]');
    sciFuncBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const fn = btn.getAttribute('data-sci-func');
        if (fn) this.handleUnaryScientific(fn);
      });
    });

    // Scientific append buttons: (, ), pi, e, power, ans
    const sciAppendBtns = document.querySelectorAll<HTMLButtonElement>('[data-sci-append]');
    sciAppendBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-sci-append');
        if (text === 'ans') {
          this.stateModel.appendText(this.stateModel.getState().lastAnswer);
        } else if (text !== null) {
          this.stateModel.appendText(text);
        }
        this.ui.updateDisplay(this.stateModel.getState());
      });
    });

    // Memory operations
    const bindMemory = (id: string, action: () => void): void => {
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

    document.getElementById('closeHistoryBtn')?.addEventListener('click', () => {
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
    const angleSetting = document.getElementById('settingAngleMode') as HTMLSelectElement | null;
    angleSetting?.addEventListener('change', () => {
      const mode = angleSetting.value as AngleMode;
      this.stateModel.updateSettings({ defaultAngleMode: mode });
      this.ui.updateDisplay(this.stateModel.getState());
    });

    const precisionSetting = document.getElementById('settingPrecision') as HTMLSelectElement | null;
    precisionSetting?.addEventListener('change', () => {
      const prec = parseInt(precisionSetting.value, 10);
      this.stateModel.updateSettings({ precision: prec });
      this.ui.updateDisplay(this.stateModel.getState());
    });

    document.getElementById('clearMemorySettingBtn')?.addEventListener('click', () => {
      this.stateModel.memoryClear();
      this.ui.updateDisplay(this.stateModel.getState());
      alert('Memory has been cleared.');
    });

    // Keyboard support
    window.addEventListener('keydown', (e: KeyboardEvent) => {
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

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new CalculatorApp();
  });
}
