import { describe, it, expect, beforeEach } from 'vitest';
import { GameLogic, assertNever } from '../src/game-logic.js';
import { GameConfigManager } from '../src/game-config.js';
import { GameStateModel } from '../src/game-state.js';
import {
  StatisticsManager,
  filterRecordsByField,
  aggregateNumericField,
  isValidGameRecord
} from '../src/statistics.js';
import { GameStorage } from '../src/storage.js';
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

  it('returns DUPLICATE guess outcome without consuming remaining attempts', () => {
    const result = GameLogic.evaluateGuess(42, 70, 5, [42, 10]);
    expect(result.status).toBe('duplicate');
    expect(result.type).toBe('DUPLICATE');
    expect(result.attemptsLeft).toBe(5);
    expect(result.isWon).toBe(false);
    expect(result.isGameOver).toBe(false);
  });

  it('returns CORRECT when guess matches secret and ends the game', () => {
    const result = GameLogic.evaluateGuess(88, 88, 4, []);
    expect(result.status).toBe('won');
    expect(result.type).toBe('CORRECT');
    expect(result.attemptsLeft).toBe(3);
    expect(result.isWon).toBe(true);
    expect(result.isGameOver).toBe(true);
  });

  it('evaluates TOO_HIGH and TOO_LOW hints accurately with discriminated union status', () => {
    const high = GameLogic.evaluateGuess(75, 50, 4, []);
    expect(high.status).toBe('in-progress');
    expect(high.type).toBe('TOO_HIGH');
    if (high.status === 'in-progress') {
      expect(high.hint).toBe('too-high');
    }
    expect(high.attemptsLeft).toBe(3);

    const low = GameLogic.evaluateGuess(25, 50, 4, []);
    expect(low.status).toBe('in-progress');
    expect(low.type).toBe('TOO_LOW');
    if (low.status === 'in-progress') {
      expect(low.hint).toBe('too-low');
    }
    expect(low.attemptsLeft).toBe(3);
  });

  it('triggers GAME_OVER with status: lost when remaining attempts reach zero', () => {
    const over = GameLogic.evaluateGuess(30, 99, 1, []);
    expect(over.status).toBe('lost');
    expect(over.type).toBe('GAME_OVER');
    expect(over.attemptsLeft).toBe(0);
    expect(over.isWon).toBe(false);
    expect(over.isGameOver).toBe(true);
  });

  it('assertNever throws a descriptive runtime error on unexpected value', () => {
    expect(() => assertNever('invalid' as unknown as never)).toThrow(
      'Unexpected value encountered: invalid'
    );
  });
});

describe('GameStateModel (State Machine & Input Validation)', () => {
  let model: GameStateModel;
  let config: GameConfigManager;

  beforeEach(() => {
    config = new GameConfigManager();
    model = new GameStateModel(config);
  });

  it('initializes game state with appropriate boundaries for easy difficulty', () => {
    expect(model.getDifficulty()).toBe('easy');
    expect(model.getMin()).toBe(1);
    expect(model.getMax()).toBe(100);
    expect(model.getMaxAttempts()).toBe(7);
    expect(model.getRemainingAttempts()).toBe(7);
    expect(model.getIsGameOver()).toBe(false);
    expect(model.getHasWon()).toBe(false);
  });

  it('tracks game play state transitions via getPlayState()', () => {
    const initial = model.getPlayState();
    expect(initial.phase).toBe('ready');

    model.submitGuess(50);
    const playing = model.getPlayState();
    expect(playing.phase === 'playing' || playing.phase === 'won').toBe(true);
  });

  it('switches difficulty and restarts game cleanly', () => {
    model.setDifficulty('hard');
    expect(model.getDifficulty()).toBe('hard');
    expect(model.getMax()).toBe(1000);
    expect(model.getMaxAttempts()).toBe(10);
  });

  it('rejects guesses that violate numerical constraints or ranges', () => {
    expect(() => model.submitGuess(0)).toThrow('Guess must be between 1 and 100.');
    expect(() => model.submitGuess(101)).toThrow('Guess must be between 1 and 100.');
    expect(() => model.submitGuess(45.5)).toThrow('Please enter a valid whole integer.');
  });

  it('locks submission when game is over and creates accurate GameRecord', () => {
    const secret = model.getSecret();
    const result = model.submitGuess(secret);
    expect(result.status).toBe('won');
    expect(model.getIsGameOver()).toBe(true);
    expect(model.getHasWon()).toBe(true);

    expect(() => model.submitGuess(secret)).toThrow(
      'Game has already ended. Please start a new game.'
    );

    const record = model.createGameRecord();
    expect(record.won).toBe(true);
    expect(record.targetNumber).toBe(secret);
    expect(record.attemptsUsed).toBe(1);
  });
});

describe('StatisticsManager (Stats Calculation, Generics & Storage Resilience)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records games and tracks best score and win percentages accurately', () => {
    const manager = new StatisticsManager();
    const recordWon: GameRecord = {
      id: 'rec-1',
      difficulty: 'easy',
      targetNumber: 50,
      attemptsUsed: 3,
      maxAttempts: 7,
      won: true,
      timestamp: Date.now(),
      guesses: [20, 40, 50]
    };

    const recordLost: GameRecord = {
      id: 'rec-2',
      difficulty: 'easy',
      targetNumber: 80,
      attemptsUsed: 7,
      maxAttempts: 7,
      won: false,
      timestamp: Date.now(),
      guesses: [10, 20, 30, 40, 50, 60, 70]
    };

    manager.recordGame(recordWon);
    manager.recordGame(recordLost);

    const stats = manager.getStatistics();
    expect(stats.totalGames).toBe(2);
    expect(stats.gamesWon).toBe(1);
    expect(stats.gamesLost).toBe(1);
    expect(stats.bestScore).toBe(3);
    expect(manager.getWinPercentage()).toBe(50);
  });

  it('filters game records using generic helper filterRecordsByField', () => {
    const records: GameRecord[] = [
      {
        id: '1',
        difficulty: 'easy',
        targetNumber: 10,
        attemptsUsed: 2,
        maxAttempts: 7,
        won: true,
        timestamp: 1,
        guesses: [5, 10]
      },
      {
        id: '2',
        difficulty: 'hard',
        targetNumber: 500,
        attemptsUsed: 8,
        maxAttempts: 10,
        won: true,
        timestamp: 2,
        guesses: [100, 500]
      }
    ];

    const easyOnly = filterRecordsByField(records, 'difficulty', 'easy');
    expect(easyOnly).toHaveLength(1);
    expect(easyOnly[0].id).toBe('1');
  });

  it('aggregates numeric values across game records using generic aggregateNumericField', () => {
    const records = [{ attempts: 3 }, { attempts: 5 }, { attempts: 2 }];
    const total = aggregateNumericField(records, (r) => r.attempts);
    expect(total).toBe(10);
  });

  it('validates game records safely with isValidGameRecord type guard', () => {
    const valid = {
      id: '1',
      difficulty: 'easy',
      targetNumber: 42,
      attemptsUsed: 4,
      maxAttempts: 7,
      won: true,
      timestamp: 12345,
      guesses: [10, 20, 30, 42]
    };
    expect(isValidGameRecord(valid)).toBe(true);

    const invalid = { id: 1, won: 'yes' };
    expect(isValidGameRecord(invalid)).toBe(false);
  });

  it('handles malformed JSON in statistics and history storage without crashing', () => {
    localStorage.setItem('ts_game_lifetime_stats', 'malformed-json');
    localStorage.setItem('ts_game_records_history', 'malformed-json');

    const manager = new StatisticsManager();
    expect(manager.getStatistics().totalGames).toBe(0);
    expect(manager.getHistory()).toEqual([]);
  });

  it('GameStorage clears and persists items safely', () => {
    GameStorage.setItem('test_key', { score: 99 });
    const loaded = GameStorage.getItem<{ score: number }>('test_key', { score: 0 });
    expect(loaded.score).toBe(99);

    GameStorage.removeItem('test_key');
    expect(GameStorage.getItem('test_key', null)).toBeNull();
  });
});
