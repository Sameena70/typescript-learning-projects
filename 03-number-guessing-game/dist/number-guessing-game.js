"use strict";
// ==========================================================
// Project 03: GUESS MASTER — Number Guessing Game (TypeScript)
// High-Level Modern Neon/Cyberpunk Implementation
// ==========================================================
const DIFFICULTY_SETTINGS = {
    easy: { name: "Easy", min: 1, max: 100, maxAttempts: 7 },
    medium: { name: "Medium", min: 1, max: 500, maxAttempts: 9 },
    hard: { name: "Hard", min: 1, max: 1000, maxAttempts: 10 },
};
// ==========================================================
// 2. DOM Elements with TypeScript Assertions
// ==========================================================
const difficultyButtons = document.querySelectorAll(".diff-btn");
const targetRangeDisplay = document.getElementById("targetRangeDisplay");
const remainingAttemptsDisplay = document.getElementById("remainingAttemptsDisplay");
const attemptsProgressBar = document.getElementById("attemptsProgressBar");
const feedbackBanner = document.getElementById("feedbackBanner");
const feedbackIcon = document.getElementById("feedbackIcon");
const feedbackTitle = document.getElementById("feedbackTitle");
const feedbackMessage = document.getElementById("feedbackMessage");
const guessForm = document.getElementById("guessForm");
const guessInput = document.getElementById("guessInput");
const submitGuessBtn = document.getElementById("submitGuessBtn");
const validationErrorMessage = document.getElementById("validationErrorMessage");
const historyTagsContainer = document.getElementById("historyTagsContainer");
const restartGameBtn = document.getElementById("restartGameBtn");
// Statistics elements
const statsGamesPlayed = document.getElementById("statsGamesPlayed");
const statsGamesWon = document.getElementById("statsGamesWon");
const statsGamesLost = document.getElementById("statsGamesLost");
const statsWinRate = document.getElementById("statsWinRate");
// ==========================================================
// 3. Application State
// ==========================================================
let activeDifficulty = "easy";
let currentMin = 1;
let currentMax = 100;
let maxAllowedAttempts = 7;
let secretNumber = 0;
let remainingAttempts = 7;
let isGameOver = false;
let guessHistory = [];
// Session statistics
let totalGamesPlayed = 0;
let totalGamesWon = 0;
let totalGamesLost = 0;
// ==========================================================
// 4. Random Generator & Game Setup
// ==========================================================
/**
 * Generates an integer between min and max (inclusive).
 * Uses default parameters: min defaults to 1, max defaults to 100.
 */
function generateRandomNumber(min = 1, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Updates difficulty settings based on user selection.
 */
function setDifficulty(level) {
    activeDifficulty = level;
    const config = DIFFICULTY_SETTINGS[level];
    currentMin = config.min;
    currentMax = config.max;
    maxAllowedAttempts = config.maxAttempts;
    // Update button active states
    difficultyButtons.forEach((btn) => {
        const btnLevel = btn.getAttribute("data-difficulty");
        if (btnLevel === level) {
            btn.classList.add("active");
        }
        else {
            btn.classList.remove("active");
        }
    });
    // Update input attributes & HUD
    targetRangeDisplay.innerText = `${currentMin} - ${currentMax}`;
    guessInput.min = currentMin.toString();
    guessInput.max = currentMax.toString();
    guessInput.placeholder = `Enter ${currentMin} - ${currentMax}...`;
    startNewGame();
}
/**
 * Starts a new game round.
 */
function startNewGame() {
    secretNumber = generateRandomNumber(currentMin, currentMax);
    remainingAttempts = maxAllowedAttempts;
    isGameOver = false;
    guessHistory = [];
    // Reset form inputs & buttons
    guessInput.value = "";
    guessInput.disabled = false;
    submitGuessBtn.disabled = false;
    validationErrorMessage.innerText = "";
    restartGameBtn.classList.remove("pulse-glow");
    restartGameBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 4 23 10 17 10"></polyline>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </svg>
    <span>Restart Game</span>
  `;
    // Reset feedback
    setFeedback("neutral", "🎯", "Can you crack the code?", `Guess the secret number between ${currentMin} and ${currentMax}. You have ${maxAllowedAttempts} attempts.`);
    updateAttemptsProgress();
    renderHistoryTags();
    guessInput.focus();
}
// ==========================================================
// 5. Validation Logic
// ==========================================================
function validateGuess(raw) {
    const trimmed = raw.trim();
    if (trimmed === "") {
        showValidation("Please enter a number before submitting.");
        return null;
    }
    if (trimmed.includes(".")) {
        showValidation("Decimals are not allowed! Please enter a whole number.");
        return null;
    }
    const parsed = Number(trimmed);
    if (isNaN(parsed)) {
        showValidation("Invalid character! Numbers only.");
        return null;
    }
    if (parsed < currentMin || parsed > currentMax) {
        showValidation(`Out of range! Please choose between ${currentMin} and ${currentMax}.`);
        return null;
    }
    clearValidation();
    return parsed;
}
function showValidation(msg) {
    validationErrorMessage.innerText = msg;
    guessInput.focus();
}
function clearValidation() {
    validationErrorMessage.innerText = "";
}
// ==========================================================
// 6. Game Evaluation & Guess Handling
// ==========================================================
function handleGuessSubmit(event) {
    event.preventDefault();
    if (isGameOver) {
        return;
    }
    const userGuess = validateGuess(guessInput.value);
    // If invalid, do not reduce attempts!
    if (userGuess === null) {
        return;
    }
    remainingAttempts = remainingAttempts - 1;
    guessHistory.push(userGuess);
    // Check conditions
    if (userGuess === secretNumber) {
        handleWin(userGuess);
    }
    else if (remainingAttempts === 0) {
        handleLoss();
    }
    else if (userGuess < secretNumber) {
        setFeedback("low", "📉", "Too Low! Try a Higher Number", `${userGuess} is smaller than the target. ${remainingAttempts} attempt(s) remaining.`);
    }
    else {
        setFeedback("high", "📈", "Too High! Try a Lower Number", `${userGuess} is greater than the target. ${remainingAttempts} attempt(s) remaining.`);
    }
    updateAttemptsProgress();
    renderHistoryTags();
    guessInput.value = "";
    if (!isGameOver) {
        guessInput.focus();
    }
}
function handleWin(winningNumber) {
    isGameOver = true;
    totalGamesPlayed = totalGamesPlayed + 1;
    totalGamesWon = totalGamesWon + 1;
    const used = maxAllowedAttempts - remainingAttempts;
    setFeedback("win", "🏆", "CYBER CODE CRACKED! YOU WON!", `Masterful! You decoded the secret number ${winningNumber} in ${used} attempt(s)!`);
    endGameUI();
    updateStatsDisplay();
}
function handleLoss() {
    isGameOver = true;
    totalGamesPlayed = totalGamesPlayed + 1;
    totalGamesLost = totalGamesLost + 1;
    setFeedback("lose", "💀", "SYSTEM LOCKED: YOU LOST!", `You ran out of attempts! The secret number was ${secretNumber}.`);
    endGameUI();
    updateStatsDisplay();
}
function endGameUI() {
    guessInput.disabled = true;
    submitGuessBtn.disabled = true;
    restartGameBtn.classList.add("pulse-glow");
    restartGameBtn.innerHTML = `
    <span>Play Again &rarr;</span>
  `;
}
// ==========================================================
// 7. Visual Feedback & Rendering
// ==========================================================
function setFeedback(state, icon, title, message) {
    feedbackBanner.className = `feedback-box state-${state}`;
    feedbackIcon.innerText = icon;
    feedbackTitle.innerText = title;
    feedbackMessage.innerText = message;
}
/**
 * Calculates remaining attempts percentage.
 * Pure reusable calculation helper with function scope parameters.
 */
function calculateRemainingPercentage(remaining, max) {
    if (max <= 0) {
        return 0;
    }
    return (remaining / max) * 100;
}
function updateAttemptsProgress() {
    remainingAttemptsDisplay.innerText = `${remainingAttempts} / ${maxAllowedAttempts}`;
    const percentage = calculateRemainingPercentage(remainingAttempts, maxAllowedAttempts);
    attemptsProgressBar.style.width = `${percentage}%`;
    if (remainingAttempts <= 2) {
        attemptsProgressBar.style.background = "linear-gradient(90deg, #f43f5e, #fb7185)";
        attemptsProgressBar.style.boxShadow = "0 0 12px rgba(244, 63, 94, 0.7)";
    }
    else if (remainingAttempts <= 4) {
        attemptsProgressBar.style.background = "linear-gradient(90deg, #f59e0b, #fbbf24)";
        attemptsProgressBar.style.boxShadow = "0 0 12px rgba(245, 158, 11, 0.7)";
    }
    else {
        attemptsProgressBar.style.background = "var(--btn-gradient)";
        attemptsProgressBar.style.boxShadow = "0 0 12px rgba(0, 240, 255, 0.6)";
    }
}
/**
 * Renders guess history tags using map() callback to transform numbers into HTML badges.
 */
function renderHistoryTags() {
    if (guessHistory.length === 0) {
        historyTagsContainer.innerHTML = '<span class="no-history">No guesses yet</span>';
        return;
    }
    // Use map() to transform each historical guess (number) into a styled badge HTML string
    const tagsHtml = guessHistory
        .map((val) => {
        let tagClass = "";
        let arrow = "";
        if (val === secretNumber) {
            tagClass = "tag-win";
            arrow = "✓";
        }
        else if (val < secretNumber) {
            tagClass = "tag-low";
            arrow = "↑";
        }
        else {
            tagClass = "tag-high";
            arrow = "↓";
        }
        return `<span class="history-tag ${tagClass}">${val} ${arrow}</span>`;
    })
        .join("");
    historyTagsContainer.innerHTML = tagsHtml;
}
/**
 * Calculates win rate percentage given games won and total games played.
 * Uses an arrow function expression with a ternary guard against division by zero.
 */
const calculateWinRate = (won, total) => {
    return total === 0 ? 0 : Math.round((won / total) * 100);
};
function updateStatsDisplay() {
    statsGamesPlayed.innerText = totalGamesPlayed.toString();
    statsGamesWon.innerText = totalGamesWon.toString();
    statsGamesLost.innerText = totalGamesLost.toString();
    const rate = calculateWinRate(totalGamesWon, totalGamesPlayed);
    statsWinRate.innerText = `${rate}%`;
}
// ==========================================================
// 8. Event Listeners
// ==========================================================
difficultyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        var _a;
        // getAttribute can return null; coalesce with empty string fallback
        const rawLevel = (_a = btn.getAttribute("data-difficulty")) !== null && _a !== void 0 ? _a : "";
        if (rawLevel === "easy" || rawLevel === "medium" || rawLevel === "hard") {
            const level = rawLevel;
            if (level !== activeDifficulty) {
                setDifficulty(level);
            }
        }
    });
});
guessForm.addEventListener("submit", handleGuessSubmit);
restartGameBtn.addEventListener("click", startNewGame);
guessInput.addEventListener("input", () => {
    if (validationErrorMessage.innerText !== "") {
        clearValidation();
    }
});
// Launch on start
updateStatsDisplay();
setDifficulty("easy");
