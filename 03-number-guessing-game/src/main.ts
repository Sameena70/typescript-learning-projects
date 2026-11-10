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
    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.getAttribute('data-difficulty') as DifficultyLevel;
        if (!diff) return;

        if (diff === 'custom') {
          // Open custom modal
          document.getElementById('customDiffModal')?.classList.remove('hidden');
          return;
        }

        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.stateModel.setDifficulty(diff);
        this.restart();
      });
    });

    // Custom Difficulty Form
    const customForm = document.getElementById('customDiffForm') as HTMLFormElement;
    customForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const min = parseInt((document.getElementById('customMinInput') as HTMLInputElement).value, 10);
      const max = parseInt((document.getElementById('customMaxInput') as HTMLInputElement).value, 10);
      const attempts = parseInt((document.getElementById('customAttemptsInput') as HTMLInputElement).value, 10);
      const errEl = document.getElementById('customDiffError')!;

      try {
        this.configManager.setCustomConfig(min, max, attempts);
        document.getElementById('customDiffModal')?.classList.add('hidden');
        errEl.textContent = '';

        diffButtons.forEach(b => b.classList.remove('active'));
        document.querySelector('.diff-btn[data-difficulty="custom"]')?.classList.add('active');

        this.stateModel.setDifficulty('custom');
        this.restart();
      } catch (err: unknown) {
        if (err instanceof Error) {
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
    const guessForm = document.getElementById('guessForm') as HTMLFormElement;
    const guessInput = document.getElementById('guessInput') as HTMLInputElement;

    guessForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseInt(guessInput.value.trim(), 10);
      if (isNaN(val)) {
        this.ui.showValidationError('Please enter a valid whole number.');
        return;
      }
      this.handleGuess(val);
      guessInput.value = '';
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
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new NumberGuessingGameApp();
});

