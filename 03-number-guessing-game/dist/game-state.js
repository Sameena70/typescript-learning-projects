import { GameLogic } from './game-logic.js';
export class GameStateModel {
    constructor(configManager) {
        this.currentDifficulty = 'easy';
        this.secret = 0;
        this.remainingAttempts = 7;
        this.maxAttempts = 7;
        this.minRange = 1;
        this.maxRange = 100;
        this.guesses = [];
        this.isGameOver = false;
        this.hasWon = false;
        this.configManager = configManager;
        this.startNewGame();
    }
    setDifficulty(level) {
        this.currentDifficulty = level;
        this.startNewGame();
    }
    startNewGame() {
        const config = this.configManager.getConfig(this.currentDifficulty);
        this.minRange = config.min;
        this.maxRange = config.max;
        this.maxAttempts = config.maxAttempts;
        this.remainingAttempts = config.maxAttempts;
        this.guesses = [];
        this.isGameOver = false;
        this.hasWon = false;
        this.secret = GameLogic.generateSecret(config.min, config.max);
    }
    submitGuess(guess) {
        if (this.isGameOver) {
            throw new Error('Game has already ended. Please start a new game.');
        }
        if (guess < this.minRange || guess > this.maxRange || isNaN(guess)) {
            throw new Error(`Guess must be an integer between ${this.minRange} and ${this.maxRange}.`);
        }
        const result = GameLogic.evaluateGuess(guess, this.secret, this.remainingAttempts, this.guesses);
        if (result.type !== 'DUPLICATE') {
            this.guesses.push(guess);
            this.remainingAttempts = result.attemptsLeft;
            this.isGameOver = result.isGameOver;
            this.hasWon = result.isWon;
        }
        return result;
    }
    createGameRecord() {
        return {
            id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            difficulty: this.currentDifficulty,
            targetNumber: this.secret,
            attemptsUsed: this.maxAttempts - this.remainingAttempts,
            maxAttempts: this.maxAttempts,
            won: this.hasWon,
            timestamp: Date.now(),
            guesses: [...this.guesses]
        };
    }
    // Getters
    getDifficulty() { return this.currentDifficulty; }
    getMin() { return this.minRange; }
    getMax() { return this.maxRange; }
    getMaxAttempts() { return this.maxAttempts; }
    getRemainingAttempts() { return this.remainingAttempts; }
    getGuesses() { return [...this.guesses]; }
    getIsGameOver() { return this.isGameOver; }
    getHasWon() { return this.hasWon; }
    getSecret() { return this.secret; }
}
