import { GameRecord, LifetimeStatistics } from './types.js';
import { GameStorage } from './storage.js';

const STATS_KEY = 'ts_game_lifetime_stats';
const HISTORY_KEY = 'ts_game_records_history';
const MAX_HISTORY = 40;

export class StatisticsManager {
  private stats: LifetimeStatistics;
  private history: GameRecord[];

  constructor() {
    this.stats = GameStorage.getItem<LifetimeStatistics>(STATS_KEY, {
      totalGames: 0,
      gamesWon: 0,
      gamesLost: 0,
      bestScore: null,
      totalAttemptsUsed: 0
    });

    const savedHistory = GameStorage.getItem<GameRecord[]>(HISTORY_KEY, []);
    this.history = Array.isArray(savedHistory) ? savedHistory : [];
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

    // Save stats
    GameStorage.setItem(STATS_KEY, this.stats);

    // Save history
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
}

