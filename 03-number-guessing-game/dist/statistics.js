import { GameStorage } from './storage.js';
const STATS_KEY = 'ts_game_lifetime_stats';
const HISTORY_KEY = 'ts_game_records_history';
const MAX_HISTORY = 40;
const DEFAULT_STATS = {
    totalGames: 0,
    gamesWon: 0,
    gamesLost: 0,
    bestScore: null,
    totalAttemptsUsed: 0
};
/**
 * Generic filtering helper preserving type information with property constraint.
 */
export function filterRecordsByField(items, key, value) {
    return items.filter((item) => item[key] === value);
}
/**
 * Generic aggregation helper for calculating numeric sums across collections.
 */
export function aggregateNumericField(items, extractor) {
    return items.reduce((sum, item) => sum + extractor(item), 0);
}
/**
 * Type guard for GameRecord objects loaded from storage.
 * Uses `in` operator and `typeof` checks to validate schema without blind casting.
 */
export function isValidGameRecord(item) {
    if (typeof item !== 'object' || item === null)
        return false;
    if ('id' in item &&
        'difficulty' in item &&
        'targetNumber' in item &&
        'attemptsUsed' in item &&
        'maxAttempts' in item &&
        'won' in item &&
        'timestamp' in item &&
        'guesses' in item) {
        const rec = item;
        return (typeof rec.id === 'string' &&
            typeof rec.difficulty === 'string' &&
            typeof rec.targetNumber === 'number' &&
            typeof rec.attemptsUsed === 'number' &&
            typeof rec.maxAttempts === 'number' &&
            typeof rec.won === 'boolean' &&
            typeof rec.timestamp === 'number' &&
            Array.isArray(rec.guesses));
    }
    return false;
}
export class StatisticsManager {
    constructor() {
        this.stats = this.loadStatistics();
        this.history = this.loadHistory();
    }
    /**
     * Safely loads and sanitizes lifetime statistics with schema validation.
     */
    loadStatistics() {
        const raw = GameStorage.getItem(STATS_KEY, DEFAULT_STATS);
        if (typeof raw !== 'object' || raw === null) {
            return Object.assign({}, DEFAULT_STATS);
        }
        const obj = raw;
        const totalGames = typeof obj.totalGames === 'number' && obj.totalGames >= 0 ? obj.totalGames : 0;
        const gamesWon = typeof obj.gamesWon === 'number' && obj.gamesWon >= 0 ? obj.gamesWon : 0;
        const gamesLost = typeof obj.gamesLost === 'number' && obj.gamesLost >= 0 ? obj.gamesLost : 0;
        const totalAttemptsUsed = typeof obj.totalAttemptsUsed === 'number' && obj.totalAttemptsUsed >= 0
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
    loadHistory() {
        const saved = GameStorage.getItem(HISTORY_KEY, [], (val) => Array.isArray(val));
        if (Array.isArray(saved)) {
            return saved.filter(isValidGameRecord);
        }
        return [];
    }
    getStatistics() {
        return Object.assign({}, this.stats);
    }
    getWinPercentage() {
        if (this.stats.totalGames === 0)
            return 0;
        return Math.round((this.stats.gamesWon / this.stats.totalGames) * 100);
    }
    getAverageAttempts() {
        if (this.stats.totalGames === 0)
            return 0;
        return Math.round((this.stats.totalAttemptsUsed / this.stats.totalGames) * 10) / 10;
    }
    getHistory() {
        return [...this.history];
    }
    /**
     * Returns history records filtered by difficulty using generic filter helper.
     */
    getHistoryByDifficulty(diff) {
        return filterRecordsByField(this.history, 'difficulty', diff);
    }
    /**
     * Appends completed game result, updating aggregate stats and history.
     */
    recordGame(record) {
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
        }
        else {
            this.stats.gamesLost += 1;
        }
        this.save();
    }
    clearHistory() {
        this.history = [];
        GameStorage.removeItem(HISTORY_KEY);
    }
    resetStatistics() {
        this.stats = Object.assign({}, DEFAULT_STATS);
        this.clearHistory();
        GameStorage.removeItem(STATS_KEY);
    }
    save() {
        GameStorage.setItem(STATS_KEY, this.stats);
        GameStorage.setItem(HISTORY_KEY, this.history);
    }
}
