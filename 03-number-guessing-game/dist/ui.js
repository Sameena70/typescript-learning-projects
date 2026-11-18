import { assertNever } from './game-logic.js';
export class GameUI {
    constructor() {
        this.gamePromptText = document.getElementById('gamePromptText');
        this.attemptsProgressBar = document.getElementById('attemptsProgressBar');
        this.attemptsCountText = document.getElementById('attemptsCountText');
        this.feedbackBanner = document.getElementById('feedbackBanner');
        this.feedbackIcon = document.getElementById('feedbackIcon');
        this.feedbackMessage = document.getElementById('feedbackMessage');
        this.guessInput = document.getElementById('guessInput');
        this.submitGuessBtn = document.getElementById('submitGuessBtn');
        this.historyTagsContainer = document.getElementById('historyTagsContainer');
        this.validationErrorMessage = document.getElementById('validationErrorMessage');
        this.bestScoreValue = document.getElementById('bestScoreValue');
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
        const used = maxAttempts - remaining;
        if (this.gamePromptText) {
            this.gamePromptText.textContent = `I'm thinking of a number between ${min} and ${max}...`;
        }
        if (this.attemptsCountText) {
            this.attemptsCountText.textContent = `${used} / ${maxAttempts}`;
        }
        if (this.guessInput) {
            this.guessInput.min = min.toString();
            this.guessInput.max = max.toString();
            this.guessInput.placeholder = Math.round((min + max) / 2).toString();
        }
        // Progress bar: used / maxAttempts matching the screenshot (3/10 used)
        if (this.attemptsProgressBar) {
            const percentage = (used / maxAttempts) * 100;
            this.attemptsProgressBar.style.width = `${Math.max(4, percentage)}%`;
            if (used >= maxAttempts - 2) {
                this.attemptsProgressBar.style.background =
                    'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)';
            }
            else if (used >= maxAttempts / 2) {
                this.attemptsProgressBar.style.background =
                    'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';
            }
            else {
                this.attemptsProgressBar.style.background =
                    'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)';
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
            this.historyTagsContainer.innerHTML = '<span class="no-guesses-text">None yet</span>';
            return;
        }
        guesses.forEach((guess) => {
            var _a;
            const tag = document.createElement('span');
            tag.className = 'guess-chip';
            if (guess === targetNumber && isGameOver) {
                tag.classList.add('tag-match');
                tag.textContent = `${guess} ✓`;
            }
            else {
                tag.textContent = `${guess}`;
            }
            (_a = this.historyTagsContainer) === null || _a === void 0 ? void 0 : _a.appendChild(tag);
        });
    }
    showFeedback(result) {
        if (!this.feedbackBanner || !this.feedbackIcon || !this.feedbackMessage) {
            return;
        }
        this.feedbackBanner.className = 'feedback-banner';
        switch (result.status) {
            case 'won':
                this.feedbackBanner.classList.add('state-won');
                this.feedbackIcon.textContent = '🎉';
                this.feedbackMessage.textContent = `Correct! ${result.guess} was the secret number! (${result.attemptsUsed} tries)`;
                break;
            case 'lost':
                this.feedbackBanner.classList.add('state-lost');
                this.feedbackIcon.textContent = '💥';
                this.feedbackMessage.textContent = `Game Over! The secret number was ${result.target}. Try again!`;
                break;
            case 'in-progress':
                if (result.hint === 'too-high') {
                    this.feedbackBanner.classList.add('state-high');
                    this.feedbackIcon.textContent = '💡';
                    this.feedbackMessage.textContent = `Too High! Try a smaller number.`;
                }
                else {
                    this.feedbackBanner.classList.add('state-low');
                    this.feedbackIcon.textContent = '💡';
                    this.feedbackMessage.textContent = `Too Low! Try a bigger number.`;
                }
                break;
            case 'duplicate':
                this.feedbackBanner.classList.add('state-high');
                this.feedbackIcon.textContent = '⚠️';
                this.feedbackMessage.textContent = `You already tried ${result.guess}! Attempts not deducted.`;
                break;
            default:
                return assertNever(result, 'Unhandled GuessResult status');
        }
    }
    resetFeedback(min = 1, max = 100) {
        if (this.feedbackBanner)
            this.feedbackBanner.className = 'feedback-banner state-neutral';
        if (this.feedbackIcon)
            this.feedbackIcon.textContent = '💡';
        if (this.feedbackMessage)
            this.feedbackMessage.textContent = `Start guessing! Number is between ${min} and ${max}.`;
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
            this.guessInput.style.borderColor = '#f43f5e';
            setTimeout(() => {
                if (this.guessInput)
                    this.guessInput.style.borderColor = '#2563eb';
            }, 1200);
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
            this.statsBestScore.textContent = stats.bestScore !== null ? `${stats.bestScore}` : '—';
        }
        if (this.bestScoreValue) {
            this.bestScoreValue.textContent = stats.bestScore !== null ? `${stats.bestScore}` : '—';
        }
        if (this.statsAvgAttempts)
            this.statsAvgAttempts.textContent = avgAttempts.toString();
    }
    renderGameHistory(records) {
        if (!this.gameHistoryList)
            return;
        this.gameHistoryList.innerHTML = '';
        if (records.length === 0) {
            this.gameHistoryList.innerHTML =
                '<div class="no-guesses-text" style="padding: 12px;">No match records yet.</div>';
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
          <span style="font-weight: 700; color: #cbd5e1;">${rec.difficulty.toUpperCase()}</span>
          <span style="color: #64748b;">${dateStr}</span>
        </div>
        <div style="margin: 4px 0; color: #94a3b8;">
          Target: <strong style="color: #ffffff;">${rec.targetNumber}</strong> • Tries: <strong style="color: #ffffff;">${rec.attemptsUsed}/${rec.maxAttempts}</strong>
        </div>
        <div style="font-size: 0.72rem; color: #64748b;">
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
