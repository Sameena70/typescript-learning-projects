import { GuessResult } from './types.js';

export class GameLogic {
  /**
   * Generates a random integer within [min, max] inclusive.
   */
  public static generateSecret(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Evaluates a user guess against the secret number and current state.
   */
  public static evaluateGuess(
    guess: number,
    secret: number,
    remainingAttempts: number,
    previousGuesses: number[]
  ): GuessResult {
    if (previousGuesses.includes(guess)) {
      return {
        type: 'DUPLICATE',
        message: `You already guessed ${guess}! Repeated guesses do not count against your attempts.`,
        guess,
        attemptsLeft: remainingAttempts,
        isWon: false,
        isGameOver: false
      };
    }

    const nextAttempts = remainingAttempts - 1;

    if (guess === secret) {
      return {
        type: 'CORRECT',
        message: `🎉 JACKPOT! You cracked the code: ${secret}!`,
        guess,
        attemptsLeft: nextAttempts,
        isWon: true,
        isGameOver: true
      };
    }

    if (nextAttempts <= 0) {
      return {
        type: 'GAME_OVER',
        message: `💀 GAME OVER! The secret code was ${secret}. Better luck next time!`,
        guess,
        attemptsLeft: 0,
        isWon: false,
        isGameOver: true
      };
    }

    if (guess > secret) {
      return {
        type: 'TOO_HIGH',
        message: `📉 ${guess} is TOO HIGH! Go lower.`,
        guess,
        attemptsLeft: nextAttempts,
        isWon: false,
        isGameOver: false
      };
    } else {
      return {
        type: 'TOO_LOW',
        message: `📈 ${guess} is TOO LOW! Go higher.`,
        guess,
        attemptsLeft: nextAttempts,
        isWon: false,
        isGameOver: false
      };
    }
  }
}
