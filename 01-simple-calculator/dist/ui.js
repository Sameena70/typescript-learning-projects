import { CalculatorLogic } from './calculator-logic.js';
/**
 * UI Renderer and DOM Manager for the Calculator.
 * Employs safe element retrieval with defensive checks and type-safe operator formatting.
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
        if (this.currentDisplay) {
            this.currentDisplay.textContent = state.currentInput;
            this.currentDisplay.classList.remove('display-error');
        }
        if (this.historyDisplay) {
            if (overrideHistory !== undefined) {
                this.historyDisplay.textContent = overrideHistory;
            }
            else if (state.previousInput !== '' && state.selectedOperator !== null) {
                const opSymbol = CalculatorLogic.formatOperator(state.selectedOperator);
                this.historyDisplay.textContent = `${state.previousInput} ${opSymbol}`;
            }
            else if (state.lastExpression !== '') {
                this.historyDisplay.textContent = state.lastExpression;
            }
            else {
                this.historyDisplay.textContent = '';
            }
        }
        if (this.memoryIndicator) {
            if (state.memoryValue !== 0) {
                this.memoryIndicator.textContent = `M: ${state.memoryValue}`;
                this.memoryIndicator.style.display = 'inline-block';
                this.memoryIndicator.setAttribute('aria-label', `Stored in memory: ${state.memoryValue}`);
            }
            else {
                this.memoryIndicator.style.display = 'none';
            }
        }
        this.updateActiveOperator(state.selectedOperator);
    }
    showError(message) {
        if (this.currentDisplay) {
            this.currentDisplay.textContent = message;
            this.currentDisplay.classList.add('display-error');
        }
        if (this.historyDisplay) {
            this.historyDisplay.textContent = '';
        }
    }
    updateActiveOperator(activeOperator) {
        const operatorBtns = document.querySelectorAll('.btn-operator');
        operatorBtns.forEach((btn) => {
            const op = btn.getAttribute('data-operator');
            if (op === activeOperator && activeOperator !== null && activeOperator !== '') {
                btn.classList.add('active-operator');
            }
            else {
                btn.classList.remove('active-operator');
            }
        });
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
        records.forEach((rec) => {
            var _a;
            const item = document.createElement('div');
            item.className = 'history-item';
            item.tabIndex = 0;
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `Recall calculation: ${rec.expression} ${rec.result}`);
            const expDiv = document.createElement('div');
            expDiv.className = 'history-item-exp';
            expDiv.textContent = rec.expression;
            const resDiv = document.createElement('div');
            resDiv.className = 'history-item-res';
            resDiv.textContent = rec.result;
            item.appendChild(expDiv);
            item.appendChild(resDiv);
            item.addEventListener('click', () => onSelectRecord(rec));
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectRecord(rec);
                }
            });
            (_a = this.historyListEl) === null || _a === void 0 ? void 0 : _a.appendChild(item);
        });
    }
    toggleHistoryPanel() {
        if (this.historyDrawer) {
            this.historyDrawer.classList.toggle('open');
        }
    }
    openHistoryPanel() {
        if (this.historyDrawer) {
            this.historyDrawer.classList.add('open');
        }
    }
    closeHistoryPanel() {
        if (this.historyDrawer) {
            this.historyDrawer.classList.remove('open');
        }
    }
}
