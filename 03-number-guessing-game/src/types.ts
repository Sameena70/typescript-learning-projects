/**
 * Type Definitions for Number Guessing Game
 *
 * Implements discriminated unions, domain-specific literal unions,
 * intersection types for difficulty configuration, and generic statistics utilities.
 */

/**
 * Supported Difficulty Levels
 */
export type StandardDifficulty = 'easy' | 'medium' | 'hard';
export type DifficultyLevel = StandardDifficulty | 'custom';

/**
 * Base Game Configuration shared across all difficulties.
 */
export interface BaseGameConfig {
  min: number;
  max: number;
  maxAttempts: number;
}

/**
 * Standard preset difficulty configuration.
 */
export interface StandardDifficultyConfig extends BaseGameConfig {
  name: string;
  difficulty: StandardDifficulty;
}

/**
 * Custom difficulty configuration using an Intersection Type.
 */
export type CustomDifficultyConfig = BaseGameConfig & {
  name: 'Custom';
  difficulty: 'custom';
};

/**
 * Unified Difficulty Configuration contract.
 */
export interface DifficultyConfig extends BaseGameConfig {
  name: string;
}

/**
 * Guess feedback status discriminant.
 */
export type GuessFeedbackType =
  'TOO_HIGH' | 'TOO_LOW' | 'CORRECT' | 'GAME_OVER' | 'DUPLICATE' | 'INVALID';

/**
 * Discriminated Union for Guess Outcomes.
 *
 * Eliminates ambiguous boolean combinations (`isWon` vs `isGameOver`)
 * and allows exact property narrowing based on `status`.
 */
export type GuessOutcome =
  | {
      status: 'won';
      type: 'CORRECT';
      message: string;
      guess: number;
      target: number;
      attemptsUsed: number;
      attemptsLeft: number;
      isWon: true;
      isGameOver: true;
    }
  | {
      status: 'lost';
      type: 'GAME_OVER';
      message: string;
      guess: number;
      target: number;
      attemptsLeft: 0;
      isWon: false;
      isGameOver: true;
    }
  | {
      status: 'in-progress';
      type: 'TOO_HIGH' | 'TOO_LOW';
      message: string;
      guess: number;
      hint: 'too-high' | 'too-low';
      attemptsLeft: number;
      isWon: false;
      isGameOver: false;
    }
  | {
      status: 'duplicate';
      type: 'DUPLICATE';
      message: string;
      guess: number;
      attemptsLeft: number;
      isWon: false;
      isGameOver: false;
    };

/**
 * Backward compatibility alias for consumers expecting GuessResult.
 */
export type GuessResult = GuessOutcome;

/**
 * Discriminated Union for Application Game States.
 */
export type GamePlayState =
  | { phase: 'ready'; min: number; max: number; maxAttempts: number }
  | {
      phase: 'playing';
      secret: number;
      remainingAttempts: number;
      maxAttempts: number;
      guesses: number[];
    }
  | {
      phase: 'won';
      secret: number;
      attemptsUsed: number;
      guesses: number[];
    }
  | {
      phase: 'lost';
      secret: number;
      guesses: number[];
    };

/**
 * Persistent record of a completed game.
 */
export interface GameRecord {
  id: string;
  difficulty: DifficultyLevel;
  targetNumber: number;
  attemptsUsed: number;
  maxAttempts: number;
  won: boolean;
  timestamp: number;
  guesses: number[];
}

/**
 * Aggregate Lifetime Statistics.
 */
export interface LifetimeStatistics {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  bestScore: number | null; // Lowest attempts in a won game
  totalAttemptsUsed: number;
}

/**
 * Generic Storage Validator Predicate function.
 */
export type StorageValidator<T> = (val: unknown) => val is T;
