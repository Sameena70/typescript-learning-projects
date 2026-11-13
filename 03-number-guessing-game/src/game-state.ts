import { DifficultyLevel, GuessResult, GameRecord, GamePlayState } from './types.js';
import { GameConfigManager } from './game-config.js';
import { GameLogic } from './game-logic.js';

export class GameStateModel {
  private configManager: GameConfigManager;
  private currentDifficulty: DifficultyLevel = 'easy';
  private secret = 0;
  private remainingAttempts = 7;
  private maxAttempts = 7;
  private minRange = 1;
  private maxRange = 100;
  private guesses: number[] = [];
  private isGameOver = false;
  private hasWon = false;

  constructor(configManager: GameConfigManager) {
    this.configManager = configManager;
    this.startNewGame();
  }

  public setDifficulty(level: DifficultyLevel): void {
    this.currentDifficulty = level;
    this.startNewGame();
  }

  public startNewGame(): void {
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

  /**
   * Retrieves the current game play state as a discriminated union.
   */
  public getPlayState(): GamePlayState {
    if (this.hasWon) {
      return {
        phase: 'won',
        secret: this.secret,
        attemptsUsed: this.maxAttempts - this.remainingAttempts,
        guesses: [...this.guesses]
      };
    }
    if (this.isGameOver) {
      return {
        phase: 'lost',
        secret: this.secret,
        guesses: [...this.guesses]
      };
    }
    if (this.guesses.length === 0) {
      return {
        phase: 'ready',
        min: this.minRange,
        max: this.maxRange,
        maxAttempts: this.maxAttempts
      };
    }
    return {
      phase: 'playing',
      secret: this.secret,
      remainingAttempts: this.remainingAttempts,
      maxAttempts: this.maxAttempts,
      guesses: [...this.guesses]
    };
  }

  public submitGuess(guess: number): GuessResult {
    if (this.isGameOver) {
      throw new Error('Game has already ended. Please start a new game.');
    }

    if (typeof guess !== 'number' || !Number.isInteger(guess)) {
      throw new Error('Please enter a valid whole integer.');
    }

    if (guess < this.minRange || guess > this.maxRange) {
      throw new Error(`Guess must be between ${this.minRange} and ${this.maxRange}.`);
    }

    const result = GameLogic.evaluateGuess(
      guess,
      this.secret,
      this.remainingAttempts,
      this.guesses,
      this.maxAttempts
    );

    if (result.status !== 'duplicate') {
      this.guesses.push(guess);
      this.remainingAttempts = result.attemptsLeft;
      this.isGameOver = result.isGameOver;
      this.hasWon = result.isWon;
    }

    return result;
  }

  public createGameRecord(): GameRecord {
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
  public getDifficulty(): DifficultyLevel {
    return this.currentDifficulty;
  }
  public getMin(): number {
    return this.minRange;
  }
  public getMax(): number {
    return this.maxRange;
  }
  public getMaxAttempts(): number {
    return this.maxAttempts;
  }
  public getRemainingAttempts(): number {
    return this.remainingAttempts;
  }
  public getGuesses(): number[] {
    return [...this.guesses];
  }
  public getIsGameOver(): boolean {
    return this.isGameOver;
  }
  public getHasWon(): boolean {
    return this.hasWon;
  }
  public getSecret(): number {
    return this.secret;
  }
}
