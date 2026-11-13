import { GameRecord, LifetimeStatistics } from './types.js';
import { GameStorage } from './storage.js';

const STATS_KEY = 'ts_game_lifetime_stats';
const HISTORY_KEY = 'ts_game_records_history';
const MAX_HISTORY = 40;

const DEFAULT_STATS: LifetimeStatistics = {
  totalGames: 0,
  gamesWon: 0,
  gamesLost: 0,
  bestScore: null,
  totalAttemptsUsed: 0
};

/**
 * Generic filtering helper preserving type information with property constraint.
 */
export function filterRecordsByField<T, K extends keyof T>(items: T[], key: K, value: T[K]): T[] {
  return items.filter((item) => item[key] === value);
}

/**
 * Generic aggregation helper for calculating numeric sums across collections.
 */
export function aggregateNumericField<T>(items: T[], extractor: (item: T) => number): number {
  return items.reduce((sum, item) => sum + extractor(item), 0);
}

/**
 * Type guard for GameRecord objects loaded from storage.
 * Uses `in` operator and `typeof` checks to validate schema without blind casting.
 */
export function isValidGameRecord(item: unknown): item is GameRecord {
  if (typeof item !== 'object' || item === null) return false;

  if (
    'id' in item &&
    'difficulty' in item &&
    'targetNumber' in item &&
    'attemptsUsed' in item &&
    'maxAttempts' in item &&
    'won' in item &&
    'timestamp' in item &&
    'guesses' in item
  ) {
    const rec = item as Record<string, unknown>;
    return (
      typeof rec.id === 'string' &&
      typeof rec.difficulty === 'string' &&
      typeof rec.targetNumber === 'number' &&
      typeof rec.attemptsUsed === 'number' &&
      typeof rec.maxAttempts === 'number' &&
      typeof rec.won === 'boolean' &&
      typeof rec.timestamp === 'number' &&
      Array.isArray(rec.guesses)
    );
  }

  return false;
}

export class StatisticsManager {
  private stats: LifetimeStatistics;
  private history: GameRecord[];

  constructor() {
    this.stats = this.loadStatistics();
    this.history = this.loadHistory();
  }

  /**
   * Safely loads and sanitizes lifetime statistics with schema validation.
   */
  private loadStatistics(): LifetimeStatistics {
    const raw = GameStorage.getItem<unknown>(STATS_KEY, DEFAULT_STATS);
    if (typeof raw !== 'object' || raw === null) {
      return { ...DEFAULT_STATS };
    }

    const obj = raw as Record<string, unknown>;
    const totalGames =
      typeof obj.totalGames === 'number' && obj.totalGames >= 0 ? obj.totalGames : 0;
    const gamesWon = typeof obj.gamesWon === 'number' && obj.gamesWon >= 0 ? obj.gamesWon : 0;
    const gamesLost = typeof obj.gamesLost === 'number' && obj.gamesLost >= 0 ? obj.gamesLost : 0;
    const totalAttemptsUsed =
      typeof obj.totalAttemptsUsed === 'number' && obj.totalAttemptsUsed >= 0
        ? obj.totalAttemptsUsed
        : 0;

    const bestScore = typeof obj.bestScore === 'number' && obj.bestScore > 0 ? obj.bestScore : null;

    return {
      totalGames,
      gamesWon,
      gamesLost,
      bestScore,
      totalAttemptsUsed
    };
  }

  private loadHistory(): GameRecord[] {
    const saved = GameStorage.getItem<unknown>(HISTORY_KEY, [], (val: unknown): val is unknown[] =>
      Array.isArray(val)
    );

    if (Array.isArray(saved)) {
      return saved.filter(isValidGameRecord);
    }
    return [];
  }

  public getStatistics(): Readonly<LifetimeStatistics> {
    return { ...this.stats };
  }

  public getWinPercentage(): number {
    if (this.stats.totalGames === 0) return 0;
    return Math.round((this.stats.gamesWon / this.stats.totalGames) * 100);
  }

  public getAverageAttempts(): number {
    if (this.stats.totalGames === 0) return 0;
    return Math.round((this.stats.totalAttemptsUsed / this.stats.totalGames) * 10) / 10;
  }

  public getHistory(): GameRecord[] {
    return [...this.history];
  }

  /**
   * Returns history records filtered by difficulty using generic filter helper.
   */
  public getHistoryByDifficulty(diff: GameRecord['difficulty']): GameRecord[] {
    return filterRecordsByField(this.history, 'difficulty', diff);
  }

  /**
   * Appends completed game result, updating aggregate stats and history.
   */
  public recordGame(record: GameRecord): void {
    this.history.unshift(record);
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(0, MAX_HISTORY);
    }

    this.stats.totalGames += 1;
    this.stats.totalAttemptsUsed += record.attemptsUsed;

    if (record.won) {
      this.stats.gamesWon += 1;
      if (this.stats.bestScore === null || record.attemptsUsed < this.stats.bestScore) {
        this.stats.bestScore = record.attemptsUsed;
      }
    } else {
      this.stats.gamesLost += 1;
    }

    this.save();
  }

  public clearHistory(): void {
    this.history = [];
    GameStorage.removeItem(HISTORY_KEY);
  }

  public resetStatistics(): void {
    this.stats = { ...DEFAULT_STATS };
    this.clearHistory();
    GameStorage.removeItem(STATS_KEY);
  }

  private save(): void {
    GameStorage.setItem(STATS_KEY, this.stats);
    GameStorage.setItem(HISTORY_KEY, this.history);
  }
}
