/**
 * Type Definitions for Advanced Number Guessing Game
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'custom';

export interface DifficultyConfig {
  name: string;
  min: number;
  max: number;
  maxAttempts: number;
}

export type GuessFeedbackType =
  'TOO_HIGH' | 'TOO_LOW' | 'CORRECT' | 'GAME_OVER' | 'DUPLICATE' | 'INVALID';

export interface GuessResult {
  type: GuessFeedbackType;
  message: string;
  guess: number;
  attemptsLeft: number;
  isWon: boolean;
  isGameOver: boolean;
}

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

export interface LifetimeStatistics {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  bestScore: number | null; // Lowest attempts in a won game
  totalAttemptsUsed: number;
}
