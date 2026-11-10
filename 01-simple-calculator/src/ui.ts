import { CalculationRecord, CalculatorState } from './types.js';
import { CalculatorLogic } from './calculator-logic.js';

/**
 * UI Renderer and DOM Manager for the Calculator.
 */
export class CalculatorUI {
  private currentDisplay: HTMLDivElement;
  private historyDisplay: HTMLDivElement;
  private memoryIndicator: HTMLSpanElement;
  private historyListEl: HTMLDivElement;
  private historyDrawer: HTMLDivElement;

  constructor() {
    this.currentDisplay = document.getElementById('currentDisplay') as HTMLDivElement;
    this.historyDisplay = document.getElementById('historyDisplay') as HTMLDivElement;
    this.memoryIndicator = document.getElementById('memoryIndicator') as HTMLSpanElement;
    this.historyListEl = document.getElementById('historyList') as HTMLDivElement;
    this.historyDrawer = document.getElementById('historyDrawer') as HTMLDivElement;
  }

  public updateDisplay(state: CalculatorState, overrideHistory?: string): void {
    this.currentDisplay.textContent = state.currentInput;

    if (overrideHistory !== undefined) {
      this.historyDisplay.textContent = overrideHistory;
    } else if (state.previousInput !== '' && state.selectedOperator !== '') {
      const opSymbol = CalculatorLogic.formatOperator(state.selectedOperator);
      this.historyDisplay.textContent = `${state.previousInput} ${opSymbol}`;
    } else {
      this.historyDisplay.textContent = '';
    }

    if (this.memoryIndicator) {
      if (state.memoryValue !== 0) {
        this.memoryIndicator.textContent = `M: ${state.memoryValue}`;
        this.memoryIndicator.style.display = 'inline-block';
      } else {
        this.memoryIndicator.style.display = 'none';
      }
    }
  }

  public showError(message: string): void {
    this.currentDisplay.textContent = message;
    this.historyDisplay.textContent = '';
  }

  public renderHistory(records: CalculationRecord[], onSelectRecord: (record: CalculationRecord) => void): void {
    if (!this.historyListEl) return;
    this.historyListEl.innerHTML = '';

    if (records.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'history-empty';
      emptyMsg.textContent = 'No calculation history yet.';
      this.historyListEl.appendChild(emptyMsg);
      return;
    }

    records.forEach(rec => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="history-item-exp">${rec.expression}</div>
        <div class="history-item-res">${rec.result}</div>
      `;
      item.addEventListener('click', () => onSelectRecord(rec));
      this.historyListEl.appendChild(item);
    });
  }

  public toggleHistoryPanel(): void {
    if (this.historyDrawer) {
      this.historyDrawer.classList.toggle('open');
    }
  }

  public closeHistoryPanel(): void {
    if (this.historyDrawer) {
      this.historyDrawer.classList.remove('open');
    }
  }
}

