import { GameConfigManager } from './game-config.js';
import { GameStateModel } from './game-state.js';
import { StatisticsManager } from './statistics.js';
import { GameUI } from './ui.js';
class NumberGuessingGameApp {
    constructor() {
        this.configManager = new GameConfigManager();
        this.stateModel = new GameStateModel(this.configManager);
        this.statsManager = new StatisticsManager();
        this.ui = new GameUI();
        this.init();
    }
    init() {
        this.bindEvents();
        this.syncUI();
    }
    syncUI() {
        this.ui.updateHUD(this.stateModel);
        this.ui.renderGuesses(this.stateModel.getGuesses(), this.stateModel.getSecret(), this.stateModel.getIsGameOver());
        const stats = this.statsManager.getStatistics();
        const winPct = this.statsManager.getWinPercentage();
        const avgAttempts = this.statsManager.getAverageAttempts();
        this.ui.updateStatistics(stats, winPct, avgAttempts);
        this.ui.renderGameHistory(this.statsManager.getHistory());
    }
    restart() {
        this.stateModel.startNewGame();
        this.ui.resetFeedback();
        this.syncUI();
    }
    handleGuess(guessValue) {
        try {
            this.ui.clearValidationError();
            const result = this.stateModel.submitGuess(guessValue);
            this.ui.showFeedback(result);
            if (result.isGameOver) {
                const record = this.stateModel.createGameRecord();
                this.statsManager.recordGame(record);
            }
            this.syncUI();
        }
        catch (error) {
            if (error instanceof Error) {
                this.ui.showValidationError(error.message);
            }
        }
    }
    bindEvents() {
        var _a, _b, _c, _d, _e, _f;
        // Difficulty Buttons
        const diffButtons = document.querySelectorAll('.diff-btn');
        diffButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const diff = btn.getAttribute('data-difficulty');
                if (!diff)
                    return;
                if (diff === 'custom') {
                    // Open custom modal
                    const modal = document.getElementById('customDiffModal');
                    if (modal) {
                        modal.classList.remove('hidden');
                        const minInput = document.getElementById('customMinInput');
                        minInput === null || minInput === void 0 ? void 0 : minInput.focus();
                    }
                    return;
                }
                diffButtons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                this.stateModel.setDifficulty(diff);
                this.restart();
            });
        });
        // Custom Difficulty Form
        const customForm = document.getElementById('customDiffForm');
        customForm === null || customForm === void 0 ? void 0 : customForm.addEventListener('submit', (e) => {
            var _a, _b, _c, _d, _e;
            e.preventDefault();
            const minInput = document.getElementById('customMinInput');
            const maxInput = document.getElementById('customMaxInput');
            const attemptsInput = document.getElementById('customAttemptsInput');
            const errEl = document.getElementById('customDiffError');
            const rawMin = (_a = minInput === null || minInput === void 0 ? void 0 : minInput.value.trim()) !== null && _a !== void 0 ? _a : '';
            const rawMax = (_b = maxInput === null || maxInput === void 0 ? void 0 : maxInput.value.trim()) !== null && _b !== void 0 ? _b : '';
            const rawAttempts = (_c = attemptsInput === null || attemptsInput === void 0 ? void 0 : attemptsInput.value.trim()) !== null && _c !== void 0 ? _c : '';
            const min = parseInt(rawMin, 10);
            const max = parseInt(rawMax, 10);
            const attempts = parseInt(rawAttempts, 10);
            if (isNaN(min) || isNaN(max) || isNaN(attempts)) {
                if (errEl)
                    errEl.textContent = 'Please enter valid whole numbers for all fields.';
                return;
            }
            try {
                this.configManager.setCustomConfig(min, max, attempts);
                (_d = document.getElementById('customDiffModal')) === null || _d === void 0 ? void 0 : _d.classList.add('hidden');
                if (errEl)
                    errEl.textContent = '';
                diffButtons.forEach((b) => b.classList.remove('active'));
                (_e = document.querySelector('.diff-btn[data-difficulty="custom"]')) === null || _e === void 0 ? void 0 : _e.classList.add('active');
                this.stateModel.setDifficulty('custom');
                this.restart();
            }
            catch (err) {
                if (err instanceof Error && errEl) {
                    errEl.textContent = err.message;
                }
            }
        });
        (_a = document.getElementById('closeCustomModalBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            var _a;
            (_a = document.getElementById('customDiffModal')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
        });
        (_b = document.getElementById('cancelCustomBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            var _a;
            (_a = document.getElementById('customDiffModal')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
        });
        // Guess Form Submission
        const guessForm = document.getElementById('guessForm');
        const guessInput = document.getElementById('guessInput');
        guessForm === null || guessForm === void 0 ? void 0 : guessForm.addEventListener('submit', (e) => {
            var _a;
            e.preventDefault();
            const rawVal = (_a = guessInput === null || guessInput === void 0 ? void 0 : guessInput.value.trim()) !== null && _a !== void 0 ? _a : '';
            if (rawVal === '') {
                this.ui.showValidationError('Please enter a number to submit a guess.');
                return;
            }
            if (!/^-?\d+$/.test(rawVal)) {
                this.ui.showValidationError('Decimal values are not allowed. Please enter a whole integer.');
                return;
            }
            const val = parseInt(rawVal, 10);
            this.handleGuess(val);
            if (guessInput) {
                guessInput.value = '';
            }
        });
        // Restart button
        (_c = document.getElementById('restartGameBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.restart();
        });
        // History controls
        (_d = document.getElementById('openGameHistoryBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.ui.toggleHistoryDrawer();
        });
        (_e = document.getElementById('closeGameHistoryBtn')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            this.ui.closeHistoryDrawer();
        });
        (_f = document.getElementById('clearGameHistoryBtn')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
            if (confirm('Clear all saved game records?')) {
                this.statsManager.clearHistory();
                this.ui.renderGameHistory([]);
            }
        });
        // Close drawers on Escape key
        window.addEventListener('keydown', (e) => {
            var _a;
            if (e.key === 'Escape') {
                this.ui.closeHistoryDrawer();
                (_a = document.getElementById('customDiffModal')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
            }
        });
    }
}
window.addEventListener('DOMContentLoaded', () => {
    new NumberGuessingGameApp();
});
