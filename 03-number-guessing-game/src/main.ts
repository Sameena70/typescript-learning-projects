import { DifficultyLevel } from './types.js';
import { GameConfigManager } from './game-config.js';
import { GameStateModel } from './game-state.js';
import { StatisticsManager } from './statistics.js';
import { GameUI } from './ui.js';

class NumberGuessingGameApp {
  private configManager: GameConfigManager;
  private stateModel: GameStateModel;
  private statsManager: StatisticsManager;
  private ui: GameUI;

  constructor() {
    this.configManager = new GameConfigManager();
    this.stateModel = new GameStateModel(this.configManager);
    this.statsManager = new StatisticsManager();
    this.ui = new GameUI();

    this.init();
  }

  private init(): void {
    this.bindEvents();
    this.syncUI();
  }

  private syncUI(): void {
    this.ui.updateHUD(this.stateModel);
    this.ui.renderGuesses(
      this.stateModel.getGuesses(),
      this.stateModel.getSecret(),
      this.stateModel.getIsGameOver()
    );

    const stats = this.statsManager.getStatistics();
    const winPct = this.statsManager.getWinPercentage();
    const avgAttempts = this.statsManager.getAverageAttempts();
    this.ui.updateStatistics(stats, winPct, avgAttempts);
    this.ui.renderGameHistory(this.statsManager.getHistory());
  }

  private restart(): void {
    this.stateModel.startNewGame();
    this.ui.resetFeedback();
    this.syncUI();
  }

  private handleGuess(guessValue: number): void {
    try {
      this.ui.clearValidationError();
      const result = this.stateModel.submitGuess(guessValue);
      this.ui.showFeedback(result);

      if (result.isGameOver) {
        const record = this.stateModel.createGameRecord();
        this.statsManager.recordGame(record);
      }

      this.syncUI();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.ui.showValidationError(error.message);
      }
    }
  }

  private bindEvents(): void {
    // Difficulty Buttons
    const diffButtons = document.querySelectorAll<HTMLButtonElement>('.diff-btn');
    diffButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const diff = btn.getAttribute('data-difficulty') as DifficultyLevel;
        if (!diff) return;

        if (diff === 'custom') {
          // Open custom modal
          const modal = document.getElementById('customDiffModal');
          if (modal) {
            modal.classList.remove('hidden');
            const minInput = document.getElementById('customMinInput') as HTMLInputElement | null;
            minInput?.focus();
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
    const customForm = document.getElementById('customDiffForm') as HTMLFormElement | null;
    customForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const minInput = document.getElementById('customMinInput') as HTMLInputElement | null;
      const maxInput = document.getElementById('customMaxInput') as HTMLInputElement | null;
      const attemptsInput = document.getElementById(
        'customAttemptsInput'
      ) as HTMLInputElement | null;

      const min = parseInt(minInput?.value || '', 10);
      const max = parseInt(maxInput?.value || '', 10);
      const attempts = parseInt(attemptsInput?.value || '', 10);

      try {
        this.configManager.setCustomConfig(min, max, attempts);
        this.stateModel.setDifficulty('custom');

        // Close modal
        const modal = document.getElementById('customDiffModal');
        modal?.classList.add('hidden');

        // Update button highlight
        diffButtons.forEach((b) => b.classList.remove('active'));
        const customBtn = document.querySelector<HTMLButtonElement>(
          '.diff-btn[data-difficulty="custom"]'
        );
        customBtn?.classList.add('active');

        this.restart();
      } catch (err: unknown) {
        const errSpan = document.getElementById('customFormError');
        if (errSpan && err instanceof Error) {
          errSpan.textContent = err.message;
        }
      }
    });

    // Cancel Custom Modal
    document.getElementById('cancelCustomBtn')?.addEventListener('click', () => {
      document.getElementById('customDiffModal')?.classList.add('hidden');
    });

    // Guess Form Submit
    const guessForm = document.getElementById('guessForm') as HTMLFormElement | null;
    guessForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('guessInput') as HTMLInputElement | null;
      if (!input || input.value.trim() === '') return;

      const guessNum = Number(input.value.trim());
      if (isNaN(guessNum)) {
        this.ui.showValidationError('Please enter a valid numeric value.');
        return;
      }

      this.handleGuess(guessNum);
      input.value = '';
    });

    // Play Again / Restart Button
    document.getElementById('restartGameBtn')?.addEventListener('click', () => {
      this.restart();
    });

    // Toggle Game History Drawer
    document.getElementById('toggleHistoryBtn')?.addEventListener('click', () => {
      this.ui.toggleHistoryDrawer();
    });

    document.getElementById('closeHistoryBtn')?.addEventListener('click', () => {
      this.ui.toggleHistoryDrawer();
    });

    // Clear History Button
    document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your game history?')) {
        this.statsManager.clearHistory();
        this.syncUI();
      }
    });

    // Reset All Statistics
    document.getElementById('resetStatsBtn')?.addEventListener('click', () => {
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
