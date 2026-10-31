// ==========================================================
// Project 03: GUESS MASTER — Number Guessing Game (TypeScript)
// High-Level Modern Neon/Cyberpunk Implementation
// ==========================================================

// ==========================================================
// 1. Difficulty Configuration Type & Interface
// ==========================================================

type DifficultyLevel = "easy" | "medium" | "hard";

interface DifficultyConfig {
  name: string;
  min: number;
  max: number;
  maxAttempts: number;
}

const DIFFICULTY_SETTINGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: { name: "Easy", min: 1, max: 100, maxAttempts: 7 },
  medium: { name: "Medium", min: 1, max: 500, maxAttempts: 9 },
  hard: { name: "Hard", min: 1, max: 1000, maxAttempts: 10 },
};

// ==========================================================
// 2. DOM Elements with TypeScript Assertions
// ==========================================================

const difficultyButtons = document.querySelectorAll<HTMLButtonElement>(".diff-btn");
const targetRangeDisplay = document.getElementById("targetRangeDisplay") as HTMLSpanElement;
const remainingAttemptsDisplay = document.getElementById("remainingAttemptsDisplay") as HTMLSpanElement;
const attemptsProgressBar = document.getElementById("attemptsProgressBar") as HTMLDivElement;

const feedbackBanner = document.getElementById("feedbackBanner") as HTMLDivElement;
const feedbackIcon = document.getElementById("feedbackIcon") as HTMLDivElement;
const feedbackTitle = document.getElementById("feedbackTitle") as HTMLDivElement;
const feedbackMessage = document.getElementById("feedbackMessage") as HTMLDivElement;

const guessForm = document.getElementById("guessForm") as HTMLFormElement;
const guessInput = document.getElementById("guessInput") as HTMLInputElement;
const submitGuessBtn = document.getElementById("submitGuessBtn") as HTMLButtonElement;
const validationErrorMessage = document.getElementById("validationErrorMessage") as HTMLDivElement;

const historyTagsContainer = document.getElementById("historyTagsContainer") as HTMLDivElement;
const restartGameBtn = document.getElementById("restartGameBtn") as HTMLButtonElement;

// Statistics elements
const statsGamesPlayed = document.getElementById("statsGamesPlayed") as HTMLSpanElement;
const statsGamesWon = document.getElementById("statsGamesWon") as HTMLSpanElement;
const statsGamesLost = document.getElementById("statsGamesLost") as HTMLSpanElement;
const statsWinRate = document.getElementById("statsWinRate") as HTMLSpanElement;

// ==========================================================
// 3. Application State
// ==========================================================

let activeDifficulty: DifficultyLevel = "easy";
let currentMin: number = 1;
let currentMax: number = 100;
let maxAllowedAttempts: number = 7;

let secretNumber: number = 0;
let remainingAttempts: number = 7;
let isGameOver: boolean = false;
let guessHistory: number[] = [];

// Session statistics
let totalGamesPlayed: number = 0;
let totalGamesWon: number = 0;
let totalGamesLost: number = 0;

// ==========================================================
// 4. Random Generator & Game Setup
// ==========================================================

/**
 * Generates an integer between min and max (inclusive).
 */
function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Updates difficulty settings based on user selection.
 */
function setDifficulty(level: DifficultyLevel): void {
  activeDifficulty = level;
  const config = DIFFICULTY_SETTINGS[level];

  currentMin = config.min;
  currentMax = config.max;
  maxAllowedAttempts = config.maxAttempts;

  // Update button active states
  difficultyButtons.forEach((btn: HTMLButtonElement) => {
    const btnLevel = btn.getAttribute("data-difficulty") as DifficultyLevel;
    if (btnLevel === level) {
      btn.classList.add("active");
    } else {
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
function startNewGame(): void {
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
  setFeedback(
    "neutral",
    "🎯",
    "Can you crack the code?",
    `Guess the secret number between ${currentMin} and ${currentMax}. You have ${maxAllowedAttempts} attempts.`
  );

  updateAttemptsProgress();
  renderHistoryTags();
  guessInput.focus();
}

// ==========================================================
// 5. Validation Logic
// ==========================================================

function validateGuess(raw: string): number | null {
  const trimmed: string = raw.trim();

  if (trimmed === "") {
    showValidation("Please enter a number before submitting.");
    return null;
  }

  if (trimmed.includes(".")) {
    showValidation("Decimals are not allowed! Please enter a whole number.");
    return null;
  }

  const parsed: number = Number(trimmed);

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

function showValidation(msg: string): void {
  validationErrorMessage.innerText = msg;
  guessInput.focus();
}

function clearValidation(): void {
  validationErrorMessage.innerText = "";
}

// ==========================================================
// 6. Game Evaluation & Guess Handling
// ==========================================================

function handleGuessSubmit(event: Event): void {
  event.preventDefault();

  if (isGameOver) {
    return;
  }

  const userGuess: number | null = validateGuess(guessInput.value);

  // If invalid, do not reduce attempts!
  if (userGuess === null) {
    return;
  }

  remainingAttempts = remainingAttempts - 1;
  guessHistory.push(userGuess);

  // Check conditions
  if (userGuess === secretNumber) {
    handleWin(userGuess);
  } else if (remainingAttempts === 0) {
    handleLoss();
  } else if (userGuess < secretNumber) {
    setFeedback(
      "low",
      "📉",
      "Too Low! Try a Higher Number",
      `${userGuess} is smaller than the target. ${remainingAttempts} attempt(s) remaining.`
    );
  } else {
    setFeedback(
      "high",
      "📈",
      "Too High! Try a Lower Number",
      `${userGuess} is greater than the target. ${remainingAttempts} attempt(s) remaining.`
    );
  }

  updateAttemptsProgress();
  renderHistoryTags();

  guessInput.value = "";
  if (!isGameOver) {
    guessInput.focus();
  }
}

function handleWin(winningNumber: number): void {
  isGameOver = true;
  totalGamesPlayed = totalGamesPlayed + 1;
  totalGamesWon = totalGamesWon + 1;

  const used: number = maxAllowedAttempts - remainingAttempts;

  setFeedback(
    "win",
    "🏆",
    "CYBER CODE CRACKED! YOU WON!",
    `Masterful! You decoded the secret number ${winningNumber} in ${used} attempt(s)!`
  );

  endGameUI();
  updateStatsDisplay();
}

function handleLoss(): void {
  isGameOver = true;
  totalGamesPlayed = totalGamesPlayed + 1;
  totalGamesLost = totalGamesLost + 1;

  setFeedback(
    "lose",
    "💀",
    "SYSTEM LOCKED: YOU LOST!",
    `You ran out of attempts! The secret number was ${secretNumber}.`
  );

  endGameUI();
  updateStatsDisplay();
}

function endGameUI(): void {
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

function setFeedback(
  state: "neutral" | "low" | "high" | "win" | "lose",
  icon: string,
  title: string,
  message: string
): void {
  feedbackBanner.className = `feedback-box state-${state}`;
  feedbackIcon.innerText = icon;
  feedbackTitle.innerText = title;
  feedbackMessage.innerText = message;
}

function updateAttemptsProgress(): void {
  remainingAttemptsDisplay.innerText = `${remainingAttempts} / ${maxAllowedAttempts}`;

  const percentage: number = (remainingAttempts / maxAllowedAttempts) * 100;
  attemptsProgressBar.style.width = `${percentage}%`;

  if (remainingAttempts <= 2) {
    attemptsProgressBar.style.background = "linear-gradient(90deg, #f43f5e, #fb7185)";
    attemptsProgressBar.style.boxShadow = "0 0 12px rgba(244, 63, 94, 0.7)";
  } else if (remainingAttempts <= 4) {
    attemptsProgressBar.style.background = "linear-gradient(90deg, #f59e0b, #fbbf24)";
    attemptsProgressBar.style.boxShadow = "0 0 12px rgba(245, 158, 11, 0.7)";
  } else {
    attemptsProgressBar.style.background = "var(--btn-gradient)";
    attemptsProgressBar.style.boxShadow = "0 0 12px rgba(0, 240, 255, 0.6)";
  }
}

function renderHistoryTags(): void {
  if (guessHistory.length === 0) {
    historyTagsContainer.innerHTML = '<span class="no-history">No guesses yet</span>';
    return;
  }

  historyTagsContainer.innerHTML = "";

  for (let i: number = 0; i < guessHistory.length; i++) {
    const val: number = guessHistory[i];
    const tag: HTMLSpanElement = document.createElement("span");

    let tagClass: string = "";
    let arrow: string = "";

    if (val === secretNumber) {
      tagClass = "tag-win";
      arrow = "✓";
    } else if (val < secretNumber) {
      tagClass = "tag-low";
      arrow = "↑";
    } else {
      tagClass = "tag-high";
      arrow = "↓";
    }

    tag.className = `history-tag ${tagClass}`;
    tag.innerText = `${val} ${arrow}`;
    historyTagsContainer.appendChild(tag);
  }
}

function updateStatsDisplay(): void {
  statsGamesPlayed.innerText = totalGamesPlayed.toString();
  statsGamesWon.innerText = totalGamesWon.toString();
  statsGamesLost.innerText = totalGamesLost.toString();

  if (totalGamesPlayed === 0) {
    statsWinRate.innerText = "0%";
  } else {
    const rate: number = Math.round((totalGamesWon / totalGamesPlayed) * 100);
    statsWinRate.innerText = `${rate}%`;
  }
}

// ==========================================================
// 8. Event Listeners
// ==========================================================

difficultyButtons.forEach((btn: HTMLButtonElement) => {
  btn.addEventListener("click", () => {
    const level = btn.getAttribute("data-difficulty") as DifficultyLevel;
    if (level && level !== activeDifficulty) {
      setDifficulty(level);
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
