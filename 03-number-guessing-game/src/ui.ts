import { GameRecord, GuessResult, LifetimeStatistics } from './types.js';
import { GameStateModel } from './game-state.js';

export class GameUI {
  private targetRangeDisplay: HTMLElement;
  private remainingAttemptsDisplay: HTMLElement;
  private attemptsProgressBar: HTMLElement;
  private feedbackBanner: HTMLElement;
  private feedbackIcon: HTMLElement;
  private feedbackTitle: HTMLElement;
  private feedbackMessage: HTMLElement;
  private guessInput: HTMLInputElement;
  private submitGuessBtn: HTMLButtonElement;
  private historyTagsContainer: HTMLElement;
  private validationErrorMessage: HTMLElement;

  // Stats elements
  private statsGamesPlayed: HTMLElement;
  private statsGamesWon: HTMLElement;
  private statsGamesLost: HTMLElement;
  private statsWinRate: HTMLElement;
  private statsBestScore: HTMLElement;
  private statsAvgAttempts: HTMLElement;

  // History panel elements
  private gameHistoryDrawer: HTMLElement;
  private gameHistoryList: HTMLElement;

  constructor() {
    this.targetRangeDisplay = document.getElementById('targetRangeDisplay')!;
    this.remainingAttemptsDisplay = document.getElementById('remainingAttemptsDisplay')!;
    this.attemptsProgressBar = document.getElementById('attemptsProgressBar')!;
    this.feedbackBanner = document.getElementById('feedbackBanner')!;
    this.feedbackIcon = document.getElementById('feedbackIcon')!;
    this.feedbackTitle = document.getElementById('feedbackTitle')!;
    this.feedbackMessage = document.getElementById('feedbackMessage')!;
    this.guessInput = document.getElementById('guessInput') as HTMLInputElement;
    this.submitGuessBtn = document.getElementById('submitGuessBtn') as HTMLButtonElement;
    this.historyTagsContainer = document.getElementById('historyTagsContainer')!;
    this.validationErrorMessage = document.getElementById('validationErrorMessage')!;

    this.statsGamesPlayed = document.getElementById('statsGamesPlayed')!;
    this.statsGamesWon = document.getElementById('statsGamesWon')!;
    this.statsGamesLost = document.getElementById('statsGamesLost')!;
    this.statsWinRate = document.getElementById('statsWinRate')!;
    this.statsBestScore = document.getElementById('statsBestScore')!;
    this.statsAvgAttempts = document.getElementById('statsAvgAttempts')!;

    this.gameHistoryDrawer = document.getElementById('gameHistoryDrawer')!;
    this.gameHistoryList = document.getElementById('gameHistoryList')!;
  }

  public updateHUD(state: GameStateModel): void {
    const min = state.getMin();
    const max = state.getMax();
    const remaining = state.getRemainingAttempts();
    const maxAttempts = state.getMaxAttempts();

    this.targetRangeDisplay.textContent = `${min} - ${max}`;
    this.remainingAttemptsDisplay.textContent = `${remaining} / ${maxAttempts}`;
    this.guessInput.min = min.toString();
    this.guessInput.max = max.toString();

    // Progress bar calculation
    const percentage = (remaining / maxAttempts) * 100;
    this.attemptsProgressBar.style.width = `${percentage}%`;

    if (percentage > 50) {
      this.attemptsProgressBar.style.background = 'linear-gradient(90deg, #00f2fe, #4facfe)';
    } else if (percentage > 25) {
      this.attemptsProgressBar.style.background = 'linear-gradient(90deg, #f6d365, #fda085)';
    } else {
      this.attemptsProgressBar.style.background = 'linear-gradient(90deg, #ff0844, #ffb199)';
    }

    if (state.getIsGameOver()) {
      this.guessInput.disabled = true;
      this.submitGuessBtn.disabled = true;
    } else {
      this.guessInput.disabled = false;
      this.submitGuessBtn.disabled = false;
    }
  }

  public renderGuesses(guesses: number[], targetNumber: number, isGameOver: boolean): void {
    this.historyTagsContainer.innerHTML = '';

    if (guesses.length === 0) {
      this.historyTagsContainer.innerHTML = '<span class="no-history">No guesses yet</span>';
      return;
    }

    guesses.forEach(guess => {
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

      this.historyTagsContainer.appendChild(tag);
    });
  }

  public showFeedback(result: GuessResult): void {
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
    this.feedbackBanner.className = 'feedback-box state-neutral';
    this.feedbackIcon.textContent = '🎯';
    this.feedbackTitle.textContent = 'Make your first guess!';
    this.feedbackMessage.textContent = 'Type an integer and hit submit.';
    this.validationErrorMessage.textContent = '';
    this.guessInput.value = '';
    this.guessInput.focus();
  }

  public showValidationError(msg: string): void {
    this.validationErrorMessage.textContent = msg;
  }

  public clearValidationError(): void {
    this.validationErrorMessage.textContent = '';
  }

  public updateStatistics(stats: LifetimeStatistics, winPct: number, avgAttempts: number): void {
    if (this.statsGamesPlayed) this.statsGamesPlayed.textContent = stats.totalGames.toString();
    if (this.statsGamesWon) this.statsGamesWon.textContent = stats.gamesWon.toString();
    if (this.statsGamesLost) this.statsGamesLost.textContent = stats.gamesLost.toString();
    if (this.statsWinRate) this.statsWinRate.textContent = `${winPct}%`;
    if (this.statsBestScore) this.statsBestScore.textContent = stats.bestScore !== null ? `${stats.bestScore} tries` : '-';
    if (this.statsAvgAttempts) this.statsAvgAttempts.textContent = avgAttempts > 0 ? avgAttempts.toString() : '-';
  }

  public renderGameHistory(records: GameRecord[]): void {
    if (!this.gameHistoryList) return;
    this.gameHistoryList.innerHTML = '';

    if (records.length === 0) {
      this.gameHistoryList.innerHTML = '<div class="no-history-msg">No game records saved yet.</div>';
      return;
    }

    records.forEach(rec => {
      const item = document.createElement('div');
      item.className = `history-record-card ${rec.won ? 'rec-won' : 'rec-lost'}`;
      const dateStr = new Date(rec.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      item.innerHTML = `
        <div class="rec-header">
          <span class="rec-diff">${rec.difficulty.toUpperCase()}</span>
          <span class="rec-outcome ${rec.won ? 'won-text' : 'lost-text'}">${rec.won ? 'WON' : 'LOST'}</span>
        </div>
        <div class="rec-details">
          <span>Target: <strong>${rec.targetNumber}</strong></span>
          <span>Attempts: <strong>${rec.attemptsUsed}/${rec.maxAttempts}</strong></span>
          <span>Date: <strong>${dateStr}</strong></span>
        </div>
      `;

      this.gameHistoryList.appendChild(item);
    });
  }

  public toggleHistoryDrawer(): void {
    this.gameHistoryDrawer?.classList.toggle('open');
  }

  public closeHistoryDrawer(): void {
    this.gameHistoryDrawer?.classList.remove('open');
  }
}

