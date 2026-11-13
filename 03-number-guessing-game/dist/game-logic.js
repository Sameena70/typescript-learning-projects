/**
 * Compile-time exhaustiveness assertion helper using the `never` type.
 */
export function assertNever(x, message = 'Unexpected value encountered') {
    throw new Error(`${message}: ${String(x)}`);
}
export class GameLogic {
    /**
     * Generates a random integer within [min, max] inclusive.
     */
    static generateSecret(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /**
     * Evaluates a user guess against the secret number and current state,
     * returning a strongly typed discriminated union `GuessOutcome`.
     */
    static evaluateGuess(guess, secret, remainingAttempts, previousGuesses, maxAttempts) {
        if (previousGuesses.indexOf(guess) !== -1) {
            return {
                status: 'duplicate',
                type: 'DUPLICATE',
                message: `You already guessed ${guess}! Repeated guesses do not count against your attempts.`,
                guess,
                attemptsLeft: remainingAttempts,
                isWon: false,
                isGameOver: false
            };
        }
        const nextAttempts = remainingAttempts - 1;
        const totalMax = maxAttempts !== null && maxAttempts !== void 0 ? maxAttempts : remainingAttempts;
        const attemptsUsed = totalMax - nextAttempts;
        if (guess === secret) {
            return {
                status: 'won',
                type: 'CORRECT',
                message: `🎉 JACKPOT! You cracked the code: ${secret}!`,
                guess,
                target: secret,
                attemptsUsed,
                attemptsLeft: nextAttempts,
                isWon: true,
                isGameOver: true
            };
        }
        if (nextAttempts <= 0) {
            return {
                status: 'lost',
                type: 'GAME_OVER',
                message: `💀 GAME OVER! The secret code was ${secret}. Better luck next time!`,
                guess,
                target: secret,
                attemptsLeft: 0,
                isWon: false,
                isGameOver: true
            };
        }
        if (guess > secret) {
            return {
                status: 'in-progress',
                type: 'TOO_HIGH',
                hint: 'too-high',
                message: `📉 ${guess} is TOO HIGH! Go lower.`,
                guess,
                attemptsLeft: nextAttempts,
                isWon: false,
                isGameOver: false
            };
        }
        else {
            return {
                status: 'in-progress',
                type: 'TOO_LOW',
                hint: 'too-low',
                message: `📈 ${guess} is TOO LOW! Go higher.`,
                guess,
                attemptsLeft: nextAttempts,
                isWon: false,
                isGameOver: false
            };
        }
    }
}
