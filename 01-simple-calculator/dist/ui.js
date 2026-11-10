import { CalculatorLogic } from './calculator-logic.js';
/**
 * UI Renderer and DOM Manager for the Calculator.
 */
export class CalculatorUI {
    constructor() {
        this.currentDisplay = document.getElementById('currentDisplay');
        this.historyDisplay = document.getElementById('historyDisplay');
        this.memoryIndicator = document.getElementById('memoryIndicator');
        this.historyListEl = document.getElementById('historyList');
        this.historyDrawer = document.getElementById('historyDrawer');
    }
    updateDisplay(state, overrideHistory) {
        this.currentDisplay.textContent = state.currentInput;
        if (overrideHistory !== undefined) {
            this.historyDisplay.textContent = overrideHistory;
        }
        else if (state.previousInput !== '' && state.selectedOperator !== '') {
            const opSymbol = CalculatorLogic.formatOperator(state.selectedOperator);
            this.historyDisplay.textContent = `${state.previousInput} ${opSymbol}`;
        }
        else {
            this.historyDisplay.textContent = '';
        }
        if (this.memoryIndicator) {
            if (state.memoryValue !== 0) {
                this.memoryIndicator.textContent = `M: ${state.memoryValue}`;
                this.memoryIndicator.style.display = 'inline-block';
            }
            else {
                this.memoryIndicator.style.display = 'none';
            }
        }
    }
    showError(message) {
        this.currentDisplay.textContent = message;
        this.historyDisplay.textContent = '';
    }
    renderHistory(records, onSelectRecord) {
        if (!this.historyListEl)
            return;
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
    toggleHistoryPanel() {
        if (this.historyDrawer) {
            this.historyDrawer.classList.toggle('open');
        }
    }
    closeHistoryPanel() {
        if (this.historyDrawer) {
            this.historyDrawer.classList.remove('open');
        }
    }
}
