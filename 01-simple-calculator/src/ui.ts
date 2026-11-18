import { CalculationRecord, CalculatorState, Operator, ActiveTab } from './types.js';
import { formatOperator } from './calculator-logic.js';

export class CalculatorUI {
  private currentDisplay: HTMLElement | null;
  private historyDisplay: HTMLElement | null;
  private memoryIndicator: HTMLElement | null;
  private historyListEl: HTMLElement | null;
  private historyDrawer: HTMLElement | null;
  private angleModeBtn: HTMLElement | null;

  private standardKeypad: HTMLElement | null;
  private scientificKeypad: HTMLElement | null;
  private historyPanel: HTMLElement | null;
  private settingsPanel: HTMLElement | null;
  private navBtns: NodeListOf<HTMLButtonElement>;

  constructor() {
    this.currentDisplay = document.getElementById('currentDisplay');
    this.historyDisplay = document.getElementById('historyDisplay');
    this.memoryIndicator = document.getElementById('memoryIndicator');
    this.historyListEl = document.getElementById('historyList');
    this.historyDrawer = document.getElementById('historyDrawer');
    this.angleModeBtn = document.getElementById('angleModeBtn');

    this.standardKeypad = document.getElementById('standardKeypad');
    this.scientificKeypad = document.getElementById('scientificKeypad');
    this.historyPanel = document.getElementById('historyPanel');
    this.settingsPanel = document.getElementById('settingsPanel');
    this.navBtns = document.querySelectorAll<HTMLButtonElement>('.nav-item');
  }

  public updateDisplay(state: CalculatorState, overrideHistory?: string): void {
    if (this.currentDisplay) {
      this.currentDisplay.textContent = state.currentInput;
      this.currentDisplay.classList.remove('display-error');
    }

    if (this.historyDisplay) {
      if (overrideHistory !== undefined) {
        this.historyDisplay.textContent = overrideHistory;
      } else if (state.previousInput !== '' && state.selectedOperator !== null) {
        const opSymbol = formatOperator(state.selectedOperator);
        this.historyDisplay.textContent = `${state.previousInput} ${opSymbol}`;
      } else if (state.lastExpression !== '') {
        this.historyDisplay.textContent = state.lastExpression;
      } else {
        this.historyDisplay.textContent = '';
      }
    }

    if (this.memoryIndicator) {
      if (state.memoryValue !== 0) {
        this.memoryIndicator.textContent = `M: ${state.memoryValue}`;
        this.memoryIndicator.style.display = 'inline-block';
        this.memoryIndicator.setAttribute('aria-label', `Stored in memory: ${state.memoryValue}`);
      } else {
        this.memoryIndicator.style.display = 'none';
      }
    }

    if (this.angleModeBtn) {
      this.angleModeBtn.textContent = state.angleMode;
    }

    this.updateActiveOperator(state.selectedOperator);
  }

  public switchTab(tab: ActiveTab): void {
    this.navBtns.forEach((btn) => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    if (this.standardKeypad) this.standardKeypad.style.display = tab === 'standard' ? 'grid' : 'none';
    if (this.scientificKeypad) this.scientificKeypad.style.display = tab === 'scientific' ? 'grid' : 'none';
    if (this.historyPanel) this.historyPanel.style.display = tab === 'history' ? 'flex' : 'none';
    if (this.settingsPanel) this.settingsPanel.style.display = tab === 'settings' ? 'flex' : 'none';
  }

  public showError(message: string): void {
    if (this.currentDisplay) {
      this.currentDisplay.textContent = message;
      this.currentDisplay.classList.add('display-error');
    }
    if (this.historyDisplay) {
      this.historyDisplay.textContent = '';
    }
  }

  public updateActiveOperator(activeOperator: Operator | null | string): void {
    const operatorBtns = document.querySelectorAll<HTMLButtonElement>('.btn-operator');
    operatorBtns.forEach((btn) => {
      const op = btn.getAttribute('data-operator');
      if (op === activeOperator && activeOperator !== null && activeOperator !== '') {
        btn.classList.add('active-operator');
      } else {
        btn.classList.remove('active-operator');
      }
    });
  }

  public renderHistory(
    records: CalculationRecord[],
    onSelectRecord: (record: CalculationRecord) => void,
    onDeleteRecord: (id: string) => void
  ): void {
    const containers = [this.historyListEl, document.getElementById('historyViewList')];

    containers.forEach((container) => {
      if (!container) return;
      container.innerHTML = '';

      if (records.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'history-empty';
        emptyMsg.textContent = 'No calculation history yet.';
        container.appendChild(emptyMsg);
        return;
      }

      records.forEach((rec) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.tabIndex = 0;
        item.setAttribute('role', 'button');

        const contentDiv = document.createElement('div');
        contentDiv.className = 'history-item-content';

        const expDiv = document.createElement('div');
        expDiv.className = 'history-item-exp';
        expDiv.textContent = rec.expression;

        const resDiv = document.createElement('div');
        resDiv.className = 'history-item-res';
        resDiv.textContent = rec.result;

        contentDiv.appendChild(expDiv);
        contentDiv.appendChild(resDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'history-item-actions';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-icon-history';
        copyBtn.title = 'Copy result';
        copyBtn.innerHTML = '📋';
        copyBtn.type = 'button';
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard?.writeText(rec.result);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-icon-history btn-del-history';
        deleteBtn.title = 'Delete record';
        deleteBtn.innerHTML = '✕';
        deleteBtn.type = 'button';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onDeleteRecord(rec.id);
        });

        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(deleteBtn);

        item.appendChild(contentDiv);
        item.appendChild(actionsDiv);

        item.addEventListener('click', () => onSelectRecord(rec));
        item.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectRecord(rec);
          }
        });

        container.appendChild(item);
      });
    });
  }

  public toggleHistoryPanel(): void {
    if (this.historyDrawer) {
      this.historyDrawer.classList.toggle('open');
    }
  }

  public openHistoryPanel(): void {
    if (this.historyDrawer) {
      this.historyDrawer.classList.add('open');
    }
  }

  public closeHistoryPanel(): void {
    if (this.historyDrawer) {
      this.historyDrawer.classList.remove('open');
    }
  }
}
