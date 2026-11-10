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
 * Validates a single GameRecord loaded from storage.
 */
function isValidRecord(item: unknown): item is GameRecord {
  if (!item || typeof item !== 'object') return false;
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

export class StatisticsManager {
  private stats: LifetimeStatistics;
  private history: GameRecord[];

  constructor() {
    this.stats = this.loadStatistics();
    this.history = this.loadHistory();
  }

  /**
   * Safely loads and sanitizes lifetime statistics to prevent NaN or undefined properties.
   */
  private loadStatistics(): LifetimeStatistics {
    const raw = GameStorage.getItem<unknown>(STATS_KEY, DEFAULT_STATS);
    if (!raw || typeof raw !== 'object') {
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
      return saved.filter(isValidRecord);
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

  public recordGame(record: GameRecord): void {
    // Update lifetime stats
    this.stats.totalGames++;
    this.stats.totalAttemptsUsed += record.attemptsUsed;

    if (record.won) {
      this.stats.gamesWon++;
      if (this.stats.bestScore === null || record.attemptsUsed < this.stats.bestScore) {
        this.stats.bestScore = record.attemptsUsed;
      }
    } else {
      this.stats.gamesLost++;
    }

    // Persist stats
    GameStorage.setItem(STATS_KEY, this.stats);

    // Persist history capped to MAX_HISTORY
    this.history.unshift(record);
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(0, MAX_HISTORY);
    }
    GameStorage.setItem(HISTORY_KEY, this.history);
  }

  public clearHistory(): void {
    this.history = [];
    GameStorage.removeItem(HISTORY_KEY);
  }

  public resetAll(): void {
    this.stats = { ...DEFAULT_STATS };
    this.history = [];
    GameStorage.removeItem(STATS_KEY);
    GameStorage.removeItem(HISTORY_KEY);
  }
}
