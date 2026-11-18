import { GameConfigManager } from './game-config.js';
import { GameStateModel } from './game-state.js';
import { StatisticsManager } from './statistics.js';
import { GameUI } from './ui.js';
/**
 * Application Controller for Number Guessing Game.
 * Orchestrates event handling, state updates, persistence, and UI synchronization.
 * Supports constructor Dependency Injection for testability and modularity.
 */
export class NumberGuessingGameApp {
    constructor(configManager = new GameConfigManager(), stateModel = new GameStateModel(configManager), statsManager = new StatisticsManager(), ui = new GameUI()) {
        this.configManager = configManager;
        this.stateModel = stateModel;
        this.statsManager = statsManager;
        this.ui = ui;
        this.init();
    }
    init() {
        // Start on medium to mirror reference screenshot (1-100)
        this.stateModel.setDifficulty('medium');
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
        this.ui.resetFeedback(this.stateModel.getMin(), this.stateModel.getMax());
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
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // Difficulty Buttons
        const diffButtons = document.querySelectorAll('.diff-card-btn');
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
            e.preventDefault();
            const minInput = document.getElementById('customMinInput');
            const maxInput = document.getElementById('customMaxInput');
            const attemptsInput = document.getElementById('customAttemptsInput');
            const min = parseInt((minInput === null || minInput === void 0 ? void 0 : minInput.value) || '', 10);
            const max = parseInt((maxInput === null || maxInput === void 0 ? void 0 : maxInput.value) || '', 10);
            const attempts = parseInt((attemptsInput === null || attemptsInput === void 0 ? void 0 : attemptsInput.value) || '', 10);
            try {
                this.configManager.setCustomConfig(min, max, attempts);
                this.stateModel.setDifficulty('custom');
                // Close modal
                const modal = document.getElementById('customDiffModal');
                modal === null || modal === void 0 ? void 0 : modal.classList.add('hidden');
                // Update custom button label and highlight
                diffButtons.forEach((b) => b.classList.remove('active'));
                const customBtn = document.querySelector('.diff-card-btn[data-difficulty="custom"]');
                customBtn === null || customBtn === void 0 ? void 0 : customBtn.classList.add('active');
                const customRangeLabel = document.getElementById('customRangeLabel');
                if (customRangeLabel) {
                    customRangeLabel.textContent = `(${min}–${max})`;
                }
                this.restart();
            }
            catch (err) {
                const errSpan = document.getElementById('customFormError');
                if (errSpan && err instanceof Error) {
                    errSpan.textContent = err.message;
                }
            }
        });
        // Close Custom Modal triggers
        (_a = document.getElementById('cancelCustomBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            var _a;
            (_a = document.getElementById('customDiffModal')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
        });
        (_b = document.getElementById('closeCustomModalBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            var _a;
            (_a = document.getElementById('customDiffModal')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
        });
        // Guess Form Submit
        const guessForm = document.getElementById('guessForm');
        guessForm === null || guessForm === void 0 ? void 0 : guessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('guessInput');
            if (!input || input.value.trim() === '')
                return;
            const guessNum = Number(input.value.trim());
            if (isNaN(guessNum)) {
                this.ui.showValidationError('Please enter a valid numeric value.');
                return;
            }
            this.handleGuess(guessNum);
            input.value = '';
        });
        // Restart / New Game Button
        (_c = document.getElementById('restartGameBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.restart();
        });
        // Toggle Game History Drawer
        (_d = document.getElementById('toggleHistoryBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.ui.toggleHistoryDrawer();
        });
        (_e = document.getElementById('closeHistoryBtn')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            this.ui.toggleHistoryDrawer();
        });
        (_f = document.getElementById('bestScoreBadge')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
            this.ui.toggleHistoryDrawer();
        });
        // Clear History Button
        (_g = document.getElementById('clearHistoryBtn')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your game match records?')) {
                this.statsManager.clearHistory();
                this.syncUI();
            }
        });
        // Reset All Statistics
        (_h = document.getElementById('resetStatsBtn')) === null || _h === void 0 ? void 0 : _h.addEventListener('click', () => {
            if (confirm('Permanently reset all games played, wins, losses, and best scores?')) {
                this.statsManager.resetStatistics();
                this.syncUI();
            }
        });
    }
}
// Bootstrap application on DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new NumberGuessingGameApp();
    });
}
