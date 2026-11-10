import { GameRecord, GuessResult, LifetimeStatistics } from './types.js';
import { GameStateModel } from './game-state.js';

export class GameUI {
  private targetRangeDisplay: HTMLElement | null;
  private remainingAttemptsDisplay: HTMLElement | null;
  private attemptsProgressBar: HTMLElement | null;
  private feedbackBanner: HTMLElement | null;
  private feedbackIcon: HTMLElement | null;
  private feedbackTitle: HTMLElement | null;
  private feedbackMessage: HTMLElement | null;
  private guessInput: HTMLInputElement | null;
  private submitGuessBtn: HTMLButtonElement | null;
  private historyTagsContainer: HTMLElement | null;
  private validationErrorMessage: HTMLElement | null;

  // Stats elements
  private statsGamesPlayed: HTMLElement | null;
  private statsGamesWon: HTMLElement | null;
  private statsGamesLost: HTMLElement | null;
  private statsWinRate: HTMLElement | null;
  private statsBestScore: HTMLElement | null;
  private statsAvgAttempts: HTMLElement | null;

  // History panel elements
  private gameHistoryDrawer: HTMLElement | null;
  private gameHistoryList: HTMLElement | null;

  constructor() {
    this.targetRangeDisplay = document.getElementById('targetRangeDisplay');
    this.remainingAttemptsDisplay = document.getElementById('remainingAttemptsDisplay');
    this.attemptsProgressBar = document.getElementById('attemptsProgressBar');
    this.feedbackBanner = document.getElementById('feedbackBanner');
    this.feedbackIcon = document.getElementById('feedbackIcon');
    this.feedbackTitle = document.getElementById('feedbackTitle');
    this.feedbackMessage = document.getElementById('feedbackMessage');
    this.guessInput = document.getElementById('guessInput') as HTMLInputElement | null;
    this.submitGuessBtn = document.getElementById('submitGuessBtn') as HTMLButtonElement | null;
    this.historyTagsContainer = document.getElementById('historyTagsContainer');
    this.validationErrorMessage = document.getElementById('validationErrorMessage');

    this.statsGamesPlayed = document.getElementById('statsGamesPlayed');
    this.statsGamesWon = document.getElementById('statsGamesWon');
    this.statsGamesLost = document.getElementById('statsGamesLost');
    this.statsWinRate = document.getElementById('statsWinRate');
    this.statsBestScore = document.getElementById('statsBestScore');
    this.statsAvgAttempts = document.getElementById('statsAvgAttempts');

    this.gameHistoryDrawer = document.getElementById('gameHistoryDrawer');
    this.gameHistoryList = document.getElementById('gameHistoryList');
  }

  public updateHUD(state: GameStateModel): void {
    const min = state.getMin();
    const max = state.getMax();
    const remaining = state.getRemainingAttempts();
    const maxAttempts = state.getMaxAttempts();

    if (this.targetRangeDisplay) {
      this.targetRangeDisplay.textContent = `${min} - ${max}`;
    }
    if (this.remainingAttemptsDisplay) {
      this.remainingAttemptsDisplay.textContent = `${remaining} / ${maxAttempts}`;
    }
    if (this.guessInput) {
      this.guessInput.min = min.toString();
      this.guessInput.max = max.toString();
    }

    // Progress bar calculation
    if (this.attemptsProgressBar) {
      const percentage = (remaining / maxAttempts) * 100;
      this.attemptsProgressBar.style.width = `${percentage}%`;

      if (percentage > 50) {
        this.attemptsProgressBar.style.background = 'linear-gradient(90deg, #00f2fe, #4facfe)';
      } else if (percentage > 25) {
        this.attemptsProgressBar.style.background = 'linear-gradient(90deg, #f6d365, #fda085)';
      } else {
        this.attemptsProgressBar.style.background = 'linear-gradient(90deg, #ff0844, #ffb199)';
      }
    }

    const isGameOver = state.getIsGameOver();
    if (this.guessInput) {
      this.guessInput.disabled = isGameOver;
      if (!isGameOver) {
        this.guessInput.focus();
      }
    }
    if (this.submitGuessBtn) {
      this.submitGuessBtn.disabled = isGameOver;
    }
  }

  public renderGuesses(guesses: number[], targetNumber: number, isGameOver: boolean): void {
    if (!this.historyTagsContainer) return;
    this.historyTagsContainer.innerHTML = '';

    if (guesses.length === 0) {
      this.historyTagsContainer.innerHTML = '<span class="no-history">No guesses yet</span>';
      return;
    }

    guesses.forEach((guess) => {
      const tag = document.createElement('span');
      tag.className = 'guess-tag';

      if (guess === targetNumber && isGameOver) {
        tag.classList.add('tag-match');
        tag.textContent = `${guess} ✓`;
      } else if (guess > targetNumber) {
        tag.classList.add('tag-high');
        tag.textContent = `${guess} ↓`;
      } else {
        tag.classList.add('tag-low');
        tag.textContent = `${guess} ↑`;
      }

      this.historyTagsContainer?.appendChild(tag);
    });
  }

  public showFeedback(result: GuessResult): void {
    if (
      !this.feedbackBanner ||
      !this.feedbackIcon ||
      !this.feedbackTitle ||
      !this.feedbackMessage
    ) {
      return;
    }

    this.feedbackBanner.className = 'feedback-box';

    switch (result.type) {
      case 'CORRECT':
        this.feedbackBanner.classList.add('state-won');
        this.feedbackIcon.textContent = '👑';
        this.feedbackTitle.textContent = 'VICTORY!';
        break;
      case 'GAME_OVER':
        this.feedbackBanner.classList.add('state-lost');
        this.feedbackIcon.textContent = '💥';
        this.feedbackTitle.textContent = 'SYSTEM OVERLOAD';
        break;
      case 'TOO_HIGH':
        this.feedbackBanner.classList.add('state-high');
        this.feedbackIcon.textContent = '📉';
        this.feedbackTitle.textContent = 'TOO HIGH';
        break;
      case 'TOO_LOW':
        this.feedbackBanner.classList.add('state-low');
        this.feedbackIcon.textContent = '📈';
        this.feedbackTitle.textContent = 'TOO LOW';
        break;
      case 'DUPLICATE':
        this.feedbackBanner.classList.add('state-duplicate');
        this.feedbackIcon.textContent = '⚠️';
        this.feedbackTitle.textContent = 'DUPLICATE GUESS';
        break;
    }

    this.feedbackMessage.textContent = result.message;
  }

  public resetFeedback(): void {
    if (this.feedbackBanner) this.feedbackBanner.className = 'feedback-box state-neutral';
    if (this.feedbackIcon) this.feedbackIcon.textContent = '🎯';
    if (this.feedbackTitle) this.feedbackTitle.textContent = 'Make your first guess!';
    if (this.feedbackMessage) this.feedbackMessage.textContent = 'Type an integer and hit submit.';
    if (this.validationErrorMessage) this.validationErrorMessage.textContent = '';
    if (this.guessInput) {
      this.guessInput.value = '';
      this.guessInput.disabled = false;
      this.guessInput.focus();
    }
    if (this.submitGuessBtn) {
      this.submitGuessBtn.disabled = false;
    }
  }

  public showValidationError(msg: string): void {
    if (this.validationErrorMessage) {
      this.validationErrorMessage.textContent = msg;
    }
  }

  public clearValidationError(): void {
    if (this.validationErrorMessage) {
      this.validationErrorMessage.textContent = '';
    }
  }

  public updateStatistics(stats: LifetimeStatistics, winPct: number, avgAttempts: number): void {
    if (this.statsGamesPlayed) this.statsGamesPlayed.textContent = stats.totalGames.toString();
    if (this.statsGamesWon) this.statsGamesWon.textContent = stats.gamesWon.toString();
    if (this.statsGamesLost) this.statsGamesLost.textContent = stats.gamesLost.toString();
    if (this.statsWinRate) this.statsWinRate.textContent = `${winPct}%`;
    if (this.statsBestScore)
      this.statsBestScore.textContent = stats.bestScore !== null ? `${stats.bestScore} tries` : '-';
    if (this.statsAvgAttempts)
      this.statsAvgAttempts.textContent = avgAttempts > 0 ? avgAttempts.toString() : '-';
  }

  public renderGameHistory(records: GameRecord[]): void {
    if (!this.gameHistoryList) return;
    this.gameHistoryList.innerHTML = '';

    if (records.length === 0) {
      this.gameHistoryList.innerHTML =
        '<div class="no-history-msg">No game records saved yet.</div>';
      return;
    }

    records.forEach((rec) => {
      const item = document.createElement('div');
      item.className = `history-record-card ${rec.won ? 'rec-won' : 'rec-lost'}`;
      item.tabIndex = 0;
      const dateStr = new Date(rec.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const outcomeClass = rec.won ? 'won-text' : 'lost-text';
      const outcomeText = rec.won ? 'WON' : 'LOST';

      item.innerHTML = `
        <div class="rec-header">
          <span class="rec-diff">${rec.difficulty.toUpperCase()}</span>
          <span class="rec-outcome ${outcomeClass}">${outcomeText}</span>
        </div>
        <div class="rec-details">
          <span>Target: <strong>${rec.targetNumber}</strong></span>
          <span>Attempts: <strong>${rec.attemptsUsed}/${rec.maxAttempts}</strong></span>
          <span>Date: <strong>${dateStr}</strong></span>
        </div>
      `;

      this.gameHistoryList?.appendChild(item);
    });
  }

  public toggleHistoryDrawer(): void {
    this.gameHistoryDrawer?.classList.toggle('open');
  }

  public closeHistoryDrawer(): void {
    this.gameHistoryDrawer?.classList.remove('open');
  }
}
