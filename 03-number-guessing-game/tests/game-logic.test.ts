import { describe, it, expect, beforeEach } from 'vitest';
import { GameLogic } from '../src/game-logic.js';
import { GameConfigManager } from '../src/game-config.js';
import { GameStateModel } from '../src/game-state.js';
import { StatisticsManager } from '../src/statistics.js';
import { GameRecord } from '../src/types.js';

// Mock localStorage for headless Node test environment
const storageMock: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string): string | null => (key in storageMock ? storageMock[key] : null),
  setItem: (key: string, value: string): void => {
    storageMock[key] = value;
  },
  removeItem: (key: string): void => {
    delete storageMock[key];
  },
  clear: (): void => {
    for (const key of Object.keys(storageMock)) {
      delete storageMock[key];
    }
  }
};

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
}

describe('GameConfigManager (Difficulty Boundaries & Custom Ranges)', () => {
  let config: GameConfigManager;

  beforeEach(() => {
    config = new GameConfigManager();
  });

  it('provides default boundaries for standard difficulties', () => {
    const easy = config.getConfig('easy');
    expect(easy.min).toBe(1);
    expect(easy.max).toBe(100);
    expect(easy.maxAttempts).toBe(7);

    const medium = config.getConfig('medium');
    expect(medium.min).toBe(1);
    expect(medium.max).toBe(500);
    expect(medium.maxAttempts).toBe(9);

    const hard = config.getConfig('hard');
    expect(hard.min).toBe(1);
    expect(hard.max).toBe(1000);
    expect(hard.maxAttempts).toBe(10);
  });

  it('configures and validates custom ranges successfully', () => {
    config.setCustomConfig(50, 250, 12);
    const custom = config.getConfig('custom');
    expect(custom.min).toBe(50);
    expect(custom.max).toBe(250);
    expect(custom.maxAttempts).toBe(12);
  });

  it('rejects invalid custom ranges (min >= max, negative min, out of bounds)', () => {
    expect(() => config.setCustomConfig(100, 50, 10)).toThrow(
      'Minimum value must be less than maximum value.'
    );
    expect(() => config.setCustomConfig(0, 50, 10)).toThrow('Minimum value must be at least 1.');
    expect(() => config.setCustomConfig(1, 150000, 10)).toThrow(
      'Maximum range cannot exceed 100,000.'
    );
    expect(() => config.setCustomConfig(1, 100, 0)).toThrow('Attempts must be between 1 and 50.');
    expect(() => config.setCustomConfig(1, 100, 55)).toThrow('Attempts must be between 1 and 50.');
  });
});

describe('GameLogic (Secret Generation & Guess Evaluation)', () => {
  it('generates random secret numbers strictly within [min, max] inclusive', () => {
    for (let i = 0; i < 100; i++) {
      const secret = GameLogic.generateSecret(10, 25);
      expect(secret).toBeGreaterThanOrEqual(10);
      expect(secret).toBeLessThanOrEqual(25);
    }
  });

  it('returns DUPLICATE guess result without consuming remaining attempts', () => {
    const result = GameLogic.evaluateGuess(42, 70, 5, [42, 10]);
    expect(result.type).toBe('DUPLICATE');
    expect(result.attemptsLeft).toBe(5);
    expect(result.isWon).toBe(false);
    expect(result.isGameOver).toBe(false);
  });

  it('returns CORRECT when guess matches secret and ends the game', () => {
    const result = GameLogic.evaluateGuess(88, 88, 4, []);
    expect(result.type).toBe('CORRECT');
    expect(result.attemptsLeft).toBe(3);
    expect(result.isWon).toBe(true);
    expect(result.isGameOver).toBe(true);
  });

  it('returns TOO_HIGH when guess exceeds secret', () => {
    const result = GameLogic.evaluateGuess(75, 50, 5, []);
    expect(result.type).toBe('TOO_HIGH');
    expect(result.attemptsLeft).toBe(4);
    expect(result.isWon).toBe(false);
    expect(result.isGameOver).toBe(false);
  });

  it('returns TOO_LOW when guess is below secret', () => {
    const result = GameLogic.evaluateGuess(25, 50, 5, []);
    expect(result.type).toBe('TOO_LOW');
    expect(result.attemptsLeft).toBe(4);
    expect(result.isWon).toBe(false);
    expect(result.isGameOver).toBe(false);
  });

  it('triggers GAME_OVER when the final remaining attempt is exhausted without matching', () => {
    const result = GameLogic.evaluateGuess(30, 50, 1, []);
    expect(result.type).toBe('GAME_OVER');
    expect(result.attemptsLeft).toBe(0);
    expect(result.isWon).toBe(false);
    expect(result.isGameOver).toBe(true);
  });
});

describe('GameStateModel (Match Lifecycle & State Transitions)', () => {
  let config: GameConfigManager;
  let state: GameStateModel;

  beforeEach(() => {
    config = new GameConfigManager();
    state = new GameStateModel(config);
  });

  it('initializes new match with full attempts and empty guess history', () => {
    expect(state.getDifficulty()).toBe('easy');
    expect(state.getRemainingAttempts()).toBe(7);
    expect(state.getMaxAttempts()).toBe(7);
    expect(state.getGuesses()).toEqual([]);
    expect(state.getIsGameOver()).toBe(false);
    expect(state.getHasWon()).toBe(false);
  });

  it('switches difficulty and restarts match with corresponding settings', () => {
    state.setDifficulty('medium');
    expect(state.getDifficulty()).toBe('medium');
    expect(state.getMin()).toBe(1);
    expect(state.getMax()).toBe(500);
    expect(state.getRemainingAttempts()).toBe(9);
  });

  it('validates bounds on guesses', () => {
    expect(() => state.submitGuess(0)).toThrow('Guess must be between 1 and 100.');
    expect(() => state.submitGuess(101)).toThrow('Guess must be between 1 and 100.');
    expect(() => state.submitGuess(12.5)).toThrow('Please enter a valid whole integer.');
  });

  it('tracks guesses and decrements attempts on valid non-duplicate guesses', () => {
    const secret = state.getSecret();
    const wrongGuess = secret === 50 ? 51 : 50;

    const res = state.submitGuess(wrongGuess);
    expect(state.getGuesses()).toContain(wrongGuess);
    expect(state.getRemainingAttempts()).toBe(6);
    expect(res.attemptsLeft).toBe(6);
  });

  it('creates an accurate GameRecord upon match conclusion', () => {
    const secret = state.getSecret();
    state.submitGuess(secret); // Win in 1 try

    expect(state.getIsGameOver()).toBe(true);
    expect(state.getHasWon()).toBe(true);

    const record = state.createGameRecord();
    expect(record.won).toBe(true);
    expect(record.targetNumber).toBe(secret);
    expect(record.attemptsUsed).toBe(1);
    expect(record.guesses).toEqual([secret]);
  });

  it('prevents submitting guesses after match is over', () => {
    const secret = state.getSecret();
    state.submitGuess(secret);
    expect(() => state.submitGuess(secret)).toThrow('Game has already ended');
  });
});

describe('StatisticsManager (Stats Calculation & Storage Resilience)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes clean statistics with zero games', () => {
    const statsManager = new StatisticsManager();
    const stats = statsManager.getStatistics();
    expect(stats.totalGames).toBe(0);
    expect(stats.gamesWon).toBe(0);
    expect(stats.gamesLost).toBe(0);
    expect(stats.bestScore).toBeNull();
    expect(statsManager.getWinPercentage()).toBe(0);
    expect(statsManager.getAverageAttempts()).toBe(0);
  });

  it('records won games, updates win percentage, average tries, and best score', () => {
    const statsManager = new StatisticsManager();

    const record1: GameRecord = {
      id: 'g1',
      difficulty: 'easy',
      targetNumber: 50,
      attemptsUsed: 4,
      maxAttempts: 7,
      won: true,
      timestamp: Date.now(),
      guesses: [10, 60, 45, 50]
    };

    const record2: GameRecord = {
      id: 'g2',
      difficulty: 'easy',
      targetNumber: 20,
      attemptsUsed: 2,
      maxAttempts: 7,
      won: true,
      timestamp: Date.now(),
      guesses: [30, 20]
    };

    statsManager.recordGame(record1);
    statsManager.recordGame(record2);

    const stats = statsManager.getStatistics();
    expect(stats.totalGames).toBe(2);
    expect(stats.gamesWon).toBe(2);
    expect(stats.bestScore).toBe(2); // lowest tries
    expect(statsManager.getWinPercentage()).toBe(100);
    expect(statsManager.getAverageAttempts()).toBe(3); // (4 + 2) / 2 = 3
  });

  it('records lost games accurately', () => {
    const statsManager = new StatisticsManager();
    const lostRecord: GameRecord = {
      id: 'g3',
      difficulty: 'easy',
      targetNumber: 99,
      attemptsUsed: 7,
      maxAttempts: 7,
      won: false,
      timestamp: Date.now(),
      guesses: [1, 2, 3, 4, 5, 6, 7]
    };

    statsManager.recordGame(lostRecord);
    const stats = statsManager.getStatistics();
    expect(stats.totalGames).toBe(1);
    expect(stats.gamesWon).toBe(0);
    expect(stats.gamesLost).toBe(1);
    expect(stats.bestScore).toBeNull();
    expect(statsManager.getWinPercentage()).toBe(0);
  });

  it('handles corrupted or incomplete statistics payload without NaN', () => {
    // Missing gamesWon, gamesLost, totalAttemptsUsed
    localStorage.setItem('ts_game_lifetime_stats', JSON.stringify({ totalGames: 5 }));

    const statsManager = new StatisticsManager();
    expect(statsManager.getWinPercentage()).toBe(0); // 0 / 5 = 0% not NaN
    expect(statsManager.getAverageAttempts()).toBe(0);
    const stats = statsManager.getStatistics();
    expect(stats.gamesWon).toBe(0);
  });

  it('handles malformed JSON in statistics and history storage without crashing', () => {
    localStorage.setItem('ts_game_lifetime_stats', 'malformed-json');
    localStorage.setItem('ts_game_records_history', 'malformed-json');

    const statsManager = new StatisticsManager();
    expect(statsManager.getStatistics().totalGames).toBe(0);
    expect(statsManager.getHistory()).toEqual([]);
  });

  it('clears game history cleanly', () => {
    const statsManager = new StatisticsManager();
    statsManager.recordGame({
      id: 'g4',
      difficulty: 'hard',
      targetNumber: 500,
      attemptsUsed: 3,
      maxAttempts: 10,
      won: true,
      timestamp: Date.now(),
      guesses: [100, 400, 500]
    });

    expect(statsManager.getHistory()).toHaveLength(1);
    statsManager.clearHistory();
    expect(statsManager.getHistory()).toHaveLength(0);
  });
});
