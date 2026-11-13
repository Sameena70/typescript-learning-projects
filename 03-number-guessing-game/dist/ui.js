import { assertNever } from './game-logic.js';
export class GameUI {
    constructor() {
        this.targetRangeDisplay = document.getElementById('targetRangeDisplay');
        this.remainingAttemptsDisplay = document.getElementById('remainingAttemptsDisplay');
        this.attemptsProgressBar = document.getElementById('attemptsProgressBar');
        this.feedbackBanner = document.getElementById('feedbackBanner');
        this.feedbackIcon = document.getElementById('feedbackIcon');
        this.feedbackTitle = document.getElementById('feedbackTitle');
        this.feedbackMessage = document.getElementById('feedbackMessage');
        this.guessInput = document.getElementById('guessInput');
        this.submitGuessBtn = document.getElementById('submitGuessBtn');
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
    updateHUD(state) {
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
            }
            else if (percentage > 25) {
                this.attemptsProgressBar.style.background = 'linear-gradient(90deg, #f6d365, #fda085)';
            }
            else {
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
    renderGuesses(guesses, targetNumber, isGameOver) {
        if (!this.historyTagsContainer)
            return;
        this.historyTagsContainer.innerHTML = '';
        if (guesses.length === 0) {
            this.historyTagsContainer.innerHTML = '<span class="no-history">No guesses yet</span>';
            return;
        }
        guesses.forEach((guess) => {
            var _a;
            const tag = document.createElement('span');
            tag.className = 'guess-tag';
            if (guess === targetNumber && isGameOver) {
                tag.classList.add('tag-match');
                tag.textContent = `${guess} ✓`;
            }
            else if (guess > targetNumber) {
                tag.classList.add('tag-high');
                tag.textContent = `${guess} ↓`;
            }
            else {
                tag.classList.add('tag-low');
                tag.textContent = `${guess} ↑`;
            }
            (_a = this.historyTagsContainer) === null || _a === void 0 ? void 0 : _a.appendChild(tag);
        });
    }
    /**
     * Displays guess feedback with exhaustive checking on discriminated union `status`.
     */
    showFeedback(result) {
        if (!this.feedbackBanner ||
            !this.feedbackIcon ||
            !this.feedbackTitle ||
            !this.feedbackMessage) {
            return;
        }
        this.feedbackBanner.className = 'feedback-box';
        switch (result.status) {
            case 'won':
                this.feedbackBanner.classList.add('state-won');
                this.feedbackIcon.textContent = '👑';
                this.feedbackTitle.textContent = 'VICTORY!';
                break;
            case 'lost':
                this.feedbackBanner.classList.add('state-lost');
                this.feedbackIcon.textContent = '💥';
                this.feedbackTitle.textContent = 'SYSTEM OVERLOAD';
                break;
            case 'in-progress':
                if (result.hint === 'too-high') {
                    this.feedbackBanner.classList.add('state-high');
                    this.feedbackIcon.textContent = '📉';
                    this.feedbackTitle.textContent = 'TOO HIGH';
                }
                else {
                    this.feedbackBanner.classList.add('state-low');
                    this.feedbackIcon.textContent = '📈';
                    this.feedbackTitle.textContent = 'TOO LOW';
                }
                break;
            case 'duplicate':
                this.feedbackBanner.classList.add('state-duplicate');
                this.feedbackIcon.textContent = '⚠️';
                this.feedbackTitle.textContent = 'DUPLICATE GUESS';
                break;
            default:
                return assertNever(result, 'Unhandled GuessResult status');
        }
        this.feedbackMessage.textContent = result.message;
    }
    resetFeedback() {
        if (this.feedbackBanner)
            this.feedbackBanner.className = 'feedback-box state-neutral';
        if (this.feedbackIcon)
            this.feedbackIcon.textContent = '🎯';
        if (this.feedbackTitle)
            this.feedbackTitle.textContent = 'Make your first guess!';
        if (this.feedbackMessage)
            this.feedbackMessage.textContent = 'Type an integer and hit submit.';
        if (this.validationErrorMessage)
            this.validationErrorMessage.textContent = '';
        if (this.guessInput) {
            this.guessInput.value = '';
            this.guessInput.disabled = false;
            this.guessInput.focus();
        }
        if (this.submitGuessBtn) {
            this.submitGuessBtn.disabled = false;
        }
    }
    showValidationError(message) {
        if (this.validationErrorMessage) {
            this.validationErrorMessage.textContent = message;
        }
        if (this.guessInput) {
            this.guessInput.classList.add('input-error');
            setTimeout(() => {
                var _a;
                (_a = this.guessInput) === null || _a === void 0 ? void 0 : _a.classList.remove('input-error');
            }, 1000);
        }
    }
    clearValidationError() {
        if (this.validationErrorMessage) {
            this.validationErrorMessage.textContent = '';
        }
    }
    updateStatistics(stats, winRate, avgAttempts) {
        if (this.statsGamesPlayed)
            this.statsGamesPlayed.textContent = stats.totalGames.toString();
        if (this.statsGamesWon)
            this.statsGamesWon.textContent = stats.gamesWon.toString();
        if (this.statsGamesLost)
            this.statsGamesLost.textContent = stats.gamesLost.toString();
        if (this.statsWinRate)
            this.statsWinRate.textContent = `${winRate}%`;
        if (this.statsBestScore) {
            this.statsBestScore.textContent = stats.bestScore !== null ? `${stats.bestScore} att.` : '—';
        }
        if (this.statsAvgAttempts)
            this.statsAvgAttempts.textContent = avgAttempts.toString();
    }
    renderGameHistory(records) {
        if (!this.gameHistoryList)
            return;
        this.gameHistoryList.innerHTML = '';
        if (records.length === 0) {
            this.gameHistoryList.innerHTML = '<div class="history-empty">No games played yet.</div>';
            return;
        }
        records.forEach((rec) => {
            var _a;
            const item = document.createElement('div');
            item.className = 'history-card';
            const statusBadge = rec.won
                ? '<span class="status-badge badge-win">WON</span>'
                : '<span class="status-badge badge-loss">LOST</span>';
            const dateStr = new Date(rec.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
            item.innerHTML = `
        <div class="history-card-header">
          ${statusBadge}
          <span class="diff-tag">${rec.difficulty.toUpperCase()}</span>
          <span class="time-tag">${dateStr}</span>
        </div>
        <div class="history-card-body">
          <div>Target: <strong>${rec.targetNumber}</strong></div>
          <div>Used: <strong>${rec.attemptsUsed}/${rec.maxAttempts}</strong> attempts</div>
        </div>
        <div class="history-card-guesses">
          Guesses: ${rec.guesses.join(', ')}
        </div>
      `;
            (_a = this.gameHistoryList) === null || _a === void 0 ? void 0 : _a.appendChild(item);
        });
    }
    toggleHistoryDrawer() {
        if (this.gameHistoryDrawer) {
            this.gameHistoryDrawer.classList.toggle('open');
        }
    }
}
