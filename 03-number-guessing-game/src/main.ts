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
      const errEl = document.getElementById('customDiffError');

      const rawMin = minInput?.value.trim() ?? '';
      const rawMax = maxInput?.value.trim() ?? '';
      const rawAttempts = attemptsInput?.value.trim() ?? '';

      const min = parseInt(rawMin, 10);
      const max = parseInt(rawMax, 10);
      const attempts = parseInt(rawAttempts, 10);

      if (isNaN(min) || isNaN(max) || isNaN(attempts)) {
        if (errEl) errEl.textContent = 'Please enter valid whole numbers for all fields.';
        return;
      }

      try {
        this.configManager.setCustomConfig(min, max, attempts);
        document.getElementById('customDiffModal')?.classList.add('hidden');
        if (errEl) errEl.textContent = '';

        diffButtons.forEach((b) => b.classList.remove('active'));
        document.querySelector('.diff-btn[data-difficulty="custom"]')?.classList.add('active');

        this.stateModel.setDifficulty('custom');
        this.restart();
      } catch (err: unknown) {
        if (err instanceof Error && errEl) {
          errEl.textContent = err.message;
        }
      }
    });

    document.getElementById('closeCustomModalBtn')?.addEventListener('click', () => {
      document.getElementById('customDiffModal')?.classList.add('hidden');
    });
    document.getElementById('cancelCustomBtn')?.addEventListener('click', () => {
      document.getElementById('customDiffModal')?.classList.add('hidden');
    });

    // Guess Form Submission
    const guessForm = document.getElementById('guessForm') as HTMLFormElement | null;
    const guessInput = document.getElementById('guessInput') as HTMLInputElement | null;

    guessForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawVal = guessInput?.value.trim() ?? '';
      if (rawVal === '') {
        this.ui.showValidationError('Please enter a number to submit a guess.');
        return;
      }

      if (!/^-?\d+$/.test(rawVal)) {
        this.ui.showValidationError(
          'Decimal values are not allowed. Please enter a whole integer.'
        );
        return;
      }

      const val = parseInt(rawVal, 10);
      this.handleGuess(val);
      if (guessInput) {
        guessInput.value = '';
      }
    });

    // Restart button
    document.getElementById('restartGameBtn')?.addEventListener('click', () => {
      this.restart();
    });

    // History controls
    document.getElementById('openGameHistoryBtn')?.addEventListener('click', () => {
      this.ui.toggleHistoryDrawer();
    });
    document.getElementById('closeGameHistoryBtn')?.addEventListener('click', () => {
      this.ui.closeHistoryDrawer();
    });
    document.getElementById('clearGameHistoryBtn')?.addEventListener('click', () => {
      if (confirm('Clear all saved game records?')) {
        this.statsManager.clearHistory();
        this.ui.renderGameHistory([]);
      }
    });

    // Close drawers on Escape key
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.ui.closeHistoryDrawer();
        document.getElementById('customDiffModal')?.classList.add('hidden');
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new NumberGuessingGameApp();
});
